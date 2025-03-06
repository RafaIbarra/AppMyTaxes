import React,{useState,useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {  View,Text,TouchableOpacity,Linking,StyleSheet,Alert,ScrollView } from "react-native";

import FolderHandler from "../../FolderHandler/FolderHandler";

import { useTheme } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

/*Iconos*/




function Configuraciones({navigation}){
    const [existe,setExiste]=useState()
    const { colors,fonts } = useTheme();
    const { navigate } = useNavigation();

    const openOperaInPlayStore = async () => {
        const playStoreUrl = 'market://details?id=com.opera.browser';
        const webPlayStoreUrl = 'https://play.google.com/store/apps/details?id=com.opera.browser';
    
        try {
          // Primero intenta abrir la Play Store
          const supported = await Linking.canOpenURL(playStoreUrl);
          
          if (supported) {
            await Linking.openURL(playStoreUrl);
          } else {
            // Si la Play Store app no está disponible, abre en el navegador
            await Linking.openURL(webPlayStoreUrl);
          }
        } catch (error) {
            Alert.error('Error al abrir la Play Store:', error);
          // Si falla, intentamos abrir en el navegador
          await Linking.openURL(webPlayStoreUrl);
        }
      };
    
    const crear_carpeta = async () => {
            const valorACopiar ='MyTaxes'
            await Clipboard.setStringAsync(valorACopiar);
            await FolderHandler.createMyTaxesFolder();
            const dato= await FolderHandler.checkIfDirectoryExists();
            
            setExiste(dato)
          };

    

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
        
        const Comprobarexistencia = async () => {
            const dato= await FolderHandler.checkIfDirectoryExists();
            
            setExiste(dato) 
           };
        Comprobarexistencia()
    })
    return unsubscribe;
  })
    return(
        <View style={styles.container}>

        <ScrollView style={{padding:10}}>
            <View style={{borderBottomWidth:1,borderBottomColor:'gray',marginBottom:20}}>
                <Text style={[styles.encabezado,{fontFamily: fonts.regularbold.fontFamily}]}>1- Debe crear la carpeta "MyTaxes".</Text>
                  <View style={{marginLeft:20,marginTop:10}}>
                    
                    <Text style={[styles.contenido,{fontFamily: fonts.regular.fontFamily}]}>✅ La opción abrirá un cuadro de diálogo para la creación.</Text>
                    <Text style={[styles.contenido,{fontFamily: fonts.regular.fontFamily}]}>✅ Seleccione la carpeta "Download" o "Descargas".</Text>
                    <Text style={[styles.contenido,{fontFamily: fonts.regular.fontFamily}]}>✅ Dentro de "Download", seleccione "Crear carpeta" y pegue el nombre.</Text>
                    <Text style={[styles.contenido,{fontFamily: fonts.regular.fontFamily}]}>✅ El nombre requerido se copiará automáticamente.</Text>
                    <Text style={[styles.contenido,{fontFamily: fonts.regular.fontFamily}]}>✅ El directorio debe ser "Download/MyTaxes".</Text>
                    <Text style={{fontFamily: fonts.regular.fontFamily}}>✅ Marque la opción "USAR ESTA CARPETA".</Text>
                  </View>
                

                 <TouchableOpacity
                  style={{ 
                    backgroundColor: existe ? 'gray'  : colors.acctionsbotoncolor, // Cambia el color si está deshabilitado
                    marginTop: 20,
                    marginBottom: 10,
                    height: 40,
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    borderRadius: 20,
                    flexDirection: 'row', // Alinea los elementos en fila
                    paddingHorizontal: 10, // Espaciado interno
                    opacity: !existe ? 1 : 0.5, // Reduce opacidad si está deshabilitado
                  }} 
                  
                 onPress={existe === false ? crear_carpeta : null}
                 disabled={existe} 
                  >
                    <Text style={{fontSize: 16,color: 'black',fontFamily: fonts.regularbold.fontFamily, marginRight: 8,}}>
                        Ir a Crear Carpeta
                    </Text>
                 </TouchableOpacity>
            </View>

            <View style={{borderBottomWidth:1,borderBottomColor:'gray',marginBottom:20}}>
                <Text style={[styles.encabezado,{fontFamily: fonts.regularbold.fontFamily}]}>2- Debe tener instalado el navegador Opera.</Text>
                <View style={{marginLeft:20,marginTop:10}}>

                    <Text style={[styles.contenido,{fontFamily: fonts.regular.fontFamily}]}>✅ Dentro del navegador, configure la carpeta de descargas.</Text>
                    <Text style={{fontFamily: fonts.regular.fontFamily}}>✅ Seleccione la carpeta "MyTaxes".</Text>
                </View>

                <TouchableOpacity 
                style={{ 
                  backgroundColor:  colors.acctionsbotoncolor, // Cambia el color si está deshabilitado
                  marginTop: 20,
                  marginBottom: 10,
                  height: 40,
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  borderRadius: 20,
                  flexDirection: 'row', // Alinea los elementos en fila
                  paddingHorizontal: 10, // Espaciado interno
                  opacity:  1, // Reduce opacidad si está deshabilitado
                }} 
                 onPress={openOperaInPlayStore}>
                    <Text style={{fontSize: 16,color: 'black',fontFamily: fonts.regularbold.fontFamily, marginRight: 8,}}>
                        Descarga navegador
                    </Text>
                 </TouchableOpacity>

            </View>
        </ScrollView>


        </View>
    )

}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      
    },
    encabezado:{
      fontSize: 16,
      color: 'black',
      marginBottom:5
    },
    contenido:{
      marginBottom:10
    }
  });
export default Configuraciones