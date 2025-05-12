import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text as PaperText, IconButton, Surface } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const mainSteps = [
  {
    id: '1',
    title: 'Sign Up',
    description: 'Create your profile as a business, startup, or investor and set your preferences.',
    iconName: 'person-add',
  },
  {
    id: '2',
    title: 'Discover',
    description: 'Explore cutting-edge AI products, promising startups, and high-potential investment opportunities tailored to your needs.',
    iconName: 'search',
  },
  {
    id: '3',
    title: 'Connect',
    description: 'Engage through our seamless messaging and meeting scheduling tools to build valuable collaborations.',
    iconName: 'people',
  },
  {
    id: '4',
    title: 'Grow',
    description: 'Implement AI-driven solutions, scale your business, and maximize your investments with the right partnerships.',
    iconName: 'trending-up',
  },
];

const getStartedSteps = [
  {
    id: '1',
    title: 'Create Your Account and Join',
    description: 'Register an account to get started.',
    iconName: 'person-add-outline', // Icon for account creation
  },
  {
    id: '2',
    title: 'Choose Your Plan and Subscribe',
    description: 'Select the plan that best fits your needs.',
    iconName: 'card-outline', // Icon for payment/subscription
  },
  {
    id: '3',
    title: 'Add Your Company to the Platform',
    description: 'List your company on our platform.',
    iconName: 'business-outline', // Icon for company
  },
  {
    id: '4',
    title: 'Add Your Product to the Marketplace',
    description: 'Showcase your product to a wider audience.',
    iconName: 'storefront-outline', // Icon for marketplace/product
  },
  {
    id: '5',
    title: 'Connect with the Community',
    description: 'Chat, network and engage with peers.',
    iconName: 'chatbubbles-outline', // Icon for community/chat
  },
];

const faqs = [
  {
    id: '1',
    question: 'What is Aiku?',
    answer: 'Aiku AI Startup Platform is a dedicated marketplace that connects AI startups with investors, resources, and mentorship. It provides a centralized space where innovative AI solutions are showcased and nurtured.',
  },
  {
    id: '2',
    question: 'Who can join the platform?',
    answer: 'The platform is open to AI startups, entrepreneurs, and investors. Whether you’re looking to launch a new AI product or seek investment opportunities, you’ll find a tailored environment for growth.',
  },
  {
    id: '3',
    question: 'What services does Aiku AI Startup Platform offer?',
    answer: 'It offers a marketplace for AI products, comprehensive startup profiles, investment opportunities, growth resources, and a community designed to foster networking and collaboration.',
  },
  {
    id: '4',
    question: 'How much does it cost to use the platform?',
    answer: 'With subscription plans starting at just $49 per month, you gain access to essential tools and resources, giving you the support and visibility your startup needs to succeed.',
  },
  {
    id: '5',
    question: 'How does the marketplace work?',
    answer: 'Startups list their AI products in the marketplace to attract investors and industry attention. This specialized platform boosts product visibility and facilitates strategic connections.',
  },
  {
    id: '6',
    question: 'What sets Aiku AI Startup Platform apart from other startup platforms?',
    answer: 'Unlike general startup platforms, Aiku AI Startup Platform is exclusively focused on the AI industry. This specialization ensures that every tool, mentorship opportunity, and partnership is tailored to AI startups.',
  },
  {
    id: '7',
    question: 'How can I connect with investors on the platform?',
    answer: 'By showcasing your products on the marketplace and engaging with the community, you gain direct access to a network of investors actively seeking innovative AI solutions.',
  },
  {
    id: '8',
    question: 'What kind of support is available?',
    answer: 'Users have access to a comprehensive support system, including mentorship, industry insights, collaborative opportunities, and growth resources that help turn ideas into market-leading solutions.',
  },
  {
    id: '9',
    question: 'Is the platform available globally?',
    answer: 'Yes, Aiku AI Startup Platform serves a global community. With startups and investors from over 20 nations engaged, you have the opportunity to connect on an international scale.',
  },
  {
    id: '10',
    question: 'How do I get started?',
    answer: 'Yes, Aiku AI Startup Platform serves a global community. With startups and investors from over 20 nations engaged, you have the opportunity to connect on an international scale.',
  },
];

const HowItWorksScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'HowItWorks' | 'FAQ'>('HowItWorks');
  const [activeFAQ, setActiveFAQ] = useState<string | null>(null);

  const handleMenuOpen = () => {
    navigation.openDrawer(); // Assuming a drawer navigator
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderMainStep = ({ item }: { item: typeof mainSteps[0] }) => (
    <View style={styles.mainStepItem}>
      <Ionicons name={item.iconName} size={30} color={Colors.lightText} style={styles.mainStepIcon} />
      <View style={styles.mainStepTextContainer}>
        <PaperText style={styles.mainStepTitle}>{item.title.toUpperCase()}</PaperText>
        <PaperText style={styles.mainStepDescription}>{item.description}</PaperText>
      </View>
    </View>
  );

  const renderGetStartedStep = ({ item }: { item: typeof getStartedSteps[0] }) => (
    <View style={styles.getStartedCard}>
      <View style={styles.getStartedContentContainer}>
        <Ionicons name={item.iconName} size={30} color={Colors.lightText} style={styles.getStartedIcon} />
        <View style={styles.getStartedTextContainer}>
          <PaperText style={styles.getStartedTitle}>{item.title}</PaperText>
          <PaperText style={styles.getStartedDescription}>{item.description}</PaperText>
        </View>
      </View>
    </View>
  );

  const renderFAQ = ({ item }: { item: typeof faqs[0] }) => (
    <TouchableOpacity
      style={styles.faqCard}
      onPress={() => setActiveFAQ(activeFAQ === item.id ? null : item.id)}
    >
      <PaperText style={styles.faqQuestion}>{item.question}</PaperText>
      {activeFAQ === item.id && <PaperText style={styles.faqAnswer}>{item.answer}</PaperText>}
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.gradientBackground}
    >
      <StatusBar backgroundColor="#1A1E29" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Surface style={styles.header} elevation={0}>
            <View style={styles.backButtonContainer}>
              <IconButton
                icon={() => <Ionicons name="chevron-back" size={24} color={Colors.lightText} />}
                onPress={handleBackPress}
                style={styles.backButton}
              />
            </View>
            <View style={styles.logoAndTitleContainer}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.titleContainer}>
                <PaperText variant="titleLarge" style={styles.headerTitle}>
                  Aiku
                </PaperText>
                <PaperText variant="bodySmall" style={styles.subtitle}>
                  ai startup platform
                </PaperText>
              </View>
            </View>
            <IconButton
              icon="menu"
              iconColor={Colors.lightText}
              size={24}
              onPress={handleMenuOpen}
              style={styles.menuButton}
            />
          </Surface>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'HowItWorks' && styles.activeTab]}
              onPress={() => setActiveTab('HowItWorks')}
            >
              <PaperText
                style={[
                  styles.tabText,
                  activeTab === 'HowItWorks' && styles.activeTabText,
                ]}
              >
                HOW IT WORKS ?
              </PaperText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'FAQ' && styles.activeTab]}
              onPress={() => setActiveTab('FAQ')}
            >
              <PaperText
                style={[styles.tabText, activeTab === 'FAQ' && styles.activeTabText]}
              >
                FAQ
              </PaperText>
            </TouchableOpacity>
          </View>

          {activeTab === 'HowItWorks' ? (
            <View style={styles.contentContainer}>
              <FlatList
                data={mainSteps}
                renderItem={renderMainStep}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.stepsContent}
                style={styles.stepsList}
              />
              <View style={styles.getStartedSection}>
                <PaperText style={styles.sectionTitle}>Get Started</PaperText>
                <FlatList
                  data={getStartedSteps}
                  renderItem={renderGetStartedStep}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.getStartedContent}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.pageTitleContainer}>
                <PaperText style={styles.pageTitle}>Frequently Asked Questions</PaperText>
              </View>
              <FlatList
                data={faqs}
                renderItem={renderFAQ}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.faqContent}
                style={styles.faqList}
              />
            </View>
          )}
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
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  backButtonContainer: {
    marginRight: 8,
  },
  backButton: {
    margin: 0,
  },
  logoAndTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logo: {
    width: '130%',
    height: '130%',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '700',
    color: Colors.lightText,
    fontSize: 20,
    lineHeight: 24,
  },
  subtitle: {
    fontWeight: '400',
    color: Colors.lightText,
    fontSize: 10,
    opacity: 0.7,
  },
  menuButton: {
    margin: 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  tabText: {
    fontSize: 16,
    color: Colors.lightText,
    opacity: 0.7,
    fontWeight: '700',
  },
  activeTabText: {
    opacity: 1,
  },
  contentContainer: {
    flex: 1,
  },
  pageTitleContainer: {
    marginVertical: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.lightText,
    textAlign: 'center',
  },
  stepsList: {
    flex: 1,
  },
  stepsContent: {
    paddingBottom: 20,
  },
  mainStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
  },
  mainStepIcon: {
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  mainStepTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  mainStepTitle: {
    color: Colors.lightText,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  mainStepDescription: {
    color: Colors.lightText,
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 20,
  },
  getStartedSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.lightText,
    textAlign: 'center',
    marginBottom: 12,
  },
  getStartedContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  getStartedCard: {
    width: SCREEN_WIDTH * 0.7,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom:'30%',
  },
  getStartedContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  getStartedIcon: {
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  getStartedTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  getStartedTitle: {
    color: Colors.lightText,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  getStartedDescription: {
    color: Colors.lightText,
    fontSize: 14,
    opacity: 0.8,
  },
  faqList: {
    flex: 1,
  },
  faqContent: {
    paddingBottom: 20,
  },
  faqCard: {
    width: SCREEN_WIDTH - 40,
    marginBottom: 12,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    padding: 16,
  },
  faqQuestion: {
    color: Colors.lightText,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  faqAnswer: {
    color: Colors.lightText,
    fontSize: 14,
    opacity: 0.8,
  },
});

export default HowItWorksScreen;