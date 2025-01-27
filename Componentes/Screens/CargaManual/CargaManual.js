import React, { useState,useContext,useEffect } from 'react';
import { View,  StyleSheet,Text,TouchableOpacity,ScrollView } from 'react-native';
import { Dialog, Portal,PaperProvider,Button } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from 'moment';


import ScreensCabecera from '../../ScreensCabecera/ScreensCabecera';
import CustomTextInput from '../../CustomTextInput/CustomTextInput';

import Generarpeticion from '../../../Apis/peticiones';
import Handelstorage from '../../../Storage/handelstorage';
import { AuthContext } from '../../../AuthContext';

import LottieView from 'lottie-react-native';
import { AntDesign } from '@expo/vector-icons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createIconSetFromFontello } from 'react-native-vector-icons';




function CargaManual({ navigation }){
    const[title,setTitle]=useState('CARGA MANUAL')
    const[backto,setBackto]=useState('MainTabs2')
    const[tituloboton,setTituloboton]=useState('REGISTRAR')

    // const[backto,setBackto]=useState('DetalleFactura')
    
    const { activarsesion, setActivarsesion } = useContext(AuthContext);
    const { estadocomponente } = useContext(AuthContext);
    const {  actualizarEstadocomponente } = useContext(AuthContext);
    const {  recargar_componentes } = useContext(AuthContext);
    const { colors,fonts } = useTheme();

    const [codigofacturaoperacion,setCodigofacturaoperacion]=useState(0)
    const [ruc, setRuc] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [empresaeditable,setEmpresaeditable]=useState(true)
    const [div, setDiv] = useState('');
    const [nrofactura, setNrofactura] = useState('');
    const [fechafactura, setFechafactura] = useState(new Date());
    const [articulos10,setArticulos10]=useState('')
    const [iva10,setIva10]=useState('')
    const [articulos5,setArticulos5]=useState('')
    const [iva5,setIva5]=useState('')
    const [articulosexenta,setArticulosexenta]=useState('')
    const [totaliva,setTotaliva]=useState('')
    const [totalfactura,setTotalfactura]=useState('')

    const [show, setShow] = useState(false);
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

    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate || fechafactura;
      setShow(false); // Para iOS, mantener el picker abierto
      setFechafactura(currentDate); // Guardar la fecha seleccionada
      
    };
    const volver=()=>{
      
      navigation.navigate('MainTabs2', {
        screen: 'ListadoFacturas', // Nombre exacto de la pantalla en el Tab
      });
      
    }
  
    const showDatePicker =  () => {
      
      setShow(true); // Mostrar el picker
    };
    const registrar=  async()=>{
        if (codigofacturaoperacion>0){
          actualizarEstadocomponente('tituloloading','ACTUALIZANDO DATOS FACTURA..')
        }else{

          actualizarEstadocomponente('tituloloading','REGISTRANDO FACTURA MANUAL..')
        }
         actualizarEstadocomponente('loading',true)
        //console.log(parseFloat(articulos10.replace(/\./g, "")) || 0)
        const detallefactura = [
          {
            concepto:'Articulos al 10%',
            cantidad:'1',
            //total: parseFloat(articulos10.replace(/\./g, "")) || 0
            total: typeof articulos10 === "string" ? parseFloat(articulos10.replace(/\./g, "")) || 0 : 0
          },
          {
            concepto:'Articulos al 5%',
            cantidad:'1',
            //total: parseFloat(articulos5.replace(/\./g, "")) || 0
            total: typeof articulos5 === "string" ? parseFloat(articulos5.replace(/\./g, "")) || 0 : 0
          },
          {
            concepto:'Articulos exenta',
            cantidad:'1',
            //total: parseFloat(articulosexenta.replace(/\./g, "")) || 0
            total: typeof articulosexenta === "string" ? parseFloat(articulosexenta.replace(/\./g, "")) || 0 : 0
          }

        ]
       // console.log(detallefactura)
        const jsonData = JSON.stringify(detallefactura);
        const fechaFormateada= moment(fechafactura).format('YYYY-MM-DD')
        const datosregistrar = {
          codfactura:codigofacturaoperacion,
          rucempresa:ruc+'-'+div,
          nombreempresa:empresa,
          numero_factura:nrofactura,
          fecha_factura:fechaFormateada,
          //total_factura: Number(totalfactura.replace(/\./g, "")) || 0,
          total_factura:  typeof totalfactura === "string" ? parseFloat(totalfactura.replace(/\./g, "")) || 0 : 0,
          //iva10:Number(iva10.replace(/\./g, "")) || 0,  
          iva10:  typeof iva10 === "string" ? parseFloat(iva10.replace(/\./g, "")) || 0 : 0,
          //iva5:Number(iva5.replace(/\./g, "")) || 0, 
          iva5:  typeof iva5 === "string" ? parseFloat(iva5.replace(/\./g, "")) || 0 : 0,
          //liquidacion_iva:Number(totaliva.replace(/\./g, "")) || 0, 
          liquidacion_iva:  typeof totaliva === "string" ? parseFloat(totaliva.replace(/\./g, "")) || 0 : 0,
          cdc:'0',
          detallefactura:jsonData,
          tiporegistro:'MANUAL'
          
        };
        const endpoint='RegistroFactura/'
        const result = await Generarpeticion(endpoint, 'POST', datosregistrar);
        actualizarEstadocomponente('tituloloading','')
        actualizarEstadocomponente('loading',false)
        const respuesta=result['resp']
        if (respuesta === 200) {
          recargar_componentes()
          volver()
          // reiniciarvalorestransaccion()
          // item.recarga='si'
      

          // navigation.goBack();
          
        } else if(respuesta === 403 || respuesta === 401){

          await Handelstorage('borrar')
          setActivarsesion(false)
          
        } else{
          
          showDialog(true)
          
          setMensajeerror( handleError(result['data']['error']))
        //console.log(result['data']['error'])
        //volver()
        // navigate("MainTabs2", { })
        
        //navigation.goBack();
        }


    }

    const calculo_iva10=(valor)=>{
      setArticulos10(valor)
      const numericValue = parseFloat(valor.replace(/\./g, "")) || 0;
      const i10 = Math.round(numericValue / 11);
      
      
      setIva10(i10===0 ? '' : i10.toString())
      const art5=parseFloat(articulos5.replace(/\./g, "")) || 0
      const artexenta=parseFloat(articulosexenta.replace(/\./g, "")) || 0
      const caltotalfac=art5 + artexenta +numericValue


      setTotalfactura(caltotalfac===0 ? '' : caltotalfac.toString())

      const iv5=parseFloat(iva5.replace(/\./g, "")) || 0
      const totiva=i10 +iv5
      setTotaliva(totiva===0 ? '' : totiva.toString())
      

    }

    const calculo_iva5=(valor)=>{
      setArticulos5(valor)
      const numericValue = parseFloat(valor.replace(/\./g, "")) || 0;
      const i5 = Math.round(numericValue / 21);
      
      
      setIva5(i5===0 ? '' : i5.toString())
      const art10=parseFloat(articulos10.replace(/\./g, "")) || 0
      const artexenta=parseFloat(articulosexenta.replace(/\./g, "")) || 0
      const caltotalfac=art10 + artexenta +numericValue
      setTotalfactura(caltotalfac===0 ? '' :  caltotalfac.toString())

      const iv10=parseFloat(iva10.replace(/\./g, "")) || 0
      const totiva=i5 +iv10
      setTotaliva(totiva===0 ? '' : totiva.toString())
      

    }
    const calculo_exenta=(valor)=>{
      setArticulosexenta(valor)
      const numericValue = parseFloat(valor.replace(/\./g, "")) || 0;
      
      const art10=parseFloat(articulos10.replace(/\./g, "")) || 0
      const art5=parseFloat(articulos5.replace(/\./g, "")) || 0
      const caltotalfac=art5 + art10 +numericValue
      setTotalfactura(caltotalfac===0 ? '' : caltotalfac.toString())


      

    }

    const  consulta_ruc = async()=>{
   
     if (ruc && div){
        
        const body={
          rucempresa:ruc+'-'+div
        }
        const endpoint='ListaEmpresas/'
        const result = await Generarpeticion(endpoint, 'POST', body);
        const respuesta=result['resp']
        
        if (respuesta === 200){
            const registros=result['data']
            
            if (registros && registros.length > 0) {
              setEmpresaeditable(false)
              setEmpresa(registros[0].nombre_empresa)
            } else {
              setEmpresaeditable(true)
              setEmpresa('')
            }
          
            
            
        }else if(respuesta === 403 || respuesta === 401){
            
            setGuardando(false)
            await Handelstorage('borrar')
            await new Promise(resolve => setTimeout(resolve, 1000))
            setActivarsesion(false)
        }
      }
      
    }
    const convertirFecha = (fechaString) => {
      const [dia, mes, año] = fechaString.split("/").map(Number); // Divide y convierte a números
      return new Date(año, mes - 1, dia); // Los meses en JavaScript son base 0, por eso restamos 1
    };
    useEffect(() => {
      // console.log('carga manual')
      // console.log(estadocomponente.factura_editar)
      if(estadocomponente.factura_editar >0){
        setTitle('EDITAR FACTURA')
        setBackto('DetalleFactura')
        setTituloboton('ACTUALIZAR')
        setCodigofacturaoperacion(estadocomponente.factura_editar)
        // console.log(estadocomponente.datafactura)

        const totOpeItem10 = Object.values(estadocomponente.datafactura.Conceptos).find(
          (item) => item.dDesProSer === "Articulos al 10%"
        )?.dTotOpeItem || 0;
        const ent_item10=parseInt(totOpeItem10, 10)
        setArticulos10(ent_item10 === 0 ? '' : ent_item10.toString());



        const totOpeItem5 = Object.values(estadocomponente.datafactura.Conceptos).find(
          (item) => item.dDesProSer === "Articulos al 5%"
        )?.dTotOpeItem || 0;
        const ent_item5=parseInt(totOpeItem5, 10)
        setArticulos5(ent_item5 === 0 ? '' : ent_item5.toString());

        const totOpeItemExenta = Object.values(estadocomponente.datafactura.Conceptos).find(
          (item) => item.dDesProSer === "Articulos exenta"
        )?.dTotOpeItemm || 0;
        const ent_itemexenta=parseInt(totOpeItemExenta, 10)
        
        setArticulosexenta(ent_itemexenta === 0 ? '' : ent_itemexenta.toString());

        setIva10(estadocomponente.datafactura.DataMontos.liq_iva10.toString())
        setIva5(estadocomponente.datafactura.DataMontos.liq_iva5.toString())
        setTotaliva(estadocomponente.datafactura.DataMontos.total_iva.toString())
        setTotalfactura(estadocomponente.datafactura.DataMontos.total_operacion.toString())

        setNrofactura(estadocomponente.datafactura.DataFactura.NroFactura)
        setFechafactura(convertirFecha(estadocomponente.datafactura.DataFactura.FechaOperacion))
        setRuc(estadocomponente.datafactura.DataEmpresa.NroRuc.slice(0, -2))
        setDiv(estadocomponente.datafactura.DataEmpresa.NroRuc.slice(-1))
        setEmpresa(estadocomponente.datafactura.DataEmpresa.Empresa)
        setEmpresaeditable(false)

      }

    }, [estadocomponente.factura_editar])

    return(

       <PaperProvider >

          <View style={[styles.container,{backgroundColor:colors.background}]}>
              <ScreensCabecera title={title} backto={backto}></ScreensCabecera>
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

              <ScrollView style={{padding:10}}>
                  {estadocomponente.factura_editar>0 &&(
                                        
                                        <View style={{ marginLeft: '5%', marginRight:'5%',marginBottom:10 }}>
                                              <Text 
                                                style={{
                                                  color: 'red',
                                                  backgroundColor: colors.backgroundInpunt,
                                                  fontFamily: fonts.regularbold.fontFamily,
                                                  fontSize: 13,
                                                  borderTopWidth: 1, // Línea superior
                                                  borderTopColor: '#57DCA3', // Color de la línea superior
                                                  borderBottomWidth: 1, // Línea inferior
                                                  borderBottomColor: '#57DCA3', // Color de la línea inferior
                                                  paddingVertical: 5, // Espaciado para separar el texto de las líneas
                                                  paddingLeft:5
                                                }}
                                              >
                                                ID Operacion: {estadocomponente.datafactura.Datosregistro.IdOperacion}; {estadocomponente.datafactura.Datosregistro.Fecharegistro}; {estadocomponente.datafactura.Datosregistro.FormaRegistro}
                                              </Text>
                                        </View>
                                        )
                  
                                      }
                  <View style={styles.contenedorruc}>

                    <View style={{flex: 3,marginRight:10}}>
                      <CustomTextInput
                        placeholder="Ruc Empresa"
                        value={ruc} // Esto se asegura de que siempre pase un valor a la prop
                        onChangeText={setRuc}
                        onBlur={consulta_ruc} 
                      />
                    </View>

                    <View style={{flex: 1,}}>
                      <CustomTextInput
                        placeholder="Div"
                        value={div} // Esto se asegura de que siempre pase un valor a la prop
                        onChangeText={setDiv}
                        onBlur={consulta_ruc} 
                      />
                    </View>
                  </View>

                  <View >
                    <CustomTextInput
                      placeholder="Nombre Empresa"
                      value={empresa} // Esto se asegura de que siempre pase un valor a la prop
                      onChangeText={setEmpresa}
                      editable={empresaeditable}
                    />
                  </View>
                  <View >
                    <CustomTextInput
                      placeholder="N° Factura"
                      value={nrofactura} // Esto se asegura de que siempre pase un valor a la prop
                      onChangeText={setNrofactura}
                      formato = "factura"
                    />
                  </View>

                  <View style={styles.contenedorruc}>

                    <View style={{flex: 2,}}>

                      <CustomTextInput
                          placeholder="Fecha Factura"
                          value={moment(fechafactura).format('DD/MM/YYYY')} // Esto se asegura de que siempre pase un valor a la prop
                          // onChangeText={setFechafactura}
                        />
                    </View>
                    <View style={{flex: 3,}}>

                      <TouchableOpacity 
                          style={styles.botonfecha} onPress={showDatePicker}>         
                          <AntDesign name="calendar" size={35} color={colors.acctionsbotoncolor} />
                      </TouchableOpacity>
                    </View>
                    {show && (
                      <DateTimePicker
                        value={fechafactura}
                        mode="date" // Puede ser "date", "time" o "datetime"
                        display="default" // Opciones: "default", "spinner", "calendar" (varía según el SO)
                        onChange={onChange}
                      />
                    )}
                  </View>

                  
                  <View style={styles.contenedorruc}>

                      <View style={{flex: 4,marginRight:10}} >
                        <CustomTextInput
                          placeholder="Articulos al 10%"
                          value={articulos10} // Esto se asegura de que siempre pase un valor a la prop
                          onChangeText={(text) => {
                            // Remover ceros iniciales
                            const sanitizedValue = text.replace(/^0+/, "");
                            setArticulos10(sanitizedValue);
                            calculo_iva10(sanitizedValue); // Llamar a la función con el valor procesado
                          }}
                          onBlur={() => calculo_iva10(articulos10)}
                          formato = "numerico"
                        />
                      </View>

                      <View style={{flex: 3,marginRight:10}} >
                        <CustomTextInput
                          placeholder="Iva 10%"
                          value={iva10} // Esto se asegura de que siempre pase un valor a la prop
                          onChangeText={setIva10}
                          formato = "numerico"
                        />
                      </View>
                      {/* <View style={{flex: 1,}}>

                        <TouchableOpacity 
                            style={styles.botonfecha}
                            onPress={showDatePicker}>         
                            <Ionicons name="calculator-outline" size={35} color={colors.acctionsbotoncolor} />
                        </TouchableOpacity>
                      </View> */}
                  </View>
                  <View style={styles.contenedorruc}>
                  
                      <View style={{flex: 4,marginRight:10}} >
                        <CustomTextInput
                          placeholder="Articulos al 5%"
                          value={articulos5} // Esto se asegura de que siempre pase un valor a la prop
                          onChangeText={(text) => {
                            // Remover ceros iniciales
                            const sanitizedValue = text.replace(/^0+/, "");
                            setArticulos5(sanitizedValue);
                            calculo_iva5(sanitizedValue); // Llamar a la función con el valor procesado
                          }}
                          onBlur={() => calculo_iva5(articulos5)}
                          formato = "numerico"
                        />
                      </View>
                      
                      <View style={{flex: 3,marginRight:10}} >
                        <CustomTextInput
                          placeholder="Iva 5%"
                          value={iva5} // Esto se asegura de que siempre pase un valor a la prop
                          onChangeText={setIva5}
                          formato = "numerico"
                        />
                      </View>
                      {/* <View style={{flex: 1,}}>

                        <TouchableOpacity 
                            style={styles.botonfecha}
                            onPress={showDatePicker}>         
                            <Ionicons name="calculator-outline" size={35} color={colors.acctionsbotoncolor} />
                        </TouchableOpacity>
                      </View> */}
                  </View>
                  
                  <View style={styles.contenedorruc}>
                  
                      <View style={{flex: 7,marginRight:10}} >
                        <CustomTextInput
                          placeholder="Articulos a Exenta"
                          value={articulosexenta} // Esto se asegura de que siempre pase un valor a la prop
                          onChangeText={(text) => {
                            // Remover ceros iniciales
                            const sanitizedValue = text.replace(/^0+/, "");
                            setArticulosexenta(sanitizedValue);
                            calculo_exenta(sanitizedValue); // Llamar a la función con el valor procesado
                          }}
                          onBlur={() => calculo_exenta(articulosexenta)}
                          formato = "numerico"
                        />
                      </View>

                      
                      {/* <View style={{flex: 1,}}>

                        <TouchableOpacity 
                            style={styles.botonfecha}
                            onPress={showDatePicker}>         
                            <Ionicons name="calculator-outline" size={35} color={colors.acctionsbotoncolor} />
                        </TouchableOpacity>
                      </View> */}
                  </View>
                  <View style={styles.contenedorruc}>

                      <View style={{flex: 4,marginRight:10}}>
                      
                        <CustomTextInput
                          placeholder="Total Factura"
                          value={totalfactura} // Esto se asegura de que siempre pase un valor a la prop
                          onChangeText={setTotalfactura}
                          formato = "numerico"
                        />
                      </View>
                      <View style={{flex: 3,marginRight:10}} >
                        <CustomTextInput
                          placeholder="Total IVA"
                          value={totaliva} // Esto se asegura de que siempre pase un valor a la prop
                          onChangeText={setTotaliva}
                          formato = "numerico"
                        />
                      </View>
                  </View>

                  


                  <View style={{ flex: 1 }}>
        

                      <TouchableOpacity 
                        style={{ 
                          // position: 'absolute',
                        // bottom: 30, // Margen de 10 píxeles sobre la barra inferior del celular
                          //left: 10,   // Margen izquierdo (ajústalo si quieres centrar el botón)
                          //right: 10,  // Margen derecho para ajustar el tamaño dinámico
                          top:10,
                          backgroundColor: colors.acctionsbotoncolor, 
                          height: 40,
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          borderRadius: 20,
                          flexDirection: 'row',
                          paddingHorizontal: 10,
                        }} 
                        onPress={registrar}
                      >
                        <Text style={{
                          fontSize: 16,
                          color: 'black', 
                          fontFamily: fonts.regularbold.fontFamily,
                          marginRight: 8, 
                        }}>
                          {tituloboton}
                        </Text>
                        <MaterialIcons name="save-alt" size={24} color="black" />
                      </TouchableOpacity>
                  </View>
                  
              </ScrollView>


            
          </View>
       </PaperProvider>

   
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      
    },
    contenedorruc:{
      flexDirection: "row", // Coloca los hijos en fila
      width: "100%",
      justifyContent: "space-between",
    },
    botonfecha:{
      width: 50, 
      height: 35, 

      marginLeft:'5%',
      marginTop:20
      // marginBottom:27
    },

   
    texto:{
        marginTop:1,
        fontSize:20
    },
    textocontenido: {
      fontSize: 12.5,
      marginBottom: 5,
    },
    containerTextInput: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      
      
    },
    
  });
  
export default CargaManual
