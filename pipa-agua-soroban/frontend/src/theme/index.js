// Sistema de diseño profesional para la app
export const colors = {
  // Paleta principal - Azul agua
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  primaryLight: '#38BDF8',
  
  // Secundario - Verde confianza
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',
  
  // Acentos
  accent: '#8B5CF6',
  accentLight: '#A78BFA',
  
  // Neutrales
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  
  // Texto
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  
  // Estados
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Overlay
  overlay: 'rgba(15, 23, 42, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.9)',
  
  // Gradientes
  gradientPrimary: ['#0EA5E9', '#0284C7'],
  gradientSecondary: ['#10B981', '#059669'],
  gradientAccent: ['#8B5CF6', '#6366F1'],
  gradientHero: ['#0EA5E9', '#8B5CF6'],
  gradientSuccess: ['#10B981', '#059669'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  // Tamaños
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  
  // Pesos
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export default theme;
