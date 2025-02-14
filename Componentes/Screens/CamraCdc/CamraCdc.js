import React, { useState, useRef, useEffect,useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Alert } from 'react-native';
import { CameraView,useCameraPermissions } from 'expo-camera';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library'; // Importar MediaLibrary
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { AuthContext } from '../../../AuthContext';
function CamraCdc({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);

  const [permission, requestPermission] = useCameraPermissions();

  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);
  const { navigate } = useNavigation();
  const { colors,fonts } = useTheme();
  const [camarainiciada,setCamarainiciada]=useState(false)

  const { estadocomponente } = useContext(AuthContext);
  const {  actualizarEstadocomponente } = useContext(AuthContext);
  const [recortado,setRecortado]=useState(false)

   useEffect(() => {
      if (permission && !permission.granted) {
        Alert.alert("Permiso denegado", "No se concedió permiso para acceder a la cámara.");
      }
    }, [permission]);
  // Solicitar permisos para usar la cámara y la galería al montar el componente
  useEffect(() => {
    (async () => {
     
      // Solicitar permisos para guardar en la galería
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert("Permiso denegado", "No se concedió permiso para guardar en la galería.");
      }
    })();
  }, []);
  
  // Tomar una foto y guardarla automáticamente
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // Tomar la foto
        const photo = await cameraRef.current.takePictureAsync();
        setPhoto(photo.uri); // Mostrar la vista previa
        setRecortado(false)
        // Guardar la foto en la galería
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        Alert.alert("Éxito", "La imagen se ha guardado en la galería.");
      } catch (error) {
        console.error("Error al tomar o guardar la foto:", error);
        Alert.alert("Error", "No se pudo guardar la imagen en la galería.");
      }
    }
  };

  const activar_camara = async () => {
    setRecortado(false)
    
    if (!permission) {
      await requestPermission();
    }
  
    if (permission && permission.granted) {
      console.log('Permiso concedido, activando cámara');
      setCamarainiciada(true);
      actualizarEstadocomponente('camaracdc',true)
    } else {
      Alert.alert("Permiso denegado", "No se concedió permiso para acceder a la cámara.");
    }
  };
  const desactivar_camara=()=>{
    actualizarEstadocomponente('camaracdc',false)
    setCamarainiciada(false)
  }
// Recortar la imagen y guardarla en la galería
  const cropImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        // aspect: [1, 1], // Opcional: Define la relación de aspecto
        quality: 1,
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const croppedUri = result.assets[0].uri; // URI de la imagen recortada
  
        // Guardar la imagen recortada en la galería
        await MediaLibrary.saveToLibraryAsync(croppedUri);
        Alert.alert("Éxito", "La imagen recortada se ha guardado en la galería.");
  
        // Actualizar el estado para mostrar la vista previa
        setPhoto(croppedUri);
        setRecortado(true)
      }
    } catch (error) {
      console.error("Error al recortar o guardar la imagen:tonot", error);
      Alert.alert("Error", "No se pudo guardar la imagen recortada en la galería.");
    }
  };


  const ComponenteInicio=()=>{
    return(
      <View style={styles.containerobjets}>
      <LottieView
            source={require('../../../assets/takepicture.json')}
            style={{ width: 300, height: 300 }}
            autoPlay
            loop
          />
          <TouchableOpacity
            style={[styles.botoncamara, { backgroundColor: '#57DCA3' }]}
            onPress={activar_camara}
          >
            <FontAwesome name="camera-retro" size={45} color="white" />
          </TouchableOpacity>
          
          <View style={styles.textContainer}>
            <Text style={{ color: colors.textsub, fontFamily: fonts.regular.fontFamily}}>
              Activar Cámara
            </Text>
          </View>
      </View>
    )
  }

  const cerrar_imagen=()=>{
    actualizarEstadocomponente('camaracdc',false)
    setCamarainiciada(false)
    setPhoto(null)
  }
  const sacar_nueva_foto=()=>{
    setPhoto(null)
  }
  const size_boton=40
  const color_boton='white'
  const ComponenteCamara = () => {
    return (
      <View style={{ flex: 1 }}>
        {!photo ? ( // Si no hay foto, muestra la cámara
          CameraView ? (
            <CameraView style={styles.camera} ref={cameraRef} isActive={true}>
              <TouchableOpacity style={styles.closeIcon} onPress={desactivar_camara}>
                  <SimpleLineIcons name="close" size={40} color="red" />
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.buttonfoto,{ backgroundColor: colors.acctionsbotoncolor,}]}onPress={takePicture}>
                  <Text style={[styles.text,{color:'white',fontFamily: fonts.regular.fontFamily}]}>Tomar foto</Text>
                </TouchableOpacity>
                
              </View>
              
            </CameraView>
          ) : (
            <Text>La cámara no está disponible en este dispositivo.</Text>
          )
        ) : (
          // Si hay foto, muestra la vista previa
          <View style={styles.previewContainer}>
            <Image source={{ uri: photo }} style={recortado ? styles.previewImageCut : styles.previewImage}  />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button,{ backgroundColor: colors.acctionsbotoncolor,}]} onPress={cropImage}>
                  <FontAwesome name="cut" size={size_boton} color={color_boton} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button,{ backgroundColor: colors.acctionsbotoncolor,}]} onPress={sacar_nueva_foto}>
                <Entypo name="back-in-time" size={size_boton} color={color_boton}/>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button,{ backgroundColor: colors.acctionsbotoncolor,}]} onPress={cerrar_imagen}>
                <MaterialIcons name="cancel" size={size_boton} color={color_boton} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button,{ backgroundColor: colors.acctionsbotoncolor,}]} onPress={() => setCamarainiciada(false)}>
                <MaterialCommunityIcons name="send" size={size_boton} color={color_boton} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>

       
      {
        !camarainiciada ?(
          <ComponenteInicio></ComponenteInicio>
        )
        :
        (
          <ComponenteCamara></ComponenteCamara>
        )
      }



 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  camera: {
    flex: 1,
  },
  closeIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  buttonContainer: {
    position: "absolute", // Posición absoluta para colocarlo sobre la cámara
    bottom: 30, // A 30px del fondo
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonfoto:{
    width: 150,
    height: 60,
    borderRadius: 10, // Hace el botón circular
    
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray"

  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    padding: 10,
    borderWidth:1,
    borderRadius: 50,
  },
  text: {
    fontSize: 18,
    color: '#000',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    
  },
  previewImageCut: {
    width: '100%',
    height: '50%',
    
  },
  buttonRow: {
    position: 'absolute',
    bottom: 20, // Ajusta según necesites
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
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
  containerobjets:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default CamraCdc;