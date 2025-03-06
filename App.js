

import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator,Alert,StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import { AuthProvider } from "./AuthContext";
import Navigation from "./Navigation";
import * as Font from "expo-font";
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    
    const loadFonts = async () => {
      try {
        // Cargar fuentes personalizadas
        await Font.loadAsync({
   
          SenRegular: require("./assets/fonts/Sen-Regular.ttf"),
          SenBold: require("./assets/fonts/Sen-Bold.ttf"),
        });

        setFontsLoaded(true);
      } catch (error) {
        
        Alert.alert(`Error cargando las fuentes: ${error.message}`);
      }
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Cargando fuentes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="rgba(28, 44, 52, 0.9)"
        barStyle="light-content"
      />
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(28, 44, 52, 0.9)",
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(28, 44, 52, 0.9)",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
});
