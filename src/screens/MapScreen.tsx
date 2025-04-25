import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Image,
  ScrollView,
  Linking,
  TextInput,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Text, IconButton, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';

const { width: SCREEN_WIDTH, height } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_SPACING = 12;
const CARD_OFFSET = (SCREEN_WIDTH - CARD_WIDTH) / 2.5;

const getBase64Image = (imagePath) => {
  const imageAsset = Image.resolveAssetSource(imagePath);
  return imageAsset.uri;
};

const startupLocations = [
  {
    id: 1,
    name: 'Startup A',
    latitude: 37.7749,
    longitude: -122.4194,
    icon: require('../assets/images/Alohaicon.png'),
  },
  {
    id: 2,
    name: 'Startup B',
    latitude: 37.7840,
    longitude: -122.4094,
    icon: require('../assets/images/Alohaicon.png'),
  },
  {
    id: 3,
    name: 'Startup C',
    latitude: 37.7640,
    longitude: -122.4294,
    icon: require('../assets/images/Alohaicon.png'),
  },
];

const MapScreen = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapHeight] = useState(new Animated.Value(height * 0.35));
  const [userLocation, setUserLocation] = useState({ latitude: 37.7749, longitude: -122.4194 });
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStartups, setFilteredStartups] = useState(startupLocations);
  const webViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const toggleMapSize = () => {
    Animated.timing(mapHeight, {
      toValue: isExpanded ? height * 0.35 : height * 0.7,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

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
      if (!hasPermission) {
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => console.log('Konum alınamadı:', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    fetchLocation();
  }, []);

  const handleCardPress = (startup) => {
    setSelectedStartup(startup.id === selectedStartup?.id ? null : startup);

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        map.setView([${startup.latitude}, ${startup.longitude}], 15);
        true;
      `);
    }
  };

  const openInGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) => console.error('Google Maps açılamadı:', err));
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = startupLocations.filter(startup =>
      startup.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredStartups(filtered);
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" 
              onerror="document.getElementById('map').innerHTML='Failed to load Leaflet CSS';" />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          .invisible-marker { display: none; }
          .leaflet-marker-icon {
            background: none !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
                onerror="document.getElementById('map').innerHTML='Failed to load Leaflet JS';"></script>
        <script>
          try {
            var map = L.map('map').setView([${userLocation.latitude}, ${userLocation.longitude}], 13);
            L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=3c597e7fa8ef40f994c4f70a149bd798', {
              attribution: '© OpenMapTiles © OpenStreetMap contributors',
              maxZoom: 20
            }).addTo(map);

            L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
              icon: L.divIcon({ html: "", className: "invisible-marker", iconSize: [0, 0] })
            }).addTo(map).bindPopup('Senin Konumun');

            const startupMarkers = ${JSON.stringify(
              startupLocations.map((startup) => ({
                ...startup,
                icon: getBase64Image(startup.icon),
              }))
            )};
            
            startupMarkers.forEach((startup) => {
              const customIcon = L.icon({
                iconUrl: startup.icon,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
                className: 'custom-icon',
              });

              L.marker([startup.latitude, startup.longitude], { // Fixed syntax error
                icon: customIcon,
              })
                .addTo(map)
                .bindPopup(startup.name);
            });
          } catch (error) {
            console.error('Map loading error:', error);
            document.getElementById('map').innerHTML = 'Error loading map: ' + error.message;
          }
        </script>
      </body>
    </html>
  `;

  const renderStartupCard = (startup, index) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1.1, 0.85],
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.75, 1, 0.75],
    });

    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ['25deg', '0deg', '-25deg'],
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, 30],
    });

    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [-15, 0, 15],
    });

    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => handleCardPress(startup)}>
        <Animated.View
          key={String(startup.id)}
          style={[
            styles.cardContainer,
            {
              width: CARD_WIDTH,
              marginHorizontal: CARD_SPACING / 2,
              transform: [
                { scale },
                { rotateY },
                { translateY },
                { translateX },
                { perspective: 1500 },
              ],
              opacity,
            },
          ]}
        >
          <Surface style={[styles.skewContainer]} elevation={3}>
            <Image source={startup.icon} style={styles.image} resizeMode="contain" />
            <TouchableOpacity
              style={styles.mapIconButton}
              onPress={() => openInGoogleMaps(startup.latitude, startup.longitude)}
            >
              <Icon name="google-maps" size={30} color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.cardInfoContainer}>
              <Text style={styles.type}>Startup</Text>
              <Text style={styles.name}>{startup.name}</Text>
              <Text style={styles.location}>San Francisco, CA</Text>
            </View>
          </Surface>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.gradientBackground}
    >
      <StatusBar backgroundColor="#1A1E29" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Surface style={styles.header} elevation={0}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text variant="headlineMedium" style={styles.title}>
              Aiku
            </Text>
            <IconButton
              icon="menu"
              iconColor={Colors.lightText}
              size={30}
            />
          </Surface>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={24}
              color={Colors.lightText}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search in startups"
              placeholderTextColor={Colors.inactive}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: htmlContent }}
              style={{ flex: 1 }}
              javaScriptEnabled={true} // Ensure JavaScript is enabled
              domStorageEnabled={true} // Enable DOM storage for Leaflet
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('WebView error:', nativeEvent);
              }}
              onMessage={(event) => {
                console.log('WebView message:', event.nativeEvent.data);
              }}
            />
            <TouchableOpacity style={styles.expandButton} onPress={toggleMapSize}>
              <Icon
                name={isExpanded ? 'fullscreen-exit' : 'fullscreen'}
                size={24}
                color={Colors.white}
              />
            </TouchableOpacity>
          </Animated.View>
          {!isExpanded && (
            <View style={styles.infoContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                decelerationRate="fast"
                onScroll={(event) => {
                  const offsetX = event.nativeEvent.contentOffset.x;
                  scrollX.setValue(offsetX);
                }}
                scrollEventThrottle={16}
              >
                {filteredStartups.map((startup, index) =>
                  renderStartupCard(startup, index)
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontWeight: '700',
    color: Colors.lightText,
    flex: 1,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.lightText,
  },
  mapContainer: {
    marginTop: 10,
    width: CARD_WIDTH * 1.2,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  expandButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 8,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: CARD_OFFSET,
  },
  cardContainer: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    marginTop: 20,
  },
  skewContainer: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: `${Colors.cardBackground}dd`,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  cardInfoContainer: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  type: {
    color: Colors.inactive,
    fontSize: 14,
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.lightText,
  },
  location: {
    color: Colors.inactive,
    fontSize: 16,
  },
  image: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginBottom: 16,
  },
  mapIconButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(59, 130, 247, 0.1)',
    borderRadius: 20,
    padding: 8,
  },
});

export default MapScreen;