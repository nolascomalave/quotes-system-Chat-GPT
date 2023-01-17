import {createContext, useState} from 'react';

// Components:
import GlobalLoader from '../components/GlobalLoader';

const globalLoaderContext=createContext();

const GlobalLoaderContextProvider=({children})=>{
    const [globalLoader, setGlobalLoader]=useState(false);

    const showGlobalLoader=()=>{
        setGlobalLoader(true);
    };

    const hideGlobalLoader=()=>{
        setGlobalLoader(false);
    };

    return (
        <globalLoaderContext.Provider value={{hideGlobalLoader, showGlobalLoader, globalLoaderState:globalLoader}}>
            {children}
            <GlobalLoader open={globalLoader} />
        </globalLoaderContext.Provider>
    );
}

export {GlobalLoaderContextProvider};
export default globalLoaderContext;