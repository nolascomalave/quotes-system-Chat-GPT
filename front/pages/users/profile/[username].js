import {useContext, useState, useEffect} from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { useSnackbar } from 'notistack';

// Layout:
import Layout from '../../../components/sections/Layout';

// Utils:
import { serverPropsVerifySession } from '../../../util/serverGetters';

// Components:
import MainContainer from '../../../components/sections/MainContainer';
import MessageSection from '../../../components/sections/MessageSection';
import ProfileInfo from '../../../components/ProfileInfo';

// Contexts:
import requirePasswordAlert from '../../../contexts/requirePasswordAlert';
import breadcrumbsContext from '../../../contexts/breadcrumbsContext';
import alertsContext from '../../../contexts/alertsContext';


// Utils:
import HandleErrors from '../../../util/HandleErrors';
import { ClientFetch } from '../../../util/Fetching';

// Consts:
const initialState = {
	first_name: null,
	second_name: null,
	first_last_name: null,
	second_last_name: null,
	username: null,
	gender: null,
	SSN: null,
	email: null,
	address: null,
	first_phone: null,
	second_phone: null,
	photo: null,
	id: null
};

function User({ username }){
	const [ roles, setRoles ] = useState();
	const [ userData, setUserData ] = useState({data: null, error: null, message: null});
    const { setBreadcrumbsOptions } = useContext(breadcrumbsContext);
    const { enqueueSnackbar } = useSnackbar();
	const { reqPass } = useContext(requirePasswordAlert);
	const { addAlert } = useContext(alertsContext);

    useEffect(()=>{
		getUserData();

        setBreadcrumbsOptions({
            routes:[
                {
                    link:'/users/profile/'+username,
                    none:true
                },{
                    link:'/users/profile',
                    path:'/users/pro0file/'+username,
                }
            ]
        });
    }, []);

	const getUserData = async () => {
		let ftc = new ClientFetch();

        try{
			let res = await ftc.get({
				url:process.env.API + 'users/username/' + username,
				timeout: 130000
			});

            if(ftc.isStatus(res.status, 200, 403, 404, 406, 500)) return setUserData({...userData, ...await res.json()});

			let msg = 'Unexpected response!';

			setUserData({...userData, message: msg, error: msg });
        }catch(e){
            console.log(e);
			setUserData({...userData, error: ftc.aborted() ? 'API request timeout has expired!' : 'Failed to establish connection to server!'});
        }
	};

	const resetPassword = async (password, close)=>{
		let ftc = new ClientFetch();

		try{
			let res = await ftc.patch({
				url:process.env.API + 'users/reset-password',
				data: {id_user: userData.data.id, userPass: password},
				timeout: 130000
			});

            if(ftc.isStatus(res.status, 200, 401, 403, 404, 406, 500)){
				let data = await res.json();

				if(res.status === 200) {
					close();
					return addAlert({
						type:'success',
						//title: data.data,
						message: data.message,
						cancelButton:true
					});
				}

				let variant = (res.status === 403 || res.status === 401) ? 'warning' : 'error';

				enqueueSnackbar(data.message, {variant});
				return close();
            }

            enqueueSnackbar('Unexpected response!', {variant: 'error'});
        }catch(e){
            console.log(e);
            enqueueSnackbar(ftc.aborted() ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant: 'error'});
        }

		close();
	};

	const changeUserState = async (typeOp, password, close)=>{
		let ftc = new ClientFetch();

		try{
			let method = (typeOp === 'delete') ? 'delete' : 'patch';
			let res = await ftc[method]({
				url:process.env.API + 'users/' + (typeOp === 'delete' ? '' : (userData.data._enable ? 'disable' : 'enable')),
				data: {id_user: userData.data.id, userPass: password},
				timeout: 130000
			});

            if(ftc.isStatus(res.status, 200, 401, 403, 404, 406, 500)){
				let data = await res.json();

				if(res.status === 200) {
					close();

					enqueueSnackbar(data.message, {variant: 'success'});

					if(typeOp === 'delete') return Router.push('/users');

					return setUserData({...userData, data: {...userData.data, _enable: !userData.data._enable}});
				}

				let variant = (res.status === 403 || res.status === 401) ? 'warning' : 'error';

				enqueueSnackbar(data.message, {variant});
				return close();
            }

            enqueueSnackbar('Unexpected response!', {variant: 'error'});
        }catch(e){
            console.log(e);
            enqueueSnackbar(ftc.aborted() ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant: 'error'});
        }

		close();
    }

	const pressResetPassword = () => {
		return reqPass({
			action: resetPassword,
			title: 'Are you sure?',
			message: "When resetting the user's password, it will be sent to their email to enter the system."
		});
	};

	const pressChangeState = () => {
		return reqPass({
			action: (password, close)=> changeUserState('change', password, close),
			title: 'Are you sure?',
			message: !userData.data._enable ? "By enabling the selected user, he will be able to access the system." : "By disabling the user's session, he will not be able to use the system."
		});
	};

	const pressDeleteUser = () => {
		return reqPass({
			action: (password, close)=> changeUserState('delete', password, close),
			title: 'Are you sure?',
			message: "When deleting the selected user, all the user's data will be lost. As well as the records of operations carried out by it."
		});
	};

	return (
		<Layout>
			<Head>
				<title>{process.env.SITE_NAME} - User Profile</title>
			</Head>
			<MainContainer id='User'>
				{(!!userData.error || (!!userData.message && userData.data === null)) ? null : (
					<ProfileInfo
						info={userData.data}
						resetPassword={pressResetPassword} 
						changeState={pressChangeState}
						deleteFn={pressDeleteUser}
					/>
				)}

				<MessageSection
                    error={userData.error}
                    message={!userData.data ? userData.message : null}
                />
			</MainContainer>
		</Layout>
	);
}

export const getServerSideProps = serverPropsVerifySession(async function(ctx){
    const {username}=ctx.query;

    return {
        props:{
            username
        }
    }
});

export default User;