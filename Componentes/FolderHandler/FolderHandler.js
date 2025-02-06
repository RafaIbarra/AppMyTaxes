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
      //const savedUri = await AsyncStorage.getItem(DIRECTORY_URI_KEY);
      const savedUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload';
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

  async createMyTaxesFolder () {
    try {
        
      // Primero solicitamos permiso para acceder a Downloads
      const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
        // En Android 11+, necesitas usar el URI de Downloads
        DOWNLOADS_FOLDER
      );
  
      if (permission.granted) {
        // Intentamos crear el archivo que servirá como marcador de carpeta
        
        const newFolderUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permission.directoryUri,
          //'.MyTaxes', // Usando un archivo oculto como marcador de carpeta
          'application/octet-stream'
        );
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      
        if (!permissions.granted) {
          throw new Error('Permiso denegado para acceder al directorio');
        }

        // Guardar el URI del directorio
        const directoryUri = permissions.newFolderUri;
        this.selectedDirectory = { uri: directoryUri };
        await AsyncStorage.setItem(DIRECTORY_URI_KEY, directoryUri);
        Alert.alert('Carpeta creada exitosamente');
        return true;
      } else {
        
       Alert.alert(`Permiso denegado`);
        return false
      }
    } catch (error) {
       Alert.alert(`Error al crear la carpeta: ${error} `);
        return false
    }
  };


 

  async checkIfDirectoryExists() {
    
    try {
      // Comprobar si la URI del directorio seleccionado está disponible
      if (!this.selectedDirectory || !this.selectedDirectory.uri) {
        throw new Error('No se ha seleccionado un directorio.');
      }
  
      // Intentar acceder al directorio y comprobar si está disponible
      //const directoryUri = DOWNLOADS_FOLDER
      const directoryUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload%2FMyTaxes/document/primary%3ADownload%2FMyTaxes%'
      
      
      
      // Intentar leer el directorio, si ocurre un error puede significar que el directorio ya no es accesible
      const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);
      
      // Verificar si se pudieron leer los archivos
      if (files && files.length > 0) {
        //Alert.alert('El directorio "MyTaxes" existe y contiene archivos.');
        return true;
      } else {
        Alert.alert('El directorio "MyTaxes" está vacío.');
        return true;
      }
    } catch (error) {
      // Si el error es por el directorio no accesible (como renombrado o eliminado)
      if (error.message.includes('isn\'t readable')) {
        //console.log('El directorio ha sido renombrado o eliminado. Solicita al usuario seleccionar un nuevo directorio.');
        // Aquí podrías pedir al usuario que seleccione nuevamente un directorio
        return false;
      }
  
      // Si hay otros errores
        
      Alert.alert(`Error al verificar el directorio: ${error} `);
      
    }
  }


  
  async hasDirectoryAccess() {
    return this.selectedDirectory !== null;
  }
}

export default new FolderHandler();
