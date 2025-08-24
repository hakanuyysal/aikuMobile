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
  Modal,
  Linking,
} from 'react-native';
import metrics from '../constants/aikuMetric';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActiveMobileModalMessage } from '../api/modalMessagesApi';
import PushPermissionPrompt from '../components/PushPermissionPrompt';
import { storage } from '../storage/mmkv';
import notificationService from '../services/notificationService';

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

const CONTENT_MAX = metrics.isTablet
  ? Math.min(metrics.WIDTH * 0.88, 1000)   // 11" iPad'de ~800–900 iyi
  : metrics.WIDTH - metrics.spacing.lg * 2;

const COMMUNITY_ITEM_W = metrics.isTablet
  ? Math.min(metrics.menuWidth, CONTENT_MAX * 0.72)  // ~560’ı geçmez, nefes alır
  : CONTENT_MAX;

const CARD_GAP = metrics.spacing.md;
const TWO_COL_W = (CONTENT_MAX - CARD_GAP) / 2;

const CARD_HEIGHT = metrics.moderateScale(metrics.isTablet ? 72 : 60);


const LOGO_W = metrics.isTablet ? Math.min(CONTENT_MAX * 0.32, 220) : 150;
const LOGO_H = metrics.isTablet ? 56 : 42;

const HERO_HEIGHT = metrics.isTablet ? 240 : 180;

