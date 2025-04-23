import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useProfile } from '../components/ProfileContext';
import { Colors } from '../constants/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  UpdateProfile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateProfile'>;

const UpdateProfileScreen = ({ navigation }: Props) => {
  const { profile, setProfile } = useProfile();

  const [form, setForm] = useState(profile);

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
    // Validate required fields
    if (!form.firstName || !form.lastName || !form.email) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields (First Name, Last Name, Email)',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Update the profile in context
      setProfile(form);
      
      // Show success message
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Personal Information
        </Text>
        <TextInput
          label="First Name"
          value={form.firstName}
          onChangeText={text => handleChange('firstName', text)}
          style={styles.input}
        />
        <TextInput
          label="Last Name"
          value={form.lastName}
          onChangeText={text => handleChange('lastName', text)}
          style={styles.input}
        />
        <TextInput
          label="Email"
          value={form.email}
          onChangeText={text => handleChange('email', text)}
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          label="Phone Number"
          value={form.phone}
          onChangeText={text => handleChange('phone', text)}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TextInput
          label="Title"
          value={form.title}
          onChangeText={text => handleChange('title', text)}
          style={styles.input}
        />
        <TextInput
          label="Location"
          value={form.location}
          onChangeText={text => handleChange('location', text)}
          style={styles.input}
        />
      </Surface>

      <Surface style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Profile Information
        </Text>
        <TextInput
          label="Tell us about yourself"
          value={form.profileInfo}
          onChangeText={text => handleChange('profileInfo', text)}
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100 }]}
        />
      </Surface>

      <Surface style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Social Media
        </Text>
        <TextInput
          label="LinkedIn"
          value={form.social.linkedin}
          onChangeText={text => handleSocialChange('linkedin', text)}
          style={styles.input}
        />
        <TextInput
          label="Instagram"
          value={form.social.instagram}
          onChangeText={text => handleSocialChange('instagram', text)}
          style={styles.input}
        />
        <TextInput
          label="Facebook"
          value={form.social.facebook}
          onChangeText={text => handleSocialChange('facebook', text)}
          style={styles.input}
        />
        <TextInput
          label="Twitter/X"
          value={form.social.twitter}
          onChangeText={text => handleSocialChange('twitter', text)}
          style={styles.input}
        />
      </Surface>

      <Button 
        mode="contained" 
        onPress={handleSave} 
        style={styles.saveButton}
        loading={false} // You can add loading state if needed
      >
        Save Changes
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1A1E29',
  },
  section: {
    backgroundColor: '#2C2F3E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.primary,
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#3A3D4D',
  },
  saveButton: {
    marginBottom: 40,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
  },
});

export default UpdateProfileScreen;
