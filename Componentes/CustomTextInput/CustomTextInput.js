import React, { useState, useRef, useEffect } from 'react';
import { View, Text,TextInput, StyleSheet, Animated, Pressable, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';

const CustomTextInput = ({
  placeholder,
  value = "",
  onChangeText,
  onBlur,
  style,
  editable = true,
  formato = "default",
  keyboardType = "numeric",
  multiline = false,
  scrollEnabled = false,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const animatedPlaceholder = useRef(new Animated.Value(value ? 1 : 0)).current;
  const [selection, setSelection] = useState({ start: value.length, end: value.length });

  const animatePlaceholder = (toValue) => {
    Animated.timing(animatedPlaceholder, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // const handleFocus = () => {
  //   setIsFocused(true);
  //   animatePlaceholder(1);
  //   console.log(value.length)
    
  // };
const handleFocus = () => {
  setIsFocused(true);
  animatePlaceholder(1);
  
  setTimeout(() => {
    setSelection({ start: value.length, end: value.length });
  }, 0); // Delay de 0ms para permitir la actualización correcta
};
  const formatValue = (inputValue) => {
    if (formato === "numerico") {
      const numericValue = inputValue.replace(/\./g, "");
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    } else if (formato === "factura") {
      return inputValue
        .replace(/\D/g, "")
        .replace(/^(\d{3})(\d{0,3})(\d{0,17})$/, (match, p1, p2, p3) => {
          let result = p1;
          if (p2) result += `-${p2}`;
          if (p3) result += `-${p3}`;
          return result;
        });
    }
    return inputValue;
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
      onBlur(value);
    }
  };

  const handlePlaceholderPress = () => {
    if (editable) {
      inputRef.current?.focus();
    }
  };

  const placeholderTranslateY = animatedPlaceholder.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const placeholderFontSize = animatedPlaceholder.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  useEffect(() => {
    if (value) {
      const formattedValue = formatValue(value);
      if (formattedValue !== value) {
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

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          value={value}
           //onChangeText={handleChangeText}
          onChangeText={(text) => {
            onChangeText(text);
            setSelection({ start: text.length, end: text.length }); // Ajustar cursor en cada cambio
          }}
          keyboardType={formato === "numerico" || formato === "numero" ? "numeric" : "default"}
          style={[
            styles.input,
            {
              borderColor: '#E0E0E0',
              backgroundColor: editable ? 'transparent' : '#DEDDDC',
              flex: 1,
            },
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          multiline={multiline}
          scrollEnabled={scrollEnabled}
          // selection={{ start: value.length, end: value.length }}
          selection={selection} // Controlado dinámicamente
          {...props}
        />
      </View>

      {rightIcon ? (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            if (onRightIconPress) {
              onRightIconPress();
            }
          }}
          style={styles.iconContainer}
        >
          {rightIcon}
        </TouchableOpacity>
      ):(
        null
      )
    }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 8,
    height: 40,
    position: 'relative',
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
    color: 'red',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
    height: '100%',
    paddingRight: 40, // Espacio para el icono
  },
  input: {
    fontSize: 14,
    fontFamily: 'SenRegular',
    color: '#212121',
    paddingHorizontal: 12,
    height: '100%',
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 2,
  },
});

export default CustomTextInput;
