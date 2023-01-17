import React, {useRef} from 'react';

export default function CheckBox({label, error, required, className, reference, id, ...props}){
    const inputRef=reference || useRef(), inputId=id || Date.now();

    return (
        <>
            <div className={`checkbox${className ? ' '+className : ''}${error ? ' label-error' : ''}`}>
                <div className='container'>
                    <input type="checkbox" id={inputId} ref={inputRef} {...props}/>
                    <label htmlFor={inputId}></label>
                    <span onClick={()=>inputRef.current.click()}>{label}{required ? (<span className="required"> *</span>) : ''}</span>
                </div>
                <p className="error">{error && error}</p>
            </div>
            {/*<style jsx>{`@import '../styles/CheckBox';`}</style>*/}
        </>
    );
}