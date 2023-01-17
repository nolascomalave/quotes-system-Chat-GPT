import {useContext, useState} from 'react';
import {AbortController} from 'node-abort-controller';
import { useSnackbar } from 'notistack';

// Layout:
import Layout from '../../components/sections/Layout';
import { parseFetchToken } from '../../util/functionals';

// Components:
import MainContainer from "../../components/sections/MainContainer";
import ItemForm from "../../components/ItemForm.js";
import Input from '../../components/floatLabel/Input';
import Select from '../../components/floatLabel/Select';
import Textarea from '../../components/floatLabel/Textarea';
import UploadFile from '../../components/UploadFile';

// Material Icons:
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';

// Util's:
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

// Contexts:
import globalLoaderContext from '../../contexts/globalLoaderContext';

// Constants:
const initialForm={
    first_name:'',
    second_name:'',
    first_last_name:'',
    second_last_name:'',
    gender:'male',
    ssn:'',
    email:'',
    phone:'',
    phone_secondary:'',
    address:'',
    photo:[]
}

export default function Add(){
    const {hideGlobalLoader, showGlobalLoader, globalLoader} = useContext(globalLoaderContext);
    const [userForm, setUserForm]=useState(initialForm);
    const [userErrors, setUserErrors]=useState(null);
    const [photoCleaner, setPhotoCleaner]=useState(false);
    const { enqueueSnackbar }=useSnackbar();

    const handleChange=({target}, format)=>{
        let {value}=target;
        if(target.type.toLowerCase()==='file') value=target.files;
        if(userErrors){
            let errors=userErrors;
            if(target.name in errors) delete errors[target.name];
            if(Object.keys(errors).length<1) errors=null;
            setUserErrors(errors);
        }
        setUserForm({...userForm, [target.name]: format ? format(value) : value});
    };

    const validator=()=>{
        let errors=null;
        setUserErrors(errors);

        errors=asignError(null, 'first_name', validateName(userForm.first_name, 'name', true));
        errors=asignError(errors, 'second_name', validateName(userForm.second_name, 'name'));
        errors=asignError(errors, 'first_last_name', validateName(userForm.first_last_name, 'surname', true));
        errors=asignError(errors, 'second_last_name', validateName(userForm.second_last_name, 'surname'));
        errors=asignError(errors, 'gender', validateGender(userForm.gender, true));
        errors=asignError(errors, 'ssn', validateSSN(userForm.ssn, true));
        errors=asignError(errors, 'email', validateEmail(userForm.email, true));
        errors=asignError(errors, 'phone', validatePhone(userForm.phone, 'en-US', true));
        errors=asignError(errors, 'phone_secondary', validatePhone(userForm.phone_secondary, 'en-US'));
        errors=asignError(errors, 'address', validateSimpleText(userForm.address, 'address', 5, 500, true));

        if(userForm.photo.length>1){
            if(!errors) errors={};
            errors.photo=[];
            for(let i=0; i<userForm.photo.length; i++) errors.photo.push(i===0 ? null : 'Only 1 files allowed!');
        }

        setUserErrors(errors);
        if(errors!==null && Object.keys(errors).length>0) return true;
        return false;
    };

    const handleSubmit=async (e)=>{
        e.preventDefault();

        //console.log(userForm);
        if(!validator() && !globalLoader){
            const body=new FormData();
            let aborter=new AbortController(), data=null;
            setTimeout(()=>aborter.abort(), 30000);

            showGlobalLoader();

            for(let i in userForm){
                if(i==='photo') body.append('photo', userForm.photo.length>0 ? userForm.photo[0] : null);
                else body.append(i, userForm[i]);
            }

            try{
                const res=await fetch(process.env.API+'users', parseFetchToken({
                    signal:aborter.signal,
                    method: 'POST',
                    body
                }));
                let thereMessage=isStatus(res.status, 201, 403, 404, 406, 500), variant='default';

                hideGlobalLoader();

                if(thereMessage) data=await res.json();

                switch(res.status){
                    case 201:
                        variant='success';
                        setUserForm(initialForm);
                        setPhotoCleaner(!photoCleaner);
                        e.target.reset();
                        break;

                    case 403:
                        variant='warning';
                        break;

                    case 404:
                        variant='error';
                        break;

                    case 406:
                        setUserErrors(data.errors.photo ? {...data.errors, photo:[data.errors.photo]} : data.errors);
                        break;

                    case 500:
                        variant='error';
                        break;

                    default:
                        throw "Unexpected response!"
                }

                if(thereMessage && res.status!==406) enqueueSnackbar(data.message, {variant});
            }catch(e){
                console.log(e);
                hideGlobalLoader();
                enqueueSnackbar('Failed to establish connection to server!', {variant:'error'});
            }
        }else if(globalLoader){
            enqueueSnackbar('Please wait while the current process is finished!');
        }
    };

    return (
        <Layout>
            <MainContainer id="UserAdd" className="form-section">
                <ItemForm
                    title='New User'
                    onSubmit={handleSubmit}
                >
                    <div className="grid-col-2">
                        <Input
                            error={userErrors && userErrors.first_name && userErrors.first_name}
                            onChange={handleChange}
                            name="first_name"
                            value={userForm.first_name}
                            label="First Name"
                            required={true}
                        />
                        <Input
                            error={userErrors && userErrors.second_name && userErrors.second_name}
                            onChange={handleChange}
                            name="second_name"
                            value={userForm.second_name}
                            label="Second Name"
                        />
                    </div>

                    <div className="grid-col-2">
                        <Input
                            error={userErrors && userErrors.first_last_name && userErrors.first_last_name}
                            onChange={handleChange}
                            name="first_last_name"
                            value={userForm.first_last_name}
                            label="First Surname"
                            required={true}
                        />
                        <Input
                            error={userErrors && userErrors.second_last_name && userErrors.second_last_name}
                            onChange={handleChange}
                            name="second_last_name"
                            value={userForm.second_last_name}
                            label="Second Surname"
                        />
                    </div>

                    <div className="grid-col-2">
                        <Select
                            error={userErrors && userErrors.gender && userErrors.gender}
                            onChange={handleChange}
                            required={true}
                            name='gender'
                            value={userForm.gender}
                            label="Gender"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </Select>
                        <Input
                            error={userErrors && userErrors.ssn && userErrors.ssn}
                            onChange={handleChange}
                            required={true}
                            name="ssn"
                            type="text"
                            value={userForm.ssn}
                            label="SSN"
                        />
                    </div>

                    <div className="grid-col-2">
                        <Input
                            error={userErrors && userErrors.email && userErrors.email}
                            onChange={handleChange}
                            required={true}
                            name="email"
                            type="email"
                            value={userForm.email}
                            label="Email"
                        />
                        <Input
                            error={userErrors && userErrors.phone && userErrors.phone}
                            onChange={handleChange}
                            required={true}
                            name="phone"
                            type="tlf"
                            value={userForm.phone}
                            label="Phone Number"
                        />
                    </div>

                    <div className="grid-col-2">
                        <Input
                            error={userErrors && userErrors.phone_secondary && userErrors.phone_secondary}
                            onChange={handleChange}
                            name="phone_secondary"
                            type="tlf"
                            value={userForm.phone_secondary}
                            label="Phone Number (Optional)"
                        />
                        <div></div>
                    </div>

                    <Textarea
                        error={userErrors && userErrors.address && userErrors.address}
                        onChange={handleChange}
                        required={true}
                        name="address"
                        value={userForm.address}
                        label="Address"
                        rows="4"
                    >
                    </Textarea>

                    <UploadFile
                        setFiles={(state)=> setUserForm({...userForm, photo:state})}
                        value={userForm.photo}
                        label="Upload Image"
                        onChange={handleChange}
                        name='photo'
                        errors={userErrors && userErrors.photo && userErrors.photo}
                        cleaner={photoCleaner}
                        maxFiles={1}
                        icon={ImageIcon}
                    />

                    <button className="submit-form-button" type='submit'>
                        <SendIcon/> Submit
                    </button>
                </ItemForm>
            </MainContainer>
        </Layout>
    );
};

export const getServerSideProps=serverPropsVerifySession();