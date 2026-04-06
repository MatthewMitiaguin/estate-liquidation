import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function CaptureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.jobId}>Job {id}</Text>
      <View style={styles.photoPlaceholder}>
        <Text style={styles.photoText}>Camera coming soon</Text>
      </View>
      <Pressable style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnText}>Back to job</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "space-between" },
  jobId: { fontSize: 16, color: "#999" },
  photoPlaceholder: { flex: 1, backgroundColor: "#f0f0f0", borderRadius: 12, alignItems: "center", justifyContent: "center", marginVertical: 16 },
  photoText: { fontSize: 16, color: "#999" },
  btn: { backgroundColor: "#1a1a2e", padding: 16, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});