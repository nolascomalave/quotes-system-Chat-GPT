import { useState, useRef } from 'react';

// Utils:
import { adaptNumTwo } from '../util/format';
console.log(adaptNumTwo);

export default function useTimer(){
	let timing = 1000;

	// We need ref in this, because we are dealing
	// with JS setInterval to keep track of it and
	// stop it when needed
	const Ref = useRef(null);

	// The state for our timer
	const [timer, setTimer] = useState('00:00');


	const getTimeRemaining = (e) => {
		const total = Date.parse(e) + timing;
		timing += 1000;

		const seconds = Math.floor((total / 1000) % 60);
		const minutes = Math.floor((total / 1000 / 60) % 60);
		const hours = Math.floor((total / 1000 / 60 / 60) % 24);
		return {
			total, hours, minutes, seconds
		};
	}


	const startTimer = (e) => {
		let { total, hours, minutes, seconds } = getTimeRemaining(e);

		// update the timer
		// check if less than 10 then we need to 
		// add '0' at the beginning of the variable
		setTimer(
			(hours > 0 ? (adaptNumTwo(hours) + ':') : '') +
			adaptNumTwo(minutes) + ':'
			+ adaptNumTwo(seconds)
		)
	}


	const clearTimer = (e) => {

		// If you adjust it you should also need to
		// adjust the Endtime formula we are about
		// to code next    
		setTimer('00:00');

		// If you try to remove this line the 
		// updating of timer Variable will be
		// after 1000ms or 1sec
		if (Ref.current) clearInterval(Ref.current);
		const id = setInterval(() => {
			startTimer(e);
		}, 1000)
		Ref.current = id;
	}

	const getDeadTime = () => {
		let deadline = new Date(0);

		// This is where you need to adjust if 
		// you entend to add more time
		// deadline.setSeconds(deadline.getSeconds() + 10);
		return deadline;
	}

	const pause = () => {
		clearInterval(Ref.current);
	}

	const play = () => {
		clearTimer(getDeadTime());
	}

	const remove = () => {
		clearInterval(Ref.current);
    	setTimer('00:00');
    	timing = 1000;
	}

	return {
		timer,
		pause,
		play,
		remove
	};
} 