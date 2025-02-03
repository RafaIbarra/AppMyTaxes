import React, { useContext,useState,useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../../AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';

function ScreensCabecera ({ navigation,backto,title,estadosupdate,reiniciar_componentes }){
    
    const { colors,fonts } = useTheme();
    const { navigate } = useNavigation();
    const { estadocomponente } = useContext(AuthContext);
    const {  actualizarEstadocomponente } = useContext(AuthContext);
    const {  recargar_componentes } = useContext(AuthContext);

    const volver_cabecera=()=>{
        // console.log('volver_cabecera')
        // console.time('Tiempo de renderizado de ScreensCabecera');
        const inicio = performance.now();
        if(reiniciar_componentes){
            recargar_componentes()
        }
        if(estadosupdate !==undefined){
            
            actualizarEstadocomponente(estadosupdate.name,estadosupdate.value)
        }
        if (backto=='back'){
            
            navigation.goBack();
        }else{
            
            navigate(backto, { })
        }
        const fin = performance.now();
        // console.timeEnd('Tiempo de volver_cabecera')
        // console.log('fin volver_cabecera')
        // console.log(`Tiempo de volver_cabecera: ${fin - inicio}ms`);
    }
    
    return(
        <View >
            <View style={[styles.cabeceracontainer,{backgroundColor:colors.card}]}>
              
                <TouchableOpacity style={[styles.botoncabecera,{ backgroundColor:'#57DCA3'}]} 
                                    onPress={volver_cabecera}
                >
                    <Ionicons name="arrow-back" size={25} color="white" />
                </TouchableOpacity> 
                <Text style={[styles.titulocabecera, { color: colors.textcard, fontFamily: fonts.regularbold.fontFamily}]}>{title}</Text>

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
export default ScreensCabecera