import { View, Text, Pressable, StyleSheet, Image, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useJobs } from "../../src/context/JobsContext";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getJob } = useJobs();
  const job = getJob(id);
  const items = job?.items ?? [];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list}>
        {items.length === 0 ? (
          <Text style={styles.empty}>No items yet</Text>
        ) : (
          items.map((item) => (
            <Pressable key={item.itemId} style={styles.itemCard} onPress={() => router.push(`/jobs/${id}/item/${item.itemId}`)}>
              <Image source={{ uri: item.photoUri }} style={styles.thumb} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.condition} · ${item.valueRangeLow}–${item.valueRangeHigh}</Text>
                <Text style={styles.itemDisposition}>{item.disposition}</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
      <Pressable style={styles.btn} onPress={() => router.push(`/jobs/${id}/capture`)}>
        <Text style={styles.btnText}>+ Capture item</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  list: { flex: 1 },
  empty: { color: "#999", textAlign: "center", marginTop: 40 },
  itemCard: { flexDirection: "row", backgroundColor: "#f9f9f9", borderRadius: 10, marginBottom: 10, overflow: "hidden" },
  thumb: { width: 80, height: 80 },
  itemInfo: { flex: 1, padding: 10, justifyContent: "center" },
  itemName: { fontSize: 15, fontWeight: "600" },
  itemMeta: { fontSize: 13, color: "#666", marginTop: 2 },
  itemDisposition: { fontSize: 12, color: "#999", marginTop: 4 },
  btn: { backgroundColor: "#1a1a2e", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 12 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});