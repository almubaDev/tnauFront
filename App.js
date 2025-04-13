import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, Text } from 'react-native';
import * as Font from 'expo-font';
import TarotScreen from './screens/TarotScreen';
import MarketScreen from './screens/MarketScreen';
import StoreScreen from './screens/StoreScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegistroScreen from './screens/RegistroScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import HechizosAmorScreen from './screens/HechizosAmorScreen';
import HechizosDineroScreen from './screens/HechizosDineroScreen';
import HechizosMiscelaneoScreen from './screens/HechizosMiscelaneoScreen';
import MotorNauticaScreen from './screens/MotorNauticaScreen';
import SubmenuPocionesScreen from './screens/SubmenuPocionesScreen';
import PocionesAmorScreen from './screens/PocionesAmorScreen';
import PocionesDineroScreen from './screens/PocionesDineroScreen';
import PocionesMiscelaneoScreen from './screens/PocionesMiscelaneoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Carga de fuentes personalizadas
const loadFonts = () => {
  return Font.loadAsync({
    'TarotTitles': require('./assets/fonts/IMFellDWPicaSC-Regular.ttf'),
    'TarotBody': require('./assets/fonts/Junicode.ttf'),
  });
};

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ 
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#000000',
      }
    }}>
      <Tab.Screen
        name="Tarot"
        component={TarotScreen}
        options={{
          tabBarIcon: () => (
            <Image 
              source={require('./assets/img/icons/tarot_icon.png')} 
              style={{ width: 24, height: 24 }} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Mercado"
        component={MarketScreen}
        options={{
          tabBarIcon: () => (
            <Image 
              source={require('./assets/img/icons/market_icon.png')} 
              style={{ width: 24, height: 24 }} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Tienda"
        component={StoreScreen}
        options={{
          tabBarIcon: () => (
            <Image 
              source={require('./assets/img/icons/shop_icon.png')} 
              style={{ width: 24, height: 24 }} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: () => (
            <Image 
              source={require('./assets/img/icons/profile_icon.png')} 
              style={{ width: 24, height: 24 }} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Precargar fuentes
        await loadFonts();
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
      }
    }

    prepare();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#d6af36' }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registro" component={RegistroScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
        <Stack.Screen name="HechizosAmor" component={HechizosAmorScreen} />
        <Stack.Screen name="HechizosDinero" component={HechizosDineroScreen} />
        <Stack.Screen name="HechizosMiscelaneo" component={HechizosMiscelaneoScreen} />
        <Stack.Screen name="MotorNauticaScreen" component={MotorNauticaScreen} />
        
        {/* Screens de Pociones */}
        <Stack.Screen name="SubmenuPociones" component={SubmenuPocionesScreen} />
        <Stack.Screen name="PocionesAmor" component={PocionesAmorScreen} />
        <Stack.Screen name="PocionesDinero" component={PocionesDineroScreen} />
        <Stack.Screen name="PocionesMiscelaneo" component={PocionesMiscelaneoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}