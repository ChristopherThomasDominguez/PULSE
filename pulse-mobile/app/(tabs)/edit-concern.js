/**
 * edit-concern.js
 * Tap any concern from the home screen to edit or delete it.
 * Receives `concern` as a JSON string in route params.
 */

import { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, FONTS } from '../../constants/colors';
import { API_BASE } from '../../constants/api';

const URGENCIES = [
  { key: 'low',    label: 'Low',    bg: C.gray100, border: C.black,   text: C.black },
  { key: 'medium', label: 'Medium', bg: '#FFF3CD', border: '#D4A500', text: '#7A5E00' },
  { key: 'high',   label: 'High',   bg: '#FDF0F0', border: C.red,     text: C.redDark },
];

function SeverityPicker({ value, onChange }) {
  return (
    <View>
      <View style={sev.row}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <Pressable
            key={n}
            style={[sev.seg, n <= value && sev.segActive]}
            onPress={() => onChange(n)}
          />
        ))}
      </View>
      <View style={sev.labels}>
        <Text style={sev.lbl}>Mild</Text>
        <Text style={sev.num}>{value}</Text>
        <Text style={sev.lbl}>Severe</Text>
      </View>
    </View>
  );
}

const sev = StyleSheet.create({
  row:       { flexDirection: 'row', gap: 4, height: 20 },
  seg:       { flex: 1, borderRadius: 3, backgroundColor: C.gray200 },
  segActive: { backgroundColor: C.red },
  labels:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  lbl:       { fontSize: 11, color: C.gray400, fontFamily: FONTS.body },
  num:       { fontFamily: FONTS.display, fontSize: 26, color: C.black },
});

