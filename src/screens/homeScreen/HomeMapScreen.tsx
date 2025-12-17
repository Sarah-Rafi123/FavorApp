import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarHeight } from '../../utils/systemUI';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { FavorMapPreviewModal } from '../../components/overlays';
import FilterSvg from '../../assets/icons/Filter';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import useFilterStore from '../../store/useFilterStore';
import { useFavors, useBrowseFavors } from '../../services/queries/FavorQueries';
import { Favor } from '../../services/apis/FavorApis';

interface HomeMapScreenProps {
  onListView: () => void;
  onFilter: () => void;
  onNotifications: () => void;
}


export function HomeMapScreen({ onListView, onFilter, onNotifications }: HomeMapScreenProps) {
  const [location, setLocation] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allFavors, setAllFavors] = useState<Favor[]>([]);
  
  // Get filter store state
  const { getFilterCount, hasActiveFilters, toBrowseParams } = useFilterStore();
  const [selectedFavor, setSelectedFavor] = useState<Favor | null>(null);
  const [showFavorModal, setShowFavorModal] = useState(false);
  const [showLocationPermissionModal, setShowLocationPermissionModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('Your Location');
  const [tempLocation, setTempLocation] = useState('');
  const [liveLocation, setLiveLocation] = useState<any>(null); // User's actual GPS location
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(null); // Currently viewed location
  const [mapRegion, setMapRegion] = useState({
    latitude: 42.9957, // Wyoming center
    longitude: -107.5512,
    latitudeDelta: 5.0, // Show entire state
    longitudeDelta: 5.0,
  });
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadingTimeout, setMapLoadingTimeout] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const mapReadyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const tabBarHeight = getTabBarHeight(insets.bottom);

  // Use browseFavors when filters are active, useFavors when not
  const useFilteredData = hasActiveFilters();

  // Fetch filtered favors when filters are active
  const { 
    data: browseFavorsData, 
    isLoading: browseFavorsLoading, 
    error: browseFavorsError, 
  } = useBrowseFavors(
    toBrowseParams(currentPage, 50), // Get more favors for map view
    { enabled: useFilteredData }
  );

  // Fetch regular favors when no filters are active
  const { 
    data: favorsData, 
    isLoading: favorsLoading, 
    error: favorsError, 
  } = useFavors(
    currentPage, 
    50, // Get more favors for map view
    { enabled: !useFilteredData }
  );

  // Use the appropriate data source
  const currentData = useFilteredData ? browseFavorsData : favorsData;
  const isFavorsLoading = useFilteredData ? browseFavorsLoading : favorsLoading;
  const error = useFilteredData ? browseFavorsError : favorsError;

  // Calculate overall loading state - show loader when any major component is loading
  const isMainLoading = !mapReady || isGettingLocation || (isFavorsLoading && !currentData);

  useEffect(() => {
    checkLocationPermission();
    
    // Set a timeout for map loading (especially important for Android)
    mapReadyTimeoutRef.current = setTimeout(() => {
      if (!mapReady) {
        console.log('Map loading timeout - forcing ready state (Android workaround)');
        setMapLoadingTimeout(true);
        setMapReady(true); // Force map ready for Android
      }
    }, 10000); // 10 second timeout
    
    return () => {
      if (mapReadyTimeoutRef.current) {
        clearTimeout(mapReadyTimeoutRef.current);
      }
    };
  }, [mapReady]);


  // Update allFavors when new data arrives - prevent infinite loops
  useEffect(() => {
    if (currentData?.data?.favors && Array.isArray(currentData.data.favors)) {
      const newFavors = currentData.data.favors;
      setAllFavors(newFavors);
    }
  }, [currentData?.data?.favors]);

  // Memoized function to parse lat_lng string into coordinates
  const parseLatLng = useCallback((latLngString?: string) => {
    if (!latLngString) return null;
    
    try {
      // Expecting format like "40.7128,-74.0060" or "40.7128, -74.0060"
      const parts = latLngString.split(',').map(part => parseFloat(part.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return {
          latitude: parts[0],
          longitude: parts[1]
        };
      }
    } catch (error) {
      console.error('Error parsing lat_lng:', error);
    }
    return null;
  }, []);

  // Generate HTML for WebView-based Google Maps
  const generateMapHTML = useCallback(() => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
    const centerLat = location?.latitude || mapRegion.latitude;
    const centerLng = location?.longitude || mapRegion.longitude;
    const zoom = 13;

    // Generate markers for favors
    const favorMarkerPoints = allFavors.map(favor => {
      const coords = parseLatLng(favor.lat_lng);
      if (!coords) return null;

      // Determine if favor is paid
      const isPaid = favor.favor_price === 'paid' || (favor.tip && parseFloat(favor.tip.toString()) > 0);
      
      // Get priority-based colors
      let fillColor, strokeColor;
      switch (favor.priority) {
        case 'immediate':
          fillColor = '#FFEBEE'; // Light red
          strokeColor = '#DC2626'; // Red
          break;
        case 'delayed':
          fillColor = '#FFFEE4'; // Light mustard
          strokeColor = '#EFD351'; // Mustard
          break;
        case 'no_rush':
          fillColor = '#DCFFD9'; // Light green
          strokeColor = '#44D436'; // Green
          break;
        default:
          fillColor = '#F3F4F6'; // Light gray
          strokeColor = '#6B7280'; // Gray
      }

      return {
        lat: coords.latitude,
        lng: coords.longitude,
        title: favor.title || favor.favor_subject.name,
        description: `$${parseFloat((favor.tip || 0).toString()).toFixed(2)}`,
        id: favor.id,
        fillColor,
        strokeColor,
        isPaid
      };
    }).filter(Boolean);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
            body {
                margin: 0;
                padding: 0;
                height: 100vh;
                font-family: Arial, sans-serif;
            }
            #map {
                height: 100%;
                width: 100%;
            }
            .info-window {
                font-size: 14px;
                max-width: 200px;
            }
            .info-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
            }
            .info-price {
                color: #44A27B;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <script async defer 
            src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=geometry">
        </script>
        
        <script>
            let map;
            let markers = [];
            let currentLocationMarker;
            let currentLocationCircle;
            
            function initMap() {
                map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: ${centerLat}, lng: ${centerLng} },
                    zoom: ${zoom},
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER
                    },
                    gestureHandling: 'greedy',
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        }
                    ]
                });

                // Add current location marker and circle
                if (${centerLat} && ${centerLng}) {
                    currentLocationCircle = new google.maps.Circle({
                        strokeColor: '#44A27B',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#44A27B',
                        fillOpacity: 0.1,
                        map: map,
                        center: { lat: ${centerLat}, lng: ${centerLng} },
                        radius: 5000
                    });

                    currentLocationMarker = new google.maps.Marker({
                        position: { lat: ${centerLat}, lng: ${centerLng} },
                        map: map,
                        title: '${selectedLocation ? 'Selected Location' : 'Your Location'}',
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: '${selectedLocation ? '#3B82F6' : '#44A27B'}',
                            fillOpacity: 1,
                            strokeWeight: 1,
                            strokeColor: '${selectedLocation ? '#1E40AF' : '#059669'}'
                        }
                    });
                }

                // Add favor markers
                ${JSON.stringify(favorMarkerPoints)}.forEach(function(favor) {
                    if (favor) {
                        // Create custom marker with dollar sign for paid favors
                        let markerIcon;
                        if (favor.isPaid) {
                            // Create custom dollar sign marker
                            markerIcon = {
                                url: 'data:image/svg+xml;base64,' + btoa(\`
                                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" fill="\${favor.fillColor}" stroke="\${favor.strokeColor}" stroke-width="2"/>
                                        <text x="12" y="17" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="\${favor.strokeColor}">$</text>
                                    </svg>
                                \`),
                                scaledSize: new google.maps.Size(24, 24),
                                anchor: new google.maps.Point(12, 12)
                            };
                        } else {
                            // Use regular circle marker for free favors
                            markerIcon = {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 10,
                                fillColor: favor.fillColor,
                                fillOpacity: 0.9,
                                strokeWeight: 2,
                                strokeColor: favor.strokeColor
                            };
                        }

                        const marker = new google.maps.Marker({
                            position: { lat: favor.lat, lng: favor.lng },
                            map: map,
                            title: favor.title,
                            icon: markerIcon
                        });

                        const infoWindow = new google.maps.InfoWindow({
                            content: \`
                                <div class="info-window">
                                    <div class="info-title">\${favor.title}</div>
                                    <div class="info-price">\${favor.description}</div>
                                </div>
                            \`
                        });

                        marker.addListener('click', function() {
                            // Close all other info windows
                            markers.forEach(m => m.infoWindow && m.infoWindow.close());
                            
                            infoWindow.open(map, marker);
                            
                            // Send message to React Native
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'marker_clicked',
                                favor: favor
                            }));
                        });

                        markers.push({
                            marker: marker,
                            infoWindow: infoWindow,
                            favor: favor
                        });
                    }
                });

                // Notify React Native that map is ready
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'map_ready'
                }));
            }

            // Function to update map center
            function updateMapCenter(lat, lng, zoom = 13) {
                if (map) {
                    map.setCenter({ lat: lat, lng: lng });
                    map.setZoom(zoom);
                    
                    // Update current location marker
                    if (currentLocationMarker) {
                        currentLocationMarker.setPosition({ lat: lat, lng: lng });
                    }
                    if (currentLocationCircle) {
                        currentLocationCircle.setCenter({ lat: lat, lng: lng });
                    }
                }
            }

            // Listen for messages from React Native
            window.addEventListener('message', function(event) {
                const data = JSON.parse(event.data);
                if (data.type === 'update_center') {
                    updateMapCenter(data.lat, data.lng, data.zoom || 13);
                }
            });
        </script>
    </body>
    </html>
    `;
  }, [location, mapRegion, allFavors, parseLatLng, selectedLocation]);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setIsGettingLocation(false);
        setShowLocationPermissionModal(true);
        return;
      }

      getCurrentLocation();
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setShowLocationPermissionModal(false);
      
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        // Keep trying to get location even when permission denied initially
        setCurrentAddress('Location access needed');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setShowLocationPermissionModal(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      // Different accuracy settings for Android vs iOS
      const locationOptions = Platform.OS === 'android' 
        ? {
            accuracy: Location.Accuracy.Balanced, // Less aggressive for Android
            timeInterval: 10000,
            distanceInterval: 50,
          }
        : {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          };
      
      const currentLocation = await Location.getCurrentPositionAsync(locationOptions);
      const { latitude, longitude } = currentLocation.coords;
      
      // Set both live location and current viewing location
      setLiveLocation(currentLocation.coords);
      setLocation(currentLocation.coords);
      setSelectedLocation(null); // Clear any selected location, we're back to live location
      
      // Set map region to exact location immediately (no animation, no gradual movement)
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      
      setMapRegion(newRegion);
      
      // Update WebView map center when ready
      if (mapReady) {
        updateMapCenter(latitude, longitude);
      }
      
      // Reverse geocode to get address
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        if (addresses.length > 0) {
          const address = addresses[0];
          const formattedAddress = `${address.street || ''} ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.trim().replace(/\s+/g, ' ');
          setCurrentAddress(formattedAddress || 'Your Location');
          setTempLocation(formattedAddress || 'Your Location');
        } else {
          setCurrentAddress('Your Location');
          setTempLocation('Your Location');
        }
      } catch (geocodeError) {
        console.error('Error reverse geocoding:', geocodeError);
        setCurrentAddress('Your Location');
        setTempLocation('Your Location');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your location. Please try again.');
      // Set fallback to Wyoming
      setCurrentAddress('Wyoming, USA');
      setTempLocation('Wyoming, USA');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMarkerPress = useCallback((favor: Favor) => {
    setSelectedFavor(favor);
    setShowFavorModal(true);
  }, []);

  // Handle messages from WebView
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'map_ready':
          console.log(`WebView Map is ready on ${Platform.OS}`);
          if (mapReadyTimeoutRef.current) {
            clearTimeout(mapReadyTimeoutRef.current);
            mapReadyTimeoutRef.current = null;
          }
          setMapReady(true);
          setMapLoadingTimeout(false);
          break;
          
        case 'marker_clicked':
          // Find the favor by ID and handle marker press
          const clickedFavor = allFavors.find(f => f.id === data.favor.id);
          if (clickedFavor) {
            handleMarkerPress(clickedFavor);
          }
          break;
          
        default:
          console.log('Unknown WebView message:', data);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  }, [allFavors, handleMarkerPress]);

  // Function to update map center via WebView
  const updateMapCenter = useCallback((lat: number, lng: number, zoom: number = 13) => {
    if (webViewRef.current) {
      const message = JSON.stringify({
        type: 'update_center',
        lat: lat,
        lng: lng,
        zoom: zoom
      });
      
      webViewRef.current.postMessage(message);
    }
  }, []);

  // Update map center when location changes
  useEffect(() => {
    if (location && mapReady) {
      updateMapCenter(location.latitude, location.longitude);
    }
  }, [location, mapReady, updateMapCenter]);


  // Memoized HTML for WebView map
  const mapHTML = useMemo(() => {
    return generateMapHTML();
  }, [generateMapHTML]);

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header - Hidden during main loading */}
      {!isMainLoading && (
        <View className="absolute top-16 left-6 right-6 z-10 flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-800">Home</Text>
          <View className="flex-row gap-x-2">
            <TouchableOpacity
              className="items-center justify-center relative w-10 h-10 rounded-full"
              onPress={onFilter}
            >
              <FilterSvg />
              {getFilterCount() > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">{getFilterCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
            <NotificationBell onPress={onNotifications} />
          </View>
        </View>
      )}

      {/* Map View / List View Toggle - Hidden during main loading */}
      {!isMainLoading && (
        <View className="absolute top-28 left-6 p-2 right-6 z-10 flex-row bg-white rounded-full shadow-lg">
          <TouchableOpacity className="flex-1 py-2.5 bg-green-500 rounded-full items-center">
            <Text className="text-white font-semibold text-sm">Map View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 py-2.5 items-center"
            onPress={onListView}
          >
            <Text className="text-gray-600 font-semibold text-sm">List View</Text>
          </TouchableOpacity>
        </View>
      )}


      {/* Error indicator for favors */}
      {error && !isMainLoading && (
        <View className="absolute top-40 left-6 right-6 z-10 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg">
          <Text className="text-red-600 text-sm">Failed to load favors</Text>
        </View>
      )}

      {/* Map Timeout Warning */}
      {mapLoadingTimeout && (
        <View className="absolute top-64 left-6 right-6 z-10 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg">
          <Text className="text-yellow-800 text-sm font-medium">
            Map Loading Issue
          </Text>
          <Text className="text-yellow-700 text-xs mt-1">
            Using WebView for better {Platform.OS} compatibility. Check your internet connection.
          </Text>
        </View>
      )}

      {/* WebView Map */}
      <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
        <WebView
          ref={webViewRef}
          style={{ flex: 1 }}
          originWhitelist={['*']}
          source={{ html: mapHTML }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          onLoadEnd={() => {
            console.log(`WebView Map loaded on ${Platform.OS}`);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            setMapLoadingTimeout(true);
          }}
          // Additional WebView optimizations
          bounces={false}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          nestedScrollEnabled={true}
          androidLayerType="hardware"
        />
      </View>

      {/* Location Display Field - Hidden during main loading */}
      {!isMainLoading && (
        <View className="absolute top-52 left-6 right-6 z-50">
        <TouchableOpacity 
          onPress={() => setShowAddressModal(true)}
          className="bg-white rounded-full shadow-lg"
        >
          <View className="flex-row items-center px-4 py-3">
            <View className="w-2.5 h-2.5 bg-red-500 rounded-full mr-3"></View>
            <View className="flex-1">
              <Text className="text-gray-800 text-sm font-medium" numberOfLines={1}>
                {currentAddress}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={async (e) => {
                e.stopPropagation(); // Prevent modal from opening
                // Return to live GPS location immediately
                if (liveLocation) {
                  setLocation(liveLocation);
                  setSelectedLocation(null);
                  
                  // Reverse geocode to get current address text
                  try {
                    const addresses = await Location.reverseGeocodeAsync({
                      latitude: liveLocation.latitude,
                      longitude: liveLocation.longitude,
                    });
                    
                    if (addresses.length > 0) {
                      const address = addresses[0];
                      const formattedAddress = `${address.street || ''} ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.trim().replace(/\s+/g, ' ');
                      setCurrentAddress(formattedAddress || 'Your Location');
                    } else {
                      setCurrentAddress('Your Location');
                    }
                  } catch (geocodeError) {
                    console.error('Error reverse geocoding:', geocodeError);
                    setCurrentAddress('Your Location');
                  }
                  
                  const newRegion = {
                    latitude: liveLocation.latitude,
                    longitude: liveLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  };
                  setMapRegion(newRegion);
                  updateMapCenter(liveLocation.latitude, liveLocation.longitude);
                } else {
                  // If no live location, get it fresh
                  getCurrentLocation();
                }
              }}
              className="ml-3 bg-gray-100 rounded-full p-1.5"
            >
              <Text className="text-gray-600 text-xs">📍</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        </View>
      )}

      {/* GPS Location Button */}
      <View className="absolute left-6 z-10" style={{ bottom: tabBarHeight + 20 }}>
        <TouchableOpacity
          onPress={async () => {
            // Return to live GPS location
            if (liveLocation) {
              setLocation(liveLocation);
              setSelectedLocation(null);
              
              // Reverse geocode to get current address text
              try {
                const addresses = await Location.reverseGeocodeAsync({
                  latitude: liveLocation.latitude,
                  longitude: liveLocation.longitude,
                });
                
                if (addresses.length > 0) {
                  const address = addresses[0];
                  const formattedAddress = `${address.street || ''} ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.trim().replace(/\s+/g, ' ');
                  setCurrentAddress(formattedAddress || 'Your Location');
                } else {
                  setCurrentAddress('Your Location');
                }
              } catch (geocodeError) {
                console.error('Error reverse geocoding:', geocodeError);
                setCurrentAddress('Your Location');
              }
              
              const newRegion = {
                latitude: liveLocation.latitude,
                longitude: liveLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              };
              setMapRegion(newRegion);
              updateMapCenter(liveLocation.latitude, liveLocation.longitude);
            } else {
              // If no live location, get it fresh
              getCurrentLocation();
            }
          }}
          className={`w-12 h-12 rounded-full shadow-lg items-center justify-center ${
            selectedLocation ? 'bg-blue-500' : 'bg-white border border-gray-300'
          }`}
        >
          <Text className={`text-lg ${selectedLocation ? 'text-white' : 'text-gray-600'}`}>
            {selectedLocation ? '🎯' : '📍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Favor Counter */}
      {!isMainLoading && allFavors.length > 0 && (
        <View className="absolute left-6 z-10 bg-green-500 rounded-full px-3 py-2 shadow-lg" style={{ bottom: tabBarHeight + 70 }}>
          <Text className="text-white text-sm font-semibold">
            {allFavors.filter(favor => parseLatLng(favor.lat_lng)).length} favors on map
          </Text>
        </View>
      )}


      {/* Favor Preview Modal */}
      {selectedFavor && (
        <FavorMapPreviewModal
          visible={showFavorModal}
          onClose={() => {
            setShowFavorModal(false);
            setSelectedFavor(null);
          }}
          favor={selectedFavor}
        />
      )}

      {/* Location Permission Modal */}
      <Modal
        visible={showLocationPermissionModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 mx-6 max-w-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              Location Access
            </Text>
            <Text className="text-gray-600 text-center mb-6 leading-6">
              FavorApp needs access to your location to show nearby favors and services. This helps you find and provide help in your area.
            </Text>
            <View className="flex-row gap-x-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
                onPress={() => {
                  setShowLocationPermissionModal(false);
                  setCurrentAddress('Location access denied');
                  setIsGettingLocation(false);
                }}
              >
                <Text className="text-gray-600 text-center font-semibold">Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 px-4 bg-green-500 rounded-xl"
                onPress={requestLocationPermission}
              >
                <Text className="text-white text-center font-semibold">Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Address Search Modal */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-[#FBFFF0] mt-20 rounded-t-3xl">
            <View className="flex-row justify-between items-center p-6 border-b border-gray-300">
              <Text className="text-xl font-bold text-gray-800">Search Location</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Text className="text-gray-500 text-lg">✕</Text>
              </TouchableOpacity>
            </View>
            
            <View className="p-6 flex-1">
              <GooglePlacesAutocomplete
                placeholder="Enter your location"
                minLength={2}
                listViewDisplayed="auto"
                enablePoweredByContainer={false}
                predefinedPlaces={[]}
                currentLocation={false}
                keyboardShouldPersistTaps="handled"
                suppressDefaultStyles={false}
                textInputProps={{
                  placeholder: "Enter your location",
                  placeholderTextColor: "#9CA3AF"
                }}
                onPress={(_, details = null) => {
                  if (details) {
                    const { lat, lng } = details.geometry.location;
                    const newAddress = details.formatted_address;
                    
                    // Update current address and location
                    setCurrentAddress(newAddress);
                    setTempLocation(newAddress);
                    
                    // Set this as the new current location (not live GPS, but selected location)
                    const newLocationCoords = { latitude: lat, longitude: lng };
                    setLocation(newLocationCoords);
                    setSelectedLocation(newLocationCoords);
                    
                    // Set map region to exact selected location
                    const newRegion = {
                      latitude: lat,
                      longitude: lng,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    };
                    
                    setMapRegion(newRegion);
                    updateMapCenter(lat, lng);
                    
                    // Close the modal
                    setShowAddressModal(false);
                  }
                }}
                query={{
                  key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
                  language: 'en',
                  types: 'geocode'
                }}
                fetchDetails={true}
                styles={{
                  container: {
                    flex: 1,
                  },
                  textInputContainer: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    marginBottom: 16,
                  },
                  textInput: {
                    backgroundColor: 'transparent',
                    height: 44,
                    margin: 0,
                    padding: 0,
                    fontSize: 16,
                    color: '#374151',
                  },
                  listView: {
                    backgroundColor: 'white',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    maxHeight: 300,
                  },
                  row: {
                    backgroundColor: 'white',
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                  },
                  separator: {
                    height: 0,
                  },
                  poweredContainer: {
                    display: 'none'
                  },
                  description: {
                    fontSize: 14,
                    color: '#6B7280',
                  },
                }}
                
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}