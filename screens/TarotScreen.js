import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Video } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { fetchWithAuth } from '../apiHelpers';
import CustomAlert from '../components/CustomAlert';

// Importar componentes modularizados
import CartaTarot from '../components/tarot/CartaTarot';
import TiradaBasica from '../components/tarot/TiradaBasica';
import TiradaClaridad from '../components/tarot/TiradaClaridad';
import TiradaProfunda from '../components/tarot/TiradaProfunda';
import DetalleCartaModal from '../components/tarot/DetalleCartaModal';
import InterpretacionModal from '../components/tarot/InterpretacionModal';
import SeleccionTiradaModal from '../components/tarot/SeleccionTiradaModal';
import PreguntaModal from '../components/tarot/PreguntaModal';
import HistorialModal from '../components/tarot/HistorialModal';

// Obtenemos dimensiones de la pantalla para layouts responsivos
const { width, height } = Dimensions.get('window');

export default function TarotScreen({ navigation }) {
  // Estados principales
  const [perfil, setPerfil] = useState(null);
  const [tiposTirada, setTiposTirada] = useState([]);
  const [tipoTiradaSeleccionado, setTipoTiradaSeleccionado] = useState(null);
  const [currentTiradaIndex, setCurrentTiradaIndex] = useState(0);
  const [pregunta, setPregunta] = useState('');
  const [tiradaActual, setTiradaActual] = useState(null);
  const [historialTiradas, setHistorialTiradas] = useState([]);
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  
  // Estados modales
  const [modalSeleccionVisible, setModalSeleccionVisible] = useState(false);
  const [modalPreguntaVisible, setModalPreguntaVisible] = useState(false);
  const [modalCartaVisible, setModalCartaVisible] = useState(false);
  const [modalInterpretacionVisible, setModalInterpretacionVisible] = useState(false);
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false);
  
  // Estados de carga y errores
  const [loading, setLoading] = useState(true);
  const [loadingTirada, setLoadingTirada] = useState(false);
  
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

  // Cargar datos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      cargarDatosIniciales();
      return () => {
        // Cleanup si es necesario
      };
    }, [])
  );

  // Cargar datos iniciales: perfil, tipos de tirada e historial
  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      // Cargar perfil de usuario
      const perfilResponse = await fetchWithAuth('/api/perfil/');
      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        setPerfil(perfilData);
      }

      // Cargar tipos de tirada disponibles
      const tiposResponse = await fetchWithAuth('/api/listar-tipos-tirada/');
      if (tiposResponse.ok) {
        const tiposData = await tiposResponse.json();
        setTiposTirada(tiposData || []);
      }

      // Cargar historial de tiradas
      const historialResponse = await fetchWithAuth('/api/historial-tiradas/');
      if (historialResponse.ok) {
        const historialData = await historialResponse.json();
        setHistorialTiradas(historialData || []);
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      showAlert('Error', 'No se pudieron cargar los datos. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario puede realizar una tirada
  const verificarDisponibilidadTirada = (tipoTirada) => {
    if (!perfil) return { puede: false, mensaje: 'Error al cargar tu perfil' };
    if (!tipoTirada) return { puede: false, mensaje: 'Selecciona un tipo de tirada' };

    // Verificar límites según tipo
    let tiradasUsadas = 0;
    let limitePermitido = 0;

    switch (tipoTirada.tipo) {
      case 'basica':
        tiradasUsadas = perfil.tiradas_basicas_usadas;
        limitePermitido = 10; // Límite mensual
        break;
      case 'claridad':
        tiradasUsadas = perfil.tiradas_claridad_usadas;
        limitePermitido = 10; // Límite mensual
        break;
      case 'profunda':
        tiradasUsadas = perfil.tiradas_profundas_usadas;
        limitePermitido = 10; // Límite mensual
        break;
      default:
        return { puede: false, mensaje: 'Tipo de tirada no reconocido' };
    }

    // Si tiene suscripción y no ha excedido límites
    if (perfil.tiene_suscripcion && tiradasUsadas < limitePermitido) {
      return { 
        puede: true, 
        mensaje: 'Tirada disponible con tu suscripción', 
        costoGemas: 0 
      };
    }

    // Verificar si tiene suficientes gemas
    if (perfil.gemas >= tipoTirada.costo_gemas) {
      return { 
        puede: true, 
        mensaje: `Costo: ${tipoTirada.costo_gemas} gemas`, 
        costoGemas: tipoTirada.costo_gemas 
      };
    }

    return { 
      puede: false, 
      mensaje: `No tienes suficientes gemas (Necesitas: ${tipoTirada.costo_gemas}, Tienes: ${perfil.gemas})` 
    };
  };

  // Función para iniciar el proceso de tirada
  const iniciarSeleccionTirada = () => {
    setPregunta('');
    setCurrentTiradaIndex(0);
    
    // Seleccionar el primer tipo de tirada si hay disponibles
    if (tiposTirada && tiposTirada.length > 0) {
      setTipoTiradaSeleccionado(tiposTirada[0]);
    } else {
      setTipoTiradaSeleccionado(null);
    }
    
    setModalSeleccionVisible(true);
  };

  // Manejar continuar después de seleccionar tirada
  const handleContinuarSeleccion = () => {
    setModalSeleccionVisible(false);
    setModalPreguntaVisible(true);
  };

  // Manejar volver de pregunta a selección
  const handleVolverASeleccion = () => {
    setModalPreguntaVisible(false);
    setModalSeleccionVisible(true);
  };

  // Función para realizar la tirada
  const realizarTirada = async () => {
    if (!tipoTiradaSeleccionado) {
      showAlert('Error', 'Selecciona un tipo de tirada primero');
      return;
    }

    if (!pregunta.trim()) {
      showAlert('Error', 'Ingresa una pregunta para la tirada');
      return;
    }

    const disponibilidad = verificarDisponibilidadTirada(tipoTiradaSeleccionado);
    if (!disponibilidad?.puede) {
      showAlert('No disponible', disponibilidad?.mensaje || 'Tirada no disponible');
      return;
    }

    setModalPreguntaVisible(false);
    setLoadingTirada(true);

    try {
      // Realizar la tirada a través de la API
      const response = await fetchWithAuth('/api/realizar-tirada/', {
        method: 'POST',
        body: JSON.stringify({
          tipo_tirada: tipoTiradaSeleccionado.id,
          pregunta: pregunta.trim(),
        }),
      });

      if (response.ok) {
        const resultado = await response.json();
        
        // Actualizar el perfil para reflejar gemas y tiradas usadas
        await cargarDatosIniciales(); 
        
        // Guardar la tirada actual
        setTiradaActual(resultado.tirada);
        
        // Mostrar mensaje de éxito
        showAlert('Tirada realizada', resultado.mensaje);
      } else {
        // Manejar errores
        const errorData = await response.json();
        showAlert('Error', errorData.error || 'No se pudo realizar la tirada');
      }
    } catch (error) {
      console.error('Error realizando tirada:', error);
      showAlert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoadingTirada(false);
    }
  };
  
  // Función para ver el detalle de una carta
  const verDetalleCarta = (carta) => {
    if (!carta) return;
    setCartaSeleccionada(carta);
    setModalCartaVisible(true);
  };

  // Función para cargar tirada desde historial
  const cargarTiradaDesdeHistorial = (tirada) => {
    if (!tirada) return;
    setTiradaActual(tirada);
    setModalHistorialVisible(false);
  };

  // Función para ver la interpretación completa
  const verInterpretacionCompleta = () => {
    setModalInterpretacionVisible(true);
  };

  // Obtener imágenes de cartas 
  const obtenerImagenCarta = (nombreImagen) => {
    // Verificar que nombreImagen existe
    if (!nombreImagen) return require('../assets/img/cards/el_loco.jpg');
    
    // Mapear nombres de imágenes a archivos locales
    const imageMapping = {
      'el_loco.jpg': require('../assets/img/cards/el_loco.jpg'),
      'el_mago.jpg': require('../assets/img/cards/el_mago.jpg'),
      'la_sacerdotisa.jpg': require('../assets/img/cards/la_sacerdotisa.jpg'),
      'la_emperatriz.jpg': require('../assets/img/cards/la_emperatriz.jpg'),
      'el_emperador.jpg': require('../assets/img/cards/el_emperador.jpg'),
      'el_sumo_sacerdote.jpg': require('../assets/img/cards/el_sumo_sacerdote.jpg'),
      'los_enamorados.jpg': require('../assets/img/cards/los_enamorados.jpg'),
      'el_carro.jpg': require('../assets/img/cards/el_carro.jpg'),
      'la_fuerza.jpg': require('../assets/img/cards/la_fuerza.jpg'),
      'el_ermitaño.jpg': require('../assets/img/cards/el_ermitaño.jpg'),
      'la_rueda_de_la_fortuna.jpg': require('../assets/img/cards/la_rueda_de_la_fortuna.jpg'),
      'la_justicia.jpg': require('../assets/img/cards/la_justicia.jpg'),
      'el_colgado.jpg': require('../assets/img/cards/el_colgado.jpg'),
      'la_muerte.jpg': require('../assets/img/cards/la_muerte.jpg'),
      'la_templanza.jpg': require('../assets/img/cards/la_templanza.jpg'),
      'el_diablo.jpg': require('../assets/img/cards/el_diablo.jpg'),
      'la_torre.jpg': require('../assets/img/cards/la_torre.jpg'),
      'la_estrella.jpg': require('../assets/img/cards/la_estrella.jpg'),
      'la_luna.jpg': require('../assets/img/cards/la_luna.jpg'),
      'el_sol.jpg': require('../assets/img/cards/el_sol.jpg'),
      'el_juicio.jpg': require('../assets/img/cards/el_juicio.jpg'),
      'el_mundo.jpg': require('../assets/img/cards/el_mundo.jpg'),
    };
    
    return imageMapping[nombreImagen] || require('../assets/img/cards/el_loco.jpg'); // Imagen por defecto
  };

  // Renderizar layout de tirada según tipo
  const renderizarLayoutTirada = () => {
    if (!tiradaActual) return null;

    const tipoTirada = tiradaActual?.tipo_tirada_nombre?.toLowerCase() || '';
    
    if (tipoTirada.includes('básica')) {
      return (
        <TiradaBasica 
          cartas={tiradaActual?.cartas || []} 
          onCartaPress={verDetalleCarta} 
        />
      );
    } else if (tipoTirada.includes('claridad')) {
      return (
        <TiradaClaridad 
          cartas={tiradaActual?.cartas || []} 
          onCartaPress={verDetalleCarta} 
        />
      );
    } else {
      return (
        <TiradaProfunda 
          cartas={tiradaActual?.cartas || []} 
          onCartaPress={verDetalleCarta} 
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/video/fondo_tarot.mp4')}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.overlay}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d6af36" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : loadingTirada ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d6af36" />
            <Text style={styles.loadingText}>Realizando tirada...</Text>
          </View>
        ) : tiradaActual ? (
          <View style={styles.tiradaContainer}>
            <Text style={styles.preguntaTirada}>"{tiradaActual?.pregunta || ''}"</Text>
            
            <ScrollView contentContainerStyle={styles.scrollTirada}>
              {renderizarLayoutTirada()}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.botonInterpretacion}
              onPress={verInterpretacionCompleta}
            >
              <Text style={styles.botonInterpretacionTexto}>Ver Interpretación Completa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.botonNuevaTirada}
              onPress={iniciarSeleccionTirada}
            >
              <Text style={styles.textoNuevaTirada}>Nueva Tirada</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.centeredContainer}>
            <View style={styles.iconoTiradaContainer}>
              <View style={styles.iconoBackground}>
                <Image
                  source={require('../assets/img/icons/tirada_icono.png')}
                  style={styles.iconoTiradaCentral}
                  resizeMode="contain"
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.botonNuevaTirada}
              onPress={iniciarSeleccionTirada}
            >
              <Text style={styles.textoNuevaTirada}>Realizar Tirada</Text>
            </TouchableOpacity>
            
            {historialTiradas && historialTiradas.length > 0 && (
              <TouchableOpacity
                style={styles.botonHistorial}
                onPress={() => setModalHistorialVisible(true)}
              >
                <Text style={styles.textoHistorial}>Ver Historial</Text>
              </TouchableOpacity>
            )}
            
            {tiposTirada.length === 0 && !loading && (
              <Text style={styles.noDataText}>No hay tiradas disponibles</Text>
            )}
          </View>
        )}
      </View>

      {/* Renderizar todos los componentes modales */}
      <SeleccionTiradaModal
        visible={modalSeleccionVisible}
        onClose={() => setModalSeleccionVisible(false)}
        tiposTirada={tiposTirada}
        currentTiradaIndex={currentTiradaIndex}
        setCurrentTiradaIndex={setCurrentTiradaIndex}
        setTipoTiradaSeleccionado={setTipoTiradaSeleccionado}
        verificarDisponibilidadTirada={verificarDisponibilidadTirada}
        onContinuar={handleContinuarSeleccion}
      />

      <PreguntaModal
        visible={modalPreguntaVisible}
        onClose={() => setModalPreguntaVisible(false)}
        onBack={handleVolverASeleccion}
        onConfirm={realizarTirada}
        pregunta={pregunta}
        setPregunta={setPregunta}
        tipoTiradaSeleccionado={tipoTiradaSeleccionado}
      />

      <DetalleCartaModal
        cartaSeleccionada={cartaSeleccionada}
        visible={modalCartaVisible}
        onClose={() => setModalCartaVisible(false)}
        obtenerImagenCarta={obtenerImagenCarta}
      />

      <InterpretacionModal
        tirada={tiradaActual}
        visible={modalInterpretacionVisible}
        onClose={() => setModalInterpretacionVisible(false)}
      />

      <HistorialModal
        visible={modalHistorialVisible}
        onClose={() => setModalHistorialVisible(false)}
        historialTiradas={historialTiradas}
        onSeleccionarTirada={cargarTiradaDesdeHistorial}
      />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#d6af36',
    fontSize: 18,
    marginTop: 15,
    fontWeight: 'bold',
    fontFamily: 'TarotBody',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconoTiradaContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  iconoBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d6af36',
  },
  iconoTiradaCentral: {
    width: 150,
    height: 150,
  },
  botonNuevaTirada: {
    backgroundColor: '#d6af36',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  textoNuevaTirada: {
    color: '#1f1f2f',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'TarotTitles',
  },
  botonHistorial: {
    backgroundColor: 'rgba(214, 175, 54, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#d6af36',
    width: '80%',
    alignItems: 'center',
  },
  textoHistorial: {
    color: '#d6af36',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TarotBody',
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 30,
    textAlign: 'center',
    fontFamily: 'TarotBody',
  },
  tiradaContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  preguntaTirada: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#d6af36',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontFamily: 'TarotBody',
  },
  scrollTirada: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  botonInterpretacion: {
    backgroundColor: 'rgba(214, 175, 54, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#d6af36',
    width: '80%',
    alignItems: 'center',
  },
  botonInterpretacionTexto: {
    color: '#d6af36',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'TarotBody',
  },
  loadingCarousel: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCarouselText: {
    color: '#d6af36',
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'TarotBody',
  },
});
