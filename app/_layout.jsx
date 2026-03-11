import { useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { C } from '../constants';

const isWeb = Platform.OS === 'web';

// ─── Tab icon ─────────────────────────────────────────────────────────────────
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={s.tabItem}>
      <Text style={[s.tabEmoji, focused && s.tabEmojiFocused]}>{emoji}</Text>
      <Text style={[s.tabLabel, focused && s.tabLabelActive]}>{label}</Text>
    </View>
  );
}

// ─── Navigation shell ─────────────────────────────────────────────────────────
function Nav() {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user  &&  inAuth) router.replace('/');
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
    <View style={{ flex: 1 }}>
      {/* Global Header / Logo */}
      <View style={s.globalHeader}>
        <Text style={s.globalLogo} accessibilityRole="header">changa.</Text>
      </View>
      <Tabs
        screenOptions={{
          headerShown:       false,
          tabBarStyle:       s.tabBar,
          tabBarShowLabel:   false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen name="index"     options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="INICIO"    focused={focused} /> }} />
        <Tabs.Screen name="pedidos"   options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="PEDIDOS"   focused={focused} /> }} />
        <Tabs.Screen name="prestador" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛠️" label="PRESTADOR" focused={focused} /> }} />
        <Tabs.Screen name="perfil"    options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="PERFIL"    focused={focused} /> }} />
        <Tabs.Screen name="(auth)"    options={{ href: null }} />
      </Tabs>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Nav />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const s = StyleSheet.create({
  splash:     { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 24 },
  splashLogo: { fontSize: 42, fontWeight: '800', color: C.accent, letterSpacing: -2 },

  globalHeader: {
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'ios' ? 48 : 16, // Top padding for safe area
    paddingBottom: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globalLogo: {
    fontSize: 24,
    fontWeight: '800',
    color: C.accent,
    letterSpacing: -1,
  },

  tabItem:         { alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 4 },
  tabEmoji:        { fontSize: 20, opacity: 0.45 },
  tabEmojiFocused: { opacity: 1 },
  tabLabel:        { fontSize: 8, letterSpacing: 1.2, fontWeight: '800', color: C.muted },
  tabLabelActive:  { color: C.accent },

  tabBar: {
    backgroundColor: C.card,
    borderTopColor:  C.border,
    borderTopWidth:  1,
    height:          Platform.OS === 'ios' ? 84 : 66,
    paddingBottom:   Platform.OS === 'ios' ? 22 : 10,
  },
});
