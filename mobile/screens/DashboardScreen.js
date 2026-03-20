import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEMES, COMMON_STYLES } from '../constants/Themes';
import { platformService } from '../services/api';

const DashboardScreen = ({ route, navigation }) => {
  const { platformName } = route.params;
  const theme = THEMES[platformName] || THEMES.Default;

  const [wallet, setWallet] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mocking API delay
        setTimeout(() => {
          setWallet({ balance: 5420.50, currency: 'INR' });
          setWeather({ temp: 32, condition: 'Sunny' });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { title: 'Policies', icon: '📋', screen: 'Policies' },
    { title: 'Wallet', icon: '💰', screen: 'Wallet' },
    { title: 'Claims', icon: '📜', screen: 'Claims' },
    { title: 'Weather', icon: '☁️', screen: 'Weather' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Partner!</Text>
            <Text style={[styles.platformLabel, { color: theme.primary }]}>{platformName} Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.profileCircle}>
            <Text style={styles.profileText}>JD</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Summary Card */}
        <TouchableOpacity 
          style={[styles.walletCard, { backgroundColor: theme.surface, borderTopColor: theme.primary }]}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Text style={styles.cardLabel}>Wallet Balance</Text>
          <Text style={styles.balanceText}>₹{wallet?.balance.toLocaleString()}</Text>
          <Text style={styles.cardFooter}>Tap to view details</Text>
        </TouchableOpacity>

        {/* Main Features Grid */}
        <View style={styles.grid}>
          {features.map((item) => (
            <TouchableOpacity 
              key={item.title} 
              style={styles.gridItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Text style={styles.gridIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.gridTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weather Status */}
        <View style={styles.statusCard}>
          <Text style={styles.cardLabel}>Live Weather Update</Text>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherIcon}>☀️</Text>
            <View>
              <Text style={styles.tempText}>{weather?.temp}°C - {weather?.condition}</Text>
              <Text style={styles.weatherSub}>Safe to deliver today!</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.actionButtonText}>Go Online</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  platformLabel: { fontSize: 16, fontWeight: '600' },
  profileCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  profileText: { color: '#fff', fontWeight: 'bold' },
  walletCard: { 
    padding: 24, 
    borderRadius: 20, 
    marginBottom: 24, 
    borderTopWidth: 4,
    ...COMMON_STYLES.shadow 
  },
  cardLabel: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  balanceText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  cardFooter: { color: '#888', fontSize: 12, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  gridItem: { 
    width: '48%', 
    backgroundColor: '#1E1E1E', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginBottom: 16,
    ...COMMON_STYLES.shadow 
  },
  iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridIcon: { fontSize: 24 },
  gridTitle: { color: '#fff', fontWeight: '600', fontSize: 16 },
  statusCard: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20, marginBottom: 30 },
  weatherInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  weatherIcon: { fontSize: 32, marginRight: 16 },
  tempText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  weatherSub: { color: '#aaa', fontSize: 14 },
  actionButton: { padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default DashboardScreen;
