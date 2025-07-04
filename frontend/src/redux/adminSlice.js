
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:4000/api/v1/admin';

const initialState = {
    users: [],
    status: 'idle',
    error: null,
     reviewsForModeration: [], 
    listsForModeration: [],
};

// Thunks
export const fetchAllUsers = createAsyncThunk('admin/fetchAllUsers', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/users`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const updateUserByAdmin = createAsyncThunk('admin/updateUserByAdmin', async ({ userId, userData }, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        toast.success("Kullanıcı güncellendi!");
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
export const fetchDashboardStats = createAsyncThunk('admin/fetchDashboardStats', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/dashboard-stats`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
export const fetchReviewsForModeration = createAsyncThunk('admin/fetchReviewsForModeration', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/reviews/moderation`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const updateReviewModeration = createAsyncThunk('admin/updateReviewModeration', async ({ reviewId, moderationStatus }, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}/moderation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moderationStatus }),
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        toast.success(`Yorum ${moderationStatus === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// Liste moderasyonu için de benzer thunk'lar (varsayılan List modeli güncellendiyse)
export const fetchListsForModeration = createAsyncThunk('admin/fetchListsForModeration', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/lists/moderation`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const updateListModeration = createAsyncThunk('admin/updateListModeration', async ({ listId, moderationStatus }, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/lists/${listId}/moderation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moderationStatus }),
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data.message);
        toast.success(`Liste ${moderationStatus === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});



const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateUserByAdmin.fulfilled, (state, action) => {
                const index = state.users.findIndex(user => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(fetchDashboardStats.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.dashboardStats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchReviewsForModeration.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchReviewsForModeration.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.reviewsForModeration = action.payload;
            })
            .addCase(fetchReviewsForModeration.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateReviewModeration.fulfilled, (state, action) => {
                
                state.reviewsForModeration = state.reviewsForModeration.filter(review => review._id !== action.payload._id);
              
            })
            .addCase(fetchListsForModeration.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchListsForModeration.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.listsForModeration = action.payload;
            })
            .addCase(fetchListsForModeration.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateListModeration.fulfilled, (state, action) => {
                state.listsForModeration = state.listsForModeration.filter(list => list._id !== action.payload._id);
            });
    }
});

export default adminSlice.reducer;