import { View, Text, Pressable, StyleSheet } from "react-native";

export default function JobsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.empty}>No jobs yet</Text>
      <Pressable style={styles.btn}>
        <Text style={styles.btnText}>+ New job</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "space-between" },
  empty: { color: "#999", textAlign: "center", marginTop: 40 },
  btn: { backgroundColor: "#1a1a2e", padding: 16, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});