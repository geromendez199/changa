import { useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import {
  View, Text, StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { C } from '../constants';

const isWeb = Platform.OS === 'web';

// ─── Tab icon (used on both web + native) ─────────────────────────────────────
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

  const tabBar = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: s.tabBar,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="INICIO"    focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="PEDIDOS"   focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="prestador"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛠️" label="PRESTADOR" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="PERFIL"    focused={focused} />,
        }}
      />
      <Tabs.Screen name="(auth)" options={{ href: null }} />
    </Tabs>
  );

  // ── Desktop web: render inside a centered phone-frame container ─────────────
  if (isWeb) {
    return (
      <View style={s.webRoot}>
        {/* Subtle grid/noise bg on the "desktop canvas" area */}
        <View style={s.webBg} />
        <View style={s.webFrame}>
          {tabBar}
        </View>
      </View>
    );
  }

  // ── Native mobile: full-screen as normal ────────────────────────────────────
  return tabBar;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Nav />
    </AuthProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const TAB_HEIGHT     = Platform.OS === 'ios' ? 84 : 66;
const TAB_PADDING_BTM = Platform.OS === 'ios' ? 22 : 10;

const s = StyleSheet.create({
  // Splash screen
  splash: {
    flex: 1, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center', gap: 24,
  },
  splashLogo: { fontSize: 42, fontWeight: '800', color: C.accent, letterSpacing: -2 },

  // Tab icon
  tabItem:        { alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 4 },
  tabEmoji:       { fontSize: 20, opacity: 0.45 },
  tabEmojiFocused:{ opacity: 1 },
  tabLabel:       { fontSize: 8, letterSpacing: 1.2, fontWeight: '800', color: C.muted },
  tabLabelActive: { color: C.accent },

  // Tab bar (shared mobile + web)
  tabBar: {
    backgroundColor: C.card,
    borderTopColor: C.border,
    borderTopWidth: 1,
    height: TAB_HEIGHT,
    paddingBottom: TAB_PADDING_BTM,
    ...(isWeb && {
      // On web, the tab bar is already inside the frame container,
      // so we just ensure it stays at the bottom of that frame
      position: 'sticky',
      bottom: 0,
      zIndex: 100,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    }),
  },

  // Web: outer canvas (full viewport, dark background, centered)
  webRoot: {
    flex: 1,
    backgroundColor: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100dvh',
    position: 'relative',
  },

  // Decorative desktop background pattern
  webBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle at 20% 20%, rgba(200,255,0,0.04) 0%, transparent 50%), ' +
      'radial-gradient(circle at 80% 80%, rgba(72,101,255,0.04) 0%, transparent 50%)',
    pointerEvents: 'none',
  },

  // Phone frame — the centered container that holds the whole app on desktop
  webFrame: {
    width: '100%',
    maxWidth: 430,
    height: '100dvh',
    maxHeight: 900,
    backgroundColor: C.bg,
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
    // Subtle border + shadow for the "device frame" effect
    borderWidth: 1,
    borderColor: C.border,
    boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.8)',
    // On very narrow screens the frame fills the screen fully
    ...(isWeb && {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderLeftColor: C.borderLight,
      borderRightColor: C.borderLight,
    }),
  },
});
