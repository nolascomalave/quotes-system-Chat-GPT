import {useEffect, createContext, useState} from 'react';
import Router from 'next/router';
import { setCookies, removeCookies, checkCookies } from 'cookies-next';

// Utils:
import { ClientFetch } from '../util/Fetching';

const sessionContext=createContext();

const SessionContextProvider=({children})=>{
    const [session, setSession] = useState(null);
    const [token, setToken] = useState(null);

    const createSession=(token, sessionData)=>{
        setSession(sessionData);
        setToken(token);
        setCookies('user', token, { maxAge: 60 * 60 * 24 });
        Router.push('/');
    };

    const removeSession=()=>{
        setSession(null);
        setToken(null);
        if(checkCookies('user')) removeCookies('user');
        Router.push('login');
    };

    return (
        <sessionContext.Provider value={{session, token, createSession, removeSession}}>{children}</sessionContext.Provider>
    );
}

export {SessionContextProvider};
export default sessionContext;