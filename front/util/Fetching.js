import { AbortController as Aborter } from 'node-abort-controller';
class Fetching {
    constructor() {
        this.fetchMethod = fetch;
        this.req_res = null;
    }
    fetchAction(opt) {
        let isFormData = false, isObject = false;
        this.startController();
        if (opt.body)
            delete opt.body;
        if (opt.data) {
            if (typeof opt.data === 'object') {
                if (typeof opt.data.append !== 'function')
                    opt.data = JSON.stringify(opt.data);
                else
                    isFormData = true;
                isObject = true;
            }
            if (typeof opt.data.append !== 'function' || opt.method !== 'GET') {
                opt.body = opt.data;
            }
            else if (opt.method !== 'GET' && isObject) {
                let params = '?', objParams = JSON.parse(opt.data);
                Object.keys(objParams).forEach((el, i) => {
                    params = params + (i === 0 ? '' : '&') + el + '=' + objParams[el];
                });
                opt.url = opt.url + params;
            }
            delete opt.data;
        }
        if (!opt.headers)
            opt.headers = {};
        if (isObject && (typeof opt.body === 'string') && !opt.headers["Content-Type"]) {
            let cType = 'text/html';
            if (isObject) {
                if (isFormData)
                    cType = 'multipart/form-data';
                else
                    cType = 'application/json';
            }
            opt.headers["Content-Type"] = cType;
        }
        if (!!this.req_res) {
            let token = this.req_res.req.cookies['x-access-token'];
            if (!!token)
                opt.headers["x-access-token"] = token;
        }
        else {
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
        if (opt.timeout || opt.timeout === 0) {
            setTimeout(() => this.controller.abort(), opt.timeout);
            opt.signal = this.controller.signal;
        }
        return fetch(opt.url, opt);
    }
    isStatus(status, ...matches) {
        return matches.some(el => el === status);
    }
    startController() {
        this.controller = new AbortController();
    }
    aborted() {
        if (!this.controller)
            return false;
        return this.controller.signal.aborted;
    }
    abort() {
        if (this.controller)
            this.controller.abort();
    }
    get(opt) {
        opt.method = 'GET';
        return this.fetchAction(opt);
    }
    post(opt) {
        opt.method = 'POST';
        return this.fetchAction(opt);
    }
    put(opt) {
        opt.method = 'PUT';
        return this.fetchAction(opt);
    }
    patch(opt) {
        opt.method = 'PATCH';
        return this.fetchAction(opt);
    }
    delete(opt) {
        opt.method = 'DELETE';
        return this.fetchAction(opt);
    }
}
class ClientFetch extends Fetching {
    constructor() {
        super();
    }
}
class ServerFetch extends Fetching {
    constructor(req_res) {
        super();
        if (!!req_res)
            this.req_res = req_res;
    }
    startController() {
        this.controller = new Aborter();
    }
}
export { ClientFetch, ServerFetch };
// export default Fetching;