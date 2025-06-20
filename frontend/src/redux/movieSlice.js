import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    movies: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    selectedMovie: null, // To store a single movie, e.g., after fetching from TMDB or for editing
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

// New Thunk for fetching and saving a movie from TMDB
export const fetchMovieFromTMDB = createAsyncThunk(
    'movies/fetchMovieFromTMDB',
    async (tmdbId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/tmdb/${tmdbId}`, {
                method: 'POST', // This endpoint is a POST request as per backend/routes/movieRoute.js
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for sending cookies (e.g., auth token)
            });

            const data = await response.json();

            if (!response.ok) {
                // If backend sends an error response (e.g., 404, 500)
                // data.message will contain the error message from ErrorResponse
                return rejectWithValue(data.message || 'Failed to fetch movie from TMDB');
            }

            return data;
        } catch (error) {
            // Network errors
            return rejectWithValue(error.message);
        }
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
                state.movies = action.payload.data; // Assuming your backend returns { success: true, count: X, data: [...] }
                state.error = null; // Clear any previous errors
            })
            .addCase(fetchMovies.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchMovieFromTMDB.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                state.selectedMovie = null;
            })
            .addCase(fetchMovieFromTMDB.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedMovie = action.payload.data; // Store the newly added movie
                // Optionally add to the movies list if it's not already there and you want it instantly visible
                if (!state.movies.some(movie => movie._id === action.payload.data._id)) {
                    state.movies.push(action.payload.data);
                }
                state.error = null;
            })
            .addCase(fetchMovieFromTMDB.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

export const { } = movieSlice.actions;

export default movieSlice.reducer;