const HomeScreen = (props: HomeScreenProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState(PRODUCTS);
  const [activeTab, setActiveTab] = useState<'pulse' | 'blog'>('pulse');
  const [postHomeModalVisible, setPostHomeModalVisible] = useState(false);
  const [postHomeModalMessage, setPostHomeModalMessage] = useState<
    string | null
  >(null);
  const [postHomeModalTitle, setPostHomeModalTitle] = useState<string | null>(
    null,
  );
  const [_postHomeModalId, setPostHomeModalId] = useState<string | null>(null);

  // Push notification permission prompt state
  const [pushPromptVisible, setPushPromptVisible] = useState(false);

  // Modal state'ini debug için logla
  React.useEffect(() => {
    console.log('🔍 Modal state değişti:', {
      visible: postHomeModalVisible,
      title: postHomeModalTitle,
      message: postHomeModalMessage,
    });
  }, [postHomeModalVisible, postHomeModalTitle, postHomeModalMessage]);
  const { onMenuOpen } = props;
  // ANİMASYON: Ortada gösterilecek kartlar için animated values
  const [showCenterCards, setShowCenterCards] = useState(false);
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
  // handConfigs kaldırıldı
  // Kapanış animasyonu için her kartın X kayması
  const cardEndX = [-30, 0, 30, 0];

  const handleProductPress = (_productId: string) => { };

  const handleFavoritePress = (productId: string) => {
    setProducts(
      products.map(product =>
        product.id === productId
          ? { ...product, isFavorite: !product.isFavorite }
          : product,
      ),
    );
  };

  const renderProduct = ({ item }: { item: (typeof PRODUCTS)[0] }) => (
    <View style={[
      styles.productCardWrapper,
      metrics.isTablet ? { width: TWO_COL_W } : { width: '100%' }
    ]}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item.id)}
        onFavoritePress={() => handleFavoritePress(item.id)}
        isUnlocked={true}
      />
    </View>
  );

  const filteredProducts = products
    .filter((product: Product) => product.type === 'Startups')
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
  const handleCenterCardPress = async () => {
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
      setTimeout(async () => {
        setShowCenterCards(false);
        await AsyncStorage.setItem('centerCardsTooltipShown', 'true');
      }, 800);
    }
  };

  React.useEffect(() => {
    const checkTooltipShown = async () => {
      const shown = await AsyncStorage.getItem('centerCardsTooltipShown');
      if (!shown) {
        setShowCenterCards(true);
      }
    };
    checkTooltipShown();
  }, []);

  // Push notification permission prompt kontrolü
  React.useEffect(() => {
    const checkAndShowPushPrompt = async () => {
      try {
        // Kullanıcı giriş yapmış mı kontrol et (token var mı)
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('🚫 Kullanıcı giriş yapmamış, push prompt gösterilmez');
          return;
        }

        // Kullanıcı bilgisini kontrol et
        const userStr = await AsyncStorage.getItem('user');
        if (!userStr) {
          console.log('🚫 Kullanıcı bilgisi bulunamadı, push prompt gösterilmez');
          return;
        }

        // Debug: Storage durumunu kontrol et (sadece geliştirme aşamasında)
        if (__DEV__) {
          console.log('🔍 Storage durumu:');
          console.log('  - pushPromptNeverAsk:', storage.getBoolean('pushPromptNeverAsk'));
          console.log('  - pushPromptShown:', storage.getBoolean('pushPromptShown'));
          console.log('  - pushPromptNextShow:', storage.getNumber('pushPromptNextShow'));
          console.log('  - pushPermissionStatus:', storage.getString('pushPermissionStatus'));
        }

        // "Bir daha sorma" seçilmiş mi kontrol et
        const neverAsk = storage.getBoolean('pushPromptNeverAsk');
        if (neverAsk) {
          console.log('🚫 Kullanıcı "bir daha sorma" seçmiş, push prompt gösterilmez');
          return;
        }

        // İzin durumunu kontrol et - önce bunu kontrol et
        const permissionStatus = storage.getString('pushPermissionStatus');
        if (permissionStatus === 'granted') {
          console.log('✅ İzin zaten verilmiş, push prompt gösterilmez');
          return;
        }

        // Database'de bildirimlerin açık olup olmadığını kontrol et
        try {
          const settings = await notificationService.getPushSettings();
          if (settings.pushNotificationsEnabled) {
            console.log('✅ Database\'de bildirimler zaten açık, push prompt gösterilmez');
            // Storage'ı da güncelle
            storage.set('pushPermissionStatus', 'granted');
            storage.set('pushPromptShown', true);
            return;
          }
        } catch (error) {
          console.log('⚠️ Database kontrol hatası, devam ediliyor:', error);
        }

        // Zaten gösterilmiş mi kontrol et
        const alreadyShown = storage.getBoolean('pushPromptShown');
        if (alreadyShown) {
          console.log('🚫 Push prompt zaten gösterilmiş');

          // "Belki Sonra" seçilmiş ve 3 gün geçmiş mi kontrol et
          const nextShowTime = storage.getNumber('pushPromptNextShow');
          if (nextShowTime && Date.now() < nextShowTime) {
            console.log('⏰ Henüz 3 gün geçmemiş, push prompt gösterilmez');
            return;
          }

          // 3 gün geçmiş, tekrar gösterebiliriz
          console.log('✅ 3 gün geçmiş, push prompt tekrar gösterilebilir');
        } else {
          console.log('✅ İlk kez gösteriliyor');
        }

        // Login sonrası 2 saniye bekle, sonra kontrol et
        setTimeout(() => {
          // Diğer modallar açık mı kontrol et
          if (postHomeModalVisible || showCenterCards) {
            console.log('⏰ Diğer modal açık, push prompt bekletiliyor');
            return;
          }

          console.log('✅ Push notification permission prompt gösteriliyor');
          setPushPromptVisible(true);
        }, 2000); // 2 saniye bekle

      } catch (error) {
        console.error('🚨 Push prompt kontrol hatası:', error);
      }
    };

    // Sadece kullanıcı giriş yapmışsa çalıştır
    const checkUserAndShowPrompt = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        checkAndShowPushPrompt();
      }
    };

    checkUserAndShowPrompt();
  }, [postHomeModalVisible, showCenterCards]);

  React.useEffect(() => {
    const fetchAndMaybeShowPostHomeModal = async () => {
      try {
        console.log('🔍 Modal mesajı aranıyor...');

        // 24 saatlik kontrol
        const lastShown = await AsyncStorage.getItem('lastModalShown');
        if (lastShown) {
          const lastShownTime = parseInt(lastShown, 10);
          const now = new Date().getTime();
          const twentyFourHours = 24 * 60 * 60 * 1000; // 24 saat milisaniye cinsinden

          if (now - lastShownTime < twentyFourHours) {
            console.log(
              '⏰ Modal 24 saat içinde gösterilmiş, tekrar gösterilmiyor',
            );
            return;
          }
        }

        const modal = await getActiveMobileModalMessage();
        console.log("📱 API'den dönen modal:", modal);
        console.log('📱 Modal tipi:', typeof modal);
        console.log('📱 Modal keys:', modal ? Object.keys(modal) : 'null');

        if (!modal) {
          console.log('❌ Modal bulunamadı');
          return;
        }

        if (!modal.isActive) {
          console.log('❌ Modal aktif değil, isActive:', modal.isActive);
          return;
        }

        if (!modal._id) {
          console.log('❌ Modal ID yok, _id:', modal._id);
          return;
        }

        console.log('✅ Modal gösteriliyor:', modal.title);
        console.log('✅ Modal message:', modal.message);
        setPostHomeModalId(modal._id);
        setPostHomeModalTitle(modal.title || '');
        setPostHomeModalMessage(modal.message);
        setPostHomeModalVisible(true);
        console.log('✅ Modal state güncellendi');
      } catch (error) {
        console.error('🚨 Modal yükleme hatası:', error);
      }
    };

    fetchAndMaybeShowPostHomeModal();
  }, []);

  const dismissPostHomeModal = async () => {
    try {
      // Modal gösterildiğinde zaman damgasını kaydet
      const now = new Date().getTime();
      await AsyncStorage.setItem('lastModalShown', now.toString());
    } finally {
      setPostHomeModalVisible(false);
      setPostHomeModalMessage(null);
      setPostHomeModalTitle(null);
      setPostHomeModalId(null);

      // Read Report butonuna basınca startup-ideas sayfasına git
      Linking.openURL('https://aikuaiplatform.com/startup-ideas');
    }
  };

  const closeModalOnly = async () => {
    try {
      // Modal gösterildiğinde zaman damgasını kaydet
      const now = new Date().getTime();
      await AsyncStorage.setItem('lastModalShown', now.toString());
    } finally {
      setPostHomeModalVisible(false);
      setPostHomeModalMessage(null);
      setPostHomeModalTitle(null);
      setPostHomeModalId(null);
    }
  };

  // Push permission prompt callback fonksiyonları
  const handlePushPermissionGranted = () => {
    console.log('✅ Push notification permission granted');
    // İsteğe bağlı: burada kullanıcıya başarı mesajı gösterebilir veya analytics gönderebilirsiniz
  };

  const handlePushPermissionDenied = () => {
    console.log('❌ Push notification permission denied or postponed');
    // İsteğe bağlı: analytics gönderebilirsiniz
  };

  const closePushPrompt = () => {
    setPushPromptVisible(false);
  };

  const renderMessageWithLinks = (text: string) => {
    const elements: React.ReactNode[] = [];
    const urlRegex = /((https?:\/\/|www\.)[^\s]+)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(text)) !== null) {
      const matchText = match[0];
      const start = match.index;
      const end = start + matchText.length;
      if (start > lastIndex) {
        elements.push(text.slice(lastIndex, start));
      }
      const url = matchText.startsWith('www.')
        ? `https://${matchText}`
        : matchText;
      elements.push(
        <Text
          key={`${start}-${end}`}
          style={styles.modalLink}
          onPress={() => Linking.openURL(url)}>
          {matchText}
        </Text>,
      );
      lastIndex = end;
    }
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }
    return <Text style={styles.modalMessage}>{elements}</Text>;
  };

  // Güncellenmiş renderCommunitySection
  const renderCommunitySection = () => (
    <View style={styles.communitySection}>
      <Text style={styles.sectionTitle}>Our Community</Text>
      <View style={styles.communityItems}>
        {communityItems.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.communityItem,
              metrics.isTablet
                ? { width: COMMUNITY_ITEM_W }   // tablette dar ve ortalı
                : { width: '100%' },            // telefonda tam genişlik
            ]}
            onPress={() => navigation.navigate(item.nav as any)}>
            <MaterialCommunityIcons
              name={item.icon}
              size={metrics.isTablet ? metrics.tabBar.iconSize : 24}
              color={Colors.lightText}
            />
            <Text style={[styles.communityItemText, metrics.isTablet && { fontSize: metrics.fontSize.lg }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const tooltipCardTop = 120; // Tooltip kartının yukarıdan uzaklığı
  const tooltipCardHeight = 60; // Tooltip kartının yüksekliği

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.gradientBackground}>
      <StatusBar backgroundColor="#1A1E29" barStyle="light-content" />
      <SafeAreaView
        style={[styles.safeArea, { paddingBottom: 90, paddingTop: -10 }]}>
        <View style={[styles.container, { alignItems: 'center' }]}>
          <Surface style={[styles.header, { width: CONTENT_MAX }]} elevation={0}>
            <View style={styles.logoAndTitleContainer}>
              <View style={[styles.logoContainer, { width: LOGO_W, height: LOGO_H }]}>
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

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 10,
              marginTop: -15,
              gap: 10,
              width: CONTENT_MAX,
            }}>
            <TouchableOpacity
              style={[
                styles.tabPill,
                activeTab === 'pulse' ? styles.tabPillActive : styles.tabPillInactive,
              ]}
              onPress={() => setActiveTab('pulse')}>
              <Text
                style={styles.tabText}>
                AI Pulse
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabPill,
                activeTab === 'blog' ? styles.tabPillActive : styles.tabPillInactive,
              ]}
              onPress={() => setActiveTab('blog')}>
              <Text
                style={styles.tabText}>
                AI Blog
              </Text>
            </TouchableOpacity>
          </View>


          {activeTab === 'pulse' ? (
            <AIBlogSection title="" navigation={navigation} height={HERO_HEIGHT} />
          ) : (
            <FeaturedProduct height={HERO_HEIGHT} />
          )}


          <View style={{ width: CONTENT_MAX }}>{renderCommunitySection()}</View>

          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            scrollEnabled={true}
            contentContainerStyle={[
              styles.productsContent,
              { paddingBottom: 100 },
            ]}
            style={styles.productsList}
          />

          {/* Post-home modal (24h cadence) */}
          <Modal
            transparent
            visible={postHomeModalVisible}
            animationType="fade"
            onRequestClose={dismissPostHomeModal}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContainer}>
                {/* Çarpı butonu - sağ üst köşe */}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeModalOnly}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={Colors.lightText}
                  />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>
                  {postHomeModalTitle || 'Bilgi'}
                </Text>
                {postHomeModalMessage
                  ? renderMessageWithLinks(postHomeModalMessage)
                  : null}
                <TouchableOpacity
                  style={styles.modalOkButton}
                  onPress={dismissPostHomeModal}>
                  <Text style={styles.modalOkText}>Read to Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ANİMASYONLU TOOLTIP: Ortada büyük kartlar */}
          {showCenterCards && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
                zIndex: 9999,
                paddingBottom: 0,
              }}>
              {/* Arka plan overlay */}
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(0,0,0,0.92)',
                  zIndex: 1,
                }}
              />
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
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
                      backgroundColor:
                        activeCenterIndex === idx
                          ? 'rgba(59,130,247,0.2)'
                          : 'rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: activeCenterIndex === idx ? 2 : 1,
                      borderColor:
                        activeCenterIndex === idx
                          ? Colors.primary
                          : 'rgba(255,255,255,0.2)',
                      position: 'relative',
                      overflow: 'visible',
                    }}>
                    {activeCenterIndex === idx && (
                      <Animated.Image
                        source={require('../assets/images/Tooltipaihands.png')}
                        style={{
                          width: SCREEN_WIDTH * 0.52,
                          height: SCREEN_WIDTH * 0.52,
                          position: 'absolute',
                          left: SCREEN_WIDTH * 0.5 - (SCREEN_WIDTH * 0.52) / 2,
                          top: tooltipCardTop + tooltipCardHeight - 120, // Kartın hemen altı
                          zIndex: 100,
                          transform: [{ scale: handScale }],
                        }}
                        resizeMode="contain"
                      />
                    )}
                    <View
                      style={{
                        zIndex: 10,
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: 18,
                          textAlign: 'center',
                        }}>
                        {item.label}
                      </Text>
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 12,
                          marginTop: 6,
                          textAlign: 'center',
                        }}>
                        {idx === 0
                          ? 'Tap here to explore startups and add them to your favorites.'
                          : idx === 1
                            ? 'Tap here to explore investor.'
                            : idx === 2
                              ? 'Tap here to explore business'
                              : 'Tap here to explore products and services'}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
                {/* Tüm kartlara tıklama alanı */}
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 3,
                  }}
                  activeOpacity={1}
                  onPress={handleCenterCardPress}
                />
              </View>
            </View>
          )}

          {/* Push Notification Permission Prompt */}
          <PushPermissionPrompt
            visible={pushPromptVisible}
            onClose={closePushPrompt}
            onPermissionGranted={handlePushPermissionGranted}
            onPermissionDenied={handlePushPermissionDenied}
          />
        </View>
      </SafeAreaView>
    </LinearGradient >
  );
};

