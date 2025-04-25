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

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const APP_VERSION = process.env.APP_VERSION;

const SplashScreen: React.FC<Props> = ({navigation}) => {
  const logoScale = useMemo(() => new Animated.Value(0), []);
  const logoOpacity = useMemo(() => new Animated.Value(0), []);
  const logoPosition = useMemo(() => new Animated.Value(0), []);
  const spinnerOpacity = useMemo(() => new Animated.Value(0), []);
  const splashImageOpacity = useMemo(() => new Animated.Value(0), []);
  const overlayOpacity = useMemo(() => new Animated.Value(0.4), []);

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
      Animated.timing(spinnerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    logoOpacity,
    logoScale,
    logoPosition,
    splashImageOpacity,
    spinnerOpacity,
  ]);

  useEffect(() => {
    startAnimations();

    const timer = setTimeout(() => {
      navigation.navigate('Main');
    }, 35500);

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

      {/* Flu overlay efekti */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}>
        <LinearGradient
          colors={[Colors.background + 'CC', Colors.background + '99']}
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
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
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
