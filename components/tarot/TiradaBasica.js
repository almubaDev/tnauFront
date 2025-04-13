import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CartaTarot from './CartaTarot';

const TiradaBasica = ({ cartas, onCartaPress }) => {
  if (!cartas || cartas.length === 0) return null;
  
  return (
    <View style={styles.tiradaBasicaContainer}>
      {cartas.map((carta, index) => {
        const posicionLabel = ['Pasado', 'Presente', 'Futuro'][index];
        return (
          <View key={index} style={styles.cartaConLabel}>
            <Text style={styles.posicionLabel}>{posicionLabel}</Text>
            <CartaTarot
              carta={carta}
              onPress={() => onCartaPress(carta)}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tiradaBasicaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  cartaConLabel: {
    alignItems: 'center',
    marginHorizontal: 5,
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

export default TiradaBasica;
