import React from 'react';
import { Modal, View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import CartaTarot from './CartaTarot';

const DetalleCartaModal = ({ 
  cartaSeleccionada, 
  visible, 
  onClose, 
  obtenerImagenCarta 
}) => {
  if (!cartaSeleccionada) return null;
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalCartaContent}>
          <View style={styles.cartaHeader}>
            <Text style={styles.cartaTitulo}>{cartaSeleccionada?.carta_nombre || 'Carta'}</Text>
            {cartaSeleccionada?.invertida && (
              <Text style={styles.cartaInvertidaTexto}>(Invertida)</Text>
            )}
          </View>
          
          <Image
            source={obtenerImagenCarta(cartaSeleccionada?.carta_imagen)}
            style={[
              styles.cartaModalImagen,
              cartaSeleccionada?.invertida && styles.cartaModalInvertida
            ]}
            resizeMode="contain"
          />
          
          <ScrollView style={styles.cartaScrollDetalle}>
            <Text style={styles.significadoTitle}>
              Significado {cartaSeleccionada?.invertida ? 'Invertido' : 'Normal'}:
            </Text>
            <Text style={styles.significadoText}>{cartaSeleccionada?.significado || 'Sin información disponible'}</Text>
          </ScrollView>
          
          <TouchableOpacity
            style={styles.cerrarButton}
            onPress={onClose}
          >
            <Text style={styles.cerrarButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalCartaContent: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#1f1f2f',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  cartaHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  cartaTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d6af36',
    textAlign: 'center',
    fontFamily: 'TarotTitles',
  },
  cartaInvertidaTexto: {
    fontSize: 16,
    color: '#ff6b6b',
    marginTop: 5,
    fontFamily: 'TarotBody',
  },
  cartaModalImagen: {
    width: 150,
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
  },
  cartaModalInvertida: {
    transform: [{ rotate: '180deg' }],
  },
  cartaScrollDetalle: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 15,
  },
  significadoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 10,
    fontFamily: 'TarotTitles',
  },
  significadoText: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 22,
    fontFamily: 'TarotBody',
  },
  cerrarButton: {
    backgroundColor: '#d6af36',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  cerrarButtonText: {
    color: '#1f1f2f',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TarotBody',
  },
});

export default DetalleCartaModal;
