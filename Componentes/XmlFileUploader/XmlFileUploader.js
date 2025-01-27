import React, { useState, useEffect,useContext } from 'react';
import { View, Button, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';

import AndroidXmlHandler from '../XmlHandler/AndroidXmlHandler';

import { AuthContext } from '../../AuthContext';
import { useNavigation } from "@react-navigation/native";

const XmlFileUploader = ({ navigation }) => {
  const { estadocomponente } = useContext(AuthContext);
  const {  actualizarEstadocomponente } = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [status, setStatus] = useState('');
  const [xmlFiles, setXmlFiles] = useState([]);
  const { navigate } = useNavigation();
  // useEffect(() => {
  //   checkDirectoryAccess();
  // }, []);

  const checkDirectoryAccess = async () => {
    const access = await AndroidXmlHandler.hasDirectoryAccess();
    setHasAccess(access);
    if (access) {
      //loadXmlFiles();
      await filtrodatos()
    }
  };

  const loadXmlFiles = async () => {
    try {
     
      // const nombrecdc=estadocomponente.datocdc.nombrecdc
      
      const files = await AndroidXmlHandler.listXmlFiles();
      // Convertir la lista de URIs a objetos con información más detallada
      const formattedFiles = files.map(fileUri => ({
        uri: fileUri,
        fileName: decodeURIComponent(fileUri.split('%2F').pop()), // Decodifica el nombre del archivo
        timestamp: new Date().getTime() // Podrías obtener la fecha real del archivo si lo necesitas
      }));
      
      

      
      return formattedFiles
    } catch (error) {
      setStatus(`Error al cargar archivos: ${error.message}`);
    }
  };

  const filtrodatos = async()=>{
    const datafiles=await loadXmlFiles()
    const nombrecdc="01800319702001005008254822024103013609116639.xml"
    if (datafiles){
     
      const resultado = datafiles.filter(file => file.fileName === nombrecdc);
    
      //handleUploadXml(item.uri)
      
      
      handleUploadXml(resultado[0].uri)
      setXmlFiles(resultado);
    }


  }

  const handleSelectDirectory = async () => {
    setIsProcessing(true);
    setStatus('Seleccionando directorio...');
    try {
      const directory = await AndroidXmlHandler.selectDirectory();
      if (directory) {
        setHasAccess(true);
        setStatus('Directorio seleccionado correctamente');
        await loadXmlFiles();
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadXml = async (fileUri) => {
    
    actualizarEstadocomponente('factura_editar',0)
    setIsProcessing(true);
    setStatus('Subiendo archivo...');
    try {
     const data= await AndroidXmlHandler.uploadXmlFile(
        fileUri);
      
      setStatus('Archivo subido correctamente');
      actualizarEstadocomponente('datafactura',data)
      navigate("DetalleFactura")
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFileItem = ({ item }) => (
    <View style={styles.fileItem}>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>{item.fileName}</Text>
        <Text style={styles.fileDate}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <Button 
        title="Subir" 
        onPress={() => handleUploadXml(item.uri)}
        disabled={isProcessing}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {!hasAccess && (
        <Button 
          title="Seleccionar Directorio MyTaxes" 
          onPress={handleSelectDirectory}
          disabled={isProcessing}
        />
      )}

      {hasAccess && xmlFiles.length > 0 && (
        <>
          <Text style={styles.header}>Archivos XML disponibles</Text>
          <FlatList
            data={xmlFiles}
            keyExtractor={(item) => item.uri}
            renderItem={renderFileItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </>
      )}
      <Button 
          title="Cargar archivo" 
          onPress={checkDirectoryAccess}
         
        />
      {hasAccess && xmlFiles.length === 0 && (
        <Text style={styles.noFiles}>No se encontraron archivos XML</Text>
      )}

      {isProcessing && <ActivityIndicator style={styles.loader} />}
      
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  fileInfo: {
    flex: 1,
    marginRight: 10,
  },
  fileName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  fileDate: {
    fontSize: 12,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  loader: {
    marginVertical: 10,
  },
  status: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  noFiles: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  }
});

export default XmlFileUploader;