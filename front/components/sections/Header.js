import React, {useEffect, useState, useContext} from 'react';
import Link from 'next/link';
import useLogout from '../../hooks/useLogout';

// Components:
import Breadcrumbs from '../navigation/Breadcrumbs';
import ProfileMenu from '../ProfileMenu';
import NotificationsDrop from '../NotificationsDrop';

// Contexts:
import viewContext from '../../contexts/viewContext';
// import sessionContext from '../../contexts/SessionContext';

// Material UI Components:
import { Badge, Button, Divider } from '@mui/material';

// Material UI Icons:
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DragHandleIcon from '@mui/icons-material/DragHandle';

// Utils: ---------------------------
// Format:
import {firstUpper} from '../../util/format';

const Header = ({menuState, setMenuState})=>{
    const [noMobile, setNoMobile]=useState(false);
    const {viewState, handleChangeView} = useContext(viewContext);
    const logout = useLogout();
    // const {removeSession} = useContext(sessionContext);

    useEffect(()=>{
        const mq=window.matchMedia('(min-width:600px)');

        if(mq.matches) setNoMobile(true);

        mq.addEventListener('change', (e)=>{
            if(mq.matches) setNoMobile(true);
            else setNoMobile(false);
        });
    },[]);

    return(
        <>
            <header id="header">
                {!noMobile ? (
                    <div className={"mobile-controlls"+`${viewState ? ' view-section' : ''}`}>
                        {!viewState ? (
                            <>
                                <Breadcrumbs/>
                                <Divider/>
                            </>
                        ) : (
                            <div className="view-section-selected">
                                <Button
                                    onClick={()=> handleChangeView(null)}
                                >
                                    <ArrowBackIcon/>
                                </Button>
                                <div className='header-title'>{firstUpper(viewState)}</div>
                            </div>
                        )}

                        <div className="header-options bettwenFlex">
                            {!viewState && (
                                <Link href="/">
                                    <a className='link' title="Home">
                                        <img src="/logo.png" alt="Logo"/>
                                    </a>
                                </Link>
                            )}

                            <div className="buttons">
                                <Button
                                    className={`${viewState==='notifications' && 'active'}`}
                                    value="notification"
                                    onClick={()=> handleChangeView('notifications')}
                                >
                                    <Badge>
                                        <NotificationsIcon/>
                                    </Badge>
                                </Button>
                                <Button
                                    className={`${viewState==='menu' && 'active'}`}
                                    value="menu"
                                    onClick={()=> handleChangeView('menu')}
                                >
                                    <MenuIcon/>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) :(
                    <div className="no-mobile-controlls">
                        <div className="startFlex">
                            <Button onClick={()=> setMenuState(!menuState)}>
                                {menuState ? <DragHandleIcon/> : <MenuIcon/>}
                            </Button>
                            <Breadcrumbs/>
                        </div>
                        <NotificationsDrop/>
                        <ProfileMenu removeSession={async ()=> await logout()}/>
                    </div>
                )}
            </header>

           {/*  <style jsx>{`
                @import '../../styles/Header'
            `}</style> */}
        </>
    );
};

export default Header;