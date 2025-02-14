import React, {useState,useEffect, useContext,useRef } from "react";
import {View,Text,StyleSheet,Alert,TouchableOpacity,ScrollView,TextInput  } from "react-native";
import { Button, Dialog, Portal,PaperProvider } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@react-navigation/native';
import { AuthContext } from "../../../AuthContext";
import Generarpeticion from "../../../Apis/peticiones";
import ScreensCabecera from "../../ScreensCabecera/ScreensCabecera";
import CustomTextInput from "../../CustomTextInput/CustomTextInput";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
const sizefontactive=17
const sizefontinaactive=17
export default function RecuperacionConraseña({ navigation  }){
    const[title,setTitle]=useState('RECUPERAR CONTRASEÑA')
    const[backto,setBackto]=useState('back')
    const {  actualizarEstadocomponente } = useContext(AuthContext);
    const { estadocomponente } = useContext(AuthContext);
    const { colors,fonts } = useTheme();
    const { navigate } = useNavigation();
    const [step,setStep]=useState(1)
    const [username,setUsername]=useState('')
    const [correo,setCorreo]=useState('')
    const [cod1,setCod1]=useState('')
    const [cod2,setCod2]=useState('')
    const [cod3,setCod3]=useState('')
    const [cod4,setCod4]=useState('')
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const [respuestadata,setRespuestadata]=useState(null)
    const [visibledialogo, setVisibledialogo] = useState(false)
    const[mensajeerror,setMensajeerror]=useState('')
    
    const [pass,setPass]=useState('')
    const[mostrarContrasena,setMostrarContrasena]=useState(true)

    const [pass2,setPass2]=useState('')
    const[mostrarContrasena2,setMostrarContrasena2]=useState(true)
    const [passcorrecto,setPasscorrecto]=useState(false)
    const showDialog = () => setVisibledialogo(true);
    const hideDialog = () => setVisibledialogo(false);


    const getBackgroundColor = (currentStep, step) => {
        if (currentStep < step) return '#DEDDDC'; // Pasos completados
        if (currentStep === step) return colors.acctionsbotoncolor; // Paso actual
        return 'transparent'; // Pasos pendientes
    };
    
    const getTextColor = (currentStep, step) => {
        if (currentStep === step) return 'white'; // Paso actual
        return colors.text; // Otros pasos
    };
    
    const getFont = (currentStep, step) => {
        return currentStep === step ? fonts.regularbold.fontFamily : fonts.regular.fontFamily;
    };
    
    const getFontSize = (currentStep, step) => {
        return currentStep === step ? sizefontactive : sizefontinaactive;
    };

    const toggleMostrarContrasena = () => {
        
        setMostrarContrasena(!mostrarContrasena);
      };
    const toggleMostrarContrasena2 = () => {
        
        setMostrarContrasena2(!mostrarContrasena2);
      };

    const BotonAction = (text, onPress, icon) => (
        <TouchableOpacity 
            style={{ 
                backgroundColor: colors.acctionsbotoncolor, 
                width: '100%',
                height: '100%',
                justifyContent: 'center', 
                alignItems: 'center', 
                borderRadius: 20,
                flexDirection: 'row',
                paddingHorizontal: 10,
            }} 
            onPress={onPress}
        >
            {text === "ATRAS" ? (
                <>
                    <Ionicons name={icon} size={24} color="black" />
                    <Text style={{
                        fontSize: 16,
                        color: 'black', 
                        fontFamily: fonts.regularbold.fontFamily,
                        marginLeft: 8, 
                    }}>
                        {text}
                    </Text>
                </>
            ) : (
                <>
                    <Text style={{
                        fontSize: 16,
                        color: 'black', 
                        fontFamily: fonts.regularbold.fontFamily,
                        marginRight: 8, 
                    }}>
                        {text}
                    </Text>
                    <Ionicons name={icon} size={24} color="black" />
                </>
            )}
        </TouchableOpacity>
    );
    
    
    const avanzar=(value)=>{
        
        setStep(value)
    }
    const handleError = (errorObject) => {
        if (typeof errorObject === "object" && errorObject !== null) {
          return Object.entries(errorObject)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("\n");
        }
        return String(errorObject); // Si no es objeto, lo convierte a string directamente
      };
    const enviarcorreo=async()=>{
        if(username.length >0 && correo.length >0){
            actualizarEstadocomponente('tituloloading','ENVIANDO CORREO..')
            actualizarEstadocomponente('loading',true)
            const datosregistrar = {
                username:username,
                correo:correo
            };


            const endpoint='SolicitudRecuperacionContraseña/'
            const result = await Generarpeticion(endpoint, 'POST', datosregistrar);
            actualizarEstadocomponente('tituloloading','')
            actualizarEstadocomponente('loading',false)
            const respuesta=result['resp']
            if (respuesta === 200) {
                setStep(2)
                const mensaje=result['data']['mensaje']
                
                setRespuestadata(mensaje)
                
              } else{
                showDialog(true)
                setMensajeerror( handleError(result['data']['error']))
                
              
              }
        }else{
            Alert.alert('Ingrese el user name y el correo registrado!')
        }
    }

    const corroborarcodigo=async()=>{
        
        const codigoenviar=cod1.toString() + cod2.toString()+cod3.toString() +cod4.toString()
        if(codigoenviar.length === 4){
            actualizarEstadocomponente('tituloloading','COMPROBANDO CODIGO..')
            actualizarEstadocomponente('loading',true)
            
            const datosregistrar = {
                username:username,
                correo:correo,
                codigo:codigoenviar
            };
            const endpoint='ComprobarCodigoSeguridad/'
            const result = await Generarpeticion(endpoint, 'POST', datosregistrar);
            actualizarEstadocomponente('tituloloading','')
            actualizarEstadocomponente('loading',false)
            const respuesta=result['resp']
            if (respuesta === 200) {
                setStep(3)
               
                
                
              }  else{
                showDialog(true)
                setMensajeerror( handleError(result['data']['error']))
                
              
              }
        }else{
            Alert.alert('Ingrese correctamente el codigo de seguridad!')
        }
    }

    const actualizar = async()=>{
   
        if(pass===pass2){
            
            const codigoenviar=cod1.toString() + cod2.toString()+cod3.toString() +cod4.toString()
            actualizarEstadocomponente('tituloloading','ACTUALIZANDO CONTRASEÑA..')
            actualizarEstadocomponente('loading',true)
            const datosregistrar = {
                username:username,
                correo:correo,
                password:pass,
                password2:pass2,
                codigo:codigoenviar
            };
            const endpoint='ActualizacionPassword/'
            const result = await Generarpeticion(endpoint, 'POST', datosregistrar);
            actualizarEstadocomponente('tituloloading','')
            actualizarEstadocomponente('loading',false)
            const respuesta=result['resp']
            if (respuesta === 200) {
                setPasscorrecto(true)
               
                
                
              }  else{
                showDialog(true)
                setMensajeerror( handleError(result['data']['error']))
                
              
              }

        }else{
            Alert.alert("Contraseñas", "Las contraseñas deben coincidir.");
        }
        
    }
    const volver=()=>{
        navigate("Login")
    }
    if(!passcorrecto){

        return(
            <PaperProvider >
    
                <View style={styles.container}>
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
                    <ScreensCabecera navigation={navigation} title={title} backto={backto}></ScreensCabecera>
    
                    
                    <View style={{flex:1,marginTop:20,padding:20}}>
    
                        { step===1 &&(
                            <View style={{flex:1,alignItems:'center'}}> 
                                <Text style={{ fontSize: 16, color: 'black', fontFamily: fonts.regularbold.fontFamily,marginBottom:10}}>
                                        
                                        INGRESE LOS DATOS DEL REGISTRO
                                </Text>
                                <View style={{width:'100%'}}>
                                    <CustomTextInput
                                        placeholder="UserName"
                                        value={username} // Esto se asegura de que siempre pase un valor a la prop
                                        onChangeText={setUsername}
                                        editable = { step===1 ? true : false}
                                                            
                                    />
                                </View>
                                
                                <View style={{width:'100%'}}>
    
                                    <CustomTextInput
                                        placeholder="Correo Electronico"
                                        value={correo} // Esto se asegura de que siempre pase un valor a la prop
                                        onChangeText={setCorreo}
                                        editable = { step===1 ? true : false}
                                                            
                                    />
                                </View>
    
                                <View style={{width:'100%',height:40,marginTop:50}}>
                                    {BotonAction('SIGUIENTE', () => enviarcorreo(),"arrow-forward")}
                                </View>
                                
                            </View>
                            )
                        }
                        
                        {step === 2 &&(
                                <View style={{alignContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16, color: 'black', fontFamily: fonts.regularbold.fontFamily, marginRight: 8 }}>
                                        
                                        INGRESE EL CÓDIGO DE SEGURIDAD
                                    </Text>
    
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '80%',
                                        marginTop: 10
                                    }}>
                                        {[cod1, cod2, cod3, cod4].map((value, index) => {
                                            const setCod = [setCod1, setCod2, setCod3, setCod4][index];
    
                                            return (
                                                <TextInput
                                                    key={index}
                                                    ref={inputRefs[index]}
                                                    style={{
                                                        height: 70,
                                                        borderWidth: 1,
                                                        borderColor: value ? 'blue' : '#DEDDDC', // Color del borde dinámico
                                                        borderRadius: 5,
                                                        width: 50,
                                                        fontFamily: fonts.regularbold.fontFamily,
                                                        fontSize: 30,
                                                        textAlign: 'center',
                                                        backgroundColor:step===2 ? null : '#DEDDDC'
                                                    }}
                                                    value={value}
                                                    onChangeText={(text) => {
                                                        setCod(text.slice(0, 1)); // Solo permite un número
                                                        if (text.length === 1 && index < 3) {
                                                            inputRefs[index + 1].current.focus(); // Pasa al siguiente campo
                                                        }
                                                    }}
                                                    editable={step === 2}
                                                    keyboardType="numeric"
                                                    maxLength={1} // Limita la entrada a un solo carácter
                                                />
                                            );
                                        })}
                                    </View>
                                    {respuestadata  && (<Text 
                                                            style={{fontSize: 16,marginTop:30,marginLeft:10,color: 'red', 
                                                            fontFamily: fonts.regular.fontFamily}}
                                                            >
                                                            {respuestadata} 
                                                        </Text>
                                    )}
                                    <View style={{flexDirection: 'row',justifyContent: 'space-between',marginTop:50}}>
                                        <View style={{width:'50%',height:40}}>
    
                                            {BotonAction('ATRAS', () => avanzar(1),"arrow-back-sharp")}
                                        </View>
    
                                        <View style={{width:'50%',height:40}}> 
    
                                            {BotonAction('SIGUIENTE', () => corroborarcodigo(),"arrow-forward")}
                                        </View>
                                    </View>
                                    
                                </View>
    
                                
                            ) 
                        }
                      
                        
                        { step===3 &&(
    
                            <View style={{alignItems:'center'}}>
                                
                                    <Text style={{ fontSize: 16, color: 'black', fontFamily: fonts.regularbold.fontFamily, marginRight: 8 }}>
                                            
                                            INGRESE LA NUEVA CONTRASEÑA
                                    </Text>
                                    
                                    <View style={{width:'100%'}}>
    
                                        <CustomTextInput
                                            placeholder="Nueva Contraseña"
                                            value={pass} // Esto se asegura de que siempre pase un valor a la prop
                                            onChangeText={setPass}
                                            secureTextEntry={mostrarContrasena}
                                            // rightIcon={<MaterialIcons name="visibility" size={24} color="black" />}
                                            rightIcon={<MaterialIcons name={mostrarContrasena ? "visibility-off" : "visibility"} size={24} color="#000" />}
                                            onRightIconPress={toggleMostrarContrasena} 
                                            
                                        />
                                    </View>
                                    
                                    <View style={{width:'100%'}}>
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
                                
                                
    
                                <View style={{flexDirection: 'row',justifyContent: 'space-between',marginTop:50}}>
                                    <View style={{width:'50%',height:40}}>
    
                                        {BotonAction('ATRAS', () => avanzar(2),"arrow-back-sharp")}
                                    </View>
    
                                    <View style={{width:'50%',height:40}}> 
    
                                        {BotonAction('FINALIZAR', () => actualizar(),"arrow-forward")}
                                    </View>
                                </View>
                            </View>
    
    
    
                            )
                        }
    
    
                    </View>
    
                    <View style={styles.stepscontainer}>
                        { [1, 2, 3].map((num, index) => (
                            <React.Fragment key={num}>
                                <View style={[
                                    styles.setpsitems, 
                                    { backgroundColor: getBackgroundColor(num, step) }
                                ]}>
                                    <Text style={{ 
                                        color: getTextColor(num, step), 
                                        fontFamily: getFont(num, step),
                                        fontSize: getFontSize(num, step)
                                    }}>
                                        {num.toString()} {/* Convertir a string para evitar errores */}
                                    </Text>
                                </View>
                                {index < 2 && <View style={styles.setpsline} />} 
                            </React.Fragment>
                        ))}
    
                    </View>
    
                </View>                    
            </PaperProvider>
    
        )
    }else{
        return(
            <View style={styles.container}>
                 <ScreensCabecera navigation={navigation} title={title} backto={backto}></ScreensCabecera>
                <View style={styles.containercentral}>
                    <LottieView source={require("../../../assets/passcorrecto.json")} style={{ width: 300, height: 300 }} autoPlay loop />
                    <View style={[styles.labelcdc, { marginLeft: 14,marginTop:30 }]}>
                        <Text style={{ color: colors.textsub, fontFamily: fonts.regular.fontFamily,fontSize:16 }}>
                            !! SU CONTRASEÑA HA SIDO ACTUALIZADA !!
                        </Text>
                    </View>
                    <View style={{width:'90%',height:40,marginTop:70}}> 
    
                        {BotonAction('IR A INICIO SESION', () => volver(),"arrow-forward")}
                    </View>
                </View>
            </View>
        )
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,    
    },
    stepscontainer:{
        position: 'absolute', 
        flexDirection: 'row',
        paddingLeft:20,
        paddingRight:10,
        alignItems: 'center',
        bottom:20,
        width: '100%',
        
        
    },
    setpsitems:{
        borderWidth:1,
        borderColor:'blue',
        //padding:10,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:100,
        height:40,
        width:40
    },
    setpsline:{
        borderWidth:1,
        borderColor:'blue',
        width:'33%',
        
    },
    containercentral:{
        flex: 1,                // Ocupa todo el espacio disponible
        justifyContent: 'center', // Centra verticalmente
        alignItems: 'center', 
      },
    labelcdc:{
        fontSize: 14, color: 'gray'
       },
})