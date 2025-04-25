import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Linking,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons'; // Added for the arrow icon
import { Product } from '../types';
import { Colors } from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';

type FeaturedProductProps = {
  product: Product;
  discount: string;
  onPress: () => void;
};

const { width } = Dimensions.get('window');
const NEWS_API_KEY = '81b6219d7f444a7b9c5525187d1059db'; // Replace with a valid NewsAPI key from https://newsapi.org
const query = 'artificial intelligence';

interface Article {
  _id: string;
  url: string;
  headline?: { main: string };
  abstract?: string;
  pub_date?: string;
  web_url?: string;
}

const FeaturedProduct: React.FC<FeaturedProductProps> = ({
  product: _product,
  discount,
  _onPress,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchNews = async (retryCount = 0, maxRetries = 3) => {
    try {
      setError(null);
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
          },
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 429 && retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return fetchNews(retryCount + 1, maxRetries);
        }
        if (res.status === 401 || errorData.code === 'apiKeyInvalid') {
          throw new Error('Invalid API key. Please check your NewsAPI key at https://newsapi.org.');
        }
        if (res.status === 429 || errorData.code === 'rateLimited') {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      if (!json.articles) {
        throw new Error('No articles found in the API response.');
      }
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
        headline: { main: article.title },
        abstract: article.description,
        pub_date: article.publishedAt,
        web_url: article.url,
      }));
      console.log('Filtered Articles:', mappedArticles.map((a: Article) => a.headline?.main));
      setArticles(mappedArticles);
    } catch (err: any) {
      console.error('NewsAPI error details:', {
        message: err.message,
        response: err.response || 'No response data',
        stack: err.stack || 'No stack trace available',
      });
      setError(err.message || 'Failed to fetch AI articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.cardContainer} elevation={4}>
        <View style={styles.gradientContainer}>
          <View style={styles.discountContainer}>
            <Text variant="displaySmall" style={styles.discountText}>
              {discount}
            </Text>
          </View>

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
                  data={articles.slice(0, 5)}
                  keyExtractor={(item) => item._id}
                  horizontal
                  pagingEnabled
                  snapToAlignment="start"
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.newsCard}
                      onPress={() => {
                        setSelectedArticle(item);
                        setModalVisible(true);
                      }}
                    >
                      <Text
                        style={styles.newsText}
                        numberOfLines={3} // Changed from 4 to 3 to limit to 3 lines
                        ellipsizeMode="tail"
                      >
                        {item.headline?.main || 'No Title Available'}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
                {/* Added Arrow Icon to Indicate Scrolling */}
                <View style={styles.arrowContainer}>
                  <Icon
                    name="chevron-forward"
                    size={20}
                    color={Colors.lightText}
                    style={styles.arrow}
                  />
                </View>
              </>
            )}
          </View>
        </View>
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
              <>
                <Text style={styles.modalTitle}>
                  {selectedArticle.headline?.main || 'No Title Available'}
                </Text>
                <Text style={styles.modalAbstract}>
                  {selectedArticle.abstract || 'No abstract available.'}
                </Text>
                {selectedArticle.web_url ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(selectedArticle.web_url)}
                  >
                    <Text style={styles.modalLink}>Read Full Article</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.modalLink}>No link available.</Text>
                )}
              </>
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
    width: '92%',
    height: 200,
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
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  gradientContainer: {
    flex: 1,
    padding: 16,
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
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  newsSection: {
    flex: 1,
  },
  newsCard: {
    width: width - 90,
    padding: 16,
    marginRight: 16,
  },
  newsText: {
    color: Colors.lightText,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  arrowContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  arrow: {
    fontSize: 20,
    color: Colors.lightText,
    opacity: 0.7, // Subtle opacity for the arrow
    marginTop: 80,
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
    backgroundColor: 'rgba(26, 30, 41, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.lightText,
    marginBottom: 10,
    marginTop: 20,
  },
  modalAbstract: {
    fontSize: 14,
    color: Colors.lightText,
    marginBottom: 10,
    opacity: 0.8,
  },
  modalLink: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  modalText: {
    fontSize: 16,
    color: Colors.lightText,
    marginBottom: 10,
  },
  errorContainer: {
    alignItems: 'center',
  },
  retryButton: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 10,
  },
});

export default FeaturedProduct;