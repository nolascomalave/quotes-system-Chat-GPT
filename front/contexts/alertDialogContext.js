import {createContext, useState} from 'react';

const alertDialogContext=createContext();

const ProviderAlertDialogContext=({children})=>{
    const [openDialog, setOpenDialog]=useState(false);

    const handleCloseDialog=()=>{
        setOpenDialog(false);
    };

    const handleOpenDialog=()=>{
        setOpenDialog(true);
    };

    const handleAcceptDialog=()=>{
        window.location='/logout';
        handleCloseDialog();
    };

    return <alertDialogContext.Provider value={{handleAcceptDialog, handleCloseDialog, handleOpenDialog, openDialog}}>{children}</alertDialogContext.Provider>
}

export {ProviderAlertDialogContext};
export default alertDialogContext;