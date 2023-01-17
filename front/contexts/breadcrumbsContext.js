import {createContext, useEffect, useState} from 'react';
import {useRouter} from 'next/router';

const breadcrumbsContext=createContext();

const initialOptions={home:false, routes:[], actualRoute:null}

const BreadcrumbsContextProvider=({children})=>{
    let route=useRouter();
    const [options, setOptions]=useState(initialOptions);

    const setBreadcrumbsOptions=(opt)=>{
        opt=(typeof opt==='object') ? Array.isArray(opt) ? {} : opt : {};
        if(!('routes' in opt) || (('routes' in opt) && !Array.isArray(opt.routes))) opt.routes=[];
        if(!('home' in opt)) opt.home=false;
        opt.actualRoute=route.asPath;
        setOptions(opt);
    };

    return (
        <breadcrumbsContext.Provider value={{route, setBreadcrumbsOptions, options}}>{children}</breadcrumbsContext.Provider>
    );
}

export {BreadcrumbsContextProvider};
export default breadcrumbsContext;