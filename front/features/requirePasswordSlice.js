import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: '',
  error: null,
  title: 'Are you sure?',
  message: 'Pasword is required',
  action: null,
  isVisible: false,
  isClosed: false,
  actioned: null
}

export const requirePasswordSlice = createSlice({
  name: 'requirePassword',
  initialState,
  reducers: {
    reqPass: (state, action) => {
      return {
        ...initialState,
        fn: action.payload.action,
        title: action.payload.message ?? initialState.message,
        message: action.payload.title ?? initialState.title,
        isVisible: true
      };
    },

    execute: (state) => {
      return {...state, actioned: state.action };
    },

    changeValue: (state, action) => {
      return { ...state, value: action.payload, error: null };
    },

    setVisibility: (state, action)=>{
      return { ...state, isVisible: action.payload, actioned: null };
    },

    close: (state, action) => {
      return { ...state, isClosed: true, action: null, actioned: null };
    }
  },
})

// Action creators are generated for each case reducer function
export const { reqPass, changeValue, setVisibility, close, execute } = requirePasswordSlice.actions;

export default requirePasswordSlice.reducer;