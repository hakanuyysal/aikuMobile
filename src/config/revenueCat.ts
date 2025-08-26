import Config from 'react-native-config';

// RevenueCat API Key'leri
export const REVENUECAT_API_KEYS = {
  ios: Config.REVENUECAT_IOS_API_KEY || 'appl_YOUR_IOS_API_KEY',
  android: Config.REVENUECAT_ANDROID_API_KEY || 'goog_YOUR_ANDROID_API_KEY',
};

// Ürün mapping'i
export const productMapping = {
  // Startup Plan
  'startup_monthly': {
    revenueCatId: '$rc_monthly',
    plan: 'startup',
    period: 'monthly',
    price: 49,
    trialDays: 180, // 6 ay
    displayName: 'Startup Plan',
    description: 'For AI Startups & Developers',
  },
  'startup_yearly': {
    revenueCatId: 'startup_yearly_package', 
    plan: 'startup',
    period: 'yearly',
    price: 529,
    trialDays: 180, // 6 ay
    displayName: 'Startup Plan',
    description: 'For AI Startups & Developers',
  },
  
  // Business Plan
  'business_monthly': {
    revenueCatId: 'business_monthly_package',
    plan: 'business', 
    period: 'monthly',
    price: 75,
    trialDays: 0,
    displayName: 'Business Plan',
    description: 'For Companies & Enterprises',
  },
  'business_yearly': {
    revenueCatId: 'business_yearly_package',
    plan: 'business',
    period: 'yearly', 
    price: 810,
    trialDays: 0,
    displayName: 'Business Plan',
    description: 'For Companies & Enterprises',
  },
  
  // Investor Plan
  'investor_monthly': {
    revenueCatId: 'investor_monthly_package',
    plan: 'investor',
    period: 'monthly',
    price: 99,
    trialDays: 0,
    displayName: 'Investor Plan',
    description: 'For VCs & Angel Investors',
  },
  'investor_yearly': {
    revenueCatId: 'investor_yearly_package',
    plan: 'investor',
    period: 'yearly',
    price: 1069,
    trialDays: 0,
    displayName: 'Investor Plan',
    description: 'For VCs & Angel Investors',
  }
};

// Plan özellikleri
export const planFeatures = {
  startup: [
    'List AI solutions',
    'Get investor access',
    'Use premium AI tools',
    'Chat with businesses and investors',
  ],
  business: [
    'AI discovery',
    'API integrations',
    'Exclusive tools',
    'Chat with companies',
  ],
  investor: [
    'AI startup deal flow',
    'Analytics',
    'AI-powered investment insights',
    'Chat with companies',
  ],
};

// RevenueCat servis fonksiyonları
export const RevenueCatService = {
  // Kullanıcı ID'sini RevenueCat'e set et
  setUserID: async (userId: string) => {
    try {
      const Purchases = require('react-native-purchases').default;
      await Purchases.setUserID(userId);
      console.log('RevenueCat User ID set:', userId);
    } catch (error) {
      console.error('RevenueCat setUserID error:', error);
    }
  },

  // Mevcut abonelikleri getir
  getCustomerInfo: async () => {
    try {
      const Purchases = require('react-native-purchases').default;
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('RevenueCat getCustomerInfo error:', error);
      return null;
    }
  },

  // Paketleri getir
  getOfferings: async () => {
    try {
      const Purchases = require('react-native-purchases').default;
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('RevenueCat getOfferings error:', error);
      return null;
    }
  },

  // Paket satın al
  purchasePackage: async (packageToPurchase: any) => {
    try {
      const Purchases = require('react-native-purchases').default;
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return { customerInfo, success: true };
    } catch (error: any) {
      console.error('RevenueCat purchasePackage error:', error);
      return { error, success: false };
    }
  },

  // Aboneliği restore et
  restorePurchases: async () => {
    try {
      const Purchases = require('react-native-purchases').default;
      const customerInfo = await Purchases.restorePurchases();
      return { customerInfo, success: true };
    } catch (error) {
      console.error('RevenueCat restorePurchases error:', error);
      return { error, success: false };
    }
  },
};

export default RevenueCatService;
