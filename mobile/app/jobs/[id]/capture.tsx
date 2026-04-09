import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { api } from "../../../src/api/client";

export default function CaptureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "uploading" | "analysing">("idle");

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission is required");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const analyseItem = async () => {
    if (!photoUri) return;
    try {
      setStage("uploading");

      // 1. Register item and get presigned S3 URL
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const contentLength = blob.size;
      const { itemId, uploadUrl } = await api.createItem(id, contentLength) as { itemId: string; uploadUrl: string };
      console.log("uploadUrl:", uploadUrl);
      console.log("itemId:", itemId);

      // 2. Upload photo directly to S3
      await api.uploadPhoto(uploadUrl, photoUri);

      // 3. Trigger Claude analysis
      setStage("analysing");
      const result = await api.analyseItem(id, itemId) as any;

      // 4. Navigate to review screen with result
      router.push({
        pathname: `/jobs/${id}/review`,
        params: {
          item: JSON.stringify({ ...result, itemId }),
          photoUri,
        },
      });
    } catch (err) {
      alert("Analysis failed, please try again");
      console.error(err);
    } finally {
      setStage("idle");
    }
  };

  const loadingText = stage === "uploading" ? "Uploading photo..." : "Analysing with AI...";

  return (
    <View style={styles.container}>
      <Text style={styles.jobId}>Job {id}</Text>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <Pressable style={styles.photoPlaceholder} onPress={takePhoto}>
          <Text style={styles.photoText}>Tap to take photo</Text>
        </Pressable>
      )}
      <Pressable style={styles.btn} onPress={takePhoto} disabled={stage !== "idle"}>
        <Text style={styles.btnText}>{photoUri ? "Retake photo" : "Take photo"}</Text>
      </Pressable>
      {photoUri && (
        <Pressable style={[styles.btn, styles.analyseBtn]} onPress={analyseItem} disabled={stage !== "idle"}>
          {stage !== "idle" ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.btnText}>{loadingText}</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>Analyse item</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "space-between" },
  jobId: { fontSize: 16, color: "#999" },
  preview: { flex: 1, borderRadius: 12, marginVertical: 16 },
  photoPlaceholder: { flex: 1, backgroundColor: "#f0f0f0", borderRadius: 12, alignItems: "center", justifyContent: "center", marginVertical: 16 },
  photoText: { fontSize: 16, color: "#999" },
  btn: { backgroundColor: "#1a1a2e", padding: 16, borderRadius: 10, alignItems: "center" },
  analyseBtn: { backgroundColor: "#2e7d32", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
});