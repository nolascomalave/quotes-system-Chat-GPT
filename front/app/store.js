import { configureStore } from '@reduxjs/toolkit';

// Reducers:
import requirePassword from '../features/requirePasswordSlice';
import sessionReducer from '../features/session/sessionSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    //requirePassword: requirePassword
  },
})