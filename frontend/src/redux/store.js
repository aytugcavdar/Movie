import {configureStore} from '@reduxjs/toolkit';

import authReducer from './authSlice';
import movieReducer from './movieSlice';
import personReducer from './personSlice';
import watchlistReducer from './watchlistSlice';
import userReducer from './userSlice';
import listReducer from './listSlice';
import adminReducer from './adminSlice';



export const store = configureStore({
  reducer: {
    auth: authReducer,
    movie:movieReducer,
    person:personReducer,
    watchlist:watchlistReducer,
    user: userReducer,
    list: listReducer,
    admin: adminReducer,

  },
  
});

export default store;