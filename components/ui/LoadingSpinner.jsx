import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
export default function LoadingSpinner({ text, fullScreen }) { return <View style={[s.w, fullScreen && { flex: 1 }]}><ActivityIndicator size='large' color={Colors.primary} />{text ? <Text style={s.t}>{text}</Text> : null}</View>; }
const s = StyleSheet.create({ w: { alignItems: 'center', justifyContent: 'center', padding: 20 }, t: { marginTop: 8, color: Colors.textSecondary } });
