/**
 * MCG Golf App - Learn Stack Layout
 */

import { Stack } from 'expo-router';

export default function LearnLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="drill/[id]" />
      <Stack.Screen name="lesson/[id]" />
      <Stack.Screen name="path/[id]" />
    </Stack>
  );
}
