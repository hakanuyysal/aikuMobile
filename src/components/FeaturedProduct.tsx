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
import Icon from 'react-native-vector-icons/Ionicons';
import { Product } from '../types';
import { Colors } from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import Nophoto from '../assets/images/Nophoto.png';

type FeaturedProductProps = {
  product?: Product; // Made optional as it's unused
  discount: string;
  onPress?: () => void; // Made optional as it's unused
};

const { width } = Dimensions.get('window');
const NEWS_API_KEY = '81b6219d7f444a7b9c5525187d1059db';
const query = 'artificial intelligence';

interface Article {
  _id: string;
  url: string;
  headline?: { main: string };
  abstract?: string;
  pub_date?: string;
  web_url?: string;
  urlToImage?: string;
  fullContent?: string;
}

const FeaturedProduct: React.FC<FeaturedProductProps> = ({ discount }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(true);

  const listRef = useRef<FlatList>(null);
  const scrollOffset = useRef(0);
  const scrollAnimation = useRef<NodeJS.Timeout | null>(null);

  const itemWidth = width - 90; // Width of each news card
  const scrollSpeed = 1.2; // Pixels per frame

  // Decode HTML entities
  const decodeHtmlEntities = (text: string) => {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, "'")
      .replace(/ /g, ' ');
  };

  const fetchNews = async (retryCount = 0, maxRetries = 3) => {
    try {
      setError(null);
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`,
        {
          headers: { 'Cache-Control': 'no-cache' },
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 429 && retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return fetchNews(retryCount + 1, maxRetries);
        }
        if (res.status === 401 || errorData.code === 'apiKeyInvalid') {
          throw new Error('Invalid API key.');
        }
        throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      const aiKeywords = ['artificial intelligence', 'AI', 'machine learning'];
      const validArticles = json.articles.filter((article: any) => {
        if (!article.title) return false;
        const headline = article.title.toLowerCase();
        return aiKeywords.some((keyword) =>
          headline.includes(keyword.toLowerCase())
        );
      });
      const mappedArticles = validArticles.map((article: any, index: number) => ({
        _id: `${index}-${article.publishedAt}`,
        url: article.url,
        headline: { main: article.title },
        abstract: article.description,
        pub_date: article.publishedAt,
        web_url: article.url,
        urlToImage: article.urlToImage,
        fullContent: '',
      }));
      setArticles(mappedArticles);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI articles.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFullContent = async (url: string, abstract: string | undefined) => {
    try {
      const response = await fetch(url);
      const html = await response.text();

      const cleanedHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<pre\b[^<]*(?:(?!<\/pre>)<[^<]*)*<\/pre>/gi, '')
        .replace(/<code\b[^<]*(?:(?!<\/code>)<[^<]*)*<\/code>/gi, '');

      const contentMatch = cleanedHtml.match(
        /<article[^>]*>([\s\S]*?)<\/article>|<div[^>]*class=["'](?:article|story|content|post|main-content)[^"']*["']>([\s\S]*?)<\/div>|<p[^>]*>([\s\S]*?)<\/p>/gi
      );

      if (contentMatch) {
        const cleanedContent = contentMatch
          .map((tag) => tag.replace(/<[^>]+>/g, '').trim())
          .filter((text) => {
            return (
              text.length > 50 &&
              !text.match(/^\s*(Advertisement|Subscribe|Sign\s*Up|Login|Footer|Nav|Menu|Comment|Share|Related\s*Articles)\s*$/i) &&
              !text.match(/^\s*[\[\]\{\}\(\)]*\s*$/) &&
              !text.match(/^\s*(<[^>]+>|\{.*?\}|\[.*?\]|\(.*?\))\s*$/)
            );
          })
          .join('\n\n');

        if (cleanedContent.length > 100) {
          return decodeHtmlEntities(cleanedContent);
        }
      }

      return decodeHtmlEntities(abstract || 'Full content unavailable.');
    } catch (err) {
      console.log('Error fetching full content:', err);
      return decodeHtmlEntities(abstract || 'Error fetching full content. Please try another article.');
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openModalWithContent = async (article: Article) => {
    if (!article.fullContent) {
      const fullContent = await fetchFullContent(article.url, article.abstract);
      setArticles((prev) =>
        prev.map((a) => (a._id === article._id ? { ...a, fullContent } : a))
      );
      setSelectedArticle({ ...article, fullContent });
    } else {
      setSelectedArticle(article);
    }
    setModalVisible(true);
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
  }, [articles, isScrolling, itemWidth]);

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
        <View style={styles.gradientContainer}>
          {/* Discount Section */}
          <View style={styles.discountRow}>
            <View style={styles.discountContainer}>
              <Text variant="displaySmall" style={styles.discountText}>
                {discount}
              </Text>
            </View>
            <View style={styles.iconAndBadgeContainer}>
              <Icon
                name="newspaper-outline"
                size={24}
                color={Colors.lightText}
              />
            </View>
          </View>

          {/* News Section */}
          <View style={styles.newsSection}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.lightText} />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.newsText}>{error}</Text>
                <TouchableOpacity onPress={() => fetchNews()}>
                  <Text style={styles.retryButton}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : articles.length === 0 ? (
              <Text style={styles.newsText}>No AI-focused articles found.</Text>
            ) : (
              <>
                <FlatList
                  ref={listRef}
                  data={articles.slice(0, 5)}
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
                              : Nophoto
                          }
                          style={styles.newsImage}
                          resizeMode="cover"
                          defaultSource={Nophoto}
                          onError={() => console.log('Image failed to load')}
                        />
                        <LinearGradient
                          colors={['rgba(0,0,0,0.7)', 'transparent']}
                          style={styles.imageOverlay}
                        >
                          <Text
                            style={styles.newsTitle}
                            numberOfLines={3}
                            ellipsizeMode="tail"
                          >
                            {item.headline?.main || 'No Title'}
                          </Text>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
          </View>
        </View>
      </Surface>

      {/* Modal for Full Article Content */}
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
                          : Nophoto
                      }
                      style={styles.modalImage}
                      resizeMode="cover"
                      defaultSource={Nophoto}
                      onError={() => console.log('Modal image failed to load')}
                    />
                  </View>
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalTitle}>
                      {selectedArticle.headline?.main || 'No Title Available'}
                    </Text>
                    <Text style={styles.modalAbstract}>
                      {decodeHtmlEntities(
                        selectedArticle.fullContent ||
                          selectedArticle.abstract ||
                          'No content available.'
                      )}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.modalText}>No article selected.</Text>
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
    backgroundColor: `${Colors.cardBackground}dd`,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  gradientContainer: {
    flex: 1,
    padding: 16,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountContainer: {
    marginLeft: 8,
    marginBottom: 16,
  },
  discountText: {
    fontWeight: '600',
    color: Colors.lightText,
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 10 },
  },
  iconAndBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSection: {
    flex: 1,
  },
  newsCard: {
    width: width - 90,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden', // Ensure image doesn't bleed outside border
  },
  newsCardContent: {
    flex: 1,
    position: 'relative',
    height: 150, // Increased height for larger image
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
    padding: 12,
    justifyContent: 'flex-end',
  },
  newsTitle: {
    color: Colors.lightText,
    fontSize: 16, // Slightly reduced to ensure fit
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
    fontSize: 16,
    color: Colors.primary,
    marginTop: 10,
  },
  newsText: {
    color: Colors.lightText,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FeaturedProduct;