import React, { useMemo, useState } from 'react';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  HelperText,
  Menu,
  Text,
} from 'react-native-paper';
import {
  CROP_OPTIONS,
  DISTRICT_OPTIONS,
  SOIL_OPTIONS,
  STORAGE_OPTIONS,
} from '../data/agriOptions';
import { COLORS } from '../theme/colors';

function PickerField({ label, placeholder, value, options, onSelect }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const displayValue = value || placeholder;

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            style={styles.pickerButton}
            labelStyle={[
              styles.pickerButtonLabel,
              !value ? styles.placeholderText : null,
            ]}
            contentStyle={styles.pickerButtonContent}
            onPress={() => setMenuVisible(true)}
          >
            {displayValue}
          </Button>
        }
      >
        {options.map((option) => (
          <Menu.Item
            key={option}
            title={option}
            onPress={() => {
              onSelect(option);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
}

const formatDateForDisplay = (dateValue) =>
  new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue));

export default function CropInputScreen({ navigation }) {
  const [crop, setCrop] = useState('');
  const [district, setDistrict] = useState('');
  const [soilType, setSoilType] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [storageType, setStorageType] = useState('');
  const [transitHours, setTransitHours] = useState(12);
  const [submitted, setSubmitted] = useState(false);

  const isValid = useMemo(
    () => Boolean(crop && district && soilType && sowingDate && storageType),
    [crop, district, soilType, sowingDate, storageType]
  );

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: sowingDate ? new Date(sowingDate) : new Date(),
      mode: 'date',
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          setSowingDate(selectedDate.toISOString());
        }
      },
      maximumDate: new Date(),
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) {
      return;
    }
    navigation.navigate('Recommendation', {
      formData: {
        crop,
        district,
        soilType,
        sowingDate,
        storageType,
        transitHours,
      },
    });
  };

  return (
    <View style={styles.screen}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Tell us about your crop"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.formCard}>
          <Card.Content>
            <PickerField
              label="Select Crop"
              placeholder="Choose a crop"
              value={crop}
              options={CROP_OPTIONS}
              onSelect={setCrop}
            />

            <PickerField
              label="Your District"
              placeholder="Choose district"
              value={district}
              options={DISTRICT_OPTIONS}
              onSelect={setDistrict}
            />

            <PickerField
              label="Soil Type"
              placeholder="Choose soil"
              value={soilType}
              options={SOIL_OPTIONS}
              onSelect={setSoilType}
            />

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Sowing Date</Text>
              <Button
                mode="outlined"
                style={styles.pickerButton}
                labelStyle={[
                  styles.pickerButtonLabel,
                  !sowingDate ? styles.placeholderText : null,
                ]}
                contentStyle={styles.pickerButtonContent}
                onPress={openDatePicker}
              >
                {sowingDate ? formatDateForDisplay(sowingDate) : 'Select date'}
              </Button>
            </View>

            <PickerField
              label="Storage Type"
              placeholder="Choose storage"
              value={storageType}
              options={STORAGE_OPTIONS}
              onSelect={setStorageType}
            />

            <View style={styles.sliderBlock}>
              <Text style={styles.fieldLabel}>Transit time to mandi</Text>
              <Text style={styles.transitValue}>{`${transitHours} hours`}</Text>
              <Slider
                minimumValue={1}
                maximumValue={48}
                step={1}
                value={transitHours}
                onValueChange={(value) => setTransitHours(value)}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor="#CFE8D9"
                thumbTintColor={COLORS.accent}
              />
            </View>

            <HelperText type="error" visible={submitted && !isValid}>
              Please complete all fields before continuing.
            </HelperText>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          buttonColor={COLORS.primary}
          onPress={handleSubmit}
        >
          Get My Recommendation {'\u2192'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.card,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EC',
  },
  headerTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    rowGap: 16,
  },
  formCard: {
    borderRadius: 16,
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerButton: {
    borderColor: '#C7CED4',
    borderRadius: 12,
  },
  pickerButtonContent: {
    minHeight: 48,
    justifyContent: 'center',
  },
  pickerButtonLabel: {
    color: COLORS.text,
    fontSize: 15,
  },
  placeholderText: {
    color: '#7A858F',
  },
  sliderBlock: {
    marginTop: 6,
    marginBottom: 6,
  },
  transitValue: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  submitButton: {
    borderRadius: 14,
  },
  submitButtonContent: {
    minHeight: 56,
  },
});
