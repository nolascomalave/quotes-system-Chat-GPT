import React, { useEffect, useContext } from 'react';
import {useRouter} from 'next/router';

// Components:
import AlertDialog from '../AlertDialog';

// Contexts:
import viewContext from '../../contexts/viewContext';

export default function Body({children}){

    let pathName=useRouter().pathname, {handleChangeView}=useContext(viewContext);
    useEffect(()=> handleChangeView(null), [pathName]);

    return (
        <div className='body'>
            {children}
        </div>
    );
}