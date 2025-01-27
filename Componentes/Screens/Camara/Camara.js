import React, { useState, useEffect,useContext } from 'react';
import { View, Text,  StyleSheet, Alert,ActivityIndicator,TouchableOpacity,Linking   } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from '../../../AuthContext';
import { Dimensions } from 'react-native';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
const { width, height } = Dimensions.get('window');
function Camara ({navigation}){
    const [permission, requestPermission] = useCameraPermissions();
    const [scanning, setScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [isFetching, setIsFetching] = useState(false); 
    const {  actualizarEstadocomponente } = useContext(AuthContext);
    const { estadocomponente } = useContext(AuthContext);
    const { navigate } = useNavigation();
    const startScanning = () => {
        if (permission && permission.granted) {
          
          setScanning(true); // Iniciar el escaneo
          setScannedData(null)
 
          
        } else {
          requestPermission(); // Solicitar permiso si no está concedido
        }
      };
      const handleBarcodeScanned = async ({ data }) => {
        
        if (data && !isFetching) { // Verifica que no se esté procesando otra solicitud
          setIsFetching(true); // Marca que la solicitud está en progreso
         
         
          try {
            
    
            
            const match = data.match(/Id=([^&]*)/);
            const idValue = match[1]
           
            const datacdc={
              'nombrecdc':idValue
            }
            actualizarEstadocomponente('datocdc',datacdc)
            actualizarEstadocomponente('isHeaderVisible',true)
            const url=data
            
            Linking.openURL(url).catch((err) => console.error("No se pudo abrir la URL:", err));
           
            actualizarEstadocomponente('qrdetected',true)
            actualizarEstadocomponente('activecamara',false)

          
      
          } catch (error) {
            console.error("Error al realizar el fetch:", error);
          } finally {
            setIsFetching(false); // Restablece el estado de la petición después de que se complete
            setScanning(false); // Detiene el escaneo después de recibir la respuesta
          }
        }
      };

    const cerrarcamara =()=>{
        setIsFetching(true);
        setScanning(false)
        actualizarEstadocomponente('activecamara',false)
  
    }
    useEffect(() => {
        if (permission && !permission.granted) {
          Alert.alert("Permiso denegado", "No se concedió permiso para acceder a la cámara.");
        }else{
            startScanning()
        }
      }, [permission]);
      return(
        <View style={styles.cameraContainer}>
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <CameraView
            style={{ width: '100%', height: '100%' }}
            facing="back"
            
            onBarcodeScanned={handleBarcodeScanned}
            
            resizeMode="cover"
          />
        </View>
        <TouchableOpacity style={styles.closeIcon} onPress={cerrarcamara}>
          <SimpleLineIcons name="close" size={40} color="red" />
        </TouchableOpacity>
      </View>
      )
}
const styles = StyleSheet.create({
    
  cameraContainer: {
    flex: 1,
    position: 'absolute', // Forzar el posicionamiento absoluto
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'red', // Ayuda a depurar el área disponible
  },
    camera: {
      width: '100%',
      height: '100%',
    position: 'absolute',
    backgroundColor:'blue'
    },
    
    
    
    closeIcon: {
      position: 'absolute',
      top: 40,
      right: 20,
      zIndex: 1, // Asegura que el icono esté al frente
    },
    
  
  });
  

export default Camara 