import React, { useContext,useState,useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../../AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

function ScreensCabeceraRegistro ({ navigation,backto,title,estadosupdate,accioneditar,accioneliminar }){
    const { colors,fonts } = useTheme();
    const { navigate } = useNavigation();
    const { estadocomponente } = useContext(AuthContext);
    const {  actualizarEstadocomponente } = useContext(AuthContext);

    const volver=()=>{
        
        if(estadosupdate !==undefined){
            
            actualizarEstadocomponente(estadosupdate.name,estadosupdate.value)
        }
        if (backto=='back'){
            navigation.goBack();
        }else{

            navigate(backto, { })
        }
    }
    return(
        <View >
            <View style={[styles.cabeceracontainer,{backgroundColor:colors.card}]}>
              
                <TouchableOpacity style={[styles.botoncabecera,{ backgroundColor:'#57DCA3'}]} onPress={volver}>
                    <Ionicons name="arrow-back" size={25} color="white" />
                </TouchableOpacity> 

                <Text style={[styles.titulocabecera, { color: colors.textcard, fontFamily: fonts.regularbold.fontFamily}]}>{title}</Text>

                <TouchableOpacity style={[styles.botoncabecera,{ backgroundColor:'#57DCA3',marginRight:10}]} onPress={volver}>
                    <AntDesign name="edit" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.botoncabecera,{ backgroundColor:'red'}]} onPress={volver}>
                    <MaterialIcons name="delete-forever" size={30} color="white" />
                </TouchableOpacity>
                
            </View>
        </View>
    )

}
const styles = StyleSheet.create({
    cabeceracontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        height:55
      },
      titulocabecera: {
        flex: 1,
        fontSize: 16,
        // fontWeight: 'bold',
        textAlign: 'center',
        // color:'white'
      },
      botoncabecera: {
        // backgroundColor: 'blue',
        width: 40, // Define el ancho del botón
        height: 40, // Define la altura del botón
        borderRadius: 20, // Define la mitad de la dimensión del botón para obtener una forma circular
        justifyContent: 'center', // Alinea el contenido (icono) verticalmente en el centro
        alignItems: 'center', // Alinea el contenido (icono) horizontalmente en el centro
      },
})
export default ScreensCabeceraRegistro