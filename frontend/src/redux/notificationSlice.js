
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:4000/api/v1/notifications';

const initialState = {
    items: [],
    unreadCount: 0,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(API_URL, { credentials: 'include' });
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

export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/mark-all-read`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message);
            }
            toast.info('Tüm bildirimler okundu olarak işaretlendi.');
            return;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.unreadCount = action.payload.filter(n => !n.isRead).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(markAllNotificationsAsRead.pending, (state) => {
                // Optimistic update: anında arayüzü güncelle
                state.items.forEach(item => { item.isRead = true; });
                state.unreadCount = 0;
            })
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                // Optimistic update başarısız olursa geri al (bu kısım daha karmaşık bir state yönetimi gerektirebilir)
                toast.error("Bildirimler okundu olarak işaretlenemedi.");
            });
    }
});

export default notificationSlice.reducer;