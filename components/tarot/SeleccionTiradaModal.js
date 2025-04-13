import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SeleccionTiradaModal = ({
  visible,
  onClose,
  tiposTirada,
  currentTiradaIndex,
  setCurrentTiradaIndex,
  setTipoTiradaSeleccionado,
  verificarDisponibilidadTirada,
  onContinuar
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Tirada</Text>
          
          <View style={styles.tiradaCarouselContainer}>
            {tiposTirada && tiposTirada.length > 0 ? (
              <>
                <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tiradaCarouselScrollContent}
                  pagingEnabled
                  snapToInterval={width * 0.9}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  onMomentumScrollEnd={(event) => {
                    // Calcular qué tirada está centrada
                    const offsetX = event.nativeEvent.contentOffset.x;
                    const index = Math.round(offsetX / width);
                    if (index >= 0 && index < tiposTirada.length) {
                      setCurrentTiradaIndex(index);
                      setTipoTiradaSeleccionado(tiposTirada[index]);
                    }
                  }}
                >
                  {tiposTirada.map((tipoTirada, index) => (
                    <View key={index} style={styles.tiradaCardWrapper}>
                      <View style={styles.tiradaCardContent}>
                        <Text style={styles.tiradaCardTitle}>
                          {tipoTirada?.nombre || 'Cargando...'}
                        </Text>
                        <Text style={styles.tiradaCardCartas}>
                          {tipoTirada?.num_cartas || 0} cartas
                        </Text>
                        <Text style={styles.tiradaCardCosto}>
                          {tipoTirada?.costo_gemas || 0} gemas
                        </Text>
                        <Text style={styles.tiradaCardDesc}>
                          {tipoTirada?.descripcion || 'Sin descripción disponible'}
                        </Text>
                        
                        {tipoTirada && verificarDisponibilidadTirada(tipoTirada)?.puede ? (
                          <Text style={styles.tiradaCardDisponible}>
                            {verificarDisponibilidadTirada(tipoTirada)?.mensaje}
                          </Text>
                        ) : (
                          <Text style={styles.tiradaCardNoDisponible}>
                            {tipoTirada ? 
                              verificarDisponibilidadTirada(tipoTirada)?.mensaje :
                              'Cargando disponibilidad...'}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
            
                {/* Indicadores de paginación */}
                <View style={styles.paginationContainer}>
                  {tiposTirada.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        index === currentTiradaIndex && styles.paginationDotActive
                      ]}
                    />
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.loadingCarousel}>
                <ActivityIndicator size="small" color="#d6af36" />
                <Text style={styles.loadingCarouselText}>Cargando tiradas disponibles...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.modalButtonsContainer}>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelarButton}
                onPress={onClose}
              >
                <Text style={styles.cancelarButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmarButton,
                  (!tiposTirada || 
                   tiposTirada.length === 0 || 
                   currentTiradaIndex < 0 ||
                   !verificarDisponibilidadTirada(tiposTirada[currentTiradaIndex])?.puede) && 
                  styles.confirmarButtonDisabled
                ]}
                disabled={
                  !tiposTirada || 
                  tiposTirada.length === 0 || 
                  currentTiradaIndex < 0 ||
                  !verificarDisponibilidadTirada(tiposTirada[currentTiradaIndex])?.puede
                }
                onPress={onContinuar}
              >
                <Text style={styles.confirmarButtonText}>Seleccionar</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  modalContent: {
    width: '90%',
    backgroundColor: '#1f1f2f',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'TarotTitles',
  },
  tiradaCarouselContainer: {
    height: 320,
    width: '100%',
    marginBottom: 20,
  },
  tiradaCarouselScrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiradaCardWrapper: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  tiradaCardContent: {
    backgroundColor: 'rgba(214, 175, 54, 0.1)',
    borderRadius: 10,
    padding: 20,
    height: 260,
    width: '90%',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#d6af36',
    alignSelf: 'center',
  },
  tiradaCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'TarotTitles',
  },
  tiradaCardCartas: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 5,
    fontFamily: 'TarotBody',
  },
  tiradaCardCosto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 10,
    fontFamily: 'TarotBody',
  },
  tiradaCardDesc: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 15,
    flex: 1,
    fontFamily: 'TarotBody',
  },
  tiradaCardDisponible: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 5,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 5,
    fontFamily: 'TarotBody',
  },
  tiradaCardNoDisponible: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 5,
    fontFamily: 'TarotBody',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#d6af36',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingCarousel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCarouselText: {
    marginTop: 10,
    color: '#d6af36',
    fontSize: 16,
    fontFamily: 'TarotBody',
  },
  modalButtonsContainer: {
    width: '100%',
    marginTop: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelarButton: {
    backgroundColor: '#555',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TarotBody',
  },
  confirmarButton: {
    backgroundColor: '#d6af36',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  confirmarButtonText: {
    color: '#1f1f2f',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TarotBody',
  },
  confirmarButtonDisabled: {
    backgroundColor: '#9e9e9e',
    opacity: 0.7,
  },
});

export default SeleccionTiradaModal;
