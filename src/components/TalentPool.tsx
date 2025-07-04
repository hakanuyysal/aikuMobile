import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Platform, SafeAreaView } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { metrics } from '../constants/aikuMetric';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RootStackParamList = {
  TalentPool: undefined;
  TrainingDetail: undefined;
};

const TalentPoolScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <LinearGradient
      colors={['#1A1E29', '#3B82F740']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color="#3B82F7" />
          </TouchableOpacity>
          <PaperText style={styles.header}>Discover Skilled Developers</PaperText>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <PaperText style={styles.subtext}>
            Connect with pre-qualified tech talent ready to contribute immediately.
          </PaperText>

          <PaperText style={styles.sectionTitle}>Our Trainings</PaperText>
          <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => navigation.navigate('TrainingDetail')}
          >
            <View style={styles.contentContainer}>
              <View style={styles.imageContainer}>
                <LinearGradient
                  colors={['rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)']}
                  style={styles.spotlight}
                  start={{ x: 0.4, y: 1 }}
                  end={{ x: 0, y: 0.2 }}
                />
                <Image
                  source={require('../assets/images/aidevedu.png')}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.infoContainer}>
                <View style={styles.textContainer}>
                  <PaperText style={styles.type} numberOfLines={1} ellipsizeMode="tail">
                    Training
                  </PaperText>
                  <PaperText style={styles.brandName} numberOfLines={1} ellipsizeMode="tail">
                    AI Developer Training
                  </PaperText>
                </View>
                <View style={styles.priceContainer}>
                  <PaperText style={styles.price} numberOfLines={1} ellipsizeMode="tail">
                    Details
                  </PaperText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TalentPoolScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: '#1A1E29' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 32 : 0,
    paddingHorizontal: 16,
  },
  backButton: { marginRight: 10 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
subtext: {
    fontSize: 15,
    color: '#ccc',
    
    paddingHorizontal: 24, // veya metrics.padding.lg
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop:20,
    textAlign: 'center',
    
    marginLeft: 20,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 40,
    height: 80,
    marginBottom: 15,
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
    marginTop: 10,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  imageContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlight: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 50,
    top: -5,
    left: -5,
    zIndex: 0,
    opacity: 0.8,
  },
  image: {
    width: 44,
    height: 50,
    zIndex: 1,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
  },
  type: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
    marginLeft: 20,
  },
  brandName: {
    color: Colors.lightText,
    fontSize: 16,
    marginBottom: 2,
    marginLeft: 20,
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 20,
    marginTop: 35,
  },
  price: {
    color: Colors.lightText,
    fontSize: 15,
    opacity: 0.8,
  },
});