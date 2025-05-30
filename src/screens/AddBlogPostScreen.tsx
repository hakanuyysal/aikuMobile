import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../constants/colors';
import Nophoto from '../assets/images/Nophoto.png';
import { blogService } from '../services/blogService';

type RootStackParamList = {
  HomeScreen: undefined;
  AddBlogPostScreen: undefined;
  // ...diğer ekranlar...
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddBlogPostScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [title, setTitle] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [coverFile, setCoverFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) {
          // Kullanıcı iptal etti
        } else if (response.errorCode) {
          Alert.alert('Error', `Failed to select image: ${response.errorMessage}`);
        } else if (response.assets && response.assets[0]) {
          setCoverFile(response.assets[0]);
        }
      }
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !fullContent.trim()) {
      setError('Title and content are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Blogu oluştur
      const createdBlog = await blogService.createBlog({
        title: title.trim(),
        fullContent: fullContent.trim(),
      });

      // 2) Kapak fotoğrafı varsa yükle
      if (coverFile && createdBlog._id) {
        await blogService.uploadBlogCover(createdBlog._id, coverFile);
      }

      Alert.alert(
        'Success',
        'Your blog post has been submitted and is pending admin approval.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      setTitle('');
      setFullContent('');
      setCoverFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (title || fullContent || coverFile) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Close', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.headerText}>
                Add New Blog Post
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeIconContainer}>
                <Icon name="close" size={24} color={Colors.lightText} />
              </TouchableOpacity>
            </View>

            <View style={styles.formContent}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter blog title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { text: Colors.lightText, primary: Colors.primary } }}
              />

              <Text style={styles.label}>Cover Photo</Text>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleSelectPhoto}
              >
                <Text style={styles.photoButtonText}>
                  {coverFile ? 'Change Photo' : 'No file selected'}
                </Text>
                <Icon name="image-outline" size={20} color={Colors.lightText} />
              </TouchableOpacity>
              {coverFile && coverFile.uri ? (
                <Image
                  source={{ uri: coverFile.uri }}
                  style={styles.photoPreview}
                  resizeMode="cover"
                  onError={() => setCoverFile(null)}
                />
              ) : (
                <Image
                  source={Nophoto}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />
              )}

              <Text style={styles.label}>Content</Text>
              <TextInput
                mode="outlined"
                placeholder="Write your blog content here..."
                value={fullContent}
                onChangeText={setFullContent}
                multiline
                numberOfLines={10}
                style={[styles.input, styles.contentInput]}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { text: Colors.lightText, primary: Colors.primary } }}
              />

              {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}

              <Text style={styles.note}>
                Your blog post will be published after it is approved by the administration.
              </Text>

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  disabled={loading}
                  style={styles.saveButton}
                  labelStyle={styles.buttonLabel}
                  loading={loading}
                >
                  Save Changes
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleClose}
                  disabled={loading}
                  style={styles.closeButton}
                  labelStyle={styles.buttonLabel}
                >
                  Close
                </Button>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 8 },
  formContainer: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  headerText: { color: Colors.lightText, fontWeight: '600' },
  closeIconContainer: { padding: 8 },
  formContent: { flex: 1 },
  label: { color: Colors.lightText, fontSize: 16, fontWeight: '500', marginBottom: 8 },
  input: { marginBottom: 16, backgroundColor: 'transparent', color: Colors.lightText },
  inputOutline: { borderRadius: 8, borderColor: 'rgba(255,255,255,0.3)' },
  contentInput: { height: 200, textAlignVertical: 'top', paddingTop: 12 },
  photoButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  photoButtonText: { color: Colors.lightText, fontSize: 16 },
  photoPreview: { width: '100%', height: 150, borderRadius: 8, marginBottom: 16 },
  note: { color: Colors.lightText, fontSize: 14, opacity: 0.8, textAlign: 'center', marginBottom: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { flex: 1, marginRight: 8, backgroundColor: Colors.primary, borderRadius: 8 },
  closeButton: { flex: 1, marginLeft: 8, borderColor: Colors.primary, borderRadius: 8 },
  buttonLabel: { color: Colors.lightText, fontSize: 16, fontWeight: '500' },
});

export default AddBlogPostScreen;