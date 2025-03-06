import React, { useState, useRef, useEffect,useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Alert } from 'react-native';
import { CameraView,useCameraPermissions } from 'expo-camera';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';



import * as MediaLibrary from 'expo-media-library'; // Importar MediaLibrary
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Entypo from '@expo/vector-icons/Entypo';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthContext } from '../../../AuthContext';
import Generarpeticion from '../../../Apis/peticiones';
import Handelstorage from '../../../Storage/handelstorage';

function CamraCdc({ navigation,setActivadacamaracdc,setTranscripcion,setOpcion }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [modo,setModo]=useState(0)
  const [permission, requestPermission] = useCameraPermissions();

  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);
  const { navigate } = useNavigation();
  const { colors,fonts } = useTheme();
  const [camarainiciada,setCamarainiciada]=useState(false)

  const { estadocomponente } = useContext(AuthContext);
  const {  actualizarEstadocomponente } = useContext(AuthContext);
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const [recortado,setRecortado]=useState(false)
  const [activarrecorte,setActivarrecorte]=useState(false)
  

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
  useEffect(() => {
    
  }, [activarrecorte]);
  
  // Tomar una foto y guardarla automáticamente
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // Tomar la foto
        const photo = await cameraRef.current.takePictureAsync();
        setPhoto(photo.uri); // Mostrar la vista previa
        setRecortado(false)
        setActivarrecorte(true)
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
    setModo(1)
    if (!permission) {
      await requestPermission();
    }
  
    if (permission && permission.granted) {
      
      setCamarainiciada(true);
      setActivadacamaracdc(true)
      actualizarEstadocomponente('camaracdc',true)
    } else {
      Alert.alert("Permiso denegado", "No se concedió permiso para acceder a la cámara.");
    }
  };
  const desactivar_camara=()=>{
    // actualizarEstadocomponente('camaracdc',false)
    // setCamarainiciada(false)
    // setActivadacamaracdc(false)
    actualizarEstadocomponente('camaracdc',false)
    setCamarainiciada(false)
    setActivadacamaracdc(false)
    setPhoto(null)
    setModo(0)
    setRecortado(false)
    setActivarrecorte(false)
  
  }
