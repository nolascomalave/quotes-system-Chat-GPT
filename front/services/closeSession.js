import { ClientFetch } from '../../util/Fetching';

export default async function logout(){
	let ftc = new ClientFetch();

	try{
		let data=null;
		let res = await ftc.get({
			url:'/api/auth/logout',
			timeout: 130000
		});

		Router.push('login');
		return state = initialState;
	}catch(e){
		console.log(e);
		// enqueueSnackbar(ftc.aborted() ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant: 'error'});
	}
}