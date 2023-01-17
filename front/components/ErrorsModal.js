import { useState } from 'react';

// Components:
import Modal from './Modal';

// Material components:
import { Button } from '@mui/material';

// Material components:
import CloseIcon from '@mui/icons-material/Close';

export default function ErrorsModal({isOpen, setIsOpen, errors, title}) {
    return (
        <Modal
            open = {isOpen}
            setOpen = {setIsOpen}
            style = {{maxWidth: 'calc(500px + 1em)', width: '100%', padding: '1em'}}
        >
            <div className='errors-modal'>
                <div className='errors-modal__header'>
                    <h3 className='errors-modal__header__title'>{title}</h3>
                    <Button className = 'errors-modal__header__close' onClick = {() => setIsOpen(false)}>
                        <CloseIcon/>
                    </Button>
                </div>

                {(!!title && errors.some(el => typeof el !== 'object')) && <h3 className='errors-modal__title'>Errors:</h3>}

                <ul className='errors-modal__list'>
                    {errors.map((err, index) => typeof err !== 'object' && (
                        <li key = {index} className='errors-modal__list__item'>
                            <div className='errors-modal__list__item__index'>{(index + 1) + ')'}</div>
                            <div className='errors-modal__list__item__message'>{err}</div>
                        </li>
                    ))}
                </ul>

                <div className='errors-modal__body-list'>
                    {errors.map((err, index) => typeof err === 'object' && (
                        <div className='errors-modal__sublist'>
                            <h4 className='errors-modal__sublist__title'>{(index + 1) + ')'} {err.title}</h4>
                            <ul className='errors-modal__sublist__list'>
                                {err.values.map((val, i) => (
                                    <li key = {index} className='errors-modal__sublist__list__item'>
                                        <div className='errors-modal__sublist__list__item__index'>{(index + 1)}.{(i + 1) + ')'}</div>
                                        <div className='errors-modal__sublist__list__item__message'>{val}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
}