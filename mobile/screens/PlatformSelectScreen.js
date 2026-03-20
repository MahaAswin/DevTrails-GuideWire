import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { THEMES, COMMON_STYLES } from '../constants/Themes';

const PlatformSelectScreen = ({ navigation }) => {
  const platforms = [
    { name: 'Zomato', theme: THEMES.Zomato, logo: 'Z' },
    { name: 'Swiggy', theme: THEMES.Swiggy, logo: 'S' },
    { name: 'Amazon', theme: THEMES.Amazon, logo: 'A' },
  ];

  const handleSelect = (platform) => {
    navigation.navigate('Dashboard', { platformName: platform.name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back!</Text>
      <Text style={styles.subtitle}>Select your gig platform to continue</Text>

      {platforms.map((platform) => (
        <TouchableOpacity
          key={platform.name}
          style={[styles.platformCard, { borderLeftColor: platform.theme.primary }]}
          onPress={() => handleSelect(platform)}
        >
          <View style={[styles.logoPlaceholder, { backgroundColor: platform.theme.primary }]}>
            <Text style={styles.logoText}>{platform.logo}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.platformName}>{platform.name}</Text>
            <Text style={styles.platformTagline}>
              {platform.name === 'Zomato' ? 'Deliver food, spread joy' : 
               platform.name === 'Swiggy' ? 'Instant delivery, every time' : 
               'Professional logistics and delivery'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 30 },
  platformCard: {
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 5,
    ...COMMON_STYLES.shadow,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  info: { flex: 1 },
  platformName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  platformTagline: { color: '#aaa', fontSize: 14, marginTop: 4 },
});

export default PlatformSelectScreen;
