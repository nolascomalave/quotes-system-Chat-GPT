import React, { useState } from 'react';

export default function useForm(initialForm, open) {
	const [form, setForm] = useState(initialForm ?? {});
	const [errors, setErrors] = useState({});
	const [isOpen, setIsOpen] = useState(open ?? false);

	const handleChange = (e, format) => {
		let {name, value, files, checked, type} = e.target;
        let errs = errors;

        if(type === 'checkbox' || type === 'radio') value = checked;

        if(!!format) value = format(type === 'file' ? files : (type==='checkbox' ? checked : value));

        if(name in errors) delete errs[name];

        setForm({
        	...form,
        	[name]: value
        });

        setErrors(errs);
	};

	const changeValue = (name, value) => {
        let errs = errors;

        if(name in errors) delete errs[name];

		setForm({
        	...form,
        	[name]: value
        });

        setErrors(errs);
	};

	return { form, setForm, handleChange, errors, setErrors, changeValue, isOpen, setIsOpen };
}