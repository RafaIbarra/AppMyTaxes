import React, { useContext, useState, useEffect } from 'react';
import {  StyleSheet,View,TouchableOpacity,TextInput,Text,ScrollView,Dimensions  } from "react-native";
import { DataTable,Dialog, Portal,PaperProvider,Button } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';

import { AuthContext } from '../../../AuthContext';
import { useNavigation  } from "@react-navigation/native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

import ScreensCabecera from '../../ScreensCabecera/ScreensCabecera';
import ScreensCabeceraRegistro from '../../ScreensCabeceraRegistro/ScreensCabeceraRegistro';
import Generarpeticion from '../../../Apis/peticiones';


function DetalleFactura({ navigation }){
    const [title,setTitle]=useState('DETALLE FACTURA')
    const [backto,setBackto]=useState('MainTabs2')
    const { colors,fonts } = useTheme();
    const { estadocomponente } = useContext(AuthContext);
    const {  actualizarEstadocomponente } = useContext(AuthContext);
    const {  recargar_componentes } = useContext(AuthContext);
    const { activarsesion, setActivarsesion } = useContext(AuthContext);

    const [detallefactura,setDetallefactura]=useState()
    const [nombreempresa,setNombreempresa]=useState('')
    const [rucempresa,setRucempresa]=useState('')
    const [fechaoperacion,setFechaoperacion]=useState('')
    const [nrofactura,setNrofactura]=useState('')
    const [conceptos,setConceptos]=useState('')
    const [cantidadconceptos,setCantidadconceptos]=useState(0)
    const [liqiva10,setLiqiva10]=useState('')
    const [datamontos,setDatamontos]=useState({
      total_operacion: 0,
      liq_iva10: 0,
      liq_iva5: 0,
      total_iva:0
    })
    const [cdcarchivo,setCdcarchivo]=useState('')
    
    const { navigate } = useNavigation();

    
    const [modoedicion,setModoedicion]=useState(false)
    const [visibledialogo, setVisibledialogo] = useState(false)
    const[mensajeerror,setMensajeerror]=useState('')
    const showDialog = () => setVisibledialogo(true);
    const hideDialog = () => setVisibledialogo(false);


    const [visibledialogoeliminar, setVisibledialogoeliminar] = useState(false)
    const showDialogeliminar = () => setVisibledialogoeliminar(true);
    const hideDialogeliminar = () => setVisibledialogoeliminar(false);

    const { height } = Dimensions.get('window');

    const handleError = (errorObject) => {
      if (typeof errorObject === "object" && errorObject !== null) {
        return Object.entries(errorObject)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("\n");
      }
      return String(errorObject); // Si no es objeto, lo convierte a string directamente
    };


    const volver=()=>{
      
      // navigation.navigate('MainTabs2', {
      //   screen: 'ListadoFacturas', // Nombre exacto de la pantalla en el Tab
      // });
      
      navigation.goBack();
      
    }
    const editar_registro =()=>{
      
      
      if(detallefactura.tipo_registro.toLowerCase()==='manual'){
        
        // navigation.navigate('StackCargaOpciones', {
        //   screen: 'Manual', // Nombre exacto de la pantalla en el Tab
        // });
        navigate("EditarFactura")
      }else{
        //console.log('NO SE PUEDE EDITAR')
        showDialog(true)
        setMensajeerror( 'Solo las facturas cargadas en forma manual se pueden editar')
      }
    }
    
    const confimareliminacion = async()=>{
      actualizarEstadocomponente('tituloloading','ELIMINANDO FACTURA..')
      actualizarEstadocomponente('loading',true)
      const data_del=estadocomponente.factura_editar
      const fac_del=String(data_del)
      const datoseliminar = {
        facturaseliminar:[fac_del,],};
  
  
      const endpoint='EliminarFactura/'
      const result = await Generarpeticion(endpoint, 'POST', datoseliminar);
      actualizarEstadocomponente('tituloloading','')
      actualizarEstadocomponente('loading',false)
      const respuesta=result['resp']
      if (respuesta === 200) {
        hideDialogeliminar()
        recargar_componentes()
        volver()
        //setRecargadatos(!recargadatos)
          
      } else if(respuesta === 403 || respuesta === 401){
        await Handelstorage('borrar')
        setActivarsesion(false)
  
      }else{
        hideDialogeliminar()
        showDialog(true)
        setMensajeerror( result['data']['error'])
      }

    }

    const registrar= async ()=>{
      actualizarEstadocomponente('tituloloading','REGISTRANDO FACTURA..')
      actualizarEstadocomponente('loading',true)
      const detallefactura = conceptos.map(item => ({
        concepto: item.concepto,
        cantidad: item.cantidad,
        total: Number(item.total)
      }));
      
      const jsonData = JSON.stringify(detallefactura);
      const [dia, mes, anio] = fechaoperacion.split('/');
      const fechaFormateada = `${anio}-${mes}-${dia}`
      const datosregistrar = {
        codfactura:0,
        rucempresa:rucempresa,
        nombreempresa:nombreempresa,
        numero_factura:nrofactura,
        fecha_factura:fechaFormateada,

        total_factura:datamontos.total_operacion,
        iva10:datamontos.liq_iva10,
        iva5:datamontos.liq_iva5,
        liquidacion_iva:datamontos.total_iva,

        cdc:estadocomponente.datocdc.nombrecdc,
        cdcarchivo:cdcarchivo,
        detallefactura:jsonData,
        tiporegistro:'QR'
        
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
        //setGuardando(false)



    }



    // const convertirFecha = (fechaISO) => {
    //     const fecha = new Date(fechaISO);
    //     const dia = String(fecha.getDate()).padStart(2, '0');
    //     const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    //     const año = fecha.getFullYear();
    //     return `${dia}/${mes}/${año}`;
    //   };

    const convertirFecha = (fecha) => {
      // Verificar si la fecha está en formato ISO (2024-10-30T00:00:00)
      const esFechaISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(fecha);
    
      // Si la fecha no está en formato ISO, devolverla tal como está
      if (!esFechaISO) {
        return fecha;
      }
    
      // Si es formato ISO, convertirla
      const date = new Date(fecha);
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const año = date.getFullYear();
      return `${dia}/${mes}/${año}`;
    };
    const textoempresa=(valor)=>{
        setNombreempresa(valor)
   
      }
      const from = 0;
      const to = 10;
      const tamañoletratabla=10
      const tamañoletraheadertabla=12
    useEffect(() => {
        
        
        
        if(estadocomponente.factura_editar >0){
        
          setModoedicion(true)
          
        }else{
          setModoedicion(false)
          
        }
        let cargardetalle=true
        
        const datacontrol=estadocomponente?.datafactura || {};
        
        if (Array.isArray(datacontrol) && datacontrol.length === 0) {
          cargardetalle=false
        }
        if (datacontrol && Object.keys(datacontrol).length=== 0) {
          cargardetalle=false
        }
        if(cargardetalle){
          const data = estadocomponente?.datafactura || {};
          setDetallefactura(data);
          setNombreempresa(data?.NombreEmpresa || '')
          setRucempresa(data?.RucEmpresa || '')
          const fechaFormateada = convertirFecha(data?.fecha_factura || '');
          setFechaoperacion(fechaFormateada)
          setNrofactura(data?.numero_factura || '')
          setCdcarchivo(data?.cdc || '')
          const totales={
            total_operacion: data?.total_factura || '',
            liq_iva10: data?.iva10 || '',
            liq_iva5: data?.iva5 || '',
            total_iva: data?.liquidacion_iva || '',
          }
          setDatamontos(totales)
          const conceptosreg = data?.DetalleFactura;
          
          const conceptosConKey = conceptosreg.map((item, index) => ({
            ...item,  // Copia todas las propiedades del objeto
            key: index.toString(),  // Agrega una key única, en este caso usamos el índice
          }));
          setCantidadconceptos(conceptos.length)
          setConceptos(conceptosConKey)
        }
        
        
      }, [detallefactura,estadocomponente.factura_editar,modoedicion]);



   if (detallefactura){

    return(
      <PaperProvider >

        <View style={{ flex: 1 }}>
          {/* {modoedicion &&(<ScreensCabeceraRegistro title={title} backto={backto}></ScreensCabeceraRegistro>)}
          {!modoedicion &&(<ScreensCabecera title={title} backto={backto} ></ScreensCabecera>)} */}
          <ScreensCabecera title={title} backto={backto} reiniciar_componentes={false}></ScreensCabecera>

            <Portal>

              <Dialog visible={visibledialogoeliminar} onDismiss={hideDialogeliminar}>
                  <Dialog.Title>Eliminar Registro</Dialog.Title>
                  <Dialog.Content>
                      <Text variant="bodyMedium">{`¿Desea eliminar la factura Nro: ${nrofactura} con ID operacion N°: ${estadocomponente.factura_editar}?`}</Text>
                      
                  </Dialog.Content>
                  <Dialog.Actions>
                      <Button onPress={hideDialogeliminar}>Cancelar</Button>
                      <Button onPress={confimareliminacion}>ELIMINAR</Button>
                  </Dialog.Actions>
              </Dialog>
            </Portal>

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
            <View style={{ flex: 1 }}>

                <View style={[styles.section, { height: height * 0.25,marginTop:10}]}>
                      
                    
                      <View style={styles.contenedorcabeceradatos}>

                        
                        <Text style={[styles.labelcabeceradatos,{ fontFamily: fonts.regular.fontFamily }]}>
                              Local Compra:
                            </Text>
                            <TextInput
                              style={[styles.inputcabeceradatos,{color: colors.text,backgroundColor: colors.backgroundInpunt,fontFamily: fonts.regular.fontFamily,}]}
                              value={nombreempresa}
                              onChangeText={nombreempresa => textoempresa(nombreempresa)}
                              underlineColorAndroid="transparent"
                              editable={!detallefactura}
                              multiline={false} // Permite desplazamiento horizontal si es necesario
                              scrollEnabled={false} // Habilita el desplazamiento horizontal
                            />
                      </View>
                                  
                      
                      <View style={styles.contenedorcabeceradatos}>
                          <Text style={[styles.labelcabeceradatos,{ fontFamily: fonts.regular.fontFamily }]}>
                            RUC:
                          </Text>
                          <TextInput
                            style={[styles.inputcabeceradatos,{color: colors.text,backgroundColor: colors.backgroundInpunt,fontFamily: fonts.regular.fontFamily,}]}
                            value={rucempresa}
                            onChangeText={rucempresa => textoempresa(rucempresa)}
                            underlineColorAndroid="transparent"
                            editable={!detallefactura}
                            multiline={false} // Asegura que el campo no sea multilinea
                            scrollEnabled={false} // Desactiva el desplazamiento horizontal
                          />
                      </View>

                
                      <View style={styles.contenedorcabeceradatos}>
                        <Text style={[styles.labelcabeceradatos,{ fontFamily: fonts.regular.fontFamily }]}>
                          N° Factura:
                        </Text>
                        <TextInput
                          style={[styles.inputcabeceradatos,{color: colors.text,backgroundColor: colors.backgroundInpunt,fontFamily: fonts.regular.fontFamily,}]}
                          value={nrofactura}
                          onChangeText={nrofactura => textoempresa(nrofactura)}
                          underlineColorAndroid="transparent"
                          editable={!detallefactura}
                          multiline={false} // Asegura que el campo no sea multilinea
                          scrollEnabled={false} // Desactiva el desplazamiento horizontal
                        />
                      </View>

                      <View style={styles.contenedorcabeceradatos}>
                          <Text style={[styles.labelcabeceradatos,{ fontFamily: fonts.regular.fontFamily }]}>
                            Fecha Operacion:
                          </Text>
                          <TextInput
                            style={[styles.inputcabeceradatos,{color: colors.text,backgroundColor: colors.backgroundInpunt,fontFamily: fonts.regular.fontFamily,}]}
                            value={fechaoperacion}
                            onChangeText={fechaoperacion => textoempresa(fechaoperacion)}
                            underlineColorAndroid="transparent"
                            editable={!detallefactura}
                            multiline={false} // Permite desplazamiento horizontal si es necesario
                            scrollEnabled={false} // Habilita el desplazamiento horizontal
                          />
                      </View>
                </View>

                <View style={ { height: height * 0.48 }}>

                    <View style={{ height: '65%', overflow: 'hidden' }}>

                    <DataTable>
                        <View style={{ backgroundColor: 'gray', marginLeft: 8, marginRight: 8, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                          <DataTable.Header>
                            <DataTable.Title style={{ flex: 2 }} textStyle={{ fontSize: tamañoletraheadertabla, fontFamily: fonts.regularbold.fontFamily }}>
                              Concepto
                            </DataTable.Title>
                            <DataTable.Title textStyle={{ fontSize: tamañoletraheadertabla, fontFamily: fonts.regularbold.fontFamily }} numeric>
                              Cant
                            </DataTable.Title>
                            <DataTable.Title textStyle={{ fontSize: tamañoletraheadertabla, fontFamily: fonts.regularbold.fontFamily }} numeric>
                              Total
                            </DataTable.Title>
                          </DataTable.Header>
                        </View>
                      </DataTable>
                      <ScrollView nestedScrollEnabled={true}>
                        <DataTable>
                          {conceptos.map((item) => (
                            <DataTable.Row key={item.key}>
                              <DataTable.Cell style={{ flex: 2 }} textStyle={{ fontSize: tamañoletratabla, fontFamily: fonts.regular.fontFamily }}>
                                {item.concepto}
                              </DataTable.Cell>
                              <DataTable.Cell textStyle={{ fontSize: tamañoletratabla, fontFamily: fonts.regular.fontFamily }} numeric>
                                {item.cantidad}
                              </DataTable.Cell>
                              <DataTable.Cell textStyle={{ fontSize: tamañoletratabla, fontFamily: fonts.regular.fontFamily }} numeric>
                                {Number(item.total).toLocaleString('es-ES')}
                              </DataTable.Cell>
                            </DataTable.Row>
                          ))}
                        </DataTable>
                      </ScrollView>
                      
                    </View>

                      




                    <View style={[styles.contenedordatos]}>
                        {datamontos && (
                            <View style={{ flexDirection: 'row', flex: 1 }}>
                            {/* Primera columna */}
                            <View style={[styles.columna, { flex: 1 }]}>

                                <Text style={[styles.textocontenido, { color: colors.text,fontFamily: fonts.regular.fontFamily }]}>Total Factura: {datamontos.total_operacion}</Text>
                                <Text style={[styles.textocontenido, { color: colors.text,fontFamily: fonts.regular.fontFamily }]}>Iva 10 %: {datamontos.liq_iva10}</Text>
                                <Text style={[styles.textocontenido, { color: colors.text,fontFamily: fonts.regular.fontFamily }]}>Iva 5%: {datamontos.liq_iva5}</Text>
                                <Text style={[styles.textocontenido, { color: colors.text,fontFamily: fonts.regular.fontFamily }]}>Cant Conceptos: {cantidadconceptos}</Text>
                            </View>

                            {/* Segunda columna */}
                            <View style={[styles.columna, { flex: 1, marginTop: 20 }]}>
                                <Text style={[styles.textototal, { color: colors.text, fontFamily: fonts.regularbold.fontFamily }]}>
                                Liq IVA Gs.: {datamontos.total_iva}
                                </Text>
                            </View>
                            </View>
                        )}
                    </View>

                    {modoedicion && estadocomponente.factura_editar>0 &&(
                      
                      <View style={{ marginLeft: '5%', marginRight:'5%',marginTop:10 }}>

                        
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
                              ID Operacion: {estadocomponente.datafactura.id}; {estadocomponente.datafactura.fecha_registro}; {estadocomponente.datafactura.tipo_registro}
                            </Text>



                      </View>
                      )

                    }
                      


                
                </View>

                <View style={{ height: height * 0.07,marginTop:20 }}>

                  {!modoedicion &&(

                    <View >


                        <TouchableOpacity 
                          style={{ 
                            // position: 'absolute',
                            // bottom: 30, 
                            // left: 10,   
                            // right: 10,  
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
                            REGISTRAR
                          </Text>
                          <MaterialIcons name="save-alt" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                  )

                  }

                  {/* {modoedicion &&(

                  <View style={{ flexDirection: "row", width: "100%",left:'35%'}}>

                      

                      <TouchableOpacity style={[styles.botoncabecera,{ backgroundColor:'#57DCA3',marginRight:10}]} onPress={editar_registro}>
                          <AntDesign name="edit" size={30} color="white" />
                      </TouchableOpacity>

                      <TouchableOpacity style={[styles.botoncabecera,{ backgroundColor:'red'}]} onPress={showDialogeliminar}>
                          <MaterialIcons name="delete-forever" size={30} color="white" />
                      </TouchableOpacity>
                          
                  </View>
                  )

                  } */}

                </View>

            </View >
              
            {modoedicion &&(

                  <View style={{ backgroundColor: 'rgba(128, 128, 128, 0.5)',borderWidth:1,borderRadius:50,
                  paddingLeft:20, paddingBottom:10,paddingTop:10,

                  position: "absolute", bottom: '5%', left: '80%', width: "100%"}}>

                      

                      <TouchableOpacity style={[styles.botoncabecera,{ backgroundColor:'#57DCA3',marginBottom:10}]} onPress={editar_registro}>
                          <AntDesign name="edit" size={30} color="white" />
                      </TouchableOpacity>

                      <TouchableOpacity style={[styles.botoncabecera,{ backgroundColor:'red'}]} onPress={showDialogeliminar}>
                          <MaterialIcons name="delete-forever" size={30} color="white" />
                      </TouchableOpacity>
                          
                  </View>
                  )

                  }
              
              
              
      
              


        </View>
      </PaperProvider>
    )
     
} 

    
    

}
const styles = StyleSheet.create({

   contenedorcabeceradatos:{
    flexDirection: 'row', alignItems: 'center',marginBottom:20,marginLeft:10,marginRight:10
   },
   labelcabeceradatos:{
    fontSize: 14, color: 'gray'
   },
   inputcabeceradatos:{
    textAlignVertical: 'center',
    paddingVertical: 1,
    lineHeight: 18,
    borderBottomWidth: 1,
    marginBottom: 5, // Reduce la separación con otros elementos
    paddingLeft: 10,
    flex: 1, // Esto hace que el TextInput ocupe el resto del espacio disponible
    marginLeft: 5, // Para dar un pequeño espacio entre el texto y el TextInput

   },
    
    textocontenido:{
        fontSize:12.5,
        marginBottom:5,
        // color:'white'
      },
    
      contenedordatos:{
        flexDirection: 'row',
        borderWidth:1,
        // marginTop:10,
        marginRight:5,
        marginLeft:5,
        borderRadius:15,
        overflow: 'hidden', 
        height: 110,
        padding: 10,
        
        
    },
    botoncabecera: {
      // backgroundColor: 'blue',
      width: 50, // Define el ancho del botón
      height: 50, // Define la altura del botón
      borderRadius: 30, // Define la mitad de la dimensión del botón para obtener una forma circular
      justifyContent: 'center', // Alinea el contenido (icono) verticalmente en el centro
      alignItems: 'center', // Alinea el contenido (icono) horizontalmente en el centro
    },
    section: {
      // borderWidth: 1, // Opcional: para visualización de los contenedores
      // borderColor: 'gray',
      justifyContent: 'center',
      alignItems: 'center',
    },

  });

export default DetalleFactura