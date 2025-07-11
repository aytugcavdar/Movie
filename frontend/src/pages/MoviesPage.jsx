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
        yearRange: '', 
        rating: '',    
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

                {/* Gelişmiş Filtreleme Alanı */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-base-100 rounded-lg shadow-xl border border-base-300">
                    
                    {/* Arama */}
                    <div className="form-control md:col-span-2">
                        <label className="label"><span className="label-text font-semibold">Film Ara</span></label>
                        <div className="relative">
                            <input type="text" name="search" placeholder="Örn: The Matrix, Inception..." value={filters.search} onChange={handleFilterChange} className="input input-bordered w-full pl-10" />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"/>
                        </div>
                    </div>
                    
                    {/* Sıralama */}
                    <div className="form-control">
                         <label className="label"><span className="label-text font-semibold">Sırala</span></label>
                         <select name="sort" value={filters.sort} onChange={handleFilterChange} className="select select-bordered">
                            <option value="-popularity">Popülerliğe Göre (Azalan)</option>
                            <option value="popularity">Popülerliğe Göre (Artan)</option>
                            <option value="-releaseDate">Yayın Tarihine Göre (Yeni)</option>
                            <option value="releaseDate">Yayın Tarihine Göre (Eski)</option>
                            <option value="-voteAverage">Puana Göre (Yüksek)</option>
                            <option value="voteAverage">Puana Göre (Düşük)</option>
                         </select>
                    </div>

                    {/* Puan Aralığı */}
                     <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Puan Aralığı</span></label>
                        <input type="text" name="rating" placeholder="Örn: 7.5-9" value={filters.rating} onChange={handleFilterChange} className="input input-bordered w-full" />
                    </div>

                    {/* Yıl Aralığı */}
                     <div className="form-control lg:col-start-4">
                        <label className="label"><span className="label-text font-semibold">Yıl Aralığı</span></label>
                        <input type="text" name="yearRange" placeholder="Örn: 1990-2000" value={filters.yearRange} onChange={handleFilterChange} className="input input-bordered w-full" />
                    </div>

                    {/* Türler */}
                    <div className="lg:col-span-4 md:col-span-2">
                        <label className="label"><span className="label-text font-semibold">Türler</span></label>
                        <div className="flex flex-wrap gap-2 p-2 bg-base-200 rounded-md">
                            {GENRES.map(genre => (
                                <button key={genre} onClick={() => handleGenreChange(genre)} className={`btn btn-sm transition-all duration-200 ${filters.genres.includes(genre) ? 'btn-primary' : 'btn-ghost'}`}>
                                    {filters.genres.includes(genre) && '✓'} {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                 {/* Sonuçlar */}
                 {status === 'loading' && <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>}
                 {status === 'succeeded' && (
                    <>
                        <div className="mb-4 text-sm text-base-content/70">Toplam <span className="font-bold text-primary">{total}</span> sonuç bulundu.</div>
                        {movies.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {movies.map(movie => <MovieCard key={movie._id} movie={movie} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-base-100 rounded-lg shadow-inner">
                                <p className="text-xl font-semibold">Sonuç Bulunamadı</p>
                                <p className="text-base-content/70 mt-2">Aradığınız kriterlere uygun film bulunamadı. Lütfen filtrelerinizi değiştirmeyi deneyin.</p>
                            </div>
                        )}

                        {/* Sayfalama */}
                        {pagination && total > (pagination.limit || 20) && (
                            <div className="flex justify-center mt-8">
                                <div className="join">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination?.prev} className="join-item btn">«</button>
                                    <button className="join-item btn pointer-events-none">Sayfa {page}</button>
                                    <button onClick={() => setPage(p => p + 1)} disabled={!pagination?.next} className="join-item btn">»</button>
                                </div>
                            </div>
                        )}
                    </>
                 )}
            </div>
        </div>
    );
};

export default MoviesPage;