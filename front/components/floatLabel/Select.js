import React, {useState, useEffect, useRef} from 'react';

export default function Select({label, placeholder, children, reference, error, value, required, ...props}){
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
            <div className={`float-label float-label-select${floating===true ? ' float' : ''}${error ? ' label-error' : ''}${focuset ? ' focused' : ''}`}>
                <div className="input-container">
                    <select
                        ref={inputRef}
                        {...props}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        required={required ? true : false}
                        value={value}
                    >
                        {children}
                    </select>
                    <label>{label}{required ? (<span className="required"> *</span>) : ''}</label>
                    <div className={`border${focuset ? ' focused' : ''}`}></div>
                </div>
                <p>{error && error}</p>
            </div>
            {/* <style jsx>{`@import '../../styles/FloatLabel';`}</style> */}
        </>
    );
}