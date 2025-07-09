

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, followUser } from '../redux/userSlice';
import { FiUser, FiFilm, FiList, FiStar, FiUserPlus, FiUserCheck, FiEye, FiBarChart2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { fetchStatistics } from '../redux/statisticsSlice';
import MovieCard from '../components/MovieCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const UserProfile = () => {
    const { username } = useParams();
    const dispatch = useDispatch();


    const { profiles, status, error } = useSelector(state => state.user);
    const { data: statsData, status: statsStatus } = useSelector(state => state.statistics);
    const { user: currentUser } = useSelector(state => state.auth);
    const profileData = profiles[username];

    const [isFollowing, setIsFollowing] = useState(false);


    useEffect(() => {

        if (!profileData) {
            dispatch(fetchUserProfile(username));
        }
        // İstatistikleri sadece kullanıcı profili yüklendiyse ve istatistikler henüz yüklenmediyse çek
        if (profileData?.user?._id && statsStatus === 'idle') {
            dispatch(fetchStatistics(profileData.user._id));
        }
    }, [dispatch, username, profileData, statsStatus]); // statsStatus bağımlılığı eklendi

    useEffect(() => {
        if (currentUser && profileData?.user?.followers) {
            // Kullanıcının takipçiler listesinde mevcut kullanıcı ID'si varsa isFollowing true olur
            setIsFollowing(profileData.user.followers.some(followerId => followerId === currentUser.id));
        }
    }, [currentUser, profileData]);

    const handleFollow = () => {
        if (!currentUser) {
            toast.error("Takip etmek için giriş yapmalısınız.");
            return;
        }
        dispatch(followUser(profileData.user._id))
            .unwrap()
            .then(response => {
                setIsFollowing(response.data.isFollowing);

                dispatch(fetchUserProfile(username));
                toast.success(response.message);
            })
            .catch(err => toast.error(err));
    };

    if (status === 'loading' && !profileData) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    }

    if (status === 'failed' && error) {
        return <div className="alert alert-error max-w-md mx-auto">Hata: {error}</div>;
    }

    if (!profileData) {
        return <div className="text-center p-10">Kullanıcı bulunamadı.</div>;
    }

    const { user, reviews, watchlists, watchedMovies } = profileData; // watchedMovies'i çektik

    const genreChartData = {
        labels: statsData?.genres?.map(g => g._id) || [],
        datasets: [
            {
                label: ' Yorum Sayısı',
                data: statsData?.genres?.map(g => g.count) || [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const decadeChartData = {
        labels: statsData?.decades?.map(d => d._id) || [],
        datasets: [
            {
                label: 'İzlenen Film Sayısı',
                data: statsData?.decades?.map(d => d.count) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Profil Başlığı */}
                <div className="card bg-base-100 shadow-xl mb-8">
                    <div className="card-body items-center text-center">
                        <div className="avatar">
                            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`} alt={`${user.username} avatarı`} />
                            </div>
                        </div>
                        <h2 className="card-title text-3xl mt-4">{user.fullName}</h2>
                        <p>@{user.username}</p>
                        {user.bio && <p className="text-base-content/70 mt-2 max-w-lg">{user.bio}</p>}
                        <div className="flex space-x-4 mt-4">
                            <div><span className="font-bold">{user.followersCount || 0}</span> Takipçi</div>
                            <div><span className="font-bold">{user.followingCount || 0}</span> Takip</div>
                        </div>
                        {currentUser && currentUser.id !== user._id && ( // Kendi profilini takip etme butonu gösterme
                            <div className="mt-4">
                                <button onClick={handleFollow} className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}>
                                    {isFollowing ? <FiUserCheck /> : <FiUserPlus />}
                                    {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sol Sütun: İstatistikler ve Yorumlar */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h3 className="card-title text-xl flex items-center gap-2"><FiBarChart2 /> İstatistikler</h3>
                                {statsStatus === 'loading' && <span className="loading loading-dots loading-md"></span>}
                                {statsData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-bold mb-2 text-center">Favori Türler</h4>
                                            <Doughnut data={genreChartData} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-2 text-center">Yıllara Göre Dağılım</h4>
                                            <Bar data={decadeChartData} />
                                        </div>
                                    </div>
                                ) : (
                                    statsStatus === 'succeeded' && <div className="text-center text-base-content/70 p-4">Henüz istatistik verisi yok.</div>
                                )}
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold flex items-center gap-2"><FiFilm /> Son Yorumlar</h3>
                        {reviews && reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review._id} className="card bg-base-100 shadow-lg transition-shadow hover:shadow-xl">
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <Link to={`/movies/${review.movie._id}`}>
                                                <img src={review.movie.posterPath ? `https://image.tmdb.org/t/p/w200${review.movie.posterPath}` : 'https://via.placeholder.com/100x150'} alt={review.movie.title} className="w-20 rounded-lg" />
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

                    {/* Sağ Sütun: Listeler ve İzlenen Filmler */}
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
                        ) : <div className="text-center p-6 bg-base-100 rounded-lg shadow-inner"><p>Henüz herkese açık izleme listesi yok.</p></div>}

                        <div className="divider"></div> {/* Ayırıcı */}

                        <h3 className="text-2xl font-bold flex items-center gap-2"><FiEye /> İzlenen Filmler</h3>
                        {watchedMovies && watchedMovies.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {watchedMovies.slice(0, 6).map(item => ( // İlk 6 filmi göster
                                    <MovieCard key={item.movie._id} movie={item.movie} className="col-span-1" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-base-100 rounded-lg shadow-inner">
                                <p>Henüz izlenen film yok.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;