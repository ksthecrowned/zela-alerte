import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Picker } from '@/components/Picker';
import { CONGO_CITIES, SERVICE_TYPES, OUTAGE_STATUS } from '@/data/locations';
import { createReport } from '@/lib/firestore';
import { OutageReport } from '@/types';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { notifyUsersOfNewReport } from '@/lib/notifications';

export default function ReportScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    city: user?.city || '',
    neighborhood: '',
    serviceType: '',
    status: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour signaler une coupure');
      return;
    }

    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.city) newErrors.city = 'Ville requise';
    if (!formData.neighborhood) newErrors.neighborhood = 'Quartier requis';
    if (!formData.serviceType) newErrors.serviceType = 'Service requis';
    if (!formData.status) newErrors.status = 'Statut requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const reportData: Omit<OutageReport, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        userName: user.displayName || 'Utilisateur',
        userEmail: user.email,
        city: formData.city,
        neighborhood: formData.neighborhood,
        serviceType: formData.serviceType as 'electricity' | 'water' | 'internet',
        status: formData.status as 'outage' | 'restored',
        description: formData.description || undefined,
        timestamp: new Date(),
      };

      await createReport(reportData);
      await notifyUsersOfNewReport(reportData as OutageReport)
      
      Alert.alert(
        'Signalement envoyé',
        'Votre signalement a été publié avec succès et la communauté en sera informée.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                city: user?.city || '',
                neighborhood: '',
                serviceType: '',
                status: '',
                description: '',
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création du signalement:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const cityOptions = CONGO_CITIES.map(city => ({
    label: city.name,
    value: city.id,
  }));

  const selectedCityData = CONGO_CITIES.find(city => city.id === formData.city);
  const neighborhoodOptions = selectedCityData
    ? selectedCityData.neighborhoods.map(neighborhood => ({
        label: neighborhood,
        value: neighborhood,
      }))
    : [];

  const serviceOptions = SERVICE_TYPES.map(service => ({
    label: service.name,
    value: service.id,
  }));

  const statusOptions = OUTAGE_STATUS.map(status => ({
    label: status.name,
    value: status.id,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Nouveau signalement
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Informez votre communauté en temps réel
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Picker
              label="Ville"
              value={formData.city}
              onValueChange={(value) => {
                setFormData({ ...formData, city: value, neighborhood: '' });
                setErrors({ ...errors, city: '' });
              }}
              options={cityOptions}
              placeholder="Sélectionnez votre ville"
              error={errors.city}
            />

            <Picker
              label="Quartier"
              value={formData.neighborhood}
              onValueChange={(value) => {
                setFormData({ ...formData, neighborhood: value });
                setErrors({ ...errors, neighborhood: '' });
              }}
              options={neighborhoodOptions}
              placeholder="Sélectionnez votre quartier"
              error={errors.neighborhood}
            />

            <Picker
              label="Type de service"
              value={formData.serviceType}
              onValueChange={(value) => {
                setFormData({ ...formData, serviceType: value });
                setErrors({ ...errors, serviceType: '' });
              }}
              options={serviceOptions}
              placeholder="Quel service est concerné ?"
              error={errors.serviceType}
            />

            <Picker
              label="Statut"
              value={formData.status}
              onValueChange={(value) => {
                setFormData({ ...formData, status: value });
                setErrors({ ...errors, status: '' });
              }}
              options={statusOptions}
              placeholder="Coupure ou rétabli ?"
              error={errors.status}
            />

            <Input
              label="Description (facultatif)"
              value={formData.description}
              onChangeText={(value) => setFormData({ ...formData, description: value })}
              placeholder="Ajoutez des détails sur la situation..."
              multiline
              numberOfLines={3}
              containerStyle={styles.textArea}
            />

            <View style={styles.mediaSection}>
              <Text style={[styles.mediaLabel, { color: colors.text }]}>
                Ajouter une photo (facultatif)
              </Text>
              <Text style={[styles.mediaSubtext, { color: colors.textSecondary }]}>
                Fonctionnalité bientôt disponible
              </Text>
              <View style={styles.mediaButtons}>
                <TouchableOpacity
                  style={[styles.mediaButton, { backgroundColor: colors.surface, opacity: 0.5 }]}
                  disabled
                >
                  <Camera size={24} color={colors.textSecondary} />
                  <Text style={[styles.mediaButtonText, { color: colors.textSecondary }]}>
                    Prendre une photo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mediaButton, { backgroundColor: colors.surface, opacity: 0.5 }]}
                  disabled
                >
                  <ImageIcon size={24} color={colors.textSecondary} />
                  <Text style={[styles.mediaButtonText, { color: colors.textSecondary }]}>
                    Galerie
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Publier le signalement"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: {
    paddingTop: 16,
  },
  textArea: {
    marginTop: 8,
  },
  mediaSection: {
    marginTop: 24,
  },
  mediaLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  mediaSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  mediaButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  submitButton: {
    width: '100%',
  },
});