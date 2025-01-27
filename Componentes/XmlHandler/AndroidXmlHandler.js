import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DIRECTORY_URI_KEY = 'mytaxes_directory_uri';

class AndroidXmlHandler {
  constructor() {
    this.selectedDirectory = null;
    this.initializeFromStorage();
  }

  async initializeFromStorage() {
    try {
      const savedUri = await AsyncStorage.getItem(DIRECTORY_URI_KEY);
      if (savedUri) {
        this.selectedDirectory = { uri: savedUri };
      }
    } catch (error) {
      console.error('Error al recuperar directorio guardado:', error);
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
      console.error('Error al seleccionar directorio:', error);
      throw error;
    }
  }

  async listXmlFiles() {
    try {
      if (!this.selectedDirectory) {
        throw new Error('No hay directorio seleccionado');
      }

      const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(
        this.selectedDirectory.uri
      );
      
      // Filtrar solo archivos XML
      return files.filter(fileUri => fileUri.toLowerCase().endsWith('.xml'));
    } catch (error) {
      console.error('Error al listar archivos XML:', error);
      throw error;
    }
  }

  async findXmlFile(fileName) {
    try {
      if (!this.selectedDirectory) {
        throw new Error('No hay directorio seleccionado');
      }

      const files = await this.listXmlFiles();
      const targetFile = files.find(fileUri => 
        fileUri.toLowerCase().includes(fileName.toLowerCase())
      );

      if (!targetFile) {
        throw new Error(`Archivo ${fileName} no encontrado`);
      }

      return {
        uri: targetFile,
        name: fileName,
        type: 'application/xml'
      };
    } catch (error) {
      console.error('Error al buscar archivo XML:', error);
      throw error;
    }
  }

  async uploadXmlFile(fileUri) {
    try {
      // Leer el contenido del archivo usando SAF
      const content = await FileSystem.StorageAccessFramework.readAsStringAsync(fileUri);

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileUri.split('/').pop(),
        type: 'application/xml'
      });

      // const response = await fetch('http://192.168.1.103:8000/api/LecturaArchivoXml/', {
      const response = await fetch('https://tax.rafaelibarra.xyz/api/LecturaArchivoXml/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Error en la subida: ${response.status}`);
      }
      const data = await response.json();
      return data
    } catch (error) {
      console.error('Error al subir archivo XML:', error);
      throw error;
    }
  }

  async readXmlContent(fileUri) {
    try {
      return await FileSystem.StorageAccessFramework.readAsStringAsync(fileUri);
    } catch (error) {
      console.error('Error al leer archivo XML:', error);
      throw error;
    }
  }

  async hasDirectoryAccess() {
    return this.selectedDirectory !== null;
  }
}

export default new AndroidXmlHandler();