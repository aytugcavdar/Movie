import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    movies: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    selectedMovie: null,
    

};

const API_URL = 'http://localhost:4000/api/v1/movies';

export const fetchMovies = createAsyncThunk(
    'movies/fetchMovies',
    async (params = {}, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`${API_URL}?${query}`);
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Filmler yüklenemedi.');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
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
export const fetchMovieById = createAsyncThunk(
    'movies/fetchMovieById',
    async (movieId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${movieId}`);
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
export const deleteMovie = createAsyncThunk(
    'movies/deleteMovie',
    async (movieId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${movieId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Film silinemedi');
            }
            // Silme işlemi başarılı olduğunda silinen filmin ID'sini döndür
            return movieId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateMovie = createAsyncThunk(
    'movies/updateMovie',
    async ({ movieId, movieData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${movieId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(movieData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Film güncellenemedi');
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const addReview = createAsyncThunk(
    'movies/addReview',
    async ({ movieId, reviewData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${movieId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Auth token cookie'sini göndermek için önemli
                body: JSON.stringify(reviewData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Backend'den gelen hata mesajını kullan
                return rejectWithValue(data.message || 'Yorum eklenemedi.');
            }
            
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const likeReview = createAsyncThunk(
    'movies/likeReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/reviews/${reviewId}/like`, {
                method: 'PUT',
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            toast.success("İnceleme beğenildi!");
            return { reviewId, ...data.data };
        } catch (error) {
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
            })
            .addCase(fetchMovieById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                state.selectedMovie = null; // Reset selected movie before fetching
            })
            .addCase(fetchMovieById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedMovie = action.payload; // Store the fetched movie
                state.error = null;
            })
            .addCase(fetchMovieById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            .addCase(deleteMovie.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteMovie.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Silinen filmi state'deki movies dizisinden çıkar
                state.movies = state.movies.filter(movie => movie._id !== action.payload);
            })
            .addCase(deleteMovie.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateMovie.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateMovie.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Güncellenen filmi state'deki movies dizisinde bul ve değiştir
                const index = state.movies.findIndex(movie => movie._id === action.payload._id);
                if (index !== -1) {
                    state.movies[index] = action.payload;
                }
                // Eğer `selectedMovie` güncellenen film ise onu da güncelle
                if (state.selectedMovie && state.selectedMovie._id === action.payload._id) {
                    state.selectedMovie = action.payload;
                }
            })
            .addCase(updateMovie.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addReview.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addReview.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (state.selectedMovie && state.selectedMovie.reviews) {
                    
                    state.selectedMovie.reviews.unshift(action.payload.data);
                }
                state.error = null;
            })
            .addCase(addReview.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(likeReview.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(likeReview.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (state.selectedMovie && state.selectedMovie.reviews) {
                    const index = state.selectedMovie.reviews.findIndex(review => review._id === action.payload.reviewId);
                    if (index !== -1) {
                        state.selectedMovie.reviews[index] = {
                            ...state.selectedMovie.reviews[index],
                            ...action.payload
                        };
                    }
                }
                state.error = null;
            })
            .addCase(likeReview.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { } = movieSlice.actions;

export default movieSlice.reducer;