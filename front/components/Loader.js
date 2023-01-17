import React from 'react';

// Material UI Components:
import {CircularProgress} from '@mui/material';

export default function Loader({className, style}){
    return (
        <div className={`loader${className ? ''+className : ''}`}>
            <CircularProgress color="inherit" style = {style ?? {}}/>
        </div>
    )
}