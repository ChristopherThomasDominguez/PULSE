import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Radius } from '../constants/theme';

const MOCK_PREP = {
  concern_summary: 'Patient reports inability to walk normally with pain radiating up the left lower leg and ankle. Severity rated 8/10 with high urgency. Pattern suggests possible deep vein thrombosis or severe musculoskeletal injury requiring immediate evaluation.',
  questions: [
    'When did the pain and inability to walk first begin?',
    'Have you had any recent injuries, falls, or trauma to the leg?',
    'Is the area swollen, warm, or discolored compared to the other leg?',
    'Do you have any history of blood clots or circulatory issues?',
    'Has the pain been constant or does it come and go?',
  ],
  escalation: 'High urgency — recommend same-day evaluation. Left lower leg pain with radiation and inability to bear weight may indicate DVT, fracture, or severe soft tissue injury. Do not delay care.',
};

export default function VisitPrepScreen() {
  const { agentResult } = useLocalSearchParams<{ agentResult?: string }>();

  let prepData = MOCK_PREP;
  if (agentResult) {
    try {
      const parsed = JSON.parse(agentResult);
      if (parsed) prepData = parsed;
    } catch {
      // fallback to mock
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Visit Prep</Text>
      <Text style={styles.aiChip}>AI Generated</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>Concern Summary</Text>
        </View>
        <Text style={styles.cardBody}>
          {prepData.concern_summary ?? 'No summary available.'}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>Suggested Questions</Text>
        </View>
        <View style={styles.cardBodyPadded}>
          {(prepData.questions ?? []).map((q: string, i: number) => (
            <View key={i} style={styles.questionRow}>
              <View style={styles.questionCircle}>
                <Text style={styles.questionNumber}>{i + 1}</Text>
              </View>
              <Text style={styles.questionText}>{q}</Text>
            </View>
          ))}
        </View>
      </View>

      {prepData.escalation ? (
        <View style={[styles.card, styles.escalationCard]}>
          <View style={[styles.cardHeader, styles.escalationHeader]}>
            <Text style={styles.cardHeaderText}>Escalation Alert</Text>
          </View>
          <Text style={styles.escalationBody}>{prepData.escalation}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.bg,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 80,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    color: Colors.text,
    marginBottom: 8,
  },
  aiChip: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: Colors.teal,
    backgroundColor: Colors.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: 24,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardHeader: {
    backgroundColor: Colors.tealLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cardHeaderText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: Colors.tealDark,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  cardBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    padding: 16,
    lineHeight: 22,
  },
  cardBodyPadded: {
    padding: 16,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  questionNumber: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.surface,
  },
  questionText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  escalationCard: {
    borderColor: Colors.coral,
  },
  escalationHeader: {
    backgroundColor: Colors.coralLight,
  },
  escalationBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
    padding: 16,
    lineHeight: 22,
  },
});
