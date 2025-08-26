import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Linking
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../constants/colors';
import metrics from '../../constants/aikuMetric';
import AuthService from '../../services/AuthService';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { updateNotificationSettings } from '../../services/push/oneSignal';
// import { testNotificationSettings, testPushTokenSaving } from '../../services/push/oneSignal';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import BaseService from '../../api/BaseService'; // <= senin BaseService.ts

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Settings'
>;

interface SettingsProps {
  navigation: SettingsScreenNavigationProp;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const IS_TABLET = (metrics?.isTablet ?? false) || SCREEN_WIDTH >= 768;
const MAX_CONTENT_WIDTH = IS_TABLET ? Math.min(SCREEN_WIDTH * 0.80, 720) : SCREEN_WIDTH;

const TITLE_FS_T = metrics.fontSize.xl;
const HEADER_PV_T = metrics.spacing.md;
const ICON_BOX_T = Math.round(metrics.rem * 44);
const ICON_SIZE_T = Math.round(metrics.rem * 26);

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  // const [chatNotificationsEnabled, setChatNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { updateUser: setUserInContext } = useAuth();

  const [loadingUser, setLoadingUser] = useState(true);
  const [currentEmail, setCurrentEmail] = useState('');
  const [authProvider, setAuthProvider] = useState<'email' | 'google' | 'linkedin' | string>('email');
  const [accountStatus, setAccountStatus] = useState<'active' | 'deactivated'>('active');

  // email değişim state
  const [newEmail, setNewEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ ok?: string; err?: string }>({});

  // şifre değişim state
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [cnfPwd, setCnfPwd] = useState('');
  const [pwdBusy, setPwdBusy] = useState(false);

