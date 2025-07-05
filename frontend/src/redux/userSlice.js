// frontend/src/redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';

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

// YENİ THUNK: markMovieAsWatched
export const markMovieAsWatched = createAsyncThunk(
    'user/markMovieAsWatched',
    async ({ movieId, rating = null }, { rejectWithValue, getState }) => {
        const { auth } = getState();
        if (!auth.isAuthenticated) {
            return rejectWithValue('Bu işlem için giriş yapmalısınız.');
        }
        try {
            const response = await fetch(`${USER_API_URL}/watched/${movieId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating }),
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.message || 'Film izlendi olarak işaretlenemedi!');
                return rejectWithValue(data.message);
            }
            toast.success(data.message);
            // Güncel kullanıcı profilini yeniden çekmek için
            // veya sadece local state'i güncellemek için daha detaylı payload döndürülebilir
            return { movieId, ...data.data, currentUserId: auth.user.id }; 
        } catch (error) {
            toast.error(error.message || 'Ağ hatası oluştu!');
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
                    
                    // Mevcut kullanıcının takip ettikleri sayısını da güncellemek için
                    // auth slice'a erişim olmadığı için bu kısım authSlice içinde yapılmalı
                    // veya buradan bir action dispatch edilmeli. Şimdilik sadece takip edilenin sayısını güncelliyoruz.
                }
            })
            .addCase(followUser.rejected, (state, action) => {
                
                console.error("Takip hatası:", action.payload);
            })
            // markMovieAsWatched için extraReducer
            .addCase(markMovieAsWatched.fulfilled, (state, action) => {
                const { movieId, isWatched, watchedMoviesCount, currentUserId } = action.payload;
                // Kendi profilimizdeki watchedMovies listesini güncelliyoruz
                const currentUserProfileKey = Object.keys(state.profiles).find(key => state.profiles[key].user._id === currentUserId);
                if (currentUserProfileKey && state.profiles[currentUserProfileKey]) {
                    if (isWatched) {
                        // Yeni eklenen filmi ekle (sadece ID ve watchedAt, tam film objesi değil)
                        state.profiles[currentUserProfileKey].watchedMovies.push({ movie: movieId, watchedAt: new Date() });
                    } else {
                        // Çıkarılan filmi filtrele
                        state.profiles[currentUserProfileKey].watchedMovies = state.profiles[currentUserProfileKey].watchedMovies.filter(
                            item => item.movie._id.toString() !== movieId
                        );
                    }
                }
                // Ayrıca, eğer görüntülenen profil mevcut kullanıcının profili ise, o profilin de güncellendiğinden emin olun.
                // Bu, fetchUserProfile tekrar çağrıldığında tam verilerle güncellenecektir.
            })
            .addCase(markMovieAsWatched.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export default userSlice.reducer;
