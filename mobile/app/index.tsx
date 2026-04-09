import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useJobs } from "../src/context/JobsContext";
import { useEffect } from "react";

export default function JobsScreen() {
  const { jobs, isLoading, addJob, loadJobs } = useJobs();

  useEffect(() => {
    loadJobs();
  }, []);

  const createJob = async () => {
    try {
      const jobId = await addJob("Worker", "New Property");
      router.push(`/jobs/${jobId}`);
    } catch (err) {
      alert("Failed to create job");
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : jobs.length === 0 ? (
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
  loader: { flex: 1 },
  empty: { color: "#999", textAlign: "center", marginTop: 40 },
  jobCard: { backgroundColor: "#f9f9f9", padding: 16, borderRadius: 10, marginBottom: 10 },
  jobTitle: { fontSize: 16, fontWeight: "600" },
  jobMeta: { fontSize: 13, color: "#999", marginTop: 4 },
  btn: { backgroundColor: "#1a1a2e", padding: 16, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});