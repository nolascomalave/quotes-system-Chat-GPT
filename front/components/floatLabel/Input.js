import React, {useState, useEffect, useRef} from 'react';

export default function Input({label, placeholder, reference, error, value, required, readOnly, ...props}){
    const [floating, setFloating]=useState(false);
    const [focuset, setFocused]=useState(false);
    const inputRef=reference || useRef();

    const handleFocus=(e)=>{
        if(!floating && !readOnly) setFloating(true);
        if(!readOnly) setFocused(true);
    }

    const handleBlur=(e)=>{
        if(!e.target.value) setFloating(false);
        setFocused(false);
    }

    useEffect(()=>{
        if(!!inputRef.current.value) return setFloating(true);
        if(!value && !focuset) return setFloating(false);
        if(!value===false || value===0 || value==='0') setFloating(true);
        else inputRef.current.value='';
    }, [value]);

    placeholder='';

    return (
        <>
            <div className={`float-label float-label-input${floating===true ? ' float' : ''}${error ? ' label-error' : ''}${focuset ? ' focused' : ''}`}>
                <div className="input-container">
                    <input
                        ref={inputRef}
                        {...props}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        required={!required ? false : true}
                        value={(value !== undefined ? value : (('inputProps' in props && props.inputProps.value !== undefined) ? props.inputProps.value : null))}
                        readOnly = {(readOnly === true || ('InputProps' in props && props.InputProps.readOnly === true) || ('inputProps' in props && props.inputProps.readOnly === true))}
x                    />
                    <label>{label}{required ? (<span className="required"> *</span>) : ''}</label>
                    <div className={`border${focuset ? ' focused' : ''}`}></div>
                </div>
                <p>{error && error}</p>
            </div>
            {/* <style jsx>{`@import '../../styles/FloatLabel';`}</style> */}
        </>
    );
}