import React, { useContext, useEffect } from 'react';
import Link from 'next/link';
// import Breadcrumbs from 'nextjs-breadcrumbs';

// Context's:
import breadcrumbsContext from '../../contexts/breadcrumbsContext';

// Utils:
import { firstCharName } from '../../util/format';

const LiLink=({href, children})=>{
    return (
        <li>
            <Link href={href}>
                <a className="link">{children}</a>
            </Link>
        </li>
    );
}

const BreadcrumbsComponent = ()=>{
    const {options, route}=useContext(breadcrumbsContext);
    const homeLink=<LiLink href='/'>HOME</LiLink>;

    return (
        <div className="breadcrumbs header-title">
            {/404/g.test(route.pathname) ? '404 - Not Found' : (
                <ul>
                    {options.home===true ? homeLink : route.pathname==='/' ? homeLink : ''}
                    {route.pathname.split('/').map((el, i)=>{
                        let link='', routes=route.asPath.split('/');
                        if(el==='') return null;
                        for(let j=0; j<=i; j++){
                            link+=routes[j]+'/';
                        }
                        let changedLink=options.actualRoute===route.asPath ? options.routes.find(path => {
                            if(link===path.link+'/') return true;
                            return false;
                        }) : null;
                        if(changedLink){
                            if(changedLink.none===true) return null;
                            el=changedLink.name ? changedLink.name : el;
                            link=changedLink.path ? changedLink.path : link;
                        }
                        return <LiLink key={(i+1)+'-breadcrumb-link'} href={link}>{el.toUpperCase()}</LiLink>
                    })}
                </ul>
            )}
            {/* <Breadcrumbs labelsToUppercase={true} /> */}
        </div>
    );
};

export default BreadcrumbsComponent;