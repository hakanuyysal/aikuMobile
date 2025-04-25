import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import {Colors} from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_SPACING = 12;
const CARD_OFFSET = (SCREEN_WIDTH - CARD_WIDTH) / 2.5;

interface PlanProps {
  title: string;
  subtitle: string;
  price: number;
  features: string[];
  isYearly?: boolean;
  index: number;
  scrollX: Animated.Value;
}

interface CartScreenProps {
  navigation: DrawerNavigationProp<any>;
}

const PlanCard: React.FC<PlanProps> = ({
  title,
  subtitle,
  price,
  features,
  isYearly,
  index,
  scrollX,
}) => {
  const yearlyPrice = Math.floor(price * 12 * 0.9);

  const inputRange = [
    (index - 1) * CARD_WIDTH,
    index * CARD_WIDTH,
    (index + 1) * CARD_WIDTH,
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1.1, 0.85],
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.75, 1, 0.75],
  });

  const rotateY = scrollX.interpolate({
    inputRange,
    outputRange: ['25deg', '0deg', '-25deg'],
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [30, 0, 30],
  });

  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: [-15, 0, 15],
  });

  return (
    <Animated.View
      style={[
        styles.planCard,
        {
          width: CARD_WIDTH,
          marginHorizontal: CARD_SPACING / 2,
          transform: [
            {scale},
            {rotateY},
            {translateY},
            {translateX},
            {perspective: 1500},
          ],
          opacity,
        },
      ]}>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>
        ${isYearly ? yearlyPrice : price}
        <Text style={styles.period}>/{isYearly ? 'year' : 'month'}</Text>
        {isYearly && <Text style={styles.discount}> (10% off)</Text>}
      </Text>
      {title === 'Startup Plan' && (
        <Text style={styles.trial}>⭐️ 6 month free trial!</Text>
      )}
      {isYearly && title !== 'Startup Plan' && (
        <Text style={styles.trial}>+3 months free with annual plan!</Text>
      )}
      {features.map((feature, idx) => (
        <Text key={idx} style={styles.feature}>
          • {feature}
        </Text>
      ))}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CartScreen: React.FC<CartScreenProps> = ({navigation}) => {
  const [isYearly, setIsYearly] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  const plans = [
    {
      title: 'Startup Plan',
      subtitle: 'For AI Startups & Developers',
      price: 49,
      features: [
        'List AI solutions',
        'Get investor access',
        'Use premium AI tools',
        'Chat with businesses and investors',
      ],
    },
    {
      title: 'Business Plan',
      subtitle: 'For Companies & Enterprises',
      price: 75,
      features: [
        'AI discovery',
        'API integrations',
        'Exclusive tools',
        'Chat with all companies',
      ],
    },
    {
      title: 'Investor Plan',
      subtitle: 'For VCs & Angel Investors',
      price: 99,
      features: [
        'AI startup deal flow',
        'Analytics',
        'AI-powered investment insights',
        'Chat with all companies',
      ],
    },
  ];

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{x: 0, y: 0}}
      end={{x: 2, y: 1}}
      style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={24} color={Colors.lightText} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Subscriptions</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.openDrawer()}>
              <Icon name="menu" size={30} color={Colors.lightText} />
            </TouchableOpacity>
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleButton, !isYearly && styles.toggleActive]}
                onPress={() => setIsYearly(false)}>
                <Text
                  style={[
                    styles.toggleText,
                    !isYearly && styles.toggleTextActive,
                  ]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isYearly && styles.toggleActive]}
                onPress={() => setIsYearly(true)}>
                <Text
                  style={[
                    styles.toggleText,
                    isYearly && styles.toggleTextActive,
                  ]}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: scrollX}}}],
              {useNativeDriver: true},
            )}
            scrollEventThrottle={16}>
            {plans.map((plan, index) => (
              <PlanCard
                key={index}
                {...plan}
                isYearly={isYearly}
                index={index}
                scrollX={scrollX}
              />
            ))}
          </Animated.ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    marginTop: 10,
    flex: 1,
  },
  header: {
    padding: 15,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.lightText,
  },
  menuButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
    marginTop: 10,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    color: Colors.inactive,
    fontSize: 16,
  },
  toggleTextActive: {
    color: Colors.lightText,
  },
  scrollContent: {
    paddingHorizontal: CARD_OFFSET - CARD_SPACING / 2,
  },
  planCard: {
    marginTop: 50,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    height: SCREEN_WIDTH * 0.9,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: `${Colors.cardBackground}dd`,
  },
  subtitle: {
    color: Colors.inactive,
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.lightText,
  },
  price: {
    fontSize: 27,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.lightText,
  },
  period: {
    fontSize: 17,
    color: Colors.inactive,
  },
  discount: {
    color: Colors.primary,
    fontSize: 16,
    marginBottom: 4,
  },
  trial: {
    color: Colors.star,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  description: {
    color: Colors.inactive,
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 16,
  },
  feature: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 2,
    color: Colors.lightText,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: Colors.lightText,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CartScreen;
