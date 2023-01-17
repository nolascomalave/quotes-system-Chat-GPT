import { useEffect, useContext, useState } from 'react';

// Components:
import Input from './floatLabel/Input';
import Textarea from './floatLabel/Textarea';
import CheckBox from './CheckBox';
import SearchSelector from './SearchSelector';
import AreaItem from './SearchSelector/AreaItem';

// Material Components:
import { Button } from '@mui/material';

// Material Icons:
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Contexts:
import alertsContext from '../contexts/alertsContext';

// Hooks:
import useSearchSelector from '../hooks/useSearchSelector';

// Utils:
import HandlerErrors from '../util/HandlerErrors';
import { validateSimpleText } from '../util/validators';

export const initialAreasFormQuotation = {
	name: '',
	is_natural:  true,
	description: '',
	photo: []
};

export default function AreasFormQuotation({ form, setForm, handleChange, changeValue, errors, setErrors, isOpen, setIsOpen, submit, ignoreErrors, isOpenModal }) {
	const { addAlert } = useContext(alertsContext);
	const [ initialForm, setInitialForm ] = useState(form);
	const { searchSelectorParams } = useSearchSelector(!!form.parents ? [form.parents] : [], false, (process.env.API + 'areas'));

	const handleSubmit = (e) => {
		e.preventDefault();

		if(ignoreErrors === true) {
			submit();
			return setIsOpen(false);
		}

		let errorForm = new HandlerErrors();

		errorForm.set('code', validateSimpleText(form.code, 'code', 5, 150));
		errorForm.set('name', validateSimpleText(form.name, 'name', 3, 100, true));
        errorForm.set('description', validateSimpleText(form.description, 'description', 5, 150));

        if(errorForm.existsErrors()) return setErrors(errorForm.getErrors());

        //console.clear(((!initialForm.parents) ? true : (initialForm.principal ?? false)) === true && ((!form.parents) ? true : (form.principal ?? false)) === false && Number(form.__3d1t) && !!form.__services && form.__services.data.length > 0, ((!initialForm.parents) ? true : (initialForm.principal ?? false)) === true, ((!form.parents) ? true : (form.principal ?? false)) === false, Number(form.__3d1t), !!form.__services && form.__services.data.length > 0);

        if(initialForm.principalWithSevices === true && ((!form.parents) ? true : (form.principal ?? false)) === false) {
        	return addAlert({
				type:'question',
				title: 'Are you sure to save the change?',
				message: 'You are changing the dependency status of the area to "Not Main", so the area in the list that is defined as main will be removed from the list.',
				acceptButton:true,
				cancelButton:true,
				onAccept: async ()=> {
					submit(form, initialForm);
        			setIsOpen(false);
				}
			});
        }

        submit(form, initialForm);

        setIsOpen(false);
	}

	const closeForm = () => {
		if(initialForm !== form){
			return addAlert({
				type:'question',
				title: 'Are you sure to close form?',
				message: 'When you close the form, you will lose the changes you have made to it.',
				acceptButton:true,
				cancelButton:true,
				onAccept: async ()=> setIsOpen(false)
			});
		}

		setIsOpen(false);
	}


	useEffect(() => {
		if(isOpen === false) {
			setErrors({});
			setForm({});
			setInitialForm({});
		}else{
			setInitialForm(form);
		}
	}, [isOpen]);

	return (
		<form className = 'areas-form-quote' onSubmit = {handleSubmit}>
			<div className = 'areas-form-quote__header'>
				<h3 className = 'areas-form-quote__header__title'>Area</h3>
				<Button onClick = {closeForm}>
					<CloseIcon/>
				</Button>
			</div>
			<div className = 'areas-form-quote__body fluid-grid'>
				<div className = 'col-20'>
					<CheckBox
						label = 'Principal'
						name = 'principal'
						checked = {(!form.parents) ? true : (form.principal ?? false)}
						error = {errors.principal}
						onChange = {!form.parents ? null : handleChange}
					/>
				</div>

				<div className = 'col-20'>
					<Input
						label = 'Name'
						name = 'name'
						value = {form.name ?? ''}
						error = {errors.name}
						onChange = {handleChange}
						required = {true}
					/>
				</div>

				<div className = 'col-10'>
					<Input
						label = 'Code'
						name = 'code'
						value = {form.code ?? ''}
						error = {errors.code}
						onChange = {handleChange}
					/>
				</div>

				<div className = 'col-20 areas-form-quote__body__parents'>
					<p className = 'areas-form-quote__body__parents__header'>
						<div className = 'areas-form-quote__body__parents__header__title'>
							Parents
							{/*(!!form.parents && form.parents.length > 0 && !!form.parents[0].parent_concat) && <p className = 'subtitle'>{form.parents[0].parent_concat.replace(/<->/g, ' > ')}</p>*/}
						</div>
						<div className = 'areas-form-quote__body__parents__header__actions'>
							<Button type = 'button' onClick = {() => searchSelectorParams.setIsOpen(true)}>
								<AddIcon/>
							</Button>
						</div>
					</p>
					{(!!form.parents && form.parents.length > 0) && (
						<ul className='areas-form-quote__body__parents__list'>
							{form.parents.map((el, i) => (
								<li className='areas-form-quote__body__parents__list__child' key = {el.parents_ids}>
									<div className = 'text'>
										<p className='areas-form-quote__body__parents__list__child__title'>{el.name}</p>
										{!!el.parent_concat && (
											<p className='areas-form-quote__body__parents__list__child__subtitle' >
												{el.parent_concat.replace(/<->/g, ' > ')}
											</p>
										)}
									</div>
									{!!form.parents && (
										<Button
											type = 'button'
											onClick = {() => {
												let newList = form.parents;
												newList.splice(i, 1);
												changeValue('parents', newList);
											}}
										>
											<DeleteIcon/>
										</Button>
									)}
								</li>
							))}
						</ul>
					)}
				</div>

				<div className = 'col-20'>
					<Textarea
						label = 'Description'
						name = 'description'
						value = {form.description ?? ''}
						error = {errors.description}
						onChange = {handleChange}
					/>
				</div>
			</div>
			<div className = 'areas-form-quote__footer'>
				<Button type = 'submit'>
					Accept
				</Button>
			</div>
			<SearchSelector
				{...searchSelectorParams}
				title = 'Areas'
				Item = {AreaItem}
				list = {Array.isArray(form.parents) ? form.parents : []}
				selectExisting = {(item, listItem) => item.parents_ids === listItem.parents_ids && item.parents_ids !== null}
				onAccept = {(areas) => changeValue('parents', areas)}
			/>
		</form>
	);
}