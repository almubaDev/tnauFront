import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CartaTarot from './CartaTarot';

const TiradaClaridad = ({ cartas, onCartaPress }) => {
  if (!cartas || cartas.length < 6) return null;

  // Orden: 0: Centro, 1: Obstáculo, 2: Arriba (consciente), 
  // 3: Abajo (inconsciente), 4: Izquierda (pasado), 5: Derecha (futuro)
  return (
    <View style={styles.tiradaClaridadContainer}>
      <View style={styles.tiradaClaridadRow}>
        <View style={styles.espacioVacio} />
        <View style={styles.cartaConLabel}>
          <Text style={styles.posicionLabel}>Consciente</Text>
          <CartaTarot carta={cartas[2]} onPress={() => onCartaPress(cartas[2])} />
        </View>
        <View style={styles.espacioVacio} />
      </View>
      
      <View style={styles.tiradaClaridadRow}>
        <View style={styles.cartaConLabel}>
          <Text style={styles.posicionLabel}>Pasado</Text>
          <CartaTarot carta={cartas[4]} onPress={() => onCartaPress(cartas[4])} />
        </View>
        
        <View style={styles.cartaConLabel}>
          <Text style={styles.posicionLabel}>Situación</Text>
          <CartaTarot carta={cartas[0]} onPress={() => onCartaPress(cartas[0])} />
        </View>
        
        <View style={styles.cartaConLabel}>
          <Text style={styles.posicionLabel}>Futuro</Text>
          <CartaTarot carta={cartas[5]} onPress={() => onCartaPress(cartas[5])} />
        </View>
      </View>
      
      <View style={styles.tiradaClaridadRow}>
        <View style={styles.espacioVacio} />
        <View style={styles.cartaConLabel}>
          <Text style={styles.posicionLabel}>Inconsciente</Text>
          <CartaTarot carta={cartas[3]} onPress={() => onCartaPress(cartas[3])} />
        </View>
        <View style={styles.espacioVacio} />
      </View>

      <View style={styles.tiradaClaridadRow}>
        <View style={styles.espacioVacio} />
        <View style={styles.cartaConLabel}>
          <Text style={styles.posicionLabel}>Obstáculo</Text>
          <CartaTarot carta={cartas[1]} onPress={() => onCartaPress(cartas[1])} />
        </View>
        <View style={styles.espacioVacio} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tiradaClaridadContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  tiradaClaridadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    width: '100%',
  },
  cartaConLabel: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  espacioVacio: {
    width: 70,
    height: 20,
  },
  posicionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d6af36',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'TarotTitles',
  },
});

export default TiradaClaridad;