  // silme/deactivate
  const [deletePwd, setDeletePwd] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await BaseService.getCurrentUser();
        if (res?.success && res.user) {
          setCurrentEmail(res.user.email || '');
          setAuthProvider(res.user.authProvider || 'email');
          setAccountStatus(res.user.accountStatus || 'active');
          setNotificationsEnabled(!!res.user.acceptChatNotification);
          setUserInContext?.(res.user);
        }
      } catch (e) {
        // sessiz geç
      } finally {
        setLoadingUser(false);
      }
    };
    load();
  }, [setUserInContext]);

  // Sayfa yüklendiğinde mevcut notification ayarlarını getir
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setIsInitialLoading(true);
      // Önce tüm ayarları getir
      const allSettings = await notificationService.getAllSettings();
      setNotificationsEnabled(allSettings.pushNotifications);
      // setChatNotificationsEnabled(allSettings.chatNotifications);
    } catch (error) {
      console.error('Notification ayarları yüklenirken hata:', error);
      // Hata durumunda varsayılan değerleri kullan
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      setIsLoading(true);
      
      // Database'de push notification ayarlarını güncelle
      await notificationService.updatePushSettings(value);
      setNotificationsEnabled(value);
      
      // OneSignal ayarlarını da güncelle
      await updateNotificationSettings(value);
      
      // Eski API ile de uyumluluk için güncelle
      try {
        await BaseService.updateUser({ acceptChatNotification: value });
      } catch (e) {
        console.log('Eski API güncelleme hatası (önemli değil):', e);
      }
      
      console.log('✅ Notification ayarları başarıyla güncellendi:', value);
    } catch (error) {
      console.error('Notification ayarı güncellenirken hata:', error);
      Alert.alert(
        'Hata',
        'Bildirim ayarları güncellenirken bir hata oluştu. Lütfen tekrar deneyin.',
      );
      // Hata durumunda eski değere geri dön
      setNotificationsEnabled(!value);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleChatNotificationToggle = async (value: boolean) => {
  //   try {
  //     setIsLoading(true);
  //     await notificationService.updateChatSettings(value);
  //     setChatNotificationsEnabled(value);
  //   } catch (error) {
  //     console.error('Chat notification ayarı güncellenirken hata:', error);
  //     Alert.alert(
  //       'Hata',
  //       'Chat bildirim ayarları güncellenirken bir hata oluştu. Lütfen tekrar deneyin.',
  //     );
  //     // Hata durumunda eski değere geri dön
  //     setChatNotificationsEnabled(!value);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AuthService.logout(navigation);
            setUserInContext?.({} as any);
          } catch (error) {
            Alert.alert('Error', 'An error occurred while logging out.');
          }
        },
      },
    ]);
  };

  // Notifications toggle - eski fonksiyon, artık kullanılmıyor
  // const onToggleNotifications = async (val: boolean) => {
  //   setNotificationsEnabled(val);
  //   try {
  //     await BaseService.updateUser({ acceptChatNotification: val });
  //   } catch (e) {
  //     setNotificationsEnabled(!val);
  //     Alert.alert('Error', 'Failed to update notification preference.');
  //   }
  // };

  // Email change
  const sendCode = async () => {
    setEmailBusy(true); setEmailMsg({});
    try {
      await BaseService.requestEmailChange(newEmail);
      setCodeSent(true);
      setEmailMsg({ ok: 'Verification code sent to your new email.' });
    } catch (e: any) {
      setEmailMsg({ err: e.message || 'Failed to send verification code.' });
    } finally {
      setEmailBusy(false);
    }
  };

  const confirmCode = async () => {
    setEmailBusy(true); setEmailMsg({});
    try {
      await BaseService.confirmEmailChange(verificationCode);
      setEmailMsg({ ok: 'Email updated successfully.' });
      setNewEmail(''); setVerificationCode(''); setCodeSent(false);
    } catch (e: any) {
      setEmailMsg({ err: e.message || 'Invalid or expired code.' });
    } finally {
      setEmailBusy(false);
    }
  };

  // Password change
  const changePassword = async () => {
    if (!curPwd) return Alert.alert('Missing', 'Current password is required.');
    if (newPwd.length < 8) return Alert.alert('Weak password', 'Use at least 8 characters.');
    if (newPwd !== cnfPwd) return Alert.alert('Mismatch', 'Passwords do not match.');

    setPwdBusy(true);
    try {
      const res = await BaseService.changePassword(curPwd, newPwd, cnfPwd);
      if (res?.success) {
        Alert.alert('Success', 'Password updated. Please sign in again.', [
          { text: 'OK', onPress: () => handleLogout() },
        ]);
        setCurPwd(''); setNewPwd(''); setCnfPwd('');
      } else {
        Alert.alert('Error', res?.message || 'Failed to change password.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to change password.');
    } finally {
      setPwdBusy(false);
    }
  };

  // Deactivate / Reactivate
  const deactivate = async () => {
    Alert.alert('Deactivate', 'Are you sure you want to deactivate your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            await BaseService.updateUser({ accountStatus: 'deactivated' });
            setAccountStatus('deactivated');
            Alert.alert('Done', 'Your account has been deactivated.');
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to deactivate.');
          } finally { setBusy(false); }
        }
      },
    ]);
  };

  const reactivate = async () => {
    setBusy(true);
    try {
      await BaseService.updateUser({ accountStatus: 'active' });
      setAccountStatus('active');
      Alert.alert('Done', 'Your account has been reactivated.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to reactivate.');
    } finally { setBusy(false); }
  };

  // Delete account
  const deleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setBusy(true);
            try {
              await BaseService.deleteAccount(authProvider === 'email' ? deletePwd : undefined);
              Alert.alert('Deleted', 'Your account has been deleted.');
              await AuthService.logout(navigation);
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete account.');
            } finally { setBusy(false); }
          }
        },
      ],
    );
  };

  const handleContactUs = () => navigation.navigate('ContactUs');

  // const handleTestNotifications = async () => {
  //   try {
  //     const result = await testNotificationSettings();
  //     Alert.alert('Bildirim Testi', result.message);
  //   } catch (error) {
  //     Alert.alert('Hata', 'Test sırasında bir hata oluştu');
  //   }
  // };

  // const handleTestPushToken = async () => {
  //   try {
  //     const result = await testPushTokenSaving();
  //     Alert.alert('Push Token Testi', result.message);
  //   } catch (error) {
  //     Alert.alert('Hata', 'Push token testi sırasında bir hata oluştu');
  //   }
  // };

  // const handleSendTestNotification = async () => {
  //   try {
  //     const success = await notificationService.sendTestNotification();
  //     if (success) {
  //         Alert.alert('Başarılı', 'Test bildirimi gönderildi!');
  //       } else {
  //         Alert.alert('Hata', 'Test bildirimi gönderilemedi');
  //       }
  //   } catch (error) {
  //     Alert.alert('Hata', 'Test bildirimi gönderilirken bir hata oluştu');
  //   }
  // };

  if (loadingUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  // mevcut kartlar + yeni bölümler
  const settingsItems = [
    {
      icon: 'bell-outline',
      title: 'Push Notifications',
      subtitle: 'Manage push notification preferences',
      gradient: ['#EC4899', '#D946EF'],
      rightElement: (
        <Switch
          value={notificationsEnabled}
          onValueChange={handleNotificationToggle}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          ios_backgroundColor={Colors.border}
          disabled={isLoading || isInitialLoading}
        />
      ),
    },
    // {
    //   icon: 'chat-outline',
    //   title: 'Chat Notifications',
    //   subtitle: 'Manage chat notification preferences',
    //   gradient: ['#10B981', '#059669'],
    //   rightElement: (
    //     <Switch
    //       value={chatNotificationsEnabled}
    //       onValueChange={handleChatNotificationToggle}
    //       trackColor={{false: Colors.border, true: Colors.primary}}
    //       ios_backgroundColor={Colors.border}
    //       disabled={isLoading || isInitialLoading}
    //     />
    //   ),
    // },
    // {
    //   icon: 'bell-ring-outline',
    //   title: 'Test Notifications',
    //   subtitle: 'Test your notification settings',
    //   gradient: ['#F59E0B', '#F97316'],
    //   onPress: handleTestNotifications,
    // },
    // {
    //   icon: 'key-variant',
    //   title: 'Test Push Token',
    //   subtitle: 'Test push token saving to backend',
    //   gradient: ['#8B5CF6', '#7C3AED'],
    //   onPress: handleTestPushToken,
    // },
    // {
    //   icon: 'send',
    //   title: 'Send Test Notification',
    //   subtitle: 'Send a test push notification',
    //   gradient: ['#06B6D4', '#0EA5E9'],
    //   onPress: handleSendTestNotification,
    // },
    {
      icon: 'email-edit-outline',
      title: 'Change Email',
      subtitle: currentEmail ? `Current: ${currentEmail}` : 'Update your email address',
      gradient: ['#06B6D4', '#0EA5E9'],
    },
    {
      icon: 'lock-reset',
      title: 'Change Password',
      subtitle: 'Update your password',
      gradient: ['#10B981', '#059669'],
    },
    {
      icon: accountStatus === 'active' ? 'account-off-outline' : 'account-check-outline',
      title: accountStatus === 'active' ? 'Deactivate Account' : 'Reactivate Account',
      subtitle: accountStatus === 'active'
        ? 'Temporarily disable your account'
        : 'Bring your account back',
      gradient: ['#F59E0B', '#F97316'],
    },
    {
      icon: 'delete-outline',
      title: 'Delete My Account',
      subtitle: 'Permanently delete your account',
      gradient: ['#EF4444', '#DC2626'],
    },
    {
      icon: 'email-outline',
      title: 'Contact Us',
      subtitle: 'Get in touch with our support team',
      gradient: ['#6366F1', '#8B5CF6'],
      onPress: handleContactUs,
    },
  ];

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <IoniconsIcon name="chevron-back" size={24} color={Colors.lightText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.addButton} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.menuContainer}>
            {/* Kartlar */}
            {settingsItems.map((item, index) => (
              <View key={index} style={styles.menuItem}>
                <LinearGradient colors={item.gradient} style={styles.menuItemIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <MaterialCommunityIcons name={item.icon as any} size={IS_TABLET ? ICON_SIZE_T : 24} color="#FFF" />
                </LinearGradient>

                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>

                  {/* --- Change Email formu (inline) --- */}
                  {item.title === 'Change Email' && authProvider === 'email' && (
                    <View style={{ marginTop: metrics.margin.md }}>
                      <TextInput
                        placeholder="New email"
                        placeholderTextColor="#aaa"
                        value={newEmail}
                        onChangeText={setNewEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                      />
                      <View style={{ gap: 10 }}>
                        <TouchableOpacity
                          style={styles.smallBtn}
                          onPress={sendCode}
                          disabled={emailBusy || !newEmail}>
                          <Text style={styles.smallBtnText}>
                            {emailBusy && !codeSent ? 'Sending…' : 'Send Code'}
                          </Text>
                        </TouchableOpacity>

                        {codeSent && (
                          <View style={styles.verifyBlock}>
                            <TextInput
                              placeholder="6-digit code"
                              placeholderTextColor="#aaa"
                              value={verificationCode}
                              onChangeText={setVerificationCode}
                              keyboardType="number-pad"
                              maxLength={6}
                              style={styles.input}
                            />
                            <TouchableOpacity
                              style={[styles.smallBtn, { alignSelf: 'flex-start' }]}
                              onPress={confirmCode}
                              disabled={emailBusy || verificationCode.length !== 6}>
                              <Text style={styles.smallBtnText}>
                                {emailBusy ? 'Verifying…' : 'Verify'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      {!!emailMsg.ok && <Text style={{ color: '#22c55e', marginTop: 6 }}>{emailMsg.ok}</Text>}
                      {!!emailMsg.err && <Text style={{ color: '#ef4444', marginTop: 6 }}>{emailMsg.err}</Text>}
                    </View>
                  )}

                  {/* --- Change Password formu (inline) --- */}
                  {item.title === 'Change Password' && authProvider === 'email' && (
                    <View style={{ marginTop: metrics.margin.md }}>
                      <TextInput
                        placeholder="Current password"
                        placeholderTextColor="#aaa"
                        value={curPwd}
                        onChangeText={setCurPwd}
                        secureTextEntry
                        style={styles.input}
                      />
                      <TextInput
                        placeholder="New password"
                        placeholderTextColor="#aaa"
                        value={newPwd}
                        onChangeText={setNewPwd}
                        secureTextEntry
                        style={styles.input}
                      />
                      <TextInput
                        placeholder="Confirm new password"
                        placeholderTextColor="#aaa"
                        value={cnfPwd}
                        onChangeText={setCnfPwd}
                        secureTextEntry
                        style={styles.input}
                      />
                      <TouchableOpacity style={styles.smallBtn} onPress={changePassword} disabled={pwdBusy || !curPwd || !newPwd || !cnfPwd}>
                        <Text style={styles.smallBtnText}>{pwdBusy ? 'Changing…' : 'Change Password'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* --- Deactivate/Reactivate butonu --- */}
                  {(item.title === 'Deactivate Account' || item.title === 'Reactivate Account') && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { marginTop: metrics.margin.md }]}
                      onPress={accountStatus === 'active' ? deactivate : reactivate}
                      disabled={busy}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionBtnText}>
                        {accountStatus === 'active' ? 'Deactivate Account' : 'Reactivate Account'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* --- Delete Account için password + buton --- */}
                  {item.title === 'Delete My Account' && (
                    <View style={{ marginTop: metrics.margin.md }}>
                      {authProvider === 'email' && (
                        <TextInput
                          placeholder="Type your password to confirm"
                          placeholderTextColor="#aaa"
                          value={deletePwd}
                          onChangeText={setDeletePwd}
                          secureTextEntry
                          style={styles.input}
                        />
                      )}
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                        onPress={deleteAccount}
                        disabled={busy || (authProvider === 'email' && !deletePwd)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionBtnText}>Delete My Account</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {item.rightElement
                  ? item.rightElement
                  : item.onPress
                    ? (
                      <TouchableOpacity
                        style={styles.menuItemArrow}
                        onPress={item.onPress}
                        activeOpacity={0.7}>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary} />
                      </TouchableOpacity>
                    )
                    : null}

              </View>
            ))}
          </View>

          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8} disabled={busy}>
              <LinearGradient colors={['#FF4B4B', '#FF0000']} style={styles.logoutGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.logoutContent}>
                  <MaterialCommunityIcons name="logout" size={22} color={Colors.lightText} style={styles.logoutIcon} />
                  <Text style={styles.logoutText}>Logout</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Legal Links */}
          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              By using our services, you agree to our{' '}
              <Text
                style={styles.legalLink}
                onPress={() => Linking.openURL('https://aikuaiplatform.com/terms')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text
                style={styles.legalLink}
                onPress={() => Linking.openURL('https://aikuaiplatform.com/privacy-policy')}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // HEADER
  header: {
    paddingVertical: IS_TABLET ? HEADER_PV_T : metrics.padding.md,
    alignItems: 'center',
    position: 'relative',
    width: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: IS_TABLET ? metrics.padding.md : metrics.padding.md,
  },
  backButton: {
    position: 'absolute',
    left: IS_TABLET ? metrics.margin.lg : metrics.margin.lg,
    top: IS_TABLET ? metrics.margin.sm : metrics.margin.md,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: IS_TABLET ? TITLE_FS_T : metrics.fontSize.xl * 1.1,
    lineHeight: IS_TABLET ? Math.round(TITLE_FS_T * 1.15) : undefined,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: 0,
  },
  addButton: {
    position: 'absolute',
    right: IS_TABLET ? metrics.margin.xl : metrics.margin.lg,
    top: IS_TABLET ? metrics.margin.lg : metrics.margin.lg,
    zIndex: 1,
    display: 'none',
  },

  // SCROLL CONTENT
  contentContainer: {
    paddingVertical: IS_TABLET ? metrics.padding.lg : metrics.padding.lg, // daha kompakt
    paddingHorizontal: IS_TABLET ? 0 : metrics.padding.lg,
    flexGrow: 1,
    width: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },

  // MENU LIST
  menuContainer: {
    paddingTop: IS_TABLET ? metrics.padding.xl : metrics.padding.lg,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: IS_TABLET ? metrics.padding.md : metrics.padding.lg,
    paddingHorizontal: IS_TABLET ? metrics.padding.lg : metrics.padding.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: IS_TABLET ? metrics.borderRadius.md : metrics.borderRadius.lg,
    marginBottom: IS_TABLET ? metrics.margin.md : metrics.margin.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuItemIcon: {
    width: IS_TABLET ? ICON_BOX_T : metrics.scale(48),
    height: IS_TABLET ? ICON_BOX_T : metrics.scale(48),
    borderRadius: IS_TABLET ? metrics.borderRadius.md : metrics.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: IS_TABLET ? metrics.margin.lg : metrics.margin.lg,
  },
  menuItemTitle: {
    fontSize: IS_TABLET ? metrics.fontSize.lg : metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '600',
    marginBottom: metrics.margin.xxs,
  },
  menuItemSubtitle: {
    fontSize: IS_TABLET ? metrics.fontSize.sm : metrics.fontSize.sm,
    color: Colors.lightText,
    opacity: 0.65,
  },
  menuItemArrow: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: IS_TABLET ? metrics.padding.sm : metrics.padding.xs,
    borderRadius: metrics.borderRadius.circle,
    alignSelf: 'center',
  },

  // FORMLAR
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    paddingVertical: IS_TABLET ? 10 : 10,
    paddingHorizontal: IS_TABLET ? 12 : 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: IS_TABLET ? metrics.fontSize.sm : metrics.fontSize.sm,
  },
  smallBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: IS_TABLET ? 10 : 10,
    paddingHorizontal: IS_TABLET ? 14 : 14,
    borderRadius: metrics.borderRadius.lg,
    alignSelf: 'flex-start',
    marginTop: metrics.margin.xs,
  },
  smallBtnText: {
    color: Colors.lightText,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontSize: IS_TABLET ? metrics.fontSize.sm : metrics.fontSize.sm,
  },
  verifyBlock: { gap: 8 },

  actionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: IS_TABLET ? 12 : 12,
    paddingHorizontal: IS_TABLET ? 16 : 16,
    borderRadius: metrics.borderRadius.lg,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: Colors.lightText,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontSize: IS_TABLET ? metrics.fontSize.sm : metrics.fontSize.sm,
  },

  // LOGOUT
  logoutContainer: {
    paddingHorizontal: IS_TABLET ? 0 : metrics.padding.lg,
    paddingVertical: metrics.padding.sm,
    width: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  logoutButton: { width: '100%' },
  logoutGradient: { borderRadius: metrics.borderRadius.lg, overflow: 'hidden' },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: IS_TABLET ? metrics.padding.md : metrics.padding.md,
  },
  logoutIcon: { marginRight: metrics.margin.sm },
  logoutText: {
    fontSize: IS_TABLET ? metrics.fontSize.lg : metrics.fontSize.lg,
    fontWeight: '600',
    color: Colors.lightText,
    letterSpacing: 0.5,
  },
  legalContainer: {
    paddingHorizontal: IS_TABLET ? metrics.padding.lg : metrics.padding.lg,
    paddingBottom: metrics.padding.sm,
    alignItems: 'center',
    marginTop: metrics.margin.md,
  },
  legalText: {
    fontSize: IS_TABLET ? metrics.fontSize.sm : metrics.fontSize.sm,
    color: Colors.lightText,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});


export default Settings;
