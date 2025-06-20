import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { apiService } from '../services/apiService';

export const RecetasScreen = () => {
  const [recetas, setRecetas] = useState([]);
  const [postres, setPostres] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReceta, setEditingReceta] = useState(null);
  const [formData, setFormData] = useState({
    idPostre: '',
    idIngrediente: '',
    cantidad: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recetasData, postresData, ingredientesData] = await Promise.all([
        apiService.getRecetas(),
        apiService.getPostres(),
        apiService.getIngredientes(),
      ]);
      
      setRecetas(recetasData);
      setPostres(postresData);
      setIngredientes(ingredientesData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingReceta(null);
    setFormData({ idPostre: '', idIngrediente: '', cantidad: '' });
    setModalVisible(true);
  };

  const openEditModal = (receta) => {
    setEditingReceta(receta);
    setFormData({
      idPostre: receta.idPostre.toString(),
      idIngrediente: receta.idIngrediente.toString(),
      cantidad: receta.cantidad.toString(),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.idPostre || !formData.idIngrediente || !formData.cantidad) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    const cantidad = parseFloat(formData.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número mayor a 0');
      return;
    }

    try {
      const recetaData = {
        idPostre: parseInt(formData.idPostre),
        idIngrediente: parseInt(formData.idIngrediente),
        cantidad: cantidad,
      };

      if (editingReceta) {
        await apiService.updateReceta(editingReceta.id, recetaData);
      } else {
        await apiService.createReceta(recetaData);
      }

      setModalVisible(false);
      await loadData();
      Alert.alert(
        'Éxito',
        editingReceta ? 'Receta actualizada' : 'Receta creada'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la receta');
      console.error('Error saving receta:', error);
    }
  };

  const handleDelete = (receta) => {
    Alert.alert(
      'Confirmar',
      `¿Estás seguro de eliminar la receta "${receta.postreNombre} - ${receta.ingredienteNombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteReceta(receta.id);
              await loadData();
              Alert.alert('Éxito', 'Receta eliminada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la receta');
              console.error('Error deleting receta:', error);
            }
          },
        },
      ]
    );
  };

  const renderReceta = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.recetaTitle}>{item.postreNombre}</Text>
        <Text style={styles.ingrediente}>📦 {item.ingredienteNombre}</Text>
        <Text style={styles.cantidad}>Cantidad: {item.cantidad}</Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando recetas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Recetas</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recetas}
        renderItem={renderReceta}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay recetas registradas</Text>
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
              {editingReceta ? 'Editar Receta' : 'Nueva Receta'}
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
              <Text style={styles.label}>Postre *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.idPostre}
                  style={styles.picker}
                  onValueChange={(itemValue) =>
                    setFormData({ ...formData, idPostre: itemValue })
                  }
                >
                  <Picker.Item label="Seleccionar postre..." value="" />
                  {postres.map((postre) => (
                    <Picker.Item
                      key={postre.id}
                      label={postre.nombre}
                      value={postre.id.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ingrediente *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.idIngrediente}
                  style={styles.picker}
                  onValueChange={(itemValue) =>
                    setFormData({ ...formData, idIngrediente: itemValue })
                  }
                >
                  <Picker.Item label="Seleccionar ingrediente..." value="" />
                  {ingredientes.map((ingrediente) => (
                    <Picker.Item
                      key={ingrediente.id}
                      label={ingrediente.nombre}
                      value={ingrediente.id.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cantidad *</Text>
              <TextInput
                style={styles.input}
                value={formData.cantidad}
                onChangeText={(text) => setFormData({ ...formData, cantidad: text })}
                placeholder="Cantidad necesaria"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  recetaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  ingrediente: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  cantidad: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
}); 