import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { Colors } from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import BaseService from '../api/BaseService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const itemWidth = width - 90;
const DEFAULT_IMAGE = 'https://via.placeholder.com/400x200?text=Haber+Görseli';

interface Article {
  _id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  fullContent?: string;
  source: { name: string };
  author?: string;
}

const FeaturedProduct: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(true);

  const listRef = useRef<FlatList>(null);
  const scrollOffset = useRef(0);
  const scrollAnimation = useRef<NodeJS.Timeout | null>(null);
  const scrollSpeed = 1.2;

  const fetchNews = async () => {
    try {
      setError(null);
      const response = await BaseService.getNews(1, 5);
      if (response.success) {
        setArticles(response.articles);
      } else {
        throw new Error(response.message || 'Haberler yüklenirken bir hata oluştu.');
      }
    } catch (err: any) {
      setError(err.message || 'Haberler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openModalWithContent = async (article: Article) => {
    try {
      const response = await BaseService.getNewsById(article._id);
      if (response.success) {
        setSelectedArticle(response.article);
        setModalVisible(true);
      }
    } catch (err: any) {
      setError(err.message || 'Haber detayı yüklenirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    if (articles.length === 0 || !isScrolling) return;

    const animateScroll = () => {
      scrollOffset.current += scrollSpeed;

      if (scrollOffset.current >= itemWidth * articles.length) {
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
  }, [articles, isScrolling]);

  const handleTouchStart = () => {
    setIsScrolling(false);
    if (scrollAnimation.current) {
      clearTimeout(scrollAnimation.current);
    }
  };

  const handleTouchEnd = () => {
    setIsScrolling(true);
  };

  const cleanContent = (content: string | undefined) => {
    if (!content) return '';
    
    // "4702 chars" gibi ifadeleri temizle
    let cleaned = content.replace(/\d+\s*chars?/gi, '');
    
    // Fazla boşlukları temizle
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Noktalama işaretlerinden sonra boşluk ekle
    cleaned = cleaned.replace(/([.,!?])([^\s])/g, '$1 $2');
    
    return cleaned;
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
            <View style={styles.headerContainer}>
              <Icon name="newspaper-variant" size={24} color={Colors.lightText} />
            </View>
            <View style={styles.newsSection}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.lightText} />
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.newsText}>{error}</Text>
                  <TouchableOpacity onPress={() => fetchNews()}>
                    <Text style={styles.retryButton}>Tekrar Dene</Text>
                  </TouchableOpacity>
                </View>
              ) : articles.length === 0 ? (
                <Text style={styles.newsText}>Haber bulunamadı.</Text>
              ) : (
                <FlatList
                  ref={listRef}
                  data={articles}
                  keyExtractor={(item) => item._id}
                  horizontal
                  snapToInterval={itemWidth}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.newsCard, { width: itemWidth }]}
                      onPress={() => openModalWithContent(item)}
                    >
                      <View style={styles.newsCardContent}>
                        <Image
                          source={
                            item.urlToImage
                              ? { uri: item.urlToImage }
                              : { uri: DEFAULT_IMAGE }
                          }
                          style={styles.newsImage}
                          resizeMode="cover"
                          defaultSource={{ uri: DEFAULT_IMAGE }}
                        />
                        <LinearGradient
                          colors={['rgba(0, 0, 0, 0.87)', 'rgba(0, 0, 0, 0.45)', 'transparent']}
                          locations={[0, 0.5, 0.7, 1]}
                          start={{ x: 0, y: 1 }}
                          end={{ x: 0, y: 0 }}
                          style={styles.imageOverlay}
                        >
                          <Text
                            style={styles.newsTitle}
                            numberOfLines={3}
                            ellipsizeMode="tail"
                          >
                            {item.title || 'Başlık Yok'}
                          </Text>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </LinearGradient>
      </Surface>

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
            {selectedArticle ? (
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalContentContainer}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalImageContainer}>
                    <Image
                      source={
                        selectedArticle.urlToImage
                          ? { uri: selectedArticle.urlToImage }
                          : { uri: DEFAULT_IMAGE }
                      }
                      style={styles.modalImage}
                      resizeMode="cover"
                      defaultSource={{ uri: DEFAULT_IMAGE }}
                    />
                  </View>
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalTitle}>
                      {selectedArticle.title || 'Başlık Yok'}
                    </Text>
                    <Text style={styles.modalSource}>
                      {selectedArticle.source?.name} - {new Date(selectedArticle.publishedAt).toLocaleDateString('tr-TR')}
                    </Text>
                    <Text style={styles.modalAbstract}>
                      {cleanContent(selectedArticle.fullContent) ||
                        cleanContent(selectedArticle.content) ||
                        cleanContent(selectedArticle.description) ||
                        'İçerik bulunamadı.'}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.modalText}>Haber seçilmedi.</Text>
            )}
          </LinearGradient>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerText: {
    color: Colors.lightText,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  newsSection: {
    flex: 1,
  },
  newsCard: {
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newsCardContent: {
    flex: 1,
    position: 'relative',
    height: 150,
  },
  newsImage: {
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
    height: '60%',
    padding: 12,
    justifyContent: 'flex-end',
  },
  newsTitle: {
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
  modalSource: {
    fontSize: 14,
    color: Colors.lightText,
    opacity: 0.7,
    marginBottom: 16,
  },
  modalAbstract: {
    fontSize: 15,
    color: Colors.lightText,
    lineHeight: 24,
    opacity: 0.9,
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
    fontSize: 16,
    color: Colors.primary,
    marginTop: 10,
  },
  newsText: {
    color: Colors.lightText,
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    width: width - 32,
    minHeight: 180,
    marginBottom: 18,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    marginTop: 18,
  },
  cardContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardImage: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 15,
    lineHeight: 20,
  },
});

export default FeaturedProduct;