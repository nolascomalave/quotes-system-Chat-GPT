import React, { useState } from 'react';

const initialCustomerState = {
	is_natural: false,
	name: '',
	first_name: '',
	first_last_name: '',
	ssn: '',
	email: '',
	phone: ''
}

export default function useGetMinimalCustomer() {
	const [state, setState] = useState({
		edit: false,
		customer: initialCustomerState,
		errors: {}
	});

	const customerHandleChange = (e, format) => {
        let {name, value, files, checked, type} = e.target;
        let errors = state.errors;

        value = type === 'file' ? files : (type === 'checkbox' ? checked : value);
        if(!!format) value = format(value);
        console.log(e.target.checked, type, value, state);

        if(name in errors) delete errors[name];

        setState({
        	...state,
        	customer: {
        		...state.customer,
        		[name]: value
        	},
        	errors: errors
        });
	};

	const setErrors = (errors) => {
		if(typeof errors !== 'object' || Array.isArray(errors)) return;
		setState({errors: errors});
	}

	const changeEditMode = (bool) => {
		if(bool === state.edit) return;
		setState({edit: !!bool, customer: initialCustomerState, errors: {}});
	}

	const enableEditing = () => {
		changeEditMode(true);
	}

	const disableEditing = () => {
		changeEditMode(false);
	}

	const addCustomer = (customer) => {
		if(typeof customer !== 'object' || Array.isArray(customer)) return;

		setState({edit: false, errors: {}, customer: customer});
	}

	return { ...state, customerHandleChange, changeEditMode, addCustomer, disableEditing, enableEditing };
}