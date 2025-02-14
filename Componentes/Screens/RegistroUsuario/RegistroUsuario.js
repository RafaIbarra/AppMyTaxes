import React,{useState, useContext } from "react";
import {View,Text,StyleSheet,Alert,TouchableOpacity,ScrollView  } from "react-native";
// import DateTimePickerModal from "react-native-modal-datetime-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from 'moment';

import { Button, Dialog, Portal,PaperProvider } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';

import { AntDesign } from '@expo/vector-icons'

import CustomTextInput from "../../CustomTextInput/CustomTextInput";
import Handelstorage from "../../../Storage/handelstorage";
import ScreensCabecera from "../../ScreensCabecera/ScreensCabecera";
import ApiRegistroUsuario from "../../../Apis/apiregistrousuario";
import { AuthContext } from "../../../AuthContext";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function RegistroUsuario({ navigation  }){
    const[title,setTitle]=useState('REGISTRO USUARIO')
    const[backto,setBackto]=useState('back')
    const { activarsesion, setActivarsesion } = useContext(AuthContext);
    const {periodo, setPeriodo} = useContext(AuthContext);
    const {sesiondata, setSesiondata} = useContext(AuthContext);
     const {  actualizarEstadocomponente } = useContext(AuthContext);

    const { colors,fonts } = useTheme();
    const { navigate } = useNavigation();
    

    const [nombre,setNombre]=useState('')
    const [apellido,setApellido]=useState('')
    const [fechanac,setFechanac]=useState(new Date());
    const [show, setShow] = useState(false);
    const [username,setUsername]=useState('')
    const [correo,setCorreo]=useState('')
    const [ruc,setRuc]=useState('')
    const [digitoverificador,setDigitoverificador]=useState('')
    const [fantasia,setFantasia]=useState('')



    const [visibledialogo, setVisibledialogo] = useState(false)
    const[mensajeerror,setMensajeerror]=useState('')
    const [pass,setPass]=useState('')
    const[mostrarContrasena,setMostrarContrasena]=useState(true)

    const [pass2,setPass2]=useState('')
    const[mostrarContrasena2,setMostrarContrasena2]=useState(true)
    

    const showDialog = () => setVisibledialogo(true);
    const hideDialog = () => setVisibledialogo(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || fechanac;
        setShow(false); // Para iOS, mantener el picker abierto
        setFechanac(currentDate); // Guardar la fecha seleccionada
        
      };

    const calcularDV = (cedula) => {
        cedula = cedula.replace(/\./g, "").trim(); // Remueve puntos y espacios
        const pesos = [2, 3, 4, 5, 6, 7]; // Pesos usados en el cálculo
        let suma = 0;
        let indicePeso = 0;
    
        // Recorre la cédula de derecha a izquierda
        for (let i = cedula.length - 1; i >= 0; i--) {
            suma += parseInt(cedula[i]) * pesos[indicePeso];
            indicePeso = (indicePeso + 1) % pesos.length; // Ciclo de pesos
        }
    
        let resto = suma % 11;
        let dv = 11 - resto;
    
        if (dv === 11) dv = 0;
        if (dv === 10) dv = "K"; // En algunos sistemas se usa "K", en otros "1"
    
        return dv;
    };



 

    const showDatePicker = () => {
        setShow(true); // Mostrar el picker
      };
   
  
    
    const textoruc=(valor)=>{
        setRuc(valor)
        const div=calcularDV(valor)
        
        setDigitoverificador(div.toString())
      }

    const toggleMostrarContrasena = () => {
        
        setMostrarContrasena(!mostrarContrasena);
      };
    const toggleMostrarContrasena2 = () => {
        
        setMostrarContrasena2(!mostrarContrasena2);
      };


 






    const registrar = async()=>{

        if(pass===pass2){
            
            
            actualizarEstadocomponente('tituloloading','REGISTRANDO NUEVO USUARIO..')
            actualizarEstadocomponente('loading',true)
            const fechaFormateada= moment(fechanac).format('YYYY-MM-DD')
            const datosregistrar = {
                nombre:nombre,
                apellido:apellido,
                nacimiento:fechaFormateada,
                user:username,
                correo:correo,
                ruc:ruc,
                div:digitoverificador,
                nombre_fantasia:fantasia,
                password:pass
                

            };

            
            const datos =await ApiRegistroUsuario(datosregistrar)
            actualizarEstadocomponente('tituloloading','')
            actualizarEstadocomponente('loading',false)

            if(datos['resp']===200){
                
                
                const userdata={
                    token:datos['data']['token'],
                    sesion:datos['data']['sesion'],
                    refresh:datos['data']['refresh'],
                    user_name:datos['data']['user_name'],
                }
                
                await Handelstorage('agregar',userdata,'')
                await new Promise(resolve => setTimeout(resolve, 2000))
                const datestorage=await Handelstorage('obtenerdate');
                const mes_storage=datestorage['datames']
                const anno_storage=datestorage['dataanno']
                
                setPeriodo(datestorage['dataperiodo'])
                if(mes_storage ===0 || anno_storage===0){

                    await new Promise(resolve => setTimeout(resolve, 1500))
                    
                    const datestorage2=await Handelstorage('obtenerdate');
                    
                    setPeriodo(datestorage2['dataperiodo'])

                }
                
                setSesiondata(datos['data']['datauser'])
                actualizarEstadocomponente('tituloloading','')
                actualizarEstadocomponente('loading',false)
                setActivarsesion(true)
            }else{
                
                
                const errores=datos['data']['error']
                
                let mensajeerror = '';
                for (let clave in errores) {
                    mensajeerror += `${clave}: ${errores[clave]}. `;
                }

                showDialog(true)
                setMensajeerror(mensajeerror)
                

            }

        }else{
            Alert.alert("Contraseñas", "Las contraseñas deben coincidir.");
        }
        
    }
    return(
        

            <View style={styles.container}>
                    <ScreensCabecera navigation={navigation} title={title} backto={backto}></ScreensCabecera>
                    <PaperProvider>
                        {/* {guardando &&(<Procesando></Procesando>)} */}
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
                        <View style={{flex:1,marginTop:20}}>
                            <ScrollView style={{padding:5,maxHeight:'85%',marginLeft:10,marginRight:10}}>

                                
                                <View style={{flex: 3,marginRight:10}}>
                                    <CustomTextInput
                                        placeholder="Nombres"
                                        value={nombre} // Esto se asegura de que siempre pase un valor a la prop
                                        onChangeText={setNombre}
                                        
                                    />
                                </View>


                                
                                <View style={{flex: 3,marginRight:10}}>
                                    <CustomTextInput
                                        placeholder="Apellidos"
                                        value={apellido} // Esto se asegura de que siempre pase un valor a la prop
                                        onChangeText={setApellido}
                                        
                                    />
                                </View>
                                <View style={{ flexDirection: "row", width: "100%",justifyContent: "space-between",}}>

                                    <View style={{flex: 2,}}>

                                    <CustomTextInput
                                        placeholder="Fecha Nacimiento"
                                        value={moment(fechanac).format('DD/MM/YYYY')} // Esto se asegura de que siempre pase un valor a la prop
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
                                        value={fechanac}
                                        mode="date" // Puede ser "date", "time" o "datetime"
                                        display="default" // Opciones: "default", "spinner", "calendar" (varía según el SO)
                                        onChange={onChange}
                                    />
                                    )}
                                </View>

                                
                                
                                <View style={{flex: 3,marginRight:10}}>
                                    <CustomTextInput
                                        placeholder="User Name"
                                        value={username} // Esto se asegura de que siempre pase un valor a la prop
                                        onChangeText={setUsername}
                                        
                                    />
                                </View>
                                
                                <View style={{flex: 3,marginRight:10}}>
                                    <CustomTextInput
                                        placeholder="Correo Electronico"
                                        value={correo} // Esto se asegura de que siempre pase un valor a la prop
                                        onChangeText={setCorreo}
                                        
                                        
                                    />
                                </View>

                                <View style={{ flexDirection: "row", width: "100%",justifyContent: "space-between",}}>

                                    <View style={{flex: 3,marginRight:10}}>
                                        <CustomTextInput
                                            placeholder="Ruc o C.I."
                                            value={ruc} // Esto se asegura de que siempre pase un valor a la prop
                                            onChangeText={setRuc}
                                            onBlur={textoruc}
                                            
                                            
                                        />
                                    </View>
                                    <View style={{flex: 1,marginRight:10}}>
                                        <CustomTextInput
                                            placeholder="Div"
                                            value={digitoverificador} // Esto se asegura de que siempre pase un valor a la prop
                                            //onChangeText={setDigitoverificador}
                                            
                                            
                                        />
                                    </View>
                                </View>

                                
                                <View style={{flex: 3,marginRight:10}}>
                                    <CustomTextInput
                                        placeholder="Contraseña"
                                        value={pass} // Esto se asegura de que siempre pase un valor a la prop
                                        onChangeText={setPass}
                                        secureTextEntry={mostrarContrasena}
                                        // rightIcon={<MaterialIcons name="visibility" size={24} color="black" />}
                                        rightIcon={<MaterialIcons name={mostrarContrasena ? "visibility-off" : "visibility"} size={24} color="#000" />}
                                        onRightIconPress={toggleMostrarContrasena} 
                                        
                                    />
                                </View>
                                <View style={{flex: 3,marginRight:10}}>
                                    <CustomTextInput
                                        placeholder="Repita contraseña"
                                        value={pass2} // Esto se asegura de que siempre pase un valor a la prop
                                        onChangeText={setPass2}
                                        secureTextEntry={mostrarContrasena2}
                                        // rightIcon={<MaterialIcons name="visibility" size={24} color="black" />}
                                        rightIcon={<MaterialIcons name={mostrarContrasena2 ? "visibility-off" : "visibility"} size={24} color="#000" />}
                                        onRightIconPress={toggleMostrarContrasena2} 
                                        
                                    />
                                </View>
                            </ScrollView>

                            <View style={{flex:1,alignContent:'center',alignItems:'center'}}>

                                <Button style={{marginBottom:5,width:'90%',height:50,backgroundColor:colors.acctionsbotoncolor,justifyContent:'center'}} 
                                    mode="elevated" 
                                    textColor="white"
                                    onPress={() => registrar()}
                                >
                                     <Text style={[styles.buttonText,{ fontFamily: fonts.regularbold.fontFamily }]}>REGISTRARSE</Text> 
                                </Button>
                            </View>
                        </View>
                    </PaperProvider>
                
            </View>
        
        

        
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        
      },
    cabeceracontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        marginBottom:10,
        
        
      },

      buttonText:{
        alignItems: "center",
        fontSize:18,
        color:"white",
       },
    inputtextactivo:{
        //borderBottomColor: 'rgb(44,148,228)', // Cambia el color de la línea inferior aquí
        textAlignVertical: 'center',
        paddingVertical: 3,
        lineHeight: 18,
        flex: 1,
        borderBottomWidth: 2,
        marginBottom:35,
        paddingLeft:10,
        fontSize: 14,
        
      }
      ,
      botonfecha:{
        width: 50, 
        height: 35, 
  
        marginLeft:'5%',
        marginBottom:27
      },

    textPulsa: {
        color: 'white',
        textAlign: 'center',
        width: 300,
        marginTop: 40,
      },

    linkText: {
        color: 'rgba(218,165,32,0.7)',
        textDecorationLine: 'underline',
        top: 5,
      },
    botonfecha:{
        width: 50, 
        height: 35, 
  
        marginLeft:'5%',
        marginTop:20
        // marginBottom:27
      },
  
      

})

export default RegistroUsuario