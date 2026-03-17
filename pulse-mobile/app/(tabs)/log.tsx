import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Radius } from '../../constants/theme';
import { api } from '../../services/api';

const DAY8_PAYLOAD = {
  body_area: 'Left lower leg / ankle',
  symptom: 'Cannot walk normally. Pain radiating up the leg.',
  urgency_level: 'high' as const,
  severity: 8,
};

export default function LogScreen() {
  const router = useRouter();

  async function handleDemoChain() {
    router.push('/loading');
    try {
      const agentResult = await api.runAgentChain(DAY8_PAYLOAD);
      router.replace({
        pathname: '/visit-prep',
        params: { agentResult: JSON.stringify(agentResult) },
      });
    } catch (e) {
      Alert.alert('Connection Error', 'Could not reach the backend. Check your LAN IP in services/api.ts.');
      router.back();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Log a Concern</Text>
      <Text style={styles.subtitle}>Submit a health concern to the PULSE backend.</Text>

      <TouchableOpacity style={styles.demoButton} onPress={handleDemoChain}>
        <Text style={styles.demoButtonText}>Run Demo: Day 8 Agent Chain</Text>
      </TouchableOpacity>

      <View style={styles.payloadCard}>
        <Text style={styles.payloadLabel}>Payload being submitted:</Text>
        <Text style={styles.payloadText}>Body area: {DAY8_PAYLOAD.body_area}</Text>
        <Text style={styles.payloadText}>Symptom: {DAY8_PAYLOAD.symptom}</Text>
        <Text style={styles.payloadText}>Urgency: {DAY8_PAYLOAD.urgency_level}</Text>
        <Text style={styles.payloadText}>Severity: {DAY8_PAYLOAD.severity}/10</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.bg,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 32,
  },
  demoButton: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  demoButtonText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.surface,
  },
  payloadCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  payloadLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  payloadText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
});
