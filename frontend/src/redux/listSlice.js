
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

export const removeMovieFromList = createAsyncThunk('lists/removeMovieFromList', async ({ listId, movieId }, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/${listId}/movies/${movieId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        toast.success("Film listeden kaldırıldı!");
        return { listId, movieId }; 
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
export const likeList = createAsyncThunk('lists/likeList', async (listId, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/${listId}/like`, {
            method: 'PUT',
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        toast.success(data.message);
        return { listId, likesCount: data.data.likesCount };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
export const updateList = createAsyncThunk(
    'lists/updateList',
    async ({ listId, listData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${listId}`, {
                method: 'PUT', // PUT isteği ile güncelliyoruz
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(listData),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Liste güncellenemedi.');
            }
            toast.success("Liste başarıyla güncellendi!");
            return data.data; // Güncellenmiş liste verilerini döndür
        } catch (error) {
            return rejectWithValue(error.message || 'Ağ hatası.');
        }
    }
);
export const deleteList = createAsyncThunk(
    'lists/deleteList',
    async (listId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${listId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Liste silinemedi.');
            toast.success("Liste başarıyla silindi!");
            return listId; 
        } catch (error) {
            return rejectWithValue(error.message || 'Ağ hatası.');
        }
    }
);
export const addMovieToList = createAsyncThunk(
    'lists/addMovieToList',
    async ({ listId, movieId, notes = '' }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/${listId}/movies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ movieId, notes }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Film listeye eklenemedi.');
            }
            toast.success("Film listeye eklendi!");
            return data.data; // Güncellenmiş listeyi döndür
        } catch (error) {
            return rejectWithValue(error.message || 'Ağ hatası.');
        }
    }
);



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
            })
            .addCase(likeList.fulfilled, (state, action) => {
                if (state.selectedList && state.selectedList._id === action.payload.listId) {
                    state.selectedList.likesCount = action.payload.likesCount;
                }
                const index = state.lists.findIndex(list => list._id === action.payload.listId);
                if (index !== -1) {
                    state.lists[index].likesCount = action.payload.likesCount;
                }
            })
            .addCase(updateList.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Tüm listeler dizisinde güncellenen listeyi bul ve değiştir
                const allListsIndex = state.lists.findIndex(list => list._id === action.payload._id);
                if (allListsIndex !== -1) {
                    state.lists[allListsIndex] = action.payload;
                }
                // Eğer görüntülenen liste güncellenen liste ise, onu da güncelle
                if (state.selectedList && state.selectedList._id === action.payload._id) {
                    state.selectedList = action.payload;
                }
                state.error = null;
            })
            .addCase(updateList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Liste güncellenemedi';
                toast.error(action.payload || 'Liste güncellenemedi');
            })
            .addCase(deleteList.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            }
            )
            .addCase(deleteList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Silinen listeyi tüm listelerden kaldır
                state.lists = state.lists.filter(list => list._id !== action.payload);
                // Eğer görüntülenen liste silinmişse, onu da null yap
                if (state.selectedList && state.selectedList._id === action.payload) {
                    state.selectedList = null;
                }
                state.error = null;
            }
            )
            .addCase(deleteList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Liste silinemedi';
                toast.error(action.payload || 'Liste silinemedi');
            })
            .addCase(addMovieToList.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addMovieToList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                
                const index = state.lists.findIndex(list => list._id === action.payload._id);
                if (index !== -1) {
                    state.lists[index] = action.payload; 
                }
                
                if (state.selectedList && state.selectedList._id === action.payload._id) {
                    state.selectedList = action.payload;
                }
                state.error = null;
            })
            .addCase(addMovieToList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Film listeye eklenemedi.';
                toast.error(action.payload || 'Film listeye eklenemedi.');
            });
    }
});

export default listSlice.reducer;