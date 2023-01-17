import { createSlice } from '@reduxjs/toolkit'
import Router from 'next/router';
import { setCookies, removeCookies, checkCookies } from 'cookies-next';

const initialState = {
  // token: null,
  user: null
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    createSession: (state, action) => {
      setCookies('user', action.payload.token, { maxAge: 60 * 60 * 24/*, secure: true*/, httpOnly: true });
      Router.push('/');
      state.user = action.payload.user;
    },
    removeSession: (state, action) => {
      Router.push('login');
      state = initialState;
    },
  },
})

// Action creators are generated for each case reducer function
export const { createSession, removeSession } = sessionSlice.actions;

export default sessionSlice.reducer;