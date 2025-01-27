import React, { useContext,useEffect,useState,useRef } from 'react';

import {  View,Text,FlatList,TouchableOpacity,StyleSheet ,Animated,TextInput } from "react-native";
import { Dialog, Portal,PaperProvider,Button } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';

import Generarpeticion from '../../../Apis/peticiones';
import Handelstorage from '../../../Storage/handelstorage';
import Procesando from '../../Procesando/Procesando';
import { AuthContext } from '../../../AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
function ListadoFacturas({ navigation }){
    const { activarsesion, setActivarsesion } = useContext(AuthContext);
    const { navigate } = useNavigation();
    const { colors,fonts } = useTheme();
    const {  actualizarEstadocomponente } = useContext(AuthContext);
    const { estadocomponente } = useContext(AuthContext);
    const [guardando,setGuardando]=useState(false)
    const [cargacompleta,setCargacopleta]=useState(false)
    const [datafacturas,setDatafacturas]=useState([])
    const [rotationValue] = useState(new Animated.Value(0));
    const [montototaliva,setMontototaliva]=useState(0)
    const [canttotalfacturas,setCanttotalfacturas]=useState(0)
    const [montototalfacturas,setMontototalfacturas]=useState(0)
    const [datafacturacompleto,setDatafacturacompleto]=useState([])

    const [busqueda,setBusqueda]=useState(false)
    const [textobusqueda,setTextobusqueda]=useState('')
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [visibledialogo, setVisibledialogo] = useState(false)
    const[mensajeerror,setMensajeerror]=useState('')
    const showDialog = () => setVisibledialogo(true);
    const hideDialog = () => setVisibledialogo(false);

    const handleError = (errorObject) => {
      if (typeof errorObject === "object" && errorObject !== null) {
        return Object.entries(errorObject)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("\n");
      }
      return String(errorObject); // Si no es objeto, lo convierte a string directamente
    };
  
    const selecionar_registro =(detaraeg)=>{
      
      let estructura = {
        Conceptos: {},
        DataEmpresa: {
          "Empresa": detaraeg.NombreEmpresa,
          "NroRuc": detaraeg.RucEmpresa
        },
        DataFactura:{
          "FechaOperacion":detaraeg.fecha_factura,
          "NroFactura":detaraeg.numero_factura
        },
        DataMontos:{
          "total_operacion":detaraeg.total_factura,
          "liq_iva10":detaraeg.iva10,
          "liq_iva5":detaraeg.iva5,
          "total_iva":detaraeg.liquidacion_iva
        },
        Datosregistro:{
          "Fecharegistro":detaraeg.fecha_registro,
          "IdOperacion":detaraeg.id.toString(),
          "FormaRegistro":detaraeg.tipo_registro
        }

      };

      detaraeg.DetalleFactura.forEach((detalle, index) => {
        // Generar un nombre de ítem dinámico: Item_1, Item_2, ...
        let itemKey = `Item_${index + 1}`;
    
        // Asignar los valores correspondientes
        estructura.Conceptos[itemKey] = {
          "dAntGloPreUniIt": "",
          "dAntPreUniIt": "",
          "dBasExe": "",
          "dBasGravIVA": "",
          "dCantProSer": detalle.cantidad,
          "dCodInt": "",
          "dDesAfecIVA": "",
          "dDesProSer": detalle.concepto,
          "dDesUniMed": "",
          "dDescGloItem": "",
          "dDescItem": "",
          "dLiqIVAItem": "",
          "dPUniProSer": "",
          "dPorcDesIt": "",
          "dPropIVA": "",
          "dTasaIVA": "",
          "dTotBruOpeItem": "",
          "dTotOpeItem": detalle.total,
          "iAfecIVA": ""
        };
      });
    
      // Imprimir la nueva estructura
      actualizarEstadocomponente('datafactura',estructura)
      actualizarEstadocomponente('factura_editar',detaraeg.id)
      navigate("DetalleFactura")
    }

    const openbusqueda =()=>{
      setBusqueda(true);
    // Inicia la animación para mostrar el cuadro de búsqueda
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700, // Duración de la animación en milisegundos
      useNativeDriver: false,
    }).start();
    }

    const closebusqueda=()=>{
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start(() => setBusqueda(false));
      realizarbusqueda('')
    }    
    const realizarbusqueda = (palabra) => {
        
        
        let formattedPalabra = palabra;
        
        const isFirstCharNumber = !isNaN(palabra.charAt(0)) && palabra.charAt(0) !== "";
        // Verificar si es un número
        if (isFirstCharNumber) {

            formattedPalabra = palabra.replace(/\D/g, ''); // Eliminar caracteres no numéricos

            if (formattedPalabra.length > 3 && formattedPalabra.length <= 6) {
                
                formattedPalabra = formattedPalabra.replace(/(\d{3})(\d+)/, '$1-$2');
            } else if (formattedPalabra.length > 6) {
                
                formattedPalabra = formattedPalabra.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
            }



      
        }
        setTextobusqueda(formattedPalabra);
        const pal = formattedPalabra.toLowerCase();

        let arrayencontrado = datafacturacompleto.filter(item => 
            item.numero_factura.toLowerCase().includes(pal) ||
            item.NombreEmpresa.toLowerCase().includes(pal)
        );

        setDatafacturas(arrayencontrado);
    }

    const handlePress = () => {
            
          Animated.timing(rotationValue, {
            toValue: 1,
            duration: 200, // Duración de la animación en milisegundos
            useNativeDriver: true,
          }).start(() => {
            // Restaura la animación a su estado original
            rotationValue.setValue(0);
          });
          const item={'id':0}
          navigate("StackCargaOpciones", { })
          
     };
      
        // Interpola el valor de rotación para aplicarlo al estilo de transformación del icono
    const spin = rotationValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    } 
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          
          setCargacopleta(false)
          actualizarEstadocomponente('factura_editar',0)
          const cargardatos=async()=>{
            if (estadocomponente.qrdetected){
              navigate("CargaArchivoXml", { })
            }else{
              
              if(estadocomponente.complistado){

                  actualizarEstadocomponente('tituloloading','CARGANDO LISTADO..')
                  actualizarEstadocomponente('loading',true)
                  
                  const datestorage=await Handelstorage('obtenerdate');
                  const anno_storage=datestorage['dataanno']
                  const mes_storage=datestorage['datames']
                  const body = {};
                  const endpoint='MovimientosFacturas/' + anno_storage +'/' + mes_storage + '/0/'
                  const result = await Generarpeticion(endpoint, 'POST', body);
    
                  actualizarEstadocomponente('tituloloading','')
                  actualizarEstadocomponente('loading',false)
                  const respuesta=result['resp']
                  
                  if (respuesta === 200){
                      const registros=result['data']
                      actualizarEstadocomponente('complistado',false)
                      actualizarEstadocomponente('datalistadofactura',registros)
                      
                      if(Object.keys(registros).length>0){
                          registros.forEach((elemento) => {
                            
                            elemento.key = elemento.id;
                            elemento.recarga='no'
                          })
                      }
      
                      setDatafacturas(registros)
                      setDatafacturacompleto(registros)
                      let totaliva=0
                      let cantfac=0
                      let totalfac=0
                      registros.forEach(({ liquidacion_iva,total_factura }) => {totaliva += liquidacion_iva,cantfac+=1,totalfac+=total_factura})
                      setMontototaliva(totaliva)
                      setCanttotalfacturas(cantfac)
                      setGuardando(false)
                      setMontototalfacturas(totalfac)
                      
                    
                      
                      
                  }else if(respuesta === 403 || respuesta === 401){
                      
                      setGuardando(false)
                      await Handelstorage('borrar')
                      await new Promise(resolve => setTimeout(resolve, 1000))
                      setActivarsesion(false)
                  }else{
                    showDialog(true)
                    setMensajeerror( handleError(result['data']['error']))
                  }
              }else{
                const registros=estadocomponente.datalistadofactura
                if(Object.keys(registros).length>0){
                    registros.forEach((elemento) => {
                      
                      elemento.key = elemento.id;
                      elemento.recarga='no'
                    })
                }

                setDatafacturas(registros)
                setDatafacturacompleto(registros)
                let totaliva=0
                let cantfac=0
                let totalfac=0
                registros.forEach(({ liquidacion_iva,total_factura }) => {totaliva += liquidacion_iva,cantfac+=1,totalfac+=total_factura})
                setMontototaliva(totaliva)
                setCanttotalfacturas(cantfac)
                setGuardando(false)
                setMontototalfacturas(totalfac)
              }
            }
          }
          cargardatos()
          setCargacopleta(true)
          setGuardando(false)
          
        })
        return unsubscribe;
  
        }, [navigation,estadocomponente.complistado]);
    if(cargacompleta){

        return(
          <PaperProvider >

            <View style={{ flex: 1 }}>
              {guardando &&(<Procesando></Procesando>)}
              <Portal>
              
                    <Dialog visible={visibledialogo} onDismiss={hideDialog}>
                        <Dialog.Icon icon="alert-circle" size={50} color="red"/>
                        <Dialog.Title>ERROR</Dialog.Title>
                        <Dialog.Content>
                            <Text variant="bodyMedium">{mensajeerror}</Text>
                            
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={hideDialog}>OK</Button>
                            
                        </Dialog.Actions>
                    </Dialog>
              </Portal>


                <View style={[styles.cabeceracontainer,{backgroundColor:colors.card}]}>

                {!busqueda &&( 
                        <TouchableOpacity onPress={openbusqueda}>
                            
                            <FontAwesome name="search" size={24} color={colors.iconcolor}/>
                            
                        </TouchableOpacity>
                )}

                {!busqueda &&( <Text style={[styles.titulocabecera, { color: colors.textcard, fontFamily: fonts.regularbold.fontFamily}]}>Facturas Registradas</Text>)}
                {busqueda &&(

                <Animated.View style={{ borderWidth:1,backgroundColor:'rgba(28,44,52,0.1)',borderRadius:10,borderColor:'white',flexDirection: 'row',alignItems: 'center',width:'80%',opacity: fadeAnim}}>
                  <TextInput 
                        style={{color:'white',padding:5,flex: 1,fontFamily:fonts.regular.fontFamily}} 
                        placeholder="N° Factura o Empresa.."
                        placeholderTextColor='gray'
                        value={textobusqueda}
                        onChangeText={textobusqueda => realizarbusqueda(textobusqueda)}
                        >

                  </TextInput>

                  <TouchableOpacity style={{ position: 'absolute',right: 10,}} onPress={closebusqueda} >  
                    <AntDesign name="closecircleo" size={20} color={colors.iconcolor} />
                  </TouchableOpacity>
                </Animated.View>
                )
                }
                  
                {/* <TouchableOpacity style={[styles.botoncabecera,{ backgroundColor:'#57DCA3'}]} onPress={handlePress}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <FontAwesome6 name="add" size={24} color="white" />
                    </Animated.View>
                </TouchableOpacity> */}
            </View>





                <View style={styles.container}>
                  <FlatList
                    data={datafacturas}
                    renderItem={({ item }) => {
                      return (
                        <TouchableOpacity
                          style={styles.contenedordatos}
                          // onPress={() => {navigate('GastosDetalle', { item });}}
                          onPress={() => {selecionar_registro(item)  }}
                          
                        >
                          {/* Contenedor principal con alineación horizontal */}
                          <View style={styles.row}>
                            {/* Columna izquierda */}
                            <View style={{ flex: 3 }}>
                              <Text
                                style={[
                                  styles.textocontenido,
                                  { color: colors.text, fontFamily: fonts.regular.fontFamily },
                                ]}
                              >
                                N° Factura: {item.numero_factura}
                              </Text>
                              <Text
                                style={[
                                  styles.textocontenido,
                                  { color: colors.textsub, fontFamily: fonts.regular.fontFamily },
                                ]}
                              >
                                {item.NombreEmpresa}
                              </Text>
                              <Text
                                style={[
                                  styles.textocontenido,
                                  { color: colors.textsub, fontFamily: fonts.regular.fontFamily },
                                ]}
                              >
                                {item.RucEmpresa}
                              </Text>
                            </View>

                            {/* Columna derecha */}
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                              <Text
                                style={[
                                  styles.textototal,
                                  { color: colors.text, fontFamily: fonts.regularbold.fontFamily  },
                                ]}
                              >
                                Liq.: {Number(item.liquidacion_iva).toLocaleString('es-ES')}
                              </Text>
                              <Text
                                style={[
                                  styles.textocontenido,
                                  { color: colors.textsub, fontFamily: fonts.regular.fontFamily,marginTop:5 },
                                ]}
                              >
                                {Number(item.total_factura).toLocaleString('es-ES')} Gs.
                              </Text>
                              <Text
                                style={[
                                  styles.textocontenido,
                                  { color: colors.textsub, fontFamily: fonts.regular.fontFamily },
                                ]}
                              >
                                {item.fecha_factura}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                    keyExtractor={(item) => item.key}
                  />
                </View>

                <View style={styles.resumencontainer}>

                      <Text style={[styles.contenedortexto,{ color:colors.text, fontFamily: fonts.regular.fontFamily}]}>
                              <Text style={[styles.labeltext,{ fontFamily: fonts.regularbold.fontFamily}]}>Total Facturas:</Text>{' '}
                                {Number(montototalfacturas).toLocaleString('es-ES')} Gs.
                      </Text>

                      <View style={{flexDirection:'row',justifyContent: "space-between"}}>

                        <Text style={[styles.contenedortexto,{ color:colors.text, fontFamily: fonts.regular.fontFamily}]}>
                          <Text style={[styles.labeltext,{ fontFamily: fonts.regularbold.fontFamily}]}>Total Liq IVA:</Text>{' '}
                            {Number(montototaliva).toLocaleString('es-ES')} Gs.
                        </Text>
                        <Text style={[styles.contenedortexto,{ color:colors.text, fontFamily: fonts.regular.fontFamily,marginLeft:50}]}>
                          <Text style={[styles.labeltext,{ fontFamily: fonts.regularbold.fontFamily}]}>Cant Fact:</Text>{' '}
                            {Number(canttotalfacturas).toLocaleString('es-ES')}
                        </Text>
                      </View>
                      
                      
                  </View>

                
            </View>
          </PaperProvider>
        
        
      )
    
    }
}
const styles = StyleSheet.create({
   
    container: {
        flex: 1,
        padding:15
      },
      contenedordatos: {
        marginBottom: 30,
        marginRight: 5,
        overflow: 'hidden',
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Espacio entre las dos columnas
        alignItems: 'center', // Alineación vertical consistente
      },
      textocontenido: {
        fontSize: 12.5,
        marginBottom: 5,
      },
      textototal: {
        fontSize: 14,
        
      },


      botoncabecera: {
        // backgroundColor: 'blue',
        width: 40, // Define el ancho del botón
        height: 40, // Define la altura del botón
        borderRadius: 20, // Define la mitad de la dimensión del botón para obtener una forma circular
        justifyContent: 'center', // Alinea el contenido (icono) verticalmente en el centro
        alignItems: 'center', // Alinea el contenido (icono) horizontalmente en el centro
      },

      cabeceracontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        height:55
        // borderBottomWidth: 1,
        //marginTop:25,
        // backgroundColor:'rgba(42,217,142,255)' //UENO
        



        
      },
      titulocabecera: {
        flex: 1,
        fontSize: 20,
        // fontWeight: 'bold',
        textAlign: 'center',
        // color:'white'
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
        bottom:7
  
        
      },
      contenedortexto:{
        paddingBottom:10,
        fontSize:15,
        
      },

      labeltext:{
        
        fontSize:13
    },
  
})
export default ListadoFacturas