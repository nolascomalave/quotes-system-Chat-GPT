// Components:
import AudioPlayer from './AudioPlayer';
import Modal from './Modal';

export default function ModalAudioPlayer({isOpen, setIsOpen, url, onDelete}) {

	return (
		<Modal
			open = {isOpen}
			setOpen = {setIsOpen}
			style = {{maxWidth: 'calc(300px + 1em)', width: '100%', padding: '1em'}}
			preventCloseOnScreen = {false}
	    >
	    	<> {isOpen && <AudioPlayer urlAudio = {url} onDelete = {onDelete} />} </>
	    </Modal>
	);
}