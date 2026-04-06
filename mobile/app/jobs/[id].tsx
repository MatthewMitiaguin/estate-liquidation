import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.jobId}>Job {id}</Text>
      <Text style={styles.empty}>No items yet</Text>
      <Pressable style={styles.btn} onPress={() => router.push(`/jobs/${id}/capture`)}>
        <Text style={styles.btnText}>+ Capture item</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "space-between" },
  jobId: { fontSize: 16, color: "#999" },
  empty: { color: "#999", textAlign: "center", marginTop: 40 },
  btn: { backgroundColor: "#1a1a2e", padding: 16, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});