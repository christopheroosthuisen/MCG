/**
 * MCG Golf App - Analysis Stack Layout
 */

import { Stack } from 'expo-router';

export default function AnalysisLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        presentation: 'fullScreenModal',
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="live"
        options={{
          animation: 'fade',
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
