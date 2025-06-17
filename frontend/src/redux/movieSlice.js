import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    movies: [],
    status: 'idle',
    error: null,
    };
    
const API_URL = 'http://localhost:4000/api/v1/movies';
export const fetchMovies = createAsyncThunk(
    'movies/fetchMovies',
    async () => {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }
);

const movieSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovies.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMovies.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.movies = action.payload;
            })
            .addCase(fetchMovies.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { } = movieSlice.actions;

export default movieSlice.reducer;