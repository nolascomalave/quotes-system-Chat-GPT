import { ServerFetch } from './Fetching';
import { isStatus } from './functionals';
import { checkCookies } from 'cookies-next';

export async function getServerData(urlPath, timeout, req_res){
    let data={data:null, error:null, message:null};
    let fetcher=new ServerFetch(req_res);

    try{
        let res=await fetcher.get({
            url:process.env.API+urlPath,
            timeout
        });

        let response=null, isAccepted=isStatus(res.status, 200, 403, 404, 500);

        if(isAccepted){
            response=await res.json();
            console.log(response);

            if(('data' in response) && ('errors' in response) && ('message' in response)) {
                data = response;
                data.message = res.status=== 200 ? null : data.message;
            }else{
                data=res.status=== 200 ? ({
                    ...data,
                    data:response.length<1 ? null : response,
                    message:response.length<1 ? 'Users not found!' : null
                }) : ({
                    ...data,
                    message:response.message,
                    error:response.message
                });
            }

        }else{
            data={...data, message:'Unexpected response!', error:'Unexpected response!'};
        }
    }catch(e){
        console.log(e);
        data={
            ...data,
            error: fetcher.aborted() ? 'API request timeout has expired!' : 'Failed to establish connection to server!',
            err:e.toString()
        };

        data.message=data.error;
    }

    return data;
}

export function getServerDataAsPromise(req_res, ...getters){
    let promises=[];

    getters.forEach(pro => promises.push(getServerData(pro.url, pro.timeout, req_res)));

    return new Promise((res)=>{
        Promise.all(promises).then((responses)=>{
            let data={};

            responses.forEach((el, i) => {
                data[getters[i].name]=el;
            });

            res(data);
        });
    });
}

export function serverPropsVerifySession(cb, properties){
    return async function(ctx){
        let {req}=ctx, {res}=ctx;

        if(!ctx.req.cookies['x-access-token']){
            let props={};
            res.statusCode = 302;
            res.setHeader('Location', `/login`);

            if(!!properties){
                for(let prop in properties){
                    if((typeof properties[prop]==='string') && properties[prop].toLowerCase()==='data') {
                        props[prop]={data:null, error:null, message:null};
                    }else{
                        props[prop]=properties[prop]
                    }
                }
            }
            return {props};
        }

        return !!cb ? (('then' in cb) ? await cb(ctx) : cb(ctx)) : {props:{}};
    }
}