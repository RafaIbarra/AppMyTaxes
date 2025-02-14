import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Linking, Dimensions, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AuthContext } from '../../../AuthContext';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

const { width, height } = Dimensions.get('window');

function Camara({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanning, setScanning] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [torch, setTorch] = useState(false);
    const { actualizarEstadocomponente } = useContext(AuthContext);
    const [showAlert, setShowAlert] = useState(false)

    const startScanning = () => {
        if (permission && permission.granted) {
            setScanning(true);
        } else {
            requestPermission();
        }
    };
    const handleBarcodeScanned = async ({ data, bounds }) => {
      if (data && !isFetching && !showAlert) { // <-- Verifica si hay una alerta activa
          if (bounds && bounds.size.width < 50 && bounds.size.height < 50) return;

          setIsFetching(true);
          try {
              const match = data.match(/Id=([^&]*)/);
              if (match) {
                  const idValue = match[1];
                  const datacdc = { 'nombrecdc': idValue };
                  actualizarEstadocomponente('datocdc', datacdc);
                  actualizarEstadocomponente('isHeaderVisible', true);
                  Linking.openURL(data).catch((err) => console.error("No se pudo abrir la URL:", err));
                  actualizarEstadocomponente('qrdetected', true);
                  actualizarEstadocomponente('activecamara', false);
                  setScanning(false); // Detener el escaneo solo si el QR es válido
              } else {
                  setShowAlert(true); // <-- Activa el estado de alerta
                  Alert.alert(
                      "QR no válido",
                      "El QR escaneado no pertenece a https://ekuatia.set.gov.py/",
                      [
                          {
                              text: "OK",
                              onPress: () => {
                                  setShowAlert(false); // <-- Reanuda el escaneo al presionar OK
                              },
                          },
                      ],
                      { 
                          onDismiss: () => {
                              setShowAlert(false); // <-- Reanuda el escaneo al cerrar la alerta
                          } 
                      }
                  );
              }
          } catch (error) {
              Alert.alert("Error", "Error al procesar el código QR");
              setScanning(false);
          } finally {
              setIsFetching(false);
          }
      }
  };

  //   const handleBarcodeScanned = async ({ data, bounds }) => {
  //     if (data && !isFetching) {
  //         if (bounds && bounds.size.width < 50 && bounds.size.height < 50) return; // Filtra códigos muy pequeños
  
  //         setIsFetching(true);
  //         try {
  //             const match = data.match(/Id=([^&]*)/);
  //             if (match) {
  //                 const idValue = match[1];
  //                 const datacdc = { 'nombrecdc': idValue };
  //                 actualizarEstadocomponente('datocdc', datacdc);
  //                 actualizarEstadocomponente('isHeaderVisible', true);
  //                 Linking.openURL(data).catch((err) => console.error("No se pudo abrir la URL:", err));
  //                 actualizarEstadocomponente('qrdetected', true);
  //                 actualizarEstadocomponente('activecamara', false);
  //                 setScanning(false); // Detener el escaneo solo si el QR es válido
  //             } else {
  //                 Alert.alert("El QR escaneado no pertenece a https://ekuatia.set.gov.py/");
  //                 // No cambiamos scanning a false aquí, para que la cámara siga escaneando
  //             }
  //         } catch (error) {
  //             Alert.alert("Error al procesar el código QR:", error);
  //             setScanning(false); // Detener el escaneo en caso de error grave
  //         } finally {
  //             setIsFetching(false); // Restablecer el estado de fetching
  //         }
  //     }
  // };

    const cerrarcamara = () => {
        setIsFetching(true);
        setScanning(false);
        actualizarEstadocomponente('activecamara', false);
        
    };

    useEffect(() => {
        if (permission && !permission.granted) {
            Alert.alert("Permiso denegado", "No se concedió permiso para acceder a la cámara.");
        } else {
            startScanning();
        }
    }, [permission]);

    useEffect(() => {
      let timeout;
      if (scanning) {
          timeout = setTimeout(() => {
              Alert.alert("No se ha detectado ningún codigo QR!");
              cerrarcamara();
          }, 40000); // 10 segundos
      }
  
      return () => clearTimeout(timeout); // Limpia el temporizador si el usuario escanea antes
  }, [scanning]);

    return (
        <View style={styles.cameraContainer}>
            <View style={{ flex: 1, overflow: 'hidden' }}>
                <CameraView
                    style={{ width: '100%', height: '100%' }}
                    facing="back"
                    onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
                    resizeMode="cover"
                    autoFocus="on"  // Activa autoenfoque
                    flash={torch ? "torch" : "off"} // Control de flash
                />
                {/* Marco del escáner */}
                <View style={styles.rectangle}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
            </View>
            <TouchableOpacity style={styles.closeIcon} onPress={cerrarcamara}>
                <SimpleLineIcons name="close" size={40} color="red" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.flashButton} onPress={() => setTorch(!torch)}>
                <Text style={{ color: 'white', fontSize: 18 }}>{torch ? "Apagar Flash" : "Encender Flash"}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    cameraContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    rectangle: {
        position: 'absolute',
        top: height * 0.27,
        left: width * 0.15,
        width: width * 0.7,
        height: width * 0.8,
        backgroundColor: 'transparent',
    },
    corner: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderColor: 'white',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 8,
        borderLeftWidth: 8,
        borderTopLeftRadius: 30,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 8,
        borderRightWidth: 8,
        borderTopRightRadius: 30,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 8,
        borderLeftWidth: 8,
        borderBottomLeftRadius: 30,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 8,
        borderRightWidth: 8,
        borderBottomRightRadius: 30,
    },
    closeIcon: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    flashButton: {
        position: 'absolute',
        bottom: 60,
        left: '30%',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
    }
});

export default Camara;
