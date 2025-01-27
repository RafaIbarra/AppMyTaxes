import React, { useState, useRef,useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated, Text, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';

const CustomTextInput = ({
  placeholder,
  value = "",
  onChangeText,
  onBlur,
  style,
  editable = true,
  formato = "default",
  keyboardType= "numeric" ,
  multiline = false,
  scrollEnabled = false,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const animatedPlaceholder = useRef(new Animated.Value(value ? 1 : 0)).current;

  const animatePlaceholder = (toValue) => {
    Animated.timing(animatedPlaceholder, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    animatePlaceholder(1);
  };


  const formatValue = (inputValue) => {
    if (formato === "numerico") {
      // Eliminar separadores existentes y aplicar formato de miles
      const numericValue = inputValue.replace(/\./g, ""); // Remover puntos existentes
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    } else if (formato === "factura") {
      // Formato 999-999-99999999999999999
      return inputValue
      .replace(/\D/g, "") // Remover caracteres no numéricos
      .replace(/^(\d{3})(\d{0,3})(\d{0,17})$/, (match, p1, p2, p3) => {
        let result = p1;
        if (p2) result += `-${p2}`;
        if (p3) result += `-${p3}`;
        return result;
      });
    }
    return inputValue; // Sin formato
  };
  const handleChangeText = (text) => {
    if (onChangeText) {
      onChangeText(formatValue(text));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      animatePlaceholder(0);
    }
    if (onBlur) {
      onBlur(value); // Llama a la función al salir del campo
    }
  };

  const handlePlaceholderPress = () => {
    if (editable) {
      inputRef.current?.focus();
    }
  };

  const placeholderTranslateY = animatedPlaceholder.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20], // Ajustado para mejor posicionamiento vertical
  });

  const placeholderFontSize = animatedPlaceholder.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });
  // useEffect(() => {
    
  //   if (value) {
  //     animatePlaceholder(1);
  //   } else if (!isFocused) {
  //     animatePlaceholder(0);
  //   }
  // }, [value]);

  useEffect(() => {
    // Formatear el valor cuando el componente se renderiza
    if (value) {
      const formattedValue = formatValue(value);
      if (formattedValue !== value) {
        // Asegurarse de que no se repita el valor formateado
        if (onChangeText) {
          onChangeText(formattedValue);
        }
      }
      animatePlaceholder(1);
    } else if (!isFocused) {
      animatePlaceholder(0);
    }
  }, [value]);
  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={handlePlaceholderPress} style={styles.placeholderContainer}>
        <Animated.Text
          style={[
            styles.placeholder,
            {
              color: colors.textsub,
              transform: [{ translateY: placeholderTranslateY }],
              fontSize: placeholderFontSize,
              
            },
          ]}
        >
          {placeholder}
        </Animated.Text>
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        // keyboardType={formato === "numerico" ? "numeric" : "default"}
        keyboardType={formato === "numerico" || formato === "numero" ? "numeric" : "default"}
        style={[
          styles.input,
          {
            borderColor:'#E0E0E0' ,
            backgroundColor: editable ?  'transparent' : '#DEDDDC',
            
          },
        ]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={editable}
        multiline={multiline} // Nueva prop
        scrollEnabled={scrollEnabled} // Nueva prop
        
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 8,
    height: 40,
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
    
  },
  placeholder: {
    position: 'absolute',
    left: 12,
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    fontFamily: 'SenRegular',
    color:'red'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'SenRegular',
    color: '#212121',
    
   
    height: '100%',
    
  },
});

export default CustomTextInput;