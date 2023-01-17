import { useState, useReducer, useContext, useEffect } from 'react';
import Router from 'next/router';
import {AbortController} from 'node-abort-controller';
import { useSnackbar } from 'notistack';

// Layout:
import Layout from '../../../components/sections/Layout';

// Components:
import MainContainer from '../../../components/sections/MainContainer';
import MessageSection from '../../../components/sections/MessageSection';
import ItemForm from "../../../components/ItemForm.js";
import Input from '../../../components/floatLabel/Input';
import Textarea from '../../../components/floatLabel/Textarea';
import CompleteSimpleCheckbox from '../../../components/CompleteSimpleCheckbox';

// Material Icons:
import SendIcon from '@mui/icons-material/Send';

// Contexts:
import globalLoaderContext from '../../../contexts/globalLoaderContext';
import breadcrumbsContext from '../../../contexts/breadcrumbsContext';

// Reducers:
import jobsFormReducer, {initialState, TYPES} from '../../../reducers/jobsFormReducer';

// Utils:
import {
    validateName,
    validateSimpleText
} from '../../../util/validators';
import { asignError, isStatus } from '../../../util/functionals';
import { getServerDataAsPromise, serverPropsVerifySession } from '../../../util/serverGetters';
import { parseFetchToken } from '../../../util/functionals';

