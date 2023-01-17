// import { destilde } from './format';
import { checkCookies, getCookie } from 'cookies-next';
import { HandleErrors } from './HandleErrors';

export function asignError(errors, name, error){
    if(!errors) errors={};
    if(error){
        errors[name]=error;
    }else if(errors[name]){
        delete errors[name];
    }
    if(Object.keys(errors).length<1) return null;
    return errors;
}

export function acceptedMethods(method, ...methods){
    let error=405;
    for(let i of methods){
        if(i.toUpperCase()===method){
            error=null;
            break;
        }
    }

    return error;
}

export function validateParams(req, ...values){
    let errors={}, body=req.body || {}, files=req.files || {},  params=req.params || {},  query=req.query || {},  file=req.file || {};

    values.forEach(el => {
        if(!(el in body) && !(el in files) && !(el in params) && !(el in query) && !('fieldname' in file && el === file.fieldname)) errors[el]=`The "${el}" value is missing from the request!`;
    });

    if(Object.keys(errors).length>0) return {message: 'Values ​​are missing from the request body!', errors};
    return null;
}

export function isFormat(format, formats){
    return formats.find(el => eval(`/${el}$/i`).test(format)) || false;
}

export function isStatus(status, ...rest){
    for(let i of rest) if(status === i) return true;
    return false;
}

export { HandleErrors };

export function parseFetchToken(opts){
    let token=null;

    if(!!checkCookies('user')) token = getCookie('user');

    if(!token) return opts;

    opts.headers = opts.headers ?? {};

    opts.headers["x-access-token"] = token;

    return opts;
}

export function getPorc(base, porc){
    if(porc === 0 || base === 0) return 0;

    return ((base / 100) * porc);
}

export function sumPorc(base, porc){
    return (base + getPorc(base, porc));
}