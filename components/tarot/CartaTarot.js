import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

const CartaTarot = ({ carta, onPress }) => {
  // Verificar que carta existe antes de acceder a sus propiedades
  if (!carta) return null;
  
  const imageSource = obtenerImagenCarta(carta?.carta_imagen);
  
  return (
    <TouchableOpacity style={styles.cartaTarot} onPress={onPress}>
      <Image
        source={imageSource}
        style={[
          styles.imagenCarta,
          carta?.invertida && styles.cartaInvertida
        ]}
        resizeMode="contain"
      />
      <Text style={styles.nombreCarta}>{carta?.carta_nombre || 'Carta'}</Text>
    </TouchableOpacity>
  );
};

// Función para obtener la imagen de la carta según su nombre
const obtenerImagenCarta = (nombreImagen) => {
  // Verificar que nombreImagen existe
  if (!nombreImagen) return require('../../assets/img/cards/el_loco.jpg');
  
  // Mapear nombres de imágenes a archivos locales
  const imageMapping = {
    'el_loco.jpg': require('../../assets/img/cards/el_loco.jpg'),
    'el_mago.jpg': require('../../assets/img/cards/el_mago.jpg'),
    'la_sacerdotisa.jpg': require('../../assets/img/cards/la_sacerdotisa.jpg'),
    'la_emperatriz.jpg': require('../../assets/img/cards/la_emperatriz.jpg'),
    'el_emperador.jpg': require('../../assets/img/cards/el_emperador.jpg'),
    'el_sumo_sacerdote.jpg': require('../../assets/img/cards/el_sumo_sacerdote.jpg'),
    'los_enamorados.jpg': require('../../assets/img/cards/los_enamorados.jpg'),
    'el_carro.jpg': require('../../assets/img/cards/el_carro.jpg'),
    'la_fuerza.jpg': require('../../assets/img/cards/la_fuerza.jpg'),
    'el_ermitaño.jpg': require('../../assets/img/cards/el_ermitaño.jpg'),
    'la_rueda_de_la_fortuna.jpg': require('../../assets/img/cards/la_rueda_de_la_fortuna.jpg'),
    'la_justicia.jpg': require('../../assets/img/cards/la_justicia.jpg'),
    'el_colgado.jpg': require('../../assets/img/cards/el_colgado.jpg'),
    'la_muerte.jpg': require('../../assets/img/cards/la_muerte.jpg'),
    'la_templanza.jpg': require('../../assets/img/cards/la_templanza.jpg'),
    'el_diablo.jpg': require('../../assets/img/cards/el_diablo.jpg'),
    'la_torre.jpg': require('../../assets/img/cards/la_torre.jpg'),
    'la_estrella.jpg': require('../../assets/img/cards/la_estrella.jpg'),
    'la_luna.jpg': require('../../assets/img/cards/la_luna.jpg'),
    'el_sol.jpg': require('../../assets/img/cards/el_sol.jpg'),
    'el_juicio.jpg': require('../../assets/img/cards/el_juicio.jpg'),
    'el_mundo.jpg': require('../../assets/img/cards/el_mundo.jpg'),
  };
  
  return imageMapping[nombreImagen] || require('../../assets/img/cards/el_loco.jpg'); // Imagen por defecto
};

const styles = StyleSheet.create({
  cartaTarot: {
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 10,
  },
  imagenCarta: {
    width: 120,
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d6af36',
  },
  cartaInvertida: {
    transform: [{ rotate: '180deg' }],
  },
  nombreCarta: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#d6af36',
    fontSize: 14,
    fontFamily: 'TarotTitles',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: '100%',
    position: 'absolute',
    bottom: 10,
  },
});

export default CartaTarot;
