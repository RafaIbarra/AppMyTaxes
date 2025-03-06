import React, { useState,useContext,useEffect,useMemo,useCallback   } from 'react';
import { View,  StyleSheet,Text,TouchableOpacity,ScrollView,Keyboard } from 'react-native';
import { Dialog, Portal,PaperProvider,Button,DefaultTheme as PaperDefaultTheme  } from 'react-native-paper';
import { useTheme,DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
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

import {  TextInput} from 'react-native-paper';


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
    const [datafacturaedit,setDatafacturaedit]=useState([])

    const [show, setShow] = useState(false);
    const [visibledialogo, setVisibledialogo] = useState(false)
    const[mensajeerror,setMensajeerror]=useState('')
      
    const showDialog = () => setVisibledialogo(true);
    const hideDialog = () => setVisibledialogo(false);
    
    const combinedTheme = {
      ...PaperDefaultTheme, // Base de Paper
      ...NavigationDefaultTheme, // Base de Navigation
      colors: {
        ...PaperDefaultTheme.colors,
        ...NavigationDefaultTheme.colors, 
        primary: "gray",
      },
      fonts: {
        regular: { fontFamily: fonts.regular.fontFamily },
        medium: { fontFamily: fonts.regular.fontFamily },
        light: { fontFamily: fonts.regular.fontFamily },
        thin: { fontFamily: fonts.regular.fontFamily },
        bodySmall: { fontFamily: fonts.regular.fontFamily }, 
        bodyLarge: { fontFamily: fonts.regular.fontFamily }, // 🚀 Agregamos esta variante
      },
    };
    const formatFactura = (text) => {
      return text
        .replace(/\D/g, "") // Elimina todo lo que no es número
        .replace(/^(\d{3})(\d{0,3})(\d{0,17})$/, (match, p1, p2, p3) => {
          let result = p1;
          if (p2) result += `-${p2}`;
          if (p3) result += `-${p3}`;
          return result;
        });
    };
    const formatMonto = (text) => {
      
      const numericValue = text.replace(/\./g, "");
      const result=numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleFacturaChange = (text) => {
      setNrofactura(formatFactura(text)); // Aplica el formato y actualiza el estado
    };

   
    const handleFormateoNumero=(text,funcion)=>{
      funcion(formatMonto(text))
    }


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
          cdcarchivo:'0',
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
     
        //volver()
        // navigate("MainTabs2", { })
        
        //navigation.goBack();
        }


    }

    const calculo_iva10=(valor)=>{
      setArticulos10(valor)
      
      const numericValue = parseFloat(valor.replace(/\./g, "")) || 0;
      const i10 = Math.round(numericValue / 11);
      const resulti10=i10===0 ? '' : i10.toString()
  
      setIva10(formatMonto(resulti10))

      const art5=parseFloat(articulos5.replace(/\./g, "")) || 0
      const artexenta=parseFloat(articulosexenta.replace(/\./g, "")) || 0
      const caltotalfac=art5 + artexenta +numericValue
      const resultotal=caltotalfac===0 ? '' : caltotalfac.toString()

      setTotalfactura(formatMonto(resultotal))

      const iv5=parseFloat(iva5.replace(/\./g, "")) || 0
      const totiva=i10 +iv5
      const resulttotaliva=totiva===0 ? '' : totiva.toString()
      setTotaliva(formatMonto(resulttotaliva))
      

    }

    const calculo_iva5=(valor)=>{
      setArticulos5(valor)
      const numericValue = parseFloat(valor.replace(/\./g, "")) || 0;
      const i5 = Math.round(numericValue / 21);
      const resulti5=i5===0 ? '' : i5.toString()
      setIva5(formatMonto(resulti5))

      const art10=parseFloat(articulos10.replace(/\./g, "")) || 0
      const artexenta=parseFloat(articulosexenta.replace(/\./g, "")) || 0
      const caltotalfac=art10 + artexenta +numericValue
      
      setTotalfactura(formatMonto(caltotalfac===0 ? '' :  caltotalfac.toString()))

      const iv10=parseFloat(iva10.replace(/\./g, "")) || 0
      const totiva=i5 +iv10
      setTotaliva(formatMonto(totiva===0 ? '' : totiva.toString()))
      

    }
    const calculo_exenta=(valor)=>{
      setArticulosexenta(valor)
      const numericValue = parseFloat(valor.replace(/\./g, "")) || 0;
      
      const art10=parseFloat(articulos10.replace(/\./g, "")) || 0
      const art5=parseFloat(articulos5.replace(/\./g, "")) || 0
      const caltotalfac=art5 + art10 +numericValue
      setTotalfactura(formatMonto(caltotalfac===0 ? '' : caltotalfac.toString()))


      

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
      
      if(estadocomponente.factura_editar >0){
        setTitle('EDITAR FACTURA')
        setBackto('DetalleFactura')
        setTituloboton('ACTUALIZAR')
        setCodigofacturaoperacion(estadocomponente.factura_editar)
        const valores_factura=estadocomponente.datafactura
        setDatafacturaedit(valores_factura)
        

        const totOpeItem10 = Object.values(valores_factura.DetalleFactura).find(
          (item) => item.concepto === "Articulos al 10%"
        )?.total || 0;
        const ent_item10=parseInt(totOpeItem10, 10)

        calculo_iva10(ent_item10 === 0 ? '' : ent_item10.toString())
        
        setArticulos10(formatMonto(ent_item10 === 0 ? '' : ent_item10.toString()));



        const totOpeItem5 = Object.values(valores_factura.DetalleFactura).find(
          (item) => item.concepto === "Articulos al 5%"
        )?.total || 0;
        const ent_item5=parseInt(totOpeItem5, 10)
        calculo_iva5(ent_item5 === 0 ? '' : ent_item5.toString())
        setArticulos5(formatMonto(ent_item5 === 0 ? '' : ent_item5.toString()));

        const totOpeItemExenta = Object.values(valores_factura.DetalleFactura).find(
          (item) => item.concepto === "Articulos exenta"
        )?.total || 0;
        const ent_itemexenta=parseInt(totOpeItemExenta, 10)
        setArticulosexenta(formatMonto(ent_itemexenta === 0 ? '' : ent_itemexenta.toString()));


        // // const liqiva10=estadocomponente.datafactura.DataMontos.liq_iva10.toString()

        
        // const liqiva10 = estadocomponente.datafactura.DataMontos.liq_iva10? estadocomponente.datafactura.DataMontos.liq_iva10.toString(): '';
        // setIva10(liqiva10)

        // const liqiva5 = estadocomponente.datafactura.DataMontos.liq_iva5? estadocomponente.datafactura.DataMontos.liq_iva5.toString(): '';
        // setIva5(liqiva5)

        //const totiva = estadocomponente.datafactura.DataMontos.total_iva? estadocomponente.datafactura.DataMontos.total_iva.toString(): '';
        setTotaliva(valores_factura.liquidacion_iva)

        // const totope = estadocomponente.datafactura.DataMontos.total_operacion? estadocomponente.datafactura.DataMontos.total_operacion.toString(): '';
        setTotalfactura(valores_factura.total_factura)
        
        // // 

        setNrofactura(valores_factura.numero_factura)
        setFechafactura(convertirFecha(valores_factura.fecha_factura))
        setRuc(valores_factura.RucEmpresa.slice(0, -2))
        setDiv(valores_factura.RucEmpresa.slice(-1))
        setEmpresa(valores_factura.NombreEmpresa)
        setEmpresaeditable(false)

      }

    }, [estadocomponente.factura_editar])

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
          ; // Muestra el Tab cuando el teclado se oculta
          actualizarEstadocomponente('isKeyboardVisible',false)
        }
      );
  
      // Limpiar los listeners cuando el componente se desmonte
      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, []);

    const text_paper_backgroundcolor="transparent"
    const text_paper_backgroundcolor_inactivo="#DEDDDC"
    const text_paper_primary="#91918F"
    const text_paper_roundness=10
    const text_paper_font=fonts.regular.fontFamily
    const text_paper_height=40

   
    

    return(

       <PaperProvider theme={combinedTheme}>

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
                                                ID Operacion: {datafacturaedit.id}; {datafacturaedit.fecha_registro}; {datafacturaedit.tipo_registro}
                                              </Text>
                                        </View>
                                        )
                  
                                      }
                  <View style={styles.contenedorruc}>

                    <View style={{flex: 3,marginRight:10}}>
                      
                      <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="Ruc Empresa"
                          placeholder="Ruc Empresa"
                          value={ruc}
                          onChangeText={setRuc}
                          onBlur ={() => consulta_ruc()}
                          keyboardType={"numeric"} 
                        />



                    </View>

                    <View style={{flex: 1,}}>
                      
                      <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="Div"
                          placeholder="Div"
                          value={div}
                          onChangeText={setDiv}
                          onBlur ={() => consulta_ruc()}
                          keyboardType={"numeric"} 
                        />

                    </View>
                  </View>

                  <View style={{ marginTop: 15,}}>
                    <TextInput
                        theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                        style={{
                          fontFamily:  text_paper_font,
                          backgroundColor: empresaeditable ?text_paper_backgroundcolor : text_paper_backgroundcolor_inactivo,
                          height:text_paper_height,
                        }}
                        mode="outlined"
                        label="Nombre Empresa"
                        placeholder="Nombre Empresa"
                        value={empresa}
                        onChangeText={setEmpresa}
                        editable={empresaeditable}
                      />
                  </View> 
                 
                  <View style={{ marginTop: 15,}}>
                   
                        <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="N° Factura"
                          placeholder="N° Factura"
                          value={nrofactura}
                          onChangeText={handleFacturaChange}
                          keyboardType={"numeric"} 
                        />
                  </View>

                  <View style={[styles.contenedorruc,{marginTop: 15,}]}>

                    <View style={{flex: 2,}}>

                      

                      <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="Fecha Factura"
                          placeholder="Fecha Factura"
                          value={moment(fechafactura).format('DD/MM/YYYY')} // Esto se asegura de que siempre pase un valor a la prop
                          
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

                  
                  <View style={[styles.contenedorruc,{ marginTop: 15,}]}>

                      <View style={{flex: 4,marginRight:10}} >
                        
                        <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="Artículos al 10%"
                          placeholder="Artículos al 10%"
                          value={articulos10}

                          onChangeText={(text) => handleFormateoNumero(text, setArticulos10)}
                          
                          onBlur ={() => calculo_iva10(articulos10)}
                          keyboardType={"numeric"} 
                        />
                        
                    

                        
                      </View>

                      <View style={{flex: 3,marginRight:10}} >
                        {/* <CustomTextInput
                          placeholder="Iva 10%"
                          value={iva10} // Esto se asegura de que siempre pase un valor a la prop
                          onChangeText={setIva10}
                          formato = "numerico"
                        /> */}
                        <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="Iva 10%"
                          placeholder="Iva 10%"
                          value={iva10}
                          onChangeText={(text) => handleFormateoNumero(text, setIva10)}
                          keyboardType={"numeric"} 
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
                  <View  style={[styles.contenedorruc,{ marginTop: 15,}]}>
                  
                      <View style={{flex: 4,marginRight:10}} >
                        
                        <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="Artículos al 5%"
                          placeholder="Artículos al 5%"
                          value={articulos5}
                          onChangeText={(text) => handleFormateoNumero(text, setArticulos5)}
                          
                          onBlur ={() => calculo_iva5(articulos5)}
                          keyboardType={"numeric"} 
                        />


                      </View>
                      
                      <View style={{flex: 3,marginRight:10}} >
                        
                        <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="Iva 5%"
                          placeholder="Iva 5%"
                          value={iva5}
                          
                          onChangeText={(text) => handleFormateoNumero(text, setIva5)}
                          keyboardType={"numeric"} 
                        />
                      </View>
                     
                  </View>
                  
                  <View  style={[styles.contenedorruc,{ marginTop: 15,}]}>
                  
                      <View style={{flex: 7,marginRight:10}} >
                        

                        <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="Articulos a Exenta"
                          placeholder="Articulos a Exenta"
                          value={articulosexenta}
                          
                          onChangeText={(text) => handleFormateoNumero(text, setArticulosexenta)}
                          onBlur ={() => calculo_exenta(articulosexenta)}
                          keyboardType={"numeric"} 
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
                  <View  style={[styles.contenedorruc,{ marginTop: 15,}]}>

                      <View style={{flex: 4,marginRight:10}}>
                      
                        
                        <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="Total Factura"
                          placeholder="Total Factura"
                          value={totalfactura}
                          
                          onChangeText={(text) => handleFormateoNumero(text, setTotalfactura)}
                          keyboardType={"numeric"} 
                        />



                      </View>
                      <View style={{flex: 3,marginRight:10}} >
                        
                        <TextInput
                          theme={{colors: { primary:text_paper_primary },roundness: text_paper_roundness,}}
                          style={{
                            fontFamily:  text_paper_font,
                            backgroundColor:text_paper_backgroundcolor,
                            height:text_paper_height,
                          }}
                          mode="outlined"
                          label="Total IVA"
                          placeholder="Total IVA"
                          value={totaliva}
                          onChangeText={(text) => handleFormateoNumero(text, setTotaliva)}
                          keyboardType={"numeric"} 
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
      marginTop:10
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
