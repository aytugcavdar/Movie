// frontend/src/pages/MovieDetail.jsx

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovieById } from '../redux/movieSlice'; // Bunu birazdan ekleyeceğiz

const MovieDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedMovie, status, error } = useSelector(state => state.movie);

    useEffect(() => {
        if (id) {
            dispatch(fetchMovieById(id));
        }
    }, [id, dispatch]);
    
    if (status === 'loading') return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="alert alert-error">Hata: {error}</div>;
    if (!selectedMovie) return <div className="text-center p-10">Film bulunamadı.</div>;

    const { title, fullPosterUrl, overview, releaseDate, runtime, genres, voteAverage } = selectedMovie;

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-8">
            <div className="card lg:card-side bg-base-100 shadow-xl max-w-6xl mx-auto">
                <figure className="lg:w-1/3">
                    <img src={fullPosterUrl} alt={title} className="w-full h-full object-cover" />
                </figure>
                <div className="card-body lg:w-2/3">
                    <h1 className="card-title text-3xl md:text-5xl font-bold">{title}</h1>
                    <div className="flex flex-wrap gap-2 my-2">
                        {genres?.map(g => <div key={g.id} className="badge badge-primary">{g.name}</div>)}
                    </div>
                    <p className="my-4">{overview}</p>
                    <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-200">
                        <div className="stat">
                            <div className="stat-title">Puan</div>
                            <div className="stat-value">{voteAverage?.toFixed(1)} / 10</div>
                            <div className="stat-desc">TMDB</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Yayın Yılı</div>
                            <div className="stat-value">{new Date(releaseDate).getFullYear()}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Süre</div>
                            <div className="stat-value">{runtime} dk</div>
                        </div>
                    </div>
                    {/* İnceleme bölümü buraya eklenecek */}
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;