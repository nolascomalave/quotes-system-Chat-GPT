import React from 'react';
import Link from 'next/link';

// Components:
import LinkMenu from '../LinkMenu';

// Material Icons:
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CountertopsIcon from '@mui/icons-material/Countertops';
import ConstructionIcon from '@mui/icons-material/Construction';

export default function Menu({menuState}){
    return (
        <aside id="menu" className={`${menuState ? 'active' : ''}`}>
            <div className="logo-section">
                <Link href="/">
                    <a className="link" title="Home">
                        <img src="/logo.png" alt="Logo"/>
                    </a>
                </Link>
                <p>New Evolution LLC.</p>
            </div>
            <div className="links-section">
                <LinkMenu icon={RequestQuoteIcon} href='/quotes' title="Quotes" />
                <LinkMenu icon={PeopleIcon} href='/customers' title="Customers" />
                <LinkMenu icon={CountertopsIcon} href="/areas" title='Areas' />
                <LinkMenu icon={ConstructionIcon} href="/jobs" title='Jobs' />
                <LinkMenu icon={Inventory2Icon} href='/products' title="Products" />
                <LinkMenu icon={PersonIcon} href='/users' title="Users" />
            </div>
        </aside>
    );
}