import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';

type RootStackParamList = {
  HomeScreen: undefined;
  MarketplaceScreen: undefined;
  ProductDetailsScreen: { product: Product };
  HowItWorksScreen: undefined;
  InvestmentDetails: undefined;
  TalentPool: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetailsScreen'>;
type RoutePropType = RouteProp<RootStackParamList, 'ProductDetailsScreen'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Product {
  id: string;
  company: string;
  name: string;
  category: string;
  price: string;
  description: string;
  tags: string;
  releaseDate: string;
  address: string;
  phone: string;
  email: string;
}

const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { product } = route.params;
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = React.useState(0);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = SCREEN_WIDTH - 32;
    const page = Math.round(contentOffset / viewSize);
    setCurrentPage(page);
  };

  const scrollToPage = (page: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: page * (SCREEN_WIDTH - 32),
        animated: true,
      });
    }
  };

  return (
    <LinearGradient
    colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
    locations={[0, 0.3, 0.6, 0.9]}
    start={{ x: 0, y: 0 }}
    end={{ x: 2, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color="#3B82F7" />
          </TouchableOpacity>
          <PaperText style={styles.header}>{product.name}</PaperText>
        </View>

        {/* Navigation Indicators */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            onPress={() => scrollToPage(0)}
            style={styles.navButton}
          >
            <Icon 
              name="chevron-back" 
              size={20} 
              color={currentPage === 0 ? '#3B82F7' : 'rgba(255,255,255,0.3)'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => scrollToPage(1)}
            style={styles.navButton}
          >
            <Icon 
              name="chevron-forward" 
              size={20} 
              color={currentPage === 1 ? '#3B82F7' : 'rgba(255,255,255,0.3)'} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* First Section: Basic Information */}
          <View style={[styles.sectionContainer, { marginRight: 16 }]}>
            <ScrollView 
              style={styles.verticalScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <TouchableOpacity style={styles.favoriteButton}>
                  <PaperText style={styles.favoriteText}>Add to Favorites</PaperText>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <PaperText style={styles.subTitle}>Company</PaperText>
                <PaperText style={styles.text}>{product.company}</PaperText>
              </View>

              <View style={styles.card}>
                <PaperText style={styles.subTitle}>Category</PaperText>
                <PaperText style={styles.text}>{product.category}</PaperText>
              </View>

              <View style={styles.card}>
                <PaperText style={styles.subTitle}>Tags</PaperText>
                <PaperText style={styles.text}>{product.tags}</PaperText>
              </View>

              <View style={styles.card}>
                <PaperText style={styles.subTitle}>Price</PaperText>
                <PaperText style={styles.text}>{product.price}</PaperText>
              </View>

              <View style={styles.card}>
                <PaperText style={styles.subTitle}>Release Date</PaperText>
                <PaperText style={styles.text}>{product.releaseDate}</PaperText>
              </View>

              <View style={styles.card}>
                <PaperText style={styles.subTitle}>Contact Information</PaperText>
                <PaperText style={styles.subSubTitle}>Address</PaperText>
                <PaperText style={styles.text}>{product.address}</PaperText>
                <PaperText style={styles.subSubTitle}>Phone</PaperText>
                <PaperText style={styles.text}>{product.phone}</PaperText>
                <PaperText style={styles.subSubTitle}>Email</PaperText>
                <PaperText style={styles.text}>{product.email}</PaperText>
              </View>
            </ScrollView>
          </View>

          {/* Second Section: Additional Details */}
          <View style={styles.sectionContainer}>
            <ScrollView 
              style={styles.verticalScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <PaperText style={styles.subTitle}>{product.name}</PaperText>
                <PaperText style={styles.subSubTitle}>{product.company}</PaperText>
                <PaperText style={styles.subSubTitle}>Summary</PaperText>
                <PaperText style={styles.text}>{product.description}</PaperText>
                <PaperText style={styles.subSubTitle}>Description</PaperText>
                <PaperText style={styles.text}>
                  PDI AI is an innovative AI solution engineered to optimize document processes for
                  businesses, with a strong emphasis on security. This platform aims to streamline
                  document handling workflows, enhancing productivity and reducing operational
                  inefficiencies. PDI AI leverages advanced artificial intelligence to securely manage
                  and optimize document-related tasks. It automates key processes, making document
                  management more efficient and reliable. This solution is designed for businesses
                  across diverse industries aiming to enhance their document management systems. It
                  provides advanced AI-powered solutions to improve productivity, security, and overall
                  document workflow. PDI AI stands out through its focus on security and its ability to
                  significantly improve document workflow efficiency. It represents a key innovation in
                  AI-driven document management.
                </PaperText>
              </View>

              <View style={styles.card}>
                <PaperText style={styles.subSubTitle}>Problems</PaperText>
                <PaperText style={styles.text}>
                  - Inefficient document workflows
                  - Security risks in document handling
                  - Time-consuming document processes
                  - Lack of process automation
                </PaperText>
                <PaperText style={styles.subSubTitle}>Solutions</PaperText>
                <PaperText style={styles.text}>
                  - Secure document process optimization
                  - AI-driven workflow automation
                  - Streamlined document handling
                  - Enhanced document security measures
                </PaperText>
                <PaperText style={styles.subSubTitle}>Improvements</PaperText>
                <PaperText style={styles.subSubTitle}>Key Features</PaperText>
                <PaperText style={styles.text}>
                  - AI-powered document optimization
                  - Secure document handling
                  - Automated workflows
                  - Enhanced efficiency
                </PaperText>
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1E29',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButton: {
    padding: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },

  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionContainer: {
    width: SCREEN_WIDTH - 32,
  },
  verticalScroll: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  subSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  favoriteButton: {
    backgroundColor: '#3B82F7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  favoriteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProductDetailsScreen;