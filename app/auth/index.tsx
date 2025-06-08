import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Zap } from 'lucide-react-native';

export default function AuthIndexScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
          <Zap size={64} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Zela Alerte
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Signalements en temps réel des coupures d'électricité, d'eau et d'internet au Congo-Brazzaville
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button
          title="Se connecter"
          onPress={() => router.push('/auth/signin')}
          style={styles.button}
        />
        
        <Button
          title="Créer un compte"
          variant="outline"
          onPress={() => router.push('/auth/signup')}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, paddingTop: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
});