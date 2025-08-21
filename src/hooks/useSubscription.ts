import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RevenueCatService from '../services/RevenueCatService';

interface SubscriptionStatus {
  isActive: boolean;
  planName?: string;
  expirationDate?: string;
  isTrial?: boolean;
  loading: boolean;
  error?: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isActive: false,
    loading: true,
  });

  const checkSubscriptionStatus = async () => {
    try {
      setSubscription(prev => ({ ...prev, loading: true, error: undefined }));

      // RevenueCat'ten abonelik bilgilerini al
      try {
        const Purchases = require('react-native-purchases').default;
        const customerInfo = await Purchases.getCustomerInfo();
        
        if (customerInfo?.entitlements?.active) {
          const activeEntitlement = Object.values(customerInfo.entitlements.active)[0] as any;
          
          setSubscription({
            isActive: true,
            planName: activeEntitlement.productIdentifier,
            expirationDate: activeEntitlement.expirationDate,
            isTrial: activeEntitlement.isTrial,
            loading: false,
          });
        } else {
        // Backend'den abonelik durumunu kontrol et
        const token = await AsyncStorage.getItem('token');
        if (token) {
          try {
            const response = await fetch('https://api.aikuaiplatform.com/api/subscriptions/my-subscription', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data?.success && data.data?.isSubscriptionActive) {
                setSubscription({
                  isActive: true,
                  planName: data.data.planDetails?.name,
                  expirationDate: data.data.expirationDate,
                  isTrial: data.data.isTrial,
                  loading: false,
                });
                return;
              }
            }
          } catch (error) {
            console.error('Backend subscription check failed:', error);
          }
        }

        setSubscription({
          isActive: false,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Subscription status check failed:', error);
      setSubscription({
        isActive: false,
        loading: false,
        error: 'Abonelik durumu kontrol edilemedi',
      });
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const refreshSubscription = () => {
    checkSubscriptionStatus();
  };

  return {
    ...subscription,
    refreshSubscription,
  };
};
