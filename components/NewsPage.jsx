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

  const openArticleInBrowser = async () => {
    if (article.link) {
      try {
        await Linking.openURL(article.link);
      } catch (error) {
        console.error("Error opening URL:", error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        {/* Main Content */}
        <View style={styles.content}>
          {/* Article Image */}
          <Image
            source={{ uri: article.image_url || defaultImage }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Article Details */}
          <View style={styles.articleDetails}>
            <Text style={styles.title}>{article.title}</Text>

            <View style={styles.metadata}>
              <Text style={styles.source}>{article.source_id}</Text>
              <Text style={styles.date}>
                {new Date(article.pubDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

            {article.creator && (
              <Text style={styles.author}>
                By{" "}
                {Array.isArray(article.creator)
                  ? article.creator.join(", ")
                  : article.creator}
              </Text>
            )}

            {/* Article Content */}
            <Text style={styles.description}>{article.description}</Text>

            {article.content && (
              <Text style={styles.content}>{article.content}</Text>
            )}

            {/* Categories/Keywords */}
            {article.keywords && (
              <View style={styles.categoryContainer}>
                {article.keywords.map((keyword, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Read More Button */}
            <TouchableOpacity
              style={styles.readMoreButton}
              onPress={openArticleInBrowser}
            >
              <Text style={styles.readMoreText}>Read Full Article</Text>
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  image: {
    width: windowWidth,
    height: 300,
  },
  articleDetails: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  author: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontStyle: "italic",
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 24,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  categoryTag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
  },
  readMoreButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  readMoreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NewsPage;
