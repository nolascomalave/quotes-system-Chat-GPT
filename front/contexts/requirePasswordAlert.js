import {createContext, useState} from 'react';

// Components:
import GlobalRequirePassword from '../components/globaal/GlobalRequirePassword';

const requirePasswordAlert = createContext();

const initialState = {
    value: '',
    error: null,
    title: 'Are you sure?',
    message: 'Pasword is required',
    action: {fn: null},
    isVisible: false,
    isClosed: true
  }

const ProviderRequirePasswordAlert=({children})=>{
    const [state, setState] = useState(initialState);

    const reqPass = (payload) => {
        setState({
          ...initialState,
          action: {fn: payload.action},
          title: payload.message ?? initialState.message,
          message: payload.title ?? initialState.title,
          isVisible: true,
          isClosed: true
        });
      };

      const changeValue = (payload) => {
        setState({ ...state, value: payload, error: null });
      };
 
      const setVisibility = (payload)=>{
        setState({ ...state, isVisible: payload });
      };
 
      const close = () => {
        setState(initialState);
      };

    

    return (
        <requirePasswordAlert.Provider value={{reqPass, changeValue, setVisibility, close, password: state.value}}>
            {children}

            <GlobalRequirePassword
                state={state}
                changeValue={changeValue}
                close={close}
                setVisibility={setVisibility}
            />
        </requirePasswordAlert.Provider>
    );
}

export {ProviderRequirePasswordAlert};
export default requirePasswordAlert;