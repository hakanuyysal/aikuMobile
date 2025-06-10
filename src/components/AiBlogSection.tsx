import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Surface, Text, IconButton, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import BaseService from '../api/BaseService';
import * as ImagePicker from 'react-native-image-picker';
import Config from 'react-native-config';
import { blogService } from '../services/blogService';

const { width } = Dimensions.get('window');
const IMAGE_BASE_URL = 'https://api.aikuaiplatform.com';
const DEFAULT_IMAGE = 'https://via.placeholder.com/400x200?text=Blog+Görseli';

interface Blog {
  _id: string;
  title: string;
  fullContent: string;
  coverPhoto?: string;
  createdAt: string;
  updatedAt: string;
}

type RootStackParamList = {
  HomeScreen: undefined;
  MarketPlace: undefined;
  HowItWorksScreen: undefined;
  InvestmentDetails: undefined;
  TalentPool: undefined;
  StartupsDetails: undefined;
  InvestorDetails: undefined;
  BusinessDetails: undefined;
  AddBlogPost: undefined;
};

type AIBlogSectionProps = {
  title: string;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
};

const AIBlogSection: React.FC<AIBlogSectionProps> = ({ title, navigation }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Blog Modal States
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const listRef = useRef<FlatList>(null);
  const scrollOffset = useRef(0);
  const scrollAnimation = useRef<NodeJS.Timeout | null>(null);
  const itemWidth = width - 90;
  const scrollSpeed = 1.2;

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogService.getBlogs(1, 5);
      if (response.success) {
        setBlogs(response.blogs || []);
      } else {
        throw new Error(response.message || 'Bloglar yüklenirken bir hata oluştu.');
      }
    } catch (err: any) {
      setError(err.message || 'Bloglar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleImagePick = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        setError('Resim seçilirken bir hata oluştu.');
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const handleSaveBlog = async () => {
    if (!newBlogTitle.trim() || !newBlogContent.trim()) {
      setError('Başlık ve içerik zorunludur.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const createdBlog = await blogService.createBlog({
        title: newBlogTitle,
        fullContent: newBlogContent,
      });

      if (selectedImage && createdBlog._id) {
        await blogService.uploadBlogCover(createdBlog._id, selectedImage);
      }

      await fetchBlogs();
      setAddModalVisible(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Blog kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewBlogTitle('');
    setNewBlogContent('');
    setSelectedImage(null);
    setError(null);
  };

  useEffect(() => {
    if (blogs.length === 0 || !isScrolling) return;

    const animateScroll = () => {
      scrollOffset.current += scrollSpeed;

      if (scrollOffset.current >= itemWidth * blogs.length) {
        scrollOffset.current = 0;
        if (listRef.current) {
          listRef.current.scrollToOffset({ offset: 0, animated: false });
        }
      }

      if (listRef.current) {
        listRef.current.scrollToOffset({
          offset: scrollOffset.current,
          animated: true,
        });
      }

      scrollAnimation.current = setTimeout(animateScroll, 16);
    };

    scrollAnimation.current = setTimeout(animateScroll, 16);

    return () => {
      if (scrollAnimation.current) {
        clearTimeout(scrollAnimation.current);
      }
    };
  }, [blogs, isScrolling, itemWidth]);

  const handleTouchStart = () => {
    setIsScrolling(false);
    if (scrollAnimation.current) {
      clearTimeout(scrollAnimation.current);
    }
  };

  const handleTouchEnd = () => {
    setIsScrolling(true);
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.cardContainer} elevation={4}>
        <LinearGradient
          colors={['rgba(43, 64, 99, 0.8)', 'rgba(43, 64, 99, 0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.gradientContainer}>
            <View style={styles.titleRow}>
              <View style={styles.leftContainer}>
                <Icon
                  name="book-outline"
                  size={24}
                  color={Colors.lightText}
                  style={styles.bookIcon}
                />
                <View style={styles.titleContainer}>
                  <Text variant="displaySmall" style={styles.titleText}>
                    {title}
                  </Text>
                </View>
              </View>
              <IconButton
                icon="plus"
                iconColor={Colors.lightText}
                size={20}
                onPress={() => navigation?.navigate('AddBlogPost')}
                style={styles.addButton}
              />
            </View>

            <View style={styles.blogsSection}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.lightText} />
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity onPress={fetchBlogs} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                  </TouchableOpacity>
                </View>
              ) : blogs.length === 0 ? (
                <Text style={styles.blogText}>Henüz blog yazısı yok.</Text>
              ) : (
                <FlatList
                  ref={listRef}
                  data={blogs}
                  keyExtractor={(item) => item._id}
                  horizontal
                  snapToInterval={itemWidth}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  renderItem={({ item }) => {
                    console.log('Blog item:', item);
                    return (
                      <TouchableOpacity
                        style={[styles.blogCard, { width: itemWidth }]}
                        onPress={() => {
                          setSelectedBlog(item);
                          setModalVisible(true);
                        }}
                      >
                        <View style={styles.blogCardContent}>
                          <Image
                            source={{
                              uri: item.coverPhoto
                                ? item.coverPhoto.startsWith('http')
                                  ? item.coverPhoto
                                  : item.coverPhoto.startsWith('/uploads')
                                    ? `${IMAGE_BASE_URL}${item.coverPhoto}`
                                    : DEFAULT_IMAGE
                                : DEFAULT_IMAGE,
                            }}
                            style={styles.blogImage}
                            resizeMode="cover"
                            defaultSource={{ uri: DEFAULT_IMAGE }}
                          />
                          <LinearGradient
                            colors={['rgba(0,0,0,0.7)', 'transparent']}
                            style={styles.imageOverlay}
                          >
                            <Text
                              style={styles.blogTitle}
                              numberOfLines={3}
                              ellipsizeMode="tail"
                            >
                              {item.title}
                            </Text>
                          </LinearGradient>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </LinearGradient>
      </Surface>

      {/* Blog Detail Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
            locations={[0, 0.3, 0.6, 0.9]}
            start={{ x: 0, y: 0 }}
            end={{ x: 2, y: 1 }}
            style={styles.modalContainer}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeIconContainer}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            {selectedBlog ? (
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalContentContainer}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalImageContainer}>
                    <Image
                      source={{
                        uri: selectedBlog?.coverPhoto
                          ? selectedBlog.coverPhoto.startsWith('http')
                            ? selectedBlog.coverPhoto
                            : selectedBlog.coverPhoto.startsWith('/uploads')
                              ? `${IMAGE_BASE_URL}${selectedBlog.coverPhoto}`
                              : DEFAULT_IMAGE
                          : DEFAULT_IMAGE,
                      }}
                      style={styles.modalImage}
                      resizeMode="cover"
                      defaultSource={{ uri: DEFAULT_IMAGE }}
                    />
                  </View>
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalTitle}>{selectedBlog.title}</Text>
                    <Text style={styles.modalDate}>
                      {new Date(selectedBlog.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                    <Text style={styles.modalAbstract}>
                      {selectedBlog.fullContent}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.modalText}>Blog seçilmedi.</Text>
            )}
          </LinearGradient>
        </View>
      </Modal>

      {/* Add Blog Modal */}
      <Modal
        transparent
        visible={addModalVisible}
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addModalContainer}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Yeni Blog Yazısı</Text>
              <TouchableOpacity
                onPress={() => {
                  setAddModalVisible(false);
                  resetForm();
                }}
                style={styles.closeIconContainer}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.addModalContent}>
              <TextInput
                style={styles.input}
                placeholder="Blog Başlığı"
                value={newBlogTitle}
                onChangeText={setNewBlogTitle}
                placeholderTextColor={Colors.lightText}
              />

              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={handleImagePick}
              >
                <Icon name="image-outline" size={24} color={Colors.lightText} />
                <Text style={styles.imagePickerText}>
                  {selectedImage ? 'Resim Seçildi' : 'Kapak Resmi Seç'}
                </Text>
              </TouchableOpacity>

              <TextInput
                style={[styles.input, styles.contentInput]}
                placeholder="Blog İçeriği"
                value={newBlogContent}
                onChangeText={setNewBlogContent}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                placeholderTextColor={Colors.lightText}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Text style={styles.infoText}>
                Blog yazınız yönetici onayından sonra yayınlanacaktır.
              </Text>

              <View style={styles.addModalActions}>
                <Button
                  mode="contained"
                  onPress={handleSaveBlog}
                  loading={saving}
                  disabled={saving}
                  style={styles.saveButton}
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setAddModalVisible(false);
                    resetForm();
                  }}
                  disabled={saving}
                  style={styles.cancelButton}
                >
                  İptal
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '30%',
    marginVertical: 10,
    position: 'relative',
    alignSelf: 'center',
  },
  cardContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  gradientBackground: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 8,
    marginBottom: 16,
  },
  titleText: {
    fontWeight: '600',
    color: Colors.lightText,
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 10 },
  },
  bookIcon: {
    marginLeft: 8,
  },
  addButton: {
    borderRadius: 12,
    padding: 0,
    marginRight: 8,
  },
  blogsSection: {
    flex: 1,
  },
  blogCard: {
    width: width - 90,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  blogCardContent: {
    flex: 1,
    position: 'relative',
    height: 150,
  },
  blogImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    justifyContent: 'flex-end',
  },
  blogTitle: {
    color: Colors.lightText,
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContainer: {
    padding: 20,
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'rgba(26, 30, 41, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  modalScrollView: {
    flexGrow: 1,
  },
  modalContentContainer: {
    paddingBottom: 20,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  closeIcon: {
    fontSize: 24,
    color: Colors.lightText,
  },
  modalContent: {
    flexDirection: 'column',
    marginTop: 20,
  },
  modalImageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  modalTextContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.lightText,
    marginBottom: 12,
  },
  modalAbstract: {
    fontSize: 14,
    color: Colors.lightText,
    lineHeight: 24,
    opacity: 0.8,
  },
  modalText: {
    fontSize: 16,
    color: Colors.lightText,
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: Colors.lightText,
    fontSize: 14,
    fontWeight: '600',
  },
  blogText: {
    color: Colors.lightText,
    fontSize: 14,
    textAlign: 'center',
  },
  addModalContainer: {
    backgroundColor: '#1A1E29',
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.lightText,
  },
  addModalContent: {
    flex: 1,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: Colors.lightText,
  },
  contentInput: {
    height: 200,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  imagePickerText: {
    color: Colors.lightText,
    marginLeft: 8,
  },
  addModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    borderColor: Colors.lightText,
  },
  infoText: {
    color: Colors.lightText,
    opacity: 0.7,
    fontSize: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 12,
  },
  modalDate: {
    color: Colors.lightText,
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 12,
  },
});

export default AIBlogSection;