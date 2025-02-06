import React, {useState,useEffect, useContext} from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity,Keyboard,Linking  } from "react-native";
import { Button, TextInput,Dialog, Portal,PaperProvider } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import LottieView from 'lottie-react-native';
import Handelstorage from "../../../Storage/handelstorage"
import ComprobarStorage from "../../../Storage/verificarstorage"
import Iniciarsesion from "../../../Apis/apiiniciosesion";
import Comprobarsesion from "../../../Apis/apicomprobarsesion";
import Generarpeticion from "../../../Apis/peticiones";


import { AuthContext } from "../../../AuthContext";
import { useTheme } from '@react-navigation/native';
export default function Loginv3({ navigation  }){
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { navigate } = useNavigation();
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { versionsys,setVersionsys } = useContext(AuthContext);
  const {sesiondata, setSesiondata} = useContext(AuthContext);
  const { reiniciarvalores } = useContext(AuthContext);
  const {periodo, setPeriodo} = useContext(AuthContext);
  const {  actualizarEstadocomponente } = useContext(AuthContext);
  const [errorversion,setErrorversion]=useState(false)
  const [linkdescarga,setLinkdescarga]=useState('')
  const { colors,fonts  } = useTheme();
  const [username, setUsername] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [botonActivado, setBotonActivado] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

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



 
  const handleUserChange = (text) => {
    setUsername(text.trim());
    checkActivacionBoton(text, contrasena);
  };

  const handleContrasenaChange = (text) => {
    setContrasena(text);
     checkActivacionBoton(username, text);
  };

  const checkActivacionBoton = (doc, pass) => {
    if (doc !== '' && pass !== '') {
      setBotonActivado(true);
    } else {
      setBotonActivado(false);
    }
  };

  const toggleMostrarContrasena = () => {
    setMostrarContrasena(!mostrarContrasena);
  };

  const ingresar= async ()=>{
    
    actualizarEstadocomponente('tituloloading','INICIANDO SESION..')
    actualizarEstadocomponente('loading',true)
    const datos =await Iniciarsesion(username, contrasena,versionsys)
    const resp=datos['resp']
    if(resp===200){
        
        // await AsyncStorage.setItem("user", (JSON.stringify(datos['data']['token'])));
        
        
        const userdata={
            token:datos['data']['token'],
            sesion:datos['data']['sesion'],
            refresh:datos['data']['refresh'],
            user_name:datos['data']['user_name'],
        }
        await Handelstorage('agregar',userdata,'')
        // setSesionname(datos['data']['user_name'])
        const datestorage=await Handelstorage('obtenerdate');
        const mes_storage=datestorage['datames']
        const anno_storage=datestorage['dataanno']
        
        setPeriodo(datestorage['dataperiodo'])
        if(mes_storage ===0 || anno_storage===0){

            await new Promise(resolve => setTimeout(resolve, 1500))
            
            const datestorage2=await Handelstorage('obtenerdate');
            
            setPeriodo(datestorage2['dataperiodo'])

        }
        reiniciarvalores()
        
        setSesiondata(datos['data']['datauser'])
        actualizarEstadocomponente('tituloloading','')
        actualizarEstadocomponente('loading',false)
        setActivarsesion(true)
        
       
    }else{
      actualizarEstadocomponente('tituloloading','')
      actualizarEstadocomponente('loading',false)

      if (resp===400){
        showDialog(true)
        setMensajeerror( handleError(datos['data']['error']))
      }else{
        const registros=datos['data']['error']
        showDialog(true)
        setMensajeerror( handleError(datos['data']['error']))
        setErrorversion(true)
        setLinkdescarga(registros.link)
      }
      

      
        
    }

    
  }

  const registrarse=()=>{
     navigate("RegistroUsuario")
  }

  const cargardatos=async()=>{
    const endpoint='ComprobarVersion/'
    const datosregistrar = {
      version:versionsys
    }

    const result = await Generarpeticion(endpoint, 'POST', datosregistrar);
    const respuesta=result['resp']
    
    
    
    if (respuesta === 200) {
      
      const datosstarage = await ComprobarStorage()
      
      const credenciales=datosstarage['datosesion']
      
      
      if (credenciales) {
      
          
          
          //activarspin()
          actualizarEstadocomponente('tituloloading','COMPROBANDO SESION..')
          actualizarEstadocomponente('loading',true)
          
          const body = {
            version:versionsys,
          };
          const endpoint='ComprobarSesionUsuario/'
          const result = await Comprobarsesion(endpoint, 'POST', body);
          const respuesta=result['resp']
          
          
          if (respuesta === 200){
              
              // setSesionname(datosstarage['user_name'])
              const datestorage=await Handelstorage('obtenerdate');
              setPeriodo(datestorage['dataperiodo'])
              const registros=result['data']
              setSesiondata(registros)
              actualizarEstadocomponente('tituloloading','')
              actualizarEstadocomponente('loading',false)
              setActivarsesion(true)
              
          }else if (respuesta === 6000){
            
              actualizarEstadocomponente('tituloloading','')
              actualizarEstadocomponente('loading',false)
              setActivarsesion(false)
          } else if (respuesta === 400){
  
            await Handelstorage('borrar')
            await new Promise(resolve => setTimeout(resolve, 1000))
            setActivarsesion(false)
            setErrorversion(true)
            setLinkdescarga(result['data']['link'])
            actualizarEstadocomponente('tituloloading','')
            actualizarEstadocomponente('loading',false)
  
          }else {
            
            
            await Handelstorage('borrar')
            await new Promise(resolve => setTimeout(resolve, 1000))
            setActivarsesion(false)
            actualizarEstadocomponente('tituloloading','')
            actualizarEstadocomponente('loading',false)
  
          }
          
        
      } else {
        
          await Handelstorage('borrar')
          setActivarsesion(false)
          // setSesionname('')
      }
    }else{
      const registros=result['data']['error']
      
      setErrorversion(true)
      setLinkdescarga(registros.link)
      
    }




    
}



  useEffect(() => {

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // Ocultar el botón cuando el teclado se muestra
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // Mostrar el botón cuando el teclado se oculta
      }
    );

    
    cargardatos()
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
      
  
  return (
    
      <PaperProvider >

        <View style={styles.containerPrincipal}>
      
            <ImageBackground
              source={require('../../../assets/logo.png')}
              style={styles.imageBackground}
              imageStyle={styles.imageStyle} // Ajustes de la imagen
              blurRadius={5} // Desenfoque
            >

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
              {
                !errorversion ?(
                  <>
                  
                    
                    <Text style={[styles.welcomeText,{ fontFamily: fonts.regularbold.fontFamily }]}>¡Bienvenido!</Text>

                    <View style={styles.containerSecundario}>                    
                    <TextInput
                          theme={{ colors: { primary: 'rgb(218, 165, 33)' },color:'white',roundness:17,
                                    fonts: {regular: {fontFamily:fonts.regular.fontFamily}} // no toma el valor
                                  }}
                          style={{width: '80%',
                            paddingStart: 10,
                            marginTop: 20,
                            backgroundColor: 'black',
                            color:'white',
                            fontFamily: fonts.regular.fontFamily, // no toma el valor

                          }}

                          mode="outlined"
                          textColor="white"
                          label="Usuario"
                          placeholder="Usuario"
                          onChangeText={handleUserChange} 
                        />
                        
                        <TextInput
                          mode="outlined"
                          textColor="white"
                          label="Ingrese la Contraseña"
                          placeholder="Contraseña"
                          style={[ styles.Input, { marginBottom: 30}]}
                          value={contrasena}
                          onChangeText={handleContrasenaChange}
                          theme={{ colors: { primary: 'rgb(218, 165, 33)' },roundness:17,  }}
                          secureTextEntry={!mostrarContrasena}
                          right={
                            <TextInput.Icon
                              icon={mostrarContrasena ? 'eye-off' : 'eye'}
                              color={'white'}
                              onPress={toggleMostrarContrasena}
                            />}

                        />
                        {/* <Text style={styles.TextContra}>Olvidé mi contraseña</Text> */}

                      {
                        !isKeyboardVisible && (

                          <Button  
                            style={[styles.button, botonActivado ? [styles.buttonActivado] : null]}
                            disabled={!botonActivado}
                            onPress={() => ingresar()}
                            >                                
                            <Text 
                            style={[
                              styles.buttonText,
                              botonActivado ? styles.buttonActivadoText : null, // Condicional para estilos
                              { fontFamily: fonts.regularbold.fontFamily },    // Fuente personalizada
                            ]}
                            >
                              INGRESAR</Text>
                          </Button>
                        )
                      }
                      
                    </View> 
                      {
                        !isKeyboardVisible && (

                          <View style={{alignContent:'center',alignItems:'center',marginTop:50}}>

                            <Text style={[styles.textPulsa,{fontFamily:fonts.regular.fontFamily}]}>
                            ¿No tienes una cuenta?{' '}
                            <TouchableOpacity onPress={() => registrarse()}>
                              <Text style={[styles.linkText,{fontFamily:fonts.regular.fontFamily}]}>Regístrate aquí.</Text>
                            </TouchableOpacity>
                            </Text>
                            <Text style={{color: colors.text,fontSize:12,marginTop:7,fontFamily:fonts.regular.fontFamily,color: 'rgba(218,165,32,0.7)',}}> Versión {versionsys} </Text>

                          </View>
                        )

                      }
                      
                    
                  
                  </>
                ):(
                  <View style={{padding:50, alignItems: "center",}}>

                      <Text style={[styles.welcomeText,{ fontFamily: fonts.regularbold.fontFamily,marginBottom:30 }]}>¡¡Versión desactualizada!!</Text>

                       <LottieView source={require("../../../assets/alert.json")} style={{ width: 200, height: 200 }} autoPlay loop />
                      <Text style={[styles.contenido,{fontFamily: fonts.regular.fontFamily,color:colors.acctionsbotoncolor}]} >✅ Descarga la versión actualizada desde este enlace.</Text>
                      <Text style={[styles.contenido,{fontFamily: fonts.regular.fontFamily,color:colors.acctionsbotoncolor}]}>✅ En las opciones, selecciona "Instalador de paquetes"</Text>
                      <Text 
                        style={{ color: 'white', textDecorationLine: 'underline',fontFamily: fonts.regular.fontFamily,marginTop:10}} 
                        onPress={() => Linking.openURL(linkdescarga)}
                      >
                        {linkdescarga}
                      </Text>
                  </View>
                )
              }
                
            </ImageBackground>

        </View>
      </PaperProvider>
    )
};

