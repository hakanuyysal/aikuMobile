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
import Video from 'react-native-video';
// @ts-ignore
import {version as APP_VERSION} from '../../../package.json';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const SplashScreen: React.FC<Props> = ({navigation}) => {
  const logoScale = useMemo(() => new Animated.Value(0), []);
  const logoOpacity = useMemo(() => new Animated.Value(0), []);
  const logoPosition = useMemo(() => new Animated.Value(0), []);
  const spinnerOpacity = useMemo(() => new Animated.Value(0), []);
  const splashImageOpacity = useMemo(() => new Animated.Value(0), []);
  const overlayOpacity = useMemo(() => new Animated.Value(0.2), []);
  const darkOverlayOpacity = useMemo(() => new Animated.Value(0), []);

  const startAnimations = useCallback(() => {
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
      Animated.parallel([
        Animated.timing(spinnerOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(darkOverlayOpacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    logoOpacity,
    logoScale,
    logoPosition,
    splashImageOpacity,
    spinnerOpacity,
    darkOverlayOpacity,
  ]);

  useEffect(() => {
    startAnimations();

    const timer = setTimeout(() => {
      navigation.navigate('Main');
    }, 5500);

    return () => clearTimeout(timer);
  }, [navigation, startAnimations]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.statusBarBackground}
      />

      {/* Video Arka Plan */}
      <Video
        source={require('../../assets/images/video.mp4')}
        style={styles.backgroundVideo}
        repeat
        muted
        resizeMode="cover"
        rate={1.0}
        ignoreSilentSwitch="obey"
      />

      {/* Mavi Gradient overlay efekti */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}>
        <LinearGradient
          colors={[
            'rgba(0, 153, 255, 0.3)',
            'rgba(0, 153, 255, 0.2)',
            'rgba(0, 153, 255, 0.3)',
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Karanlık overlay efekti */}
      <Animated.View
        style={[
          styles.darkOverlay,
          {
            opacity: darkOverlayOpacity,
          },
        ]}>
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.8)',
            'rgba(0, 0, 0, 0.6)',
            'rgba(0, 0, 0, 0.8)',
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.contentWrapper}>
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{scale: logoScale}, {translateX: logoPosition}],
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
              {opacity: splashImageOpacity},
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
    backgroundColor: Colors.background,
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
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
    zIndex: 3,
  },
  versionText: {
    color: Colors.lightText,
    marginTop: metrics.padding.sm,
    fontSize: 12,
    opacity: 0.9,
  },
});

export default SplashScreen;
