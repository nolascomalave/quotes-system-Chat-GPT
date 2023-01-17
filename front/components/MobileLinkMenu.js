import React from 'react';
import Link from 'next/link';

// Material UI Components:
import {ListItemButton} from '@mui/material';

// Hooks:
import useActiveLink from '../hooks/useActiveLink';

const MobileLinkMenu=({href, title, icon:Icon})=>{
    const active = useActiveLink(href);
    return (
        <>
            <Link href={href}>
                <a className="link" title={title}>
                    <ListItemButton className={`mobile-menu-link${active ? " active" : ''}`}>
                        <Icon/>
                        <p>{title}</p>
                    </ListItemButton>
                </a>
            </Link>
            {/* <style jsx>{`@import '../styles/MobileMenu';`}</style> */}
        </>
    );
};

export default MobileLinkMenu;