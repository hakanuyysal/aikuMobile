import analytics from '@react-native-firebase/analytics';

class AnalyticsService {
  /**
   * Initialize analytics (call this when app starts)
   */
  async initialize(): Promise<void> {
    try {
      // Enable analytics collection
      await analytics().setAnalyticsCollectionEnabled(true);
      console.log('Firebase Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
    }
  }

  /**
   * Set user properties for analytics
   */
  async setUserProperties(properties: {[key: string]: string}): Promise<void> {
    try {
      for (const [key, value] of Object.entries(properties)) {
        await analytics().setUserProperty(key, value);
      }
      console.log('User properties set successfully:', properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Set user ID for analytics
   */
  async setUserId(userId: string): Promise<void> {
    try {
      await analytics().setUserId(userId);
      console.log('User ID set successfully:', userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  /**
   * Log custom events
   */
  async logEvent(eventName: string, parameters?: {[key: string]: any}): Promise<void> {
    try {
      await analytics().logEvent(eventName, parameters);
      console.log(`Event logged: ${eventName}`, parameters);
    } catch (error) {
      console.error(`Failed to log event ${eventName}:`, error);
    }
  }

  /**
   * Log screen view events
   */
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      console.log(`Screen view logged: ${screenName}`);
    } catch (error) {
      console.error(`Failed to log screen view ${screenName}:`, error);
    }
  }

  /**
   * Log login events
   */
  async logLogin(method: string = 'email'): Promise<void> {
    try {
      await analytics().logLogin({
        method: method,
      });
      console.log(`Login event logged with method: ${method}`);
    } catch (error) {
      console.error('Failed to log login event:', error);
    }
  }

  /**
   * Log signup events
   */
  async logSignUp(method: string = 'email'): Promise<void> {
    try {
      await analytics().logSignUp({
        method: method,
      });
      console.log(`Sign up event logged with method: ${method}`);
    } catch (error) {
      console.error('Failed to log sign up event:', error);
    }
  }

  /**
   * Log purchase events
   */
  async logPurchase(value: number, currency: string = 'USD', transactionId?: string): Promise<void> {
    try {
      const purchaseData: any = {
        value: value,
        currency: currency,
      };
      
      if (transactionId) {
        purchaseData.transaction_id = transactionId;
      }

      await analytics().logPurchase(purchaseData);
      console.log(`Purchase event logged: ${value} ${currency}`);
    } catch (error) {
      console.error('Failed to log purchase event:', error);
    }
  }

  /**
   * Log custom business events
   */
  async logBusinessEvent(eventType: 'subscription' | 'investment' | 'product_view' | 'company_view', data: {[key: string]: any}): Promise<void> {
    try {
      const eventName = `app_${eventType}`;
      await analytics().logEvent(eventName, {
        ...data,
        timestamp: Date.now(),
      });
      console.log(`Business event logged: ${eventName}`, data);
    } catch (error) {
      console.error(`Failed to log business event ${eventType}:`, error);
    }
  }
}

export default new AnalyticsService();