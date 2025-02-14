import * as FileSystem from 'expo-file-system';
import { Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DIRECTORY_URI_KEY = 'mytaxes_directory_uri';
const DOWNLOADS_FOLDER='content://com.android.externalstorage.documents/tree/primary%3ADownload'
class FolderHandler {
  constructor() {
    // this.selectedDirectory = 'content://com.android.externalstorage.documents/tree/primary%3ADownload%2FMyTaxes/document/primary%3ADownload%2FMyTaxes%';
    this.selectedDirectory = DOWNLOADS_FOLDER;
    this.initializeFromStorage();
  }

  async initializeFromStorage() {
    try {
      const savedUri = await AsyncStorage.getItem(DIRECTORY_URI_KEY);
      //const savedUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload';
      if (savedUri) {
        this.selectedDirectory = { uri: savedUri };
      }
    } catch (error) {
      
      Alert.alert(`initializeFromStorage ${error} `);
    }
  }

  async selectDirectory() {
    try {
      // Usar FileSystem.StorageAccessFramework para solicitar acceso al directorio
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (!permissions.granted) {
        throw new Error('Permiso denegado para acceder al directorio');
      }

      // Guardar el URI del directorio
      const directoryUri = permissions.directoryUri;
      this.selectedDirectory = { uri: directoryUri };
      await AsyncStorage.setItem(DIRECTORY_URI_KEY, directoryUri);
      
      return { uri: directoryUri };
    } catch (error) {

     Alert.alert(`Error al selectDirectory directorio: ${error} `);
    }
  }

  async createMyTaxesFolder() {
    try {
        // Solicitar permiso para acceder a un directorio
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permission.granted) {
            const directoryUri = permission.directoryUri;

            // Verificar si el directorio contiene "Download" y "MyTaxes"
            if (directoryUri.includes("Download") && directoryUri.includes("MyTaxes")) {
                
                // Crear un archivo oculto como marcador de carpeta
                const newFolderUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    directoryUri,
                    '.MyTaxes', 
                    'application/octet-stream'
                );
                

                // Guardar el URI del directorio en AsyncStorage
                await AsyncStorage.setItem(DIRECTORY_URI_KEY, directoryUri);
                this.selectedDirectory = { uri: directoryUri };

                return true;
            } else {
              Alert.alert(
                "Error al verificar el directorio",
                "Cree la carpeta 'MyTaxes' dentro de la carpeta 'Download'!",
                [{ text: "OK" }]
              );
                
                return false;
            }
        } else {
            Alert.alert("Permiso denegado");
            return false;
        }
    } catch (error) {
        Alert.alert(`Error al crear la carpeta: ${error}`);
        
        return false;
    }
}



async checkIfDirectoryExists() {
  try {
      const savedUri = await AsyncStorage.getItem(DIRECTORY_URI_KEY);

      if (!savedUri || typeof savedUri !== 'string') {
        
          return false;
      }

      // Verificar si la URI realmente apunta a la carpeta "MyTaxes"
      if (!savedUri.includes("Download") || !savedUri.includes("MyTaxes")) {
        
          return false;
      }

      // Intentar leer el contenido del directorio
      try {
          const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(savedUri);
          
          return true; // Si no hay error, el directorio existe
      } catch (error) {
      
          return false;
      }
  } catch (error) {

      Alert.alert("Error al verificar el directorio:", error.message);
      return false;
  }
}

 

  // async checkIfDirectoryExists() {
    
  //   try {

  //     const savedUri = await AsyncStorage.getItem(DIRECTORY_URI_KEY);


  //       if (savedUri && typeof savedUri === 'string' && savedUri.includes("MyTaxes")) {
  //         try {
  //             const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(savedUri);
                
  //               return true; // Si no lanza error, el directorio existe
  //           } catch (error) {
  //               Alert.alert('El directorio no existe o no se puede acceder:', error);
  //               return false;
  //           }

  //     } else {
  //         return false;
  //     }
   
  //   } catch (error) {
      
  //     Alert.alert(`Error al verificar el directorio: ${error} `);
  //     return false
        
      
  //   }
  // }


  
  async hasDirectoryAccess() {
    return this.selectedDirectory !== null;
  }
}

export default new FolderHandler();

