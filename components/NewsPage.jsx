// NewsPage.js
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Share,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NewsPage = ({ route, navigation }) => {
  const { article } = route.params;
  const defaultImage = "https://via.placeholder.com/300x200";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\nRead more at: ${article.link}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadMore = () => {
    if (article.link) {
      Linking.openURL(article.link);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with back button and share */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          <Text style={styles.category}>{article.category?.toUpperCase()}</Text>
          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.sourceInfo}>
            <Text style={styles.source}>{article.source_id}</Text>
            <Text style={styles.date}>
              {new Date(article.pubDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          <Image
            source={{ uri: article.image_url || defaultImage }}
            style={styles.image}
            resizeMode="cover"
          />

          <Text style={styles.description}>{article.description}</Text>

          {article.content && (
            <Text style={styles.content}>{article.content}</Text>
          )}

          {/* Keywords/Topics */}
          {article.keywords && (
            <View style={styles.keywordsContainer}>
              <Text style={styles.keywordsTitle}>Related Topics:</Text>
              <View style={styles.keywordsList}>
                {article.keywords.split(",").map((keyword, index) => (
                  <View key={index} style={styles.keywordChip}>
                    <Text style={styles.keywordText}>{keyword.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Read More Button */}
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={handleReadMore}
          >
            <Text style={styles.readMoreText}>Read Full Article</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  category: {
    fontSize: 14,
    color: "#0066cc",
    fontWeight: "600",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    lineHeight: 32,
  },
  sourceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  source: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  image: {
    width: windowWidth - 32,
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 24,
  },
  keywordsContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  keywordsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  keywordsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  keywordChip: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  keywordText: {
    fontSize: 14,
    color: "#666",
  },
  readMoreButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  readMoreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NewsPage;
