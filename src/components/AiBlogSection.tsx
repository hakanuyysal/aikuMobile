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
} from 'react-native';
import { Surface, Text, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import Nophoto from '../assets/images/Nophoto.png';

// Define navigation stack param list
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
  onPress?: () => void;
  navigation: NativeStackNavigationProp<RootStackParamList>; // NEW: Add navigation prop
};

const { width } = Dimensions.get('window');

interface Blog {
  _id: string;
  url: string;
  title: string;
  abstract?: string;
  pub_date?: string;
  web_url?: string;
  urlToImage?: string;
  fullContent?: string;
}

// Static blog data
const STATIC_BLOGS: Blog[] = [
  {
    _id: 'blog-1',
    url: 'https://example.com/ai-healthcare',
    web_url: 'https://example.com/ai-healthcare',
    title: 'The Future of AI in Healthcare',
    abstract: 'Explore how AI is transforming diagnostics and patient care.',
    pub_date: '2025-05-20T10:00:00Z',
    urlToImage: 'https://example.com/images/ai-healthcare.jpg',
    fullContent: `
      Artificial Intelligence is revolutionizing healthcare by enhancing diagnostics, personalizing treatment plans, and improving patient outcomes. Machine learning models analyze medical imaging with precision, detecting conditions like cancer earlier than traditional methods. AI-driven chatbots provide 24/7 patient support, reducing the burden on healthcare professionals. Predictive analytics help hospitals manage resources efficiently, forecasting patient admissions and optimizing staff schedules. However, challenges like data privacy, ethical concerns, and integration with existing systems remain. As AI continues to evolve, its potential to make healthcare more accessible and effective is immense, promising a future where technology and medicine work hand-in-hand to save lives.
    `,
  },
  {
    _id: 'blog-2',
    url: 'https://example.com/ethics-ai',
    web_url: 'https://example.com/ethics-ai',
    title: 'Ethical Challenges in AI Development',
    abstract: 'A look at the moral dilemmas facing AI developers today.',
    pub_date: '2025-05-18T14:30:00Z',
    urlToImage: null,
    fullContent: `
      As AI becomes integral to society, ethical challenges are at the forefront of its development. Bias in algorithms, often stemming from skewed training data, can perpetuate discrimination in areas like hiring or criminal justice. Transparency is another hurdle—many AI systems operate as "black boxes," making it hard to understand their decisions. Privacy concerns arise as AI systems collect vast amounts of personal data, raising questions about consent and security. Developers must also grapple with the societal impact of automation, which could displace jobs. Addressing these issues requires collaboration between technologists, policymakers, and ethicists to ensure AI is developed responsibly, balancing innovation with accountability.
    `,
  },
  {
    _id: 'blog-3',
    url: 'https://example.com/ai-automation',
    web_url: 'https://example.com/ai-automation',
    title: 'AI and the Rise of Automation',
    abstract: 'How AI is reshaping industries through automation.',
    pub_date: '2025-05-16T09:15:00Z',
    urlToImage: 'https://example.com/images/ai-automation.jpg',
    fullContent: `
      AI-powered automation is transforming industries, from manufacturing to customer service. In factories, AI-driven robots perform complex tasks with precision, increasing efficiency and reducing costs. In offices, AI tools automate repetitive tasks like data entry, allowing employees to focus on creative work. The logistics sector benefits from AI optimizing supply chains, predicting demand, and routing deliveries. While automation boosts productivity, it also raises concerns about job displacement. Upskilling workers and integrating AI as a collaborative tool are essential to mitigate these impacts. The future of work lies in a synergy where AI enhances human capabilities, driving innovation across the globe.
    `,
  },
  {
    _id: 'blog-4',
    url: 'https://example.com/generative-ai',
    web_url: 'https://example.com/generative-ai',
    title: 'Generative AI: Creativity Unleashed',
    abstract: 'Discover how generative AI is changing art and content creation.',
    pub_date: '2025-05-14T11:00:00Z',
    urlToImage: 'https://example.com/images/generative-ai.jpg',
    fullContent: `
      Generative AI, capable of creating text, images, and videos, is redefining creativity. Tools like DALL·E and GPT models produce artwork and narratives that rival human output, enabling artists to explore new frontiers. In marketing, generative AI crafts personalized content at scale, enhancing customer experiences. However, its misuse—such as generating misleading deepfakes—poses risks. Intellectual property disputes also emerge, as AI-generated works challenge traditional notions of authorship. To harness generative AI's potential, clear regulations and ethical guidelines are needed. As this technology advances, it promises to democratize creativity, making artistic expression more accessible to all.
    `,
  },
  {
    _id: 'blog-5',
    url: 'https://example.com/ai-education',
    web_url: 'https://example.com/ai-education',
    title: 'AI in Education: Personalized Learning',
    abstract: 'AI is revolutionizing education with tailored learning experiences.',
    pub_date: '2025-05-12T13:45:00Z',
    urlToImage: 'https://example.com/images/ai-education.jpg',
    fullContent: `
      AI is reshaping education by offering personalized learning experiences. Adaptive platforms assess students' strengths and weaknesses, tailoring lessons to their needs. AI tutors provide instant feedback, helping students master subjects at their own pace. In schools, AI streamlines administrative tasks, allowing teachers to focus on instruction. Language models assist with language learning, offering real-time translation and conversation practice. However, equitable access is a challenge, as not all schools can afford AI tools. Data privacy is also critical, given the sensitive nature of student information. By addressing these hurdles, AI can make education more engaging and inclusive, preparing students for a tech-driven future.
    `,
  },
];

