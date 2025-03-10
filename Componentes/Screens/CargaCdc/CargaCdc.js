import React, { useEffect,useContext,useState  } from 'react';
import { View, Text,  StyleSheet,  Alert,Linking,TouchableOpacity ,TextInput,Keyboard} from 'react-native';
import { Dialog, Portal,PaperProvider,Button } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";

import ScreensCabecera from '../../ScreensCabecera/ScreensCabecera';
import FolderHandler from '../../FolderHandler/FolderHandler';
import { AuthContext } from '../../../AuthContext';
import Generarpeticion from '../../../Apis/peticiones';
import Handelstorage from '../../../Storage/handelstorage';

import { Audio } from 'expo-av';

import LottieView from 'lottie-react-native';

import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';


import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import CamraCdc from '../CamraCdc/CamraCdc';

function CargaCdc({ navigation }){
    
    const[title,setTitle]=useState('CARGA CDC')
    const[backto,setBackto]=useState('MainTabs2')
    const { navigate } = useNavigation();
    const { colors,fonts } = useTheme();
    const [existe,setExiste]=useState(true)
     
    const { estadocomponente } = useContext(AuthContext);
    const {  actualizarEstadocomponente } = useContext(AuthContext);
    const { activarsesion, setActivarsesion } = useContext(AuthContext);
    
    const [recording, setRecording] = useState(false);


    const [audioUri, setAudioUri] = useState(null);
    const [sound, setSound] = useState();
    const [transcripcion,setTranscripcion]=useState('')
    
    const[cabeceracdc,setCabeceracdc]=useState()
    const [isPlaying, setIsPlaying] = useState(false);

    


    const [visibledialogo, setVisibledialogo] = useState(false)
    const showDialog = () => setVisibledialogo(true);
    const hideDialog = () => setVisibledialogo(false);
    const[mensajeerror,setMensajeerror]=useState('')
    const [opcion,setOpcion]=useState(0)
    const [activadacamaracdc,setActivadacamaracdc]=useState(false)


    async function listAudioFiles() {
      // Ruta de la carpeta donde se almacenan los audios (directorio de caché de Expo)
      const audioDirectory = FileSystem.cacheDirectory + 'ExperienceData/%2540rafael86%252FMyTaxesMovileApp/Audio/';
    
      try {
        // Obtener los archivos dentro de la carpeta Audio
        const files = await FileSystem.readDirectoryAsync(audioDirectory);
    
        if (files.length > 0) {
          Alert('Archivos encontrados en la carpeta:', files);
        } else {
          Alert('No se encontraron archivos en la carpeta.');
        }
      } catch (error) {
        Alert('Error al listar los archivos:', error);
      }
    }
    async function deleteAllAudioFiles() {
      // Ruta de la carpeta donde se almacenan los audios (directorio de caché de Expo)
      const audioDirectory = FileSystem.cacheDirectory + 'ExperienceData/%2540rafael86%252FMyTaxesMovileApp/Audio/';
    
      try {
        // Obtener los archivos dentro de la carpeta Audio
        const files = await FileSystem.readDirectoryAsync(audioDirectory);
    
        if (files.length > 0) {
          // Eliminar todos los archivos
          for (const file of files) {
            const filePath = audioDirectory + file;
            await FileSystem.deleteAsync(filePath);  // Eliminar cada archivo
            
          }
        
        } else {
         Alert('No hay archivos para eliminar');
        }
      } catch (error) {
        Alert('Error al eliminar los archivos:', error);
      }
    }

    const textocdc=(valor)=>{
      const sinEspacios = valor.trim().replace(/\s+/g, ''); // Elimina espacios al inicio, al final y en medio
      setTranscripcion(sinEspacios)
    }
   
    async function cancelaroperacion() {
      try {
        // if (recording) {
        //   // Si hay una grabación en curso, detenerla
        //   await recording.stopAndUnloadAsync();
        // }
        setRecording(false); // Restablecer el estado de grabación
        
        setTranscripcion(null); // Restablecer la transcripción
        
        if(opcion===2){
          if (recording){

            await stopRecording()
           
          }
          setAudioUri(null);
        }
        setOpcion(0)
        await deleteAllAudioFiles(); // Eliminar todos los archivos de audio

      } catch (error) {
        Alert('Error al cancelar la operación:', error);
      }
    }
    const cargamanual =()=>{
      
      
      setCabeceracdc('Carga manual CDC')
      setOpcion(1)
    }

    const cargaimagen =()=>{
      
      
      setCabeceracdc('Carga manual CDC')
      setOpcion(3)
    }
    
    async function deleteAudioFile(uri) {
      try {
        // Verifica si el archivo existe antes de intentar eliminarlo
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(uri);
        
        } else {
         
        }
      } catch (error) {
        Alert('Error al eliminar el archivo:', error);
      }
    }

    async function startRecording() {
      try {
        
        setOpcion(2)
        
        const permission = await Audio.requestPermissionsAsync();
  
        if (permission.status === 'granted') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
  
          const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );
  
          setRecording(recording);
        } else {
          Alert('Permiso denegado');
        }
      } catch (error) {
        Alert('Error al iniciar la grabación:', error);
      }
    }

    async function stopRecording() {
      
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        
        setRecording(false);
      } catch (error) {
        console.error('Error al detener la grabación:', error);
      }
    }

    const handleError = (errorObject) => {
      if (typeof errorObject === "object" && errorObject !== null) {
        return Object.entries(errorObject)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("\n");
      }
      return String(errorObject); // Si no es objeto, lo convierte a string directamente
    };
    // Subir el archivo de audio al backend
    async function uploadAudio() {
      if (!audioUri) return;
  
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        name: 'audio-recording.m4a', // Nombre del archivo
        type: 'audio/m4a', // Tipo MIME
      });
  
      try {
        actualizarEstadocomponente('tituloloading','ESPERANDO TRANSCRIPCION..')
        actualizarEstadocomponente('loading',true)
        const body = formData;
        const endpoint='UploadAudio/'
        const response = await Generarpeticion(endpoint, 'POST', body);
        const respuesta=response['resp']
        actualizarEstadocomponente('tituloloading','')
        actualizarEstadocomponente('loading',false)
        
        if (respuesta === 200) {
         
          const registros=response['data']['transcripcion']
         
          setTranscripcion(registros)
          setCabeceracdc('CDC listo')
          setOpcion(1)
          
           await deleteAudioFile(audioUri);
           
           setAudioUri(null)
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
    async function playAudio() {
      if (!audioUri) return;
  
      try {
       
        
        // Cargar y reproducir el audio
        const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
        setSound(sound);
        setIsPlaying(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            // El audio ha terminado de reproducirse
            setIsPlaying(false);
            sound.unloadAsync(); // Liberar recursos
          }
        });
        await sound.playAsync(); // Reproducir el audio
        
      } catch (error) {
        console.error('Error al reproducir el audio:', error);
      }
    }
    async function stopAudio() {
      
      if (sound) {
        try {
          await sound.stopAsync(); // Detener el audio
          setSound(undefined);
          setIsPlaying(false);
        } catch (error) {
          console.error('Error al detener el audio:', error);
        }
      }
    }
    const copiarAlPortapapeles = async () => {
     
      const valorACopiar =transcripcion
      const datocdc={nombrecdc:valorACopiar}
      actualizarEstadocomponente('datocdc',datocdc)
      await Clipboard.setStringAsync(valorACopiar);
      
      
      const url='https://ekuatia.set.gov.py/consultas/'
      Linking.openURL(url).catch((err) => console.error("No se pudo abrir la URL:", err));
      navigate("CargaArchivoXml", { })
    };

    

    useEffect(() => {
              const unsubscribe = navigation.addListener('focus', () => {
              
              const Comprobarexistencia = async () => {
                  const dato= await FolderHandler.checkIfDirectoryExists();
                  
                  // setExiste(dato)
                  setExiste(true) 
                 };
              Comprobarexistencia()
          })
          return unsubscribe;
        })
    
    
    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          
          actualizarEstadocomponente('isKeyboardVisible',true)
        }
      );
  
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          
          actualizarEstadocomponente('isKeyboardVisible',false)
        }
      );
  
      // Limpiar los listeners cuando el componente se desmonte
      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, []);

    const ListaOpciones=()=>{
      return(
        
          <View style={styles.botoneragrabacion}>

            <View style={styles.botonContainer}>
              <TouchableOpacity
                style={[styles.botoncamara, { backgroundColor: "#57DCA3" }]}
                onPress={cargamanual}
              >
                <Entypo name="pencil" size={50} color="white" />
              </TouchableOpacity>
              <Text style={[styles.textoboton, { color: colors.textsub, fontFamily: fonts.regular.fontFamily }]}>
                Cargar Cdc
              </Text>
            </View>

            <View style={styles.botonContainer}>
              <TouchableOpacity
                style={[styles.botoncamara, { backgroundColor: "#57DCA3" }]}
                onPress={startRecording}
              >
                <Feather name="mic" size={50} color="white" />
              </TouchableOpacity>
              <Text style={[styles.textoboton, { color: colors.textsub, fontFamily: fonts.regular.fontFamily }]}>
                Grabar Audio
              </Text>
            </View>

            <View style={styles.botonContainer}>
              <TouchableOpacity
                style={[styles.botoncamara, { backgroundColor: "#57DCA3" }]}
                onPress={cargaimagen}
              >
                <Feather name="image" size={50} color="white" />
              </TouchableOpacity>
              <Text style={[styles.textoboton, { color: colors.textsub, fontFamily: fonts.regular.fontFamily }]}>
                Imagen
              </Text>
            </View>


          </View>
      
      )
    }


    

    const OpcionGrabacion=()=>{
      return(
        <View style={styles.containercentral}>
            {
              !audioUri &&(
                <View style={styles.containercentral}>
                <LottieView source={require("../../../assets/sound2.json")} autoPlay loop style={{ width: 200, height: 200 }} />
                <TouchableOpacity style={[styles.botoncamara, { backgroundColor: "#57DCA3" }]} onPress={stopRecording}>
                  <FontAwesome5 name="stop-circle" size={24} color="white" />
                </TouchableOpacity>
              </View>
              )
            }
              
            
  
            {audioUri && (
              <View style={styles.containercentralopcion2}>
                <Text style={{ fontFamily: fonts.regularbold.fontFamily, fontSize: 30 }}>Grabación lista</Text>
                <View style={styles.botoneragrabacion}>
                  <View style={styles.botonContainer}>
                    <TouchableOpacity
                      style={[styles.botoncamara, { backgroundColor: "#57DCA3" }]}
                      onPress={isPlaying ? stopAudio : playAudio}
                    >
                      <Feather name={isPlaying ? "pause" : "play"} size={30} color="white" />
                    </TouchableOpacity>
                    <Text style={[styles.textoboton, { color: colors.textsub, fontFamily: fonts.regular.fontFamily }]}>
                      {isPlaying ? "Parar" : "Reproducir"}
                    </Text>
                  </View>
  
                  <View style={styles.botonContainer}>
                    <TouchableOpacity
                      style={[styles.botoncamara, { backgroundColor: "#57DCA3" }]}
                      onPress={uploadAudio}
                    >
                      <AntDesign name="upload" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={[styles.textoboton, { color: colors.textsub, fontFamily: fonts.regular.fontFamily }]}>
                      Transcribir
                    </Text>
                  </View>
                </View>
              </View>
            )}
        </View>
      )
    }
    
  return (
    <PaperProvider>
      <View style={styles.container}>
        { !activadacamaracdc &&(<ScreensCabecera title={title} backto={backto} />)}
  
        <Portal>
          <Dialog visible={visibledialogo} onDismiss={hideDialog}>
            <Dialog.Icon icon="alert-circle" size={50} color="red" />
            <Dialog.Title>ERROR</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">{mensajeerror}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>OK</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <View style={{ flex: 7 }}>
            {
              opcion===0 &&(
                <ListaOpciones></ListaOpciones>
              )
            }
            
            {
              opcion===1 &&(
                <View style={styles.containercentral}>
                    <Text style={{ fontFamily: fonts.regularbold.fontFamily, fontSize: 30 }}>{cabeceracdc}</Text>
                    <View style={[styles.contenedorcdc, { marginTop: 20 }]}>
                      <Text style={[styles.labelcdc, { fontFamily: fonts.regular.fontFamily }]}>CDC:</Text>
                      <TextInput
                        style={[
                          styles.inputcdc,
                          {
                            color: colors.text,
                            backgroundColor: colors.backgroundInpunt,
                            fontFamily: fonts.regular.fontFamily,
                          },
                        ]}
                        value={transcripcion}
                        onChangeText={textocdc}
                        underlineColorAndroid="transparent"
                        multiline={true}
                        scrollEnabled={true}
                        keyboardType="numeric"
                      />

                
                    </View>
                    <Text style={{ fontFamily: fonts.regular.fontFamily, color: "red" }}>
                      {String(transcripcion || "").replace(/(\d{4})/g, "$1 ")}
                    </Text>
                    <View style={styles.botonContainer}>
                      <TouchableOpacity
                        style={[styles.botoncamara, { backgroundColor: "#57DCA3" }]}
                        onPress={copiarAlPortapapeles}
                      >
                        <FontAwesome name="opera" size={50} color="white" />
                      </TouchableOpacity>
                      <Text style={[styles.textoboton, { color: colors.textsub, fontFamily: fonts.regular.fontFamily }]}>
                        Consulta Cdc
                      </Text>
                    </View>
                  </View>
              )
            }

            {
              opcion===2 &&(
                <OpcionGrabacion></OpcionGrabacion>
              )
            }

            {
              opcion===3 &&(
                <CamraCdc setActivadacamaracdc={setActivadacamaracdc} setTranscripcion={setTranscripcion} setOpcion={setOpcion} ></CamraCdc>
              )
            }
        </View>

  
        {!existe && 
        (
          // Si `existe` es false, mostrar la alerta con animación
          <View style={styles.containercentral}>
            <LottieView source={require("../../../assets/alert.json")} style={{ width: 300, height: 300 }} autoPlay loop />
            <View style={[styles.labelcdc, { marginLeft: 14 }]}>
              <Text style={{ color: colors.textsub, fontFamily: fonts.regular.fontFamily }}>
                Debe configurar la carpeta "MyTaxes". Vaya al apartado de configuraciones.
              </Text>
            </View>
          </View>
        )
        }
         {!activadacamaracdc &&(
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {
            opcion !==0 && !activadacamaracdc &&(
              <View style={styles.viewmic}>
              <TouchableOpacity
                style={[styles.botoncamara, { backgroundColor: "red" }]}
                onPress={cancelaroperacion}
              >
                <MaterialIcons name="cancel" size={60} color="white" />
              </TouchableOpacity>
            </View>
            )
          }
          </View>
         )
        }

      </View>
    </PaperProvider>
  );
        
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      
      
    },
    viewmic:{
      
      
      width:'100%',
      alignItems:'flex-end',
      paddingRight:20
      
      
    },
    containercentral:{
      flex: 1,                // Ocupa todo el espacio disponible
      justifyContent: 'center', // Centra verticalmente
      alignItems: 'center', 
    }
    ,
    containercentralopcion2:{
      
      justifyContent: 'center', // Centra verticalmente
      alignItems: 'center', 
      height:'50%',
      paddingRight:50,
      paddingLeft:50
    }
    ,
    botoneragrabacion:{
      flex:1,
      flexDirection: 'row',
      
      justifyContent:'space-between', // Crea un espacio equitativo entre los botones
      alignItems: 'center',
      width: '100%',
      paddingRight:50,
      paddingLeft:50
      
    },
    botonContainer: {
      alignItems: 'center', // Centra el botón y el texto horizontalmente
    },
    textoboton: {
      marginTop: -10, // Espacio entre el ícono y el texto
      fontSize: 12, // Ajusta el tamaño según sea necesario
    },
    contenedorcdc:{
      flexDirection: 'row', 
      alignItems: 'center',
      marginBottom:20,
      marginLeft:10,
      marginRight:10
     },
     labelcdc:{
      fontSize: 14, color: 'gray'
     },
     inputcdc:{
      textAlignVertical: 'center', // Centra el texto verticalmente si es necesario
      paddingVertical: 0, // Reduce el espacio interno superior e inferior
      lineHeight: 18, // Ajusta la altura de línea para que coincida con el tamaño de fuente
      borderBottomWidth: 1, // Mantiene la línea inferior
      borderBottomColor: 'gray', // Añade color a la línea inferior si es necesario
      paddingLeft: 10, // Espacio interno izquierdo
      flex: 1, // Ocupa el espacio disponible
      marginLeft: 5, // Espacio externo a la izquierda
      fontSize: 14, // Tamaño de la fuente para mayor control
  
     },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
      marginRight: 40
    },
    fill: {
      flex: 1,
      margin: 15
    }
    ,
    botoncamara:{
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: 'rgba(44,148,228,0.7)',
      width: 70,
      height: 70,
      // marginLeft: '45%',
      justifyContent: 'center', 
      alignItems: 'center', 
      borderRadius:20
      
    },
    gif: {
      width: 200,
      height: 200,
    },
  });
  
export default CargaCdc
