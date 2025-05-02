import React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../constants/colors';
import metrics from '../constants/aikuMetric';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'CompanyDetails'>;

const CompanyDetails = ({navigation}: Props) => {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Company Details',
      headerTitleStyle: {
        fontSize: metrics.fontSize.xl,
        fontWeight: 'bold',
        color: Colors.lightText,
      },
    });
  }, [navigation]);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content}>

          {/* Turkau Mining Card */}
          <TouchableOpacity style={styles.companyCard}>
            <Image
              source={{
                uri: 'https://turkaumining.vercel.app/static/media/turkau-logo.904055d9d6e7dd0213c5.png'
              }}
              style={styles.companyLogo}
              resizeMode="contain"
            />
            <Text style={styles.companyName}>Turkau Mining</Text>
          </TouchableOpacity>

          {/* Add New Company Card */}
          <TouchableOpacity style={styles.addCompanyCard}>
            <Icon name="add-business" size={24} color={Colors.primary} />
            <Text style={styles.addCompanyText}>Add New Company</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: metrics.padding.md,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.lightText,
    marginBottom: metrics.margin.lg,
  },
  companyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  companyLogo: {
    width: 50,
    height: 50,
    marginRight: metrics.margin.md,
  },
  companyName: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '500',
  },
  addCompanyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: metrics.borderRadius.lg,
    padding: metrics.padding.lg,
    marginBottom: metrics.margin.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addCompanyText: {
    fontSize: metrics.fontSize.lg,
    color: Colors.lightText,
    fontWeight: '500',
    marginLeft: metrics.margin.md,
  },
});

export default CompanyDetails; 