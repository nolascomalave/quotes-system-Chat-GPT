import {useEffect, createContext, useState} from 'react';
import jwt from 'jsonwebtoken';
import Router from 'next/router';
import { setCookies, removeCookies, checkCookies } from 'cookies-next';
import { useSnackbar } from 'notistack';

// Material Components:
import Button from '@mui/material/Button';

// Utils:
import { ClientFetch } from '../util/Fetching';

const sessionContext=createContext();

const SessionContextProvider=({children})=>{
    let timerSession=null;
    const [session, setSession]=useState(null);
    const [token, setToken]=useState(null);
    const [expireTime, setExpireTime] = useState(null);
    const [load, setLoad] = useState(false);
    const {enqueueSnackbar, closeSnackbar}=useSnackbar();

    const createSession=(token, secret, expire_date)=>{
        let decoded=null;
        try{
            decoded=jwt.verify(token, secret);
            setSession(decoded);
            setToken(token);
            setCookies('user', token, { maxAge: 60 * 60 * 24 });
            setExpireTime(expire_date);
            Router.push('/');
        }catch(e){
            console.error(e, process.env.SECRET);
        }
    };

    const removeSession=()=>{
        if(checkCookies('user')) removeCookies('user');
        setSession(null);
        setToken(null);
        setExpireTime(null);
        setLoad(false);
        Router.push('/login');
    };

    const extendSession = async ()=> {
        let ftc=new ClientFetch();

        try{
            let data=null;
            let res=await ftc.patch({
                url:process.env.API+'extend-session',
                data:{token},
                timeout: 5000
            });

            if(ftc.isStatus(res.status, 200, 403, 404, 406, 500)){
                data=await res.json();

                if(res.status!==200) return enqueueSnackbar('Extend session error: '+data.message, {variant: 'error'});
                clearInterval(timerSession);
                enqueueSnackbar('The session has been extended!', {variant: 'success'});
                return createSession(data.token, data.secret, data.expire_date);
            }

            return enqueueSnackbar('The server has given an unexpected response!', {variant: 'error'});
        }catch(e){
            return enqueueSnackbar(ftc.aborted() ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant: 'error'});
        }
    };

    const timeoutSession=(time)=>{
        if(typeof timerSession !== 'number') timerSession=setTimeout(() => removeSession(), time);
    };

    const showExtendSessionMessage=()=>{
        return enqueueSnackbar('Your session is about to end. Do you want to extend it?', {
            variant: 'default',
            autoHideDuration: 10500,
            anchorOrigin: { horizontal: 'right', vertical: 'top' },
            action: (key) => (
                <>
                    <Button
                        size='small'
                        onClick={()=>{
                            if(load===false){
                                setLoad(true);
                                extendSession()
                                    .then(()=>setLoad(false));
                            }
                            closeSnackbar(key);
                        }}
                    >
                        Extend
                    </Button>
                    <Button size='small' onClick={() => closeSnackbar(key)}>
                        Ignore
                    </Button>
                </>
            )
        });
    };

    const verifyExpireTime=()=>{
        let time=(new Date().getTime())-expireTime;

        if(time>=0) return removeSession();

        time=time*-1;

        timeoutSession(time);

        if(time>=5500 && time<=10500) return showExtendSessionMessage();
        else if(time<5500) return;

        setTimeout(()=>showExtendSessionMessage(), time-10500);
    };

    useEffect(()=>{
        verifyExpireTime();
    }, [expireTime]);

    useEffect(()=>{
        verifyExpireTime();
    }, []);

    return (
        <sessionContext.Provider value={{session, token, createSession, removeSession}}>{children}</sessionContext.Provider>
    );
}

export {SessionContextProvider};
export default sessionContext;