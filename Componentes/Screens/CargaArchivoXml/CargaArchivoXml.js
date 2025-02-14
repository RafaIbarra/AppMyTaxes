import React, { useState, useEffect,useContext,useCallback  } from 'react';
import { View, Button, Text, ActivityIndicator, StyleSheet, Alert,BackHandler,TouchableOpacity ,TextInput } from 'react-native';
import { useNavigation,useFocusEffect  } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';

import ScreensCabecera from '../../ScreensCabecera/ScreensCabecera';

import { AuthContext } from '../../../AuthContext';
import AndroidXmlHandler from '../../XmlHandler/AndroidXmlHandler';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const CargaArchivoXml= ({ navigation }) => {
    const { estadocomponente } = useContext(AuthContext);
    const {  actualizarEstadocomponente } = useContext(AuthContext);
    const { colors,fonts } = useTheme();
    const { navigate } = useNavigation();

    const [title,setTitle]=useState('Carga Archivo Xml')
    const [backto,setBackto]=useState('MainTabs2')
    const [estadosupdate,setEstadosupdate]=useState({name:'qrdetected',value:false})
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasAccess, setHasAccess] = useState(true);
    const [status, setStatus] = useState('');
    const [nombrearchivo,setNombrearchivo]=useState('')
    const [filefound,setFilefound]=useState(true)

    const volver=()=>{
      
      actualizarEstadocomponente('qrdetected',false)
      navigate("MainTabs2", { })
  }
    useEffect(() => {
         const nombrecdc=estadocomponente.datocdc.nombrecdc+'.xml'
        // const nombrecdc='01800319702001005008254822024103013609116639'+'.xml'
         setNombrearchivo(nombrecdc)
      })
 

    const checkDirectoryAccess = async () => {
        const access = await AndroidXmlHandler.hasDirectoryAccess();
        setHasAccess(access);
        if (access) {
        
          actualizarEstadocomponente('qrdetected',false)
          await filtrodatos()
        }
      };
    
      const loadXmlFiles = async () => {
        try {
         
        
          
          const files = await AndroidXmlHandler.listXmlFiles();
          
          // Convertir la lista de URIs a objetos con información más detallada
          const formattedFiles = files.map(fileUri => ({
            uri: fileUri,
            fileName: decodeURIComponent(fileUri.split('%2F').pop()), // Decodifica el nombre del archivo
            timestamp: new Date().getTime() // Podrías obtener la fecha real del archivo si lo necesitas
          }));
          
          
          
          
          return formattedFiles
        } catch (error) {
          setStatus(`Error al cargar archivos: ${error.message}`);
        }
      };
    
      const filtrodatos = async()=>{
        const datafiles=await loadXmlFiles()

        const nombrecdc=estadocomponente.datocdc.nombrecdc+'.xml'
        
        
        if (datafiles){
         
          const resultado = datafiles.filter(file => file.fileName === nombrecdc);
    
          if (resultado.length>0){

              handleUploadXml(resultado[0].uri)
          }else{
            Alert.alert(`No encontrado ${nombrecdc} `);
          }
          
          
          
        }

    
      }
    
      const handleSelectDirectory = async () => {
        setIsProcessing(true);
        setStatus('Seleccionando directorio...');
        try {
          const directory = await AndroidXmlHandler.selectDirectory();
          if (directory) {
            setHasAccess(true);
            setStatus('Directorio seleccionado correctamente');
            //await loadXmlFiles();
            await filtrodatos()
          }
        } catch (error) {
          setStatus(`Error: ${error.message}`);
        } finally {
          setIsProcessing(false);
        }
      };
    
      const handleUploadXml = async (fileUri) => {
        setIsProcessing(true);
        setStatus('Subiendo archivo...');
        try {
         const data= await AndroidXmlHandler.uploadXmlFile(
            fileUri);
     
          actualizarEstadocomponente('factura_editar',0)
          setStatus('Archivo subido correctamente');
          actualizarEstadocomponente('datafactura',data)
          navigate("DetalleFactura")
        } catch (error) {
          setStatus(`Error: ${error.message}`);
        } finally {
          setIsProcessing(false);
        }
      };
    
      
    
      return (
        <View style={styles.container}>
          <ScreensCabecera title={title} backto={backto} estadosupdate={estadosupdate}></ScreensCabecera>
          <View style={{alignItems:'center',padding:10,width:'100%'}} >

              <View style={{ marginHorizontal: '5%', marginTop: 20 }}>
                  <Text style={{ fontFamily: fonts.regular.fontFamily, fontSize: 14, color: 'gray', marginBottom: 5 }}>
                    Nombre del Archivo:
                  </Text>
                  <TextInput
                    style={{
                      color: colors.text,
                      backgroundColor: colors.backgroundInpunt,
                      fontFamily: fonts.regular.fontFamily,
                      textAlignVertical: 'center',
                      paddingVertical: 1,
                      lineHeight: 18,
                      borderBottomWidth: 1,
                      marginBottom: 5, // Reduce la separación con otros elementos
                      paddingLeft: 10,
                    }}
                    value={nombrearchivo}
                    underlineColorAndroid="transparent"
                    editable={false}
                    multiline={true} // Permite desplazamiento horizontal si es necesario
                    scrollEnabled={true} // Habilita el desplazamiento horizontal
                  />
              </View>
              {!hasAccess && (
              
                <View style={{width:'100%',paddingRight:5,paddingLeft:5}}> 

                      <TouchableOpacity 
                        style={{ 
                          backgroundColor: filefound ? colors.acctionsbotoncolor : 'gray', // Cambia el color si está deshabilitado
                          marginTop: 50,
                          marginBottom: 50,
                          height: 40,
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          borderRadius: 20,
                          flexDirection: 'row', // Alinea los elementos en fila
                          paddingHorizontal: 10, // Espaciado interno
                          opacity: filefound ? 1 : 0.5, // Reduce opacidad si está deshabilitado
                        }} 
                        onPress={handleSelectDirectory}
                        disabled={!filefound} // Deshabilita si found es false
                      >
                        <Text style={{
                          fontSize: 16,
                          color: 'black', // Cambiar según el diseño
                          fontFamily: fonts.regularbold.fontFamily, // Personaliza la fuente
                          marginRight: 8, // Espacio entre el texto y el icono
                        }}>
                         Seleccionar Directorio MyTaxes
                        </Text>
                        <MaterialCommunityIcons name="access-point-check" size={24} color="black" />
                      </TouchableOpacity>
                      
                        <Text style={{fontSize: 13,
                          color: 'red', // Cambiar según el diseño
                          fontFamily: fonts.regular.fontFamily, // Personaliza la fuente
                          
                          
                          }}
                          >No se encontraron permisos para acceder a la carpeta de descarga, pulse el boton de seleccionar</Text>
                      
                  </View>

                
              )}
        
              
              {
                hasAccess&&(

                  <View style={{width:'100%',paddingRight:5,paddingLeft:5}}> 

                      <TouchableOpacity 
                        style={{ 
                          backgroundColor: filefound ? colors.acctionsbotoncolor : 'gray', // Cambia el color si está deshabilitado
                          marginTop: 50,
                          marginBottom: 50,
                          height: 40,
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          borderRadius: 20,
                          flexDirection: 'row', // Alinea los elementos en fila
                          paddingHorizontal: 10, // Espaciado interno
                          opacity: filefound ? 1 : 0.5, // Reduce opacidad si está deshabilitado
                        }} 
                        onPress={checkDirectoryAccess}
                        disabled={!filefound} // Deshabilita si found es false
                      >
                        <Text style={{
                          fontSize: 16,
                          color: 'black', // Cambiar según el diseño
                          fontFamily: fonts.regularbold.fontFamily, // Personaliza la fuente
                          marginRight: 8, // Espacio entre el texto y el icono
                        }}>
                          Cargar Archivo
                        </Text>
                        <MaterialIcons name="upload-file" size={24} color="black" />
                      </TouchableOpacity>
                      {!filefound && (
                        <Text style={{fontSize: 16,
                          color: 'red', // Cambiar según el diseño
                          fontFamily: fonts.regular.fontFamily, // Personaliza la fuente
                          
                          
                          }}
                          > El archivo no ha sido encontrado, verifique la descarga </Text>
                      )}
                  </View>
                )
              }
              
        
              {isProcessing && <ActivityIndicator style={styles.loader} />}
              
              <Text style={{
                marginTop: 10,
                textAlign: 'center',
                color: 'gray',
                fontFamily: fonts.regular.fontFamily
              }}>{status}</Text>
          </View>
        </View>
      );
}
const styles = StyleSheet.create({



    container: {
      flex: 1,
      
    },
    textocontenido: {
      fontSize: 12.5,
      marginBottom: 5,
    },
    inputtextactivo: {
      borderBottomWidth: 1,
     
      
    },
    
    leItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#fff',
      borderRadius: 8,
    },
    fileInfo: {
      flex: 1,
      marginRight: 10,
    },
    fileName: {
      fontSize: 16,
      color: '#333',
      marginBottom: 4,
    },
    fileDate: {
      fontSize: 12,
      color: '#666',
    },
    separator: {
      height: 1,
      backgroundColor: '#eee',
      marginVertical: 4,
    },
    loader: {
      marginVertical: 10,
    },
    status: {
      marginTop: 10,
      textAlign: 'center',
      color: '#666',
    },
    noFiles: {
      textAlign: 'center',
      color: '#666',
      marginTop: 20,
    }
  });
export default CargaArchivoXml