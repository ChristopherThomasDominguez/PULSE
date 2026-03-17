import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, Fonts } from '../constants/theme';

function PulseDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.delay((dots.length - i - 1) * 200),
        ]),
      ),
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { opacity: dot }]}
        />
      ))}
    </View>
  );
}

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analyzing your notes</Text>
      <Text style={styles.subtitle}>IBM Granite is processing your health data</Text>
      <PulseDots />

      <View style={styles.stepsContainer}>
        <View style={[styles.stepItem, styles.stepDone]}>
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <Text style={[styles.stepText, styles.stepTextDone]}>Concern received</Text>
        </View>
        <View style={[styles.stepItem, styles.stepDone]}>
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <Text style={[styles.stepText, styles.stepTextDone]}>Pattern analysis running</Text>
        </View>
        <View style={[styles.stepItem, styles.stepActive]}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <Text style={[styles.stepText, styles.stepTextActive]}>Generating visit prep...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.tealMid,
    marginHorizontal: 4,
  },
  stepsContainer: {
    width: '100%',
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
  },
  stepDone: {
    backgroundColor: Colors.tealLight,
  },
  stepActive: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  stepDotDone: {
    backgroundColor: Colors.teal,
  },
  stepDotActive: {
    backgroundColor: Colors.tealMid,
  },
  stepText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  stepTextDone: {
    color: Colors.tealDark,
  },
  stepTextActive: {
    color: Colors.text,
  },
});
