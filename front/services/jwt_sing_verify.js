import jwt from 'jsonwebtoken';

export function sign(toSign, secret, options){
	return jwt.sign(toSign, secret, options);
}

export function verify(token, secret){
	try{
        decoded=jwt.verify(token, secret);
        return true;
    }catch(e){
        return false;
    }
}