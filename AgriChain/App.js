import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AlertsScreen from './src/screens/AlertsScreen';
import ARIAScreen from './src/screens/AriaScreen';
import CropInputScreen from './src/screens/CropInputScreen';
import DiseaseScreen from './src/screens/DiseaseScreen';
import HomeScreen from './src/screens/HomeScreen';
import MarketScreen from './src/screens/MarketScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RecommendationScreen from './src/screens/RecommendationScreen';
import SchemesScreen from './src/screens/SchemesScreen';
import SpoilageScreen from './src/screens/SpoilageScreen';
import { COLORS } from './src/theme/colors';
import { setupNotifications, showPermissionResult } from './src/services/notificationService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.card,
    onSurface: COLORS.text,
    error: COLORS.warning,
  },
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.card,
    text: COLORS.text,
    border: '#DEE2E6',
    notification: COLORS.warning,
  },
};

const getTabIcon = (routeName) => {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Market':
      return 'chart-line';
    case 'Disease':
      return 'microscope';
    case 'ARIA':
      return 'microphone';
    case 'Profile':
      return 'account';
    default:
      return 'circle';
  }
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#7A7A7A',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 0,
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={getTabIcon(route.name)}
            size={size + 1}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Disease" component={DiseaseScreen} options={{ tabBarLabel: 'Scan' }} />
      <Tab.Screen name="ARIA" component={ARIAScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    (async () => {
      const granted = await setupNotifications();
      showPermissionResult(granted);
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="CropInput" component={CropInputScreen} />
            <Stack.Screen
              name="Recommendation"
              component={RecommendationScreen}
            />
            <Stack.Screen name="Spoilage" component={SpoilageScreen} />
            <Stack.Screen name="Alerts" component={AlertsScreen} />
            <Stack.Screen name="Schemes" component={SchemesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
