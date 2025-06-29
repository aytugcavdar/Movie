// frontend/src/redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    // Çekilen profilleri kullanıcı adına göre önbelleğe alacağız
    profiles: {}, 
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const USER_API_URL = 'http://localhost:4000/api/v1/users';

// Kullanıcı profili getirme thunk'ı
export const fetchUserProfile = createAsyncThunk(
    'user/fetchUserProfile',
    async (username, { rejectWithValue }) => {
        try {
            const response = await fetch(`${USER_API_URL}/${username}`);
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Kullanıcı profili yüklenemedi');
            }
            const data = await response.json();
            // Veriyi ve kullanıcı adını birlikte döndürüyoruz
            return { username, profile: data.data }; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Gelen profili, kullanıcı adını anahtar olarak kullanarak state'e kaydediyoruz
                state.profiles[action.payload.username] = action.payload.profile;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export default userSlice.reducer;