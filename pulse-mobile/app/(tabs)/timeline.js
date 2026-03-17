import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  StatusBar, ActivityIndicator, Pressable,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, FONTS } from '../../constants/colors';
import { API_BASE } from '../../constants/api';

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading]   = useState(true);

  useFocusEffect(
    useCallback(() => { load(); }, [])
  );

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/concerns`);
      const d = await r.json();
      setConcerns((d.concerns || []).slice().reverse());
    } catch {
      setConcerns([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.topBar}>
        <Text style={styles.topTitle}>TIMELINE</Text>
        <Text style={styles.topHint}>Tap to edit</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {loading ? (
          <ActivityIndicator color={C.red} style={{ padding: 40 }} />
        ) : concerns.length === 0 ? (
          <Text style={styles.empty}>No entries yet.</Text>
        ) : (
          <View style={styles.tlWrap}>
            <View style={styles.tlLine} />
            {concerns.map((c, i) => {
              const high = c.urgency_level === 'high';
              return (
                <Pressable
                  key={c.id || i}
                  style={({ pressed }) => [styles.tlItem, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push({
                    pathname: '/(tabs)/edit-concern',
                    params: { concern: JSON.stringify(c) },
                  })}
                >
                  <View style={[styles.tlDot, { backgroundColor: high ? C.red : C.gray400 }]} />
                  <View style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardSymptom} numberOfLines={2}>{c.symptom}</Text>
                      <Text style={styles.cardDate}>{c.date_logged || ''}</Text>
                    </View>
                    <Text style={styles.cardMeta}>
                      {c.body_area} · Severity {c.severity}/10
                    </Text>
                    {!!c.notes && (
                      <Text style={styles.cardNotes}>{c.notes}</Text>
                    )}
                    <View style={[styles.badge, { backgroundColor: high ? '#FDF0F0' : C.gray100 }]}>
                      <Text style={[styles.badgeTxt, { color: high ? C.redDark : C.gray400 }]}>
                        {(c.urgency_level || 'low').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  topBar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  topTitle:  { fontFamily: FONTS.display, fontSize: 32, color: C.black, letterSpacing: 1 },
  topHint:   { fontSize: 12, color: C.gray400, fontFamily: FONTS.body },
  scroll:    { flex: 1, paddingHorizontal: 20 },
  empty:     { color: C.gray400, fontSize: 14, textAlign: 'center', padding: 40, fontFamily: FONTS.body },

  tlWrap:    { position: 'relative', paddingLeft: 26, paddingTop: 4 },
  tlLine:    { position: 'absolute', left: 8, top: 16, bottom: 0, width: 2, backgroundColor: C.gray200 },

  tlItem:    { position: 'relative', marginBottom: 10 },
  tlDot:     { position: 'absolute', left: -19, top: 14, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: C.white },

  card:        { backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.gray200, padding: 11, paddingHorizontal: 14 },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3, gap: 8 },
  cardSymptom: { flex: 1, fontSize: 14, fontWeight: '500', color: C.black, fontFamily: FONTS.bodyMedium },
  cardDate:    { fontSize: 11, color: C.gray400, fontFamily: FONTS.body },
  cardMeta:    { fontSize: 12, color: C.gray400, fontFamily: FONTS.body },
  cardNotes:   { fontSize: 11, color: C.gray400, fontStyle: 'italic', marginTop: 3, fontFamily: FONTS.body },
  badge:       { alignSelf: 'flex-start', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8, marginTop: 6 },
  badgeTxt:    { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, fontFamily: FONTS.bodySemi },
});
