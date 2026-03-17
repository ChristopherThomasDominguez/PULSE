import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6FAF8' }}>
      <Text style={{ color: '#1D9E75', fontSize: 18, fontWeight: '600' }}>Profile</Text>
    </View>
  );
}