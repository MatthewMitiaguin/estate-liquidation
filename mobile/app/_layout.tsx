import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Estate Liquidation" }} />
      <Stack.Screen name="jobs/[id]" options={{ title: "New Job" }} />
      <Stack.Screen name="jobs/[id]/capture" options={{ title: "Capture Item" }} />
      <Stack.Screen name="jobs/[id]/review" options={{ title: "Review Item" }} />
    </Stack>
  );
}