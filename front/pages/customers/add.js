import { useReducer, useContext } from 'react';
import {AbortController} from 'node-abort-controller';
import { useSnackbar } from 'notistack';

// Layout:
import Layout from '../../components/sections/Layout';

// Components:
import MainContainer from '../../components/sections/MainContainer';
import ItemForm from "../../components/ItemForm.js";
import Input from '../../components/floatLabel/Input';
import Select from '../../components/floatLabel/Select';
import Textarea from '../../components/floatLabel/Textarea';
import CheckBocx from '../../components/CheckBox';
import UploadFile from '../../components/UploadFile';

// Material Icons:
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';

// Contexts:
import globalLoaderContext from '../../contexts/globalLoaderContext';

// Reducers:
import customersFormReducer, {initialState, TYPES} from '../../reducers/customersFormReducer';

// Utils:
import {
    validateName,
    validateGender,
    validateSSN,
    validateEmail,
    validatePhone,
    validateSimpleText
} from '../../util/validators';
import { asignError, isStatus } from '../../util/functionals';
import { serverPropsVerifySession } from '../../util/serverGetters';
import { parseFetchToken } from '../../util/functionals';

export default function Add(){
    const [state, dispatch] = useReducer(customersFormReducer, initialState);
    const {hideGlobalLoader, showGlobalLoader, globalLoader} = useContext(globalLoaderContext);
    const { enqueueSnackbar }=useSnackbar();

    const validator=()=>{
        let errors=null;

        if(typeof state.values.legal!=='boolean'){
            errors={legal:'The value of "legal" must be defined in boolean format!'};
        }else if(!state.values.legal){
            errors=asignError(null, 'first_name', validateName(state.values.first_name, 'name', true));
            errors=asignError(errors, 'second_name', validateName(state.values.second_name, 'name'));
            errors=asignError(errors, 'first_last_name', validateName(state.values.first_last_name, 'surname', true));
            errors=asignError(errors, 'second_last_name', validateName(state.values.second_last_name, 'surname'));
            errors=asignError(errors, 'gender', validateGender(state.values.gender, true));
            errors=asignError(errors, 'ssn', validateSSN(state.values.ssn, true));
        }else{
            errors=asignError(errors, 'name', validateSimpleText(state.values.name, 'name', 2, 100));
            errors=asignError(errors, 'description', validateSimpleText(state.values.description, 'description', 5, 500));
        }

        errors=asignError(errors, 'email', validateEmail(state.values.email, true));
        errors=asignError(errors, 'phone', validatePhone(state.values.phone, 'en-US', true));
        errors=asignError(errors, 'phone_secondary', validatePhone(state.values.phone_secondary, 'en-US'));
        errors=asignError(errors, 'address', validateSimpleText(state.values.address, 'address', 5, 500, true));

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
            let aborter=new AbortController(), data=null;
            setTimeout(()=>aborter.abort(), 60000);

            showGlobalLoader();

            for(let i in state.values){
                if(i==='photo'){
                    body.append('photo', state.values.photo.length>0 ? state.values.photo[0] : null);
                }else if(i!=='legal'){
                    body.append(i, state.values[i]);
                }else{
                    body.append('is_natural', state.values.legal === false);
                }
            }

            try{
                const res=await fetch(process.env.API+'customers', parseFetchToken({
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
                        let errors=response.errors;
                        if('natural' in errors){
                            errors.legal='The "legal" value is missing from the request!';
                            delete errors.natural;
                        }
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

    const handleChange=(e)=>{
        let {name, value, files, checked, type}=e.target;
        dispatch({
            type:TYPES.CHANGE_VALUES,
            payload:{
                name:e.target.name,
                value:type==='file' ? files : type==='checkbox' ? checked : value
            }
        });
    }

    return (
        <Layout>
            <MainContainer id="CustomerAdd" className="form-section">
                <ItemForm
                    title='New Customer'
                    onSubmit={handleSubmit}
                >
                    <CheckBocx
                        checked={state.values.legal}
                        name='legal'
                        value='on'
                        onChange={handleChange}
                        label='Legal Person'
                        required={true}
                        error={state.errors && state.errors.legal && state.errors.legal}
                    />
                    <div className={`grid-col-2${!state.values.legal ? ' hide' : ''}`}>
                        <Input
                            error={state.errors && state.errors.name && state.errors.name}
                            onChange={handleChange}
                            name="name"
                            value={state.values.name}
                            label="Name"
                            required={state.values.legal}
                        />
                    </div>

                    <div className={`grid-col-2${!state.values.legal ? '' : ' hide'}`}>
                        <Input
                            error={state.errors && state.errors.first_name && state.errors.first_name}
                            onChange={handleChange}
                            name="first_name"
                            value={state.values.first_name}
                            label="First Name"
                            required={!state.values.legal}
                        />
                        <Input
                            error={state.errors && state.errors.second_name && state.errors.second_name}
                            onChange={handleChange}
                            name="second_name"
                            value={state.values.second_name}
                            label="Second Name"
                        />
                    </div>

                    <div className={`grid-col-2${!state.values.legal ? '' : ' hide'}`}>
                        <Input
                            error={state.errors && state.errors.first_last_name && state.errors.first_last_name}
                            onChange={handleChange}
                            name="first_last_name"
                            value={state.values.first_last_name}
                            label="First Surname"
                            required={!state.values.legal}
                        />
                        <Input
                            error={state.errors && state.errors.second_last_name && state.errors.second_last_name}
                            onChange={handleChange}
                            name="second_last_name"
                            value={state.values.second_last_name}
                            label="Second Surname"
                        />
                    </div>

                    <div className={`grid-col-2${!state.values.legal ? '' : ' hide'}`}>
                        <Select
                            error={state.errors && state.errors.gender && state.errors.gender}
                            onChange={handleChange}
                            required={!state.values.legal}
                            name='gender'
                            value={state.values.gender}
                            label="Gender"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </Select>
                        <Input
                            error={state.errors && state.errors.ssn && state.errors.ssn}
                            onChange={handleChange}
                            required={!state.values.legal}
                            name="ssn"
                            type="text"
                            value={state.values.ssn}
                            label="SSN"
                        />
                    </div>

                    <div className="grid-col-2">
                        <Input
                            error={state.errors && state.errors.email && state.errors.email}
                            onChange={handleChange}
                            required={true}
                            name="email"
                            type="email"
                            value={state.values.email}
                            label="Email"
                        />
                        <Input
                            error={state.errors && state.errors.phone && state.errors.phone}
                            onChange={handleChange}
                            required={true}
                            name="phone"
                            type="tlf"
                            value={state.values.phone}
                            label="Phone Number"
                        />
                    </div>

                    <div className="grid-col-2">
                        <Input
                            error={state.errors && state.errors.phone_secondary && state.errors.phone_secondary}
                            onChange={handleChange}
                            name="phone_secondary"
                            type="tlf"
                            value={state.values.phone_secondary}
                            label="Phone Number (Optional)"
                        />
                        <div></div>
                    </div>

                    <Textarea
                        className={!state.values.legal ? ' hide' : ''}
                        error={state.errors && state.errors.description && state.errors.description}
                        onChange={handleChange}
                        name="description"
                        value={state.values.description}
                        label="Description"
                        rows="4"
                    >
                    </Textarea>

                    <Textarea
                        error={state.errors && state.errors.address && state.errors.address}
                        onChange={handleChange}
                        required={true}
                        name="address"
                        value={state.values.address}
                        label="Address"
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