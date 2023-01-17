import React, {useContext} from 'react';

// Components:
import Notification from '../Notification';
import Loader from '../Loader';

// Contexts:
import viewContext from '../../contexts/viewContext';

// Material UI Components:
import {List} from '@mui/material';

const Notifications=()=>{
    const {viewState} = useContext(viewContext);

    return (
        <section className={"main-section"+`${viewState==='notifications' ? ' active' : ''}`}>
            {/* <Loader/> */}
            <List>
                <Notification/>
                <Notification/>
                {/* <Divider variant="inset" component="li" /> */}
            </List>
        </section>
    )
};

export default Notifications;