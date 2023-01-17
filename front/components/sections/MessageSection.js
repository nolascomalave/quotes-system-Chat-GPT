import React from 'react';

export default function MessageSection({className, error, message}){
    return (
        <div className={`message-section${className ? ' '+className : ''}${!error && !message ? ' hide' : ''}`}>
            {!error && !message ? '' :(
                <p className={`message-section__message${error ? " error" : ''}`}>
                    {error ? error : message ? message : ''}
                </p>
            )}
        </div>
    );
}