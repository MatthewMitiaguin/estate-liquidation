import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as Crypto from "expo-crypto";
import { useJobs } from "../src/context/JobsContext";

export default function JobsScreen() {
  const { jobs, addJob } = useJobs();

  const createJob = () => {
    const jobId = Crypto.randomUUID();
    addJob(jobId);
    router.push(`/jobs/${jobId}`);
  };

  return (
    <View style={styles.container}>
      {jobs.length === 0 ? (
        <Text style={styles.empty}>No jobs yet</Text>
      ) : (
        jobs.map((job) => (
          <Pressable key={job.jobId} style={styles.jobCard} onPress={() => router.push(`/jobs/${job.jobId}`)}>
            <Text style={styles.jobTitle}>Job {job.jobId.slice(0, 8)}</Text>
            <Text style={styles.jobMeta}>{job.items.length} items · {new Date(job.createdAt).toLocaleDateString()}</Text>
          </Pressable>
        ))
      )}
      <Pressable style={styles.btn} onPress={createJob}>
        <Text style={styles.btnText}>+ New job</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "space-between" },
  empty: { color: "#999", textAlign: "center", marginTop: 40 },
  jobCard: { backgroundColor: "#f9f9f9", padding: 16, borderRadius: 10, marginBottom: 10 },
  jobTitle: { fontSize: 16, fontWeight: "600" },
  jobMeta: { fontSize: 13, color: "#999", marginTop: 4 },
  btn: { backgroundColor: "#1a1a2e", padding: 16, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});