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
import {Colors} from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import LinearGradient from 'react-native-linear-gradient';
import metrics from '../../constants/aikuMetric';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = metrics.getWidthPercentage(75);
const CARD_SPACING = metrics.spacing.sm;
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
  const isStartupPlan = title === 'Startup Plan';
  const displayPrice = isStartupPlan && !isYearly ? 0 : price;

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
        {isStartupPlan && !isYearly ? (
          <>
            <Text style={styles.originalPrice}>$49</Text>{' '}
            <Text style={styles.newPrice}>$0</Text>
          </>
        ) : (
          `$${isYearly ? yearlyPrice : displayPrice}`
        )}
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
    flex: 1,
  },
  header: {
    padding: metrics.padding.md,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: metrics.margin.lg,
    top: metrics.margin.md * 1.1,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: metrics.margin.lg,
    color: Colors.lightText,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.circle,
    padding: metrics.padding.xs,
    marginBottom: metrics.margin.lg,
    marginTop: metrics.margin.sm,
  },
  toggleButton: {
    paddingVertical: metrics.padding.sm,
    paddingHorizontal: metrics.padding.xl,
    borderRadius: metrics.borderRadius.xl,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    color: Colors.inactive,
    fontSize: metrics.fontSize.md,
  },
  toggleTextActive: {
    color: Colors.lightText,
  },
  scrollContent: {
    paddingHorizontal: CARD_OFFSET - CARD_SPACING / 2,
  },
  planCard: {
    marginTop: metrics.margin.xxl,
    borderRadius: metrics.borderRadius.xl,
    padding: metrics.padding.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: metrics.scale(15),
    },
    shadowOpacity: 0.5,
    shadowRadius: metrics.scale(20),
    elevation: 15,
    height: metrics.getHeightPercentage(42),
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: `${Colors.cardBackground}dd`,
  },
  subtitle: {
    color: Colors.inactive,
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.xs,
  },
  title: {
    fontSize: metrics.fontSize.xxxl,
    fontWeight: 'bold',
    marginBottom: metrics.margin.sm,
    color: Colors.lightText,
  },
  price: {
    fontSize: metrics.fontSize.xxxl,
    fontWeight: 'bold',
    marginBottom: metrics.margin.sm,
    color: Colors.lightText,
  },
  period: {
    fontSize: metrics.fontSize.lg,
    color: Colors.inactive,
  },
  discount: {
    color: Colors.primary,
    fontSize: metrics.fontSize.md,
    marginBottom: metrics.margin.xs,
  },
  trial: {
    color: Colors.star,
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.sm,
    fontWeight: 'bold',
  },
  description: {
    color: Colors.inactive,
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.sm,
    lineHeight: metrics.scale(16),
  },
  feature: {
    fontSize: metrics.fontSize.sm,
    marginBottom: metrics.margin.xs,
    marginTop: metrics.margin.xs,
    color: Colors.lightText,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: metrics.borderRadius.circle,
    paddingVertical: metrics.padding.md,
    alignItems: 'center',
    marginTop: metrics.margin.xl,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: metrics.scale(8),
    },
    shadowOpacity: 0.5,
    shadowRadius: metrics.scale(12),
    elevation: 8,
  },
  buttonText: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.sm,
    fontWeight: '700',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: Colors.inactive,
    fontSize: metrics.fontSize.xxxl,
    marginRight: metrics.margin.xs,
  },
  newPrice: {
    color: Colors.lightText,
    fontSize: metrics.fontSize.xxxl,
    fontWeight: 'bold',
  },
});

export default CartScreen;
