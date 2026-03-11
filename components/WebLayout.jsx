/**
 * WebLayout — contenedor responsivo que centra el contenido en la web
 * y lo deja sin restricciones en móvil nativo.
 */
import { View, StyleSheet, Platform } from 'react-native';

export function WebContainer({ children, style, narrow }) {
  if (Platform.OS !== 'web') {
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }
  return (
    <View style={styles.webRoot}>
      <View style={[styles.webCenter, narrow && styles.webNarrow, style]}>
        {children}
      </View>
    </View>
  );
}

export function WebCard({ children, style }) {
  if (Platform.OS !== 'web') {
    return <View style={style}>{children}</View>;
  }
  return (
    <View style={[styles.webCardOuter, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  webCenter: {
    width: '100%',
    maxWidth: 540,
    flex: 1,
  },
  webNarrow: {
    maxWidth: 420,
  },
  webCardOuter: {
    borderRadius: 24,
    overflow: 'hidden',
  },
});
