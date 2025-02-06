
import API_BASE from './ApiBase';

async function Iniciarsesion(usuario,password,version){
    
    let data={}
    let resp=0
    let datos={}
    const endpoint='Login/'
    const requestOptions = {
        method: 'POST',
        headers: {  'Content-Type': 'application/json',
                    
                },
        body: JSON.stringify({
                    username: usuario.toLowerCase(),
                    password: password,
                    version:version
                  }),
        }
    
    const response = await fetch(`${API_BASE}/${endpoint}`, requestOptions);  
        data= await response.json();
        resp= response.status;
        
        datos={data,resp}
        return datos

} 
export default Iniciarsesion

