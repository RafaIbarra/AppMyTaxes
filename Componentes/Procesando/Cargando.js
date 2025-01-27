import React, { useContext } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AuthContext } from '../../AuthContext';
import { useTheme } from '@react-navigation/native';

import LottieView from 'lottie-react-native';

function Cargando({ navigation }) {
    const { estadocomponente } = useContext(AuthContext);
    const { colors, fonts } = useTheme();
    return (
        <View style={styles.overlay}>
            <Text style={[styles.texto, { fontFamily: fonts.regularbold.fontFamily }]}>
                {estadocomponente.tituloloading}
            </Text>

            <View style={styles.curvedContainer}>
                <LottieView
                    source={require('../../assets/cargando.json')}
                    style={styles.video}
                    autoPlay
                    loop
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center', // Centra verticalmente
        alignItems: 'center', // Centra horizontalmente
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: '#e3ede2',
    },
    curvedContainer: {
        width: 300, // Tamaño del contenedor
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100, // Hace el contenedor completamente redondo
        overflow: 'hidden', // Asegura que el contenido se ajuste al borde redondeado
        backgroundColor: '#fff', // Color de fondo opcional para contraste
    },
    video: {
        width: '100%',
        height: '100%',
    },
    texto: {
        marginBottom: 20, // Espacio entre el texto y el LottieView
        fontSize:20,
        color: '#b8860b',
    },
});

export default Cargando;
