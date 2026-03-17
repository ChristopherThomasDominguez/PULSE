// app/profile.tsx — User profile, personalization & HIPAA privacy notice
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Platform, Alert, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Shield } from 'react-native-svg';
import { C, FONTS } from '../constants/colors';

const PROFILE_KEY = '@pulse_profile';

const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', "Don't know"];

function ShieldIcon({ size = 20, color = C.red }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
        stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHead}>{title}</Text>;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [dob, setDob]             = useState('');
  const [bloodType, setBloodType] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [allergies, setAllergies]   = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [shareWithDoctor, setShareWithDoctor] = useState(true);
  const [analyticsOpt, setAnalyticsOpt] = useState(false);
  const [hipaaAccepted, setHipaaAccepted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then(raw => {
      if (!raw) return;
      try {
        const p = JSON.parse(raw);
        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setDob(p.dob || '');
        setBloodType(p.bloodType || '');
        setDoctorName(p.doctorName || '');
        setDoctorPhone(p.doctorPhone || '');
        setAllergies(p.allergies || '');
        setConditions(p.conditions || '');
        setMedications(p.medications || '');
        setShareWithDoctor(p.shareWithDoctor ?? true);
        setAnalyticsOpt(p.analyticsOpt ?? false);
        setHipaaAccepted(p.hipaaAccepted ?? false);
      } catch {}
    });
  }, []);

  async function handleSave() {
    if (!hipaaAccepted) {
      Alert.alert(
        'Privacy Notice',
        'Please review and accept the HIPAA-aligned privacy notice before saving your health profile.',
        [{ text: 'OK' }]
      );
      return;
    }
    const profile = {
      firstName, lastName, dob, bloodType,
      doctorName, doctorPhone,
      allergies, conditions, medications,
      shareWithDoctor, analyticsOpt, hipaaAccepted,
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>PROFILE</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={handleSave}
        >
          <Text style={[styles.saveBtnTxt, saved && styles.saveBtnTxtDone]}>
            {saved ? 'Saved!' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* HIPAA/Privacy Banner */}
        <View style={styles.hipaaCard}>
          <View style={styles.hipaaHeader}>
            <ShieldIcon size={18} color={C.red} />
            <Text style={styles.hipaaTitle}>HIPAA-Aligned Privacy</Text>
          </View>
          <Text style={styles.hipaaBody}>
            Your health data is stored locally on this device only. Pulse does not sell,
            share, or transmit your personal health information to third parties.
            AI analysis is performed by IBM Granite and is not used to train external models.
            You can delete all data at any time.
          </Text>
          <View style={styles.hipaaPoints}>
            {[
              'Data stored locally — never sold',
              'IBM Granite processes queries only — not stored',
              'You own your data — delete anytime',
              'No insurance or employer access',
            ].map((pt, i) => (
              <View key={i} style={styles.hipaaPoint}>
                <View style={styles.hipaaCheckDot} />
                <Text style={styles.hipaaPointTxt}>{pt}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.hipaaAcceptRow, hipaaAccepted && styles.hipaaAcceptedRow]}
            onPress={() => setHipaaAccepted(v => !v)}
            activeOpacity={0.8}
          >
            <View style={[styles.hipaaCheckbox, hipaaAccepted && styles.hipaaCheckboxChecked]}>
              {hipaaAccepted && (
                <Svg width={12} height={12} viewBox="0 0 12 12">
                  <Path d="M2 6l3 3 5-5" stroke={C.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              )}
            </View>
            <Text style={styles.hipaaAcceptTxt}>
              I understand and accept the privacy notice
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Info */}
        <SectionHeader title="Personal Info" />
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Jane"
                placeholderTextColor={C.gray400}
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Smith"
                placeholderTextColor={C.gray400}
              />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            placeholder="MM / DD / YYYY"
            placeholderTextColor={C.gray400}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.fieldLabel}>Blood Type</Text>
          <View style={styles.chipRow}>
            {BLOOD_TYPES.map(bt => (
              <TouchableOpacity
                key={bt}
                style={[styles.chip, bloodType === bt && styles.chipSelected]}
                onPress={() => setBloodType(bt)}
              >
                <Text style={[styles.chipTxt, bloodType === bt && styles.chipTxtSelected]}>{bt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Doctor Info */}
        <SectionHeader title="Primary Doctor" />
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Doctor Name</Text>
          <TextInput
            style={styles.input}
            value={doctorName}
            onChangeText={setDoctorName}
            placeholder="Dr. Name"
            placeholderTextColor={C.gray400}
          />
          <Text style={styles.fieldLabel}>Doctor Phone / Practice</Text>
          <TextInput
            style={styles.input}
            value={doctorPhone}
            onChangeText={setDoctorPhone}
            placeholder="(555) 000-0000"
            placeholderTextColor={C.gray400}
            keyboardType="phone-pad"
          />
        </View>

        {/* Medical History */}
        <SectionHeader title="Medical History" />
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Known Allergies</Text>
          <TextInput
            style={[styles.input, styles.multiInput]}
            value={allergies}
            onChangeText={setAllergies}
            placeholder="e.g. Penicillin, latex..."
            placeholderTextColor={C.gray400}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.fieldLabel}>Existing Conditions</Text>
          <TextInput
            style={[styles.input, styles.multiInput]}
            value={conditions}
            onChangeText={setConditions}
            placeholder="e.g. Diabetes Type 2, Hypertension..."
            placeholderTextColor={C.gray400}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.fieldLabel}>Current Medications</Text>
          <TextInput
            style={[styles.input, styles.multiInput]}
            value={medications}
            onChangeText={setMedications}
            placeholder="e.g. Metformin 500mg daily..."
            placeholderTextColor={C.gray400}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Privacy Controls */}
        <SectionHeader title="Privacy Controls" />
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Share summary with doctor</Text>
              <Text style={styles.toggleSub}>Allow Visit Prep report to include your profile context</Text>
            </View>
            <Switch
              value={shareWithDoctor}
              onValueChange={setShareWithDoctor}
              trackColor={{ false: C.gray200, true: C.red }}
              thumbColor={C.white}
            />
          </View>
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: C.gray200, marginTop: 12, paddingTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Anonymous usage analytics</Text>
              <Text style={styles.toggleSub}>Help improve Pulse — no health data included</Text>
            </View>
            <Switch
              value={analyticsOpt}
              onValueChange={setAnalyticsOpt}
              trackColor={{ false: C.gray200, true: C.red }}
              thumbColor={C.white}
            />
          </View>
        </View>

        {/* Delete Data */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => Alert.alert(
            'Delete All Data',
            'This will permanently delete your profile and all logged concerns. This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete Everything',
                style: 'destructive',
                onPress: async () => {
                  await AsyncStorage.clear();
                  setFirstName(''); setLastName(''); setDob(''); setBloodType('');
                  setDoctorName(''); setDoctorPhone('');
                  setAllergies(''); setConditions(''); setMedications('');
                  setHipaaAccepted(false);
                  Alert.alert('Deleted', 'All local data has been removed.');
                },
              },
            ]
          )}
        >
          <Text style={styles.deleteBtnTxt}>Delete All My Data</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Pulse · HIPAA-Aligned · Data stays on your device{'\n'}
          Powered by IBM WatsonX Orchestrate · IBM Granite
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.white },
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  topTitle:   { fontFamily: FONTS.display, fontSize: 32, color: C.black, letterSpacing: 1 },
  saveBtn:    { backgroundColor: C.black, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 18 },
  saveBtnDone: { backgroundColor: '#22C55E' },
  saveBtnTxt: { fontSize: 13, fontWeight: '700', color: C.white, fontFamily: FONTS.bodySemi },
  saveBtnTxtDone: { color: C.white },
  scroll:     { flex: 1, paddingHorizontal: 20 },
  sectionHead: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: C.gray400, marginBottom: 8, marginTop: 16, fontFamily: FONTS.bodySemi },
  card:       { backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.gray200, padding: 14, marginBottom: 4 },

  // HIPAA card
  hipaaCard:  { backgroundColor: '#0D0D0D', borderRadius: 14, padding: 16, marginBottom: 4, marginTop: 4 },
  hipaaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  hipaaTitle:  { fontFamily: FONTS.bodySemi, fontSize: 13, color: C.white, letterSpacing: 0.5 },
  hipaaBody:   { fontFamily: FONTS.body, fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 18, marginBottom: 12 },
  hipaaPoints: { gap: 7, marginBottom: 14 },
  hipaaPoint:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hipaaCheckDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.red },
  hipaaPointTxt: { fontFamily: FONTS.body, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  hipaaAcceptRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  hipaaAcceptedRow: {},
  hipaaCheckbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  hipaaCheckboxChecked: { backgroundColor: C.red, borderColor: C.red },
  hipaaAcceptTxt: { flex: 1, fontFamily: FONTS.body, fontSize: 12, color: 'rgba(255,255,255,0.65)' },

  // Form
  fieldRow:   { flexDirection: 'row', gap: 10, marginBottom: 2 },
  fieldHalf:  { flex: 1 },
  fieldLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, color: C.gray400, marginBottom: 5, marginTop: 10, fontFamily: FONTS.bodySemi },
  input:      { backgroundColor: C.gray100, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 14, color: C.black, fontFamily: FONTS.body },
  multiInput: { minHeight: 72, textAlignVertical: 'top', paddingTop: 10 },
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip:       { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 20, borderWidth: 1, borderColor: C.gray200, backgroundColor: C.gray100 },
  chipSelected: { backgroundColor: C.black, borderColor: C.black },
  chipTxt:    { fontSize: 12, color: C.gray400, fontFamily: FONTS.body },
  chipTxtSelected: { color: C.white, fontFamily: FONTS.bodySemi },

  // Toggles
  toggleRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: C.black, fontFamily: FONTS.bodyMedium, marginBottom: 2 },
  toggleSub:  { fontSize: 11, color: C.gray400, fontFamily: FONTS.body },

  // Delete
  deleteBtn:  { marginTop: 20, marginBottom: 8, alignItems: 'center', paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: '#FFCDD2', backgroundColor: '#FFF5F5' },
  deleteBtnTxt: { fontSize: 13, fontWeight: '600', color: '#B71C1C', fontFamily: FONTS.bodySemi },

  footer: { fontSize: 10, color: C.gray400, fontFamily: FONTS.body, textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
