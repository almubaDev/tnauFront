import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import CartaTarot from './CartaTarot';

const TiradaProfunda = ({ cartas, onCartaPress }) => {
  if (!cartas || cartas.length === 0) return null;
  
  // Nombres de posiciones para tirada profunda
  const posiciones = [
    "Esencia del Problema",
    "Pensamiento Personal", "Pensamiento Externo", "Pensamiento Ideal",
    "Emociones Personales", "Emociones Externas", "Emociones Ideales",
    "Situación Material Personal", "Situación Material Externa", "Situación Material Ideal",
    "Resultado Final"
  ];
  
  return (
    <ScrollView contentContainerStyle={styles.tiradaProfundaContainer}>
      {cartas.map((carta, index) => (
        <View key={index} style={styles.cartaConLabelProfunda}>
          <Text style={styles.posicionLabel}>{posiciones[index] || `Posición ${index + 1}`}</Text>
          <CartaTarot
            carta={carta}
            onPress={() => onCartaPress(carta)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tiradaProfundaContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  cartaConLabelProfunda: {
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',
  },
  posicionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'TarotTitles',
  },
});

export default TiradaProfunda;
