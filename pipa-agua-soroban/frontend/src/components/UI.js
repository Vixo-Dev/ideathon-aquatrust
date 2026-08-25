import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

// Botón con gradiente
export const GradientButton = ({ 
  onPress, 
  title, 
  variant = 'primary',
  loading = false,
  disabled = false,
  style 
}) => {
  const gradients = {
    primary: theme.colors.gradientPrimary,
    secondary: theme.colors.gradientSecondary,
    accent: theme.colors.gradientAccent,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.buttonContainer, style]}
    >
      <LinearGradient
        colors={disabled ? ['#94A3B8', '#64748B'] : gradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Botón outline
export const OutlineButton = ({ onPress, title, style }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.outlineButton, style]}
  >
    <Text style={styles.outlineButtonText}>{title}</Text>
  </TouchableOpacity>
);

// Card con sombra
export const Card = ({ children, style }) => (
  <LinearGradient
    colors={['#FFFFFF', '#F8FAFC']}
    style={[styles.card, theme.shadows.md, style]}
  >
    {children}
  </LinearGradient>
);

// Badge de estado
export const StatusBadge = ({ status }) => {
  const statusColors = {
    Pending: { bg: '#FEF3C7', text: '#F59E0B', label: 'Pendiente' },
    Accepted: { bg: '#DBEAFE', text: '#3B82F6', label: 'Aceptado' },
    Certified: { bg: '#E0E7FF', text: '#6366F1', label: 'Certificado' },
    Delivered: { bg: '#DDD6FE', text: '#8B5CF6', label: 'Entregado' },
    Paid: { bg: '#D1FAE5', text: '#10B981', label: 'Pagado' },
    Disputed: { bg: '#FEE2E2', text: '#EF4444', label: 'En Disputa' },
    Refunded: { bg: '#F3F4F6', text: '#6B7280', label: 'Reembolsado' },
  };

  const config = statusColors[status] || statusColors.Pending;

  return (
    <LinearGradient
      colors={[config.bg, config.bg]}
      style={styles.badge}
    >
      <Text style={[styles.badgeText, { color: config.text }]}>
        {config.label}
      </Text>
    </LinearGradient>
  );
};

// Icono de agua animado
export const WaterIcon = ({ size = 60 }) => (
  <LinearGradient
    colors={theme.colors.gradientPrimary}
    style={[styles.waterIcon, { width: size, height: size }]}
  >
    <Text style={[styles.waterIconText, { fontSize: size * 0.6 }]}>💧</Text>
  </LinearGradient>
);

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
  },
  waterIcon: {
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterIconText: {
    fontSize: 36,
  },
});

export default {
  GradientButton,
  OutlineButton,
  Card,
  StatusBadge,
  WaterIcon,
};
