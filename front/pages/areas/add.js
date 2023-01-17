import { useReducer, useContext } from 'react';
import {AbortController} from 'node-abort-controller';
import { useSnackbar } from 'notistack';

// Layout:
import Layout from '../../components/sections/Layout';

// Components:
import MainContainer from '../../components/sections/MainContainer';
import ItemForm from "../../components/ItemForm.js";
import Input from '../../components/floatLabel/Input';
import Textarea from '../../components/floatLabel/Textarea';
import CompleteSimpleCheckbox from '../../components/CompleteSimpleCheckbox';
import UploadFile from '../../components/UploadFile';

// Material Icons:
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';

// Contexts:
import globalLoaderContext from '../../contexts/globalLoaderContext';

// Reducers:
import areasFormReducer, {initialState, TYPES} from '../../reducers/areasFormReducer';

// Utils:
import {
    validateName,
    validateSimpleText
} from '../../util/validators';
import { asignError, isStatus } from '../../util/functionals';
import { serverPropsVerifySession } from '../../util/serverGetters';
import { parseFetchToken } from '../../util/functionals';

export default function Add(){
    const [state, dispatch] = useReducer(areasFormReducer, initialState);
    const {hideGlobalLoader, showGlobalLoader, globalLoader} = useContext(globalLoaderContext);
    const { enqueueSnackbar }=useSnackbar();

    const validator=()=>{
        let errors=asignError(errors, 'name', validateName(state.values.name, 'name', true));
        errors=asignError(errors, 'description', validateSimpleText(state.values.description, 'description', 5, 150));

        if(typeof state.values.internal_area!=='boolean') errors={...errors, internal_area:'The value of "internal_area" must be defined in boolean format!'};
        if(typeof state.values.external_area!=='boolean') errors={...errors, external_area:'The value of "external_area" must be defined in boolean format!'};

        if(!errors || (!errors.internal_area && !errors.external_area)){
            if(!state.values.internal_area && !state.values.external_area) errors={
                ...errors,
                internal_area:'You must select at least one type of environment!'
            };
        }

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
            let aborter=new AbortController(), data=null, multi_environment=false, internal_area=false;
            setTimeout(()=>aborter.abort(), 60000);

            showGlobalLoader();

            for(let i in state.values){
                if(i==='photo'){
                    body.append('photo', state.values.photo.length>0 ? state.values.photo[0] : null);
                }else if(i!=='internal_area' && i!=='external_area'){
                    body.append(i, state.values[i]);
                }
            }

            if(state.values.external_area===true && state.values.internal_area===true){
                internal_area=false;
                multi_environment=true;
            }else if(state.values.external_area===true){
                internal_area=false;
            }else{
                internal_area=true;
            }

            body.append('multi_environment', multi_environment);
            body.append('internal_area', internal_area);

            try{
                const res=await fetch(process.env.API+'areas', parseFetchToken({
                    signal:aborter.signal,
                    method: 'POST',
                    body
                }));
                let thereMessage=isStatus(res.status, 201, 403, 404, 406, 500), variant='default', message=null;

                if(thereMessage){
                    let response=await res.json();
                    if(res.status!==406){
                        message=response.message;
                        variant=res.status===201 ? 'success' : res.status===403 ? 'warning' : 'error';
                        enqueueSnackbar(message, {variant});

                        if(res.status===201) dispatch({type:TYPES.RESET_FORM});
                    }else{
                        console.log(response);
                        let errors=response.errors;
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
                name:e.target.name,
                value:type==='file' ? files : type==='checkbox' ? checked : value,
                format
            }
        });
    }

    return (
        <Layout>
            <MainContainer id="AreaAdd" className="form-section">
                <ItemForm
                    title='New Area'
                    onSubmit={handleSubmit}
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

                    <div style={{marginTop:'1.75em'}}>
                        <label className=''>
                            Enviroment Type <span className='required'>*</span>
                        </label>
                        <div
                            className={`grid-col-2`} style={{
                            marginTop:'.75em'
                        }}>
                            <CompleteSimpleCheckbox
                                checked={state.values.internal_area}
                                name='internal_area'
                                value='on'
                                onChange={handleChange}
                                label='Internal'
                                id='internal-check'
                                error={state.errors && state.errors.internal_area && state.errors.internal_area}
                            />
                            <CompleteSimpleCheckbox
                                checked={state.values.external_area}
                                name='external_area'
                                value='on'
                                onChange={handleChange}
                                label='External'
                                error={state.errors && state.errors.external_area && state.errors.external_area}
                            />
                        </div>
                        {state.errors ? state.errors.external_area ? (
                            <p className='input-error'>{state.errors.external_area}</p>
                        ) : state.errors.internal_area ? (
                            <p className='input-error'>{state.errors.internal_area}</p>
                        ) : null : null}
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

                    <UploadFile
                        setFiles={(state)=> dispatch({type:TYPES.CHANGE_PHOTO, payload:state})}
                        value={state.values.photo}
                        label="Upload Image"
                        onChange={handleChange}
                        name='photo'
                        errors={state.errors && state.errors.photo && state.errors.photo}
                        cleaner={state.photoCleaner}
                        maxFiles={1}
                        icon={ImageIcon}
                        id='photo'
                    />

                    <button className="submit-form-button" type='submit'>
                        <SendIcon/> Submit
                    </button>
                </ItemForm>
            </MainContainer>
        </Layout>
    )
}

export const getServerSideProps=serverPropsVerifySession();