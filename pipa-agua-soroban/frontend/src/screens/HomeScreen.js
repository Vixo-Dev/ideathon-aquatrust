import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Card, StatusBadge, WaterIcon, GradientButton } from '../components/UI';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalLiters: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    // Mock data - conectar con el backend real
    const mockOrders = [
      {
        id: 1,
        liters: 5000,
        amount: 10000000,
        status: 'Accepted',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        liters: 10000,
        amount: 20000000,
        status: 'Certified',
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        liters: 3000,
        amount: 6000000,
        status: 'Paid',
        createdAt: new Date().toISOString(),
      },
    ];
    setOrders(mockOrders);
  };

  const fetchStats = async () => {
    setStats({
      totalOrders: 42,
      activeOrders: 5,
      totalLiters: 210000,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    await fetchStats();
    setRefreshing(false);
  };

  const formatXLM = (stroops) => {
    return (stroops / 10000000).toFixed(2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header con gradiente */}
      <LinearGradient
        colors={theme.colors.gradientHero}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hola 👋</Text>
            <Text style={styles.headerTitle}>Panel de Control</Text>
          </View>
          <WaterIcon size={50} />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Órdenes Totales</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeOrders}</Text>
            <Text style={styles.statLabel}>Activas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{(stats.totalLiters / 1000).toFixed(0)}k</Text>
            <Text style={styles.statLabel}>Litros</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => alert('Nueva Orden - Próximamente')}
            >
              <LinearGradient
                colors={theme.colors.gradientPrimary}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>🚰</Text>
                <Text style={styles.actionText}>Nueva{'\n'}Orden</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => alert('Escanear QR - Próximamente')}
            >
              <LinearGradient
                colors={theme.colors.gradientSecondary}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📷</Text>
                <Text style={styles.actionText}>Escanear{'\n'}QR</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => alert('Historial - Próximamente')}
            >
              <LinearGradient
                colors={theme.colors.gradientAccent}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionText}>Historial</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => alert('Perfil - Próximamente')}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>👤</Text>
                <Text style={styles.actionText}>Perfil</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Órdenes Recientes</Text>
            <TouchableOpacity onPress={() => alert('Ver todas')}>
              <Text style={styles.seeAll}>Ver todas →</Text>
            </TouchableOpacity>
          </View>

          {orders.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No hay órdenes aún</Text>
              <Text style={styles.emptySubtext}>
                Crea tu primera orden para comenzar
              </Text>
            </Card>
          ) : (
            orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => alert(`Ver orden #${order.id}`)}
              >
                <Card>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderTitle}>Orden #{order.id}</Text>
                      <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                    </View>
                    <StatusBadge status={order.status} />
                  </View>

                  <View style={styles.orderDetails}>
                    <View style={styles.orderDetail}>
                      <Text style={styles.orderDetailLabel}>Litros</Text>
                      <Text style={styles.orderDetailValue}>
                        {order.liters.toLocaleString()} L
                      </Text>
                    </View>
                    <View style={styles.orderDetail}>
                      <Text style={styles.orderDetailLabel}>Monto</Text>
                      <Text style={styles.orderDetailValue}>
                        {formatXLM(order.amount)} XLM
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => alert('Nueva Orden - Próximamente')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={theme.colors.gradientPrimary}
          style={styles.fabGradient}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.typography.base,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: theme.typography['3xl'],
    fontWeight: theme.typography.bold,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: theme.typography['2xl'],
    fontWeight: theme.typography.bold,
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.medium,
  },
  content: {
    flex: 1,
    marginTop: -theme.spacing.md,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  seeAll: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.semibold,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  actionGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    textAlign: 'center',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  orderDetail: {
    flex: 1,
  },
  orderDetailLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  orderDetailValue: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: theme.typography.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.xl,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: theme.typography.bold,
  },
});
