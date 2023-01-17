import React from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';

// Utils:
import {firstUpper} from '../util/format';

export default function AddItemButton({children, className, title, href, ...props}){
    const {pathname}=useRouter();
    let path=null, indicator='';

    if(!href){
        path=pathname.match(/\w+\/?$/g)[0] || '/';
        path=path.replace(/\/$/, '');
        path+='/add';
    }else{
        path=href;
    }

    if(!title){
        indicator=pathname.split('/');
        indicator=indicator[indicator.length-1] || null;
    }else{
        indicator=title;
    }
    if(indicator!==null) indicator=firstUpper(indicator);

    return (
        <>
            <Link href={path}>
                <a
                    className={`add-item-button link${className ? ' '+className : ''}`}
                    {...props}
                    title={indicator!==null && indicator}
                >
                    {children}
                </a>
            </Link>
            {/*<style jsx>{`
                @import '../styles/vars';
                .add-item-button{
                    position: fixed;
                    right: .35em;
                    bottom: .35em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 1.35em;
                    height: 1.35em;
                    font-size: 2.5em;
                    color:white;
                    border-radius: 50%;
                    border: .1em solid white;
                    box-shadow: 0 .25em .5em darken($fond, 10);
                    background-image: linear-gradient(to bottom, $primary, darken($primary, 5));
                }
            `}</style>*/}
        </>
    );
}