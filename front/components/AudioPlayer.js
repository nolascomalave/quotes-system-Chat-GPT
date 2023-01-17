import React, { useState, useRef, useEffect } from 'react';

// Components:
import Loader from './Loader';

// Material Components:
import { Button } from '@mui/material';

// Material Icons:
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';

// Utils:
import { convertMillisecondsToMinutesSeconds } from '../util/format';

/*function getAbsoluteOffsetLeft(element) {
  if(element.parentNode === null) return 0;

  let offsetLeft = 0;

  while(element.parentNode !== null && element.parentNode !== undefined){
    offsetLeft += element.offsetLeft;
    element = element.parentNode;
  };

  return offsetLeft;
}*/

const initialState = {
  currentTime: 0,
  duration: 0,
  isPlaying: 0,
  isLoaded: false
};

const initialSelectedPointingConfig = {
    isPointed: false,
    isPlaying: false,
    offsetLeft: null
};

function AudioPlayer({urlAudio = "https://localhost:3001/Skrillex-The_Reason.mp3", onDelete}) {
  const [ state, setState ] = useState(initialState);
  /*const [ isPlaying, setIsPlaying ] = useState(false);
  const [ currentTime, setCurrentTime ] = useState(0);
  const [ duration, setDuration ] = useState(0);*/
  const audioElement = useRef(null);
  const progressElement = useRef(null);
  let selectedPointingConfig = initialSelectedPointingConfig;

  const togglePlay = () => {
    if (state.isPlaying) {
      audioElement.current.pause();
    } else {
      audioElement.current.play();
    }
  };

  const handlePlayPauseClick = () => {
    setState({ ...state, isPlaying: !state.isPlaying });
  	if(audioElement.current.paused) return audioElement.current.play();

  	audioElement.current.pause();
  };

  const handleTimeUpdate = () => {
    setState({
      ...state,
      currentTime: audioElement.current.currentTime,
      duration: audioElement.current.duration
    });
  };

  const handleProgressChange = (event) => {
    audioElement.current.currentTime = event.target.value;
  };

  const handlePointing = (event, type) => {
    selectedPointingConfig.isPointed = type === 'on';

    if(selectedPointingConfig.isPointed) {
      selectedPointingConfig.isPlaying = state.isPlaying === true;

      if(selectedPointingConfig.isPlaying) handlePlayPauseClick();

      return selectedPointingConfig.offsetLeft = event.clientX - progressElement.current.firstChild.offsetWidth;
    }

    if(selectedPointingConfig.isPlaying === true) handlePlayPauseClick();
    selectedPointingConfig.isPlaying = false;
    selectedPointingConfig.offsetLeft = null;
  };

  const onProgressPointerMove = (event) => {
    if(!audioElement.current || (selectedPointingConfig.isPointed !== true)) return;

    let offsetLeft = selectedPointingConfig.offsetLeft;
    let offsetRight = offsetLeft + progressElement.current.offsetWidth;
    let range = offsetRight - offsetLeft;
    let cursorRange = event.clientX - offsetLeft;

    if((cursorRange > range) || (cursorRange < 0)) return;

    // console.log(Math.floor((audioElement.current.duration / 100) * ((cursorRange / range) * 100)));

    audioElement.current.currentTime = Math.floor((audioElement.current.duration / 100) * ((cursorRange / range) * 100));
  };

  useEffect(() => {
    addEventListener('mousemove', onProgressPointerMove);
    addEventListener('touchmove', (event) => onProgressPointerMove(event.touches[0]));

    addEventListener('mouseup', (event) => handlePointing(event, 'off'));
  }, []);

  const restartParams = () => {
    selectedPointingConfig = initialSelectedPointingConfig;

    setState({...initialState, isLoaded: state.isLoaded});

    if(!!audioElement.current) audioElement.current.currentTime = 0;
  }

  useEffect(() => {
    restartParams();
  }, [urlAudio]);

  return (
    <div className="audio-player">
      <audio
        src={urlAudio}
        ref={audioElement}
        onTimeUpdate={handleTimeUpdate}
        onEnded = {restartParams}
        onLoadedData = {() => setState({...state, isLoaded: true})}
      />
        {state.isLoaded === true ? (
          <Button
            className="audio-player__control audio-player__control--play-pause"
            aria-label="Play/Pause"
            onClick={handlePlayPauseClick}
          >
            {(!!audioElement.current && !audioElement.current.paused) ? (
              <PauseIcon/>
            ) : (
              <PlayArrowIcon/>
            )}
          </Button>
        ) : (
          <Loader style = {{width: '2.625em', height: '2.625em', padding: '.5em'}}/>
        )}
      <div className = 'audio-player__progress' ref = {progressElement}>
        <div
          className = 'audio-player__progress__bar'
          style = {{
            width: `${!!audioElement.current ? ((audioElement.current.currentTime / audioElement.current.duration) * 100) : 0}%`
          }}
        >
          <div
            className = 'audio-player__progress__bar__point'
            onMouseDown = {(event) => handlePointing(event, 'on')}
            onTouchStart = {(event) => handlePointing(event.touches[0], 'on')}
            onTouchEnd = {(event) => handlePointing(event, 'off')}
          ></div>
        </div>
      </div>
      <p className = 'audio-player__progress__time'>{convertMillisecondsToMinutesSeconds(!!audioElement.current ? ((audioElement.current.duration - audioElement.current.currentTime) * 1000) : 0)}</p>
      {typeof onDelete === 'function' && (
        <Button onClick = {onDelete} className="audio-player__control audio-player__control--delete" aria-label="Delete">
          <DeleteIcon/>
        </Button>
      )}
    </div>
  );
}

export default AudioPlayer;