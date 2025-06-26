// frontend/src/redux/personSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    selectedPerson: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const API_URL = 'http://localhost:4000/api/v1/persons';

export const fetchPersonById = createAsyncThunk(
    'persons/fetchPersonById',
    async (personId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${personId}`);
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const personSlice = createSlice({
    name: 'persons',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPersonById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                state.selectedPerson = null;
            })
            .addCase(fetchPersonById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedPerson = action.payload;
                state.error = null;
            })
            .addCase(fetchPersonById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

export default personSlice.reducer;