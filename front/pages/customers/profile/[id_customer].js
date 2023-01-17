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
import { ClientFetch } from '../../../util/Fetching';

// Consts:
const initialState = {
	first_name: null,
	second_name: null,
	first_last_name: null,
	second_last_name: null,
	gender: null,
	SSN: null,
	email: null,
	address: null,
    description: null,
    is_natural: null,
	phone: null,
	phone_secondary: null,
	photo: null,
	id: null
};

function Customer({ id_customer }){
	const [ customerData, setCustomerData ] = useState({data: null, error: null, message: null});
    const { setBreadcrumbsOptions } = useContext(breadcrumbsContext);
    const { enqueueSnackbar } = useSnackbar();
	const { reqPass } = useContext(requirePasswordAlert);

    useEffect(()=>{
		getCustomerData();

        setBreadcrumbsOptions({
            routes:[
                {
                    link:'/customers/profile/'+id_customer,
                    none:true
                },{
                    link:'/customers/profile',
                    path:'/customers/profile/'+id_customer,
                }
            ]
        });
    }, []);

	const getCustomerData = async () => {
		let ftc = new ClientFetch();

        try{
			let res = await ftc.get({
				url:process.env.API + 'customers/' + id_customer,
				timeout: 130000
			});

            if(ftc.isStatus(res.status, 200, 403, 404, 406, 500)) return setCustomerData({...customerData, ...await res.json()});

			let msg = 'Unexpected response!';

			setCustomerData({...customerData, message: msg, error: msg });
        }catch(e){
            console.log(e);
			setCustomerData({...customerData, error: ftc.aborted() ? 'API request timeout has expired!' : 'Failed to establish connection to server!'});
        }
	};

	const changeCustomerState = async (typeOp, password, close)=>{
		let ftc = new ClientFetch();

		try{
			let method = (typeOp === 'delete') ? 'delete' : 'patch';
			let res = await ftc[method]({
				url:process.env.API + 'customers/' + (typeOp === 'delete' ? '' : (customerData.data._enable ? 'disable' : 'enable')),
				data: {id_customer: customerData.data.id, userPass: password},
				timeout: 130000
			});

            if(ftc.isStatus(res.status, 200, 401, 403, 404, 406, 500)){
				let data = await res.json();

				if(res.status === 200) {
					close();

					enqueueSnackbar(data.message, {variant: 'success'});

					if(typeOp === 'delete') return Router.push('/customers');

					return setCustomerData({...customerData, data: {...customerData.data, _enable: !customerData.data._enable}});
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

	const pressChangeState = () => {
		return reqPass({
			action: (password, close)=> changeCustomerState('change', password, close),
			title: 'Are you sure?',
			message: !customerData.data._enable ? "By enabling the selected customer, he will be able to access the system." : "By disabling the customer's session, he will not be able to use the system."
		});
	};

	const pressDeleteCustomer = () => {
		return reqPass({
			action: (password, close)=> changeCustomerState('delete', password, close),
			title: 'Are you sure?',
			message: "When deleting the selected customer, all the customer's data will be lost. As well as the records of operations carried out by it."
		});
	};

	return (
		<Layout>
			<Head>
				<title>{process.env.SITE_NAME} - Customer Profile</title>
			</Head>
			<MainContainer id='Customer'>
				{(!!customerData.error || (!!customerData.message && customerData.data === null)) ? null : (
					<ProfileInfo
						info={customerData.data}
						changeState={pressChangeState}
						deleteFn={pressDeleteCustomer}
					/>
				)}

				<MessageSection
                    error={customerData.error}
                    message={!customerData.data ? customerData.message : null}
                />
			</MainContainer>
		</Layout>
	);
}

export const getServerSideProps = serverPropsVerifySession(async function(ctx){
    const {id_customer}=ctx.query;

    return {
        props:{
            id_customer
        }
    }
});

export default Customer;