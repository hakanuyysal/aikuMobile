import React, { useRef, useState } from 'react';
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

interface OnboardingScreenProps {
  onComplete?: () => void;
}

const slides = [
  {
    key: '1',
    title: 'Unleash the potential of your AI startup.',
    description:
      'Empower your venture with our dedicated marketplace.\nJoin a community that prioritizes growth and innovation.',
    button: 'Start Your Journey',
  },
  {
    key: '2',
    title: 'How It Works?',
    description:
      'Sign Up – Create your profile as a business, startup, or investor and set your preferences.\n\nDiscover – Explore cutting-edge AI products, promising startups, and high-potential investment opportunities tailored to your needs.\n\nConnect – Engage through our seamless messaging and meeting scheduling tools to build valuable collaborations.\n\nGrow – Implement AI-driven solutions, scale your business, and maximize your investments with the right partnerships',
    button: 'Next',
  },
  {
    key: '3',
    title: 'Elevate Your AI Startup\'s Visibility and Growth Potential',
    description:
      'Gain access to essential tools with the best subscribe plan for you.',
    button: 'Next',
  },
  {
    key: '4',
    title: 'Why Choose Aiku AI Startup Platform?',
    description:
      'Aiku AI Startup Platform connects startups operating in AI products, ensuring that all entities are accessible under one roof.\n\nOur platform provides crucial links to tools, mentorship, and collaborative opportunities, empowering founders to drive innovation and growth in the AI space.',
    button: 'Get Started',
  },
];

const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onNext = (buttonText: string) => {
    if (buttonText === 'Get Started') {
      if (onComplete) {
        onComplete();
      }
      navigation.navigate('Main');
    } else if (currentIndex < slides.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex });
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.slideContainer}>
      <LinearGradient
        colors={['#0A0D14', '#1A2A44']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.slide}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <TouchableOpacity style={styles.button} onPress={() => onNext(item.button)}>
          <Text style={styles.buttonText}>{item.button}</Text>
        </TouchableOpacity>
      </LinearGradient>
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
        source={require('../assets/images/onboarding.png')}
        style={styles.phoneImage}
        resizeMode="cover"
      />

      <View style={styles.screenOverlay}>
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
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
      </View>

      {/* Aiku Logo at the bottom */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
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
  },
  screenOverlay: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.10,
    width: width * 0.80,
    height: height * 0.80,
    transform: [{ rotateZ: '-1deg' }],
  },
  slideContainer: {
    width: width * 0.79,
    height: height * 0.65,
    overflow: 'hidden',
    marginTop: 0.5,
  },
  slide: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#0057ff',
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  gradientBackground: {
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logo: {
    position: 'absolute',
    bottom: height * 0.13,
    alignSelf: 'center',
    width: width * 0.3,
    height: height * 0.1,
    transform: [{ rotateZ: '-3deg' }],
  },
});