import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, Alert, ActivityIndicator, RefreshControl, Switch, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Btn, Field, EmptyState } from '../components/UI';
import { C, CATEGORIES } from '../constants';

const isWeb = Platform.OS === 'web';

// ─── Service Form Modal ───────────────────────────────────────
function ServiceForm({ initial, onSave, onClose }) {
  const { user } = useAuth();
  const editing = !!initial?.id;
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    category: initial?.category || 'otros',
    price: initial?.price?.toString() || '',
    zone: initial?.zone || '',
    active: initial?.active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const f = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  const save = async () => {
    if (!form.title.trim()) return Alert.alert('Error', 'El título es obligatorio.');
    if (!form.price || isNaN(parseInt(form.price))) return Alert.alert('Error', 'Ingresá un precio válido.');
    setLoading(true);
    const payload = { title: form.title.trim(), description: form.description.trim(), category: form.category, price: parseInt(form.price), zone: form.zone.trim(), active: form.active, worker_id: user.id };
    const { error } = editing
      ? await supabase.from('services').update(payload).eq('id', initial.id)
      : await supabase.from('services').insert(payload);
    setLoading(false);
    if (error) return Alert.alert('Error al guardar', error.message);
    onSave();
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>{editing ? 'Editar servicio' : 'Nuevo servicio'}</Text>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Field label="Título *"            value={form.title}       onChangeText={f('title')}       placeholder="Ej: Plomería urgente"    autoCapitalize="sentences" />
            <Field label="Descripción"         value={form.description} onChangeText={f('description')} placeholder="¿Qué incluye?"          multiline autoCapitalize="sentences" />
            <Field label="Precio por hora ($ARS) *" value={form.price}  onChangeText={f('price')}       placeholder="3500"                   keyboard="numeric" />
            <Field label="Zona de cobertura"   value={form.zone}        onChangeText={f('zone')}        placeholder="Rafaela centro / Todo Rafaela" autoCapitalize="sentences" />

            <Text style={s.fieldLabel}>CATEGORÍA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
                {CATEGORIES.map(cat => {
                  const active = form.category === cat.id;
                  return (
                    <TouchableOpacity key={cat.id} activeOpacity={0.8}
                      style={[s.catChip, active && { backgroundColor: cat.color + '22', borderColor: cat.color }]}
                      onPress={() => setForm(p => ({ ...p, category: cat.id }))}>
                      <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                      <Text style={[s.catText, active && { color: cat.color }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={s.switchRow}>
              <Text style={s.switchLabel}>Visible para clientes</Text>
              <Switch value={form.active} onValueChange={f('active')} trackColor={{ false: C.dim, true: C.accent }} thumbColor="#fff" />
            </View>

            <Btn label={editing ? 'Guardar cambios' : 'Publicar servicio'} onPress={save} loading={loading} />
            <Btn label="Cancelar" onPress={onClose} ghost />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────
export default function PrestadorScreen() {
  const { user } = useAuth();
  const [services,   setServices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('services').select('*').eq('worker_id', user.id).order('created_at', { ascending: false });
    setServices(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const del = (id) => Alert.alert('Eliminar', '¿Eliminar este servicio? No se puede deshacer.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: async () => {
      await supabase.from('services').delete().eq('id', id);
      load();
    }},
  ]);

  const toggle = async (sv) => {
    await supabase.from('services').update({ active: !sv.active }).eq('id', sv.id);
    load();
  };

  const active = services.filter(s => s.active).length;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.accent} />}>
        <View style={s.webCenter}>
        <View style={s.header}>
          <Text style={s.logo}>changa.</Text>
          <View style={s.pill}><Text style={s.pillText}>⚡ Prestador</Text></View>
        </View>

        <View style={s.body}>
          <Text style={s.pageTitle}>Mis servicios</Text>
          <Text style={s.pageSub}>{active} activo{active !== 1 ? 's' : ''} de {services.length} publicado{services.length !== 1 ? 's' : ''}</Text>

          <Btn label="+ Publicar nuevo servicio" onPress={() => { setEditing(null); setShowForm(true); }} style={{ marginBottom: 24 }} />

          {loading
            ? <ActivityIndicator color={C.accent} />
            : services.length === 0
              ? <EmptyState emoji="🛠️" title="Todavía no publicaste servicios" sub="Tocá el botón de arriba para empezar." />
              : services.map(sv => {
                  const cat = CATEGORIES.find(c => c.id === sv.category);
                  return (
                    <View key={sv.id} style={[s.card, !sv.active && { opacity: 0.55 }]}>
                      <View style={s.cardTop}>
                        <Text style={s.catLabel}>{cat?.icon} {cat?.label}</Text>
                        <View style={[s.dot, { backgroundColor: sv.active ? C.accent : C.dim }]} />
                      </View>
                      <Text style={s.svcTitle}>{sv.title}</Text>
                      <Text style={s.svcPrice}>${sv.price?.toLocaleString()}/hora</Text>
                      {sv.zone && <Text style={s.svcMeta}>📍 {sv.zone}</Text>}

                      <View style={s.actions}>
                        <TouchableOpacity style={s.actionBtn} onPress={() => { setEditing(sv); setShowForm(true); }}>
                          <Text style={s.actionBtnText}>✏️ Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.actionBtn} onPress={() => toggle(sv)}>
                          <Text style={s.actionBtnText}>{sv.active ? '⏸ Pausar' : '▶ Activar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.actionBtn, s.actionBtnDel]} onPress={() => del(sv.id)}>
                          <Text style={s.delText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
          }
        </View>
        </View>
      </ScrollView>

      {showForm && (
        <ServiceForm initial={editing} onSave={() => { setShowForm(false); load(); }} onClose={() => setShowForm(false)} />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  webCenter: {
    ...(isWeb && { maxWidth: 680, width: '100%', alignSelf: 'center' }),
  },
  header: { paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: 20, fontWeight: '700', color: C.accent, letterSpacing: -0.5 },
  pill: { backgroundColor: '#C8FF0015', borderWidth: 1, borderColor: '#C8FF0033', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontSize: 11, color: C.accent, letterSpacing: 1 },
  body: { padding: 20 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: C.text, letterSpacing: -0.5, marginBottom: 4 },
  pageSub: { fontSize: 13, color: C.muted, marginBottom: 20 },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catLabel: { fontSize: 12, color: C.muted },
  dot: { width: 10, height: 10, borderRadius: 5 },
  svcTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  svcPrice: { fontSize: 14, color: C.accent, fontWeight: '700' },
  svcMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: { flex: 1, backgroundColor: C.dim, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  actionBtnText: { color: C.text, fontSize: 12, fontWeight: '600' },
  actionBtnDel: { flex: 0, paddingHorizontal: 14, backgroundColor: '#FF4D4D22', borderWidth: 1, borderColor: '#FF4D4D44' },
  delText: { fontSize: 14 },
  overlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '92%', borderWidth: 1, borderColor: C.border, borderBottomWidth: 0 },
  handle: { width: 40, height: 4, backgroundColor: C.dim, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 20 },
  fieldLabel: { fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 8, fontWeight: '700' },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  catText: { fontSize: 12, color: C.muted, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, marginBottom: 12 },
  switchLabel: { fontSize: 14, color: C.muted },
});
