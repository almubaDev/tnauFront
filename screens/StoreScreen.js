import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity
} from 'react-native';
import { fetchWithAuth } from '../apiHelpers';
import VideoBackground from '../components/VideoBackground';
import CustomAlert from '../components/CustomAlert';

export default function StoreScreen({ navigation }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para alertas personalizadas
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: []
  });

  // Función para mostrar alertas personalizadas
  const showAlert = (title, message, buttons = [{ text: 'Aceptar', onPress: () => setAlertVisible(false) }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const cargarPerfil = async () => {
    try {
      const response = await fetchWithAuth('/api/perfil/');
      if (response.ok) {
        const data = await response.json();
        setPerfil(data);
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const comprarGemas = async (cantidad) => {
    try {
      const response = await fetchWithAuth('/api/comprar-gemas/', {
        method: 'POST',
        body: JSON.stringify({ cantidad }),
      });

      if (response.ok) {
        const data = await response.json();
        showAlert('Compra exitosa', `Has comprado ${cantidad} gemas.`);
        setPerfil(prevPerfil => ({
          ...prevPerfil,
          gemas: data.gemas
        }));
      } else {
        showAlert('Error', 'No se pudo completar la compra.');
      }
    } catch (error) {
      console.error('Error al comprar gemas:', error);
      showAlert('Error', 'Ha ocurrido un problema al procesar tu compra.');
    }
  };

  return (
    <VideoBackground source={require('../assets/video/fondo_tienda.mp4')}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Tienda de Gemas</Text>

        {perfil && (
          <Text style={styles.subtitulo}>Gemas disponibles: {perfil.gemas}</Text>
        )}

        <View style={styles.tarjeta}>
          <Image
            source={require('../assets/img/gem_packs/pack_10.png')}
            style={styles.imagen}
          />
          <View style={styles.info}>
            <Text style={styles.cantidad}>10 gemas</Text>
            <Text style={styles.precio}>$0.99</Text>
            <TouchableOpacity onPress={() => comprarGemas(10)} style={styles.boton}>
              <Text style={styles.botonTexto}>Comprar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tarjeta}>
          <Image
            source={require('../assets/img/gem_packs/pack_50.png')}
            style={styles.imagen}
          />
          <View style={styles.info}>
            <Text style={styles.cantidad}>50 gemas</Text>
            <Text style={styles.precio}>$3.49</Text>
            <TouchableOpacity onPress={() => comprarGemas(50)} style={styles.boton}>
              <Text style={styles.botonTexto}>Comprar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tarjeta}>
          <Image
            source={require('../assets/img/gem_packs/pack_100.png')}
            style={styles.imagen}
          />
          <View style={styles.info}>
            <Text style={styles.cantidad}>100 gemas</Text>
            <Text style={styles.precio}>$5.99</Text>
            <TouchableOpacity onPress={() => comprarGemas(100)} style={styles.boton}>
              <Text style={styles.botonTexto}>Comprar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('SubscriptionScreen')}
          style={styles.suscripcionBoton}
        >
          <Image
            source={require('../assets/img/icons/subscription_icon.png')}
            style={styles.icono}
          />
          <Text style={styles.suscripcionTexto}>
            {perfil?.tiene_suscripcion
              ? 'Gestionar suscripción'
              : 'Suscribirme por $4.99'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Alerta Personalizada */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </VideoBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  titulo: {
    fontFamily: 'TarotTitles',
    fontSize: 26,
    color: '#d6af36',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitulo: {
    fontFamily: 'TarotBody',
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d6af36',
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  imagen: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  cantidad: {
    fontFamily: 'TarotTitles',
    fontSize: 18,
    color: '#d6af36',
  },
  precio: {
    fontFamily: 'TarotBody',
    color: '#fff',
    marginBottom: 8,
  },
  boton: {
    backgroundColor: '#d6af36',
    paddingVertical: 6,
    borderRadius: 6,
  },
  botonTexto: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'TarotTitles',
    fontSize: 14,
  },
  suscripcionBoton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderColor: '#d6af36',
    borderWidth: 2,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  suscripcionTexto: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 16,
    marginLeft: 10,
  },
  icono: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
});