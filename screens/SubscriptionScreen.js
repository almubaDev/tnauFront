import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator
} from 'react-native';
import { fetchWithAuth } from '../apiHelpers';

export default function SubscriptionScreen() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const cargarPerfil = async () => {
    try {
      const response = await fetchWithAuth('/api/perfil/');
      if (response.ok) {
        const data = await response.json();
        setPerfil(data);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const manejarSuscripcion = async (accion) => {
    setActualizando(true);
    try {
      const url = accion === 'activar'
        ? '/api/activar-suscripcion/'
        : '/api/cancelar-suscripcion/';
      const response = await fetchWithAuth(url, { method: 'POST' });
      if (response.ok) {
        cargarPerfil();
      }
    } catch (error) {
      console.error('Error actualizando suscripción:', error);
    } finally {
      setActualizando(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/img/backgrounds/promo_suscripcion.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#d6af36" />
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>Suscripción Mensual</Text>
            <Text style={styles.text}>Tiradas básicas y de claridad limitadas a 15 al mes.</Text>
            <Text style={styles.text}>Tiradas profundas: 2 al mes.</Text>
            <Text style={styles.text}>Acceso exclusivo a pociones mágicas.</Text>
            <Text style={styles.text}>Interpretación extendida vía Motor Náutica.</Text>
            <Text style={styles.price}>$4.99 / mes</Text>

            {perfil?.tiene_suscripcion ? (
              <TouchableOpacity
                style={styles.cancelar}
                onPress={() => manejarSuscripcion('cancelar')}
                disabled={actualizando}
              >
                <Text style={styles.cancelarText}>Cancelar suscripción</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.boton}
                onPress={() => manejarSuscripcion('activar')}
                disabled={actualizando}
              >
                <Text style={styles.botonText}>Suscribirme</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#d6af36',
  },
  title: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    fontFamily: 'TarotBody',
    color: '#fff',
    fontSize: 14,
    marginBottom: 6,
  },
  price: {
    fontFamily: 'TarotTitles',
    color: '#d6af36',
    fontSize: 18,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: '#d6af36',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  botonText: {
    fontFamily: 'TarotTitles',
    fontSize: 16,
    color: '#000',
  },
  cancelar: {
    backgroundColor: '#8B0000',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  cancelarText: {
    fontFamily: 'TarotTitles',
    fontSize: 16,
    color: '#fff',
  },
});
