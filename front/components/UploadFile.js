import React, {useState, useEffect} from 'react';
import {Types} from 'mongoose';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import BackspaceIcon from '@mui/icons-material/Backspace';

export default function UploadFile({label, icon:Icon, errors, id, maxFiles, cleaner, reference, requiered, value, setFiles, onChange, type, ...props}){
    const [names, setNames]=useState([]);
    const inputId=id || 'd'+new Types.ObjectId().toString();
    if(!value) value=[];

    const handleChange=(e)=>{
        if(onChange) onChange(e);
        let newNames=[], count=1;
        for(let i of e.target.files){
            newNames.push({value:i.name, error: errors ? errors[count-1] ? errors[count-1] : null : count>maxFiles ? 'Only '+maxFiles+' files allowed!' : null});
            count++;
        }
        setNames(newNames);
    };

    const cleanFiles=()=>{
        document.querySelector('#'+inputId).value='';
        setFiles([]);
        setNames([]);
    }

    useEffect(()=>{
        cleanFiles();
    }, [cleaner])

    useEffect(()=>{
        let newNames=[], count=1;
        for(let i of document.querySelector('#'+inputId).files){
            newNames.push({value:i.name, error: errors ? errors[count-1] ? errors[count-1] : null : count>maxFiles ? 'Only 1 files allowed!' : null});
            count++;
        }
        setNames(newNames);
    }, [errors]);

    return (
        <>
            <div className="upload-file">
                <input
                    className="upload-file__input"
                    ref={reference}
                    type='file'
                    {...props}
                    onChange={handleChange}
                    id={inputId}
                    requiered={!requiered ? false : true}
                />
                <div className="upload-file__label-content">
                    <label
                        className={`upload-file__label-content__label centerFlex${names.length>0 ? ' active' : ''}`}
                        htmlFor={inputId}
                    >
                        {Icon ? <Icon/> : <AttachFileIcon/>}
                    </label>
                    {names.length>0 && (
                        <button
                            type="button"
                            onClick={cleanFiles}
                            className="upload-file__label-content__clear"
                            title="Clear"
                        >
                            <BackspaceIcon/>
                        </button>
                    )}
                </div>
                <p className={`upload-file__title${names.length>0 ? ' hide' : ''}`}>
                    {names.length>0 ? names.length>1 ? 'Selected Files:' : 'Selected File:' : label}
                    {!requiered ? '' : <span className='error'> *</span>}
                </p>
                <ul className={`upload-file__files-list${names.length<1 ? ' hide' : ''}`}>
                    {names.map((el, i) => (
                        <li
                            className={el.error ? 'error' : ''}
                            title={el.error ? el.error : el.value}
                            key={inputId+i}
                        >
                            {el.error ? el.error : el.value}
                        </li>
                    ))}
                </ul>
            </div>

            {/*<style jsx>{`@import '../styles/UploadFile';`}</style>*/}
        </>
    );
}