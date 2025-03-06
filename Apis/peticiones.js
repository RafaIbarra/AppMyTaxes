

import Handelstorage from "../Storage/handelstorage";
import API_BASE from "./ApiBase";
async function Generarpeticion(endpoint, metodo, bodyoptions) {
    let data = {};
    let resp = 0;
    let datos = {};
    let requestOptions = {};
    let tiempoespera=10000
    const datosstarage = await Handelstorage('obtener');
  
    const tokenstorage = datosstarage['token'];
    const sesionstorage = datosstarage['sesion'];
  
    if (bodyoptions instanceof FormData) {
      bodyoptions.append('SESION', sesionstorage);
    } else {
      bodyoptions.SESION = sesionstorage;
    }
  
    if (metodo.toUpperCase() === 'GET') {
      requestOptions = {
        method: metodo.toUpperCase(),
        headers: {
          'Authorization': `Bearer ${tokenstorage}`,
        }
      };
    } else {
    if (endpoint === 'UploadAudio/' || endpoint === 'LecturaImagenCdc/') {
        tiempoespera=90000
        requestOptions = {
          method: metodo.toUpperCase(),
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${tokenstorage}`,
          },
          body: bodyoptions
        };
      } else {
        requestOptions = {
          method: metodo.toUpperCase(),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenstorage}`,
          },
          body: JSON.stringify(bodyoptions)
        };
      }
    }
  
    try {
      // Configuramos un límite de tiempo (timeout) de 10 segundos
      const timeoutPromise = new Promise((_, reject) =>
        
        setTimeout(  () => reject(new Error('Tiempo expirado para respuesta')), tiempoespera)
      );
  
      // Competimos entre la solicitud fetch y el temporizador
      const response = await Promise.race([
        fetch(`${API_BASE}/${endpoint}`, requestOptions),
        timeoutPromise
      ]);
  
      data = await response.json();
      resp = response.status;
  
    } catch (error) {
      // Si ocurre un error o el tiempo expira, retornamos un error predefinido
      data =  { error: "Tiempo expirado para respuesta o error en la solicitud" };
      resp = 500;
    }
  
    datos = { data, resp };
    return datos;
  }
  
  export default Generarpeticion;
  

// async function Generarpeticion(endpoint,metodo,bodyoptions){
  
//   let data={}
//   let resp=0
//   let datos={}
//   let requestOptions = {};
//   const datosstarage=await Handelstorage('obtener');
  
//   const tokenstorage=datosstarage['token']
//   const sesionstorage=datosstarage['sesion']
  
 
//   if (bodyoptions instanceof FormData) {
//         bodyoptions.append('SESION', sesionstorage);
    
//    }else{
//     bodyoptions.SESION=sesionstorage;
//    }
  
  
//   if (metodo.toUpperCase()==='GET'){
//       requestOptions = {
//           method: metodo.toUpperCase(),
//           headers: {
//                       'Authorization':`Bearer ${tokenstorage}`,
//                   }
//           }

//   } else{

//         if (endpoint==='UploadAudio/'){
            
            
//             requestOptions = {
//             method: metodo.toUpperCase(),
//             headers: {  
//                         'Content-Type': 'multipart/form-data',
                        
//                         'Authorization':`Bearer ${tokenstorage}`,
//                         },
//             body: bodyoptions
//             }

//         }else{
            
//             requestOptions = {
//             method: metodo.toUpperCase(),
//             headers: {  'Content-Type': 'application/json',
                        
//                         'Authorization':`Bearer ${tokenstorage}`,
//                     },
//             body: JSON.stringify(bodyoptions)
//             }
//         }
//   }
  

//   const response = await fetch(`${API_BASE}/${endpoint}`, requestOptions);  
  
//   data= await response.json();
  
//   resp= response.status;
  
//   datos={data,resp}
//   return datos
// }

// export default Generarpeticion


