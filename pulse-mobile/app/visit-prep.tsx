// app/visit-prep.tsx — Visit Prep: IBM Granite analysis of logged health data
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { Colors, Fonts, FontSize, Radius } from '../constants/theme';
import AIChip from '../components/ui/AIChip';
import UrgencyDot from '../components/ui/UrgencyDot';
import Badge from '../components/ui/Badge';
import QuestionItem from '../components/ui/QuestionItem';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { OutlineButton } from '../components/ui/OutlineButton';
import PulseDots from '../components/ui/PulseDots';
import { api, VisitPrepResult, UrgencyLevel } from '../services/api';

const MOCK_PREP: VisitPrepResult = {
  concern_summary:
    "You've logged 3 health concerns since your last visit. Primary issues include recurring " +
    "migraines affecting daily function, ankle pain when walking (8 days, severity 8/10), " +
    "and intermittent foot numbness.",
  questions: [
    "What could be causing my recurring ankle pain, and what should I avoid?",
    "Is this pain likely muscular, structural, or nerve-related?",
    "Should I get imaging done given the severity and duration?",
    "What at-home treatments are safe to try before my next visit?",
    "Could the foot numbness be related to my ankle issue?",
  ],
  concerns_to_mention: [
    { area: 'Left Foot / Ankle', urgency: 'high'   },
    { area: 'Head / Neck',       urgency: 'medium'  },
    { area: 'Right Foot',        urgency: 'low'     },
  ],
  escalation: {
    escalation_level: 'see_doctor',
    pattern_summary: 'Severity trending from 3 to 8 over 8 days. Recommend prompt evaluation.',
    recurring_areas: ['Left lower leg / ankle'],
    severity_trend: 'escalating',
  },
};

const URGENCY_BADGE: Record<UrgencyLevel, 'red' | 'amber' | 'teal'> = {
  high: 'red', medium: 'amber', low: 'teal',
};

// ─── IBM Granite section label ────────────────────────────────────────────────
function GraniteLabel({ text }: { text: string }) {
  return (
    <View style={gl.row}>
      <View style={gl.dot} />
      <Text style={gl.txt}>{text}</Text>
    </View>
  );
}
const gl = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.teal },
  txt: { fontFamily: Fonts.sansSemiBold, fontSize: FontSize.tiny, color: Colors.teal, letterSpacing: 0.4 },
});

