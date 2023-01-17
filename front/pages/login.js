import { useState, useContext, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';

// Redux Reducers:
import { createSession } from '../features/session/sessionSlice.js';

// Components:
import Input from '../components/floatLabel/Input';

// Contexts:
import globalLoaderContext from '../contexts/globalLoaderContext';
// import sessionContext from '../contexts/SessionContext';


// Utils:
import { validateSimpleText } from '../util/validators';
import HandleErrors from '../util/HandleErrors';
import { ClientFetch } from '../util/Fetching';

// Const's:
const loginForm={
    username:'',
    password:''
};

const Login = function(){
    const [form, setForm]=useState(loginForm);
    const [err, setErr]=useState({...loginForm, general:null});
    const {hideGlobalLoader, showGlobalLoader, globalLoaderState} = useContext(globalLoaderContext);
    // const {createSession} = useContext(sessionContext);
    const { enqueueSnackbar }=useSnackbar();
    const dispatch = useDispatch();

    const validateForm=()=>{
        let errors=new HandleErrors();
        errors.set('username', validateSimpleText(form.username, 'username', 1, 20, true));
        errors.set('password', validateSimpleText(form.password, 'password', 1, 50, true));

        return errors.getErrors();
    }

    const submit=async function(e){
        e.preventDefault();
        if(globalLoaderState) return enqueueSnackbar('The request is being processed!', {variant: 'warning'});
        showGlobalLoader();
        await handleSubmit(e);
        hideGlobalLoader();
    }

    const handleSubmit = async (e) => {
        let errors=validateForm();

        if(!!errors) return setErr({...errors, general:null});
        setErr({...loginForm, general:null});

        let ftc=new ClientFetch(), ftc2 = new ClientFetch();

        try{
            let result = await Promise.all([
                ftc.post({
                    url:'/api/auth/login',
                    data:form,
                    timeout: 130000
                }),
                ftc2.post({
                    url:process.env.API+'login',
                    data:form,
                    timeout: 130000,
                    credentials: 'include'
                })
            ]);

            let res = result[0];


            let data=null;

            if(ftc.isStatus(res.status, 200, 406, 500)){
                data = await res.json();
                console.log(err, data);
                if(res.status!==200) return setErr(res.status===500 ? {...err, general: data.message} : data.errors);
                else console.log(document.cookie
                .split('; '));
            }

            setForm({
                ...form,
                general: 'The server has given an unexpected response!'
            });

            res = result[1];

            if(ftc2.isStatus(res.status, 200, 406, 500)){
                data = await res.json();
                console.log(err, data);
                if(res.status!==200) return setErr(res.status===500 ? {...err, general: data.message} : data.errors);

                return dispatch(createSession({user: data.user}));
            }

            setForm({
                ...form,
                general: 'The server has given an unexpected response!'
            });
        }catch(e){
            console.log(e);
            enqueueSnackbar((ftc.aborted() || ftc2.aborted()) ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant: 'error'});
        }
    };

    const handleChange=(e)=>{
        let {value, name}=e.target;
        let newErrs=err;

        delete newErrs[name];
        setErr(newErrs);

        setForm({
            ...form,
            [name]:value
        });
    };

    useEffect(()=>{
        console.log(err);
    }, [err]);

    return <>
        <div className='back-fond'>
            <img src='/source/login-fond.svg'/>
        </div>
        <div className='container-form centerFlex'>
            <form id='login-form' className='login-form' onSubmit={submit}>
                <div className='login-form__header'>
                    <h2>Quotes System</h2>
                    <img src='/logo.png' alt='Logo de la empresa'/>
                </div>

                <div className='login-form__section'>
                    <h3>Login</h3>
                    <div className="login-form__section__inputs">
                        <Input
                            value={form.username}
                            error={err.username}
                            onChange={handleChange}
                            name="username"
                            type="text"
                            label="Username"
                        />

                        <Input
                            value={form.password}
                            error={err.password}
                            onChange={handleChange}
                            name="password"
                            type="password"
                            label="Password"
                        />

                        <button type='submit' className='submit-button'>Log In</button>

                        <p className={`general-error error ${!err.general ? 'none' :''}`}>
                            {err.general}
                        </p>
                    </div>

                    <div className="login-form__section__footer">
                        <b>New Evolution <span>DLL</span></b>
                    </div>
                </div>
            </form>
        </div>

        <style jsx global>{`@import '../styles/login';`}</style>
    </>
};

export const getServerSideProps = async (ctx) => {
    let req=ctx.req, res=ctx.res;

    if(!!ctx.req.cookies['x-access-token']){
        res.statusCode = 302;
        res.setHeader('Location', `/`);
    }

    return {
        props: {}
    }
}

export default Login;