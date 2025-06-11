import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useFavoritesStore } from '../store/favoritesStore';
import { Colors } from '../constants/colors';

const IMAGE_BASE_URL = 'https://api.aikuaiplatform.com';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Favorites = () => {
  const navigation = useNavigation();
  const { favorites, removeFromFavorites } = useFavoritesStore();

  const handleRemoveFavorite = (startupId: string) => {
    console.log(`Favorites.tsx - Attempting to remove ID: ${startupId}`);
    removeFromFavorites(startupId);
  };

  const renderItem = ({ item }: { item: any }) => {
    console.log(`Favorites.tsx - Rendering: ${item.name}, ID: ${item.id}, isHighlighted: ${item.isHighlighted}`);
    return (
      <View style={[styles.cardContainer, item.isHighlighted && styles.highlightedCard]}>
        <View style={styles.cardContent}>
          <View style={styles.contentContainer}>
            <View style={styles.companyHeader}>
              {item.isHighlighted && (
                <View style={styles.highlightedBadge}>
                  <Icon name="star" size={16} color="#FFD700" />
                </View>
              )}
              {item.logo ? (
                <Image
                  source={{
                    uri: item.logo.startsWith('http')
                      ? item.logo
                      : `${IMAGE_BASE_URL}${item.logo}`,
                  }}
                  style={styles.companyLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.placeholderLogo}>
                  <Icon name="business" size={24} color="#666" />
                </View>
              )}
              <View style={styles.companyNameContainer}>
                <PaperText style={styles.companyName}>{item.name}</PaperText>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => handleRemoveFavorite(item.id)}
                >
                  <Icon name="heart" size={24} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Description</PaperText>
              <PaperText style={styles.description}>
                {item.description || 'No description available'}
              </PaperText>
            </View>
          </View>
          {item.website && (
            <TouchableOpacity
              style={styles.visitButton}
              onPress={() => Linking.openURL(item.website)}
            >
              <PaperText style={styles.visitButtonText}>Visit</PaperText>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#3B82F7" />
        </TouchableOpacity>
        <PaperText style={styles.header}>Favorites</PaperText>
        <View style={styles.placeholder} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="heart-outline" size={64} color="rgba(255,255,255,0.3)" />
          <PaperText style={styles.emptyText}>No favorites yet</PaperText>
          <PaperText style={styles.emptySubtext}>
            Add startups to your favorites to see them here
          </PaperText>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },
  list: {
    paddingBottom: 20,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 32,
    marginBottom: 18,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    marginTop: 18,
  },
  highlightedCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  cardContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  highlightedBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
    zIndex: 1,
  },
  companyNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  companyLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
  },
  placeholderLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  detail: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  favoriteButton: {
    padding: 8,
  },
  visitButton: {
    backgroundColor: '#3B82F7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  visitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});

export default Favorites; 