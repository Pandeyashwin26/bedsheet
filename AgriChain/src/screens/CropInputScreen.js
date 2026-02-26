import React, { useEffect, useMemo, useState } from 'react';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

const CROP_STAGE_OPTIONS = [
  {
    icon: '\u{1F331}',
    label: 'Early Stage',
    value: 'early-stage',
  },
  {
    icon: '\u{1F33F}',
    label: 'Growing Well',
    value: 'growing',
  },
  {
    icon: '\u2705',
    label: 'Ready to Harvest',
    value: 'harvest-ready',
  },
];

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

const matchDistrictName = (geocode) => {
  if (!geocode) {
    return '';
  }

  const candidates = [
    geocode.district,
    geocode.subregion,
    geocode.city,
    geocode.region,
    geocode.name,
  ]
    .filter(Boolean)
    .map((item) => String(item).trim().toLowerCase());

  for (const candidate of candidates) {
    const match = DISTRICT_OPTIONS.find((district) => {
      const districtLower = district.toLowerCase();
      return candidate.includes(districtLower) || districtLower.includes(candidate);
    });
    if (match) {
      return match;
    }
  }
  return '';
};

export default function CropInputScreen({ navigation }) {
  const [crop, setCrop] = useState('');
  const [cropStage, setCropStage] = useState('');
  const [district, setDistrict] = useState('');
  const [soilType, setSoilType] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [storageType, setStorageType] = useState('');
  const [transitHours, setTransitHours] = useState(12);
  const [submitted, setSubmitted] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [autoDetectedDistrict, setAutoDetectedDistrict] = useState('');
  const [districtManualEdit, setDistrictManualEdit] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  const showDistrictPicker = locationDenied || districtManualEdit || !autoDetectedDistrict;

  const isValid = useMemo(
    () =>
      Boolean(crop && cropStage && district && soilType && sowingDate && storageType),
    [crop, cropStage, district, soilType, sowingDate, storageType]
  );

  useEffect(() => {
    let mounted = true;

    const detectDistrict = async () => {
      setDetectingLocation(true);
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          if (mounted) {
            setLocationDenied(true);
            setDistrictManualEdit(true);
          }
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const places = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        const matchedDistrict = matchDistrictName(places?.[0]);

        if (mounted && matchedDistrict) {
          setDistrict(matchedDistrict);
          setAutoDetectedDistrict(matchedDistrict);
          setDistrictManualEdit(false);
          setLocationDenied(false);
        }
      } catch {
        if (mounted) {
          setDistrictManualEdit(true);
        }
      } finally {
        if (mounted) {
          setDetectingLocation(false);
        }
      }
    };

    detectDistrict();
    return () => {
      mounted = false;
    };
  }, []);

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
        cropStage,
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

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>How is your crop right now?</Text>
              <View style={styles.stageRow}>
                {CROP_STAGE_OPTIONS.map((item) => {
                  const selected = cropStage === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.stageButton,
                        selected ? styles.stageButtonActive : null,
                      ]}
                      activeOpacity={0.9}
                      onPress={() => setCropStage(item.value)}
                    >
                      <Text style={styles.stageIcon}>{item.icon}</Text>
                      <Text
                        style={[
                          styles.stageLabel,
                          selected ? styles.stageLabelActive : null,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {detectingLocation ? (
              <Text style={styles.locationStatus}>Detecting your location...</Text>
            ) : null}

            {autoDetectedDistrict && !showDistrictPicker ? (
              <View style={styles.autoDetectedRow}>
                <Text style={styles.autoDetectedText}>
                  {`\u{1F4CD} Auto-detected: ${autoDetectedDistrict}`}
                </Text>
                <Button
                  compact
                  mode="text"
                  onPress={() => setDistrictManualEdit(true)}
                >
                  Edit
                </Button>
              </View>
            ) : null}

            {showDistrictPicker ? (
              <PickerField
                label="Your District"
                placeholder="Choose district"
                value={district}
                options={DISTRICT_OPTIONS}
                onSelect={setDistrict}
              />
            ) : null}

            {locationDenied ? (
              <Text style={styles.permissionHint}>
                Location permission denied. Please select district manually.
              </Text>
            ) : null}

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
  stageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
  },
  stageButton: {
    width: '31%',
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D1D9E0',
    backgroundColor: '#F6F8FA',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 4,
  },
  stageButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E9F5EE',
  },
  stageIcon: {
    fontSize: 26,
  },
  stageLabel: {
    fontSize: 12,
    color: '#47545F',
    textAlign: 'center',
    fontWeight: '600',
  },
  stageLabelActive: {
    color: COLORS.primary,
  },
  locationStatus: {
    color: '#66727C',
    fontSize: 13,
    marginBottom: 10,
  },
  autoDetectedRow: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EDF7F1',
    borderWidth: 1,
    borderColor: '#D3EAD9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  autoDetectedText: {
    color: '#1F513E',
    fontSize: 13,
    fontWeight: '600',
  },
  permissionHint: {
    color: '#7A5B00',
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
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
