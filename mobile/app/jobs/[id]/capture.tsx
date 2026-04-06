import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const PROMPT = `You are an expert estate liquidation appraiser.
Analyse the provided photo and return a JSON object with exactly these fields:
{
  "name": "concise item name",
  "description": "2-3 sentence factual description",
  "condition": "excellent|good|fair|poor",
  "valueRangeLow": 0,
  "valueRangeHigh": 0,
  "category": "furniture|art|jewellery|collectibles|electronics|clothing|other",
  "auctionSuitable": true,
  "disposition": "tbc",
  "auctionNotes": "brief note on auction suitability or special considerations"
}
Return only valid JSON, no markdown fences.`;

export default function CaptureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);

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
    setAnalysing(true);
    try {
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
    encoding: "base64",
    });

      const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: base64 },
              },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      const cleaned = text.replace(/```json\n?|\```/g, "").trim();
      const result = JSON.parse(cleaned);
      router.push({
        pathname: `/jobs/${id}/review`,
        params: { item: JSON.stringify(result), photoUri },
      });
    } catch (err) {
      alert("Analysis failed, please try again");
      console.error(err);
    } finally {
      setAnalysing(false);
    }
  };

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
      <Pressable style={styles.btn} onPress={takePhoto}>
        <Text style={styles.btnText}>{photoUri ? "Retake photo" : "Take photo"}</Text>
      </Pressable>
      {photoUri && (
        <Pressable style={[styles.btn, styles.analyseBtn]} onPress={analyseItem} disabled={analysing}>
          {analysing ? (
            <ActivityIndicator color="#fff" />
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
});