import React, {useEffect, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  ActivityIndicator,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
// @ts-ignore
import {version as APP_VERSION} from '../../../package.json';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const {width: WIDTH} = Dimensions.get('window');

const SplashScreen: React.FC<Props> = ({navigation}) => {
  const logoScale = useMemo(() => new Animated.Value(0.1), []);
  const logoOpacity = useMemo(() => new Animated.Value(0), []);
  const logoPosition = useMemo(() => new Animated.Value(0), []);
  const logoRotateX = useMemo(() => new Animated.Value(45), []);
  const spinnerOpacity = useMemo(() => new Animated.Value(0), []);
  const splashImageOpacity = useMemo(() => new Animated.Value(0), []);
  const spotlightScale = useMemo(() => new Animated.Value(0.5), []);
  const spotlightOpacity = useMemo(() => new Animated.Value(0), []);
  const backgroundGradientOpacity = useMemo(() => new Animated.Value(0), []);
  const particlesOpacity = useMemo(() => new Animated.Value(0), []);
  const splashSpotlightScale = useMemo(() => new Animated.Value(0.5), []);
  const splashSpotlightOpacity = useMemo(() => new Animated.Value(0), []);

  const startAnimations = useCallback(() => {
    Animated.sequence([
      // Particles fade in
      Animated.timing(particlesOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Logo ve spot ışık efekti
      Animated.parallel([
        // Logo animasyonları
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 15,
            friction: 7,
            useNativeDriver: true,
          }),
          // Logo'nun aşağıdan yukarı çıkması
          Animated.timing(logoRotateX, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        // Spot ışık efekti
        Animated.sequence([
          Animated.parallel([
            Animated.timing(spotlightOpacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.spring(spotlightScale, {
              toValue: 1.3,
              tension: 4,
              friction: 3,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(spotlightOpacity, {
            toValue: 0,
            duration: 800,
            delay: 500,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(200),
      // İkinci resim ve efektleri
      Animated.parallel([
        Animated.spring(logoPosition, {
          toValue: -metrics.getWidthPercentage(22),
          tension: 25,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(splashImageOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // İkinci resim spot efekti
        Animated.sequence([
          Animated.timing(splashSpotlightOpacity, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(splashSpotlightScale, {
            toValue: 1.15,
            tension: 3,
            friction: 3,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(200),
      Animated.spring(spinnerOpacity, {
        toValue: 1,
        tension: 20,
        friction: 5,
        useNativeDriver: true,
      }),
      // Background gradient fade in - en son
      Animated.timing(backgroundGradientOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    logoOpacity,
    logoScale,
    logoPosition,
    logoRotateX,
    splashImageOpacity,
    spinnerOpacity,
    spotlightOpacity,
    spotlightScale,
    backgroundGradientOpacity,
    particlesOpacity,
    splashSpotlightOpacity,
    splashSpotlightScale,
  ]);

  useEffect(() => {
    startAnimations();

    const timer = setTimeout(() => {
      // isAuthenticated false olduğu için direkt Auth'a yönlendir
      navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    }, 10500);

    return () => clearTimeout(timer);
  }, [navigation, startAnimations]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.statusBarBackground}
        translucent
      />

      {/* Animated Background Gradient */}
      <Animated.View style={[styles.backgroundGradient, { opacity: backgroundGradientOpacity }]}>
        <LinearGradient
          colors={[
            '#1A1E29',
            '#1A1E29',
            '#3B82F780',
            '#3B82F740',
          ]}
          locations={[0, 0.3, 0.6, 0.9]}
          style={StyleSheet.absoluteFill}
          start={{x: 0, y: 0}}
          end={{x: 2, y: 1}}
        />
      </Animated.View>

      {/* Particles Effect */}
      <Animated.View style={[styles.particles, { opacity: particlesOpacity }]}>
        {Array(20).fill(0).map((_, index) => (
          <View
            key={index}
            style={[
              styles.particle,
              {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: [{scale: Math.random() * 0.5 + 0.5}],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Enhanced Spotlight Effect */}
      <Animated.View
        style={[
          styles.spotlight,
          {
            opacity: spotlightOpacity,
            transform: [{scale: spotlightScale}],
          },
        ]}>
        <LinearGradient
          colors={[
            'rgba(0, 122, 255, 0.5)',
            'rgba(0, 122, 255, 0.2)',
            'rgba(0, 122, 255, 0)',
          ]}
          style={styles.spotlightGradient}
          start={{x: 0.5, y: 0.5}}
          end={{x: 1, y: 1}}
        />
      </Animated.View>

      <View style={styles.contentWrapper}>
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  {
                    translateY: logoRotateX.interpolate({
                      inputRange: [0, 45],
                      outputRange: [0, 50], // Daha az yükseliş
                    }),
                  },
                  {scale: logoScale},
                  {translateX: logoPosition},
                ],
              },
            ]}>
            <Image
              source={require('../../../src/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.splashImageContainer,
              {
                opacity: splashImageOpacity,
                transform: [{scale: splashSpotlightScale}],
              },
            ]}>
            <Image
              source={require('../../../src/assets/images/splash.png')}
              style={styles.splashImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </View>
      <Animated.View
        style={[styles.bottomContainer, {opacity: spinnerOpacity}]}>
        <ActivityIndicator size="large" color={Colors.lightText} />
        <Text style={styles.versionText}>v{APP_VERSION}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1E29',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: 'rgba(40, 80, 150, 0.4)',  // Daha parlak mavi parçacıklar
    borderRadius: 1.5,
  },
  spotlight: {
    position: 'absolute',
    width: WIDTH * 3,
    height: WIDTH * 3,
    top: -WIDTH,
    left: -WIDTH,
    zIndex: 1,
  },
  spotlightGradient: {
    width: '100%',
    height: '100%',
    borderRadius: WIDTH * 1.5,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    width: metrics.WIDTH,
    height: metrics.getWidthPercentage(40),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  logoContainer: {
    width: metrics.getWidthPercentage(45),
    height: metrics.getWidthPercentage(45),
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: metrics.padding.md,
    shadowColor: Colors.lightText,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  splashImageContainer: {
    width: metrics.getWidthPercentage(30),
    height: metrics.getWidthPercentage(30),
    position: 'absolute',
    top:metrics.getWidthPercentage(5),
    right: metrics.getWidthPercentage(23),
    alignItems: 'center',
    justifyContent: 'center',
    padding: metrics.padding.md,
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: metrics.padding.xl * 2,
    alignItems: 'center',
    width: '100%',
    zIndex: 3,
    backgroundColor: 'transparent',
  },
  versionText: {
    color: Colors.lightText,
    marginTop: metrics.padding.sm,
    fontSize: 12,
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  splashSpotlight: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    top: '-25%',
    left: '-25%',
    zIndex: 1,
  },
  splashSpotlightGradient: {
    width: '100%',
    height: '100%',
    borderRadius: WIDTH,
  },
});

export default SplashScreen;
