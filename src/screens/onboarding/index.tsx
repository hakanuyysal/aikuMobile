import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

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
    button: 'Start Your Journey',
  },
  {
    key: '2',
    title: 'How It Works?',
    description: '',
    button: 'Next',
  },
  {
    key: '3',
    title: 'Elevate Your AI Startup\'s Visibility and Growth Potential',
    description: '',
    button: 'Next',
  },
  {
    key: '4',
    title: 'Why Choose Aiku AI Startup Platform?',
    description: '',
    button: 'Get Started',
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hologramOpacity = useRef(new Animated.Value(0)).current;
  const hologramScale = useRef(new Animated.Value(0.7)).current;
  const gradientPosition = useRef(new Animated.Value(1)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const scanlinePosition = useRef(new Animated.Value(0)).current;
  const portalScale = useRef(new Animated.Value(0.2)).current;
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const ringAnimations = useRef(
    Array(5).fill(0).map(() => new Animated.Value(0))
  ).current;
  const ringRotations = useRef(
    Array(5).fill(0).map(() => new Animated.Value(0))
  ).current;

  const startHologramAnimation = useCallback(() => {
    hologramOpacity.setValue(0);
    hologramScale.setValue(0.7);
    gradientPosition.setValue(1);
    scanlinePosition.setValue(0);
    portalScale.setValue(0.2);
    ringAnimations.forEach((anim) => anim.setValue(0));
    ringRotations.forEach((anim) => anim.setValue(0));

    const ringTranslationSequence = ringAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: index * 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      })
    );

    const ringRotationSequence = ringRotations.map((anim, index) =>
      Animated.loop(
        Animated.timing(anim, {
          toValue: 2 * Math.PI,
          duration: 5000 + index * 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      )
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
      ...ringTranslationSequence,
    ]).start(({ finished }) => {
      if (finished) {
        requestAnimationFrame(() => {
          setAnimationCompleted(true);
        });
      }

      ringRotationSequence.forEach((anim) => anim.start());

      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnimations[0], {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          Animated.timing(ringAnimations[0], {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        ])
      ).start();
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
  }, [
    hologramOpacity,
    hologramScale,
    gradientPosition,
    glowAnimation,
    scanlinePosition,
    portalScale,
    ringAnimations,
    ringRotations,
    setAnimationCompleted,
  ]);

  useEffect(() => {
    if (currentIndex >= 0) {
      setAnimationCompleted(false);
      startHologramAnimation();
    }
  }, [currentIndex, startHologramAnimation]);

  useEffect(() => {
    startHologramAnimation();
  }, [startHologramAnimation]);

  const onNext = (buttonText: string) => {
    if (buttonText === 'Get Started') {
      navigation.navigate('Main');
    } else if (currentIndex < slides.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex });
    }
  };

  const onSkip = () => {
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

  const gradientColor1 = glowAnimation.interpolate({
    inputRange: [0.3, 1],
    outputRange: ['rgba(0, 145, 255, 0.2)', 'rgba(0, 183, 255, 0.3)'],
  });

  const gradientColor2 = glowAnimation.interpolate({
    inputRange: [0.3, 1],
    outputRange: ['rgba(40, 90, 140, 0.5)', 'rgba(0, 215, 255, 0.6)'],
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
                transform: [{ scale: portalScale }, { rotateX: '70deg' }],
              },
            ]}
          >
            {ringAnimations.map((ringAnim, ringIndex) => (
              <Animated.View
                key={`ring-${ringIndex}`}
                style={[
                  styles.portalRing,
                  {
                    transform: [
                      { scale: 1 - ringIndex * 0.1 },
                      { scaleY: 0.35 },
                      {
                        translateY: ringAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [width * 0.4, -ringIndex * 30],
                        }),
                      },
                      {
                        rotateY: ringRotations[ringIndex].interpolate({
                          inputRange: [0, 2 * Math.PI],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                    opacity: ringAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.9, 1],
                    }),
                    borderWidth: 12 - ringIndex * 2,
                  },
                ]}
              />
            ))}
            <Animated.View
              style={[
                styles.portalCenter,
                {
                  opacity: Animated.add(
                    0.5,
                    Animated.multiply(glowAnimation, 0.5)
                  ),
                },
              ]}
            />
            {[...Array(10)].map((_, i) => (
              <Animated.View
                key={`particle-${i}`}
                style={[
                  styles.portalParticle,
                  {
                    left: `${35 + Math.sin(i * 36) * 15}%`,
                    top: `${35 + Math.cos(i * 36) * 15}%`,
                    transform: [
                      {
                        scale: Animated.multiply(
                          glowAnimation,
                          0.5 + Math.sin(i) * 0.5
                        ),
                      },
                    ],
                    opacity: Animated.multiply(
                      glowAnimation,
                      0.4 + Math.sin(i * 0.8) * 0.6
                    ),
                  },
                ]}
              />
            ))}
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
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: gradientColor1,
                    opacity: glowAnimation,
                    transform: [
                      { translateY: Animated.multiply(gradientPosition, 100) },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={{
                  ...styles.gradientOverlay,
                  backgroundColor: gradientColor2,
                  opacity: glowAnimation,
                  transform: [
                    { translateY: Animated.multiply(gradientPosition, 150) },
                  ],
                }}
              />
              {item.button !== 'Get Started' && (
                <Image
                  source={require('../../assets/images/hands.png')}
                  style={styles.handsImage}
                  resizeMode="contain"
                />
              )}
              <Text style={[styles.title, styles.hologramText]}>
                {item.title}
              </Text>
            </Animated.View>
          </Animated.View>
        </>
      )}

      {animationCompleted && currentIndex === index && (
        <View style={styles.controlsContainer}>
          {item.button === 'Get Started' ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => onNext(item.button)}
            >
              <Text style={styles.buttonText}>{item.button}</Text>
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
      <Image
        source={require('../../assets/images/onboardinghand.png')}
        style={styles.phoneImage}
        resizeMode="cover"
      />
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
  phoneImage: {
    width: width,
    height: height,
    position: 'absolute',
    marginTop: 100,
  },
  screenOverlay: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.10,
    width: width * 0.80,
    height: height * 0.80,
  },
  slideContainer: {
    width: width * 0.79,
    height: height * 0.65,
    overflow: 'hidden',
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginTop: 0.5,
    paddingRight: 5.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 26,
  },
  description: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0057ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  gradientBackground: {
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logo: {
    position: 'absolute',
    bottom: height * 0.13,
    alignSelf: 'center',
    width: width * 0.3,
    height: height * 0.1,
    transform: [{ rotateZ: '-3deg' }],
  },
  handsImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
    marginTop: 100,
  },
  contentHologramContainer: {
    position: 'absolute',
    width: width * 0.70,
    height: height * 0.45,
    alignSelf: 'center',
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: height * 0.2,
    marginRight: -40,
  },
  hologramOuterBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 235, 255, 0.5)',
    backgroundColor: 'transparent',
    borderRadius: 5,
    zIndex: 1,
    overflow: 'hidden',
  },
  hologramScanline: {
    position: 'absolute',
    width: '200%',
    height: 2,
    backgroundColor: 'rgba(0, 235, 255, 0.7)',
    left: '-50%',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 5,
  },
  hologramContent: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
    backgroundColor: 'rgba(0, 60, 120, 0.1)',
    borderWidth: 0,
  },
  hologramText: {
    color: '#FFF',
    textShadowColor: 'rgba(59, 210, 247, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 100,
  },
  swipeContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeText: {
    color: '#CCC',
    fontSize: 14,
    marginRight: 8,
    marginBottom: 80,
    fontWeight: '600',
  },
  arrow: {
    color: '#CCC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 80,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
  skipContainer: {
    position: 'absolute',
    top: -50,
    right: -20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  skipText: {
    color: '#CCC',
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
    zIndex: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerScanline: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(0, 235, 255, 0.6)',
    borderRadius: 5,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },
  portalContainer: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    zIndex: 3,
    alignSelf: 'center',
    bottom: -60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -40,
  },
  portalRing: {
    width: '110%',
    height: '110%',
    borderRadius: width * 3,
    borderColor: 'rgba(0, 220, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e5ff',
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 25,
  },
  portalCenter: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(0, 150, 255, 0.4)',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
    transform: [{ scaleY: 0.35 }],
  },
  portalParticle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
});