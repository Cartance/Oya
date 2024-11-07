import React, { useState, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { API_KEY } from "@env";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const ExpandableMap = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(200)).current;
  const mapRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const key = API_KEY;

  const handleExpand = () => {
    if (!isExpanded && !isDragging) {
      Animated.spring(animation, {
        toValue: Dimensions.get("window").height * 0.6,
        useNativeDriver: false,
        friction: 7,
        tension: 40,
      }).start();
      setIsExpanded(true);
    }
  };

  const handleCollapse = () => {
    if (isExpanded) {
      Animated.spring(animation, {
        toValue: 200,
        useNativeDriver: false,
        friction: 7,
        tension: 40,
      }).start(() => {
        setIsExpanded(false);
      });
    }
  };

  const handlePlaceSelected = (data, details) => {
    const { geometry, name } = details;

    // Create the selected place marker
    const newPlace = {
      coordinate: {
        latitude: geometry.location.lat,
        longitude: geometry.location.lng,
      },
      title: data.structured_formatting.main_text,
      description: data.structured_formatting.secondary_text,
    };

    // Search for nearby places
    searchNearbyPlaces(geometry.location.lat, geometry.location.lng);

    const newRegion = {
      latitude: geometry.location.lat,
      longitude: geometry.location.lng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);

    if (!isExpanded) {
      handleExpand();
    }
  };

  const searchNearbyPlaces = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&key=API_KEY`
      );
      const data = await response.json();

      if (data.results) {
        const places = data.results.map((place) => ({
          coordinate: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          title: place.name,
          description: place.vicinity,
          placeId: place.place_id,
        }));

        setSearchResults(places);
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    }
  };

  const handleOutsidePress = (event) => {
    const { locationY } = event.nativeEvent;
    const mapTop = 200 - 50;
    const mapBottom =
      (isExpanded ? Dimensions.get("window").height * 0.6 : 200) - 50;

    if (locationY < mapTop || locationY > mapBottom) {
      handleCollapse();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View>
        <View style={styles.searchContainer}>
          <GooglePlacesAutocomplete
            placeholder="Search for a location"
            query={{
              key: "API_KEY",
              language: "en",
              types: "establishment",
            }}
            onPress={handlePlaceSelected}
            onFail={(error) => console.error(error)}
            styles={{
              container: styles.searchBarContainer,
              textInput: styles.searchInput,
              listView: styles.searchResults,
              row: styles.searchRow,
              separator: styles.searchSeparator,
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            minLength={2}
            nearbyPlacesAPI="GooglePlacesSearch"
            debounce={300}
            filterReverseGeocodingByTypes={[
              "locality",
              "administrative_area_level_3",
            ]}
          />
        </View>

        <View style={styles.mapWrapper}>
          <TouchableOpacity
            onPress={handleExpand}
            activeOpacity={1}
            disabled={isDragging}
          >
            <Animated.View style={[styles.mapContainer, { height: animation }]}>
              <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                scrollEnabled={true}
                zoomEnabled={true}
                rotateEnabled={isExpanded}
                pitchEnabled={isExpanded}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => {
                  setTimeout(() => setIsDragging(false), 200);
                }}
                moveOnMarkerPress={false}
                clusterEnabled={true}
              >
                {searchResults.map((place, index) => (
                  <Marker
                    key={place.placeId || index}
                    coordinate={place.coordinate}
                    title={place.title}
                    description={place.description}
                    pinColor="#2196F3"
                  />
                ))}
              </MapView>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 25,
    zIndex: 1,
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    marginHorizontal: 20,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchInput: {
    height: 45,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderRadius: 25,
    bottom: 40,
    paddingHorizontal: 15,
    fontSize: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchResults: {
    backgroundColor: "#fff",
    marginTop: 5,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchRow: {
    padding: 13,
    height: "auto",
    minHeight: 44,
  },
  searchSeparator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  mapWrapper: {
    width: "100%",
    marginTop: 10,
  },
  mapContainer: {
    width: "92%",
    overflow: "hidden",
    borderRadius: 20,
    bottom: 50,
    marginHorizontal: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ExpandableMap;
