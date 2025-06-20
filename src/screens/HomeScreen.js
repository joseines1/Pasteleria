import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPostres: 0,
    totalIngredientes: 0,
    stockBajo: 0,
    ventasDelDia: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Verificar conexión con API
      try {
        const healthResponse = await apiService.testConnection();
        setApiStatus(healthResponse ? 'connected' : 'offline');
      } catch (error) {
        setApiStatus('offline');
      }

      // Cargar estadísticas
      const [postres, ingredientes] = await Promise.all([
        apiService.getPostres(),
        apiService.getIngredientes(),
      ]);

      const stockBajo = ingredientes.filter(ing => ing.stock < 10).length;

      setStats({
        totalPostres: postres.length,
        totalIngredientes: ingredientes.length,
        stockBajo,
        ventasDelDia: Math.floor(Math.random() * 25) + 5, // Demo data
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const testApiConnection = async () => {
    try {
      const response = await apiService.testConnection();
      Alert.alert(
        'Conexión API',
        response.message || 'Conexión exitosa con el servidor'
      );
    } catch (error) {
      Alert.alert(
        'Error de Conexión',
        'No se pudo conectar con el servidor. Usando datos demo.'
      );
    }
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <Text style={styles.statIcon}>{icon}</Text>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.quickAction, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.nombre || user?.email?.split('@')[0]}!</Text>
          <Text style={styles.subGreeting}>Bienvenido a tu pastelería</Text>
        </View>
        <View style={[styles.statusBadge, apiStatus === 'connected' ? styles.connected : styles.offline]}>
          <Text style={styles.statusText}>
            {apiStatus === 'connected' ? '🟢 Online' : '🔴 Offline'}
          </Text>
        </View>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>📊 Estadísticas de Hoy</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Postres"
            value={stats.totalPostres}
            icon="🧁"
            color="#e74c3c"
            onPress={() => navigation.navigate('Postres')}
          />
          <StatCard
            title="Ingredientes"
            value={stats.totalIngredientes}
            icon="🥫"
            color="#f39c12"
            onPress={() => navigation.navigate('Ingredientes')}
          />
          <StatCard
            title="Stock Bajo"
            value={stats.stockBajo}
            icon="⚠️"
            color="#e67e22"
            onPress={() => navigation.navigate('Ingredientes')}
          />
          <StatCard
            title="Ventas Hoy"
            value={stats.ventasDelDia}
            icon="💰"
            color="#27ae60"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
        
        <View style={styles.actionsGrid}>
          <QuickAction
            title="Nuevo Postre"
            icon="➕"
            color="#3498db"
            onPress={() => navigation.navigate('Postres')}
          />
          <QuickAction
            title="Inventario"
            icon="📦"
            color="#9b59b6"
            onPress={() => navigation.navigate('Ingredientes')}
          />
          <QuickAction
            title="Test API"
            icon="🔗"
            color="#2ecc71"
            onPress={testApiConnection}
          />
          <QuickAction
            title="Perfil"
            icon="👤"
            color="#34495e"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>
      </View>

      {/* Recent Activity (Demo) */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>📈 Actividad Reciente</Text>
        
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>🧁</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Nuevo postre agregado</Text>
              <Text style={styles.activityTime}>Hace 2 horas</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📦</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Stock de harina actualizado</Text>
              <Text style={styles.activityTime}>Hace 4 horas</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>⚠️</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Stock bajo: Chocolate</Text>
              <Text style={styles.activityTime}>Ayer</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subGreeting: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  connected: {
    backgroundColor: '#d5f4e6',
  },
  offline: {
    backgroundColor: '#ffeaa7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  quickActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activityContainer: {
    padding: 20,
    paddingTop: 0,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  activityTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
}); 