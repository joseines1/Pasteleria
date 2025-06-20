import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, color = '#34495e' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Text style={[styles.menuIconText, { color }]}>{icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.nombre || user?.email?.split('@')[0] || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email || 'email@ejemplo.com'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.rol || 'Admin'}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        
        <MenuItem
          icon="👤"
          title="Información Personal"
          subtitle="Editar perfil y datos"
          onPress={() => Alert.alert('Info', 'Función próximamente')}
        />
        
        <MenuItem
          icon="🔐"
          title="Cambiar Contraseña"
          subtitle="Actualizar credenciales"
          onPress={() => Alert.alert('Info', 'Función próximamente')}
        />
        
        <MenuItem
          icon="🔔"
          title="Notificaciones"
          subtitle="Configurar alertas"
          onPress={() => Alert.alert('Info', 'Función próximamente')}
        />
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Aplicación</Text>
        
        <MenuItem
          icon="📊"
          title="Estadísticas"
          subtitle="Ver reportes detallados"
          onPress={() => Alert.alert('Info', 'Función próximamente')}
        />
        
        <MenuItem
          icon="📱"
          title="Configuración"
          subtitle="Preferencias de la app"
          onPress={() => Alert.alert('Info', 'Función próximamente')}
        />
        
        <MenuItem
          icon="❓"
          title="Ayuda y Soporte"
          subtitle="Centro de ayuda"
          onPress={() => Alert.alert('Info', 'Función próximamente')}
        />
        
        <MenuItem
          icon="ℹ️"
          title="Acerca de"
          subtitle="Versión 1.0.0"
          onPress={() => Alert.alert('Pastelería App', 'Versión 1.0.0\nDesarrollado para gestión de pastelerías')}
        />
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>Pastelería Admin App</Text>
        <Text style={styles.appInfoText}>Versión 1.0.0</Text>
        <Text style={styles.appInfoText}>© 2024</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ecf0f1',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIconText: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 20,
    color: '#bdc3c7',
  },
  logoutContainer: {
    margin: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 10,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  appInfoText: {
    fontSize: 12,
    color: '#bdc3c7',
    marginBottom: 2,
  },
}); 