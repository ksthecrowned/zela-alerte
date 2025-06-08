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
import {
  ChevronRight,
  Check,
  MapPin,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CONGO_CITIES } from '@/data/locations';

interface PickerOption {
  label: string;
  value: string;
}

interface CityPickerProps {
  value: string;
  onCityChange?: (city: string) => void;
  error?: string;
}

export function CurrentCityPicker({ value, error, onCityChange }: CityPickerProps) {
  const { colors } = useTheme();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selected, setSelected] = useState(value);

  const snapPoints = useMemo(() => ['50%'], []);
  const options = useMemo<PickerOption[]>(
    () => CONGO_CITIES.map(city => ({
      label: city.name,
      value: city.id,
    })),
    []
  );

  const selectedOption = useMemo(
    () => options.find(opt => opt.value === selected),
    [selected, options]
  );

  const openBottomSheet = () => bottomSheetRef.current?.present();
  const closeBottomSheet = () => bottomSheetRef.current?.dismiss();

  const handleSelect = (option: PickerOption) => {
    onCityChange?.(option.value)
    setSelected(option.value);
    closeBottomSheet();
  };

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

  const renderOption = useCallback(
    ({ item }: { item: PickerOption }) => {
      const isSelected = item.value === selected;

      return (
        <TouchableOpacity
          style={[
            styles.option,
            { borderColor: colors.surface },
            isSelected && { backgroundColor: colors.border },
          ]}
          onPress={() => handleSelect(item)}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>
            {item.label}
          </Text>
          {isSelected && <Check size={20} color={colors.primary} />}
        </TouchableOpacity>
      );
    },
    [selected, colors, handleSelect]
  );

  return (
    <View>
      <TouchableOpacity onPress={openBottomSheet} style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <MapPin size={20} color={colors.textSecondary} />
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Ville actuelle
            </Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {selectedOption?.label || 'Non définie'}
            </Text>
          </View>
        </View>
        <ChevronRight size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <Text
            style={[styles.sheetTitle, {
              color: colors.text,
              borderColor: colors.border,
            }]}
          >
            Changer de ville
          </Text>
          <FlatList
            data={options}
            renderItem={renderOption}
            keyExtractor={(item) => item.value}
            style={styles.optionsList}
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
  optionsList: {
    flex: 1,
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
