import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import PlatformSelectScreen from '../screens/PlatformSelectScreen';
import DashboardScreen from '../screens/DashboardScreen';

// Dummy screens for features
import { View, Text, StyleSheet } from 'react-native';
const Placeholder = ({ route }) => (
  <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: '#fff', fontSize: 24 }}>{route.name} Screen</Text>
    <Text style={{ color: '#aaa' }}>Coming Soon...</Text>
  </View>
);

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PlatformSelect" component={PlatformSelectScreen} options={{ title: 'Select Platform' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Policies" component={Placeholder} />
        <Stack.Screen name="Wallet" component={Placeholder} />
        <Stack.Screen name="Claims" component={Placeholder} />
        <Stack.Screen name="Weather" component={Placeholder} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
