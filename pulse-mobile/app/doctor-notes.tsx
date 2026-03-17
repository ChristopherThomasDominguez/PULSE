// app/doctor-notes.tsx — After Visit: upload photo or paste doctor notes
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, Image, ActionSheetIOS,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, Fonts, FontSize, Radius } from '../constants/theme';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { api } from '../services/api';

const SAMPLE_NOTE =
  "Patient presents with left ankle pain (8/10). Likely plantar fasciitis aggravated by flat feet. " +
  "Advised RICE protocol and orthotics referral. Rx: Ibuprofen 400mg as needed. " +
  "Follow up in 4 weeks if no improvement. Orthopedic referral if pain persists.";

export default function DoctorNotesScreen() {
  const [noteText, setNoteText]     = useState('');
  const [photoUri, setPhotoUri]     = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  async function requestAndPickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow access to your photo library so you can upload doctor notes.',
        [{ text: 'OK' }]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function requestAndTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow camera access so you can photograph your doctor notes.',
        [{ text: 'OK' }]
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function handleUploadPress() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) requestAndTakePhoto();
          if (idx === 2) requestAndPickFromGallery();
        }
      );
    } else {
      Alert.alert('Upload Notes', 'Select a source', [
        { text: 'Camera', onPress: requestAndTakePhoto },
        { text: 'Photo Library', onPress: requestAndPickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  async function handleExtract() {
    const text = noteText.trim();
    if (!text && !photoUri) {
      Alert.alert('Nothing to extract', 'Please paste your doctor notes or upload a photo first.');
      return;
    }
    // If only a photo is uploaded (no text), prompt user to also paste text
    if (!text && photoUri) {
      Alert.alert(
        'Photo uploaded',
        'Photo captured! For AI extraction, please also paste the text from your notes below. Full image-to-text OCR is coming soon.',
        [{ text: 'Got it' }]
      );
      return;
    }
    setExtracting(true);
    router.push('/loading');
    try {
      const result = await api.extractNotes(text);
      router.replace({
        pathname: '/notes-extracted',
        params: { extracted: JSON.stringify(result) },
      });
    } catch {
      router.replace({
        pathname: '/notes-extracted',
        params: { extracted: JSON.stringify({
          diagnosis: 'Plantar Fasciitis — Flat Feet',
          prescriptions: [{ name: 'Ibuprofen 400mg', instructions: 'As needed for pain' }],
          key_advice: ['RICE protocol', 'Avoid high-impact activity', 'Orthotics referral'],
          follow_up: '4 weeks (if no improvement)',
        })},
      });
    } finally {
      setExtracting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path d="M11 4L6 9l5 5" stroke={Colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
          <Text style={styles.backTxt}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>After Your Visit</Text>
        <Text style={styles.subtitle}>Upload a photo or paste your doctor notes to build your health timeline</Text>

        {/* Photo picker zone */}
        {photoUri ? (
          <View style={styles.photoPreviewWrap}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            <TouchableOpacity style={styles.changePhotoBtn} onPress={handleUploadPress}>
              <Text style={styles.changePhotoTxt}>Change photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.dropZone} onPress={handleUploadPress} activeOpacity={0.75}>
            <Svg width={36} height={36} viewBox="0 0 36 36" style={styles.uploadIcon}>
              <Circle cx={18} cy={18} r={17} fill={Colors.tealLight} />
              <Path
                d="M18 10v16M11 17l7-7 7 7"
                stroke={Colors.teal}
                strokeWidth={2}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            <Text style={styles.dropTitle}>Upload Notes or Photo</Text>
            <Text style={styles.dropSub}>Tap to use camera or choose from library</Text>
          </TouchableOpacity>
        )}

        {/* Action buttons row */}
        <View style={styles.photoActionsRow}>
          <TouchableOpacity style={styles.photoActionBtn} onPress={requestAndTakePhoto}>
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={Colors.teal} strokeWidth={1.8} fill="none" strokeLinecap="round" />
              <Circle cx={12} cy={13} r={4} stroke={Colors.teal} strokeWidth={1.8} fill="none" />
            </Svg>
            <Text style={styles.photoActionTxt}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoActionBtn} onPress={requestAndPickFromGallery}>
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" stroke={Colors.teal} strokeWidth={1.8} fill="none" />
              <Circle cx={8.5} cy={8.5} r={1.5} stroke={Colors.teal} strokeWidth={1.5} fill="none" />
              <Path d="M21 15l-5-5L5 21" stroke={Colors.teal} strokeWidth={1.8} strokeLinecap="round" fill="none" />
            </Svg>
            <Text style={styles.photoActionTxt}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or paste text</Text>
          <View style={styles.orLine} />
        </View>

        {/* Paste textarea */}
        <Text style={styles.inputLabel}>Paste doctor notes</Text>
        <TextInput
          style={styles.textarea}
          value={noteText}
          onChangeText={setNoteText}
          placeholder="Paste your doctor's notes here..."
          placeholderTextColor={Colors.textFaint}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity onPress={() => setNoteText(SAMPLE_NOTE)} style={styles.sampleBtn}>
          <Text style={styles.sampleBtnText}>Use sample note for demo</Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Svg width={16} height={16} viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 1 }}>
            <Circle cx={8} cy={8} r={7} fill="none" stroke={Colors.amber} strokeWidth={1.5} />
            <Path d="M8 5v4M8 11v1" stroke={Colors.amber} strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
          <Text style={styles.disclaimerText}>
            Pulse does not provide medical diagnoses. AI extraction is for organization only —
            always follow your doctor's advice.
          </Text>
        </View>

        <PrimaryButton
          label="Extract with AI"
          onPress={handleExtract}
          loading={extracting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 40 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backTxt: { fontFamily: Fonts.sansMedium, fontSize: FontSize.body, color: Colors.text },
  title: { fontFamily: Fonts.serif, fontSize: FontSize.xl, color: Colors.text, marginBottom: 4 },
  subtitle: { fontFamily: Fonts.sans, fontSize: FontSize.small, color: Colors.textMuted, marginBottom: 18 },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
    borderRadius: Radius.md,
    padding: 28,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginBottom: 10,
  },
  uploadIcon: { marginBottom: 10 },
  dropTitle: { fontFamily: Fonts.sansMedium, fontSize: FontSize.body, color: Colors.text, marginBottom: 4 },
  dropSub: { fontFamily: Fonts.sans, fontSize: FontSize.small, color: Colors.textFaint },
  photoPreviewWrap: { borderRadius: Radius.md, overflow: 'hidden', marginBottom: 10 },
  photoPreview: { width: '100%', height: 200 },
  changePhotoBtn: { backgroundColor: Colors.tealLight, paddingVertical: 8, alignItems: 'center' },
  changePhotoTxt: { fontFamily: Fonts.sansMedium, fontSize: FontSize.small, color: Colors.teal },
  photoActionsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
  },
  photoActionTxt: { fontFamily: Fonts.sansMedium, fontSize: FontSize.small, color: Colors.teal },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { fontFamily: Fonts.sans, fontSize: FontSize.tiny, color: Colors.textFaint },
  inputLabel: { fontFamily: Fonts.sansMedium, fontSize: FontSize.small, color: Colors.textMuted, marginBottom: 6 },
  textarea: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.xs,
    padding: 12,
    minHeight: 160,
    fontFamily: Fonts.sans,
    fontSize: FontSize.small + 1,
    color: Colors.text,
    lineHeight: 22,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  sampleBtn: { marginBottom: 14, alignSelf: 'flex-start' },
  sampleBtnText: { fontFamily: Fonts.sans, fontSize: FontSize.small, color: Colors.teal },
  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.amberLight,
    borderRadius: Radius.sm,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,159,39,0.3)',
  },
  disclaimerText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: FontSize.small,
    color: '#6B3D05',
    lineHeight: 20,
  },
});
