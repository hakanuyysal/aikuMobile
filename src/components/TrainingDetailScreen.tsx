import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Image, TouchableOpacity, Linking } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TrainingDetailScreen = () => {
  const navigation = useNavigation();

  const handleContactUs = () => {
    Linking.openURL('https://www.aikuaiplatform.com/trainings/ai-developer').catch((err) =>
      console.error('Error opening URL:', err)
    );
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="chevron-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <PaperText style={styles.headerTitle}>Training Details</PaperText>
        </View>

        <View style={[styles.cardContainer, styles.firstCard]}>
          <View style={styles.titleImageContainer}>
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
            <PaperText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              AI Developer Training
            </PaperText>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <PaperText style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
                Duration of Training
              </PaperText>
              <PaperText style={styles.text} numberOfLines={1} ellipsizeMode="tail">
                200 Hours (120 hours Basic + 80 hours Advanced)
              </PaperText>
              <PaperText style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
                Training Days
              </PaperText>
              <PaperText style={styles.text} numberOfLines={1} ellipsizeMode="tail">
                Monday - Wednesday - Friday - Saturday
              </PaperText>
              <PaperText style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
                Training Hours
              </PaperText>
              <PaperText style={styles.text} numberOfLines={2} ellipsizeMode="tail">
                10.00 – 14.00 (weekends) (5 lessons per day) {"\n"}
                19.30 – 22.00 (weekdays) (3 lessons per day)
              </PaperText>
              <PaperText style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
                Place of Education
              </PaperText>
              <PaperText style={styles.text} numberOfLines={1} ellipsizeMode="tail">
                Online
              </PaperText>
              <PaperText style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
                Certificate
              </PaperText>
              <PaperText style={styles.text} numberOfLines={1} ellipsizeMode="tail">
                Certificate of Achievement, Certificate of Participation
              </PaperText>
              <PaperText style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
                Employment
              </PaperText>
              <PaperText style={styles.text} numberOfLines={1} ellipsizeMode="tail">
                Internship supported
              </PaperText>
              <PaperText style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
                Schedule
              </PaperText>
              <PaperText style={styles.subSectionTitle} numberOfLines={1} ellipsizeMode="tail">
                120-Hour Foundation & AI Training
              </PaperText>
              <PaperText style={styles.subSectionTitle} numberOfLines={1} ellipsizeMode="tail">
                80-Hour Advanced AI Training
              </PaperText>
            </View>
          </View>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactUs}>
            <PaperText style={styles.contactButtonText}>Contact Us</PaperText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default TrainingDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  cardContainer: {
    width: SCREEN_WIDTH - 40,
    height: 'auto',
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
    padding: 10,
  },
  firstCard: {
    minHeight: 340,
    position: 'relative',
  },
  titleImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft:10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
    marginBottom: 6,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aad4ff',
    marginTop: 10,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#eee',
    lineHeight: 22,
  },
  contactButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#0057ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});