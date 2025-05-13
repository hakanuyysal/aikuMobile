import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  PermissionsAndroid,
  Platform,
  TextInput,
  FlatList,
  Image,
  Linking,
  Animated, // Re-import Animated
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Text, IconButton, Surface } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from 'constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

const searchData = [
  { id: 1, type: 'Startup', name: 'Startup A', latitude: 37.7749, longitude: -122.4194, description: 'Innovative tech solutions', icon: 'https://via.placeholder.com/40' },
  { id: 2, type: 'Investment Opportunity', name: 'Investment Opportunities', latitude: 37.7840, longitude: -122.4094, description: 'PDI', icon: 'https://via.placeholder.com/40' },
  { id: 3, type: 'User', name: 'John Doe', latitude: 37.7640, longitude: -122.4294, description: 'Full-stack developer', icon: 'https://via.placeholder.com/40' },
];

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState({ latitude: 37.7749, longitude: -122.4194 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState(searchData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchWidth] = useState(new Animated.Value(SCREEN_WIDTH * 0.85));

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    const fetchLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => console.log('Location error:', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    fetchLocation();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = searchData.filter(item =>
      item.name.toLowerCase().includes(text.toLowerCase()) ||
      item.type.toLowerCase().includes(text.toLowerCase()) ||
      item.description.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredResults(filtered);
    Animated.timing(searchWidth, {
      toValue: text.length > 0 ? SCREEN_WIDTH * 0.95 : SCREEN_WIDTH * 0.85,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleItemPress = (item) => {
    const isSelected = item.id === selectedItem?.id;
    setSelectedItem(isSelected ? null : item);
  };

  const openInGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) => console.error('Google Maps error:', err));
  };

  const renderItemCard = ({ item }) => {
    const isSelected = item.id === selectedItem?.id;
    return (
      <TouchableOpacity onPress={() => handleItemPress(item)}>
        <Surface style={[styles.card, isSelected && styles.selectedCard]}>
          <Image source={{ uri: item.icon }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.type}</Text>
            {isSelected && (
              <>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => openInGoogleMaps(item.latitude, item.longitude)}
                >
                  <Icon name="google-maps" size={20} color="#FFFFFF" />
                  <Text style={styles.mapButtonText}>View on Map</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1A1E29" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search in Aiku</Text>
        <IconButton
          icon="menu"
          iconColor="#FFFFFF"
          size={28}
          onPress={() => console.log('Menu pressed')}
        />
      </View>
      <Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
        <Ionicons name="search" size={24} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search startups, events, users..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </Animated.View>
      <FlatList
        data={filteredResults}
        renderItem={renderItemCard}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No results found</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1E29',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  cardImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default MapScreen;