import {configureStore} from '@reduxjs/toolkit';

import authReducer from './authSlice';
import movieReducer from './movieSlice';
import personReducer from './personSlice';
import watchlistReducer from './watchlistSlice';



export const store = configureStore({
  reducer: {
    auth: authReducer,
    movie:movieReducer,
    person:personReducer,
    watchlist:watchlistReducer,

  },
  
});

export default store;