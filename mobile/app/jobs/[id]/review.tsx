import { View, Text, Pressable, StyleSheet, Image, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function ReviewScreen() {
  const { id, item, photoUri } = useLocalSearchParams<{ id: string; item: string; photoUri: string }>();
  const parsed = JSON.parse(item);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.photo} />
      <Text style={styles.name}>{parsed.name}</Text>
      <Text style={styles.label}>Description</Text>
      <Text style={styles.value}>{parsed.description}</Text>
      <Text style={styles.label}>Condition</Text>
      <Text style={styles.value}>{parsed.condition}</Text>
      <Text style={styles.label}>Estimated value</Text>
      <Text style={styles.value}>${parsed.valueRangeLow} — ${parsed.valueRangeHigh}</Text>
      <Text style={styles.label}>Category</Text>
      <Text style={styles.value}>{parsed.category}</Text>
      <Text style={styles.label}>Auction suitable</Text>
      <Text style={styles.value}>{parsed.auctionSuitable ? "Yes" : "No"}</Text>
      <Text style={styles.label}>Auction notes</Text>
      <Text style={styles.value}>{parsed.auctionNotes}</Text>
      <Pressable style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnText}>Save item</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4 },
  photo: { width: "100%", height: 220, borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
  label: { fontSize: 12, color: "#999", marginTop: 12, textTransform: "uppercase" },
  value: { fontSize: 15, color: "#333" },
  btn: { backgroundColor: "#1a1a2e", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 24 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});