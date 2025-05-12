import React, {useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useProfile} from '../components/ProfileContext';
import {Colors} from '../constants/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import metrics from '../constants/aikuMetric';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '../contexts/AuthContext';
import CountryPicker, {Country, CountryCode} from 'react-native-country-picker-modal';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateProfile'>;

const UpdateProfileScreen = ({navigation}: Props) => {
  const {profile, setProfile} = useProfile();
  const [form, setForm] = useState(profile);
  const {user} = useAuth();
  const [countryCode, setCountryCode] = useState<CountryCode>('TR');
  const [country, setCountry] = useState<Country | null>(null);
  const [withCountryNameButton] = useState<boolean>(false);
  const [withFlag] = useState<boolean>(true);
  const [withEmoji] = useState<boolean>(true);
  const [withFilter] = useState<boolean>(true);
  const [withAlphaFilter] = useState<boolean>(false);
  const [withCallingCode] = useState<boolean>(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountry(country);
    const phoneWithoutCode = form.phone?.replace(/^\+\d+\s*/, '') || '';
    handleChange('phone', `+${country.callingCode[0]} ${phoneWithoutCode}`);
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSocialChange = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields (First Name, Last Name, Email)',
        [{text: 'OK'}],
      );
      return;
    }

    try {
      setProfile(form);
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.', [
        {text: 'OK'},
      ]);
    }
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.lightText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Icon name="check" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{uri: user.photoURL}} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={['#2A2D3E', '#424867']}
                style={styles.avatarPlaceholder}>
                <Icon
                  name="person"
                  size={metrics.scale(32)}
                  color={Colors.lightText}
                />
              </LinearGradient>
            )}
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={() => Alert.alert('Coming Soon', 'Photo upload feature will be available soon!')}>
              <Icon name="edit" size={16} color={Colors.background} />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Tap to change profile photo</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                value={form.firstName}
                onChangeText={text => handleChange('firstName', text)}
                style={styles.input}
                mode="outlined"
                outlineColor="rgba(255,255,255,0.1)"
                activeOutlineColor={Colors.primary}
                placeholder="Enter your first name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                theme={{
                  colors: {
                    text: Colors.lightText,
                    placeholder: 'rgba(255,255,255,0.5)',
                    background: Colors.background,
                  },
                }}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                value={form.lastName}
                onChangeText={text => handleChange('lastName', text)}
                style={styles.input}
                mode="outlined"
                outlineColor="rgba(255,255,255,0.1)"
                activeOutlineColor={Colors.primary}
                placeholder="Enter your last name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                theme={{
                  colors: {
                    text: Colors.lightText,
                    placeholder: 'rgba(255,255,255,0.5)',
                    background: Colors.background,
                  },
                }}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={text => handleChange('email', text)}
                style={styles.input}
                mode="outlined"
                outlineColor="rgba(255,255,255,0.1)"
                activeOutlineColor={Colors.primary}
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                theme={{
                  colors: {
                    text: Colors.lightText,
                    placeholder: 'rgba(255,255,255,0.5)',
                    background: Colors.background,
                  },
                }}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity
                  style={styles.countryPickerButton}
                  onPress={() => setShowCountryPicker(true)}>
                  <CountryPicker
                    {...{
                      countryCode,
                      withFilter,
                      withFlag,
                      withCountryNameButton,
                      withAlphaFilter,
                      withCallingCode,
                      withEmoji,
                      onSelect,
                    }}
                    visible={showCountryPicker}
                    onClose={() => setShowCountryPicker(false)}
                  />
                  <Icon name="arrow-drop-down" size={24} color={Colors.lightText} />
                </TouchableOpacity>
                <TextInput
                  value={form.phone?.replace(/^\+\d+\s*/, '')}
                  onChangeText={text => {
                    const callingCode = country?.callingCode[0] || '90';
                    handleChange('phone', `+${callingCode} ${text}`);
                  }}
                  style={[styles.input, styles.phoneInput]}
                  mode="outlined"
                  outlineColor="rgba(255,255,255,0.1)"
                  activeOutlineColor={Colors.primary}
                  keyboardType="phone-pad"
                  placeholder="Enter your phone number"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  theme={{
                    colors: {
                      text: Colors.lightText,
                      placeholder: 'rgba(255,255,255,0.5)',
                      background: Colors.background,
                    },
                  }}
                />
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                value={form.title}
                onChangeText={text => handleChange('title', text)}
                style={styles.input}
                mode="outlined"
                outlineColor="rgba(255,255,255,0.1)"
                activeOutlineColor={Colors.primary}
                placeholder="Enter your title"
                placeholderTextColor="rgba(255,255,255,0.5)"
                theme={{
                  colors: {
                    text: Colors.lightText,
                    placeholder: 'rgba(255,255,255,0.5)',
                    background: Colors.background,
                  },
                }}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                value={form.location}
                onChangeText={text => handleChange('location', text)}
                style={styles.input}
                mode="outlined"
                outlineColor="rgba(255,255,255,0.1)"
                activeOutlineColor={Colors.primary}
                placeholder="Enter your location"
                placeholderTextColor="rgba(255,255,255,0.5)"
                theme={{
                  colors: {
                    text: Colors.lightText,
                    placeholder: 'rgba(255,255,255,0.5)',
                    background: Colors.background,
                  },
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>About Me</Text>
              <TextInput
                value={form.profileInfo}
                onChangeText={text => handleChange('profileInfo', text)}
                style={[styles.input, styles.multilineInput]}
                mode="outlined"
                outlineColor="rgba(255,255,255,0.1)"
                activeOutlineColor={Colors.primary}
                multiline
                numberOfLines={4}
                placeholder="Tell us about yourself"
                placeholderTextColor="rgba(255,255,255,0.5)"
                theme={{
                  colors: {
                    text: Colors.lightText,
                    placeholder: 'rgba(255,255,255,0.5)',
                    background: Colors.background,
                  },
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>LinkedIn</Text>
              <TextInput
                value={form.social.linkedin}
                onChangeText={text => handleSocialChange('linkedin', text)}
                style={styles.input}
                mode="outlined"
                outlineColor="rgba(255,255,255,0.1)"
                activeOutlineColor={Colors.primary}
                placeholder="Enter your LinkedIn profile URL"
                placeholderTextColor="rgba(255,255,255,0.5)"
                theme={{
                  colors: {
                    text: Colors.lightText,
                    placeholder: 'rgba(255,255,255,0.5)',
                    background: Colors.background,
                  },
                }}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Instagram</Text>
              <TextInput
                value={form.social.instagram}
                onChangeText={text => handleSocialChange('instagram', text)}
                style={styles.input}
                mode="outlined"
                outlineColor="rgba(255,255,255,0.1)"
                activeOutlineColor={Colors.primary}
                placeholder="Enter your Instagram profile URL"
                placeholderTextColor="rgba(255,255,255,0.5)"
                theme={{
                  colors: {
                    text: Colors.lightText,
                    placeholder: 'rgba(255,255,255,0.5)',
                    background: Colors.background,
                  },
                }}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Facebook</Text>
              <TextInput
                value={form.social.facebook}
                onChangeText={text => handleSocialChange('facebook', text)}
                style={styles.input}
                mode="outlined"
                outlineColor="rgba(255,255,255,0.1)"
                activeOutlineColor={Colors.primary}
                placeholder="Enter your Facebook profile URL"
                placeholderTextColor="rgba(255,255,255,0.5)"
                theme={{
                  colors: {
                    text: Colors.lightText,
                    placeholder: 'rgba(255,255,255,0.5)',
                    background: Colors.background,
                  },
                }}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Twitter/X</Text>
              <TextInput
                value={form.social.twitter}
                onChangeText={text => handleSocialChange('twitter', text)}
                style={styles.input}
                mode="outlined"
                outlineColor="rgba(255,255,255,0.1)"
                activeOutlineColor={Colors.primary}
                placeholder="Enter your Twitter/X profile URL"
                placeholderTextColor="rgba(255,255,255,0.5)"
                theme={{
                  colors: {
                    text: Colors.lightText,
                    placeholder: 'rgba(255,255,255,0.5)',
                    background: Colors.background,
                  },
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.padding.lg,
    paddingTop: metrics.padding.xxl * 2,
    paddingBottom: metrics.padding.lg,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl,
    color: Colors.lightText,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: metrics.padding.lg,
    paddingBottom: metrics.padding.xl,
  },
  sectionContainer: {
    marginBottom: metrics.margin.xl,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.lg,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: metrics.margin.md,
    marginLeft: metrics.margin.xs,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: metrics.margin.xl,
    marginTop: metrics.margin.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: metrics.margin.sm,
  },
  avatar: {
    width: metrics.scale(100),
    height: metrics.scale(100),
    borderRadius: metrics.scale(50),
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: metrics.scale(100),
    height: metrics.scale(100),
    borderRadius: metrics.scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: metrics.scale(32),
    height: metrics.scale(32),
    borderRadius: metrics.scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  avatarHint: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    opacity: 0.7,
  },
  inputGroup: {
    gap: metrics.margin.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: metrics.padding.lg,
    borderRadius: metrics.borderRadius.xl,
  },
  inputWrapper: {
    gap: metrics.margin.xs,
  },
  inputLabel: {
    fontSize: metrics.fontSize.sm,
    color: Colors.lightText,
    opacity: 0.7,
    marginLeft: metrics.margin.xs,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    fontSize: metrics.fontSize.md,
    height: metrics.scale(48),
    borderRadius: metrics.borderRadius.lg,
  },
  multilineInput: {
    height: metrics.scale(120),
    textAlignVertical: 'top',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.margin.xs,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: metrics.borderRadius.lg,
    paddingHorizontal: metrics.padding.sm,
    height: metrics.scale(48),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  phoneInput: {
    flex: 1,
  },
});

export default UpdateProfileScreen;