import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';

// Material UI Components:
import {ListItemButton} from '@mui/material';

// Hooks:
import useActiveLink from '../hooks/useActiveLink';

export default function LinkMenu({href, icon:Icon, title}){
    const active = useActiveLink(href);
    return (
        <Link href={href}>
            <a className="link" title={title}>
                <ListItemButton className={`link-button${active ? ' active' : ''}`}>
                    <Icon/>
                    <p>{title}</p>
                </ListItemButton>
            </a>
        </Link>
    );
}