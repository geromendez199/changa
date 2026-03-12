import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { pickAndUploadAvatar } from '../../lib/storage';
import { useState } from 'react';
export default function Perfil() { const { user, signOut } = useAuth(); const { profile, save } = useProfile(user?.id); const [edit, setEdit] = useState(false); const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  if (!profile) return null;
  return <SafeAreaView style={{ flex: 1, padding: 16 }}><View style={{ alignItems: 'center', gap: 10 }}><Avatar size='xl' uri={profile.avatar_url} name={profile.full_name} /><Button title='Cambiar foto' variant='ghost' onPress={async () => { const url = await pickAndUploadAvatar(user.id); if (url) await save({ avatar_url: url }); }} /></View>{edit ? <><Input label='Nombre' value={name || profile.full_name} onChangeText={setName} /><Input label='Teléfono' value={phone || profile.phone || ''} onChangeText={setPhone} /><Button title='Guardar' onPress={async () => { await save({ full_name: name || profile.full_name, phone: phone || profile.phone }); setEdit(false); }} /></> : <><Text style={{ fontSize: 22, fontWeight: '700' }}>{profile.full_name}</Text><Text>{profile.phone || 'Sin teléfono'}</Text><Button title='Editar perfil' variant='outline' onPress={() => setEdit(true)} /></>}<Button title='Cerrar sesión' variant='danger' onPress={() => Alert.alert('Confirmar', '¿Seguro que querés salir?', [{ text: 'Cancelar' }, { text: 'Salir', onPress: () => signOut() }])} /></SafeAreaView>; }
