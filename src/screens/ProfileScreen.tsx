import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useProfile } from '../components/ProfileContext';
import { Colors } from '../constants/colors';
import { ProfileScreenProps } from '../types';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { profile } = useProfile();

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F7', '#3B82F7']}
      locations={[0.1, 0.2, 0.2, 0.5]}
      start={{ x: 0, y: 0 }}
      end={{ x: 3.5, y: 0.8 }}
      style={styles.gradientBackground}
    >
      <StatusBar backgroundColor="#1A1E29" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text variant="headlineMedium" style={styles.title}>
            Aiku
          </Text>
          <IconButton
            icon="menu"
            mode="contained"
            containerColor={Colors.primary}
            iconColor={Colors.lightText}
            size={30}
            onPress={() => navigation.toggleDrawer?.()}
            style={styles.menuButton}
          />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Profile Card */}
          <LinearGradient colors={['#fff', '#4966A6']} style={styles.profileCard}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../assets/images/Alohaicon.png')}
                style={styles.image}
              />
            </View>
            <Text style={styles.welcome}>Welcome, {profile.firstName} 👋</Text>
            <Text style={styles.subtitle}>{profile.title || 'Your Title'}</Text>
            <Text style={styles.email}>{profile.email}</Text>

            <Button
              mode="outlined"
              onPress={() =>
                navigation.navigate('UpdateProfile', { presentation: 'modal' })
              }
              style={styles.editButton}
              textColor={Colors.lightText}
            >
              Edit Profile
            </Button>
          </LinearGradient>

          {/* Info Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <LinearGradient colors={['#fff', '#4966A6']} style={styles.infoCard}>
              <Text style={styles.cardTitle}>Personal Details</Text>
              <Text>First Name: {profile.firstName}</Text>
              <Text>Last Name: {profile.lastName}</Text>
              <Text>Phone: {profile.phone}</Text>
              <Text>Location: {profile.location}</Text>
            </LinearGradient>

            <LinearGradient colors={['#fff', '#4966A6']} style={styles.infoCard}>
              <Text style={styles.cardTitle}>Profile Information</Text>
              <Text>{profile.profileInfo || 'No profile info yet.'}</Text>
            </LinearGradient>

            <LinearGradient colors={['#fff', '#4966A6']} style={styles.infoCard}>
              <Text style={styles.cardTitle}>Social Media</Text>
              <Text>LinkedIn: {profile.social.linkedin}</Text>
              <Text>Instagram: {profile.social.instagram}</Text>
              <Text>Facebook: {profile.social.facebook}</Text>
              <Text>Twitter/X: {profile.social.twitter}</Text>
            </LinearGradient>
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontWeight: '700',
    color: Colors.lightText,
  },
  menuButton: {
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.darkText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: Colors.lightText,
    marginBottom: 4,
  },
  email: {
    color: Colors.lightText,
    marginBottom: 12,
  },
  editButton: {
    borderColor: Colors.lightText,
    marginTop: 8,
  },
  horizontalScroll: {
    marginTop: 8,
  },
  infoCard: {
    height: 250,
    width: 300,
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
    marginTop: 25,
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#1A1E29',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
});

export default ProfileScreen;
