import React, {useState, useEffect, useContext} from 'react';

// Material Icons:
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';

// Contexts:
import globalLoaderContext from '../contexts/globalLoaderContext';

export default function RequirePasswordAlert({children, open, close, show, setShow, acceptAction, cancelAction, title, message}){
    const [isActive, setIsActive]=useState(false);
    const {hideGlobalLoader, showGlobalLoader, globalLoaderState} = useContext(globalLoaderContext);

    const handleClose=()=>{
        setIsActive(false);
        if(cancelAction) cancelAction();
        setTimeout(()=>setShow(false), 250);
    }

    const handleAccept=()=>{
        if(acceptAction){
            showGlobalLoader();
            acceptAction.action();
            if(acceptAction.close!==false) handleClose();
        }else{
            handleClose();
        }
    }

    useEffect(()=>{
        console.log(show);
        if(show){
            setIsActive(true);
            open();
        }else{
            console.log(globalLoaderState);
            if(globalLoaderState) hideGlobalLoader();
        }
    }, [show]);

    useEffect(handleClose, [close]);

    return (
        <>
            <form
                onSubmit={(e)=> {e.preventDefault(); handleAccept();}}
                className={`require-password alert-notification warning all-screen${isActive ? ' active' : ''}${show ? ' show' : ''}`}
                onClick={handleClose}
            >
                <div className='container' onClick={e => e.stopPropagation()}>
                    <div className="icon"><ReportGmailerrorredIcon/></div>

                    <div className='title'>
                        {title}
                    </div>

                    <div className='message'>
                        {message}
                        <br/>
                        <p>You must provide the password to rerun the action.</p>
                    </div>

                    <div className="input">
                        {children}
                    </div>

                    <div className="buttons">
                        <button type="submit" className="accept">
                            Accept
                        </button>
                        <button type="button" className="cancel" onClick={handleClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            </form>

            {/*<style jsx global>{`@import '../styles/RequirePasswordAlert';`}</style>*/}
        </>
    );
}