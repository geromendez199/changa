import { useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { C } from '../constants';

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={s.tabItem}>
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={[s.label, focused && s.labelActive]}>{label}</Text>
    </View>
  );
}

function Nav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user && inAuth) router.replace('/');
  }, [user, loading]);

  if (loading) {
    return (
      <View style={s.splash}>
        <Text style={s.splashLogo}>changa.</Text>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: s.tabBar,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index"     options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="INICIO"    focused={focused} /> }} />
      <Tabs.Screen name="pedidos"   options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="PEDIDOS"   focused={focused} /> }} />
      <Tabs.Screen name="prestador" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛠️" label="PRESTADOR" focused={focused} /> }} />
      <Tabs.Screen name="perfil"    options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="PERFIL"    focused={focused} /> }} />
      <Tabs.Screen name="(auth)"    options={{ href: null }} />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Nav />
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  splash: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 24 },
  splashLogo: { fontSize: 42, fontWeight: '700', color: C.accent, letterSpacing: -1 },
  tabBar: {
    backgroundColor: C.card,
    borderTopColor: C.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 82 : 64,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 6 },
  emoji: { fontSize: 20 },
  label: { fontSize: 8, letterSpacing: 1, fontWeight: '700', color: C.muted },
  labelActive: { color: C.accent },
});
