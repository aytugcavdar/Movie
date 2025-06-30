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
export const followUser = createAsyncThunk(
    'user/followUser',
    async (userId, { getState, rejectWithValue }) => {
        const { auth } = getState();
        if (!auth.isAuthenticated) {
            return rejectWithValue('Bu işlem için giriş yapmalısınız.');
        }
        try {
            const response = await fetch(`${USER_API_URL}/${userId}/follow`, {
                method: 'PUT',
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message);
            }
            return { userId, ...data };
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
            })
            .addCase(followUser.fulfilled, (state, action) => {
                const { userId, data } = action.payload;
                // Eğer takip edilen kullanıcının profili state'de varsa güncelle
                const username = Object.keys(state.profiles).find(key => state.profiles[key].user._id === userId);
                if (username && state.profiles[username]) {
                    state.profiles[username].user.followersCount = data.followersCount;
                    
                    if (state.profiles[auth.user.username]) {
                        state.profiles[auth.user.username].user.followingCount = data.followingCount;
                    }
                }
            })
            .addCase(followUser.rejected, (state, action) => {
                
                console.error("Takip hatası:", action.payload);
            });
    }
});

export default userSlice.reducer;