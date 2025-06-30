
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:4000/api/v1/statistics';

const initialState = {
    data: null,
    status: 'idle',
    error: null
};

export const fetchStatistics = createAsyncThunk(
    'statistics/fetchStatistics',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${userId}`);
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

const statisticsSlice = createSlice({
    name: 'statistics',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStatistics.pending, (state) => {
                state.status = 'loading';
                state.data = null;
            })
            .addCase(fetchStatistics.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchStatistics.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export default statisticsSlice.reducer;