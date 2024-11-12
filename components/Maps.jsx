import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import MapView from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACES_API_KEY } from "@env";
import "react-native-get-random-values";
import AnimatedMarker from "./AnimatedMarker";

const LocationCard = ({ place, onPress, isSelected }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.locationCard, isSelected && styles.selectedLocationCard]}
  >
    <Text style={styles.locationName} numberOfLines={1}>
      {place.name}
    </Text>
    <View style={styles.locationDetails}>
      <View style={styles.locationPin}>
        <View style={styles.pinDot} />
      </View>
      <Text style={styles.locationAddress} numberOfLines={2}>
        {`${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}`}
      </Text>
    </View>
  </TouchableOpacity>
);

const GooglePlacesMap = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
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

  const animateToRegion = (location, index = null) => {
    // Animate map to the selected location
    mapRef.current?.animateToRegion(
      {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.02, // Zoom in more for card selection
        longitudeDelta: 0.02,
      },
      1000
    );

    // If index is provided, scroll the cards to center the selected one
    if (index !== null && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * (CARD_WIDTH + 20), // card width + margin
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
        places = data.results.map((place) => ({
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          name: place.name,
        }));

        if (data.next_page_token && places.length < 40) {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const nextResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${data.next_page_token}&key=${GOOGLE_PLACES_API_KEY}`
          );

          const nextData = await nextResponse.json();

          if (nextData.results) {
            const nextPlaces = nextData.results.map((place) => ({
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              name: place.name,
            }));

            places = [...places, ...nextPlaces].slice(0, 40);
          }
        }

        setNearbyPlaces(places);
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
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

      {nearbyPlaces.length > 0 && (
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
      )}
    </View>
  );
};

const CARD_WIDTH = Dimensions.get("window").width * 0.8;

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
    top: 600,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  locationCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    width: CARD_WIDTH,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedLocationCard: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  locationDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
  },
  locationAddress: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
});

export default GooglePlacesMap;
