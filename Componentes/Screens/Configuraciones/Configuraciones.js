import React,{useState,useEffect,useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import {  View,Text,TouchableOpacity,Linking,StyleSheet,Alert } from "react-native";
import { Button} from 'react-native-paper';
import Handelstorage from "../../../Storage/handelstorage";
import Generarpeticion from "../../../Apis/peticiones";
import FolderHandler from "../../FolderHandler/FolderHandler";

import { AuthContext } from "../../../AuthContext";
import { useTheme } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

/*Iconos*/

import { AntDesign } from '@expo/vector-icons';
import ScreensCabecera from "../../ScreensCabecera/ScreensCabecera";


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
        console.log('aca')
        const Comprobarexistencia = async () => {
            const dato= await FolderHandler.checkIfDirectoryExists();
            console.log(dato)
            setExiste(dato) 
           };
        Comprobarexistencia()
    })
    return unsubscribe;
  })
    return(
        <View style={styles.container}>
            <View>
                <Text>1-Debe crear la Carpeta MyTaxes </Text>
                <Text>      *La opcion le abrira el cuadro de dialogo para la creacion </Text>
                <Text>      *Seleccione la Carpeta Download o Descargas </Text>
                <Text>      *Dentro de Download seleccione Crear Carpeta y pegue el nombre</Text>
                <Text>      *El nombre requerido se copiara en forma automatica</Text>
                <Text>      *El directorio debe ser Download/MyTaxes </Text>
                <Text>      *Marque la opcion USAR ESTA CARPETA </Text>

                 <TouchableOpacity
                 onPress={existe === false ? crear_carpeta : null}
                  >
                    <Text style={{fontSize: 16,color: 'black',fontFamily: fonts.regularbold.fontFamily, marginRight: 8,}}>
                        Ir a Crear Carpeta
                    </Text>
                 </TouchableOpacity>
            </View>

            <View>
                <Text>2-Debe tener instalado el navegador Opera </Text>
                <Text>      *Dentro del navegador configure la carpeta de descargas </Text>
                <Text>      *Selecione la carpeta MyTaxes </Text>

                <TouchableOpacity 
                 onPress={openOperaInPlayStore}>
                    <Text style={{fontSize: 16,color: 'black',fontFamily: fonts.regularbold.fontFamily, marginRight: 8,}}>
                        Descarga navegador
                    </Text>
                 </TouchableOpacity>

            </View>
        </View>
    )

}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      
      
    }
  });
export default Configuraciones