interface HomeScreenProps {
  onMenuOpen?: () => void;
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingBottom: metrics.bottomSpacing + metrics.tabBar.androidOffset,
  },
  container: {
    flex: 1,
    paddingHorizontal: metrics.isTablet ? metrics.spacing.lg : metrics.spacing.md,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: metrics.isIOS ? 0 : 0,
    marginBottom: metrics.spacing.lg,
    backgroundColor: 'transparent',
  },
  logoAndTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: metrics.spacing.xs,
  },
  logo: {
    width: '100%',   // 120% yerine %100: kabı tamamen doldurur
    height: '100%',
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
    minHeight: CARD_HEIGHT,
    height: CARD_HEIGHT,
    marginBottom: 15,
    alignSelf: 'center',
    borderRadius: metrics.borderRadius.md,
    padding: metrics.spacing.md,
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
    paddingVertical: 10,
    marginTop: -10,
  },
  sectionTitle: {
    fontSize: metrics.isTablet ? metrics.fontSize.xxl : metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.spacing.md,
    marginTop: 0,
    textAlign: 'center',
  },
  communityItems: {
    width: '100%',
    alignItems: 'center',              // çocuklar ortada hizalansın
    // gap kullanmak yerine aşağıda marginBottom veriyoruz (RN sürüm uyumu için)
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: metrics.spacing.sm,
    paddingHorizontal: metrics.isTablet ? metrics.spacing.lg : metrics.spacing.md,
    borderRadius: metrics.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: metrics.spacing.md,
    alignSelf: 'center',
    minHeight: metrics.isTablet ? metrics.moderateScale(64) : metrics.moderateScale(56),
  },
  communityItemText: {
    color: Colors.lightText,
    marginLeft: 12,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    fontSize: 18,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: metrics.isTablet ? 480 : 360,
    backgroundColor: '#23283A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  modalTitle: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.lg,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.md,
    lineHeight: metrics.moderateScale(22, 0.4),
    marginBottom: 16,
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
    padding: 8,
  },
  modalOkButton: {
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: metrics.spacing.lg,
    paddingVertical: metrics.spacing.xs,
    borderRadius: 12,
  },
  modalOkText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: metrics.fontSize.md,
  },
  modalLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  heroCard: {
    alignSelf: 'center',
    borderRadius: metrics.borderRadius.lg,
    overflow: 'hidden',
  },
  tabs: {
    flexDirection: 'row',
    gap: metrics.spacing.sm,
    marginBottom: metrics.spacing.sm,
    marginTop: -metrics.spacing.xs,
  },
  tabPill: {
    flex: 1,
    borderRadius: metrics.borderRadius.xl,
    paddingVertical: metrics.isTablet ? metrics.spacing.sm : metrics.spacing.xs,
    alignItems: 'center',
  },
  tabPillActive: {
    backgroundColor: 'rgba(43,64,99,0.8)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tabPillInactive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  tabText: {
    color: Colors.lightText,
    fontWeight: 'bold',
    fontSize: metrics.isTablet ? metrics.fontSize.lg : metrics.fontSize.md,
  },

});

export default HomeScreen;
