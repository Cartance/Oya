// LocationDetails.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Linking,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { GOOGLE_PLACES_API_KEY } from "@env";

const MapDetails = ({ route, navigation }) => {
  const { placeId } = route.params;
  const [placeDetails, setPlaceDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaceDetails();
  }, []);

  const fetchPlaceDetails = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_phone_number,opening_hours,website,price_level,photos,reviews,formatted_address,geometry&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      setPlaceDetails(data.result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching place details:", error);
      setLoading(false);
    }
  };

  const handlePhonePress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWebsitePress = (website) => {
    Linking.openURL(website);
  };

  const handleDirectionsPress = () => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${placeDetails.geometry.location.lat},${placeDetails.geometry.location.lng}`;
    const label = placeDetails.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!placeDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load place details</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {placeDetails.photos && placeDetails.photos.length > 0 && (
        <Image
          source={{
            uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${placeDetails.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`,
          }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.contentContainer}>
        <Text style={styles.name}>{placeDetails.name}</Text>

        <View style={styles.ratingContainer}>
          {placeDetails.rating && (
            <View style={styles.ratingWrapper}>
              <Text style={styles.rating}>★ {placeDetails.rating}</Text>
              <Text style={styles.ratingCount}>
                ({placeDetails.user_ratings_total || 0} reviews)
              </Text>
            </View>
          )}
          {placeDetails.price_level && (
            <Text style={styles.price}>
              {"$".repeat(placeDetails.price_level)}
            </Text>
          )}
        </View>

        {placeDetails.formatted_address && (
          <Text style={styles.address}>{placeDetails.formatted_address}</Text>
        )}

        <View style={styles.buttonsContainer}>
          {placeDetails.formatted_phone_number && (
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                handlePhonePress(placeDetails.formatted_phone_number)
              }
            >
              <Text style={styles.buttonText}>Call</Text>
            </TouchableOpacity>
          )}

          {placeDetails.website && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleWebsitePress(placeDetails.website)}
            >
              <Text style={styles.buttonText}>Website</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleDirectionsPress}
          >
            <Text style={styles.buttonText}>Directions</Text>
          </TouchableOpacity>
        </View>

        {placeDetails.opening_hours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hours</Text>
            {placeDetails.opening_hours.weekday_text?.map((hours, index) => (
              <Text key={index} style={styles.hoursText}>
                {hours}
              </Text>
            ))}
          </View>
        )}

        {placeDetails.reviews && placeDetails.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {placeDetails.reviews.map((review, index) => (
              <View key={index} style={styles.reviewContainer}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.author_name}</Text>
                  <Text style={styles.reviewRating}>★ {review.rating}</Text>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(review.time * 1000).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  image: {
    width: Dimensions.get("window").width,
    height: 250,
  },
  contentContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  ratingWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    color: "#FFB800",
    marginRight: 5,
  },
  ratingCount: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 16,
    color: "#4CAF50",
  },
  address: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  hoursText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  reviewContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  reviewRating: {
    fontSize: 14,
    color: "#FFB800",
  },
  reviewText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
});

export default MapDetails;
