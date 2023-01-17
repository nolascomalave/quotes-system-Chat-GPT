import { NextApiRequest, NextApiResponse } from 'next';
import {AbortController as Aborter} from 'node-abort-controller';
import { checkCookies, getCookie } from 'cookies-next';

type HTTPMethod= 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';

type FetchOpts={
    url: string;
    method?: HTTPMethod;
    timeout?: number;
    headers?: Headers | string[][] | object | any;
    body?: any;
    data?: any;
    signal?: AbortSignal;
    credentials?: any;
}

class Fetching {
    protected controller:any;
    protected fetchMethod:any = fetch;
    protected req_res: {req: NextApiRequest, res: NextApiResponse} | null = null;

    constructor(){}

    protected fetchAction(opt:FetchOpts){
        let isFormData:boolean=false, isObject:boolean=false;
        this.startController();
        if(opt.body) delete opt.body;

        if(opt.data){
            if(typeof opt.data === 'object'){
                if(typeof opt.data.append !== 'function') opt.data=JSON.stringify(opt.data);
                else isFormData=true;

                isObject = true;
            }

            if(typeof opt.data.append !== 'function' || opt.method !== 'GET') {
                opt.body = opt.data;
            }else if(opt.method !== 'GET' && isObject){
                let params = '?', objParams = JSON.parse(opt.data);

                Object.keys(objParams).forEach((el: string, i: number) => {
                    params = params + (i === 0 ? '' : '&') + el + '=' + objParams[el];
                });

                opt.url = opt.url + params;
            }

            delete opt.data;
        }

        if(!opt.headers) opt.headers={};

        if(isObject && (typeof opt.body === 'string') && !opt.headers["Content-Type"]){
            let cType='text/html';

            if(isObject){
                if(isFormData) cType='multipart/form-data';
                else cType='application/json';
            }

            opt.headers["Content-Type"]=cType;
        }

        if(!!this.req_res){
            let token = this.req_res.req.cookies['x-access-token'];
            if(!!token) opt.headers["x-access-token"]=token;
        }else{
            opt.credentials = 'include';
        }
        /*if(!!this.req_res){
            if(!!checkCookies('user', this.req_res)){
                opt.headers["x-access-token"]=getCookie('user', this.req_res);
            }
        }else{
            if(!!checkCookies('user')){
                opt.headers["x-access-token"]=getCookie('user');
            }
        }*/

        if(opt.timeout || opt.timeout===0){
            setTimeout(()=> this.controller.abort(), opt.timeout);
            opt.signal=this.controller.signal;
        }

        return fetch(opt.url, opt);
    }

    public isStatus(status:number, ...matches:number[]):boolean{
        return matches.some(el => el===status);
    }

    protected startController(): void {
        this.controller = new AbortController();
    }

    public aborted():boolean{
        if(!this.controller) return false;
        return this.controller.signal.aborted;
    }

    public abort():void{
        if(this.controller) this.controller.abort();
    }

    public get(opt:FetchOpts){
        opt.method='GET';
        return this.fetchAction(opt);
    }

    public post(opt:FetchOpts){
        opt.method='POST';
        return this.fetchAction(opt);
    }

    public put(opt:FetchOpts){
        opt.method='PUT';
        return this.fetchAction(opt);
    }

    public patch(opt:FetchOpts){
        opt.method='PATCH';
        return this.fetchAction(opt);
    }

    public delete(opt:FetchOpts){
        opt.method='DELETE';
        return this.fetchAction(opt);
    }
}

class ClientFetch extends Fetching {
    constructor(){
        super();
    }
}

class ServerFetch extends Fetching {
    constructor(req_res: any | null){
        super();

        if(!!req_res) this.req_res = req_res;
    }

    protected startController(): void {
        this.controller = new Aborter();
    }
}

export {
    ClientFetch,
    ServerFetch
};

// export default Fetching;