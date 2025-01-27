import React, { useState, useEffect,useContext } from 'react';
import { View,   StyleSheet, Alert,TouchableOpacity,Linking,Text   } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import LottieView from 'lottie-react-native';
import { AuthContext } from '../../../AuthContext';

import ScreensCabecera from '../../ScreensCabecera/ScreensCabecera';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function QRScanner({ navigation }) {
  const[title,setTitle]=useState('CARGA QR')
  const[backto,setBackto]=useState('MainTabs2')
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isFetching, setIsFetching] = useState(false); 
  const {  actualizarEstadocomponente } = useContext(AuthContext);
  const { estadocomponente } = useContext(AuthContext);
  const { navigate } = useNavigation();

  const { colors,fonts } = useTheme();
  useEffect(() => {
    if (permission && !permission.granted) {
      Alert.alert("Permiso denegado", "No se concedió permiso para acceder a la cámara.");
    }
  }, [permission]);

 const ActivarCamara=()=>{
  // navigate("StackCamara")
  actualizarEstadocomponente('activecamara',true)
 }

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
        
        // setScannedData(dataFetched['url']); // Guarda los datos para mostrarlos en la app
  
      } catch (error) {
        console.error("Error al realizar el fetch:", error);
      } finally {
        setIsFetching(false); // Restablece el estado de la petición después de que se complete
        setScanning(false); // Detiene el escaneo después de recibir la respuesta
      }
    }
  };

  return (
    <View style={styles.container}>
    <ScreensCabecera title={title} backto={backto}></ScreensCabecera>
    <View style={styles.containerobjets}>
      <LottieView
        source={require('../../../assets/scanqr.json')}
        style={{ width: 300, height: 300 }}
        autoPlay
        loop
      />
      <TouchableOpacity
        style={[styles.botoncamara, { backgroundColor: '#57DCA3' }]}
        onPress={ActivarCamara}
      >
        <FontAwesome name="camera-retro" size={45} color="white" />
      </TouchableOpacity>
      {/* Contenedor adicional para centrar el texto */}
      <View style={styles.textContainer}>
        <Text style={{ color: colors.textsub, fontFamily: fonts.regular.fontFamily}}>
          Activar Cámara
        </Text>
      </View>
    </View>
  </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  containerobjets:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  botoncamara:{
    
    backgroundColor: 'rgba(44,148,228,0.7)',
    width: 70,
    height: 70,
    
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius:20
    
  },
  textContainer: {
    marginTop: 10, // Espacio entre el botón y el texto
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedText: {
    // marginTop: 20,
    fontSize: 18,
    color: 'green',
  },
 

});
export default QRScanner;
