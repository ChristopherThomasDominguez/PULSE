import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { C } from '../../constants/colors';

function HomeIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 20 20">
      <Path d="M3 10L10 3l7 7" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Rect x={5} y={10} width={10} height={8} rx={1} stroke={color} strokeWidth={1.5} fill="none" />
    </Svg>
  );
}

function LogIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 20 20">
      <Path d="M10 3v14M3 10h14" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function AfterVisitIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 20 20">
      <Path d="M5 2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke={color} strokeWidth={1.5} fill="none" />
      <Path d="M10 7v6M7 10l3-3 3 3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TimelineIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 20 20">
      <Circle cx={10} cy={10} r={7} stroke={color} strokeWidth={1.5} fill="none" />
      <Path d="M10 7v4l2 2" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

const NAV_HEIGHT   = Platform.OS === 'ios' ? 82 : 62;
const NAV_PADDING_BOTTOM = Platform.OS === 'ios' ? 28 : 8;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.red,
        tabBarInactiveTintColor: C.gray400,
        tabBarStyle: {
          backgroundColor: C.white,
          borderTopColor: C.gray200,
          borderTopWidth: 1.5,
          paddingTop: 8,
          paddingBottom: NAV_PADDING_BOTTOM,
          height: NAV_HEIGHT,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'DMSans_500Medium',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarIcon: ({ color }) => <LogIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="after-visit"
        options={{
          title: 'After Visit',
          tabBarIcon: ({ color }) => <AfterVisitIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="edit-concern"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color }) => <TimelineIcon color={color} />,
        }}
      />
      {/* Hidden routes — still reachable by navigation, just not in tab bar */}
      <Tabs.Screen name="demo"     options={{ href: null }} />
      <Tabs.Screen name="timeline" options={{ href: null }} />
    </Tabs>
  );
}
