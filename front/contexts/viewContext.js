import {createContext, useEffect, useState} from 'react';

const viewContext = createContext();

const ViewContextProvider=({children})=>{
    const [viewState, setViewState] = useState(null);
    const [match, setMatch]=useState(false);

    useEffect(()=>{
        let mq=matchMedia('(min-width:600px)');
        setMatch(mq.matches);
        mq.addEventListener('change', e => {
            if(mq.matches!==match){
                setViewState(null);
                setMatch(mq.matches);
            }
        });
    },[]);

    const handleChangeView=(val)=>{
        setViewState(val);
    };

    return <viewContext.Provider value={{viewState, handleChangeView}}>{children}</viewContext.Provider>
};

export {ViewContextProvider};
export default viewContext;