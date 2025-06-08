import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ViewStyle,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface PickerOption {
  label: string;
  value: string;
}

interface PickerProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: PickerOption[];
  placeholder?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Picker({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Sélectionner...',
  error,
  containerStyle,
}: PickerProps) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(value);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const openBottomSheet = () => bottomSheetRef.current?.present();
  const closeBottomSheet = () => bottomSheetRef.current?.dismiss();

  const selectedOption = options.find((opt) => opt.value === selected);

  const handleSelect = (option: PickerOption) => {
    onValueChange(option.value);
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

  const renderOption = ({ item }: { item: PickerOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        { borderColor: colors.surface },
        item.value === selected && { backgroundColor: colors.border },
      ]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.optionText, { color: colors.text }]}>
        {item.label}
      </Text>
      {item.value === selected && <Check size={20} color={colors.primary} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.picker,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
        onPress={openBottomSheet}
      >
        <Text
          style={[
            styles.pickerText,
            { color: selectedOption ? colors.text : colors.textSecondary },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
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
            {label || 'Sélectionner une option'}
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
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
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
});