// ─── Trend indicator ──────────────────────────────────────────────────────────
function TrendIndicator({ trend }: { trend: string }) {
  const isEscalating = trend === 'escalating';
  const color = isEscalating ? Colors.red : Colors.teal;
  const label = isEscalating ? 'Escalating' : trend === 'improving' ? 'Improving' : 'Stable';
  return (
    <View style={[ti.pill, { backgroundColor: isEscalating ? Colors.redLight : Colors.tealLight }]}>
      <Svg width={12} height={12} viewBox="0 0 12 12">
        {isEscalating
          ? <Polyline points="1,9 5,4 8,6 11,2" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          : <Polyline points="1,3 5,7 8,5 11,9" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        }
      </Svg>
      <Text style={[ti.txt, { color }]}>{label}</Text>
    </View>
  );
}
const ti = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  txt:  { fontFamily: Fonts.sansSemiBold, fontSize: FontSize.tiny },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VisitPrepScreen() {
  const params = useLocalSearchParams<{ agentResult?: string }>();
  const [prep,    setPrep]    = useState<VisitPrepResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock stats — in production these come from the logged concerns count
  const concernCount  = prep ? prep.concerns_to_mention.length : 3;
  const daysTracked   = 14;
  const peakSeverity  = 8;

  useEffect(() => {
    if (params.agentResult) {
      try {
        const result = JSON.parse(params.agentResult);
        setPrep(result.step3_visit_prep ?? result);
      } catch {
        setPrep(MOCK_PREP);
      }
    }
  }, [params.agentResult]);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await api.generatePrep();
      setPrep(result);
    } catch {
      setPrep(MOCK_PREP);
    } finally {
      setLoading(false);
    }
  }

  const data = prep ?? MOCK_PREP;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Dark hero header ────────────────────────────────────── */}
        <View style={styles.hero}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Path d="M11 4L6 9l5 5" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
            <Text style={styles.backTxt}>Back</Text>
          </Pressable>

          <AIChip label="IBM Granite · Active" />

          <Text style={styles.heroTitle}>YOUR{'\n'}VISIT PREP</Text>
          <Text style={styles.heroSub}>
            IBM Granite analyzed your logged health history and generated personalized insights for your next appointment.
          </Text>

          {/* Stat row */}
          <View style={styles.statRow}>
            <View style={styles.statPill}>
              <Text style={styles.statVal}>{concernCount}</Text>
              <Text style={styles.statLbl}>concerns{'\n'}analyzed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statVal}>{daysTracked}</Text>
              <Text style={styles.statLbl}>days{'\n'}tracked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statVal}>{peakSeverity}/10</Text>
              <Text style={styles.statLbl}>peak{'\n'}severity</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>

          {/* ── Generate CTA (shown before prep exists) ─────────── */}
          {!prep && (
            <View style={styles.generateCard}>
              <GraniteLabel text="IBM GRANITE · READY TO ANALYZE" />
              <Text style={styles.generateTitle}>Generate your personalized visit prep</Text>
              <Text style={styles.generateBody}>
                IBM Granite will read your {concernCount} logged concerns, detect patterns, and create a tailored summary and question list for your doctor.
              </Text>
              <PrimaryButton
                label={loading ? 'Analyzing your data…' : 'Analyze My Health History'}
                onPress={handleGenerate}
                loading={loading}
                style={{ marginTop: 16 }}
              />
            </View>
          )}

          {/* ── IBM Granite pattern detection ───────────────────── */}
          {data.escalation.escalation_level !== 'monitor' && (
            <View style={[
              styles.patternCard,
              data.escalation.escalation_level === 'urgent' ? styles.patternUrgent : styles.patternSeeDoctor,
            ]}>
              <GraniteLabel text="IBM GRANITE · PATTERN DETECTED" />
              <View style={styles.patternTop}>
                <Text style={styles.patternTitle}>
                  {data.escalation.escalation_level === 'urgent'
                    ? 'Urgent pattern in your logs'
                    : 'Your data suggests seeing a doctor'}
                </Text>
                <TrendIndicator trend={data.escalation.severity_trend} />
              </View>
              <Text style={styles.patternBody}>{data.escalation.pattern_summary}</Text>
              {data.escalation.recurring_areas.length > 0 && (
                <Text style={styles.patternAreas}>
                  Recurring area: {data.escalation.recurring_areas.join(', ')}
                </Text>
              )}
            </View>
          )}

          {/* ── What IBM Granite found in your logs ─────────────── */}
          <View style={styles.section}>
            <GraniteLabel text="IBM GRANITE · FROM YOUR HEALTH LOGS" />
            <Text style={styles.sectionTitle}>What was found in your data</Text>
            <View style={styles.card}>
              <Text style={styles.summaryText}>{data.concern_summary}</Text>
            </View>
          </View>

          {/* ── Priority concerns ────────────────────────────────── */}
          <View style={styles.section}>
            <GraniteLabel text="IBM GRANITE · RANKED BY SEVERITY" />
            <Text style={styles.sectionTitle}>Bring these up with your doctor</Text>
            <View style={styles.card}>
              {data.concerns_to_mention.map((c, i) => (
                <View
                  key={i}
                  style={[styles.concernRow, i < data.concerns_to_mention.length - 1 && styles.concernDivider]}
                >
                  <UrgencyDot level={c.urgency} />
                  <Text style={styles.concernArea}>{c.area}</Text>
                  <Badge
                    label={c.urgency === 'medium' ? 'Med' : c.urgency}
                    variant={URGENCY_BADGE[c.urgency]}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* ── Questions generated from your symptoms ───────────── */}
          <View style={styles.section}>
            <GraniteLabel text="IBM GRANITE · GENERATED FROM YOUR SYMPTOMS" />
            <Text style={styles.sectionTitle}>Questions to ask your doctor</Text>
            <Text style={styles.sectionSub}>These questions were written specifically based on what you logged — not generic advice.</Text>
            <View style={styles.card}>
              {data.questions.map((q, i) => (
                <QuestionItem
                  key={i}
                  number={i + 1}
                  text={q}
                  isLast={i === data.questions.length - 1}
                />
              ))}
            </View>
          </View>

          {/* ── Actions ──────────────────────────────────────────── */}
          <View style={styles.actions}>
            {!prep && (
              <PrimaryButton
                label="Analyze My Health History"
                onPress={handleGenerate}
                loading={loading}
                style={{ marginBottom: 8 }}
              />
            )}
            <PrimaryButton
              label="Share with Doctor"
              onPress={() => Alert.alert('Share', 'Export feature coming soon.')}
              style={{ marginBottom: 8 }}
            />
            <OutlineButton
              label="Upload Doctor Notes After Visit"
              onPress={() => router.push('/doctor-notes')}
            />
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 48 },

  // Hero
  hero:     { backgroundColor: Colors.darkBg, paddingHorizontal: 22, paddingTop: 56, paddingBottom: 28 },
  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  backTxt:  { fontFamily: Fonts.sansMedium, fontSize: FontSize.body, color: 'rgba(255,255,255,0.6)' },
  heroTitle:{ fontFamily: Fonts.serif, fontSize: 42, color: '#FFFFFF', lineHeight: 46, marginTop: 14, marginBottom: 10 },
  heroSub:  { fontFamily: Fonts.sans, fontSize: FontSize.small, color: 'rgba(255,255,255,0.5)', lineHeight: 19, marginBottom: 22 },

  statRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: Radius.sm, paddingVertical: 14, paddingHorizontal: 16 },
  statPill:    { flex: 1, alignItems: 'center', gap: 2 },
  statVal:     { fontFamily: Fonts.serif, fontSize: 22, color: '#FFFFFF', lineHeight: 24 },
  statLbl:     { fontFamily: Fonts.sans, fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 13 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)' },

  body: { paddingHorizontal: 20, paddingTop: 20 },

  // Generate card
  generateCard:  { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.borderStrong },
  generateTitle: { fontFamily: Fonts.serif, fontSize: 20, color: Colors.text, marginBottom: 8 },
  generateBody:  { fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.textMuted, lineHeight: 21 },

  // Pattern detection
  patternCard:       { borderRadius: Radius.sm, padding: 16, marginBottom: 16, borderWidth: 1 },
  patternSeeDoctor:  { backgroundColor: Colors.tealLight, borderColor: Colors.borderStrong },
  patternUrgent:     { backgroundColor: Colors.redLight,  borderColor: 'rgba(226,75,74,0.3)' },
  patternTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
  patternTitle:      { flex: 1, fontFamily: Fonts.sansSemiBold, fontSize: FontSize.body, color: Colors.text },
  patternBody:       { fontFamily: Fonts.sans, fontSize: FontSize.small, color: Colors.textMuted, lineHeight: 19 },
  patternAreas:      { fontFamily: Fonts.sansSemiBold, fontSize: FontSize.tiny, color: Colors.textMuted, marginTop: 8 },

  // Sections
  section:      { marginBottom: 20 },
  sectionTitle: { fontFamily: Fonts.serif, fontSize: 18, color: Colors.text, marginBottom: 4 },
  sectionSub:   { fontFamily: Fonts.sans, fontSize: FontSize.small, color: Colors.textMuted, marginBottom: 10, lineHeight: 18 },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: 14, borderWidth: 1, borderColor: Colors.border },

  summaryText: { fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.text, lineHeight: 22 },

  concernRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  concernDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  concernArea:    { flex: 1, fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.text },

  actions: { gap: 0, marginTop: 4 },
});
