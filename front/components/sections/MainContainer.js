import React, { useContext } from 'react';

// Contexts:
import viewContext from '../../contexts/viewContext';

export default function MainContainer({id, className, children}){
    const {viewState} = useContext(viewContext);
    return (
        <section
            id={id}
            className={`main-container${className ? ' '+className : ''}${viewState!==null ? ' hide' : ''}`}
        >
            {children}
        </section>
    );
}