// Recortar la imagen y guardarla en la galería
  const cropImage = async () => {
    setActivarrecorte(true)
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


  const cerrar_imagen=()=>{
    actualizarEstadocomponente('camaracdc',false)
    setCamarainiciada(false)
    setActivadacamaracdc(false)
    setPhoto(null)
    setModo(0)
    setRecortado(false)
    setActivarrecorte(false)
  }
  const sacar_nueva_foto=()=>{
    setPhoto(null)
    setActivarrecorte(true)
  }
  const enviar_imagen = async ()=>{
    const formData = new FormData();
    formData.append("image", {
      uri: photo, 
      name: "photo.jpg",
      type: "image/jpeg",
    });

    
    try {
      actualizarEstadocomponente('tituloloading','ESPERANDO TRANSCRIPCION..')
      actualizarEstadocomponente('loading',true)
      const body = formData;
      const endpoint='LecturaImagenCdc/'
      const response = await Generarpeticion(endpoint, 'POST', body);
      const respuesta=response['resp']
      actualizarEstadocomponente('tituloloading','')
      actualizarEstadocomponente('loading',false)
      
      if (respuesta === 200) {
       
        const registros=response['data']['transcripcion']
       
        
        setTranscripcion(registros)
        actualizarEstadocomponente('camaracdc',false)
        setCamarainiciada(false)
        setActivadacamaracdc(false)
        setPhoto(null)
        setModo(0)
        setRecortado(false)
        setActivarrecorte(false)
        setOpcion(1)
      } else if(respuesta === 403 || respuesta === 401){

        await Handelstorage('borrar')
        setActivarsesion(false)
        
      } else{
        
        showDialog(true)
        
        setMensajeerror( handleError(response['data']['error']))
      }
    } catch (error) {
      Alert('Error al enviar el audio:', error);
    }
  }

  const selecionar_imagen =async(habilitaredicion)=>{
    setModo(2)
    setActivarrecorte(false)
    setCamarainiciada(true);
    setActivadacamaracdc(true)
    actualizarEstadocomponente('camaracdc',true)

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitas habilitar el acceso a la galería.');
      return null;
    }

    // Abrir la galería de imágenes
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo imágenes
      allowsEditing: habilitaredicion, // No permite recortar
      quality: 1, // Calidad máxima
    });

    if (!resultado.canceled) {
      setPhoto(resultado.assets[0].uri);  // Retorna la URI de la imagen seleccionada
    }
    
  }
  const recortar=()=>{
    setModo(0)
    setActivarrecorte(true)

  }
  const size_boton=40
  const color_boton='white'
  const ComponenteImagen=()=>{
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
      if (photo) {
        Image.getSize(photo, (width, height) => {
          setImageSize({ width, height });
        });
      }
    }, [photo]);
    return(
    <View  style={{ flex:1}}>
      <View 
        style={{ flex: 7}} 
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setContainerWidth(width);
          setContainerHeight(height);
        }}
      >
        <Image
          source={{ uri: photo }}
          style={{
            width: imageSize.width <= containerWidth ? imageSize.width : containerWidth,
            height: imageSize.height <= containerHeight ? imageSize.height : containerHeight,
            resizeMode: 'contain', // Mantiene la proporción original sin cortar
          }}
        />
      </View>
      <View style={styles.previewContainer}>
              <View style={styles.buttonRow}>
                {activarrecorte &&(
                <TouchableOpacity style={[styles.button,{ backgroundColor: colors.acctionsbotoncolor,}]} onPress={cropImage}>
                    <FontAwesome name="cut" size={size_boton} color={color_boton} />
                </TouchableOpacity>

                )}
                {
                  modo===1 &&(

                  <TouchableOpacity style={[styles.button,{ backgroundColor: colors.acctionsbotoncolor,}]} onPress={sacar_nueva_foto}>
                    <Entypo name="back-in-time" size={size_boton} color={color_boton}/>
                  </TouchableOpacity>
                  )
                }
                <TouchableOpacity style={[styles.button,{ backgroundColor: colors.acctionsbotoncolor,}]} onPress={cerrar_imagen}>
                  <MaterialIcons name="cancel" size={size_boton} color={color_boton} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button,{ backgroundColor: colors.acctionsbotoncolor,}]} onPress={ enviar_imagen}>
                  <MaterialCommunityIcons name="send" size={size_boton} color={color_boton} />
                </TouchableOpacity>
              </View>
      </View>
    </View>
    )
  }
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
                <TouchableOpacity onPress={takePicture}>
                  {/* <Text style={[styles.text,{color:'white',fontFamily: fonts.regular.fontFamily}]}>Tomar foto</Text> */}
                  <Ionicons name="radio-button-on-sharp" size={100} color="white" />
                </TouchableOpacity>
                
              </View>
              
            </CameraView>
          ) : (
            <Text>La cámara no está disponible en este dispositivo.</Text>
          )
        ) : (
          // Si hay foto, muestra la vista previa
          <ComponenteImagen></ComponenteImagen>
        )}
      </View>
    );
  };
  const ComponenteInicio=()=>{
    return(
      <View style={styles.containerobjets}>
          <View style={styles.containeriteminicio}> 
            <View style={styles.containeriteminicioobjetos}>
              <TouchableOpacity
                style={[styles.botoncamara, { backgroundColor: '#57DCA3' }]}
                onPress={activar_camara}
              >
                <FontAwesome name="camera-retro" size={45} color="white" />
              </TouchableOpacity>
              
              <View style={styles.textContainer}>
                <Text style={[styles.texto,{color:colors.text, fontFamily: fonts.regularbold.fontFamily,textDecorationLine:'underline',marginBottom:3}]}>Sacar foto</Text>
                <Text style={[styles.texto,{color:colors.textsub, fontFamily: fonts.regular.fontFamily}]}>* Quita una foto de la factura</Text>
                <Text style={[styles.texto,{color:colors.textsub, fontFamily: fonts.regular.fontFamily}]}>* Recórtala, dejando solo el área de los números que componen el CDC</Text>
                <Text style={[styles.texto,{color:colors.textsub, fontFamily: fonts.regular.fontFamily}]}>* Sube la foto y espera el resultado</Text>
              </View>
            </View>
          </View>

          <View style={styles.containeriteminicio}> 
            <View style={styles.containeriteminicioobjetos}>
              <TouchableOpacity
                style={[styles.botoncamara, { backgroundColor: '#57DCA3' }]}
                onPress={()=>selecionar_imagen(false)}
              >
                <MaterialIcons name="image-search" size={45} color="white" />
              </TouchableOpacity>
              
              <View style={styles.textContainer}>
                <Text style={[styles.texto,{color:colors.text, fontFamily: fonts.regularbold.fontFamily,textDecorationLine:'underline',marginBottom:3}]}>Seleccionar imagen recortada</Text>
                <Text style={[styles.texto,{color:colors.textsub, fontFamily: fonts.regular.fontFamily}]}>* Esta opción no permite editar imágenes</Text>
                <Text style={[styles.texto,{color:colors.textsub, fontFamily: fonts.regular.fontFamily}]}>* La imagen seleccionada debe contener únicamente el área de los números que componen el CDC</Text>
              </View>
            </View>
          </View>
          <View style={styles.containeriteminicio}> 
            <View style={styles.containeriteminicioobjetos}>
              <TouchableOpacity
                style={[styles.botoncamara, { backgroundColor: '#57DCA3' }]}
                onPress={()=>selecionar_imagen(true)}
              >
                <MaterialCommunityIcons name="image-edit-outline" size={45} color="white" />
              </TouchableOpacity>
              
              <View style={styles.textContainer}>
                <Text style={[styles.texto,{color:colors.text, fontFamily: fonts.regularbold.fontFamily,textDecorationLine:'underline',marginBottom:3}]}>Selección y edición de imagen</Text>
                <Text style={[styles.texto,{color:colors.textsub, fontFamily: fonts.regular.fontFamily}]}>* Selecciona la imagen</Text>
                <Text style={[styles.texto,{color:colors.textsub, fontFamily: fonts.regular.fontFamily}]}>* Recórtala, dejando solo el área de los números que componen el CDC</Text>
                <Text style={[styles.texto,{color:colors.textsub, fontFamily: fonts.regular.fontFamily}]}>* Sube la foto y espera el resultado</Text>
              </View>
            </View>
          </View>
         
          
      </View>
    )
  }
  
  return (
    <View style={styles.container}>

      {
        modo===0 && !activarrecorte&&(
          <ComponenteInicio></ComponenteInicio>
        )
      }
      {
        modo===1 && (
          <ComponenteCamara></ComponenteCamara>
        )
      }
     
      {
        modo>1 &&(
          <ComponenteImagen  ></ComponenteImagen>
        )
      }

      {/* {
        activarrecorte &&(
          <Cropper imageUri={photo}></Cropper>
        )
      } */}

 
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
    borderWidth:1,
    borderColor:'gray',
    borderTopLeftRadius:50,
    borderTopRightRadius:50
  },
  previewImage: {
    height:'100%',
    width:'100%',
    
    
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
  containerobjets:{
    margin:15,
    flex:1,
    justifyContent:'space-between'
    
    
  },
  containeriteminicio: {
    width: '100%',
    borderWidth: 1,
    borderColor:'gray',
    borderRadius: 30,
    padding: 10,
    
  },
  containeriteminicioobjetos: {
    flexDirection: 'row',
    justifyContent:'center',
    alignContent:'center',
    alignItems:'center',
    
    // alignItems: 'flex-start',
    // justifyContent: 'flex-start',
    // alignContent: 'flex-start',
    //flex: 1, // Permite que los elementos internos usen el espacio disponible
  },
  textContainer: {
    marginLeft: 10,
    flexShrink: 1, // Permite que el contenedor del texto se reduzca si es necesario
    width: '100%', // Asegura que los textos no sobrepasen el View
  },
  texto: {
    
    flexWrap: 'wrap', // Permite que el texto haga saltos de línea
  },
});

export default CamraCdc;