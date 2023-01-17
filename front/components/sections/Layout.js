import {useState} from 'react';
import Head from 'next/head';

// Components:
import Body from './Body';
import Header from './Header';
import Menu from './Menu';
import Notifications from './Notifications';
import MobileMenu from './MobileMenu';

export default function Layout({children}){
    const [menuState, setMenuState]=useState(false);

    return (
        <>
            <Head>
                <link rel='icon' type="image/png" sizes='16x16' href="/logo.png"/>
                <title>{process.env.SITE_NAME}</title>
            </Head>
            <Menu menuState={menuState} />
            <Body>
                <Header menuState={menuState} setMenuState={setMenuState} />
                <MobileMenu/>
                <Notifications/>
                {children}
            </Body>
        </>
    );
};