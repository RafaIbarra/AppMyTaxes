import React,{useContext} from "react";
import { NavigationContainer,DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View,Text,TouchableOpacity } from "react-native";
import { useTheme } from '@react-navigation/native';
import { useNavigation  } from "@react-navigation/native";

import { AuthContext } from "./AuthContext";


import Loginv3 from "./Componentes/Screens/Login/Loginv3";
import RegistroUsuario from "./Componentes/Screens/RegistroUsuario/RegistroUsuario";
import RecuperacionConraseña from "./Componentes/Screens/RecuperacionConraseña/RecuperacionConraseña";

import DrawerContentInicio from "./Componentes/DrawerContentInicio/DrawerContentInicio";
import QRScanner from "./Componentes/Screens/Qr/QRScanner";

import ListadoFacturas from "./Componentes/Screens/ListadoFacturas/ListadoFacturas";
import ResumenMes from "./Componentes/Screens/ResumenMes/ResumenMes";
import CargaManual from "./Componentes/Screens/CargaManual/CargaManual";
import CargaCdc from "./Componentes/Screens/CargaCdc/CargaCdc";
import Periodo from "./Componentes/Screens/Periodo/Perdiodo";
import GeneracionArchivo from "./Componentes/Screens/GeneracionArchivo/GeneracionArchivo";

import DetalleFactura from "./Componentes/Screens/DetalleFactura/DetalleFactura";
import Camara from "./Componentes/Screens/Camara/Camara";
import CamraCdc from "./Componentes/Screens/CamraCdc/CamraCdc";
import CargaArchivoXml from "./Componentes/Screens/CargaArchivoXml/CargaArchivoXml";
import Cargando from "./Componentes/Procesando/Cargando";
import ListaArchivos from "./Componentes/Screens/ListaArchivos/ListaArchivos";
import Configuraciones from "./Componentes/Screens/Configuraciones/Configuraciones";
import Compartir from "./Componentes/Screens/Compartir/Compartir";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { FontAwesome6 } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';




