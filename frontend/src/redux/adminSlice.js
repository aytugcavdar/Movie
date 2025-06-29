
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:4000/api/v1/admin';

const initialState = {
    users: [],
    status: 'idle',
    error: null,
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
            });
    }
});

export default adminSlice.reducer;