const styles = StyleSheet.create({
 containerPrincipal: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    borderColor: 'white', 
    backgroundColor: 'rgb(28,44,52)',
    justifyContent: 'center',

  },
  containerSecundario: {
    width: "98%",
    // height: "30%",
    marginTop:40,
    alignItems: "center",
    borderRadius:50,
    borderColor: 'white',
    borderWidth: 2,
    color:'white',
   // backgroundColor: 'rgb(206, 207, 219)',
  },
  Input:{
    
    width: '80%',
    paddingStart: 10,
    marginTop: 20,
    backgroundColor: 'black',
    color:'white',
    
    },
  image: {
    width:200,
    height:200,
    marginTop:10,
  },
  textPulsa: {
    color: 'white',
    textAlign: 'center',
    width: 300,
    // marginTop: 90,
  },
  button:{
    width:'80%',
    // height: '18%',
    height:60,
    backgroundColor: '#e3e7e3',
    justifyContent: 'center',
    
    marginBottom:30
   },
   buttonText:{
    alignItems: "center",
    fontSize:18,
    color:"gray",
   },
  TextContra:{
    color: 'blue',
    marginLeft:150,
    marginTop:5,    
  },
  buttonActivado: {
    // backgroundColor: '#8fbc8f',
    backgroundColor:'rgba(44,148,228,0.7)',
    width:'80%',
    height:60,
    justifyContent: 'center',
    marginBottom:30
  },
  buttonActivadoText: { 
    alignItems: "center",
    fontSize:18, 
    color:'white',       
  },
  containerExtra: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 90,
    marginLeft:15,
  },
  item: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  separator: {
    height: '100%',
    backgroundColor: 'gray',
  },
  linkText: {
    color: 'rgba(218,165,32,0.7)',
    textDecorationLine: 'underline',
    top: 5,
  },
  welcomeText: {
    fontSize: 30,
    color: 'rgba(218,165,32,0.7)',
    marginBottom: 20,
    textAlign: 'center',
    // fontWeight: 'bold',
    top:40,
    },
  imageBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: "center",
    },
  imageStyle: {
      opacity: 0.1, // Transparencia
    },
  contenido:{
      marginBottom:10,
      // color:'green'
    }
});