export default function EditConcernScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { concern: concernParam } = useLocalSearchParams();

  const original = JSON.parse(concernParam || '{}');

  const [bodyArea,   setBodyArea]   = useState(original.body_area   || '');
  const [symptom,    setSymptom]    = useState(original.symptom     || '');
  const [notes,      setNotes]      = useState(original.notes       || '');
  const [severity,   setSeverity]   = useState(original.severity    || 5);
  const [urgency,    setUrgency]    = useState(original.urgency_level || 'medium');
  const [dateLogged, setDateLogged] = useState(original.date_logged || '');
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [feedback,   setFeedback]   = useState(null);

  async function handleSave() {
    if (!symptom.trim()) {
      setFeedback({ type: 'err', msg: 'Symptom description is required.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const r = await fetch(`${API_BASE}/concerns/${original.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body_area:     bodyArea,
          symptom:       symptom.trim(),
          urgency_level: urgency,
          severity,
          notes:         notes.trim(),
          date_logged:   dateLogged,
        }),
      });
      if (!r.ok) throw new Error('Update failed');
      setFeedback({ type: 'ok', msg: 'Saved!' });
      setTimeout(() => router.back(), 900);
    } catch {
      setFeedback({ type: 'err', msg: 'Could not save — is the server running?' });
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete concern?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const r = await fetch(`${API_BASE}/concerns/${original.id}`, { method: 'DELETE' });
              if (!r.ok) throw new Error('Delete failed');
              router.back();
            } catch {
              Alert.alert('Error', 'Could not delete — is the server running?');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.white }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* Header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Back</Text>
        </Pressable>
        <Text style={styles.topTitle}>EDIT CONCERN</Text>
        <Pressable onPress={handleDelete} disabled={deleting} style={styles.deleteBtn}>
          <Text style={styles.deleteTxt}>{deleting ? '...' : 'Delete'}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date Logged</Text>
          <TextInput
            style={styles.input}
            value={dateLogged}
            onChangeText={setDateLogged}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={C.gray400}
          />
        </View>

        {/* Body area */}
        <View style={styles.section}>
          <Text style={styles.label}>Body Area</Text>
          <TextInput
            style={styles.input}
            value={bodyArea}
            onChangeText={setBodyArea}
            placeholder="e.g. Left Ankle"
            placeholderTextColor={C.gray400}
          />
        </View>

        {/* Severity */}
        <View style={styles.section}>
          <Text style={styles.label}>Pain Severity</Text>
          <SeverityPicker value={severity} onChange={setSeverity} />
        </View>

        {/* Urgency */}
        <View style={styles.section}>
          <Text style={styles.label}>Urgency Level</Text>
          <View style={styles.urgRow}>
            {URGENCIES.map(u => (
              <Pressable
                key={u.key}
                style={[
                  styles.urgBtn,
                  urgency === u.key && { backgroundColor: u.bg, borderColor: u.border },
                ]}
                onPress={() => setUrgency(u.key)}
              >
                <Text style={[
                  styles.urgTxt,
                  urgency === u.key && { color: u.text, fontFamily: FONTS.bodySemi },
                ]}>
                  {u.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Symptom description */}
        <View style={styles.section}>
          <Text style={styles.label}>Describe the pain</Text>
          <TextInput
            style={[styles.input, { height: 90 }]}
            value={symptom}
            onChangeText={setSymptom}
            placeholder="e.g. Sharp throbbing, worse when walking..."
            placeholderTextColor={C.gray400}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Additional Notes (optional)</Text>
          <TextInput
            style={[styles.input, { height: 64 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="What makes it better or worse?"
            placeholderTextColor={C.gray400}
            multiline
            textAlignVertical="top"
          />
        </View>

        {feedback && (
          <View style={[styles.feedbackBox, feedback.type === 'ok' ? styles.fbOk : styles.fbErr]}>
            <Text style={[styles.fbTxt, { color: feedback.type === 'ok' ? '#166534' : C.redDark }]}>
              {feedback.msg}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.btnRed, pressed && { opacity: 0.85 }, saving && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.btnRedTxt}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</Text>
          </Pressable>
          <Pressable style={styles.btnOutline} onPress={() => router.back()}>
            <Text style={styles.btnOutlineTxt}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  backBtn:    { paddingVertical: 8, paddingHorizontal: 4, minWidth: 60 },
  backTxt:    { fontSize: 14, color: C.red, fontFamily: FONTS.bodySemi },
  topTitle:   { fontFamily: FONTS.display, fontSize: 20, color: C.black, letterSpacing: 1 },
  deleteBtn:  { paddingVertical: 8, paddingHorizontal: 4, minWidth: 60, alignItems: 'flex-end' },
  deleteTxt:  { fontSize: 14, color: C.red, fontFamily: FONTS.bodySemi },

  scroll:     { flex: 1 },
  section:    { paddingHorizontal: 20, marginTop: 16 },
  label:      { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: C.gray400, marginBottom: 6, fontFamily: FONTS.bodySemi },
  input:      { backgroundColor: C.gray100, borderWidth: 1.5, borderColor: C.gray200, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: C.black, fontFamily: FONTS.body },

  urgRow:    { flexDirection: 'row', gap: 8 },
  urgBtn:    { flex: 1, paddingVertical: 9, borderWidth: 1.5, borderColor: C.gray200, borderRadius: 5, alignItems: 'center', backgroundColor: C.gray100 },
  urgTxt:    { fontSize: 13, color: C.gray400, fontFamily: FONTS.body },

  feedbackBox: { marginHorizontal: 20, marginTop: 12, padding: 10, borderRadius: 8 },
  fbOk:      { backgroundColor: '#F0FFF4' },
  fbErr:     { backgroundColor: '#FDF0F0' },
  fbTxt:     { fontSize: 13, fontFamily: FONTS.body },

  actions:   { paddingHorizontal: 20, gap: 10, marginTop: 20 },
  btnRed:    { backgroundColor: C.red, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnRedTxt: { fontFamily: FONTS.display, fontSize: 20, letterSpacing: 2, color: C.white },
  btnOutline: { borderWidth: 1.5, borderColor: C.gray200, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnOutlineTxt: { fontSize: 15, fontWeight: '600', color: C.black, fontFamily: FONTS.bodySemi },
});
