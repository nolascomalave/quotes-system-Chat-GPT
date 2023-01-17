import { NextResponse } from 'next/server';
// import { verify } from './services/jwt_sing_verify';

export function middleware(req) {
  /*console.log(req.nextUrl.pathname);
  let token = req.cookies.get('x-access-token');

  if (/^[\/\\]?login([\/\\]*.[\/\\]?)*?$/i.test(req.nextUrl.pathname) && !token) {
    return NextResponse.rewrite(new URL('login', req.url));
  }else if(/.[^\/\\]+$/i.test(!req.nextUrl.pathname.toLowerCase())){
    return NextResponse.next();
  }else if(!!token){
    if(verify(token, process.env.SECRET)) return NextResponse.next();
    
    return NextResponse.rewrite(new URL('login', req.url));
  }else{
    return NextResponse.rewrite(new URL('login', req.url));
  }*/
  return NextResponse.next();
}