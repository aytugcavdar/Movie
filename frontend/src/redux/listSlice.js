
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:4000/api/v1/lists';

const initialState = {
    lists: [],
    selectedList: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Thunks
export const fetchLists = createAsyncThunk('lists/fetchLists', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(API_URL, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// YENİ THUNK: fetchListById
export const fetchListById = createAsyncThunk('lists/fetchListById', async (listId, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/${listId}`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const createList = createAsyncThunk('lists/createList', async (listData, { rejectWithValue }) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(listData),
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        toast.success(`'${data.data.title}' listesi oluşturuldu!`);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// YENİ THUNK: removeMovieFromList
export const removeMovieFromList = createAsyncThunk('lists/removeMovieFromList', async ({ listId, movieId }, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/${listId}/movies/${movieId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        toast.success("Film listeden kaldırıldı!");
        return { listId, movieId }; // Başarı durumunda ID'leri döndür
    } catch (error) {
        return rejectWithValue(error.message);
    }
});


const listSlice = createSlice({
    name: 'lists',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Lists
            .addCase(fetchLists.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchLists.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.lists = action.payload;
            })
            .addCase(fetchLists.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch List By ID
            .addCase(fetchListById.pending, (state) => {
                state.status = 'loading';
                state.selectedList = null;
            })
            .addCase(fetchListById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedList = action.payload;
            })
            .addCase(fetchListById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Create List
            .addCase(createList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.lists.push(action.payload);
            })
            .addCase(createList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Remove Movie From List
            .addCase(removeMovieFromList.fulfilled, (state, action) => {
                if (state.selectedList && state.selectedList._id === action.payload.listId) {
                    state.selectedList.movies = state.selectedList.movies.filter(
                        (movieItem) => movieItem.movie._id.toString() !== action.payload.movieId.toString()
                    );
                }
            });
    }
});

export default listSlice.reducer;