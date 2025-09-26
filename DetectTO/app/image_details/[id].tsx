import { StyleSheet, Platform, useWindowDimensions, Text, Image, Alert, View, ScrollView, TouchableOpacity, Share } from "react-native";
import React, { useState, useCallback } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect } from '@react-navigation/native';


const ImageDetails = () => {
  const { width: screenWidth } = useWindowDimensions(); // -----

  const router = useRouter();
  const { id, imageResult } = useLocalSearchParams();
  // const parsed = imageResult ? JSON.parse(imageResult as string) : null;
  
  const [parsed, setParsed] = useState<any>(null);
  useFocusEffect(
    useCallback(() => {
      const p = imageResult ? JSON.parse(imageResult as string) : null;
      setParsed(p);
    }, [imageResult])
  );


  if (!parsed) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No image result provided</Text>
      </SafeAreaView>
    );
  }


  // --------
  const detections = parsed?.detections || [];
  const imgWidth = parsed?.width || 640;
  const imgHeight = parsed?.height || 640;

  let imageHeight = 300; // default
  if (imgWidth && imgHeight) {
    const aspectRatio = imgWidth / imgHeight;
    imageHeight = aspectRatio >= 1
      ? screenWidth * (9 / 16) // landscape → 16:9
      : screenWidth * (16 / 9); // portrait → 9:16
  }
  // ------
  
  // Navigate back
  const handleBack = () => {
    router.push("/detection");
  };

  const handleShare = 
    async () => { 
      try { 
        await Share.share({ url: parsed.image_url, title: "Share Image", }); 
      } catch (error) { 
        Alert.alert("Error", "Unable to share the image."); 
      } 
    };

    const handleDownload = async () => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        if (status !== "granted") {
          Alert.alert("Permission denied", "Cannot save image without permission.");
          return;
        }

        // Pick a local path in cache
        const fileUri = FileSystem.cacheDirectory + `image_${Date.now()}.png`;

        // Download directly to local file
        const { uri } = await FileSystem.downloadAsync(parsed.image_url, fileUri);

        // Save to gallery
        await MediaLibrary.saveToLibraryAsync(uri);

        Alert.alert("Success", "Image saved to your gallery!");

        router.push("/detection");

      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to download image.");
        router.push("/detection");
      }
    };

  return (
    <>
    <Stack.Screen
      options={{ headerShown: false }}
    />
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.headerText}>Detected Image</Text>
        <Text className="text-white mb-5">( {id} )</Text>

        {/* Image Preview */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: parsed.image_url + '?t=' + Date.now() }}
            style={[styles.image, { height: imageHeight }]}
            resizeMode="contain"
          />
        </View>

        {/* Image Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Applied</Text>
          <Text style={styles.cardText}>Model: {parsed.model_name}</Text>
          <Text style={styles.cardText}>iou Threshold: {parsed.thresholds}</Text>
          <Text style={styles.cardText}>Image Size: {parsed.width} × {parsed.height}</Text>
          <Text style={styles.cardText}>Label Size: {parsed.font_scale}</Text>
        </View>

        {/* Detections */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Image Details</Text>
          {/* {parsed.detections.map((det: any, idx: number) => ( 
            <View key={idx} style={styles.detectionRow}> 
              <Text style={styles.detectionLabel}>{det.label}</Text> 
              <Text style={styles.detectionConfidence}>{det.confidence.toFixed(2)} conf</Text> 
            </View> 
          ))} */}
          {detections.map((det: any, idx: number) => (
            <View key={idx} style={styles.detectionRow}>
              <Text style={styles.detectionLabel}>{det?.label ?? "Unknown"} {det.idx}</Text>
              <Text style={styles.detectionConfidence}>
                {det?.confidence != null ? det.confidence.toFixed(2) : "0.00"} conf
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </>
  );
};

export default ImageDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#030014",
  },
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A23",
  },
  emptyText: {
    color: "#AAA",
    fontSize: 16,
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 3,
  },
  imageWrapper: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: "100%",
    borderRadius: 12,
    // height: 300,
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#AB8BFF",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: "#fff",
    marginBottom: 6,
  },
  detectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  detectionLabel: {
    color: "#fff",
    fontSize: 15,
  },
  detectionConfidence: {
    color: "#AB8BFF",
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#030014",
    borderTopWidth: 0.5,
    borderTopColor: "#333",
  },
  backButton: {
    flex: 1,
    height: 56,
    backgroundColor: "#2e2e4d",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#FF6B6B",
    fontWeight: "700",
    fontSize: 16,
  },
  downloadButton: {
    flex: 1,
    height: 56,
    backgroundColor: "#AB8BFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
