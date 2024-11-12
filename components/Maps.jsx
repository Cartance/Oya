import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import MapView from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACES_API_KEY } from "@env";
import "react-native-get-random-values";
import AnimatedMarker from "./AnimatedMarker";

const LocationCard = ({ place, onPress, isSelected }) => {
  const defaultImage =
    "https://maps.gstatic.com/tactile/pane/default_geocode-2x.png";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.locationCard, isSelected && styles.selectedLocationCard]}
    >
      <View style={styles.cardImageContainer}>
        {place.photos ? (
          <Image
            source={{
              uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`,
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={{ uri: defaultImage }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.locationName} numberOfLines={1}>
          {place.name}
        </Text>

        {place.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>★ {place.rating}</Text>
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
              place.opening_hours.open_now ? styles.openNow : styles.closedNow,
            ]}
          >
            {place.opening_hours.open_now ? "Open Now" : "Closed"}
          </Text>
        )}

        {place.price_level && (
          <Text style={styles.priceLevel}>{"$".repeat(place.price_level)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const GooglePlacesMap = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [key, setKey] = useState(0);

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
    mapRef.current?.animateToRegion(
      {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
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

  const handleCardPress = (place, index) => {
    setSelectedCardIndex(index);
    animateToRegion(place);
  };

  const searchNearbyPlaces = async (type) => {
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
      let places = [];

      if (data.results) {
        // Process first page of results with full details
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
              // Keep existing place data and add any additional details
              opening_hours: details?.opening_hours || place.opening_hours,
              price_level: details?.price_level || place.price_level,
            };
          })
        );

        places = detailedPlaces;

        setNearbyPlaces(places);
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search for a place"
          minLength={2}
          autoFocus={false}
          returnKeyType={"search"}
          listViewDisplayed={false}
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              const location = {
                lat: details.geometry.location.lat,
                lng: details.geometry.location.lng,
                name: details.name,
                // Add additional details from the place
                photos: details.photos,
                rating: details.rating,
                vicinity: details.vicinity,
                opening_hours: details.opening_hours,
                price_level: details.price_level,
              };
              setSelectedLocation(location);
              setNearbyPlaces([]);
              setSelectedCardIndex(null);
              setKey((prev) => prev + 1);
              animateToRegion(location);
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
          debounce={100}
        />
      </View>

      <ScrollView
        horizontal
        style={styles.categoryContainer}
        showsHorizontalScrollIndicator={false}
      >
        {placeTypes.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryButton}
            onPress={() => searchNearbyPlaces(item.type)}
          >
            <Text style={styles.categoryButtonText}>{item.label}</Text>
          </TouchableOpacity>
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
            key={`${index}-${key}`}
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
            style={styles.locationCardsContainer}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 20}
            snapToAlignment="center"
            decelerationRate="fast"
          >
            {nearbyPlaces.map((place, index) => (
              <LocationCard
                key={index}
                place={place}
                onPress={() => handleCardPress(place, index)}
                isSelected={selectedCardIndex === index}
              />
            ))}
          </ScrollView>
        )
      )}
    </View>
  );
};

const CARD_WIDTH = Dimensions.get("window").width * 0.8;
const CARD_HEIGHT = 220;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
  },
  autocompleteContainer: {
    flex: 0,
    width: "95%",
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 20,
  },
  searchInput: {
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
    bottom: 30,
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
    bottom: 35,
  },
  categoryContainer: {
    position: "absolute",
    top: 40,
    zIndex: 2,
    marginHorizontal: 12,
  },
  categoryButton: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  locationCardsContainer: {
    position: "absolute",
    top: 475,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
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
    padding: 15,
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
});

export default GooglePlacesMap;
