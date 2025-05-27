import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import linkedinAuthService from '../services/linkedinAuthService';
import { Linking } from 'react-native';

interface LinkedInAuthProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  buttonText?: string;
}

const LinkedInAuth: React.FC<LinkedInAuthProps> = ({
  onSuccess,
  onError,
  buttonText = "LinkedIn ile Giriş Yap"
}) => {
  const handleLinkedInLogin = async () => {
    try {
      const authURL = linkedinAuthService.getLinkedInAuthURL();
      await Linking.openURL(authURL);
    } catch (error) {
      console.error('LinkedIn kimlik doğrulama hatası:', error);
      if (onError) onError(error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleLinkedInLogin}
      style={styles.button}
    >
      <Icon name="logo-linkedin" size={24} color="#fff" />
      <Text style={styles.buttonText}>{buttonText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0077B5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LinkedInAuth; 