const MyTheme = {
  ...DefaultTheme,
  fonts: {


    regular: { fontFamily: 'SenRegular', fontWeight: 'normal' },
    regularbold: { fontFamily: 'SenBold', fontWeight: 'normal' }, 

    // regular: { fontFamily: 'Roboto', fontWeight: 'normal' },
    // regularbold: { fontFamily: 'Roboto', fontWeight: 'bold' },
    
  },
    colors: {
      ...DefaultTheme.colors,
 
       background: '#ebedef',
      
      textbordercoloractive:'rgb(44,148,228)',
      textbordercolorinactive:'gray',
      text:'black',
      textcard:'white',
      textsub:'gray',
      color:'red',
      primary:'white',
      tintcolor:'gray',
      // card: 'rgb(28,44,52)', //color de la barra de navegadores
      //card: '#57DCA3', //color de la barra de navegadores UENO
      card: '#2a2a2c', 
      
      

      commentText:'black',
      bordercolor:'#d6d7b3',
      iconcolor:'white',
      botoncolor:'rgb(44,148,228)',
      acctionsbotoncolor:'#57DCA3',
      subtitulo:'rgba(32,93,93,255)'
      
    },
    
};


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const StackCarga=createNativeStackNavigator();
const StackQr=createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerInicio({navigation}){
  const { colors,fonts } = useTheme();
  const sizeicon=25
  const sizefont=16
  const {periodo, setPeriodo} = useContext(AuthContext);
  const { navigate } = useNavigation();
  
  const { estadocomponente } = useContext(AuthContext);

  return(

  <Drawer.Navigator
    screenOptions={{
      headerShown: !estadocomponente.camaracdc, 
      headerTitle: ({}) => (
        <View >
          <Text style={{ color: colors.textcard,fontSize:20,fontFamily: fonts.regularbold.fontFamily}}>{periodo}</Text>
          
        </View>
      ),
      headerRight:({})=>(
        <View style={{marginRight:20}}>

          <TouchableOpacity 
              //  onPress={() => navigate('StackPeriodo')} 
              onPress={() => navigate("InicioHome", { screen: 'StackPeriodo'})} 
               
              >
              <AntDesign name="calendar" size={27} color={colors.iconcolor} />
                    
          </TouchableOpacity>
        </View>
      ),
      headerTitleAlign:'center',
      headerStyle:{elevation:0},
      headerTintColor: colors.textcard,
      drawerLabelStyle: {marginLeft: 0,fontFamily: fonts.regularbold.fontFamily},
      tabBarLabelStyle:{borderWidth:1,bordercolor:'red'},
    
    }}
    drawerContent={DrawerContentInicio}
  >
      <Drawer.Screen name="InicioHome" 
      component={OpcionesStackTabs}
      options={{
       
        drawerLabel: ({ color, size,focused }) => {
          let colortext
          colortext = focused ? colors.acctionsbotoncolor : colors.textsub;
          let familyname
          familyname= focused ? fonts.regularbold.fontFamily : fonts.regular.fontFamily;
          
          return(<Text style={{color:colortext,fontSize:sizefont,fontFamily:familyname}}> Inicio</Text>)
        },
        
        drawerIcon: ({size, color})=>(<AntDesign name="home" size={sizeicon} color={colors.iconcolor} />),
        drawerItemStyle:{borderBottomWidth:1,borderBottomColor:'white',marginBottom:5,marginTop:20}
        
        }}
      />
      <Drawer.Screen name="GeneracionArchivo" 
      component={GeneracionArchivo}
      options={{
       
        drawerLabel: ({ color, size,focused }) => {
          let colortext
          colortext = focused ? colors.acctionsbotoncolor : colors.textsub;
          let familyname
          familyname= focused ? fonts.regularbold.fontFamily : fonts.regular.fontFamily;
          
          return(<Text style={{color:colortext,fontSize:sizefont,fontFamily:familyname}}> Generar Archivo</Text>)
        },
        
        drawerIcon: ({size, color})=>(<MaterialCommunityIcons name="microsoft-excel" size={sizeicon} color={colors.iconcolor} />),
        drawerItemStyle:{borderBottomWidth:1,borderBottomColor:'white',marginBottom:5,marginTop:20}
        
        }}
      />
      <Drawer.Screen name="ListaArchivos" 
      component={ListaArchivos}
      options={{
       
        drawerLabel: ({ color, size,focused }) => {
          let colortext
          colortext = focused ? colors.acctionsbotoncolor : colors.textsub;
          let familyname
          familyname= focused ? fonts.regularbold.fontFamily : fonts.regular.fontFamily;
          
          return(<Text style={{color:colortext,fontSize:sizefont,fontFamily:familyname}}> Archivos XML</Text>)
        },
        
        drawerIcon: ({size, color})=>(<MaterialCommunityIcons name="archive-clock-outline" size={sizeicon} color={colors.iconcolor}  />),
        drawerItemStyle:{borderBottomWidth:1,borderBottomColor:'white',marginBottom:5,marginTop:20}
        
        }}
      />
      <Drawer.Screen name="Configuraciones" 
      component={Configuraciones}
      options={{
       
        drawerLabel: ({ color, size,focused }) => {
          let colortext
          colortext = focused ? colors.acctionsbotoncolor : colors.textsub;
          let familyname
          familyname= focused ? fonts.regularbold.fontFamily : fonts.regular.fontFamily;
          
          return(<Text style={{color:colortext,fontSize:sizefont,fontFamily:familyname}}>Configuraciones</Text>)
        },
        
        drawerIcon: ({size, color})=>(<AntDesign name="setting" size={sizeicon} color={colors.iconcolor}  />),
        drawerItemStyle:{borderBottomWidth:1,borderBottomColor:'white',marginBottom:5,marginTop:20}
        
        }}
      />
      <Drawer.Screen name="Compartir" 
      component={Compartir}
      options={{
       
        drawerLabel: ({ color, size,focused }) => {
          let colortext
          colortext = focused ? colors.acctionsbotoncolor : colors.textsub;
          let familyname
          familyname= focused ? fonts.regularbold.fontFamily : fonts.regular.fontFamily;
          
          return(<Text style={{color:colortext,fontSize:sizefont,fontFamily:familyname}}>Compartir</Text>)
        },
        
        drawerIcon: ({size, color})=>(<AntDesign name="sharealt" size={sizeicon} color={colors.iconcolor}  />),
        drawerItemStyle:{borderBottomWidth:1,borderBottomColor:'white',marginBottom:5,marginTop:20}
        
        }}
      />
  
  </Drawer.Navigator>
  )

}
const Staktabs= createNativeStackNavigator();
function OpcionesStackTabs({ navigation }){
  return(

  <Staktabs.Navigator screenOptions={{ headerShown: false }}>
    <Staktabs.Screen name="MainTabs2" component={MainTabs} options={{title: 'MainTabs'}} />
    <Staktabs.Screen name="StackCargaOpciones" component={StackCargaOpciones} options={{title: 'StackCargaOpciones'}} /> 


    
      
      <Staktabs.Screen name="CargaArchivoXml" component={CargaArchivoXml} options={{title: 'XmlFileUploader',headerShown: false}} />

      <Staktabs.Screen name="DetalleFactura" component={DetalleFactura} options={{title: 'DetalleFactura',headerShown: false}} />
      <Staktabs.Screen name="EditarFactura" component={CargaManual} options={{title: 'EditarFactura',headerShown: false}} />
      <Staktabs.Screen name="StackPeriodo" 
                            component={Periodo} 
                            options={{headerTitle:'Seleccion Periodo',
                            headerTitleAlign:'center',
                            
                          }}
        />
    
  </Staktabs.Navigator>
  )

}




