import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1D9E75',
        tabBarInactiveTintColor: '#96B5AB',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(29,158,117,0.15)',
          borderTopWidth: 1,
          paddingBottom: 10,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="log" options={{ title: 'Log' }} />
      <Tabs.Screen name="timeline" options={{ title: 'Timeline' }} />
      <Tabs.Screen name="labs" options={{ title: 'Labs' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}