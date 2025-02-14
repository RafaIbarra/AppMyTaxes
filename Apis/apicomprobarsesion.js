
import API_BASE from './ApiBase';

import Handelstorage from '../Storage/handelstorage';


const fetchWithTimeout = (url, options, timeout = 7000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  };

async function Comprobarsesion(endpoint,metodo,bodyoptions){
    
    let data={}
    let resp=0
    let datos={}
    let requestOptions = {};
    const datosstarage=await Handelstorage('obtener');
    const tokenstorage=datosstarage['token']
    const sesionstorage=datosstarage['sesion']
    
    bodyoptions.SESION=sesionstorage;
    
    
    if (metodo.toUpperCase()==='GET'){
        requestOptions = {
            method: metodo.toUpperCase(),
            headers: {
                        'Authorization':`Bearer ${tokenstorage}`,
                    }
            }

    } else{
        requestOptions = {
            method: metodo.toUpperCase(),
            headers: {  'Content-Type': 'application/json',
                        
                        'Authorization':`Bearer ${tokenstorage}`,
                    },
            body: JSON.stringify(bodyoptions)
            }
    }
    
    try {
        const response = await fetchWithTimeout(`${API_BASE}/${endpoint}`, requestOptions); 
        result_data = await response.json();
        resp = response.status;
        if(resp===200){
          data=result_data['datauser']
        }else{

          data=result_data['data']
        }
        datos = { data, resp }
         
        
  
      } catch (err) {
        
        data = [];
        resp = 6000; // Código de error personalizado para indicar que no se pudo conectar al servidor
        datos = { data, resp };
      }
    
      return datos; // Siempre retorna datos, incluso en caso de error
                
            
    
}

export default Comprobarsesion