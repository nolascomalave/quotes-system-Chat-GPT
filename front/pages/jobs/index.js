import { useState, useEffect, useReducer, useRef } from 'react';
import { AbortController } from 'node-abort-controller';
import { useSnackbar } from 'notistack';

// Utils:
import { getServerData, serverPropsVerifySession } from '../../util/serverGetters';
import { isStatus } from '../../util/functionals';
import { parseFetchToken } from '../../util/functionals';

// Layout:
import Layout from '../../components/sections/Layout';

// Components:
import MainContainer from '../../components/sections/MainContainer';
import MessageSection from '../../components/sections/MessageSection';
import RequirePasswordAlert from '../../components/RequirePasswordAlert';
import Input from '../../components/floatLabel/Input';
import AddItemButton from '../../components/AddItemButton';
import Loader from '../../components/Loader';
import JobCard from '../../components/JobCard';
import JobModal from '../../components/JobModal';

// Material Icons:
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// Reducers:
import jobsModuleReducer, {TYPES, initialState} from '../../reducers/jobsReducer';

const Jobs=({jobsData})=>{
    const [state, dispatch]=useReducer(jobsModuleReducer, {...initialState, jobs:jobsData});
    const [search, setSearch]=useState('');
    const [aborter, setAborter]=useState(new AbortController());
    const [searchInterval, setSearchInterval] = useState();
    const inputSearch=useRef();
    const inputPassword=useRef();
    const { enqueueSnackbar }=useSnackbar();

    const handleSearch=async (aborter)=>{
        setTimeout(()=> aborter.abort(), 60000);
        dispatch({type:TYPES.ON_LOADING});
        let data=initialState.jobsSearch;

        try{
            let res=await fetch(`${process.env.API+'jobs'}${search ? '?search='+search : ''}`, parseFetchToken({signal:aborter.signal}));
            let {status}=res, acceptedStatus=isStatus(status, 200, 400, 403, 404, 406, 500);
            if(acceptedStatus){
                let response=await res.json();

                data=status===200 ? ({
                    ...data,
                    data:response,
                    message:response.length<1 ? 'Jobs not found!' : null
                }) : ({
                    ...data,
                    message:status===500 ? null : response.message,
                    error:status!==500 ? status!==404 ? status===406 ? response.errors.search : null : response.message : response.message,
                });
            }else{
                data={...data, message:'Unexpected response!', error:'Unexpected response!'};
            }
        }catch(e){
            data={...data, error:aborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!'};
        }
        dispatch({type:TYPES.CHANGE_SEARCH_DATA, payload:data});
    }

    useEffect(()=>{
        if(typeof searchInterval === 'number') setSearchInterval(clearInterval(searchInterval));
        dispatch({type:TYPES.CHANGE_SEARCH_DATA, payload:initialState.jobsSearch});

        if(search.trim().length>0){
            if(aborter.signal.aborted==true) setAborter(new AbortController());
            setSearchInterval(setTimeout(async ()=> await handleSearch(aborter), 750));
        }
    }, [search]);


    const handleDelete=async ()=>{
        if(!state.password.value===false && state.selectedJob!==null){
            let data=null, id=state.selectedJob, body=new FormData();
            const fetchAborter=new AbortController();
            setTimeout(()=> fetchAborter.abort(), 60000);

            body.append('userPass', state.password.value);
            body.append('jobId', id);

            try{
                const res=await fetch(process.env.API+'jobs', parseFetchToken({
                    signal:fetchAborter.signal,
                    method:'DELETE',
                    body
                }));
                let {status}=res, acceptedStatus=isStatus(status, 200, 401, 403, 404, 406, 500);

                if(acceptedStatus){
                    let response=await res.json(), variant=null, message=null;

                    variant=status===200 ? 'success' : status===401 ? 'warning' : status===403 ? 'warning' : 'error';

                    if(status===406){
                        console.log(response);
                        message=response.errors ?
                        Object.keys(response.errors).length>0 ?
                        response.errors.userPass &&
                        response.errors.userPass :
                        response.errors[Object.keys(response.errors)[0]] :
                        response.message;
                    }else{
                        message=response.message;
                        dispatch({type:TYPES.CLOSE_REQUIRED_PASSWORD});
                    }

                    if(status==200) dispatch({type:TYPES.REMOVE_JOB, payload:id});
                    enqueueSnackbar(message, {variant});
                }else{
                    enqueueSnackbar('Unexpected response!', {variant:'error'});
                    dispatch({type:TYPES.CLOSE_REQUIRED_PASSWORD});
                }
            }catch(e){
                dispatch({type:TYPES.CLOSE_REQUIRED_PASSWORD});
                enqueueSnackbar(fetchAborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant:'error'});
            }
        }else{
            if(!state.password.value) dispatch({type:TYPES.CHANGE_PASSWORD, payload:{value:state.password.value, error:'The password is required!'}});
            if(!state.selectedJob){
                dispatch({type:TYPES.CLOSE_REQUIRED_PASSWORD});
                enqueueSnackbar('There is no customer selected!', {variant:'error'});
            }
        }
    }

    const handleSelectedJob=(id)=>{
        dispatch({type:TYPES.CHANGE_SELECTED_JOB, payload:id});
    }

    const setRequiredPassword=(stateRequiredPassword)=>{
        dispatch({type:TYPES.CHANGE_REQUIRE_PASSWORD, payload:stateRequiredPassword});
    }

    return (
        <Layout>
            <MainContainer id="Jobs" className="job-page">
                <header className={`main-header bettwenFlex ghost-border-bottom${state.searchShow ? ' open-search' : ''}`}>
                    <h2>
                        {search.length>0 ? 'Search Result:' : 'All Jobs'}
                    </h2>

                    <div className="search-input startFlex">
                        {!state.searchShow ? (
                            <button
                                className='startFlex'
                                onClick={()=> {
                                    dispatch({type:TYPES.OPEN_SEARCH});
                                    inputSearch.current.focus();
                                }}
                            >
                                <SearchIcon/>
                            </button>
                        ) : (
                            <button
                                className='startFlex'
                                onClick={()=>{
                                    dispatch({type:TYPES.CLOSE_SEARCH});
                                    setSearch('');
                                }}
                            >
                                <CloseIcon/>
                            </button>
                        )}
                        <input
                            type='text'
                            ref={inputSearch}
                            value={search}
                            placeholder="Search..."
                            onChange={(e)=> setSearch(e.target.value)}
                            onBlur={()=> search.length<1 ? dispatch({type:TYPES.CLOSE_SEARCH}) : null}
                        />
                    </div>
                </header>

                <div className={`main-content${search.length>0 ? ' hide' : state.jobs.data===null ? ' hide' : state.jobs.data.length<1 ? ' hide' : ''}`}>
                    {state.jobs.data!=null && state.jobs.data.map(el=> (
                        <JobCard
                            key={'card-job-'+el._id}
                            job={el}
                            onDelete={()=>handleSelectedJob(el._id.toString())}
                            open={()=> dispatch({type:TYPES.CHANGE_VIEW_JOB, payload:{value:true, job:el._id}})}
                        />
                    ))}
                </div>

                <div className={`main-search${search.length<1 ? ' hide' : state.jobsSearch.data===null ? ' hide' : state.jobsSearch.data.length<1 ? ' hide' : ''}`}>
                    {state.jobsSearch.data!=null && state.jobsSearch.data.map(el=> (
                        <JobCard
                            key={'card-job-'+el._id}
                            job={el}
                            onDelete={()=>handleSelectedJob(el._id.toString())}
                            open={()=> dispatch({type:TYPES.CHANGE_VIEW_JOB, payload:{value:true, job:el._id}})}
                        />
                    ))}
                </div>

                <MessageSection
                    error={search.length<1 ? state.jobs.error : state.jobsSearch.error}
                    message={search.length<1 ? state.jobs.message : state.jobsSearch.message}
                />

                <div className={`loader-section${state.loading ? ' show' : ''}`}>
                    <Loader/>
                </div>

                <AddItemButton>
                    <AddIcon/>
                </AddItemButton>
            </MainContainer>

            <RequirePasswordAlert
                acceptAction={{action:handleDelete, close:false}}
                open={()=> inputPassword.current.focus()}
                close={state.closeRequiredPassword}
                show={state.requiredPassword}
                setShow={setRequiredPassword}
                title='Are you sure?'
                message='When deleting an job, you should know that all the information corresponding to it will be deleted.'
            >
                <Input
                    type="password"
                    reference={inputPassword}
                    label="Password"
                    value={state.password.value}
                    error={state.password.error}
                    required={true}
                    onChange={(e)=>dispatch({type:TYPES.CHANGE_PASSWORD, payload:{value:e.target.value, error:null}})}
                />
            </RequirePasswordAlert>

            <JobModal
                jobId={state.viewJob}
                open={state.openViewJob}
                setOpen={(val)=> dispatch({type:TYPES.CHANGE_VIEW_JOB, payload:{value:val, job:null}})}
                changeImg={(photo, id)=>dispatch({type:TYPES.CHANGE_JOB_PHOTO, payload:{id, photo}})}
                onDelete={(id)=>handleSelectedJob(id)}
            />
        </Layout>
    )
}

export default Jobs;

/* export async function getStaticProps(){
    const aborter=new AbortController();
    let expired=false, data={data:null, error:null, message:null};
    setTimeout(()=>{
        expired=true;
        aborter.abort();
    }, 5000);

    try{
        const res=await fetch(process.env.API+'jobs', {signal:aborter.signal});
        let response=null, {status}=res,
        isAccepted=isStatus(status, 200, 403, 404, 500);

        if(isAccepted){
            response = await res.json();

            data=status===200 ? ({
                ...data,
                data:response.length<1 ? null : response,
                message:response.length<1 ? 'Jobs not found!' : null
            }) : ({
                ...data,
                message:response.message,
                error:response.message
            });
        }else{
            data={...data, message:'Unexpected response!', error:'Unexpected response!'};
        }
    }catch(e){
        console.log(e);
        data={...data, error:expired ? 'API request timeout has expired!' : 'Failed to establish connection to server!'};
    }

    return {
        props:{jobsData:data}
    };
}; */

export const getServerSideProps=serverPropsVerifySession(async function(ctx){
    let {req, res}=ctx;
    return {
        props:{
            jobsData: await getServerData('jobs', 5000, {req, res})
        }
    }
}, {jobsData:'data'});