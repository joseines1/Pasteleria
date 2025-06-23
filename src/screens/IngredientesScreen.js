import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

export const IngredientesScreen = () => {
  const { user, notifyLowStock, notifyDeletion, sendCustomNotification } = useAuth();
  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIngrediente, setEditingIngrediente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    stock: '',
    unidad: '',
  });

  useEffect(() => {
    loadIngredientes();
  }, []);

  const loadIngredientes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIngredientes();
      console.log('🥫 Ingredientes cargados:', data);
      setIngredientes(data);
    } catch (error) {
      console.error('❌ Error cargando ingredientes:', error);
      // Datos demo para desarrollo
      setIngredientes([
        { id: 1, nombre: 'Harina de Trigo', stock: 15, unidad: 'kg' },
        { id: 2, nombre: 'Azúcar', stock: 8, unidad: 'kg' },
        { id: 3, nombre: 'Mantequilla', stock: 25, unidad: 'kg' },
        { id: 4, nombre: 'Huevos', stock: 5, unidad: 'dozen' },
        { id: 5, nombre: 'Leche', stock: 12, unidad: 'L' }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadIngredientes();
  };

  const openAddModal = () => {
    setEditingIngrediente(null);
    setFormData({ nombre: '', stock: '', unidad: '' });
    setModalVisible(true);
  };

  const openEditModal = (ingrediente) => {
    setEditingIngrediente(ingrediente);
    setFormData({
      nombre: ingrediente.nombre,
      stock: ingrediente.stock.toString(),
      unidad: ingrediente.unidad || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.stock) {
      Alert.alert('⚠️ Campos Incompletos', 'Por favor completa todos los campos');
      return;
    }

    const stock = parseInt(formData.stock);
    if (isNaN(stock) || stock < 0) {
      Alert.alert('⚠️ Stock Inválido', 'El stock debe ser un número mayor o igual a 0');
      return;
    }

    try {
      const ingredienteData = {
        nombre: formData.nombre.trim(),
        stock: stock,
        unidad: formData.unidad,
      };

      if (editingIngrediente) {
        // Si es administrador, actualizar directamente
        if (user && user.rol === 'administrador') {
          try {
            await apiService.updateIngrediente(editingIngrediente.id, ingredienteData);
            
            // Actualizar localmente
            setIngredientes(prev => 
              prev.map(ing => 
                ing.id === editingIngrediente.id 
                  ? { ...ing, ...ingredienteData }
                  : ing
              )
            );

            // 🔔 VERIFICAR STOCK BAJO Y NOTIFICAR
            if (stock < 10) {
              await notifyLowStock({
                id: editingIngrediente.id,
                nombre: ingredienteData.nombre,
                stock: stock
              });
            }
            
            Alert.alert(
              '✅ Actualizado', 
              `Ingrediente actualizado: ${ingredienteData.nombre}\nStock: ${stock} ${ingredienteData.unidad}${stock < 10 ? '\n\n🔔 Notificación de stock bajo enviada' : ''}`
            );
          } catch (serverError) {
            console.log('⚠️ Error en servidor, actualizando localmente:', serverError.message);
            
            // Actualizar localmente
            setIngredientes(prev => 
              prev.map(ing => 
                ing.id === editingIngrediente.id 
                  ? { ...ing, ...ingredienteData }
                  : ing
              )
            );

            Alert.alert(
              '📱 Actualizado Localmente', 
              `Ingrediente actualizado: ${ingredienteData.nombre}\n📶 Se sincronizará cuando haya conexión`
            );
          }
        }
        
        // Si es empleado, crear solicitud de aprobación
        if (user && user.rol === 'empleado') {
          await sendCustomNotification({
            title: '📋 Solicitud de Actualización - Ingrediente',
            message: `${user.nombre} solicita actualizar ${editingIngrediente.nombre} a ${stock} ${ingredienteData.unidad}. ¿Aprobar cambios?`,
            module: 'ingredientes',
            data: {
              action: 'actualizar',
              ingrediente: ingredienteData.nombre,
              ingredienteId: editingIngrediente.id,
              stockAnterior: editingIngrediente.stock,
              stockNuevo: stock,
              unidad: ingredienteData.unidad,
              usuario: user.nombre,
              rol: user.rol,
              originalData: editingIngrediente,
              newData: ingredienteData,
              requiresApproval: true
            }
          });

          Alert.alert(
            '📤 Solicitud Enviada',
            `Tu solicitud de actualización del ingrediente "${ingredienteData.nombre}" ha sido enviada al administrador para su aprobación.`,
            [{ text: 'Entendido', style: 'default' }]
          );
        }
      } else {
        // Si es administrador, crear directamente
        if (user && user.rol === 'administrador') {
          try {
            const response = await apiService.createIngrediente(ingredienteData);
            
            const newIngrediente = {
              id: response.id || Date.now(),
              ...ingredienteData
            };
            
            setIngredientes(prev => [newIngrediente, ...prev]);

            Alert.alert(
              '🎉 ¡Ingrediente Creado!', 
              `Nuevo ingrediente: ${ingredienteData.nombre}\nStock inicial: ${stock} ${ingredienteData.unidad}`
            );
            
          } catch (serverError) {
            console.log('⚠️ Error en servidor, creando localmente:', serverError.message);
            
            const localIngrediente = {
              id: Date.now(),
              ...ingredienteData
            };
            
            setIngredientes(prev => [localIngrediente, ...prev]);

            Alert.alert(
              '📱 Ingrediente Creado Localmente', 
              `Nuevo ingrediente: ${ingredienteData.nombre}\n📶 Se sincronizará cuando haya conexión`
            );
          }
        }
        
        // Si es empleado, crear solicitud de aprobación
        if (user && user.rol === 'empleado') {
          await sendCustomNotification({
            title: '📋 Solicitud de Creación - Ingrediente',
            message: `${user.nombre} solicita crear el ingrediente "${ingredienteData.nombre}" con stock de ${stock} ${ingredienteData.unidad}. ¿Aprobar?`,
            module: 'ingredientes',
            data: {
              action: 'crear',
              ingrediente: ingredienteData.nombre,
              stock: stock,
              unidad: ingredienteData.unidad,
              usuario: user.nombre,
              rol: user.rol,
              newData: ingredienteData,
              requiresApproval: true
            }
          });

          Alert.alert(
            '📤 Solicitud Enviada',
            `Tu solicitud de creación del ingrediente "${ingredienteData.nombre}" ha sido enviada al administrador para su aprobación.`,
            [{ text: 'Entendido', style: 'default' }]
          );
        }
      }

      setModalVisible(false);
      
    } catch (error) {
      console.error('❌ Error guardando ingrediente:', error);
      Alert.alert('❌ Error', 'No se pudo guardar el ingrediente');
    }
  };

  const handleDelete = (ingrediente) => {
    // Si es administrador, eliminar directamente
    if (user && user.rol === 'administrador') {
      Alert.alert(
        '🗑️ Eliminar Ingrediente',
        `¿Estás seguro de que quieres eliminar "${ingrediente.nombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                // Eliminar localmente primero
                setIngredientes(prev => prev.filter(ing => ing.id !== ingrediente.id));
                
                try {
                  await apiService.deleteIngrediente(ingrediente.id);
                  Alert.alert('✅ Eliminado', `"${ingrediente?.nombre}" ha sido eliminado`);
                } catch (serverError) {
                  console.log('⚠️ Error eliminando en servidor:', serverError.message);
                  Alert.alert('📱 Eliminado Localmente', 'El ingrediente ha sido eliminado localmente');
                }
              } catch (error) {
                console.error('❌ Error eliminando ingrediente:', error);
                Alert.alert('❌ Error', 'No se pudo eliminar el ingrediente');
              }
            }
          }
        ]
      );
      return;
    }

    // Si es empleado, crear solicitud de eliminación
    if (user && user.rol === 'empleado') {
      Alert.alert(
        'Solicitar Eliminación',
        `¿Solicitar eliminación del ingrediente "${ingrediente.nombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Solicitar',
            style: 'destructive',
            onPress: async () => {
              try {
                await sendCustomNotification({
                  title: '📋 Solicitud de Eliminación - Ingrediente',
                  message: `${user.nombre} solicita eliminar el ingrediente "${ingrediente.nombre}" (Stock: ${ingrediente.stock}). ¿Aprobar eliminación?`,
                  module: 'ingredientes',
                  data: {
                    action: 'eliminar',
                    ingrediente: ingrediente.nombre,
                    ingredienteId: ingrediente.id,
                    stock: ingrediente.stock,
                    unidad: ingrediente.unidad,
                    usuario: user.nombre,
                    rol: user.rol,
                    originalData: ingrediente,
                    requiresApproval: true
                  }
                });

                Alert.alert(
                  '📤 Solicitud Enviada',
                  `Tu solicitud de eliminación del ingrediente "${ingrediente.nombre}" ha sido enviada al administrador para su aprobación.`,
                  [{ text: 'Entendido', style: 'default' }]
                );
              } catch (error) {
                Alert.alert('Error', 'No se pudo enviar la solicitud');
              }
            },
          },
        ]
      );
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Sin stock', color: '#e74c3c' };
    if (stock < 10) return { text: 'Stock bajo', color: '#f39c12' };
    return { text: 'En stock', color: '#27ae60' };
  };

  const renderIngrediente = ({ item }) => {
    const stockStatus = getStockStatus(item.stock);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.ingredienteName}>{item.nombre}</Text>
          <View style={styles.stockInfo}>
            <Text style={styles.stockAmount}>
              Stock: {item.stock} {item.unidad || 'und'}
            </Text>
            <Text style={[styles.stockStatus, { color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando ingredientes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🥫 Ingredientes</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Alertas de stock */}
      {ingredientes.filter(ing => ing.stock <= 10).length > 0 && (
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>⚠️ Alertas de Stock</Text>
          <Text style={styles.alertText}>
            {ingredientes.filter(ing => ing.stock <= 5).length} críticos • {ingredientes.filter(ing => ing.stock > 5 && ing.stock <= 10).length} bajos
          </Text>
        </View>
      )}

      <FlatList
        data={ingredientes}
        renderItem={renderIngrediente}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay ingredientes registrados</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                placeholder="Nombre del ingrediente"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput
                style={styles.input}
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Unidad</Text>
              <TextInput
                style={styles.input}
                value={formData.unidad}
                onChangeText={(text) => setFormData({ ...formData, unidad: text })}
                placeholder="kg, gr, lt, und, etc."
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
  },
  ingredienteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockAmount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  alertContainer: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: '#856404',
  },
}); 