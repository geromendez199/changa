import { Stack, Redirect, useSegments } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../hooks/useAuth';
SplashScreen.preventAutoHideAsync();
const client = new QueryClient();
function Guard() {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const inAuth = segments[0] === '(auth)';
  useEffect(() => { if (!loading) SplashScreen.hideAsync(); }, [loading]);
  if (loading) return null;
  if (!user && !inAuth) return <Redirect href='/(auth)/welcome' />;
  if (user && inAuth) return <Redirect href={profile?.role === 'changarin' ? '/(changarin)' : '/(cliente)'} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
export default function Root() { return <QueryClientProvider client={client}><AuthProvider><Guard /></AuthProvider></QueryClientProvider>; }
