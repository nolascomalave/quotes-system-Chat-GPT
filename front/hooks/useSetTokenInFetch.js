import { useContext } from "react";
import { checkCookies, getCookie } from 'cookies-next';

import sessionContext from '../contexts/sessionContext';

export default function useSetTokenInFetch(){
    const {token} = useContext(sessionContext);

    const parseFetch = (opts)=>{
        if(!token) return opts;

        if(!!checkCookies('user')){
            opts.headers["x-access-token"]=getCookie('user', this.req_res);
        }

        return opts;
    }

    return parseFetch;
}