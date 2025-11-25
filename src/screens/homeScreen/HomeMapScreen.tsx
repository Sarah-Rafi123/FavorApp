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
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { FavorMapPopup } from '../../components/overlays';
import FilterSvg from '../../assets/icons/Filter';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import useFilterStore from '../../store/useFilterStore';
import { useFavors, useBrowseFavors } from '../../services/queries/FavorQueries';
import { Favor } from '../../services/apis/FavorApis';
import { getCertificationStatus } from '../../services/apis/CertificationApis';
import useAuthStore from '../../store/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HomeMapScreenProps {
  onListView: () => void;
  onFilter: () => void;
  onNotifications: () => void;
  navigation?: any;
}


export function HomeMapScreen({ onListView, onFilter, onNotifications, navigation }: HomeMapScreenProps) {
  const [location, setLocation] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allFavors, setAllFavors] = useState<Favor[]>([]);
  
  // Get filter store state
  const { getFilterCount, hasActiveFilters, toBrowseParams } = useFilterStore();
  const [selectedFavor, setSelectedFavor] = useState<Favor | null>(null);
  const [showFavorModal, setShowFavorModal] = useState(false);
  const [showLocationPermissionModal, setShowLocationPermissionModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEncouragementModal, setShowEncouragementModal] = useState(false);
  const [loadingFavorId, setLoadingFavorId] = useState<number | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<{
    isSubscribed: boolean;
    isKYCVerified: boolean;
    hasShownEncouragement: boolean;
  }>({ isSubscribed: false, isKYCVerified: false, hasShownEncouragement: false });
  const [currentAddress, setCurrentAddress] = useState('Getting location...');
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
  const [favorLoadingTimeout, setFavorLoadingTimeout] = useState(false);
  const mapRef = useRef<MapView>(null);
  const { user } = useAuthStore();

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
  const rawIsLoading = useFilteredData ? browseFavorsLoading : favorsLoading;
  const error = useFilteredData ? browseFavorsError : favorsError;
  
  // Improved loading state: only show loading for favors if map is ready and we don't have data yet
  const isLoading = mapReady && rawIsLoading && !favorLoadingTimeout && !currentData?.data?.favors;
  
  // Debug loading state
  useEffect(() => {
    console.log('🔍 Loading state debug:', {
      useFilteredData,
      browseFavorsLoading,
      favorsLoading,
      rawIsLoading,
      favorLoadingTimeout,
      isLoading,
      hasData: !!currentData?.data?.favors,
      favorCount: currentData?.data?.favors?.length || 0,
      mapReady
    });
  }, [useFilteredData, browseFavorsLoading, favorsLoading, rawIsLoading, favorLoadingTimeout, isLoading, currentData?.data?.favors, mapReady]);

  // Check verification status and show encouragement if needed
  const checkVerificationAndShowEncouragement = async () => {
    try {
      // Check if we've already shown the encouragement modal in this session
      const hasShownToday = await AsyncStorage.getItem(`encouragement_shown_${user?.id}_${new Date().toDateString()}`);
      if (hasShownToday) {
        setVerificationStatus(prev => ({ ...prev, hasShownEncouragement: true }));
        return;
      }

      // Check KYC certification status
      const certificationResponse = await getCertificationStatus();
      const isKYCVerified = certificationResponse.data.is_kyc_verified === 'verified';
      
      // For now, we'll assume subscription status based on user data
      // In a real app, you'd have a subscription status API call
      const isSubscribed = user?.id ? true : false; // Placeholder logic
      
      setVerificationStatus({
        isKYCVerified,
        isSubscribed,
        hasShownEncouragement: false
      });
      
      // Show encouragement if user is not fully verified/subscribed
      if (!isKYCVerified || !isSubscribed) {
        setShowEncouragementModal(true);
      }
    } catch (error) {
      console.error('Error checking verification status for encouragement:', error);
    }
  };

  const handleSkipEncouragement = async () => {
    try {
      // Store that we've shown the encouragement today
      await AsyncStorage.setItem(`encouragement_shown_${user?.id}_${new Date().toDateString()}`, 'true');
      setShowEncouragementModal(false);
      setVerificationStatus(prev => ({ ...prev, hasShownEncouragement: true }));
    } catch (error) {
      console.error('Error storing encouragement skip status:', error);
      setShowEncouragementModal(false);
    }
  };

  useEffect(() => {
    checkLocationPermission();
    
    // Check verification status after a short delay to let the screen load
    if (user?.id) {
      const timer = setTimeout(() => {
        checkVerificationAndShowEncouragement();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  // Add loading timeout to prevent infinite loading
  useEffect(() => {
    if (rawIsLoading && mapReady) {
      setFavorLoadingTimeout(false);
      const timeout = setTimeout(() => {
        console.log('⏰ Favor loading timeout reached - hiding loading indicator');
        setFavorLoadingTimeout(true);
      }, 8000); // 8 second timeout
      
      return () => clearTimeout(timeout);
    } else if (!rawIsLoading) {
      setFavorLoadingTimeout(false);
    }
  }, [rawIsLoading, mapReady]);


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

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
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
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });
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
    }
  };

  const handleMarkerPress = useCallback((favor: Favor) => {
    setLoadingFavorId(favor.id);
    setSelectedFavor(favor);
    
    // Add slight delay to show loading state, then show modal
    setTimeout(() => {
      setLoadingFavorId(null);
      setShowFavorModal(true);
    }, 300);
  }, []);


  // Memoized markers to prevent re-rendering on every update
  const favorMarkers = useMemo(() => {
    // Remove duplicates by favor ID first
    const uniqueFavors = allFavors.filter((favor, index, self) => 
      index === self.findIndex(f => f.id === favor.id)
    );
    
    return uniqueFavors.map((favor, index) => {
      const coordinates = parseLatLng(favor.lat_lng);
      if (!coordinates) return null;
      
      return (
        <Marker
          key={`favor-${favor.id}-${index}`}
          coordinate={coordinates}
          title={favor.title || favor.favor_subject.name}
          description={`$${parseFloat((favor.tip || 0).toString()).toFixed(2)}`}
          onPress={() => handleMarkerPress(favor)}
        >
          {loadingFavorId === favor.id && (
            <View className="bg-white rounded-full p-2 shadow-lg border-2 border-green-500">
              <ActivityIndicator size="small" color="#44A27B" />
            </View>
          )}
        </Marker>
      );
    }).filter(Boolean);
  }, [allFavors, parseLatLng, handleMarkerPress, loadingFavorId]);

  // Memoized current location marker (could be live GPS or selected location)
  const currentLocationMarker = useMemo(() => {
    if (!location || !mapReady) return null;
    
    const isLiveLocation = !selectedLocation;
    
    return (
      <>
        <Circle
          key="current-circle"
          center={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          radius={5000}
          fillColor={isLiveLocation ? "rgba(68, 162, 123, 0.1)" : "rgba(59, 130, 246, 0.1)"}
          strokeColor={isLiveLocation ? "rgba(68, 162, 123, 0.8)" : "rgba(59, 130, 246, 0.8)"}
          strokeWidth={2}
        />
        <Marker
          key="current-marker"
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
          title={isLiveLocation ? "Your Location" : "Selected Location"}
          description={currentAddress}
        >
          <View className={`w-4 h-4 rounded-full border-2 ${
            isLiveLocation 
              ? 'bg-green-500 border-green-600' 
              : 'bg-blue-500 border-blue-600'
          }`} />
        </Marker>
      </>
    );
  }, [location, mapReady, selectedLocation, currentAddress]);

  // Memoized live location indicator (small marker when viewing selected location)
  const liveLocationIndicator = useMemo(() => {
    if (!liveLocation || !mapReady || !selectedLocation) return null;
    
    return (
      <Marker
        key="live-indicator"
        coordinate={{
          latitude: liveLocation.latitude,
          longitude: liveLocation.longitude,
        }}
        anchor={{ x: 0.5, y: 0.5 }}
        title="Your Live Location"
        description="Tap GPS button to return here"
      >
        <View className="w-3 h-3 bg-green-400 rounded-full border border-white shadow-lg" />
      </Marker>
    );
  }, [liveLocation, mapReady, selectedLocation]);

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
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

      {/* Map View / List View Toggle */}
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

      {/* Loading indicator for favors */}
      {isLoading && (
        <View className="absolute top-40 left-6 right-6 z-10 bg-white rounded-lg p-3 shadow-lg flex-row items-center">
          <ActivityIndicator size="small" color="#44A27B" />
          <Text className="ml-3 text-gray-600">Loading favors...</Text>
        </View>
      )}
      
      {/* Loading indicator for map */}
      {!mapReady && (
        <View className="absolute top-40 left-6 right-6 z-10 bg-white rounded-lg p-3 shadow-lg flex-row items-center">
          <ActivityIndicator size="small" color="#44A27B" />
          <Text className="ml-3 text-gray-600">Loading map...</Text>
        </View>
      )}

      {/* Error indicator for favors */}
      {error && (
        <View className="absolute top-40 left-6 right-6 z-10 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg">
          <Text className="text-red-600 text-sm">Failed to load favors</Text>
        </View>
      )}

      {/* Map */}
      <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          region={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          followsUserLocation={false}
          onMapReady={() => {
            console.log('Map is ready');
            setMapReady(true);
          }}
          loadingEnabled={true}
          loadingIndicatorColor="#44A27B"
          loadingBackgroundColor="#f0f0f0"
          moveOnMarkerPress={false}
          pitchEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {/* Current Location Marker (live GPS or selected) */}
          {currentLocationMarker}

          {/* Live Location Indicator (when viewing selected location) */}
          {liveLocationIndicator}

          {/* Real Favor Markers */}
          {favorMarkers}
        </MapView>
      </View>

      {/* Location Display Field */}
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

      {/* GPS Location Button */}
      <View className="absolute bottom-36 right-6 z-10">
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
      {!isLoading && allFavors.length > 0 && (
        <View className="absolute bottom-28 left-6 z-10 bg-green-500 rounded-full px-3 py-2 shadow-lg">
          <Text className="text-white text-sm font-semibold">
            {allFavors.filter(favor => parseLatLng(favor.lat_lng)).length} favors on map
          </Text>
        </View>
      )}
      {/* Favor Popup Modal */}
      <FavorMapPopup
        visible={showFavorModal}
        onClose={() => {
          setShowFavorModal(false);
          setSelectedFavor(null);
        }}
        favor={selectedFavor}
        navigation={navigation}
      />
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

      {/* Encouragement Modal */}
      <Modal
        visible={showEncouragementModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipEncouragement}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 mx-6 max-w-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              🚀 Unlock Premium Benefits!
            </Text>
            
            <Text className="text-gray-600 text-center mb-6 leading-6">
              Get the most out of FavorApp by completing your verification and subscribing to premium features.
            </Text>
            
            <View className="mb-6">
              {!verificationStatus.isSubscribed && (
                <View className="flex-row items-center mb-3">
                  <View className="w-5 h-5 rounded-full mr-3 bg-blue-500">
                    <Text className="text-white text-xs text-center leading-5">💎</Text>
                  </View>
                  <Text className="text-gray-700 flex-1">Premium subscription benefits</Text>
                </View>
              )}
              
              {!verificationStatus.isKYCVerified && (
                <View className="flex-row items-center mb-3">
                  <View className="w-5 h-5 rounded-full mr-3 bg-green-500">
                    <Text className="text-white text-xs text-center leading-5">✓</Text>
                  </View>
                  <Text className="text-gray-700 flex-1">Verified status and security</Text>
                </View>
              )}
              
              <View className="flex-row items-center mb-3">
                <View className="w-5 h-5 rounded-full mr-3 bg-yellow-500">
                  <Text className="text-white text-xs text-center leading-5">⭐</Text>
                </View>
                <Text className="text-gray-700 flex-1">Access to premium features</Text>
              </View>
            </View>
            
            <View className="space-y-3">
              {!verificationStatus.isSubscribed && (
                <TouchableOpacity
                  className="py-3 px-4 bg-blue-500 rounded-xl mb-3"
                  onPress={() => {
                    setShowEncouragementModal(false);
                    navigation?.navigate('Settings', {
                      screen: 'SubscriptionsScreen'
                    });
                  }}
                >
                  <Text className="text-white text-center font-semibold">Get Premium Subscription</Text>
                </TouchableOpacity>
              )}
              
              {!verificationStatus.isKYCVerified && (
                <TouchableOpacity
                  className="py-3 px-4 bg-green-500 rounded-xl mb-3"
                  onPress={() => {
                    setShowEncouragementModal(false);
                    navigation?.navigate('Settings', {
                      screen: 'GetCertifiedScreen'
                    });
                  }}
                >
                  <Text className="text-white text-center font-semibold">Complete Verification</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                className="py-3 px-4 border border-gray-300 rounded-xl"
                onPress={handleSkipEncouragement}
              >
                <Text className="text-gray-600 text-center font-semibold">Skip for now</Text>
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