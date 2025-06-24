import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../constants/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import metrics from '../constants/aikuMetric';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '../contexts/AuthContext';
import CountryPicker, {Country, CountryCode} from 'react-native-country-picker-modal';
import {useProfileStore} from '../store/profileStore';
import ImageCropPicker from 'react-native-image-crop-picker';
import axios from 'axios';
import {storage} from '../storage/mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateProfile'>;

const UpdateProfileScreen = ({navigation}: Props) => {
  const {profile, updateProfile, updateProfilePhoto} = useProfileStore();
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
  const [avatarUri, setAvatarUri] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Profil ve kullanıcı verisi yüklendiğinde avatar URI'ını ayarla
    const initialPhotoURL = profile.photoURL || user?.photoURL || '';
    if (initialPhotoURL && !initialPhotoURL.startsWith('file://')) {
        // Eğer URL tam değilse, base URL ekle (backend kodundan anlaşıldığı üzere)
        const baseUrl = 'https://api.aikuaiplatform.com';
        setAvatarUri(initialPhotoURL.startsWith('http') ? initialPhotoURL : `${baseUrl}${initialPhotoURL}`);
    } else {
        setAvatarUri(initialPhotoURL);
    }
  }, [profile.photoURL, user?.photoURL]);

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountry(country);
    const phoneWithoutCode = form.phone?.replace(/^\\+\\d+\\s*/, '') || '';
    handleChange('phone', `+${country.callingCode[0]} ${phoneWithoutCode}`);
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    console.log("DEBUG: handleSave fonksiyonu başlatıldı.");

    if (!form.firstName || !form.lastName || !form.email) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields (First Name, Last Name, Email)',
        [{text: 'OK'}],
      );
      return;
    }
    
    setIsSaving(true);
    console.log("DEBUG: setIsSaving(true) çalıştı.");

    let token: string | null | undefined = storage.getString('auth_token');
    if (!token) {
      token = await AsyncStorage.getItem('token');
    }
    console.log(`DEBUG: Token bulundu: ${token ? 'Evet' : 'Hayır'}`);

    if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        setIsSaving(false);
        return;
    }

    try {
        console.log("DEBUG: try bloğuna girildi.");
        
        let photoPathForUpdate = profile.photoURL; 
        let photoUrlForDisplay = profile.photoURL;

        if (avatarUri && avatarUri.startsWith('file://')) {
            console.log(`DEBUG: Fotoğraf yükleme bloğuna girildi. Avatar URI: ${avatarUri}`);
            const formData = new FormData();
            formData.append('photo', {
                uri: avatarUri,
                type: 'image/jpeg',
                name: 'profile.jpg',
            });

            console.log("DEBUG: Fotoğraf yükleme isteği gönderiliyor...");
            const photoResponse = await axios.post('https://api.aikuaiplatform.com/api/upload/profile-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            console.log("DEBUG: Fotoğraf yükleme cevabı:", JSON.stringify(photoResponse.data, null, 2));

            if (photoResponse.data?.success && photoResponse.data.data?.url) {
                const relativePath = photoResponse.data.data.url;
                photoPathForUpdate = relativePath;
                photoUrlForDisplay = relativePath.startsWith('/') ? `https://api.aikuaiplatform.com${relativePath}` : relativePath;
                console.log("DEBUG: Backend'e gönderilecek göreceli yol:", photoPathForUpdate);
                console.log("DEBUG: Mobilde gösterilecek tam URL:", photoUrlForDisplay);

            } else {
                 console.error("DEBUG: Fotoğraf yükleme başarısız veya URL bulunamadı.");
                 throw new Error('Photo upload failed or URL not found in response.');
            }
        }
        
        // 2. Metin verilerini güncelle
        const profileDataToUpdate = { ...form, photoURL: photoPathForUpdate, profilePhoto: photoPathForUpdate };
        console.log("DEBUG: Profil güncelleme isteği gönderiliyor, data:", JSON.stringify(profileDataToUpdate, null, 2));

        const response = await axios.put('https://api.aikuaiplatform.com/api/auth/updateUser', profileDataToUpdate, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log("DEBUG: Profil güncelleme cevabı alındı:", JSON.stringify(response.data, null, 2));

        if (response.data?.success) {
            const updatedUser = {
                ...response.data.user,
                photoURL: photoUrlForDisplay,
                profilePhoto: photoUrlForDisplay, 
            };
            updateProfile(updatedUser);
            Alert.alert('Success', 'Profile updated successfully', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } else {
             console.error("DEBUG: Profil güncelleme başarısız.");
             throw new Error(response.data.message || 'Failed to update profile.');
        }

    } catch (error) {
        console.error("DEBUG: catch bloğuna düşüldü.");
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // @ts-ignore
        const serverError = error.response?.data?.message;
        console.error("Update profile error:", serverError || errorMessage);
        Alert.alert('Error', serverError || 'Failed to update profile. Please try again.', [
            {text: 'OK'},
        ]);
    } finally {
        console.log("DEBUG: finally bloğuna girildi.");
        setIsSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });
      if (image && image.path) {
        setAvatarUri(image.path);
        // anlık olarak photoURL'i de güncelleyelim ki save'e basınca gitsin
        updateProfilePhoto(image.path)
      }
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        // @ts-ignore
        if ((error as any).code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', 'Photo selection failed.');
        }
      } else {
        Alert.alert('Error', 'Photo selection failed.');
      }
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
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSaving}>
          <Icon name="arrow-back" size={24} color={Colors.lightText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            {isSaving ? (
                <ActivityIndicator color={Colors.primary} />
            ) : (
                <Icon name="check" size={24} color={Colors.primary} />
            )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{uri: avatarUri}} style={styles.avatar} />
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
              onPress={handlePickAvatar}
              disabled={isSaving}
              >
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
    paddingTop: metrics.padding.lg,
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