function OpcionesCargaTabs() {
  const { estadocomponente } = useContext(AuthContext);
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}
    initialRouteName="QR"
    >
      <Tab.Screen name="Manual" 
        component={CargaManual} 
        
        options={{
          tabBarLabel: 'Manual',
          tabBarIcon: ({ color, size,focused }) => {
            let colorico
            colorico = focused ? "white" : "gray";
            return(
              <FontAwesome5 name="hand-holding-medical" color={colorico} size={24} />
            )
          },
          
          tabBarStyle: {
            display: estadocomponente.isKeyboardVisible || estadocomponente.camaracdc  ? 'none' : 'flex', // Ocultar el Tab si el teclado está visible
          },
           headerShown: false,
          }}
        />
      <Tab.Screen name="QR" 
        component={QRScanner} 
        options={{
          tabBarLabel: 'QR',
          tabBarIcon: ({ color, size,focused }) => {
            let colorico
            colorico = focused ? "white" : "gray";
            return(
              <MaterialIcons name="qr-code-scanner" color={colorico} size={24} />
            )
          },
          tabBarStyle: {
            display: estadocomponente.isKeyboardVisible || estadocomponente.camaracdc  ? 'none' : 'flex', // Ocultar el Tab si el teclado está visible
          },
           headerShown: false,
          }}
      />
   
        <Tab.Screen name="CargaCdc" 
        component={CargaCdc} 
        options={{
          tabBarLabel: 'CDC',
          tabBarIcon: ({ color, size,focused }) => {
            let colorico
            colorico = focused ? "white" : "gray";
          
            return(

              <FontAwesome name="file-code-o" color={colorico} size={24} />
            )
          },
          tabBarStyle: {
            display: estadocomponente.isKeyboardVisible || estadocomponente.camaracdc  ? 'none' : 'flex', // Ocultar el Tab si el teclado está visible
          },
          headerShown: false,
          }}
      />
    </Tab.Navigator>
  );
}

