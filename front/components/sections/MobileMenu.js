import React, { useContext, useState } from 'react';
import Router from 'next/router';
import useLogout from '../../hooks/useLogout';

// Components:
import MobileLinkMenu from '../MobileLinkMenu';

// Contexts:
import viewContext from '../../contexts/viewContext';
import alertsContext from '../../contexts/alertsContext';
// import sessionContext from '../../contexts/SessionContext';

// Material UI Components:
import {List} from '@mui/material';

// Material Icons:
import PeopleIcon from '@mui/icons-material/People';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import HomeIcon from '@mui/icons-material/Home';
import CountertopsIcon from '@mui/icons-material/Countertops';
import ConstructionIcon from '@mui/icons-material/Construction';

const ResponsiveMenu=()=>{
    const {viewState} = useContext(viewContext);
    const {addAlert} = useContext(alertsContext);
    const logout = useLogout();

    return (
        <section className={"main-section"+`${viewState==='menu' ? ' active' : ''}`}>
            <List className="list-menu-links">
                <MobileLinkMenu icon={HomeIcon} href='/' title="Home" />
                <MobileLinkMenu icon={RequestQuoteIcon} href='/quotes' title="Quotes" />
                <MobileLinkMenu icon={PeopleIcon} href='/customers' title="Customers" />
                <MobileLinkMenu icon={CountertopsIcon} href='/areas' title="Areas" />
                <MobileLinkMenu icon={ConstructionIcon} href='/jobs' title="Jobs" />
                <MobileLinkMenu icon={Inventory2Icon} href='/products' title="Products" />
                <MobileLinkMenu icon={PersonIcon} href='/users' title="Users" />
            </List>
            <List className="list-menu-links">
                <MobileLinkMenu icon={LockOpenIcon} href='/security/change-password' title="Change Password" />
                <button
                    onClick={()=> addAlert({
                        type:'question',
                        title: 'Are you sure to close session?',
                        acceptButton:true,
                        cancelButton:true,
                        onAccept: async ()=> await logout()
                    })}
                    className='close-session-mobile-menu'>
                    <LogoutIcon/>
                    <p>Logout</p>
                </button>
                {/* <MobileLinkMenu icon={LogoutIcon} href='/logout' title="Logout" /> */}
            </List>
        </section>
    );
};

export default ResponsiveMenu;