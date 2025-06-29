
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies } from '../redux/movieSlice';
import MovieCard from '../components/MovieCard';
import { FiSearch } from 'react-icons/fi';
import debounce from 'lodash.debounce';

const GENRES = [
    "Aksiyon", "Macera", "Animasyon", "Komedi", "Suç", "Belgesel", "Dram", 
    "Aile", "Fantastik", "Tarih", "Korku", "Müzik", "Gizem", "Romantik", 
    "Bilim Kurgu", "TV Filmi", "Gerilim", "Savaş", "Vahşi Batı"
];

const MoviesPage = () => {
    const dispatch = useDispatch();
    const { movies, status, pagination, total } = useSelector(state => state.movie);

    const [filters, setFilters] = useState({
        search: '',
        genres: [],
        releaseYear: '',
        sort: '-popularity'
    });
    const [page, setPage] = useState(1);

    const debouncedFetch = useCallback(debounce((params, pageNum) => {
        dispatch(fetchMovies({ ...params, page: pageNum }));
    }, 400), [dispatch]);

    useEffect(() => {
        const activeFilters = { ...filters };
        if (activeFilters.genres.length > 0) {
            activeFilters.genres = activeFilters.genres.join(',');
        } else {
            delete activeFilters.genres;
        }

        Object.keys(activeFilters).forEach(key => {
            if (!activeFilters[key]) delete activeFilters[key];
        });

        debouncedFetch(activeFilters, page);

        return () => debouncedFetch.cancel();
    }, [filters, page, debouncedFetch]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleGenreChange = (genre) => {
        setFilters(prev => {
            const newGenres = prev.genres.includes(genre)
                ? prev.genres.filter(g => g !== genre)
                : [...prev.genres, genre];
            return { ...prev, genres: newGenres };
        });
        setPage(1);
    };
    
    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-8">
            <div className="max-w-screen-xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Filmleri Keşfet</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 p-6 bg-base-100 rounded-lg shadow-lg">
                    <div className="form-control md:col-span-2">
                        <label className="label"><span className="label-text">Film Ara</span></label>
                        <div className="relative">
                            <input type="text" name="search" placeholder="Örn: The Matrix" value={filters.search} onChange={handleFilterChange} className="input input-bordered w-full" />
                            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40"/>
                        </div>
                    </div>
                    <div className="form-control">
                         <label className="label"><span className="label-text">Sırala</span></label>
                         <select name="sort" value={filters.sort} onChange={handleFilterChange} className="select select-bordered">
                            <option value="-popularity">Popülerliğe Göre (Azalan)</option>
                            <option value="popularity">Popülerliğe Göre (Artan)</option>
                            <option value="-releaseDate">Yayın Tarihine Göre (Yeni)</option>
                            <option value="releaseDate">Yayın Tarihine Göre (Eski)</option>
                            <option value="-voteAverage">Puana Göre (Yüksek)</option>
                            <option value="voteAverage">Puana Göre (Düşük)</option>
                         </select>
                    </div>
                     <div className="form-control">
                        <label className="label"><span className="label-text">Yayın Yılı</span></label>
                        <input type="number" name="releaseYear" placeholder="Örn: 1999" value={filters.releaseYear} onChange={handleFilterChange} className="input input-bordered w-full" />
                    </div>
                    <div className="md:col-span-4">
                        <label className="label"><span className="label-text">Türler</span></label>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map(genre => (
                                <button key={genre} onClick={() => handleGenreChange(genre)} className={`btn btn-sm ${filters.genres.includes(genre) ? 'btn-primary' : 'btn-outline'}`}>
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                 {status === 'loading' && <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>}
                 {status === 'succeeded' && (
                    <>
                        <div className="mb-4 text-sm text-base-content/70">Toplam {total} sonuç bulundu.</div>
                        {movies.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {movies.map(movie => <MovieCard key={movie._id} movie={movie} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16">Aradığınız kriterlere uygun film bulunamadı.</div>
                        )}
                        <div className="flex justify-center mt-8">
                            <div className="join">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination?.prev} className="join-item btn">«</button>
                                <button className="join-item btn">Sayfa {page}</button>
                                <button onClick={() => setPage(p => p + 1)} disabled={!pagination?.next} className="join-item btn">»</button>
                            </div>
                        </div>
                    </>
                 )}
            </div>
        </div>
    );
};

export default MoviesPage;