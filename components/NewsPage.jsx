// components/NewsDetail.js
import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from "react-native";

const NewsDetail = ({ route }) => {
  const { news } = route.params;

  const openArticle = async () => {
    if (news.link) {
      await Linking.openURL(news.link);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: news.image_url || "https://via.placeholder.com/150" }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title}>{news.title}</Text>
        <View style={styles.metadata}>
          <Text style={styles.source}>{news.source_id}</Text>
          <Text style={styles.date}>
            {new Date(news.pubDate).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.description}>{news.description}</Text>
        <Text style={styles.fullContent}>{news.content}</Text>

        {news.keywords && (
          <View style={styles.keywords}>
            {news.keywords.map((keyword, index) => (
              <View key={index} style={styles.keyword}>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={openArticle}>
          <Text style={styles.buttonText}>Read Full Article</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  source: {
    fontSize: 14,
    color: "#666",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  fullContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  keywords: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  keyword: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  keywordText: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NewsDetail;
