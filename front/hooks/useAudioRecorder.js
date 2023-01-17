import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';

// Hooks:
import useTimer from './useTimer';

const initialState = {
	devices: [],
	mediaRecorder: null,
	audio: null,
	isOpen: false
}

export default function useAudioRecorder() {
    const { enqueueSnackbar } = useSnackbar();
    const { play: playTimer, timer, remove } = useTimer();
	const [ audioState, setAudioState ] = useState(initialState);

	let list = [];
	useEffect(() => {
		try{
			navigator
		        .mediaDevices
		        .enumerateDevices()
		        .then(devices => {
		        	list = [];
		        	devices.forEach(device => {
		        		if(device.kind.toLowerCase() === 'audioinput') list.push(device.deviceId);
		        	});

		        	if(list.length > 0) setAudioState({...audioState, devices: list});
		        });
		} catch (e) {
		}
	}, []);



	/*useEffect(() => {
		if(list === audioState.devices) return;
		alert(list.length);
		setAudioState({...audioState, devices: list});
	}, [audioState]);*/

	const setIsOpen = (bool) => {
		setAudioState({...audioState, isOpen: bool});
	}

	const play = (cb) => {
		if (!!audioState.mediaRecorder) return;

		//if (list.length < 1) alert(list[0])//return enqueueSnackbar('No audio input device found!', {variant: 'warning'});

		navigator.mediaDevices.getUserMedia({
			audio: {
				deviceId: audioState.devices[0],
			}
		})
			.then(stream => {
				// Comenzar a grabar con el stream
				let mediaRecorder = new MediaRecorder(stream);
				let fragmentosDeAudio = [];

				setAudioState({...audioState, mediaRecorder: mediaRecorder});

				playTimer();
				mediaRecorder.start();
				// comenzarAContar();
				// En el arreglo pondremos los datos que traiga el evento dataavailable
				// Escuchar cuando haya datos disponibles
				mediaRecorder.addEventListener("dataavailable", evnt => {
					// Y agregarlos a los fragmentos
					fragmentosDeAudio.push(evnt.data);
				});

				mediaRecorder.addEventListener("stop", () => {
					// Detener el stream
					remove(); // Remover contador
				    stream.getTracks().forEach(track => track.stop());
				    // Detener la cuenta regresiva
				    //detenerConteo();
				    // Convertir los fragmentos a un objeto binario
				    const blobAudio = new Blob(fragmentosDeAudio, { type: mediaRecorder.mimeType });

				    /*// Crear una URL o enlace para descargar
				    const urlParaDescargar = URL.createObjectURL(blobAudio);
				    // Crear un elemento <a> invisible para descargar el audio
				    let a = document.createElement("a");
				    document.body.appendChild(a);
				    a.style = "display: none";
				    a.href = urlParaDescargar;
				    a.download = Date.now() + ".webm";
				    // Hacer click en el enlace
				    a.click();
				    // Y remover el objeto
				    window.URL.revokeObjectURL(urlParaDescargar);*/

					setAudioState({...audioState, mediaRecorder: null, audio: blobAudio});
				});
			})
			.catch(error => {
				return enqueueSnackbar(typeof error.message === 'string' ? error.message :'An error occurred while recording!', {variant: 'error'});
			});
	};

	const stop = () => {
		if(!audioState.mediaRecorder) return;
		audioState.mediaRecorder.stop();
	};

	const clear = () => {
		setAudioState({...initialState, isOpen: audioState.isOpen});
		remove();
	};

	return {
		play,
		stop,
		timer,
		audio: audioState.audio,
		mediaRecorder: audioState.mediaRecorder,
		audioRecorderParams: {
			...audioState,
			play,
			stop,
			timer,
			setIsOpen,
			clear
		},
		setIsOpen: setIsOpen,
		isOpen: audioState.isOpen,
		clear
	};
}