const AIBlogSection: React.FC<AIBlogSectionProps> = ({ title, navigation }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlogPost, setSelectedBlog] = useState<Blog | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(true);

  const listRef = useRef<FlatList>(null);
  const scrollOffset = useRef(0);
  const scrollAnimation = useRef<NodeJS.Timeout | null>(null);

  const itemWidth = width - 90; // Width of each blog card
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

  // Initialize blogs with static data
  useEffect(() => {
    setBlogs(STATIC_BLOGS);
  }, []);

  const openModalWithContent = (blog: Blog) => {
    setSelectedBlog(blog);
    setModalVisible(true);
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
        <View style={styles.gradientContainer}>
          {/* Title Section */}
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text variant="displaySmall" style={styles.titleText}>
                {title}
              </Text>
            </View>
            <View style={styles.iconAndBadgeContainer}>
              <Icon
                name="book-outline"
                size={24}
                color={Colors.lightText}
                style={styles.icon}
              />
              <IconButton
                icon="plus"
                iconColor={Colors.lightText}
                size={20}
                onPress={() => navigation.navigate('AddBlogPost')}
                style={styles.addButton}
              />
            </View>
          </View>

          {/* Blogs Section */}
          <View style={styles.blogsSection}>
            {blogs.length === 0 ? (
              <Text style={styles.blogText}>No AI blogs available.</Text>
            ) : (
              <FlatList
                ref={listRef}
                data={blogs.slice(0, 5)}
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
                    style={[styles.blogCard, { width: itemWidth }]}
                    onPress={() => openModalWithContent(item)}
                  >
                    <View style={styles.blogCardContent}>
                      <Image
                        source={
                          item.urlToImage
                            ? { uri: item.urlToImage }
                            : Nophoto
                        }
                        style={styles.blogImage}
                        resizeMode="cover"
                        defaultSource={Nophoto}
                        onError={() => console.log('Image failed to load')}
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
                          {item.title || 'No Title'}
                        </Text>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Surface>

      {/* Modal for Full Blog Content */}
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
            {selectedBlogPost ? (
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalContentContainer}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalImageContainer}>
                    <Image
                      source={
                        selectedBlogPost.urlToImage
                          ? { uri: selectedBlogPost.urlToImage }
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
                      {selectedBlogPost.title || 'No Title Available'}
                    </Text>
                    <Text style={styles.modalAbstract}>
                      {decodeHtmlEntities(
                        selectedBlogPost.fullContent ||
                          selectedBlogPost.abstract ||
                          'No content available.'
                      )}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.modalText}>No blog selected.</Text>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  iconAndBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  addButton: {
    borderRadius: 12,
    padding: 0,
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
    fontSize: 16,
    color: Colors.primary,
    marginTop: 10,
  },
  blogText: {
    color: Colors.lightText,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AIBlogSection;