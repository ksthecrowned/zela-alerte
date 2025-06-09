import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { getUserReports, deleteReport } from '@/lib/firestore';
import { OutageReport } from '@/types';
import {
  User,
  MapPin,
  Bell,
  Palette,
  Settings,
  LogOut,
  Trash2,
  ChevronRight,
  FileText,
  HelpCircle,
} from 'lucide-react-native';
import { CurrentCityPicker } from '@/components/CurrentCityPicker';
import { CONGO_CITIES } from '@/data/locations';
import { NeighborhoodSelector } from '@/components/NeighborhoodSelector';

export default function ProfileScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { user, signOut, updateUserProfile } = useAuth();
  const [userReports, setUserReports] = useState<OutageReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [notifications, setNotifications] = useState(
    user?.notificationPreferences || {
      electricity: true,
      water: true,
      internet: true,
      allUpdates: false,
    }
  );

  const handleSignOut = () => {
    Alert.alert(
      'Se déconnecter',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement account deletion
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const loadUserReports = async () => {
    if (!user) return;
    
    setLoadingReports(true);
    try {
      const reports = await getUserReports(user.id);
      setUserReports(reports);
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error);
      Alert.alert('Erreur', 'Impossible de charger vos signalements');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    Alert.alert(
      'Supprimer le signalement',
      'Êtes-vous sûr de vouloir supprimer ce signalement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReport(reportId);
              setUserReports(prev => prev.filter(r => r.id !== reportId));
              Alert.alert('Succès', 'Signalement supprimé');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le signalement');
            }
          },
        },
      ]
    );
  };

  const updateNotificationPreference = async (key: keyof typeof notifications, value: boolean) => {
    const newPreferences = { ...notifications, [key]: value };
    setNotifications(newPreferences);
    
    try {
      await updateUserProfile({ notificationPreferences: newPreferences });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      // Revert the change
      setNotifications(notifications);
    }
  };

  const updateUserCity = async (city: string) => {
    try {
      await updateUserProfile({ city });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la ville:', error);
    }
  }

  const updateUserNeighborhoods = async (neighborhoods: string[]) => {
    try {
      await updateUserProfile({ neighborhoods });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des quartiers:', error);
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Clair';
      case 'dark':
        return 'Sombre';
      case 'auto':
        return 'Automatique';
      default:
        return 'Automatique';
    }
  };

  const handleThemeChange = () => {
    Alert.alert(
      'Thème de l\'application',
      'Choisissez le thème que vous préférez',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Clair', onPress: () => setTheme('light') },
        { text: 'Sombre', onPress: () => setTheme('dark') },
        { text: 'Automatique', onPress: () => setTheme('auto') },
      ]
    );
  };

  const handleViewReports = () => {
    Alert.alert(
      'Mes signalements',
      `Vous avez publié ${userReports.length} signalement${userReports.length !== 1 ? 's' : ''}`,
      [
        { text: 'Fermer', style: 'cancel' },
        { text: 'Charger', onPress: loadUserReports },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Profil
        </Text>
        <TouchableOpacity>
          <HelpCircle size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.displayName || 'Utilisateur'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <CurrentCityPicker
            value={user?.city || 'brazzaville'}
            onCityChange={(city) => updateUserCity(city)}
          />
        </View>

        {/* My Reports */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <NeighborhoodSelector 
            selectedCity={user?.city || 'brazzaville'}
            selectedNeighborhoods={user?.neighborhoods || []}
            onNeighborhoodsChange={(neighborhoods) => updateUserNeighborhoods(neighborhoods)}
          />
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.textSecondary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Notifications
            </Text>
          </View>

          <View style={styles.notificationItem}>
            <Text style={[styles.notificationLabel, { color: colors.text }]}>
              Électricité
            </Text>
            <Switch
              value={notifications.electricity}
              onValueChange={(value) => updateNotificationPreference('electricity', value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={notifications.electricity ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.notificationItem}>
            <Text style={[styles.notificationLabel, { color: colors.text }]}>
              Eau
            </Text>
            <Switch
              value={notifications.water}
              onValueChange={(value) => updateNotificationPreference('water', value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={notifications.water ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.notificationItem}>
            <Text style={[styles.notificationLabel, { color: colors.text }]}>
              Internet
            </Text>
            <Switch
              value={notifications.internet}
              onValueChange={(value) => updateNotificationPreference('internet', value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={notifications.internet ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.notificationItem}>
            <Text style={[styles.notificationLabel, { color: colors.text }]}>
              Toutes les mises à jour
            </Text>
            <Switch
              value={notifications.allUpdates}
              onValueChange={(value) => updateNotificationPreference('allUpdates', value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={notifications.allUpdates ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.settingItem} onPress={handleThemeChange}>
            <View style={styles.settingLeft}>
              <Palette size={20} color={colors.textSecondary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Thème
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {getThemeLabel()}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Se déconnecter"
            variant="outline"
            onPress={handleSignOut}
            style={[styles.actionButton, { borderColor: colors.tabBarActive }] as any}
            textStyle={{ color: colors.tabBarActive }}
          />

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Trash2 size={16} color={colors.tabBarActive} />
            <Text style={[styles.deleteButtonText, { color: colors.tabBarActive }]}>
              Supprimer mon compte
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  notificationLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  actions: {
    paddingVertical: 16,
  },
  actionButton: {
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
});