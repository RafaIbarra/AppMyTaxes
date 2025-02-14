import React, { useState, useEffect,useContext,useCallback  } from 'react';
import { View, Button, Text, ActivityIndicator, StyleSheet, Alert,FlatList,TouchableOpacity ,TextInput } from 'react-native';
import { useNavigation,useFocusEffect  } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import Generarpeticion from '../../../Apis/peticiones';
import ScreensCabecera from '../../ScreensCabecera/ScreensCabecera';

import { AuthContext } from '../../../AuthContext';
import AndroidXmlHandler from '../../XmlHandler/AndroidXmlHandler';
import FolderHandler from '../../FolderHandler/FolderHandler';


const ListaArchivos= ({ navigation }) => {
    const { estadocomponente } = useContext(AuthContext);
    const {  actualizarEstadocomponente } = useContext(AuthContext);
    const { colors,fonts } = useTheme();
    const { navigate } = useNavigation();

    
    const [estadosupdate,setEstadosupdate]=useState({name:'qrdetected',value:false})
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasAccess, setHasAccess] = useState(true);
    const [status, setStatus] = useState('');
    const [nombrearchivo,setNombrearchivo]=useState('')
    const [filefound,setFilefound]=useState(true)
    const [dataarchivos,setDataarchivos]=useState([])
    const [dataarchivospendientes,setDataarchivospendientes]=useState([])
    const [dataarchivosprocesados,setDataarchivosprocesados]=useState([])
    const [dataarchivoscompletos,setDataarchivoscompletos]=useState([])
    const [busqueda,setBusqueda]=useState(false)
    const [cantarchivos,setCantarchivos]=useState(0)
    const [cant_no,setCant_no]=useState(0)
    const [cant_si,setCant_si]=useState(0)
    const [existe,setExiste]=useState(false)
    const [selectedButton, setSelectedButton] = useState('PENDIENTES')

    const agregarCero = (numero) => (numero < 10 ? `0${numero}` : numero);

    const handleButtonPress = (buttonName) => {
      setSelectedButton(buttonName); // Actualiza el estado al botón seleccionado
      switch (buttonName) {
        case 'TODOS':
          // Lógica para mostrar todos los archivos
          setDataarchivos(dataarchivoscompletos)
          break;
    
        case 'PENDIENTES':
          // Lógica para mostrar solo los archivos pendientes
          setDataarchivos(dataarchivospendientes)
          break;
    
        case 'PROCESADOS':
          // Lógica para mostrar solo los archivos procesados
          setDataarchivos(dataarchivosprocesados)
          break;
    
        default:
          // A cualquier otro caso (opcional)
          Alert.alert('Opción no válida');
          break;
      }
    };


    const seleccionar_archivo=(detaraeg)=>{
      
      if(detaraeg.procesado==='NO'){

        const valorcdc=detaraeg.nombrearchivo.replace(/\.xml$/, '');
        
        const datacdc={
          'nombrecdc':valorcdc
        }
        actualizarEstadocomponente('datocdc',datacdc)
        
        handleUploadXml(detaraeg.uri)
      }else{
        
        
        
        
        const datafac=detaraeg.data_factura[0]

    
        actualizarEstadocomponente('datafactura',datafac)
        actualizarEstadocomponente('factura_editar',datafac.id)
        navigation.navigate('InicioHome', {
          screen: 'DetalleFactura', // Nombre exacto de la pantalla en el Tab
        });

      }
    }
    
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            actualizarEstadocomponente('tituloloading','BUSCANDO ARCHIVOS XML..')
            actualizarEstadocomponente('loading',true)

            const cargardatos=async()=>{
              try{

                const dato= await FolderHandler.checkIfDirectoryExists();
                setExiste(dato) 
                if (dato){

                  await checkDirectoryAccess()
                }
              }catch (error) {
                      Alert.alert("Error", "Error de lectura de carpeta MyTaxes");
                      actualizarEstadocomponente('tituloloading','')
                      actualizarEstadocomponente('loading',false)
                  } finally {
                    actualizarEstadocomponente('tituloloading','')
                    actualizarEstadocomponente('loading',false)
                    }
    
            }
        cargardatos()
        })
        return unsubscribe;
      })
 

    const checkDirectoryAccess = async () => {
        const access = await AndroidXmlHandler.hasDirectoryAccess();
        setHasAccess(access);
        if (access) {
        
          
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
        
        
        if (datafiles){
         
          
          
          const nuevoObjeto = datafiles.map(file => {
            const fecha = new Date(file.timestamp);
            const dia = agregarCero(fecha.getDate());
            const mes = agregarCero(fecha.getMonth() + 1); // Los meses van de 0 a 11
            const anio = fecha.getFullYear();
            const horas = agregarCero(fecha.getHours());
            const minutos = agregarCero(fecha.getMinutes());
            const segundos = agregarCero(fecha.getSeconds());
          
            const fechaFormateada = `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
          
            return {
              nombrearchivo: file.fileName,
              fechadescarga: fechaFormateada,
              uri: file.uri,
              
            };
          });
          
          
          const jsonData = JSON.stringify(nuevoObjeto);
          const datosregistrar={
            archivos:jsonData
          }

          const endpoint='ConsultaArchivosXML/'
          const result = await Generarpeticion(endpoint, 'POST', datosregistrar);
          const respuesta=result['resp']
          actualizarEstadocomponente('tituloloading','')
          actualizarEstadocomponente('loading',false)
          if (respuesta === 200){
            const registros=result['data']
            
            // const { totalArchivos, cantidadNo, cantidadSi } = registros.reduce(
            //     (acumulador, archivo) => {
            //       acumulador.totalArchivos++; // Contar el total de archivos
            //       if (archivo.procesado === "NO") acumulador.cantidadNo++; // Contar los "NO"
            //       if (archivo.procesado === "SI") acumulador.cantidadSi++; // Contar los "SI"
            //       return acumulador;
            //     },
            //     { totalArchivos: 0, cantidadNo: 0, cantidadSi: 0 } // Estado inicial
            //   );
            

            
            if(Object.keys(registros).length>0){
                registros.forEach((elemento) => {
                  
                  elemento.key = elemento.id;
                  elemento.recarga='no'
                })
            }
            const archivosPendientes = registros.filter(archivo => archivo.procesado === "NO");
            setDataarchivospendientes(archivosPendientes)

            const archivosProcesados = registros.filter(archivo => archivo.procesado === "SI");
            setDataarchivosprocesados(archivosProcesados)

            
            setDataarchivoscompletos(registros)
            
            
            setCant_no(archivosPendientes.length)
            setCant_si(archivosProcesados.length)
            setCantarchivos(registros.length)

            switch (selectedButton) {
              case 'TODOS':
                // Lógica para mostrar todos los archivos
                setDataarchivos(registros)
                break;
          
              case 'PENDIENTES':
                // Lógica para mostrar solo los archivos pendientes
                setDataarchivos(archivosPendientes)
                break;
          
              case 'PROCESADOS':
                // Lógica para mostrar solo los archivos procesados
                setDataarchivos(archivosProcesados)
                break;
          
              default:
                // Manejar cualquier otro caso (opcional)
                setDataarchivos(registros)
                break;
            }

          }else if(respuesta === 403 || respuesta === 401){
                      
                setGuardando(false)
                await Handelstorage('borrar')
                await new Promise(resolve => setTimeout(resolve, 1000))
                setActivarsesion(false)
          }else{
                showDialog(true)
                setMensajeerror( handleError(result['data']['error']))
          }


        }

    
      }
    
      const handleSelectDirectory = async () => {
        // setIsProcessing(true);
        // setStatus('Seleccionando directorio...');
        actualizarEstadocomponente('tituloloading','Seleccionando directorio...')
        actualizarEstadocomponente('loading',true)
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
          // setIsProcessing(false);
          actualizarEstadocomponente('tituloloading','')
          actualizarEstadocomponente('loading',false)
        }
      };
    
      const handleUploadXml = async (fileUri) => {
        // setIsProcessing(true);
        // setStatus('Subiendo archivo...');
        actualizarEstadocomponente('datafactura',[])
        
        actualizarEstadocomponente('tituloloading','SUBIENDO ARCHIVO...')
        actualizarEstadocomponente('loading',true)
        try {
         const data= await AndroidXmlHandler.uploadXmlFile(
            fileUri);
          
          actualizarEstadocomponente('factura_editar',0)
          actualizarEstadocomponente('datafactura',data)
          await new Promise(resolve => setTimeout(resolve, 1000))
          setStatus('Archivo subido correctamente');
          
          //navigate("DetalleFactura")
          navigate('InicioHome', {
            screen: 'DetalleFactura', // Nombre exacto de la pantalla en el Tab
          })


        } catch (error) {
          setStatus(`Error: ${error.message}`);
        } finally {
          actualizarEstadocomponente('tituloloading','')
          actualizarEstadocomponente('loading',false)
        }
      };
    
      
    
      return (
        <View style={{ flex: 1 }}>
          {/* <ScreensCabecera title={title} backto={backto} estadosupdate={estadosupdate}></ScreensCabecera> */}
          <View style={[styles.cabeceracontainer,{backgroundColor:colors.card}]}>

              {!busqueda &&( <Text style={[styles.titulocabecera, { color: colors.textcard, fontFamily: fonts.regularbold.fontFamily}]}>Historial de Archivos</Text>)}
              
          </View>


          {
            existe ?(
              <>
                {hasAccess && (

                          dataarchivos.length > 0 ? (

                            <View style={{flex: 1,}}> 

                              <View style={{borderBottomWidth:2,
                                            // borderBottomLeftRadius:20,
                                            // borderLeftWidth:1,
                                            marginLeft:5,
                                            // borderRightWidth:1,
                                            // borderBottomRightRadius:20,
                                            marginRight:5
                                            }}> 

                                <View style={{ paddingLeft:20,paddingRight:20,paddingTop:10,paddingBottom:10,  flexDirection: "row", width: "100%",justifyContent: "space-between",}} >
                                  <TouchableOpacity 
                                  style={[
                                    styles.botonopciones,
                                    selectedButton === 'TODOS' && { backgroundColor: colors.acctionsbotoncolor }
                                  ]}
                                  onPress={() => handleButtonPress('TODOS')}
                                  >
                                    <Text style={[styles.textoBoton,
                                      
                                      selectedButton === 'TODOS' && {color: 'white',},
                                      selectedButton === 'TODOS' ? { fontFamily: fonts.regularbold.fontFamily} :  { fontFamily: fonts.regular.fontFamily} 
                                      
                                      
                                    ]}
                                    >TODOS</Text>
                                  </TouchableOpacity >



                                  <TouchableOpacity 
                                  style={[
                                    styles.botonopciones,
                                    selectedButton === 'PENDIENTES' && { backgroundColor: colors.acctionsbotoncolor }
                                  ]}
                                  onPress={() => handleButtonPress('PENDIENTES')}
                                  >
                                    <Text style={[styles.textoBoton,
                                      
                                      selectedButton === 'PENDIENTES' && {color: 'white',},
                                      selectedButton === 'PENDIENTES' ? { fontFamily: fonts.regularbold.fontFamily} :  { fontFamily: fonts.regular.fontFamily} 
                                      
                                      
                                    ]}
                                    >PENDIENTES</Text>
                                  </TouchableOpacity >


                                  <TouchableOpacity 
                                  style={[
                                    styles.botonopciones,
                                    selectedButton === 'PROCESADOS' && { backgroundColor: colors.acctionsbotoncolor }
                                  ]}
                                  onPress={() => handleButtonPress('PROCESADOS')}
                                  >
                                    <Text style={[styles.textoBoton,
                                      
                                      selectedButton === 'PROCESADOS' && {color: 'white',},
                                      selectedButton === 'PROCESADOS' ? { fontFamily: fonts.regularbold.fontFamily} :  { fontFamily: fonts.regular.fontFamily} 
                                      
                                      
                                    ]}
                                    >PROCESADOS</Text>
                                  </TouchableOpacity >



                                </View>
                              </View>


                              <View style={{padding:15,marginBottom:90 }}>
                                  

                                  <FlatList
                                  data={dataarchivos}
                                  renderItem={({ item }) => {
                                      return (
                                      <TouchableOpacity style={styles.contenedordatos}
                                          onPress={() => {seleccionar_archivo(item)  }}
                                      >

                                          <Text
                                          style={[
                                              styles.textocontenido,
                                              { color: colors.text, fontFamily: fonts.regularbold.fontFamily },
                                          ]}
                                          >
                                          {item.nombrearchivo}
                                          </Text>
                                          <Text
                                          style={[
                                              styles.textocontenido,
                                              { color: colors.textsub, fontFamily: fonts.regular.fontFamily },
                                          ]}
                                          >
                                          Fecha Descarga: {item.fechadescarga}
                                          </Text>


                                          <View style={{flexDirection: "row", width: "100%"}}>
                                              

                                                  <Text
                                                  style={[
                                                      styles.textocontenido,
                                                      { color: colors.textsub, fontFamily: fonts.regular.fontFamily,marginRight:20 },
                                                  ]}
                                                  >
                                                  Procesado: {item.procesado}
                                                  </Text>
                                              
                                              <Text
                                              style={[
                                                  styles.textocontenido,
                                                  { color: colors.textsub, fontFamily: fonts.regular.fontFamily },
                                              ]}
                                              >
                                              Fecha :{item.fechaprocesado}
                                              </Text>
                                          </View>

                                      </TouchableOpacity>
                                      );
                                  }}
                                  keyExtractor={(item) => item.key}
                                  />
                              </View>
                            </View>
                          ):(
                              <View style={styles.containerobjets}> 
                                  <LottieView
                                          source={require('../../../assets/nodata.json')}
                                          style={{ width: 300, height: 300 }}
                                          autoPlay
                                          loop
                                        />
                              </View>
                          )
                          )
                          }

                {hasAccess &&(
                              <View style={styles.resumencontainer}>
                              
                                  <Text style={[styles.contenedortexto,{ color:colors.text, fontFamily: fonts.regular.fontFamily}]}>
                                          <Text style={[styles.labeltext,{ fontFamily: fonts.regularbold.fontFamily}]}>Cantidad Archivos:</Text>{' '}
                                          {Number(cantarchivos).toLocaleString('es-ES')} 
                                  </Text>

                                  <View style={{flexDirection:'row',justifyContent: "space-between"}}>

                                  <Text style={[styles.contenedortexto,{ color:colors.text, fontFamily: fonts.regular.fontFamily}]}>
                                      <Text style={[styles.labeltext,{ fontFamily: fonts.regularbold.fontFamily}]}>Procesados:</Text>{' '}
                                      {Number(cant_si).toLocaleString('es-ES')}
                                  </Text>
                                  <Text style={[styles.contenedortexto,{ color:colors.text, fontFamily: fonts.regular.fontFamily,marginLeft:50}]}>
                                      <Text style={[styles.labeltext,{ fontFamily: fonts.regularbold.fontFamily}]}>Pendientes:</Text>{' '}
                                      {Number(cant_no).toLocaleString('es-ES')}
                                  </Text>
                                  </View>
                                  
                                  
                              </View>
                          )
                  }
              </>
            ):(
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



          
            
              
        
              
          
        </View>
      );
}
const styles = StyleSheet.create({
    cabeceracontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        height:55
        
      },
    titulocabecera: {
        flex: 1,
        fontSize: 20,
        // fontWeight: 'bold',
        textAlign: 'center',
        // color:'white'
      },
    contenedordatos: {
        marginBottom: 30,
        marginRight: 5,
        overflow: 'hidden',
        borderBottomWidth:1,
        borderColor:'#57DCA3'
      },
      textocontenido: {
        fontSize: 12.5,
        marginBottom: 5,
      },
      
      resumencontainer: {
        //flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth:0.5,
        borderBottomWidth:0,
        
        borderTopRightRadius:50,
        borderColor:'#57DCA3',
        // backgroundColor:'#2a2a2c',
  
        paddingLeft:30,
        bottom:30,
        height:50
  
        
      },
      contenedortexto:{
        paddingBottom:10,
        fontSize:15,
        
      },

      labeltext:{
        
        fontSize:13
    },
    containerobjets:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center'
      },
    botonopciones:{
      borderWidth:1,
      borderRadius:10,
      width:110,
      height:40,
      alignItems:'center',
      justifyContent:'center'
    },
    textoBoton: {
      fontSize: 12,
      color: 'black',
      
    },
    containercentral:{
      flex: 1,                // Ocupa todo el espacio disponible
      justifyContent: 'center', // Centra verticalmente
      alignItems: 'center', 
    }
    
  });
export default ListaArchivos