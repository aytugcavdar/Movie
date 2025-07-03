// frontend/src/redux/feedSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = 'http://localhost:4000/api/v1/users'; // Kullanıcı API URL'i

const initialState = {
    feedItems: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};


export const fetchFollowingFeed = createAsyncThunk(
    'feed/fetchFollowingFeed',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/feed`, {
                credentials: 'include', 
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Akış verileri yüklenemedi.');
            }
            
            return data.data; 
        } catch (error) {
            return rejectWithValue(error.message || 'Ağ hatası oluştu.');
        }
    }
);

const feedSlice = createSlice({
    name: 'feed',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFollowingFeed.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchFollowingFeed.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.feedItems = action.payload; 
            })
            .addCase(fetchFollowingFeed.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Akış yüklenirken hata oluştu.';
            });
    },
});

export default feedSlice.reducer;