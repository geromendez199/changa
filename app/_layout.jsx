import { useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import {
  View, Text, StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';
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

// ─── Root navigator ───────────────────────────────────────────────────────────
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

  const tabs = (
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

  // Web: wrap inside centered phone-frame
  if (isWeb) {
    return (
      <View style={s.webRoot}>
        <View style={s.webFrame}>
          {tabs}
        </View>
      </View>
    );
  }

  return tabs;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Nav />
    </AuthProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const TAB_HEIGHT      = Platform.OS === 'ios' ? 84 : 66;
const TAB_PADDING_BTM = Platform.OS === 'ios' ? 22 : 10;

const s = StyleSheet.create({
  splash:     { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 24 },
  splashLogo: { fontSize: 42, fontWeight: '800', color: C.accent, letterSpacing: -2 },

  // Tab icon
  tabItem:        { alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 4 },
  tabEmoji:       { fontSize: 20, opacity: 0.45 },
  tabEmojiFocused:{ opacity: 1 },
  tabLabel:       { fontSize: 8, letterSpacing: 1.2, fontWeight: '800', color: C.muted },
  tabLabelActive: { color: C.accent },

  // Tab bar
  tabBar: {
    backgroundColor: C.card,
    borderTopColor: C.border,
    borderTopWidth: 1,
    height: TAB_HEIGHT,
    paddingBottom: TAB_PADDING_BTM,
  },

  // Web outer canvas
  webRoot: {
    flex: 1,
    backgroundColor: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Phone frame — centered container on desktop
  webFrame: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
    backgroundColor: C.bg,
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: C.borderLight,
    borderRightColor: C.borderLight,
  },
});
