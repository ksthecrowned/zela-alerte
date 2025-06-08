import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Picker } from '@/components/Picker';
import { ChevronLeft } from 'lucide-react-native';
import { CONGO_CITIES } from '@/data/locations';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const { signUp, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignUp = async () => {
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!displayName) newErrors.displayName = 'Nom requis';
    if (!email) newErrors.email = 'Email requis';
    if (!password) newErrors.password = 'Mot de passe requis';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirmation requise';
    if (!city) newErrors.city = 'Ville requise';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await signUp(email, password, displayName, city);
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({ general: 'Erreur lors de la création du compte' });
    }
  };

  const cityOptions = CONGO_CITIES.map(city => ({
    label: city.name,
    value: city.id,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Créer un compte
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Rejoignez la communauté Zela Alerte
          </Text>

          <View style={styles.form}>
            <Input
              label="Nom complet"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Votre nom complet"
              error={errors.displayName}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              error={errors.email}
            />

            <Picker
              label="Ville"
              value={city}
              onValueChange={setCity}
              options={cityOptions}
              placeholder="Sélectionnez votre ville"
              error={errors.city}
            />

            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChangeText={setPassword}
              placeholder="Votre mot de passe"
              error={errors.password}
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmez votre mot de passe"
              error={errors.confirmPassword}
            />

            {errors.general && (
              <Text style={[styles.error, { color: colors.error }]}>
                {errors.general}
              </Text>
            )}

            <Button
              title="Créer un compte"
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Vous avez déjà un compte ?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/signin')}>
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  Se connecter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  error: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginVertical: 8,
  },
  button: {
    width: '100%',
    marginVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});