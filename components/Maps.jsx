import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACES_API_KEY } from "@env";
import "react-native-get-random-values";

const GooglePlacesMap = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const mapRef = useRef(null);

  const initialRegion = {
    latitude: 37.78825,
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

  const animateToRegion = (location) => {
    mapRef.current?.animateToRegion(
      {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      1000
    );
  };

  const searchNearbyPlaces = async (type) => {
    try {
      // Get the current map center
      const region = mapRef.current.__lastRegion || initialRegion;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${region.latitude},${region.longitude}&radius=1500&type=${type}&key=${GOOGLE_PLACES_API_KEY}`
      );

      const data = await response.json();

      if (data.results) {
        const places = data.results.map((place) => ({
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          name: place.name,
        }));

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
              setSelectedLocation({
                lat: details.geometry.location.lat,
                lng: details.geometry.location.lng,
                name: details.name,
              });
              setNearbyPlaces([]); // Clear previous nearby places
              animateToRegion(details.geometry.location);
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

      {/* Category buttons */}
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
          <Marker
            coordinate={{
              latitude: selectedLocation.lat,
              longitude: selectedLocation.lng,
            }}
            title={selectedLocation.name}
            pinColor="red"
          />
        )}
        {nearbyPlaces.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: place.lat,
              longitude: place.lng,
            }}
            title={place.name}
            pinColor="blue"
          />
        ))}
      </MapView>
    </View>
  );
};

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
    top: 90,
    zIndex: 1,
    paddingHorizontal: 10,
  },
  categoryButton: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});

export default GooglePlacesMap;
