import React, { createContext, useState, useContext } from 'react';


export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [activarsesion, setActivarsesion] = useState(false);
    const [versionsys,setVersionsys]=useState('Version 1.9')
    const [sesiondata, setSesiondata] = useState();
    const [periodo, setPeriodo] = useState(false);
    
    const [estadocomponente,setEstadocomponente]=useState({
        
        datositem:[],
        datourl:[],
        
        datocdc:{'nombrecdc':''},
        
        obtuvopermiso:false,
        datafactura:[],
        isHeaderVisible:true,
        activecamara :false,
        qrdetected:false,
        loading:false,
        tituloloading:'ESPERANDO TRANSCRIPCION..',

        compresumen:true,
        dataresumen:[],

        complistado:true,
        datalistadofactura:[],
        
        factura_editar:0
    
      })

      const reiniciarvalores=()=>{
        
        
        actualizarEstadocomponente('datositem',[])
        actualizarEstadocomponente('datourl',[])
        actualizarEstadocomponente('datocdc',[])
        actualizarEstadocomponente('obtuvopermiso',false)
    
        actualizarEstadocomponente('datafactura',[])
        actualizarEstadocomponente('isHeaderVisible',true)
        actualizarEstadocomponente('activecamara',false)
        actualizarEstadocomponente('qrdetected',false)
        actualizarEstadocomponente('loading',false)
        actualizarEstadocomponente('tituloloading','')
        actualizarEstadocomponente('compresumen',true)
        actualizarEstadocomponente('complistado',true)
        
    
      }
      const recargar_componentes=()=>{
        
        actualizarEstadocomponente('compresumen',true)
        actualizarEstadocomponente('complistado',true)
        actualizarEstadocomponente('factura_editar',0)
        actualizarEstadocomponente('datafactura',[])
        
      }

    const actualizarEstadocomponente = (campo, valor) => {
        setEstadocomponente(prevState => ({
          ...prevState,
          [campo]: valor,
        }));
      };
    
    return (
        <AuthContext.Provider value={{ 
          activarsesion, setActivarsesion,
          versionsys,setVersionsys,
          sesiondata, setSesiondata,
          estadocomponente,actualizarEstadocomponente,
          reiniciarvalores,
          recargar_componentes,
          periodo, setPeriodo
          }}>
          {children}
        </AuthContext.Provider>
      );

}
