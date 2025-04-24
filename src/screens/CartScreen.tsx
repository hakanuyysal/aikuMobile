import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {Colors} from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import {DrawerNavigationProp} from '@react-navigation/drawer';

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
  const yearlyPrice = Math.floor(price * 12 * 0.9); // %10 indirim

  const inputRange = [
    (index - 1) * CARD_WIDTH,
    index * CARD_WIDTH,
    (index + 1) * CARD_WIDTH,
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.9, 1.1, 0.9],
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.7, 1, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.planCard,
        {
          width: CARD_WIDTH,
          marginHorizontal: CARD_SPACING / 2,
          transform: [{scale}],
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
        <Text style={styles.trial}>6 month free trial!</Text>
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
              style={[styles.toggleText, !isYearly && styles.toggleTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, isYearly && styles.toggleActive]}
            onPress={() => setIsYearly(true)}>
            <Text
              style={[styles.toggleText, isYearly && styles.toggleTextActive]}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flex: 1,
    backgroundColor: Colors.background,
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
    fontSize: 24,
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
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: SCREEN_WIDTH * 0.9,
    overflow: 'hidden',
  },
  subtitle: {
    color: Colors.inactive,
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 25,
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
    color: Colors.secondary,
    fontSize: 14,
    marginBottom: 8,
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
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: Colors.lightText,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CartScreen;
