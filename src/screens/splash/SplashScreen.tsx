import React, {useEffect, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  ActivityIndicator,
  Text,
} from 'react-native';
import {Colors} from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const APP_VERSION = process.env.APP_VERSION;

const SplashScreen: React.FC<Props> = ({navigation}) => {
  const logoScale = useMemo(() => new Animated.Value(0), []);
  const logoOpacity = useMemo(() => new Animated.Value(0), []);
  const logoPosition = useMemo(() => new Animated.Value(0), []);
  const backgroundOpacity = useMemo(() => new Animated.Value(0), []);
  const spinnerOpacity = useMemo(() => new Animated.Value(0), []);
  const splashImageOpacity = useMemo(() => new Animated.Value(0), []);
  const gradientPosition1 = useMemo(() => new Animated.Value(0), []);
  const gradientPosition2 = useMemo(() => new Animated.Value(0), []);
  const gradientRotation = useMemo(() => new Animated.Value(0), []);

  const startAnimations = useCallback(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(gradientPosition1, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(gradientPosition1, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(gradientPosition2, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(gradientPosition2, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(gradientRotation, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(gradientRotation, {
            toValue: 0,
            duration: 10000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 10,
          friction: 2,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(500),

      Animated.parallel([
        Animated.timing(logoPosition, {
          toValue: -metrics.getWidthPercentage(22),
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(splashImageOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(300),

      Animated.timing(spinnerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    backgroundOpacity,
    logoOpacity,
    logoScale,
    logoPosition,
    splashImageOpacity,
    spinnerOpacity,
    gradientPosition1,
    gradientPosition2,
    gradientRotation,
  ]);

  useEffect(() => {
    startAnimations();

    const timer = setTimeout(() => {
      navigation.navigate('Main');
    }, 30500);

    return () => clearTimeout(timer);
  }, [navigation, startAnimations]);

  const spin = gradientRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.statusBarBackground}
      />
      {/* Ana gradient arka plan */}
      <LinearGradient
        colors={[
          Colors.background,
          Colors.primary + '20',
          Colors.background,
          Colors.secondary + '15',
          Colors.background,
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.gradientBackground}
      />
      {/* Hareketli gradient katmanı 1 */}
      <Animated.View
        style={[
          styles.gradientOverlay,
          {
            opacity: 0.4,
            transform: [
              {
                translateY: gradientPosition1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, metrics.HEIGHT],
                }),
              },
              {rotate: spin},
            ],
          },
        ]}>
        <LinearGradient
          colors={[
            'transparent',
            Colors.primary + '30',
            Colors.secondary + '30',
            'transparent',
          ]}
          style={StyleSheet.absoluteFill}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />
      </Animated.View>
      {/* Hareketli gradient katmanı 2 */}
      <Animated.View
        style={[
          styles.gradientOverlay,
          {
            opacity: 0.3,
            transform: [
              {
                translateY: gradientPosition2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [metrics.HEIGHT * -1, 0],
                }),
              },
              {rotate: spin},
            ],
          },
        ]}>
        <LinearGradient
          colors={[
            'transparent',
            Colors.secondary + '20',
            Colors.primary + '20',
            'transparent',
          ]}
          style={StyleSheet.absoluteFill}
          start={{x: 1, y: 0}}
          end={{x: 0, y: 1}}
        />
      </Animated.View>
      {/* Işık efekti katmanı */}
      <Animated.View
        style={[
          styles.lightEffect,
          {
            transform: [
              {
                rotate: gradientRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-45deg', '45deg'],
                }),
              },
            ],
          },
        ]}>
        <LinearGradient
          colors={['transparent', Colors.primary + '05', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{x: 0, y: 0}}
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
                    scale: logoScale,
                  },
                  {
                    translateX: logoPosition,
                  },
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
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.versionText}>v{APP_VERSION}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: metrics.HEIGHT * 2,
  },
  lightEffect: {
    ...StyleSheet.absoluteFillObject,
    height: metrics.HEIGHT * 3,
    width: metrics.WIDTH * 3,
    position: 'absolute',
    left: -metrics.WIDTH,
    top: -metrics.HEIGHT,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: metrics.WIDTH,
    height: metrics.getWidthPercentage(40),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoContainer: {
    width: metrics.getWidthPercentage(45),
    height: metrics.getWidthPercentage(45),
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: metrics.padding.md,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  splashImageContainer: {
    width: metrics.getWidthPercentage(35),
    height: metrics.getWidthPercentage(35),
    position: 'absolute',
    right: metrics.getWidthPercentage(20),
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
  },
  versionText: {
    color: Colors.lightText,
    marginTop: metrics.padding.sm,
    fontSize: 12,
    opacity: 0.7,
  },
});

export default SplashScreen;
