// frontend/src/redux/watchlistSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:4000/api/v1/watchlists';

const initialState = {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Async Thunks
export const fetchWatchlists = createAsyncThunk('watchlists/fetchWatchlists', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(API_URL, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const createWatchlist = createAsyncThunk('watchlists/createWatchlist', async (watchlistData, { rejectWithValue }) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(watchlistData),
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        toast.success(`"${data.data.name}" listesi oluşturuldu!`);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const addMovieToWatchlist = createAsyncThunk('watchlists/addMovieToWatchlist', async ({ watchlistId, movieId }, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/${watchlistId}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId }),
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        toast.success("Film listeye eklendi!");
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const watchlistSlice = createSlice({
    name: 'watchlists',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Watchlists
            .addCase(fetchWatchlists.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchWatchlists.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchWatchlists.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Create Watchlist
            .addCase(createWatchlist.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Add Movie to Watchlist
            .addCase(addMovieToWatchlist.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    }
});

export default watchlistSlice.reducer;