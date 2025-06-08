import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { FileText, ChevronRight, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CONGO_CITIES } from '@/data/locations';

interface PickerProps {
  selectedCity: string;
  selectedNeighborhoods: string[];
  onNeighborhoodsChange?: (neighborhoods: string[]) => void;
  error?: string;
}

export function NeighborhoodSelector({
  selectedCity,
  selectedNeighborhoods,
  onNeighborhoodsChange,
  error,
}: PickerProps) {
  const { colors } = useTheme();
  const [neighborhoods, setNeighborhoods] = useState<string[]>(selectedNeighborhoods);

  const currentCityData = useMemo(
    () => CONGO_CITIES.find(city => city.id === selectedCity),
    [selectedCity]
  );

  const neighborhoodOptions = useMemo(() => {
    if (!currentCityData) return [];
    return [
      ...currentCityData.neighborhoods.map(n => ({ label: n, value: n })),
    ];
  }, [currentCityData]);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['65%'], []);

  const openBottomSheet = () => bottomSheetRef.current?.present();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const toggleNeighborhood = (value: string) => {
    if (value === '') {
      setNeighborhoods([]);
      onNeighborhoodsChange?.([]);
      return;
    }

    const isSelected = neighborhoods.includes(value);
    const updated = isSelected
      ? neighborhoods.filter(n => n !== value)
      : [...neighborhoods, value];

    setNeighborhoods(updated);
    onNeighborhoodsChange?.(updated);
  };

  const renderNeighborhoodOption = ({ item }: { item: { label: string; value: string } }) => {
    const isSelected = item.value !== '' && neighborhoods.includes(item.value);
    return (
      <TouchableOpacity
        style={[styles.option, { borderColor: 'transparent' }, isSelected && { backgroundColor: colors.border }]}
        onPress={() => toggleNeighborhood(item.value)}
      >
        <Text style={[styles.optionText, { color: colors.text }]}>{item.label}</Text>
        {isSelected && <Check size={20} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <TouchableOpacity style={styles.settingItem} onPress={openBottomSheet}>
        <View style={styles.settingLeft}>
          <FileText size={20} color={colors.textSecondary} />
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Mes quartiers préférés</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {neighborhoods.length > 0
                ? `${neighborhoods.length} sélectionné(s)`
                : 'Gérer vos quartiers préférés'}
            </Text>
          </View>
        </View>
        <ChevronRight size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <Text style={[styles.sheetTitle, { color: colors.text, borderColor: colors.border }]}>
            Sélectionner les quartiers
          </Text>
          <FlatList
            data={neighborhoodOptions}
            renderItem={renderNeighborhoodOption}
            keyExtractor={item => item.value || 'all'}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    padding: 16,
    borderBottomWidth: 1,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
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
});
