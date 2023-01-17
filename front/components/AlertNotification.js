import React, {useEffect, useState} from 'react';

// Material Icons:
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NoEncryptionGmailerrorredIcon from '@mui/icons-material/NoEncryptionGmailerrorred';
import GppBadIcon from '@mui/icons-material/GppBad';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';

export default function AlertNotification({title, message, type, onCancel, acceptButton, onAccept, titleAcceptButton,
cancelButton, titleCancelButton, close, input:input}){
    const [isActive, setIsActive]=useState(false);
    let Icon=null;

    if(type){
        switch(type.toLowerCase()){
            case 'question':
                Icon=QuestionMarkIcon;
                break;
            case 'fail':
                Icon=ErrorOutlineIcon;
                break;
            case 'deny-password':
                Icon=NoEncryptionGmailerrorredIcon;
                break;
            case 'success':
                Icon=CheckCircleOutlineIcon;
                break;
            case 'warning':
                Icon=ReportGmailerrorredIcon;
                break;
            case 'unauthorized':
                Icon=GppBadIcon;
                break;
            default:
                Icon=null;
                break;
        }
    }

    useEffect(()=> setIsActive(true), []);

    const handleClose=()=>{
        setIsActive(false);
        if(onCancel) onCancel();
        setTimeout(close, 500);
    }

    const handleAccept=()=>{
        if(onAccept) onAccept();
        handleClose();
    }

    return (
        <>
            <div className={`alert-notification all-screen${isActive ? ' active' : ''}`} onClick={close}>
                <div className={`container${type ? ' '+type : ''}`} onClick={e => e.stopPropagation()}>
                    {Icon && (<div className="icon"><Icon/></div>)}
                    {!title ? '' : (
                        <div className={`title${type ? ' '+type : ''}`}>
                            {title}
                        </div>
                    )}

                    {!message ? '' : (
                        <div className={`message${type ? ' '+type : ''}`}>
                            {message}
                        </div>
                    )}

                    {input && (
                        <div className="input">
                            {input}
                        </div>
                    )}

                    <div className="buttons">
                        {acceptButton ? (
                            <>
                                <button className="accept" onClick={handleAccept}>
                                    {titleAcceptButton ? titleAcceptButton : 'Accept'}
                                </button>
                                {cancelButton && (
                                    <button className="cancel" onClick={handleClose}>
                                        {titleCancelButton ? titleCancelButton : 'Cancel'}
                                    </button>
                                )}
                            </>
                        ) : cancelButton ? (
                            <button className="cancel" onClick={handleClose}>{titleCancelButton ? titleCancelButton : 'Cancel'}</button>
                        ) : (
                            <button className="accept" onClick={handleClose}>Accept</button>
                        )}
                    </div>
                </div>
            </div>

            {/*<style jsx global>{`@import '../styles/AlertNotification';`}</style>*/}
        </>
    );
}