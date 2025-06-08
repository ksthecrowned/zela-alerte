import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Picker } from '@/components/Picker';
import { OutageCard } from '@/components/OutageCard';
import { CONGO_CITIES, SERVICE_TYPES, OUTAGE_STATUS } from '@/data/locations';
import { subscribeToReports } from '@/lib/firestore';
import { OutageReport } from '@/types';
import { MapPin, Filter } from 'lucide-react-native';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [reports, setReports] = useState<OutageReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(user?.city || 'brazzaville');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!selectedCity) return;

    setLoading(true);
    
    // Subscribe to real-time reports
    const unsubscribe = subscribeToReports(
      (newReports) => {
        setReports(newReports);
        setLoading(false);
        setRefreshing(false);
      },
      selectedCity,
      selectedService || undefined,
      selectedStatus || undefined,
      100
    );

    return unsubscribe;
  }, [selectedCity, selectedService, selectedStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    // The subscription will automatically update the data
  };

  const filteredReports = reports.filter(report => {
    if (selectedNeighborhood && report.neighborhood !== selectedNeighborhood) return false;
    return true;
  });

  const cityOptions = CONGO_CITIES.map(city => ({
    label: city.name,
    value: city.id,
  }));

  const selectedCityData = CONGO_CITIES.find(city => city.id === selectedCity);
  const neighborhoodOptions = selectedCityData
    ? [
        { label: 'Tous les quartiers', value: '' },
        ...selectedCityData.neighborhoods.map(neighborhood => ({
          label: neighborhood,
          value: neighborhood,
        })),
      ]
    : [];

  const serviceOptions = [
    { label: 'Tous les services', value: '' },
    ...SERVICE_TYPES.map(service => ({
      label: service.name,
      value: service.id,
    })),
  ];

  const statusOptions = [
    { label: 'Tous les statuts', value: '' },
    ...OUTAGE_STATUS.map(status => ({
      label: status.name,
      value: status.id,
    })),
  ];

  const clearFilters = () => {
    setSelectedNeighborhood('');
    setSelectedService('');
    setSelectedStatus('');
  };

  const handleReportPress = (report: OutageReport) => {
    Alert.alert(
      'Détails du signalement',
      `${report.description || 'Aucune description'}\n\nSignalé par: ${report.userName}\nDate: ${report.timestamp.toLocaleString('fr-FR')}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des signalements...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Bonjour,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.displayName || 'Utilisateur'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.locationSelector}>
          <MapPin size={24} color={colors.primary} />
          <Picker
            value={selectedCity}
            onValueChange={setSelectedCity}
            options={cityOptions}
            containerStyle={styles.cityPicker}
          />
        </View>

        {showFilters && (
          <View style={[styles.filtersContainer, { backgroundColor: colors.surface }]}>
            <Picker
              label="Quartier"
              value={selectedNeighborhood}
              onValueChange={setSelectedNeighborhood}
              options={neighborhoodOptions}
            />
            <Picker
              label="Service"
              value={selectedService}
              onValueChange={setSelectedService}
              options={serviceOptions}
            />
            <Picker
              label="Statut"
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              options={statusOptions}
            />
            <Button
              title="Effacer les filtres"
              variant="outline"
              size="small"
              style={{ marginTop: 10 }}
              disabled={
                selectedNeighborhood === ''
                && selectedStatus === ''
                && selectedService === ''
              }
              onPress={clearFilters}
            />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.reportsHeader}>
          <Text style={[styles.reportsTitle, { color: colors.text }]}>
            Signalements récents
          </Text>
          <Text style={[styles.reportsCount, { color: colors.textSecondary }]}>
            {filteredReports.length} signalement{filteredReports.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {filteredReports.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Aucun signalement trouvé
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Soyez le premier à signaler une coupure dans votre quartier
            </Text>
          </View>
        ) : (
          filteredReports.map(report => (
            <OutageCard 
              key={report.id} 
              report={report} 
              onPress={() => handleReportPress(report)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
  },
  filterButton: {
    padding: 8,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityPicker: {
    flex: 1,
    marginLeft: 8,
    marginVertical: 0,
  },
  filtersContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  reportsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});