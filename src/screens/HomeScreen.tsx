import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
  Image,
  StatusBar,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IconButton, Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';
import { PRODUCTS } from '../constants/data';
import ProductCard from '../components/ProductCard';
import FeaturedProduct from '../components/FeaturedProduct';
import { Product } from '../types';
import AIBlogSection from 'components/AiBlogSection';

// Define navigation stack param list
type RootStackParamList = {
  HomeScreen: undefined;
  MarketPlace: undefined;
  HowItWorksScreen: undefined;
  InvestmentDetails: undefined;
  TalentPool: undefined;
  StartupsDetails: undefined; // Added for Startups
  InvestorDetails: undefined; // Added for Investor
  BusinessDetails: undefined; // Added for Business
  AddBlogPost: undefined; // Added for AddBlogPostScreen
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = (props: HomeScreenProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState(PRODUCTS);
  const [activeTab, setActiveTab] = useState<'blog' | 'pulse'>('blog');
  const { onMenuOpen } = props;
  // ANİMASYON: Ortada gösterilecek kartlar için animated values
  const [showCenterCards, setShowCenterCards] = useState(true);
  const [activeCenterIndex, setActiveCenterIndex] = useState(0);
  const cardOpacities = useRef([
    new Animated.Value(1),
    new Animated.Value(0.2),
    new Animated.Value(0.2),
    new Animated.Value(0.2),
  ]).current;
  // Her kart için pozisyon animasyonu (sonda kullanılacak)
  const cardPositions = useRef([
    new Animated.ValueXY({ x: 0, y: 0 }),
    new Animated.ValueXY({ x: 0, y: 0 }),
    new Animated.ValueXY({ x: 0, y: 0 }),
    new Animated.ValueXY({ x: 0, y: 0 }),
  ]).current;
  // Her kart için scale animasyonu
  const cardScales = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;
  // El için scale animasyonu
  const handScale = useRef(new Animated.Value(1)).current;
  // Her kart için elin top, marginTop ve dönüş ayarları
  const handConfigs = [
    { left: 30, top: 70, marginTop: -30 },    // Startups
    { left: 30, top: 70, marginTop: -30 },    // Investor
    { left: 30, top: 50, marginTop: -10 },    // Business
    { left: 30, top: 50, marginTop: -10 },    // Marketplace
  ];
  // Kapanış animasyonu için her kartın X kayması
  const cardEndX = [-30, 0, 30, 0];

  const handleProductPress = (_productId: string) => {};

  const handleFavoritePress = (productId: string) => {
    setProducts(
      products.map(product =>
        product.id === productId
          ? { ...product, isFavorite: !product.isFavorite }
          : product,
      ),
    );
  };

  const renderProduct = ({ item }: { item: typeof PRODUCTS[0] }) => (
    <View style={styles.productCardWrapper}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item.id)}
        onFavoritePress={() => handleFavoritePress(item.id)}
        isUnlocked={true}
      />
    </View>
  );

  const filteredProducts = products
    .filter(
      (product: Product) =>
        product.type === 'Startups'
    )
    .slice(0, 3);

  // Community kartlarını array ile oluştur
  const communityItems = [
    {
      key: 'Startups',
      icon: 'rocket-launch',
      label: 'Startups',
      nav: 'StartupsDetails',
      desc: 'Startups: Girişimcilere özel alan',
    },
    {
      key: 'Investor',
      icon: 'account-group',
      label: 'Investor',
      nav: 'InvestorDetails',
      desc: 'Investor: Yatırımcılar için fırsatlar',
    },
    {
      key: 'Business',
      icon: 'store',
      label: 'Business',
      nav: 'BusinessDetails',
      desc: 'Business: İş dünyası için çözümler',
    },
    {
      key: 'Marketplace',
      icon: 'shopping',
      label: 'Marketplace',
      nav: 'MarketPlace',
      desc: 'Marketplace: Ürün ve hizmetler',
    },
  ];

  // Ortadaki kartlara tıklama ile animasyon
  const handleCenterCardPress = () => {
    if (activeCenterIndex < 3) {
      // Opacity animasyonu
      Animated.timing(cardOpacities[activeCenterIndex], {
        toValue: 0.2,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(cardOpacities[activeCenterIndex + 1], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // El önce küçülerek kaybolsun, sonra yeni kartta büyüsün
      Animated.timing(handScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setActiveCenterIndex(prev => {
          setTimeout(() => {
            Animated.timing(handScale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }, 0);
          return prev + 1;
        });
      });
    } else {
      // El kaybolsun
      Animated.timing(handScale, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
      // Kartlar aşağıya ve küçülerek gitsin
      communityItems.forEach((item, idx) => {
        Animated.parallel([
          Animated.timing(cardPositions[idx], {
            toValue: { x: cardEndX[idx], y: 80 },
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(cardScales[idx], {
            toValue: 0.7,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacities[idx], {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]).start();
      });
      setTimeout(() => setShowCenterCards(false), 800);
    }
  };

  // Güncellenmiş renderCommunitySection
  const renderCommunitySection = () => (
    <View style={styles.communitySection}>
      <Text style={styles.sectionTitle}>Our Community</Text>
      <View style={styles.communityItems}>
        {communityItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.communityItem}
            onPress={() => navigation.navigate(item.nav as any)}
          >
            <MaterialCommunityIcons name={item.icon} size={24} color={Colors.lightText} />
            <Text style={styles.communityItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.gradientBackground}
    >
      <StatusBar backgroundColor="#1A1E29" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Surface style={styles.header} elevation={0}>
            <View style={styles.logoAndTitleContainer}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/images/aistartupplatform.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
            <IconButton
              icon="menu"
              iconColor={Colors.lightText}
              size={24}
              onPress={onMenuOpen}
              style={styles.searchButton}
            />
          </Surface>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, gap: 10 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: activeTab === 'blog' ? 'rgba(43, 64, 99, 0.8)' : 'transparent',
                borderRadius: 16,
                paddingVertical: 10,
                alignItems: 'center',
                borderWidth: activeTab === 'blog' ? 1 : 0,
                borderColor: activeTab === 'blog' ? Colors.primary : 'transparent',
              }}
              onPress={() => setActiveTab('blog')}
            >
              <Text style={{ color: Colors.lightText, fontWeight: 'bold', fontSize: 16 }}>AI Blog</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: activeTab === 'pulse' ? 'rgba(43, 64, 99, 0.8)' : 'transparent',
                borderRadius: 16,
                paddingVertical: 10,
                alignItems: 'center',
                borderWidth: activeTab === 'pulse' ? 1 : 0,
                borderColor: activeTab === 'pulse' ? Colors.primary : 'transparent',
              }}
              onPress={() => setActiveTab('pulse')}
            >
              <Text style={{ color: Colors.lightText, fontWeight: 'bold', fontSize: 16 }}>AI Pulse</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'blog' ? (
            <AIBlogSection
  
              navigation={navigation}
            />
          ) : (
            <FeaturedProduct
              product={products[0]}
              discount="AI Pulse"
              onPress={() => handleProductPress(products[0].id)}
            />
          )}

          {renderCommunitySection()}

          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            scrollEnabled={true}
            contentContainerStyle={styles.productsContent}
            style={styles.productsList}
          />

          {/* ANİMASYONLU TOOLTIP: Ortada büyük kartlar */}
          {showCenterCards && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2000,
            }}>
              {/* Arka plan overlay */}
              <View style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(0,0,0,0.92)',
                zIndex: 1,
              }} />
              <View style={{
                position: 'absolute',
                top: 100,
                left: 0,
                right: 0,
                alignItems: 'center',
                zIndex: 2,
              }}>
                {communityItems.map((item, idx) => (
                  <Animated.View
                    key={item.key}
                    style={{
                      width: SCREEN_WIDTH * 0.9,
                      minHeight: 60,
                      height: 60,
                      marginVertical: 10,
                      opacity: cardOpacities[idx],
                      transform: [
                        ...cardPositions[idx].getTranslateTransform(),
                        { scale: cardScales[idx] },
                      ],
                      backgroundColor: activeCenterIndex === idx ? 'rgba(59,130,247,0.2)' : 'rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: activeCenterIndex === idx ? 2 : 1,
                      borderColor: activeCenterIndex === idx ? Colors.primary : 'rgba(255,255,255,0.2)',
                      position: 'relative',
                      overflow: 'visible',
                    }}
                  >
                    {activeCenterIndex === idx && (
                      <Animated.Image
                        source={require('../assets/images/Tooltipaihands.png')}
                        style={{
                          width: 350,
                          height: 350,
                          position: 'absolute',
                          left: handConfigs[activeCenterIndex]?.left ?? 0,
                          top: handConfigs[activeCenterIndex]?.top ?? 220,
                          marginTop: handConfigs[activeCenterIndex]?.marginTop ?? -120,
                          zIndex: 100,
                          transform: [
                            { scale: handScale },
                          ],
                        }}
                        resizeMode="contain"
                      />
                    )}
                    <View style={{
                      zIndex: 10,
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>{item.label}</Text>
                      <Text style={{ color: '#fff', fontSize: 12, marginTop: 6, textAlign: 'center' }}>
                        {idx === 0 ? 'Tap here to explore startups and add them to your favorites.' :
                          idx === 1 ? 'Tap here to explore investor.' :
                          idx === 2 ? 'Tap here to explore business' :
                          'Tap here to explore products and services'}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
                {/* Tüm kartlara tıklama alanı */}
                <TouchableOpacity
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3 }}
                  activeOpacity={1}
                  onPress={handleCenterCardPress}
                />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

type HomeScreenProps = {
  onMenuOpen?: () => void;
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  logoAndTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logo: {
    width: '130%',
    height: '130%',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    color: Colors.lightText,
    fontSize: 20,
    lineHeight: 24,
  },
  subtitle: {
    fontWeight: '400',
    color: Colors.lightText,
    fontSize: 10,
    opacity: 0.7,
  },
  searchButton: {
    margin: 0,
  },
  productsList: {
    flex: 1,
    marginTop: 0,
  },
  productsContent: {
    paddingBottom: 20,
    paddingHorizontal: 0,
  },
  productCardWrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 3,
  },
  talentPoolContent: {
    flex: 1,
    marginTop: 0,
    paddingBottom: 6,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 40,
    height: 80,
    marginBottom: 15,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  imageContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlight: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 50,
    top: -5,
    left: -5,
    zIndex: 0,
    opacity: 0.8,
  },
  image: {
    width: 44,
    height: 50,
    zIndex: 1,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
  },
  type: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  brandName: {
    color: Colors.lightText,
    fontSize: 16,
    marginBottom: 2,
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
    marginTop: 35,
  },
  price: {
    color: Colors.lightText,
    fontSize: 15,
    opacity: 0.8,
  },
  tooltipOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  ourCommunityButton: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.498,
    zIndex: 1001,
  },
  ourCommunityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tooltipContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  tooltipImageContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.478,
  },
  tooltipImage: {
    width: 500,
    height: 500,
  },
  tooltipTextContent: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.538,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    width: 200,
  },
  communitySection: {
    paddingHorizontal: 0,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: 20,
    textAlign: 'center',
  },
  communityItems: {
    gap: 12,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    paddingHorizontal: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 10,
  },
  communityItemText: {
    fontSize: 18,
    color: Colors.lightText,
    marginLeft: 12,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  tooltipHandContainer: {
    position: 'absolute',
    left: 40,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,

  },
  communityItemSpotlight: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default HomeScreen;