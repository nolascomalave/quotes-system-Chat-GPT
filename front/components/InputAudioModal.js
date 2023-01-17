// Components:
import Modal from './Modal';

// Material Components:
import Button from '@mui/material/Button';

// Material Icons:
import CloseIcon from '@mui/icons-material/Close';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect } from 'react';

export default function InputAudioModal({isOpen, setIsOpen, mediaRecorder, timer, stop, play, clear, audio, onSave}) {

	const playRecording = () => {
		if(!mediaRecorder) play();
	}

	const trash = () => {
		if(!mediaRecorder && !audio) return;
		if(!!mediaRecorder) stop();

		clear();
	}

	const save = async () => {
		await onSave(audio);
		setIsOpen(false);
	}

	useEffect(() => {
		if(!isOpen) clear();
	}, [isOpen]);

	return (
		<Modal
			open = {isOpen}
			setOpen = {setIsOpen}
			style = {{width: '100%', height: '100%'}}
			modalStyle = {{backgroundColor: 'rgba(245,245,245, 0.9)'}}
			preventCloseOnScreen = {true}
		>
			<div className = 'input-audio-modal'>
				<div className = 'input-audio-modal__header'>
					<Button onClick={() => setIsOpen(false)}>
						<CloseIcon/>
					</Button>
				</div>

				<div className = 'input-audio-modal__body'>
					<div className = 'input-audio-modal__body__counter'>
						{timer}
					</div>
					<div className = 'input-audio-modal__body__animation'>
						<div className="input-audio-modal__body__animation__bars">
							<div className={`input-audio-modal__body__animation__bars__bar ${!!mediaRecorder && 'animate'}`}></div>
							<div className={`input-audio-modal__body__animation__bars__bar ${!!mediaRecorder && 'animate'}`}></div>
							<div className={`input-audio-modal__body__animation__bars__bar ${!!mediaRecorder && 'animate'}`}></div>
							<div className={`input-audio-modal__body__animation__bars__bar ${!!mediaRecorder && 'animate'}`}></div>
							<div className={`input-audio-modal__body__animation__bars__bar ${!!mediaRecorder && 'animate'}`}></div>
							<div className={`input-audio-modal__body__animation__bars__bar ${!!mediaRecorder && 'animate'}`}></div>
							<div className={`input-audio-modal__body__animation__bars__bar ${!!mediaRecorder && 'animate'}`}></div>
							<div className={`input-audio-modal__body__animation__bars__bar ${!!mediaRecorder && 'animate'}`}></div>
							<div className={`input-audio-modal__body__animation__bars__bar ${!!mediaRecorder && 'animate'}`}></div>
							<div className={`input-audio-modal__body__animation__bars__bar ${!!mediaRecorder && 'animate'}`}></div>
						</div>
					</div>
					<div className = 'input-audio-modal__body__actions'>
						<Button
							className = 'input-audio-modal__body__actions__button delete'
							disabled = {!mediaRecorder && !audio}
							style = {(!mediaRecorder && !audio) ? { opacity: '0' } : null}
							onClick = {trash}
						>
							<DeleteIcon/>
						</Button>
						<Button
							className = {`input-audio-modal__body__actions__button play ${!!mediaRecorder && 'active'}`}
							onClick = {!mediaRecorder ? playRecording : stop}
							disabled = {!mediaRecorder && !!audio}
						>
							<KeyboardVoiceIcon/>
						</Button>
						<Button
							className = 'input-audio-modal__body__actions__button save'
							disabled = {!(!mediaRecorder && !!audio)}
							style = {!(!mediaRecorder && !!audio) ? { opacity: '0' } : null}
							onClick = {save}
						>
							<SaveIcon/>
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}