import { useState, useEffect } from 'react';

// Utils:
import { ClientFetch } from '../util/Fetching';

const initialState={data:null, error: null, message:null};

export default function useSearch(fetchOpts){
    const [state, setState] = useState({
        search: '',
        searchInterval: undefined,
        loadingSearch: false
    });
    /* const [search, setSearch]=useState('');
    const [searchInterval, setSearchInterval] = useState(); */
    const fetcher = new ClientFetch();

    const setSearchInterval=(value)=> setState({...state, searchInterval:value});
    const setSearch=(value)=> setState({...state, search:value});
    const setLoadingSearch=(value)=> setState({...state, loadingSearch:value});

    const handleSearch=async ()=>{
        let data=initialState;

        try{
            let res=await fetcher.get(fetchOpts);
            //let res=await fetch(`${process.env.API+'areas'}${search ? '?search='+search : ''}`, {signal:aborter.signal});

            let {status}=res, acceptedStatus=fetcher.isStatus(status, 200, 400, 403, 404, 406, 500);

            if(acceptedStatus){
                let response=await res.json();

                data=status===200 ? ({
                    ...data,
                    data:response,
                    message:response.length<1 ? 'Not found!' : null
                }) : ({
                    ...data,
                    message:status===500 ? null : response.message,
                    error:status!==500 ? status!==404 ? status===406 ? response.errors.search : null : response.message : response.message,
                });
            }else{
                data={...data, message:'Unexpected response!', error:'Unexpected response!'};
            }
        }catch(e){
            data={...data, error:fetcher.aborted() ? 'API request timeout has expired!' : 'Failed to establish connection to server!'};
        }
        //dispatch({type:TYPES.CHANGE_SEARCH_DATA, payload:data});
    }

    useEffect(()=>{
        if(typeof searchInterval === 'number')
            setSearchInterval(clearInterval(searchInterval));

        if(search.trim().length>0)
            setSearchInterval(setTimeout(async ()=> await handleSearch(), 750));
    }, [search]);
}