import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, Alert, ActivityIndicator,
  RefreshControl, Switch, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Btn, Field, EmptyState, StatCard } from '../components/UI';
import { C, CATEGORIES } from '../constants';

const isWeb = Platform.OS === 'web';

// ─── Service Form Modal ───────────────────────────────────────────────────────
function ServiceForm({ initial, onSave, onClose }) {
  const { user } = useAuth();
  const editing = !!initial?.id;
  const [form, setForm] = useState({
    title:       initial?.title       || '',
    description: initial?.description || '',
    category:    initial?.category    || 'otros',
    price:       initial?.price?.toString() || '',
    zone:        initial?.zone        || '',
    active:      initial?.active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const f = key => val => setForm(p => ({ ...p, [key]: val }));

  const save = async () => {
    if (!form.title.trim()) return Alert.alert('Error', 'El título es obligatorio.');
    if (!form.price || isNaN(parseInt(form.price))) return Alert.alert('Error', 'Ingresá un precio válido.');
    setLoading(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      price: parseInt(form.price),
      zone: form.zone.trim(),
      active: form.active,
      worker_id: user.id,
    };
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
          <Text style={s.sheetTitle}>{editing ? 'Editar servicio' : '+ Nuevo servicio'}</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Field label="Título *"               value={form.title}       onChangeText={f('title')}       placeholder="Ej: Plomería urgente"      autoCapitalize="sentences" />
            <Field label="Descripción"            value={form.description} onChangeText={f('description')} placeholder="¿Qué incluye el servicio?" multiline autoCapitalize="sentences" />
            <Field label="Precio por hora ($ARS) *" value={form.price}    onChangeText={f('price')}       placeholder="3500"                      keyboard="numeric" />
            <Field label="Zona de cobertura"      value={form.zone}        onChangeText={f('zone')}        placeholder="Rafaela centro"            autoCapitalize="sentences" />

            <Text style={s.fieldLabel}>CATEGORÍA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
                {CATEGORIES.map(cat => {
                  const active = form.category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.8}
                      style={[s.catChip, active && { backgroundColor: cat.color + '20', borderColor: cat.color }]}
                      onPress={() => setForm(p => ({ ...p, category: cat.id }))}
                    >
                      <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                      <Text style={[s.catText, active && { color: cat.color }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={s.switchRow}>
              <View>
                <Text style={s.switchLabel}>Visible para clientes</Text>
                <Text style={s.switchSubLabel}>{form.active ? 'Activo — aparece en búsquedas' : 'Pausado'}</Text>
              </View>
              <Switch
                value={form.active}
                onValueChange={f('active')}
                trackColor={{ false: C.dim, true: C.accent }}
                thumbColor="#fff"
              />
            </View>

            <Btn label={editing ? 'Guardar cambios ✓' : 'Publicar servicio 🚀'} onPress={save} loading={loading} />
            <Btn label="Cancelar" onPress={onClose} ghost />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PrestadorScreen() {
  const { user } = useAuth();
  const [services,   setServices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [error,      setError]      = useState(null);

  const load = useCallback(async () => {
    // Guard: user might not be set yet
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setServices(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const del = id => Alert.alert('Eliminar', '¿Eliminar este servicio? No se puede deshacer.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: async () => {
      await supabase.from('services').delete().eq('id', id);
      load();
    }},
  ]);

  const toggle = async sv => {
    await supabase.from('services').update({ active: !sv.active }).eq('id', sv.id);
    load();
  };

  const activeCount = services.filter(s => s.active).length;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.accent} />
        }
      >
        <View style={s.page}>

          {/* Header */}
          {!isWeb && <View style={s.mobileHeader}><Text style={s.logo}>changa.</Text></View>}

          <View style={s.header}>
            <View>
              <View style={s.headerPill}>
                <Text style={s.headerPillText}>⚡ Modo Prestador</Text>
              </View>
              <Text style={s.pageTitle}>Mis servicios</Text>
              <Text style={s.pageSub}>Gestioná lo que ofrecés a la comunidad</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <StatCard label="Publicados" value={services.length} color={C.accent} />
            <StatCard label="Activos"    value={activeCount}     color={C.green}  />
            <StatCard label="Pausados"   value={services.length - activeCount} color={C.muted} />
          </View>

          {/* CTA Button */}
          <View style={s.ctaWrap}>
            <Btn
              label="+ Publicar nuevo servicio"
              onPress={() => { setEditing(null); setShowForm(true); }}
            />
          </View>

          {/* Error */}
          {error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>⚠️ {error}</Text>
              <Btn label="Reintentar" onPress={load} small ghost style={{ marginTop: 10 }} />
            </View>
          )}

          {/* List */}
          {loading ? (
            <ActivityIndicator color={C.accent} style={{ marginTop: 60 }} />
          ) : services.length === 0 ? (
            <EmptyState
              emoji="🛠️"
              title="Todavía no publicaste servicios"
              sub="Tocá el botón de arriba y empezá a recibir clientes."
            />
          ) : (
            <View style={s.grid}>
              {services.map(sv => {
                const cat = CATEGORIES.find(c => c.id === sv.category);
                return (
                  <View key={sv.id} style={[s.card, !sv.active && s.cardPaused]}>
                    {/* Color strip */}
                    <View style={[s.cardStrip, { backgroundColor: cat?.color || C.accent }]} />

                    <View style={s.cardBody}>
                      <View style={s.cardTop}>
                        <View style={s.catRow}>
                          <Text style={s.catEmoji}>{cat?.icon}</Text>
                          <Text style={s.catLabel}>{cat?.label}</Text>
                        </View>
                        <View style={[s.activeDot, { backgroundColor: sv.active ? C.green : C.muted }]} />
                      </View>

                      <Text style={s.svcTitle}>{sv.title}</Text>
                      {sv.description ? <Text style={s.svcDesc} numberOfLines={2}>{sv.description}</Text> : null}

                      <View style={s.svcMeta}>
                        <Text style={s.svcPrice}>${sv.price?.toLocaleString()}/hora</Text>
                        {sv.zone ? <Text style={s.svcZone}>📍 {sv.zone}</Text> : null}
                      </View>

                      <View style={s.actions}>
                        <TouchableOpacity
                          style={[s.actionBtn]}
                          onPress={() => { setEditing(sv); setShowForm(true); }}
                          activeOpacity={0.8}
                        >
                          <Text style={s.actionBtnText}>✏️ Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[s.actionBtn, sv.active && s.actionBtnPause]}
                          onPress={() => toggle(sv)}
                          activeOpacity={0.8}
                        >
                          <Text style={s.actionBtnText}>{sv.active ? '⏸ Pausar' : '▶ Activar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[s.actionBtn, s.actionBtnDel]}
                          onPress={() => del(sv.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={s.delText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {showForm && (
        <ServiceForm
          initial={editing}
          onSave={() => { setShowForm(false); load(); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  page: {
    paddingTop: isWeb ? 40 : 0,
    maxWidth: isWeb ? 900 : undefined,
    width: '100%',
    alignSelf: isWeb ? 'center' : undefined,
    paddingHorizontal: isWeb ? 40 : 0,
  },

  mobileHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  logo:         { fontSize: 22, fontWeight: '800', color: C.accent, letterSpacing: -1 },

  header:      { paddingHorizontal: isWeb ? 0 : 20, paddingTop: isWeb ? 0 : 12, marginBottom: 24 },
  headerPill:  {
    alignSelf: 'flex-start',
    backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12,
  },
  headerPillText: { fontSize: 11, color: C.accent, fontWeight: '700', letterSpacing: 0.5 },
  pageTitle: { fontSize: isWeb ? 36 : 28, fontWeight: '800', color: C.text, letterSpacing: -1, marginBottom: 4 },
  pageSub:   { fontSize: 14, color: C.muted },

  statsRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: isWeb ? 0 : 20,
    marginBottom: 20,
  },

  ctaWrap: { paddingHorizontal: isWeb ? 0 : 20, marginBottom: 24 },

  errorBox: { marginHorizontal: isWeb ? 0 : 20, padding: 16, backgroundColor: C.red + '15', borderWidth: 1, borderColor: C.red + '40', borderRadius: 16 },
  errorText: { fontSize: 14, color: C.red },

  grid: {
    paddingHorizontal: isWeb ? 0 : 20,
    ...(isWeb && { flexDirection: 'row', flexWrap: 'wrap', gap: 14 }),
  },

  card: {
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 20, marginBottom: isWeb ? 0 : 12, overflow: 'hidden',
    ...(isWeb && { width: 'calc(50% - 7px)' }),
  },
  cardPaused: { opacity: 0.6 },
  cardStrip: { height: 4, width: '100%' },
  cardBody:  { padding: 18 },

  cardTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catEmoji: { fontSize: 16 },
  catLabel: { fontSize: 12, color: C.muted, fontWeight: '600' },
  activeDot:{ width: 10, height: 10, borderRadius: 5 },

  svcTitle: { fontSize: 17, fontWeight: '800', color: C.text, marginBottom: 6, letterSpacing: -0.3 },
  svcDesc:  { fontSize: 13, color: C.muted, lineHeight: 18, marginBottom: 10 },
  svcMeta:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  svcPrice: { fontSize: 16, color: C.accent, fontWeight: '800' },
  svcZone:  { fontSize: 12, color: C.muted },

  actions:    { flexDirection: 'row', gap: 8 },
  actionBtn:  { flex: 1, backgroundColor: C.dim, borderRadius: 11, paddingVertical: 10, alignItems: 'center' },
  actionBtnPause: { backgroundColor: C.accentDim },
  actionBtnDel: { flex: 0, paddingHorizontal: 14, backgroundColor: C.red + '18', borderWidth: 1, borderColor: C.red + '35' },
  actionBtnText:{ color: C.textSec, fontSize: 12, fontWeight: '700' },
  delText:      { fontSize: 14 },

  // Form Modal
  overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 48,
    borderWidth: 1, borderColor: C.border, borderBottomWidth: 0,
    maxHeight: '92%',
    ...(isWeb && { maxWidth: 560, width: '100%', alignSelf: 'center', borderRadius: 28, marginBottom: 40 }),
  },
  handle:       { width: 40, height: 4, backgroundColor: C.dim, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  sheetTitle:   { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 24, letterSpacing: -0.5 },
  fieldLabel:   { fontSize: 11, color: C.muted, letterSpacing: 1.5, marginBottom: 10, fontWeight: '700' },
  catChip:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  catText:      { fontSize: 12, color: C.muted, fontWeight: '600' },
  switchRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, marginBottom: 16, borderTopWidth: 1, borderTopColor: C.border },
  switchLabel:  { fontSize: 15, color: C.text, fontWeight: '600' },
  switchSubLabel:{ fontSize: 12, color: C.muted, marginTop: 2 },
});