const Edit=({areasData, jobId, jobData})=>{
    const {setBreadcrumbsOptions}=useContext(breadcrumbsContext);
    const [state, dispatch] = useReducer(jobsFormReducer, initialState);
    const [areas, setAreas]=useState({
        areas:!areasData.data ? null : areasData.data.length<1 ? null : areasData.data.map(el=> {return {...el, checked:false}}),
        allAreas:false
    });
    const {hideGlobalLoader, showGlobalLoader, globalLoader} = useContext(globalLoaderContext);
    const { enqueueSnackbar }=useSnackbar();

    const validator=()=>{
        let errors=asignError(errors, 'name', validateName(state.values.name, 'name', true));
        errors=asignError(errors, 'description', validateSimpleText(state.values.description, 'description', 5, 150));

        if(state.values.photo.length>1){
            if(!errors) errors={};
            errors.photo=[];
            for(let i=0; i<state.values.photo.length; i++) errors.photo.push(i===0 ? null : 'Only 1 files allowed!');
        }

        dispatch({type:TYPES.CHANGE_ERRORS, payload:errors});
        return errors;
    };

    const handleSubmit=async (e)=>{
        e.preventDefault();

        if(!validator() && !globalLoader){
            const body=new FormData();
            let aborter=new AbortController();
            setTimeout(()=>aborter.abort(), 60000);

            showGlobalLoader();

            for(let i in state.values){
                if(i==='photo'){
                    body.append('photo', state.values.photo.length>0 ? state.values.photo[0] : null);
                }else{
                    body.append(i, state.values[i]);
                }
            }

            if(Array.isArray(areas.areas)){
                areas.areas.forEach(el=>{
                    if(el.checked===true) body.append('areas', el._id.toString());
                });
            }

            body.append('jobId', jobId);

            try{
                const res=await fetch(process.env.API+'jobs', parseFetchToken({
                    signal:aborter.signal,
                    method: 'PUT',
                    body
                }));
                let thereMessage=isStatus(res.status, 200, 403, 404, 406, 500), variant='default', message=null;

                if(thereMessage){
                    let response=await res.json();
                    if(res.status!==406){
                        message=response.message;
                        variant=res.status===200 ? 'success' : res.status===403 ? 'warning' : 'error';
                        enqueueSnackbar(message, {variant});

                        if(res.status===200) Router.push('/jobs');
                    }else{
                        console.log(response);
                        let errors=response.errors;
                        if('areas' in response.errors) enqueueSnackbar(Array.isArray(areas.areas) ?  response.message : 'There is an area selection error!', {variant:'error'});

                        dispatch({
                            type:TYPES.CHANGE_ERRORS,
                            payload:errors.photo ? {...errors, photo:[errors.photo]} : errors
                        });
                    }
                }else{
                    enqueueSnackbar('Unexpected response!', {variant:'error'});
                }
            }catch(e){
                enqueueSnackbar(aborter.signal.aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant: 'error'});
            }

            hideGlobalLoader();
        }else if(globalLoader){
            enqueueSnackbar('Please wait while the current process is finished!');
        }
    }

    const handleChange=(e, format)=>{
        let {name, value, files, checked, type}=e.target;
        dispatch({
            type:TYPES.CHANGE_VALUES,
            payload:{
                name,
                value:type==='file' ? files : type==='checkbox' ? checked : value,
                format
            }
        });
    }

    const changeCheckArea=(id)=>{
        let all=true, first=false, index=0, newAreas=!areas.areas ? null : areas.areas.map((el, i)=>{
            if(el._id===id){
                el.checked=!el.checked;
                index=i;
            }

            if(i===0){
                first=el.checked;
            }else if(el.checked!==first && all===true){
                all=false;
            }
            return el;
        });
        setAreas({
            areas:newAreas,
            allAreas:!all ? false : newAreas[index].checked
        });
    };

    const changeAllAreas=()=>{
        setAreas({
            allAreas:!areas.areas ? false : areas.areas.length<1 ? false : !areas.allAreas,
            areas:!areas.areas ? null : areas.areas.map(el=>{return {...el, checked:!areas.allAreas}})
        });
    };

    useEffect(()=>{
        let job=jobData.data;
        if(job){
            dispatch({
                type:TYPES.SET_FORM,
                payload:{
                    ...initialState.values,
                    name:job.name,
                    description:job.description ? job.description : '',
                }
            });
            if(Array.isArray(areas.areas)){
                let all=true, first=false, index=0, newAreas=areas.areas.map((el, i) =>{
                    if(job.areas.some(area=> area._id===el._id)) el.checked=true;

                    if(i===0){
                        first=el.checked;
                    }else if(el.checked!==first && all===true){
                        all=false;
                    }

                    return el;
                });

                setAreas({
                    allAreas:!all ? false : true,
                    areas:newAreas
                });
            }
        }

        setBreadcrumbsOptions({
            routes:[
                {
                    link:'/jobs/edit/'+jobId,
                    none:true
                },{
                    link:'/jobs/edit',
                    path:'/jobs/edit/'+jobId,
                }
            ]
        });
    }, []);

    return (
        <Layout>
            <MainContainer id="JobAdd" className="form-section">
                <MessageSection error={jobData.error} message={jobData.message}/>
                <ItemForm
                    title={`Edit Job: ${!jobData.data ? 'NOT FOUND' : jobData.data.name}`}
                    onSubmit={handleSubmit}
                    className={jobData.data ? '' : ' hide'}
                >
                    <div className={`grid-col-2`}>
                        <Input
                            error={state.errors && state.errors.name && state.errors.name}
                            onChange={handleChange}
                            name="name"
                            value={state.values.name}
                            label="Name"
                            required={true}
                        />
                    </div>

                    <div className='checkbox-section'>
                        <label className='checkbox-section__label'>
                            Areas <span className='required'>*</span>
                        </label>
                        {!areas.areas ? (
                            <div className='message-section'>
                                <p className='message-section__message'>
                                    {areasData.error ? areasData.error : areasData.message}
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className='select-all'>
                                    <CompleteSimpleCheckbox
                                        value='on'
                                        label='All Areas'
                                        onChange={changeAllAreas}
                                        checked={areas.allAreas}
                                        id='allAreas'
                                    />
                                </p>
                                <div className='grid-col-2'>
                                    <div>
                                        {areas.areas.map((el, i)=>{
                                            if((areas.areas.length>20 && (i+1)<=(areas.areas.length/2)) || (areas.areas.length<=20 && i<10)){
                                                return <CompleteSimpleCheckbox
                                                    onChange={(e)=>changeCheckArea(el._id)}
                                                    value='on'
                                                    label={el.name}
                                                    key={el._id}
                                                    checked={el.checked}
                                                    id={'area-'+el._id}
                                                />;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    {areas.areas.length>=10 ? (
                                        <div>
                                            {areas.areas.map((el, i)=>{
                                                if((areas.areas.length>20 && (i+1)>(areas.areas.length/2)) || (areas.areas.length<=20 && i>=10)){
                                                    return <CompleteSimpleCheckbox
                                                        onChange={(e)=>changeCheckArea(el._id)}
                                                        value='on'
                                                        label={el.name}
                                                        key={el._id}
                                                        checked={el.checked}
                                                        id={'area-'+el._id}
                                                    />;
                                                }
                                                return null;
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                            </>
                        )}
                    </div>

                    <Textarea
                        error={state.errors && state.errors.description && state.errors.description}
                        onChange={handleChange}
                        name="description"
                        value={state.values.description}
                        label="Description"
                        rows="4"
                    >
                    </Textarea>

                    <button className="submit-form-button" type='submit'>
                        <SendIcon/> Submit
                    </button>
                </ItemForm>
            </MainContainer>
        </Layout>
    )
}

/* Add.getInitialProps=async (ctx) => {
    let areas={data:null, error:null, message:null}, abortedArea=false;
    const aborterAreas=new AbortController();
    setTimeout(() =>{
        aborterAreas.abort();
        abortedArea=true;
    }, 5000);

    try{
        const res=await fetch(process.env.API+'areas/', {signal:aborterAreas.signal}),
        thereMessage=isStatus(res.status, 200, 403, 404, 500);
        let data=null;

        if(!thereMessage) throw 10;
        data=await res.json();
        areas={
            error:!data.message ? null : res.status===200 ? null : res.status===404 ? null : data.message,
            message:!data.message ? null : data.message,
            data:!data.message ? data : null,
        }
    }catch(e){
        let err=e===10 ? "Unexpected response!" : abortedArea ? 'API request timeout has expired!' : 'Failed to establish connection to server!';
        areas={
            ...areas,
            message:err,
            error:err
        }
        console.log(e);
    }

    let job={data:null, error:null, message:null}, aborted=false;
    const {jobId}=ctx.query, aborter=new AbortController();
    setTimeout(() =>{
        aborter.abort();
        aborted=true;
    }, 5000);

    try{
        const res=await fetch(process.env.API+'jobs/'+jobId, {signal:aborter.signal}),
        thereMessage=isStatus(res.status, 200, 403, 404, 500);
        let data=null;

        if(!thereMessage) throw 10;
        data=await res.json();
        job={
            error:!data.message ? null : res.status===200 ? null : res.status===404 ? null : data.message,
            message:!data.message ? null : data.message,
            data:!data.message ? data : null,
        }
    }catch(e){
        let err=e===10 ? "Unexpected response!" : aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!';
        job={
            ...job,
            message:err,
            error:err
        }
        console.log(e);
    }

    return { areasData:areas, jobId, jobData:job }
}; */

export const getServerSideProps=serverPropsVerifySession(async function(ctx){
    let {req, res}=ctx;
    const {jobId}=ctx.query, props=await getServerDataAsPromise({req, res}, {
        name: 'areasData',
        url: 'areas/',
        timeout: 60000
    }, {
        name: 'jobData',
        url: 'jobs/'+jobId,
        timeout: 60000
    });

    return {
        props:{
            ...props,
            //jobData: await getServerData('jobs/'+jobId, 60000),
            jobId
        }
    }
}, {jobData:'data', areasData:'data', jobId:'asdasdasdasd'});

export default Edit;