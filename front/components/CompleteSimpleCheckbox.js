import React, {useRef} from 'react';

// Components:
import SimpleCheckbox from './SimpleCheckbox';

export default function CompleteSimpleCheckbox({reference, label, checked, required, ...props}){
    const inputRef=reference || useRef();

    return (
        <div className='complete-simple-checkbox startFlex'>
            <SimpleCheckbox {...props} checked={checked} required={required} inputRef={inputRef} />
            {label && (
                <label onClick={()=>inputRef.current.click()} style={{marginLeft:'.5em'}}>
                    {label}{required && <span className='required'> *</span>}
                </label>
            )}
        </div>
    )
}