import {useContext, useState, useEffect} from 'react';
import {AbortController} from 'node-abort-controller';
import { useSnackbar } from 'notistack';
import Router from 'next/router';

// Layout:
import Layout from '../../../components/sections/Layout';

// Components:
import MainContainer from '../../../components/sections/MainContainer';
import MessageSection from '../../../components/sections/MessageSection';
import ItemForm from "../../../components/ItemForm.js";
import Input from '../../../components/floatLabel/Input';
import Select from '../../../components/floatLabel/Select';
import Textarea from '../../../components/floatLabel/Textarea';

// Material Icons:
import SendIcon from '@mui/icons-material/Send';

// Util's:
import {
    validateName,
    validateGender,
    validateSSN,
    validateEmail,
    validatePhone,
    validateSimpleText
} from '../../../util/validators';
import { asignError, isStatus } from '../../../util/functionals';
import { firstUpper } from '../../../util/format';
import { getServerData, serverPropsVerifySession } from '../../../util/serverGetters';
import { parseFetchToken } from '../../../util/functionals';

// Contexts:
import globalLoaderContext from '../../../contexts/globalLoaderContext';
import breadcrumbsContext from '../../../contexts/breadcrumbsContext';

// Constants:
const initialForm={
    id: null,
    first_name:'',
    second_name:'',
    first_last_name:'',
    second_last_name:'',
    gender:'male',
    ssn:'',
    email:'',
    phone:'',
    phone_secondary:'',
    address:''
}

function User({userData, username}) {
    const {hideGlobalLoader, showGlobalLoader} = useContext(globalLoaderContext);
    const {setBreadcrumbsOptions}=useContext(breadcrumbsContext);
    const [userForm, setUserForm]=useState(initialForm);
    const [userErrors, setUserErrors]=useState(null);
    const { enqueueSnackbar }=useSnackbar();

    const handleChange=({target}, format)=>{
        let {value}=target;
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

        setUserErrors(errors);
        if(errors!==null && Object.keys(errors).length>0) return true;
        return false;
    };

    const handleSubmit=async (e)=>{
        e.preventDefault();

        if(!validator()){
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
                    method: 'PUT',
                    body
                }));
                let thereMessage=isStatus(res.status, 200, 403, 404, 406, 500), variant=null;

                hideGlobalLoader();

                if(thereMessage) data=await res.json();

                switch(res.status){
                    case 200:
                        variant='success';
                        /* setUserForm(initialForm);
                        e.target.reset(); */
                        Router.back();
                        break;

                    case 403:
                        variant='warning';
                        break;

                    case 404:
                        variant='error';
                        break;

                    case 406:
                        if('id_user' in data.errors){
                            variant='error';
                            data.message=data.errors.id_user;
                        }
                        setUserErrors(data.errors.photo ? {...data.errors, photo:[data.errors.photo]} : data.errors);
                        break;

                    case 500:
                        variant='error';
                        break;

                    default:
                        throw "Unexpected response!"
                }

                if(thereMessage && variant!==null) enqueueSnackbar(data.message, {variant});
            }catch(e){
                console.log(e);
                hideGlobalLoader();
                enqueueSnackbar('Failed to establish connection to server!', {variant:'error'});
            }
        }
    };

    useEffect(()=>{
        let user = userData.data;

        if(user) setUserForm({
            first_name:user.first_name,
            second_name:user.second_name ? user.second_name : '',
            first_last_name:user.first_last_name,
            second_last_name:user.second_last_name ? user.second_last_name : '',
            gender:firstUpper(user.gender),
            ssn:user.SSN,
            email:user.email,
            phone:user.phone,
            phone_secondary:user.secondary_phone ? user.secondary_phone : '',
            address:user.address,
            id_user: user.id
        });

        setBreadcrumbsOptions({
            routes:[
                {
                    link:'/users/edit/'+username,
                    none:true
                },{
                    link:'/users/edit',
                    path:'/users/edit/'+username,
                }
            ]
        });
    }, []);

    return (
        <Layout>
            <MainContainer>
                <MessageSection error={userData.error} message={userData.message}/>
                <ItemForm
                    title={`Edit User: ${userData.data ? userData.data.username : 'NOT FOUND'}`}
                    onSubmit={!userData.data ? ((e)=> e.preventDefault()) : handleSubmit}
                    className={userData.data ? '' : ' hide'}
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
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
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

                    <button className="submit-form-button" type='submit'>
                        <SendIcon/> Submit
                    </button>
                </ItemForm>
            </MainContainer>
        </Layout>
    );
}

/* User.getInitialProps = async (ctx) => {
    let userData={data:null, error:null, message:null}, aborted=false;
    const {id_user}=ctx.query;
    const aborter=new AbortController();
    setTimeout(() =>{
        aborter.abort();
        aborted=true;
    }, 5000);

    try{
        const res=await fetch(process.env.API+'users/'+id_user, {signal:aborter.signal}),
        thereMessage=isStatus(res.status, 200, 403, 404, 500);
        let data=null;

        if(!thereMessage) throw 10;
        data=await res.json();
        userData={
            error:!data.message ? null : res.status===200 ? null : res.status===404 ? null : data.message,
            message:!data.message ? null : data.message,
            data:!data.message ? data : null,
        }
    }catch(e){
        let err=e===10 ? "Unexpected response!" : aborted ? 'API request timeout has expired!' : 'Failed to establish connection to server!';
        userData={
            ...userData,
            message:err,
            error:err
        }
        console.log(e);
    }

    return { userData, id_user }
} */

export const getServerSideProps=serverPropsVerifySession(async function(ctx){
    const {username}=ctx.query;
    let {req, res}=ctx;

    return {
        props:{
            userData: await getServerData('users/username/'+username, 5000, {req, res}),
            username
        }
    }
}, {userData:'data', username:'xxxxxxxxx'});

export default User;