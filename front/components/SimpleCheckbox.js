import React, { useRef } from "react";

export default function SimpleCheckbox({id, inputRef, className, checked, onChange, onCheck, onDischeck, ...props}){
    let count=0;
    inputRef=inputRef || useRef();

    const handleChange=(e)=>{
        let {target}=e;
        if(onCheck && target.checked) onCheck(e);
        else if(onDischeck && !target.checked) onDischeck(e);
    }

    return (
        <>
            <div className={`simple-checkbox centerFlex${!className ? '' : ' '+className}`}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange ? onChange : handleChange}
                    {...props}
                    ref={inputRef}
                />
                <label className='simple-checkbox__box' onClick={()=>inputRef.current.click()}></label>
            </div>
            {/*<style jsx>{`@import '../styles/SimpleCheckbox';`}</style>*/}
        </>
    );
}