import React, {useState, useEffect, useRef} from 'react';

export default function Textarea({label, children, className, placeholder, reference, error, value, required, readOnly, ...props}){
    const [floating, setFloating]=useState(false);
    const [focuset, setFocused]=useState(false);
    const inputRef=reference || useRef();

    const handleFocus=(e)=>{
        if(!floating) setFloating(true);
        setFocused(true);
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
            <div className={`float-label float-label-textarea${floating===true ? ' float' : ''}${error ? ' label-error' : ''}${focuset ? ' focused' : ''}${className ? ' '+className : ''}`}>
                <div className="input-container">
                    <textarea
                        ref={inputRef}
                        {...props}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        required={required ? true : false}
                        value={value}
                        readOnly = {(readOnly === true || ('InputProps' in props && props.InputProps.readOnly === true) || ('inputProps' in props && props.inputProps.readOnly === true))}
                    >
                        {children}
                    </textarea>
                    <label>{label}{required ? (<span className="required"> *</span>) : ''}</label>
                    <div className={`border${focuset ? ' focused' : ''}`}></div>
                </div>
                <p>{error && error}</p>
            </div>
            {/* <style jsx>{`@import '../../styles/FloatLabel';`}</style> */}
        </>
    );
}