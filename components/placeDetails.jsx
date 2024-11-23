// PlaceDetails.js
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from "react-native";

const PlaceDetails = ({ route }) => {
  const { place } = route.params;
  const defaultImage =
    "https://maps.gstatic.com/tactile/pane/default_geocode-2x.png";

  const openMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}&query_place_id=${place.place_id}`;
    Linking.openURL(url);
  };

  const openWebsite = () => {
    if (place.website) {
      Linking.openURL(place.website);
    }
  };

  const callPlace = () => {
    if (place.formatted_phone_number) {
      Linking.openURL(`tel:${place.formatted_phone_number}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {place.photos ? (
          <Image
            source={{
              uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`,
            }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={{ uri: defaultImage }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.name}>{place.name}</Text>

        {place.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {place.rating}</Text>
            <Text style={styles.ratingCount}>
              ({place.user_ratings_total || 0} reviews)
            </Text>
          </View>
        )}

        {place.vicinity && <Text style={styles.address}>{place.vicinity}</Text>}

        {place.opening_hours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hours</Text>
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
            {place.opening_hours.weekday_text?.map((hours, index) => (
              <Text key={index} style={styles.hoursText}>
                {hours}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={openMap}>
            <Text style={styles.actionButtonText}>View on Map</Text>
          </TouchableOpacity>

          {place.website && (
            <TouchableOpacity style={styles.actionButton} onPress={openWebsite}>
              <Text style={styles.actionButtonText}>Visit Website</Text>
            </TouchableOpacity>
          )}

          {place.formatted_phone_number && (
            <TouchableOpacity style={styles.actionButton} onPress={callPlace}>
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    height: 250,
    width: "100%",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
  address: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  openStatus: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  openNow: {
    color: "#4CAF50",
  },
  closedNow: {
    color: "#F44336",
  },
  hoursText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  actionButtons: {
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PlaceDetails;
