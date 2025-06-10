import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  Easing,
  Dimensions,
  Image,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from 'constants/colors';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

type OnboardingNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

const slides = [
  {
    key: '1',
    title: 'Unleash the potential of your AI startup.',
    description: '',
  },
  {
    key: '2',
    title: 'Provides access to key tools, mentorship, and collaboration opportunities to support innovation and growth.',
    description: '',
  },
  {
    key: '3',
    title: "Elevate Your AI Startup's Visibility and Growth Potential",
    description: '',
    button: 'Get Started' // Son karta button özelliği ekle
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
  navigation: any;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, navigation }) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const hologramOpacity = useRef(new Animated.Value(0)).current;
  const hologramScale = useRef(new Animated.Value(0.7)).current;
  const gradientPosition = useRef(new Animated.Value(1)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const scanlinePosition = useRef(new Animated.Value(0)).current;
  const portalScale = useRef(new Animated.Value(0.2)).current;
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const ringAnimations = useRef(
    Array(3).fill(0).map(() => new Animated.Value(0))
  ).current;
  const ringGlowAnimations = useRef(
    Array(3).fill(0).map(() => new Animated.Value(0.3))
  ).current;
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logoScale = useRef(new Animated.Value(0.8)).current;

  const startTypewriterEffect = useCallback((text: string) => {
    // Validate text input
    if (!text || typeof text !== 'string') {
      setDisplayedText('');
      setIsTypingComplete(true);
      return;
    }

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setDisplayedText('');
    setIsTypingComplete(false);
    let index = 0;

    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        setIsTypingComplete(true);
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      }
    }, 50);
  }, []);

  const startHologramAnimation = useCallback(() => {
    hologramOpacity.setValue(0);
    hologramScale.setValue(0.7);
    gradientPosition.setValue(1);
    scanlinePosition.setValue(0);
    portalScale.setValue(0.2);
    ringAnimations.forEach((anim) => anim.setValue(0));
    ringGlowAnimations.forEach((anim) => anim.setValue(0.3));

    const ringSequence = ringAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: index * 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      })
    );

    Animated.parallel([
      Animated.timing(hologramOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(hologramScale, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(gradientPosition, {
        toValue: 0,
        duration: 2500,
        useNativeDriver: false,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(scanlinePosition, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(portalScale, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      ...ringSequence,
    ]).start(({ finished }) => {
      if (finished) {
        requestAnimationFrame(() => {
          setAnimationCompleted(true);
        });
      }
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: false,
        }),
      ])
    ).start();

    ringGlowAnimations.forEach((anim) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 1500,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: false,
          }),
        ])
      ).start();
    });

    // Logo animasyonu için
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.3,
          duration: 2000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.8,
          duration: 2000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [
    hologramOpacity,
    hologramScale,
    gradientPosition,
    glowAnimation,
    scanlinePosition,
    portalScale,
    ringAnimations,
    ringGlowAnimations,
    setAnimationCompleted,
  ]);

  useEffect(() => {
    if (currentIndex >= 0) {
      setAnimationCompleted(false);
      startHologramAnimation();
      startTypewriterEffect(slides[currentIndex].title);
    }
  }, [currentIndex, startHologramAnimation, startTypewriterEffect]);

  useEffect(() => {
    startHologramAnimation();
    startTypewriterEffect(slides[0].title);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [startHologramAnimation, startTypewriterEffect]);

  const onNext = (buttonText: string) => {
    if (buttonText === 'Get Started') {
      onComplete();
      navigation.navigate('Auth');
    } else if (currentIndex < slides.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex });
    }
  };

  const onSkip = () => {
    onComplete();
    navigation.navigate('Auth');
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      scanlinePosition.setValue(0);
      setAnimationCompleted(false);
      startHologramAnimation();
    }
  };

  // Gradient renk geçişlerini güncelle
  const gradientColor1 = glowAnimation.interpolate({
    inputRange: [0.3, 1],
    outputRange: ['rgba(26, 115, 232, 0.1)', 'rgba(26, 115, 232, 0.4)'],
  });

  const gradientColor2 = glowAnimation.interpolate({
    inputRange: [0.3, 1],
    outputRange: ['rgba(26, 115, 232, 0)', 'rgba(26, 115, 232, 0.2)'],
  });

  const renderItem = ({ item, index }: any) => (
    <View style={styles.slideContainer}>
      {currentIndex === index && (
        <>
          <Animated.View
            style={[
              styles.portalContainer,
              {
                opacity: ringAnimations[0],
              },
            ]}
          >
            {/* Bottom portal (smallest) */}
            <Animated.View
              style={[
                styles.portalRing,
                {
                  transform: [
                    { scale: 0.7 },
                    { scaleY: 0.1 },
                    {
                      translateY: ringAnimations[0].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -height * 0.15],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    borderRadius: width * 0.5,
                    borderWidth: 8,
                    borderColor: ringGlowAnimations[0].interpolate({
                      inputRange: [0.3, 1],
                      outputRange: ['rgba(26, 115, 232, 0.2)', 'rgba(26, 115, 232, 0.7)'],
                    }),
                    opacity: ringGlowAnimations[0],
                    transform: [
                      {
                        scale: ringGlowAnimations[0].interpolate({
                          inputRange: [0.3, 1],
                          outputRange: [0.98, 1.02],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.portalCenter} />
            </Animated.View>

            {/* Middle portal */}
            <Animated.View
              style={[
                styles.portalRing,
                {
                  transform: [
                    { scale: 0.85 },
                    { scaleY: 0.1 },
                    {
                      translateY: ringAnimations[1].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -height * 0.40],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    borderRadius: width * 0.5,
                    borderWidth: 10,
                    borderColor: ringGlowAnimations[1].interpolate({
                      inputRange: [0.3, 1],
                      outputRange: ['rgba(26, 115, 232, 0.2)', 'rgba(26, 115, 232, 0.7)'],
                    }),
                    opacity: ringGlowAnimations[1],
                    transform: [
                      {
                        scale: ringGlowAnimations[1].interpolate({
                          inputRange: [0.3, 1],
                          outputRange: [0.98, 1.02],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.portalCenter} />
            </Animated.View>

            {/* Top portal (largest) */}
            <Animated.View
              style={[
                styles.portalRing,
                {
                  transform: [
                    { scale: 1 },
                    { scaleY: 0.1 },
                    {
                      translateY: ringAnimations[2].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -height * 0.65],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    borderRadius: width * 0.5,
                    borderWidth: 12,
                    borderColor: ringGlowAnimations[2].interpolate({
                      inputRange: [0.3, 1],
                      outputRange: ['rgba(26, 115, 232, 0.2)', 'rgba(26, 115, 232, 0.7)'],
                    }),
                    opacity: ringGlowAnimations[2],
                    transform: [
                      {
                        scale: ringGlowAnimations[2].interpolate({
                          inputRange: [0.3, 1],
                          outputRange: [0.98, 1.02],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.portalCenter} />
            </Animated.View>
          </Animated.View>

          {/* Blue light effect from bottom to portal */}
          <Animated.View
            style={[
              styles.blueLightEffect,
              {
                opacity: glowAnimation,
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(26, 115, 232, 0.7)', 'rgba(26, 115, 232, 0)']}
              locations={[0, 1]}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={styles.blueLightGradient}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.outerScanlineContainer,
              {
                opacity: scanlinePosition.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1, 0],
                }),
                transform: [
                  {
                    translateY: scanlinePosition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height * 0.6, -height * 0.05],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.outerScanline} />
          </Animated.View>

          <Animated.View
            style={[
              styles.contentHologramContainer,
              {
                opacity: hologramOpacity,
                transform: [{ scale: hologramScale }],
              },
            ]}
          >
            <Animated.View style={[styles.hologramOuterBorder]}>
              <Animated.View
                style={[
                  styles.hologramScanline,
                  {
                    opacity: scanlinePosition.interpolate({
                      inputRange: [0, 0.4, 0.5, 0.9, 1],
                      outputRange: [0, 0, 1, 1, 0],
                    }),
                    transform: [
                      {
                        translateY: scanlinePosition.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [height * 0.45, height * 0.2, 0],
                        }),
                      },
                      {
                        scaleY: scanlinePosition.interpolate({
                          inputRange: [0.3, 0.5, 0.7],
                          outputRange: [5, 1, 1],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </Animated.View>
            <Animated.View style={styles.hologramContent}>
              <Animated.View
                style={{
                  transform: [{ scale: logoScale }],
                  opacity: 0.9,
                }}
              >
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={{
                    width: 80,
                    height: 80,
                    marginBottom: 20,
                  }}
                  resizeMode="contain"
                />
              </Animated.View>
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: gradientColor1,
                    opacity: glowAnimation,
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    position: 'absolute',
                  },
                ]}
              />
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: gradientColor2,
                    opacity: glowAnimation,
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    position: 'absolute',
                  },
                ]}
              />
              <Text style={[styles.title, styles.hologramText]}>
                {displayedText}
              </Text>
            </Animated.View>
          </Animated.View>
        </>
      )}

      {animationCompleted && currentIndex === index && (
        <View style={styles.controlsContainer}>
          {index === slides.length - 1 ? (
            <TouchableOpacity
              style={styles.button}
              onPress={onSkip} // Skip ile aynı fonksiyonu kullan
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.swipeContainer}>
              <Text style={styles.swipeText}>Swipe</Text>
              <Text style={styles.arrow}>{'>'}</Text>
            </View>
          )}
        </View>
      )}
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
      <View style={styles.screenOverlay}>
        <TouchableOpacity style={styles.skipContainer} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
          <Text style={styles.skipText}>{'>'}</Text>
        </TouchableOpacity>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          onMomentumScrollEnd={handleScroll}
          renderItem={renderItem}
          initialScrollIndex={0}
          getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
        />
      </View>
    </LinearGradient>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenOverlay: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Orbitron-Regular',
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  button: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Orbitron-Regular',
    fontWeight: '600',
    fontSize: 14,
  },
  contentHologramContainer: {
    position: 'absolute',
    width: width * 0.70,
    height: height * 0.55,
    alignSelf: 'center',
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
    top: height * 0.15,
  },
  hologramOuterBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 5,
    zIndex: 1,
    overflow: 'hidden',
  },
  hologramScanline: {
    position: 'absolute',
    width: '200%',
    height: 2,
    backgroundColor: 'rgba(26, 115, 232, 0.7)',
    left: '-50%',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 5,
  },
  hologramContent: {
    width: '100%',
    height: '100%',
    borderRadius: 0, // Köşe yuvarlaklığını kaldır
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0, // Padding'i kaldır
    position: 'relative',
    backgroundColor: 'transparent', // Arka plan rengini şeffaf yap
    borderWidth: 1,
    borderColor: 'rgba(26, 115, 232, 0.2)',
    backdropFilter: 'blur(8px)',
    paddingLeft: 20,
  },
  hologramText: {
    color: '#FFF',
    fontFamily: 'Orbitron-Regular',
    textShadowColor: 'rgba(26, 115, 232, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 18,
  },
  swipeContainer: {
    position: 'absolute',
    bottom: 250,
    right: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeText: {
    color: '#CCC',
    fontFamily: 'Orbitron-Regular',
    fontSize: 14,
    marginRight: 8,
    fontWeight: '600',
  },
  arrow: {
    color: '#CCC',
    fontFamily: 'Orbitron-Regular',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 6,
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  skipText: {
    color: '#CCC',
    fontFamily: 'Orbitron-Regular',
    fontSize: 14,
    marginRight: 8,
    fontWeight: '600',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  outerScanlineContainer: {
    position: 'absolute',
    width: width * 0.70,
    height: 10,
    alignSelf: 'center',
    zIndex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerScanline: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(26, 115, 232, 0.7)',
    borderRadius: 5,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },
  portalContainer: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    zIndex: 15,
    alignSelf: 'center',
    top: height * 0.67,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portalRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#40E0D0',
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 25,
  },
  portalCenter: {
    width: '60%',
    height: '60%',
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(26, 115, 232, 0.7)',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
    transform: [{ scaleY: 0.1 }],
  },
  blueLightEffect: {
    position: 'absolute',
    width: width,
    height: height * 0.20,
    bottom: 0,
    zIndex: 1,
    alignItems: 'center',
  },
  blueLightGradient: {
    width: '10%',
    height: '100%',
  },
});