import { useRef, useEffect } from 'react';

// Redux Reducers:
import { changeValue, setVisibility } from '../../features/requirePasswordSlice.js';

// Components:
import RequirePasswordAlert from "../RequirePasswordAlert";
import Input from "../floatLabel/Input";

export default function GlobalRequirePassword({state, changeValue, setVisibility, close: closeReqPass}){
    const input = useRef();

    const setRequirePassword = (isVisible)=>{
    	setVisibility(isVisible);
    };

    const close = () => {
        setVisibility(false);
    }

    useEffect(()=>{
        if(state.isVisible) return;
        setTimeout(closeReqPass(), 300);
    }, state.isVisible);

	return (
		<RequirePasswordAlert
          acceptAction={{action: () => state.action.fn(state.value, close), close:false}}
          open={()=> input.current.focus()}
          close={state.isClosed}
          show={state.isVisible}
          setShow={setRequirePassword}
          title={state.title}
          message={state.message}
      >
          <Input
            type="password"
            reference={input}
            label="Password"
            value={state.value}
            error={state.error}
            required={true}
            onChange={(e) => changeValue(e.target.value)}
          />
      </RequirePasswordAlert>
	)
}