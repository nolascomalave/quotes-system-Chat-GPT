import React, {useEffect, useState} from 'react';

export default function GlobalLoader({open}){
    const [isActive, setIsActive]=useState(false);

    useEffect(()=>{
        if(!open) setIsActive(open);
        else setTimeout(()=> setIsActive(open), 250);
    }, [open]);

    return (
        <>
            <div className={`global-loader all-screen${isActive ? ' active' : ''}${!open ? ' hide' : ''}`}>
                <div className='container'>
                    <div className="sk-chase">
                        <div className="sk-chase-dot"></div>
                        <div className="sk-chase-dot"></div>
                        <div className="sk-chase-dot"></div>
                        <div className="sk-chase-dot"></div>
                        <div className="sk-chase-dot"></div>
                        <div className="sk-chase-dot"></div>
                    </div>
                </div>
            </div>

            {/*<style jsx>{`@import '../styles/GlobalLoader';`}</style>*/}
        </>
    );
}