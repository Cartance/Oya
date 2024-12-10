// MAP.JSX

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import MapView from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACES_API_KEY } from "@env";
import "react-native-get-random-values";
import AnimatedMarker from "./AnimatedMarker";

const CARD_WIDTH = Dimensions.get("window").width * 0.8;
const CARD_HEIGHT = 220;

const LocationCard = ({ place, onPress, isSelected, index }) => {
  const defaultImage =
    "https://maps.gstatic.com/tactile/pane/default_geocode-2x.png";
  const slideAnim = useRef(new Animated.Value(400)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 50),
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]),
    ]).start();
  }, [index]);

  const getPhotoUrl = () => {
    if (place.photos?.[0]?.photo_reference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
    }
    return defaultImage;
  };

  return (
    <Animated.View
      style={[{ transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[styles.locationCard, isSelected && styles.selectedLocationCard]}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: getPhotoUrl() }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.locationName} numberOfLines={1}>
            {place.name}
          </Text>

          {(place.rating || place.rating === 0) && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>★ {place.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>
                ({place.user_ratings_total || 0})
              </Text>
            </View>
          )}

          {place.vicinity && (
            <Text style={styles.locationAddress} numberOfLines={2}>
              {place.vicinity}
            </Text>
          )}

          {place.opening_hours && (
            <Text
              style={[
                styles.openStatus,
                place.opening_hours.open_now
                  ? styles.openNow
                  : styles.closedNow,
              ]}
            >
              {place.opening_hours.open_now ? "Open Now" : "Closed"}
            </Text>
          )}

          {(place.price_level || place.price_level === 0) && (
            <Text style={styles.priceLevel}>
              {"$".repeat(place.price_level + 1)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AnimatedCategoryButton = ({ label, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [index]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={styles.categoryButton} onPress={onPress}>
        <Text style={styles.categoryButtonText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const GooglePlacesMap = ({ navigation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [key, setKey] = useState(0);
  const searchBarAnim = useRef(new Animated.Value(-100)).current;

  const initialRegion = {
    latitude: 35.6586,
    longitude: 139.7454,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const placeTypes = [
    { label: "Restaurants", type: "restaurant" },
    { label: "Cafes", type: "cafe" },
    { label: "Shopping", type: "shopping_mall" },
    { label: "Hotels", type: "lodging" },
    { label: "Parks", type: "park" },
  ];

  useEffect(() => {
    Animated.spring(searchBarAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  const getPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_phone_number,opening_hours,website,price_level,photos&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  const animateToRegion = (location, index = null) => {
    if (!location?.lat || !location?.lng) return;

    mapRef.current?.animateToRegion(
      {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      },
      1000
    );

    if (index !== null && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * (CARD_WIDTH + 20),
        animated: true,
      });
    }
  };

  const handleCardPress = async (place, index) => {
    if (!place || !navigation) return;

    try {
      const details = await getPlaceDetails(place.place_id);

      // Navigate to a Details screen with the fetched data
      navigation.navigate("Details", { placeDetails: details });
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const searchNearbyPlaces = async (type) => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      setNearbyPlaces([]);
      setSelectedCardIndex(null);
      setKey((prev) => prev + 1);

      const region = mapRef.current.__lastRegion || initialRegion;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${region.latitude},${region.longitude}&radius=1500&type=${type}&key=${GOOGLE_PLACES_API_KEY}`
      );

      const data = await response.json();

      if (data.results) {
        const detailedPlaces = await Promise.all(
          data.results.slice(0, 20).map(async (place) => {
            const details = await getPlaceDetails(place.place_id);
            return {
              ...place,
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              photos: details?.photos || place.photos,
              website: details?.website,
              formatted_phone_number: details?.formatted_phone_number,
              opening_hours: details?.opening_hours || place.opening_hours,
              price_level: details?.price_level || place.price_level,
            };
          })
        );

        setNearbyPlaces(detailedPlaces);
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.searchContainer,
            { transform: [{ translateY: searchBarAnim }] },
          ]}
        >
          <GooglePlacesAutocomplete
            placeholder="Search for a place"
            minLength={2}
            autoFocus={false}
            returnKeyType={"search"}
            listViewDisplayed={false}
            fetchDetails={true}
            onPress={(data, details = null) => {
              if (details?.geometry?.location) {
                const searchedPlace = {
                  place_id: details.place_id,
                  name: details.name,
                  lat: details.geometry.location.lat,
                  lng: details.geometry.location.lng,
                  photos: details.photos,
                  rating: details.rating,
                  user_ratings_total: details.user_ratings_total,
                  vicinity: details.formatted_address || details.vicinity,
                  opening_hours: details.opening_hours,
                  price_level: details.price_level,
                };

                setSelectedLocation(searchedPlace);
                // Set the searched place as the only item in nearbyPlaces
                setNearbyPlaces([searchedPlace]);
                setSelectedCardIndex(0);
                setKey((prev) => prev + 1);
                animateToRegion(searchedPlace, 0);
              }
            }}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: "en",
              components: "country:jp",
            }}
            styles={{
              container: styles.autocompleteContainer,
              textInput: styles.searchInput,
              listView: styles.listView,
            }}
            enablePoweredByContainer={false}
            nearbyPlacesAPI="GooglePlacesSearch"
            debounce={300}
          />
        </Animated.View>

        <ScrollView
          horizontal
          style={styles.categoryContainer}
          showsHorizontalScrollIndicator={false}
        >
          {placeTypes.map((item, index) => (
            <AnimatedCategoryButton
              key={item.type}
              label={item.label}
              onPress={() => searchNearbyPlaces(item.type)}
              index={index}
            />
          ))}
        </ScrollView>

        <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
          {selectedLocation && (
            <AnimatedMarker
              key={`selected-${key}`}
              coordinate={{
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
              }}
              title={selectedLocation.name}
              pinColor="#FF3B30"
              index={0}
            />
          )}
          {nearbyPlaces.map((place, index) => (
            <AnimatedMarker
              key={`${place.place_id}-${key}`}
              coordinate={{
                latitude: place.lat,
                longitude: place.lng,
              }}
              title={place.name}
              pinColor="#007AFF"
              index={index}
            />
          ))}
        </MapView>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          nearbyPlaces.length > 0 && (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              style={[
                styles.locationCardsContainer,
                nearbyPlaces.length === 1 && styles.singleCardContainer,
              ]}
              contentContainerStyle={
                nearbyPlaces.length === 1 && {
                  flex: 1,
                  justifyContent: "center",
                  width: Dimensions.get("window").width,
                }
              }
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 20}
              snapToAlignment="center"
              decelerationRate="fast"
              scrollEnabled={nearbyPlaces.length > 1}
              onScroll={(event) => {
                if (nearbyPlaces.length === 1) return;
                const offsetX = event.nativeEvent.contentOffset.x;
                const index = Math.round(offsetX / (CARD_WIDTH + 20));
                if (index !== selectedCardIndex) {
                  setSelectedCardIndex(index);
                  const focusedPlace = nearbyPlaces[index];
                  if (focusedPlace) {
                    animateToRegion(focusedPlace);
                  }
                }
              }}
              scrollEventThrottle={16}
            >
              {nearbyPlaces.map((place, index) => (
                <LocationCard
                  key={place.place_id}
                  place={place}
                  onPress={() => handleCardPress(place, index)}
                  isSelected={selectedCardIndex === index}
                  index={index}
                />
              ))}
            </ScrollView>
          )
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 135,
  },
  searchContainer: {
    position: "absolute",
    width: "100%",
    zIndex: 2,
    top: -5,
  },
  autocompleteContainer: {
    flex: 1,
    width: "95%",
    alignSelf: "center",
    marginTop: 15,
    borderRadius: 20,
    zIndex: 2,
  },
  searchInput: {
    zIndex: 2,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    bottom: 0,
  },
  listView: {
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  categoryContainer: {
    position: "absolute",
    top: 67,
    zIndex: 1,
    marginHorizontal: 0,
  },
  categoryButton: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    fontFamily: "bolota",
  },
  locationCardsContainer: {
    position: "absolute",
    top: 520,
    left: 0,
    right: 0,
  },
  locationCardsContainer2: {
    position: "absolute",
    top: 520,
    left: 0,
    right: 0,
  },
  locationCard: {
    backgroundColor: "white",
    borderRadius: 15,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  selectedLocationCard: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  cardImageContainer: {
    height: CARD_HEIGHT * 0.5,
    width: "100%",
    backgroundColor: "#f0f0f0",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    paddingBottom: 10,
    paddingLeft: 10,
    paddingTop: 11,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#FFB800",
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: "#666",
  },
  locationAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  openStatus: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  openNow: {
    color: "#4CAF50",
  },
  closedNow: {
    color: "#F44336",
  },
  priceLevel: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  singleCardContainer: {
    left: 0,
    right: 0,
    paddingHorizontal: 0,
  },
});

export default GooglePlacesMap;