function MainTabs({ navigation }) {
  const { colors,fonts } = useTheme();
  const { navigate } = useNavigation();
  const handlePress = () => {
        
        const item={'id':0}
        navigate("StackCargaOpciones", { })
        
      };

  const CentralButton = ({ handlePress }) => (
    <TouchableOpacity
      style={{
        position: 'absolute',
        bottom: 15,
        left: '50%',
        transform: [{ translateX: -30 }],
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#57DCA3',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
      }}
      onPress={handlePress}
    >
      <FontAwesome6 name="add" size={40} color="white" />
    </TouchableOpacity>
  );
  
  return (
    <View style={{ flex: 1 }}>

      <Tab.Navigator
      initialRouteName="ListadoFacturas"
      screenOptions={{
        tabBarStyle: {
          borderTopLeftRadius: 20, 
          borderTopRightRadius: 20,
          height: 60,
          justifyContent: 'center',
          paddingTop: 5,
          
        },
        
      }}
      >
        <Tab.Screen name="Resumen" 
          component={ResumenMes}
          options={{
            
            tabBarLabel: ({ color, size,focused }) => {
              let colortext
              colortext = focused ? colors.acctionsbotoncolor : colors.textsub;
              let familyname
              familyname= focused ? fonts.regularbold.fontFamily : fonts.regular.fontFamily;
              
              return(<Text style={{color:colortext,fontSize:10,fontFamily:familyname}}> Resumen</Text>)
            },
            tabBarIcon: ({ color, size,focused }) => {
              let colorico
              colorico = focused ? "white" : "gray";
            
              return(

                <Ionicons name="book" color={colorico} size={30} />
              )
            },
            tabBarItemStyle: {
              marginRight: 100, // Aumenta el espacio entre el Tab y el botón central
            },
            headerShown:false
            
            }}
        />
       
      
        <Tab.Screen name="ListadoFacturas" 
          component={ListadoFacturas} 
          options={{
            tabBarLabel: ({ color, size,focused }) => {
              let colortext
              colortext = focused ? colors.acctionsbotoncolor : colors.textsub;
              let familyname
              familyname= focused ? fonts.regularbold.fontFamily : fonts.regular.fontFamily;
              
              return(<Text style={{color:colortext,fontSize:10,fontFamily:familyname}}> Facturas</Text>)
            }
            ,
            tabBarIcon: ({ color, size,focused }) => {
              let colorico
              colorico = focused ? "white" : "gray";
            
              return(

                <Fontisto name="list-1" size={22} color={colorico} />
              )
            }
            ,
            
            
            headerShown:false
            }}
          />
        
    
      </Tab.Navigator>

      <TouchableOpacity
      style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: [{ translateX: -30 }],
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#57DCA3',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        
      }}
      onPress={handlePress}
    >
      <FontAwesome6 name="add" size={40} color="white" />
    </TouchableOpacity>
    </View>
  );
}

function StackCargaOpciones(){
  return (
    <StackCarga.Navigator screenOptions={{ headerShown: false }}>
      
      <StackCarga.Screen name="OpcionesCarga" component={OpcionesCargaTabs} options={{title: 'Opciones de carga'}} />
      
      
      
    </StackCarga.Navigator>
  );
}
function StackCamara() {
  return (
    <StackQr.Navigator 
    screenOptions={{ headerShown: false }}
    
    >
      <StackQr.Screen 
        name="Camara" 
        component={Camara} 
        options={{
         
           headerShown: false,
        }}
      />
      <StackQr.Screen 
        name="CamraQRScanner" 
        component={QRScanner} 
        options={{
          
           headerShown: false,
        }}
      />
    </StackQr.Navigator>
  );
}
function MainNavigator() {
  const { estadocomponente } = useContext(AuthContext);
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
    

      <Stack.Screen name="MainTabs" component={MainTabs} options={{headerShown: false}}/>
      
      
      <Stack.Screen name="StackCargaOpciones" component={StackCargaOpciones} options={{headerShown: false}} />
    </Stack.Navigator>
  );
}

const StackInicio = createNativeStackNavigator();
function NavigationLogin(){

  return (
    <StackInicio.Navigator screenOptions={{ headerShown: true }}>
      <StackInicio.Screen name="Login" component={Loginv3} options={{headerShown: false}}/>
      <StackInicio.Screen name="RegistroUsuario" component={RegistroUsuario} options={{headerShown: false}}/>
      <StackInicio.Screen name="RecuperacionConraseña" component={RecuperacionConraseña} options={{headerShown: false}}/>
      
    </StackInicio.Navigator>
  );

}

function Navigation() {
  const { activarsesion, setActivarsesion } = useContext(AuthContext);
  const { estadocomponente } = useContext(AuthContext);
  return (

    <NavigationContainer theme={MyTheme }>

      {activarsesion ? (
          estadocomponente.activecamara ? (
            <StackCamara />
          ) : (
            <>
              {estadocomponente.loading && <Cargando />}
              <DrawerInicio />
            </>
          )
        ) : (
          <>
            {estadocomponente.loading && <Cargando />}
            <NavigationLogin />
          </>
        )}
      
      
      {/* {activarsesion ? (
        estadocomponente.activecamara ? (<StackCamara />
        ) : (
          <DrawerInicio />
          
        )
      ) : (
        <NavigationLogin />
      )
      }
      {estadocomponente.loading &&( <Cargando></Cargando>)} */}




    </NavigationContainer>
  );
}

export default Navigation;