import { View, Text, Pressable, StyleSheet, Image, ScrollView, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { useJobs } from "../../../../src/context/JobsContext";

const DISPOSITIONS = ["tbc", "sell", "donate", "keep", "throw", "hold"] as const;
type Disposition = typeof DISPOSITIONS[number];

export default function EditItemScreen() {
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId: string }>();
  const { getJob, updateItem } = useJobs();
  const job = getJob(id);
  const item = job?.items.find((i) => i.itemId === itemId);

  if (!item) return (
    <View style={styles.container}>
      <Text>Item not found</Text>
    </View>
  );

  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [condition, setCondition] = useState(item.condition);
  const [valueRangeLow, setValueRangeLow] = useState(String(item.valueRangeLow));
  const [valueRangeHigh, setValueRangeHigh] = useState(String(item.valueRangeHigh));
  const [auctionNotes, setAuctionNotes] = useState(item.auctionNotes);
  const [disposition, setDisposition] = useState<Disposition>(item.disposition as Disposition);

  const saveItem = () => {
    updateItem(id, {
      ...item,
      name,
      description,
      condition,
      valueRangeLow: Number(valueRangeLow),
      valueRangeHigh: Number(valueRangeHigh),
      auctionNotes,
      disposition,
    });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: item.photoUri }} style={styles.photo} />

      <Text style={styles.label}>Item name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline />

      <Text style={styles.label}>Condition</Text>
      <TextInput style={styles.input} value={condition} onChangeText={setCondition} />

      <Text style={styles.label}>Estimated value (low)</Text>
      <TextInput style={styles.input} value={valueRangeLow} onChangeText={setValueRangeLow} keyboardType="numeric" />

      <Text style={styles.label}>Estimated value (high)</Text>
      <TextInput style={styles.input} value={valueRangeHigh} onChangeText={setValueRangeHigh} keyboardType="numeric" />

      <Text style={styles.label}>Auction notes</Text>
      <TextInput style={[styles.input, styles.multiline]} value={auctionNotes} onChangeText={setAuctionNotes} multiline />

      <Text style={styles.label}>Disposition</Text>
      <View style={styles.dispositionRow}>
        {DISPOSITIONS.map((d) => (
          <Pressable
            key={d}
            style={[styles.dispositionBtn, disposition === d && styles.dispositionBtnActive]}
            onPress={() => setDisposition(d)}
          >
            <Text style={[styles.dispositionText, disposition === d && styles.dispositionTextActive]}>
              {d}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.btn} onPress={saveItem}>
        <Text style={styles.btnText}>Save changes</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4, paddingBottom: 40 },
  photo: { width: "100%", height: 220, borderRadius: 12, marginBottom: 16 },
  label: { fontSize: 12, color: "#999", marginTop: 12, textTransform: "uppercase" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 15, marginTop: 4 },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  dispositionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  dispositionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#ddd" },
  dispositionBtnActive: { backgroundColor: "#1a1a2e", borderColor: "#1a1a2e" },
  dispositionText: { fontSize: 14, color: "#555" },
  dispositionTextActive: { color: "#fff" },
  btn: { backgroundColor: "#1a1a2e", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 24 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});