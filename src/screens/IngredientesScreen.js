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
} from 'react-native';
import { apiService } from '../services/apiService';

export const IngredientesScreen = () => {
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
      setIngredientes(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los ingredientes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIngredientes();
    setRefreshing(false);
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
      Alert.alert('Error', 'Nombre y stock son obligatorios');
      return;
    }

    try {
      const ingredienteData = {
        nombre: formData.nombre,
        stock: parseInt(formData.stock),
        unidad: formData.unidad,
      };

      if (editingIngrediente) {
        await apiService.updateIngrediente(editingIngrediente.id, ingredienteData);
      } else {
        await apiService.createIngrediente(ingredienteData);
      }

      setModalVisible(false);
      await loadIngredientes();
      Alert.alert(
        'Éxito',
        editingIngrediente ? 'Ingrediente actualizado' : 'Ingrediente creado'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el ingrediente');
    }
  };

  const handleDelete = (ingrediente) => {
    Alert.alert(
      'Confirmar',
      `¿Estás seguro de eliminar "${ingrediente.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteIngrediente(ingrediente.id);
              await loadIngredientes();
              Alert.alert('Éxito', 'Ingrediente eliminado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el ingrediente');
            }
          },
        },
      ]
    );
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando ingredientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🥫 Ingredientes</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

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
    </View>
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
}); 