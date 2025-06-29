// frontend/src/pages/UserProfile.jsx
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../redux/userSlice'; // Yeni slice'tan import ediyoruz
import { FiUser, FiFilm, FiList, FiStar } from 'react-icons/fi';

const UserProfile = () => {
    const { username } = useParams();
    const dispatch = useDispatch();
    
    // Veri ve durumu yeni userSlice'tan seçiyoruz
    const { profiles, status, error } = useSelector(state => state.user);
    const profileData = profiles[username]; // İlgili profili önbellekten alıyoruz

    useEffect(() => {
        // Sadece profil verisi daha önce çekilmemişse istek atıyoruz
        if (!profileData) {
            dispatch(fetchUserProfile(username));
        }
    }, [dispatch, username, profileData]);

    if (status === 'loading' && !profileData) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    }
    
    if (status === 'failed' && error) {
        return <div className="alert alert-error max-w-md mx-auto">Hata: {error}</div>;
    }
    
    if (!profileData) {
        return <div className="text-center p-10">Kullanıcı bulunamadı.</div>;
    }

    const { user, reviews, watchlists } = profileData;

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Profil Başlığı */}
                <div className="card bg-base-100 shadow-xl mb-8">
                    <div className="card-body items-center text-center">
                        <div className="avatar">
                            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`} alt={`${user.username} avatarı`}/>
                            </div>
                        </div>
                        <h2 className="card-title text-3xl mt-4">{user.fullName}</h2>
                        <p>@{user.username}</p>
                        {user.bio && <p className="text-base-content/70 mt-2 max-w-lg">{user.bio}</p>}
                        <div className="flex space-x-4 mt-4">
                            <div><span className="font-bold">{user.followersCount || 0}</span> Takipçi</div>
                            <div><span className="font-bold">{user.followingCount || 0}</span> Takip</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sol Sütun: Yorumlar */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-2"><FiFilm /> Son Yorumlar</h3>
                        {reviews && reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review._id} className="card bg-base-100 shadow-lg transition-shadow hover:shadow-xl">
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <Link to={`/movies/${review.movie._id}`}>
                                                <img src={review.movie.posterPath ? `https://image.tmdb.org/t/p/w200${review.movie.posterPath}` : 'https://via.placeholder.com/100x150'} alt={review.movie.title} className="w-20 rounded-lg"/>
                                            </Link>
                                            <div className="flex-grow">
                                                <h4 className="card-title text-lg">{review.movie.title} <span className="text-sm font-normal text-base-content/60">({new Date(review.movie.releaseDate).getFullYear()})</span></h4>
                                                <div className="flex items-center gap-1">
                                                    <div className="rating rating-sm">
                                                        {[...Array(5)].map((_, i) => <input key={i} type="radio" name={`rating-${review._id}`} className="mask mask-star-2 bg-orange-400" checked={i < review.rating} readOnly disabled />)}
                                                    </div>
                                                     <span className="font-bold ml-2">{review.rating}</span>
                                                </div>
                                                <p className="mt-2 text-base-content/80">"{review.content.substring(0, 200)}{review.content.length > 200 && '...'}"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : <div className="text-center p-6 bg-base-100 rounded-lg shadow-inner"><p>Henüz yorum yok.</p></div>}
                    </div>

                    {/* Sağ Sütun: Listeler */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-2"><FiList /> İzleme Listeleri</h3>
                        {watchlists && watchlists.length > 0 ? (
                            watchlists.map(list => (
                                <div key={list._id} className="card bg-base-100 shadow-lg">
                                    <div className="card-body p-4">
                                        <h4 className="card-title">{list.name}</h4>
                                        <p>{list.movies.length} film</p>
                                    </div>
                                </div>
                            ))
                        ) : <div className="text-center p-6 bg-base-100 rounded-lg shadow-inner"><p>Henüz herkese açık liste yok.</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;