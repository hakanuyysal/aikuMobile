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
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Text, IconButton, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/colors';

const { height, width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPACT_HEIGHT = height * 0.4;
const EXPANDED_HEIGHT = height * 0.8;

const getBase64Image = (imagePath) => {
  // This is a workaround since require() images need to be displayed in WebView
  const imageAsset = Image.resolveAssetSource(imagePath);
  return imageAsset.uri;
};

const MapScreen = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapHeight] = useState(new Animated.Value(COMPACT_HEIGHT));
  const [userLocation, setUserLocation] = useState({ latitude: 37.7749, longitude: -122.4194 });
  const [selectedStartup, setSelectedStartup] = useState(null);
  const webViewRef = useRef(null);

  const toggleMapSize = () => {
    Animated.timing(mapHeight, {
      toValue: isExpanded ? COMPACT_HEIGHT : EXPANDED_HEIGHT,
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
      if (!hasPermission) {return;}

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        error => console.log('Konum alınamadı:', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    fetchLocation();
  }, []);

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

  const handleCardPress = (startup) => {
    setSelectedStartup(startup.id === selectedStartup?.id ? null : startup);

    webViewRef.current.injectJavaScript(`
      map.setView([${startup.latitude}, ${startup.longitude}], 15);
      true;
    `);
  };

  const openInGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => console.error('Google Maps açılamadı:', err));
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
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
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${userLocation.latitude}, ${userLocation.longitude}], 13);
          L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=3c597e7fa8ef40f994c4f70a149bd798', {
            attribution: '© OpenMapTiles © OpenStreetMap contributors',
            maxZoom: 20
          }).addTo(map);

          L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
            icon: L.divIcon({ html: "", className: "invisible-marker", iconSize: [0, 0] })
          }).addTo(map).bindPopup('Senin Konumun');

          const startupMarkers = ${JSON.stringify(startupLocations.map(startup => ({
            ...startup,
            icon: getBase64Image(startup.icon)
          })))};
          
          startupMarkers.forEach(startup => {
            const customIcon = L.icon({
              iconUrl: startup.icon,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
              className: 'custom-icon'
            });

            L.marker([startup.latitude, startup.longitude], {
              icon: customIcon
            }).addTo(map).bindPopup(startup.name);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <LinearGradient
      colors={['#1A1E29', '#1A1E29', '#3B82F7', '#3B82F7']}
      locations={[0.1, 0.2, 0.2, 0.5]}
      start={{ x: 0, y: 0 }}
      end={{ x: 3.5, y: 0.8 }}
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
              mode="contained"
              containerColor={Colors.primary}
              iconColor={Colors.lightText}
              size={30}
              onPress={() => {}}
              style={styles.menuButton}
            />
          </Surface>

          <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: htmlContent }}
              style={{ flex: 1 }}
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
                style={styles.cardScroll}
                contentContainerStyle={styles.cardScrollContent}
                showsHorizontalScrollIndicator={false}
                horizontal
                pagingEnabled
                snapToAlignment="center"
                decelerationRate="fast"
                snapToInterval={SCREEN_WIDTH - 40} // Match with card width
              >
                {startupLocations.map((startup, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleCardPress(startup)}
                    activeOpacity={0.8}
                    style={styles.cardContainer}
                  >
                    <Surface
                      style={[
                        styles.skewContainer,
                        selectedStartup?.id === startup.id && styles.selectedCard,
                      ]}
                      elevation={3}
                    >
                      <LinearGradient
                        colors={['white', '#4966A6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />

                      <Image
                        source={startup.icon}
                        style={styles.image}
                        resizeMode="contain"
                      />

                      <TouchableOpacity
                        style={styles.mapIconButton}
                        onPress={() => openInGoogleMaps(startup.latitude, startup.longitude)}
                      >
                        <Icon name="google-maps" size={30} color={Colors.primary} />
                      </TouchableOpacity>

                      <View style={styles.cardInfoContainer}>
                        <Text style={styles.type} variant="labelMedium">Startup</Text>
                        <Text style={styles.name} variant="titleLarge">
                          {startup.name}
                        </Text>
                        <Text style={styles.location} variant="bodyMedium">
                          San Francisco, CA
                        </Text>
                      </View>
                    </Surface>
                  </TouchableOpacity>
                ))}
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
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
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
    justifyContent: 'center',
  },
  menuButton: {
    margin: 0,
  },
  mapContainer: {
    width: '100%',
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
    padding: 20,
    paddingHorizontal: 0, // Remove horizontal padding
  },
  cardScroll: {
    marginTop: 10,
  },
  cardScrollContent: {
    paddingHorizontal: 0, // Remove horizontal padding
    paddingBottom: 10,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 70, // Match with snapToInterval
    height: 250,
    marginBottom: '10%',
    alignSelf: 'center',
    justifyContent: 'center',
    marginHorizontal: 20, // Half of the padding difference (40/2)
    marginRight: 2,
  },
  skewContainer: {
    width: '100%',
    height: '98%',
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    transform: [{ skewY: '0deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  image: {
    width: '40%', // Slightly smaller image
    height: '40%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: 'transparent', // Add this to ensure transparent background
  },
  mapIconButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardInfoContainer: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingLeft: 24, // Add left padding for text
  },
  type: {
    color: Colors.inactive,
    marginBottom: 2,
    fontSize: 15,
  },
  name: {
    fontWeight: '300',
    color: Colors.lightText,
    marginBottom: 6,
    fontSize: 15,
  },
  location: {
    color: Colors.lightText,
    fontSize: 13,
  },
});

export default MapScreen;
