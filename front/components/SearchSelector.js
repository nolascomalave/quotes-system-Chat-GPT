import React, { useRef, useEffect, useState } from 'react';

// Components:
import Modal from './Modal';
import SimpleCheckbox from './SimpleCheckbox';

// Material Components:
import { Button, CircularProgress } from '@mui/material';

// Material Icons:
import SearchIcon from '@mui/icons-material/Search';

// Hooks:
import useLazyLoadSearch from '../hooks/useLazyLoadSearch';

// Utils:
import { isStatus } from '../util/functionals';

export default function SearchSelector({isOpen, setIsOpen, inputRef, lazyLoadParams, changeInputData, title, list, selected, changeSelect, Item, getMoreData, getSelectedItems, selectExisting, addSelection, onAccept, unselectablePreselected}) {
	const interceptRef = useRef();
	const observerOpts = {
		root: null,
		rootMargin: '-2%',
		threshold: 1.0
	}

	/*useEffect(() => {
		const observer = new IntersectionObserver(getMoreData, observerOpts);
		if(interceptRef.current) observer.observe(interceptRef.current);

		return () => {
			if(interceptRef.current) observer.unobserve(interceptRef.current);
		}
	}, [interceptRef, observerOpts]);*/

	useEffect(() => {
		if(!selectExisting || list.length < 1 || lazyLoadParams.content.data.length < 1 || !isOpen) return;

		let newSelected = {};

		lazyLoadParams.content.data.forEach((item, index) => {
			let exists = list.some((el, i) => selectExisting(item, el));
			if(!exists || !!selected[index]) return;

			newSelected[index] = true;
		});

		addSelection(newSelected, unselectablePreselected ?? false);

	}, [list, lazyLoadParams.content.data]);

	return  (
		<Modal
			open = {isOpen}
			setOpen = {setIsOpen}
			style = {{
				width: '100%',
				maxWidth: 'calc(800px + 1em)',
				height: '90vh'
			}}
			preventCloseOnScreen = {true}
		>
			<div className = 'search-selector'>
				<div className = "search-selector__header">
					<h1>{title}</h1>
				</div>
				<div className = "search-selector__body">
					<div className = "search-selector__body__list-container">
						<div className = 'search-selector__body__list-container__input-container'>
							<SearchIcon/>
							<input
								ref = {inputRef}
								type = 'text'
								placeholder = 'Search...'
								onChange = {changeInputData}
							/>
						</div>
						<ul className = 'search-selector__body__list-container__list'>
							{(lazyLoadParams.isLoading === false) && lazyLoadParams.content.data.map((itemData, index) => {

								return (
									<li className = 'search-selector__body__list-container__list__item'>
										<div className='search-selector__body__list-container__list__item__checkbox'>
											<SimpleCheckbox
												checked = {selected[index] === true}
												onChange = {(e) => changeSelect(index, e.target.checked)}
											/>
										</div>
	
										<div className='search-selector__body__list-container__list__item__content'  onClick = {(e) => changeSelect(index, !(selected[index] === true))}>
											<Item {...itemData} />
										</div>
									</li>
								)})}
							<div className = 'search-selector__body__list-container__list__interceptor' ref = {interceptRef}></div>
						</ul>
					</div>

					{(lazyLoadParams.isLoading === true) && (
						<div className = 'search-selector__body__loader'>
							<CircularProgress color = "inherit" />
						</div>
					)}

					{((lazyLoadParams.content.errors ?? lazyLoadParams.content.message) && lazyLoadParams.isLoading !== true && lazyLoadParams.content.data.length < 1) && (
						<div className = 'search-selector__body__message'>
							<h1>{lazyLoadParams.content.message ?? lazyLoadParams.content.errors.server ?? 'Unexpected error!'}</h1>
						</div>
					)}
				</div>
				<div className = "search-selector__footer">
					{ (Object.keys(selected).length > 0) && (
						<Button onClick = {typeof onAccept === 'function' ? () => { onAccept(getSelectedItems()); setIsOpen(false) } : null}>
							Accept
						</Button>
					)}
					<Button onClick = {()=> setIsOpen(false)}>
						Cancel
					</Button>
				</div>
			</div>
		</Modal>
	);
}