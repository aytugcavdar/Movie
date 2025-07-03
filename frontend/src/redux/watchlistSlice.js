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
export const fetchWatchlists = createAsyncThunk(
    'watchlists/fetchWatchlists', 
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(API_URL, { 
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Watchlistler yüklenemedi');
            }
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Fetch watchlists error:', error);
            return rejectWithValue(error.message || 'Ağ hatası');
        }
    }
);

export const createWatchlist = createAsyncThunk(
    'watchlists/createWatchlist', 
    async (watchlistData, { rejectWithValue }) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(watchlistData),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Liste oluşturulamadı');
            }
            
            const data = await response.json();
            toast.success(`"${data.data.name}" listesi oluşturuldu!`);
            return data.data;
        } catch (error) {
            console.error('Create watchlist error:', error);
            return rejectWithValue(error.message || 'Ağ hatası');
        }
    }
);

export const addMovieToWatchlist = createAsyncThunk(
    'watchlists/addMovieToWatchlist', 
    async ({ watchlistId, movieId }, { rejectWithValue }) => {
        try {
            console.log('Adding movie to watchlist:', { watchlistId, movieId });
            
            const response = await fetch(`${API_URL}/${watchlistId}/movies`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ movieId }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                return rejectWithValue(errorData.message || 'Film listeye eklenemedi');
            }
            
            const data = await response.json();
            toast.success("Film listeye eklendi!");
            return data.data;
        } catch (error) {
            console.error('Add movie to watchlist error:', error);
            return rejectWithValue(error.message || 'Ağ hatası');
        }
    }
);

export const removeMovieFromWatchlist = createAsyncThunk(
    'watchlists/removeMovieFromWatchlist',
    async ({ watchlistId, movieId }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${watchlistId}/movies/${movieId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Film listeden çıkarılamadı');
            }
            
            const data = await response.json();
            toast.success("Film listeden çıkarıldı!");
            return data.data;
        } catch (error) {
            console.error('Remove movie from watchlist error:', error);
            return rejectWithValue(error.message || 'Ağ hatası');
        }
    }
);
export const updateWatchlist = createAsyncThunk(
    'watchlists/updateWatchlist',
    async ({ watchlistId, watchlistData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${watchlistId}`, {
                method: 'PUT', // PUT isteği ile güncelliyoruz
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(watchlistData),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'İzleme listesi güncellenemedi.');
            }
            toast.success("İzleme listesi başarıyla güncellendi!");
            return data.data; // Güncellenmiş liste verilerini döndür
        } catch (error) {
            return rejectWithValue(error.message || 'Ağ hatası.');
        }
    }
);
export const deleteWatchlist = createAsyncThunk(
    'watchlists/deleteWatchlist',
    async (watchlistId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${watchlistId}`, {
                method: 'DELETE', // DELETE isteği ile siliyoruz
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'İzleme listesi silinemedi.');
            }
            // Başarılı olursa silinen listenin ID'sini döndür
            return watchlistId;
        } catch (error) {
            return rejectWithValue(error.message || 'Ağ hatası.');
        }
    }
);

const watchlistSlice = createSlice({
    name: 'watchlists',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetStatus: (state) => {
            state.status = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Watchlists
            .addCase(fetchWatchlists.pending, (state) => { 
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchWatchlists.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload || [];
                state.error = null;
            })
            .addCase(fetchWatchlists.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Watchlistler yüklenemedi';
                console.error('Fetch watchlists failed:', action.payload);
            })
            
            // Create Watchlist
            .addCase(createWatchlist.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createWatchlist.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
                state.error = null;
            })
            .addCase(createWatchlist.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Liste oluşturulamadı';
                toast.error(action.payload || 'Liste oluşturulamadı');
            })
            
            // Add Movie to Watchlist
            .addCase(addMovieToWatchlist.pending, (state) => {
                state.error = null;
            })
            .addCase(addMovieToWatchlist.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(addMovieToWatchlist.rejected, (state, action) => {
                state.error = action.payload || 'Film eklenemedi';
                toast.error(action.payload || 'Film eklenemedi');
            })
            
            // Remove Movie from Watchlist
            .addCase(removeMovieFromWatchlist.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(removeMovieFromWatchlist.rejected, (state, action) => {
                state.error = action.payload || 'Film çıkarılamadı';
                toast.error(action.payload || 'Film çıkarılamadı');
            })
            .addCase(updateWatchlist.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateWatchlist.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Güncellenen listeyi bul ve state'deki ile değiştir
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateWatchlist.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'İzleme listesi güncellenemedi';
                toast.error(action.payload || 'İzleme listesi güncellenemedi');
            })
            .addCase(deleteWatchlist.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteWatchlist.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Silinen izleme listesini listeden çıkar
                state.items = state.items.filter(item => item._id !== action.payload);
                state.error = null;
            })
            .addCase(deleteWatchlist.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'İzleme listesi silinemedi';
                toast.error(action.payload || 'İzleme listesi silinemedi');
            });
    }
});

export const { clearError, resetStatus } = watchlistSlice.actions;
export default watchlistSlice.reducer;