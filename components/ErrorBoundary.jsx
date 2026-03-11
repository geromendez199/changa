import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { C } from '../constants';

export class ErrorBoundary extends React.Component {
  state = { error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={s.container}>
        <Text style={s.emoji}>💥</Text>
        <Text style={s.title}>Algo salió mal</Text>
        <Text style={s.message}>{this.state.error.message || 'Error inesperado'}</Text>
        {__DEV__ && this.state.errorInfo && (
          <Text style={s.stack} numberOfLines={8}>
            {this.state.errorInfo.componentStack}
          </Text>
        )}
        <TouchableOpacity
          style={s.btn}
          onPress={this.handleReset}
          accessibilityRole="button"
          accessibilityLabel="Intentar de nuevo"
        >
          <Text style={s.btnText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
    padding: 32,
  },
  emoji:   { fontSize: 52, marginBottom: 20 },
  title:   { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 10, letterSpacing: -0.5 },
  message: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  stack: {
    fontSize: 10, color: C.muted, fontFamily: 'monospace',
    backgroundColor: C.dim, borderRadius: 8, padding: 12,
    marginVertical: 12, width: '100%',
  },
  btn: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32, marginTop: 16,
  },
  btnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
