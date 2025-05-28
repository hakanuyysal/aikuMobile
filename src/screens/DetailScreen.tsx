import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
// API servisinizden detay çekme fonksiyonunu import edin
// import ApiService from '../services/apiService';
import { SearchResult } from '../services/searchService';

// Navigasyon tiplerinizi burada tanımlayın (MapScreen.tsx'deki ile aynı olmalı)
type RootStackParamList = {
  DetailScreen: { itemId: number; itemType: string; };
  // other screens...
};

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'DetailScreen'>;

const DetailScreen = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const { itemId, itemType } = route.params;

  const [itemDetails, setItemDetails] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // **BURAYA API'den detay çekme kodunuzu ekleyin**
        // Örnek: const details = await ApiService.getInstance().fetchDetails(itemId, itemType);

        // Şimdilik örnek veri simülasyonu:
        const mockDetails: SearchResult = {
            id: itemId,
            type: itemType,
            name: `${itemType} ${itemId} Adı`, // Örnek isim
            latitude: 0,
            longitude: 0,
            description: `${itemType} ${itemId} Detay Açıklaması. Burası ${itemType.toLowerCase()} hakkında daha fazla bilginin görüntüleneceği yer.`, // Örnek açıklama
            icon: 'https://via.placeholder.com/150', // Örnek ikon
            sector: 'Teknoloji', // Örnek sektör
            stage: 'Seed' // Örnek aşama
        };
        setItemDetails(mockDetails);

      } catch (err: any) {
        console.error('Detay çekme hatası:', err);
        setError('Detaylar yüklenirken bir hata oluştu.');
        setItemDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [itemId, itemType]); // itemId ve itemType değiştiğinde tekrar çek

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Hata: {error}</Text>
      </View>
    );
  }

  if (!itemDetails) {
      return (
          <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Detay bulunamadı.</Text>
          </View>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: itemDetails.icon }} style={styles.itemImage} />
        <Text style={styles.itemName}>{itemDetails.name}</Text>
        <Text style={styles.itemType}>{itemDetails.type} • {itemDetails.sector}</Text>
        <Text style={styles.itemStage}>Aşama: {itemDetails.stage}</Text>
        <Text style={styles.itemDescription}>{itemDetails.description}</Text>
        {/* Burada diğer detay bilgileri gösterilebilir */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  itemImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  itemType: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  itemStage: {
    fontSize: 16,
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  itemDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#333',
  },
});

export default DetailScreen; 