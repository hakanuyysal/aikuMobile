import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet } from 'react-native';
import { Text as PaperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { Company } from '../services/companyService';
import metrics from '../constants/aikuMetric';
import { Linking } from 'react-native';

interface CompanyCardProps {
  item: Company;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

const CompanyCard = ({ item, onToggleFavorite, isFavorite }: CompanyCardProps) => {
  console.log(`CompanyCard render for ${item.companyName} (ID: ${item._id}). isFavorite: ${isFavorite}`);
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <TouchableOpacity 
      style={[styles.cardContainer, item.isHighlighted && styles.highlightedCard]}
      onPress={() => item.companyWebsite && Linking.openURL(item.companyWebsite)}
    >
      <View style={styles.cardContent}>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            {item.companyLogo ? (
              <Image
                source={{ uri: item.companyLogo }}
                style={styles.companyLogo}
                resizeMode="contain"
                defaultSource={require('../assets/images/defaultCompanyLogo.png')}
              />
            ) : (
              <View style={styles.placeholderLogo}>
                <Icon name="business" size={24} color="#666" />
              </View>
            )}
            
            <View style={styles.companyNameContainer}>
              <PaperText style={styles.companyName} numberOfLines={1}>
                {item.companyName}
              </PaperText>
            </View>

            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
            >
              <Icon
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#ff4081" : "rgba(255,255,255,0.7)"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <PaperText style={styles.detailLabel}>Sector</PaperText>
              <PaperText style={styles.detailValue} numberOfLines={1}>
                {Array.isArray(item.companySector) ? item.companySector.join(', ') : 'N/A'}
              </PaperText>
            </View>
          </View>

          <PaperText style={styles.description} numberOfLines={3}>
            {item.companyInfo || 'No description available'}
          </PaperText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: metrics.WIDTH - metrics.padding.md * 2,
    minHeight: metrics.scale(180),
    marginBottom: metrics.margin.lg,
    alignSelf: 'center',
    borderRadius: metrics.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: metrics.padding.md,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.margin.md,
  },
  companyNameContainer: {
    flex: 1,
    marginLeft: metrics.margin.md,
  },
  companyLogo: {
    width: metrics.scale(50),
    height: metrics.scale(50),
    borderRadius: metrics.borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  placeholderLogo: {
    width: metrics.scale(50),
    height: metrics.scale(50),
    borderRadius: metrics.borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    fontSize: metrics.fontSize.lg,
    fontWeight: '600',
    color: '#fff',
    marginBottom: metrics.margin.xs,
  },
  detailsContainer: {
    marginBottom: metrics.margin.md,
    paddingHorizontal: metrics.padding.xs,
  },
  detail: {
    marginBottom: metrics.margin.sm,
  },
  detailLabel: {
    fontSize: metrics.fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: metrics.margin.xxs,
  },
  detailValue: {
    fontSize: metrics.fontSize.md,
    color: '#fff',
    fontWeight: '500',
  },
  description: {
    fontSize: metrics.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: metrics.scale(20),
    marginBottom: metrics.margin.md,
    paddingHorizontal: metrics.padding.xs,
  },
  favoriteButton: {
    padding: metrics.padding.xs,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: metrics.borderRadius.circle,
    marginLeft: metrics.margin.sm,
  },
});

export default CompanyCard;