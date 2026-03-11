import { useEffect, useState } from 'react';
import { Tabs, useRouter, useSegments, Link, usePathname } from 'expo-router';
import {
  View, Text, StyleSheet, ActivityIndicator, Platform,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { C } from '../constants';

const isWeb = Platform.OS === 'web';

const NAV_ITEMS = [
  { href: '/',           emoji: '🏠', label: 'Inicio',    icon: 'home' },
  { href: '/pedidos',    emoji: '📋', label: 'Pedidos',   icon: 'pedidos' },
  { href: '/prestador',  emoji: '🛠️', label: 'Prestador', icon: 'prestador' },
  { href: '/perfil',     emoji: '👤', label: 'Perfil',    icon: 'perfil' },
];

// ─── Web Sidebar ──────────────────────────────────────────────────────────────
function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <View style={sw.sidebar}>
      {/* Logo */}
      <View style={sw.logoWrap}>
        <View style={sw.logoIcon}><Text style={{ fontSize: 20 }}>⚡</Text></View>
        <View>
          <Text style={sw.logoText}>changa.</Text>
          <Text style={sw.logoSub}>Rafaela · Santa Fe</Text>
        </View>
      </View>

      {/* Nav links */}
      <View style={sw.navLinks}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} asChild>
              <TouchableOpacity style={[sw.navItem, active && sw.navItemActive]} activeOpacity={0.8}>
                <Text style={[sw.navEmoji, active && sw.navEmojiActive]}>{item.emoji}</Text>
                <Text style={[sw.navLabel, active && sw.navLabelActive]}>{item.label}</Text>
                {active && <View style={sw.navDot} />}
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* User info + signout */}
      {user && (
        <View style={sw.userSection}>
          <View style={sw.userInfo}>
            <View style={sw.userAva}>
              <Text style={{ fontSize: 14, color: C.accent, fontWeight: '800' }}>
                {user.email?.[0]?.toUpperCase()}
              </Text>
            </View>
            <Text style={sw.userEmail} numberOfLines={1}>{user.email}</Text>
          </View>
          <TouchableOpacity style={sw.signoutBtn} onPress={signOut}>
            <Text style={sw.signoutText}>Salir →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Tab icon for mobile ──────────────────────────────────────────────────────
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={sm.tabItem}>
      <Text style={[sm.emoji, focused && sm.emojiFocused]}>{emoji}</Text>
      <Text style={[sm.label, focused && sm.labelActive]}>{label}</Text>
    </View>
  );
}

// ─── Main Nav Shell ───────────────────────────────────────────────────────────
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
      <View style={sm.splash}>
        <Text style={sm.splashLogo}>changa.</Text>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  // Web layout with sidebar
  if (isWeb && user) {
    return (
      <View style={sw.root}>
        <Sidebar />
        <View style={sw.main}>
          <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
            <Tabs.Screen name="index"     />
            <Tabs.Screen name="pedidos"   />
            <Tabs.Screen name="prestador" />
            <Tabs.Screen name="perfil"    />
            <Tabs.Screen name="(auth)"    options={{ href: null }} />
          </Tabs>
        </View>
      </View>
    );
  }

  // Auth pages (no sidebar)
  if (isWeb && !user) {
    return (
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
        <Tabs.Screen name="index"     />
        <Tabs.Screen name="pedidos"   />
        <Tabs.Screen name="prestador" />
        <Tabs.Screen name="perfil"    />
        <Tabs.Screen name="(auth)"    options={{ href: null }} />
      </Tabs>
    );
  }

  // Mobile: classic bottom tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: sm.tabBar,
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

// ─── Web Styles ───────────────────────────────────────────────────────────────
const sw = StyleSheet.create({
  root:    { flex: 1, flexDirection: 'row', backgroundColor: C.bg, minHeight: '100vh' },
  sidebar: {
    width: 240,
    backgroundColor: C.card,
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingVertical: 28,
    paddingHorizontal: 18,
    flexDirection: 'column',
  },

  // Logo
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 36, paddingLeft: 4 },
  logoIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 22, fontWeight: '800', color: C.accent, letterSpacing: -1 },
  logoSub:  { fontSize: 10, color: C.muted, letterSpacing: 1, marginTop: 1 },

  // Nav
  navLinks:  { gap: 4 },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14,
    position: 'relative',
  },
  navItemActive: { backgroundColor: C.accentDim },
  navEmoji:      { fontSize: 18 },
  navEmojiActive:{ },
  navLabel:      { fontSize: 14, fontWeight: '600', color: C.muted },
  navLabelActive:{ color: C.text, fontWeight: '700' },
  navDot: {
    position: 'absolute', right: 14, top: '50%',
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.accent,
  },

  // Main content
  main: { flex: 1, overflow: 'auto' },

  // User section
  userSection: { gap: 10, paddingTop: 20, borderTopWidth: 1, borderTopColor: C.border },
  userInfo:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userAva: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  userEmail: { fontSize: 12, color: C.textSec, flex: 1 },
  signoutBtn: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: C.dim },
  signoutText: { fontSize: 13, color: C.muted, fontWeight: '600', textAlign: 'center' },
});

// ─── Mobile Styles ────────────────────────────────────────────────────────────
const sm = StyleSheet.create({
  splash:     { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 24 },
  splashLogo: { fontSize: 42, fontWeight: '800', color: C.accent, letterSpacing: -2 },
  tabBar: {
    backgroundColor: C.card,
    borderTopColor: C.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 66,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
  },
  tabItem:     { alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 4 },
  emoji:       { fontSize: 20, opacity: 0.5 },
  emojiFocused:{ opacity: 1 },
  label:       { fontSize: 8, letterSpacing: 1, fontWeight: '800', color: C.muted },
  labelActive: { color: C.accent },
});
