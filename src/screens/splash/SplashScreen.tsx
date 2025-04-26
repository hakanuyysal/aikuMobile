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
  const logoPerspective = useMemo(() => new Animated.Value(850), []);
  const spinnerOpacity = useMemo(() => new Animated.Value(0), []);
  const splashImageOpacity = useMemo(() => new Animated.Value(0), []);
  const spotlightScale = useMemo(() => new Animated.Value(0.5), []);
  const spotlightOpacity = useMemo(() => new Animated.Value(0), []);

  const startAnimations = useCallback(() => {
    Animated.sequence([
      // Önce spot ışık efekti
      Animated.parallel([
        Animated.timing(spotlightOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(spotlightScale, {
          toValue: 1,
          tension: 5,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      // Logo derinlik animasyonu
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 6,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateX, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(logoPerspective, {
          toValue: 1000,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      // Diğer animasyonlar
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
    logoRotateX,
    logoPerspective,
    splashImageOpacity,
    spinnerOpacity,
    spotlightOpacity,
    spotlightScale,
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

      {/* Spot Işık Efekti */}
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
            'rgba(0, 153, 255, 0.4)',
            'rgba(0, 153, 255, 0.1)',
            'rgba(0, 153, 255, 0)',
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
                  {perspective: logoPerspective},
                  {rotateX: logoRotateX.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })},
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
  spotlight: {
    position: 'absolute',
    width: WIDTH * 2,
    height: WIDTH * 2,
    top: -WIDTH / 2,
    left: -WIDTH / 2,
    zIndex: 1,
  },
  spotlightGradient: {
    width: '100%',
    height: '100%',
    borderRadius: WIDTH,
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
