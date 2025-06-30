import {configureStore} from '@reduxjs/toolkit';

import authReducer from './authSlice';
import movieReducer from './movieSlice';
import personReducer from './personSlice';
import watchlistReducer from './watchlistSlice';
import userReducer from './userSlice';
import listReducer from './listSlice';
import adminReducer from './adminSlice';
import notificationReducer from './notificationSlice';
import statisticsReducer from './statisticsSlice';



export const store = configureStore({
  reducer: {
    auth: authReducer,
    movie:movieReducer,
    person:personReducer,
    watchlist:watchlistReducer,
    user: userReducer,
    list: listReducer,
    admin: adminReducer,
    notifications: notificationReducer,
    statistics: statisticsReducer,

  },
  
});

export default store;