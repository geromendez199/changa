import { Colors } from './constants/theme';
import { CATEGORIES as NEW_CATEGORIES } from './constants/categories';

export const C = {
  bg: Colors.background,
  bgElevated: Colors.surface,
  card: Colors.surface,
  cardHover: Colors.surfaceElevated,
  surface: Colors.surface,
  border: Colors.border,
  borderSoft: Colors.border,
  borderLight: Colors.border,
  accent: Colors.primary,
  accentStrong: Colors.primaryLight,
  accentDim: 'rgba(108,71,255,0.16)',
  accentBorder: 'rgba(108,71,255,0.34)',
  red: Colors.error,
  green: Colors.success,
  blue: Colors.info,
  warning: Colors.warning,
  text: Colors.textPrimary,
  textSec: Colors.textSecondary,
  muted: Colors.textMuted,
  dim: Colors.textMuted,
  overlay: 'rgba(5, 8, 20, 0.82)',
  shadow: 'rgba(3, 9, 23, 0.55)',
};

export const CATEGORIES = NEW_CATEGORIES.map((c) => ({ ...c, icon: c.emoji }));

export * from './constants/theme';
export * from './constants/categories';
