import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
export default function Toast({ message, type = 'success', onHide }) { useEffect(() => { const t = setTimeout(() => onHide?.(), 3000); return () => clearTimeout(t); }, [onHide]); if (!message) return null; return <View style={[s.wrap, type === 'error' && { backgroundColor: '#FF4D4F' }]}><Text style={s.txt}>{message}</Text></View>; }
const s = StyleSheet.create({ wrap: { position: 'absolute', top: 60, left: 16, right: 16, backgroundColor: '#00C48C', borderRadius: 10, padding: 12, zIndex: 999 }, txt: { color: '#fff', fontWeight: '700', textAlign: 'center' } });
