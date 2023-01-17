import React, { useState, useEffect } from 'react';

export default function Modal ({children, modalStyle, style, open, setOpen, preventCloseOnScreen}){
	const [isVisible, setIsVisible] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const clickScreenHandler = (e) => {
		if(preventCloseOnScreen === true) return;
		setOpen(false);
	};

	useEffect(() => {
		if(isVisible === false) setTimeout(() => {
			setIsOpen(isVisible);
		}, 260);
	}, [isVisible]);

	useEffect(() => {
		if(isOpen === true) setTimeout(() => setIsVisible(isOpen), 0);
	}, [isOpen]);


	useEffect(() => {
		if(open === true) return setIsOpen(open);
		setIsVisible(open);
	}, [open]);

	return (
		<div
			className={`custom-modal${!isVisible ? '' : ' visible'}`}
			style={{...(modalStyle ?? {}), display: isOpen === true ? 'flex' : 'none'}}
			onClick = {clickScreenHandler}
		>
			<div className='custom-modal__container' style = {style} onClick = {(e) => e.stopPropagation()}>
				{children ?? null}
			</div>
		</div>
	);
}