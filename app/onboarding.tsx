import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Zap, Bell, Users } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const onboardingData = [
  {
    title: 'Signalez les coupures en un clic',
    subtitle: 'Électricité, eau ou internet : informez votre communauté instantanément',
    icon: Zap,
    color: '#f97316',
  },
  {
    title: 'Soyez alerté quand ça revient',
    subtitle: 'Recevez des notifications push dès que les services sont rétablis',
    icon: Bell,
    color: '#f97316',
  },
  {
    title: 'Ensemble, soyons informés en temps réel',
    subtitle: 'Rejoignez la communauté et restez connecté à votre quartier',
    icon: Users,
    color: '#f97316',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const ONBOARDING_KEY = 'hasSeenOnboarding';

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/auth');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/auth');
  };

  const currentData = onboardingData[currentIndex];
  const IconComponent = currentData.icon;

  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeen = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (hasSeen === 'true') {
        router.replace('/auth');
      } else {
        router.replace('/onboarding');
      }
    };
  
    checkOnboarding();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Button
          title="Passer"
          variant="outline"
          size="small"
          onPress={handleSkip}
        />
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <IconComponent size={80} color={currentData.color} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {currentData.title}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {currentData.subtitle}
        </Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={currentIndex === onboardingData.length - 1 ? 'Commencer' : 'Suivant'}
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, paddingTop: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  button: {
    width: '100%',
  },
});