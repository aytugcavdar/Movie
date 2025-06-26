// frontend/src/components/AddToWatchlistButton.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMovieToWatchlist, fetchWatchlists } from '../redux/watchlistSlice';
import { FiList, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AddToWatchlistButton = ({ movieId }) => {
    const dispatch = useDispatch();
    const { items: watchlists, status } = useSelector(state => state.watchlist);
    const { isAuthenticated } = useSelector(state => state.auth);

    // Watchlistleri yükle
    useEffect(() => {
        if (isAuthenticated && watchlists.length === 0) {
            dispatch(fetchWatchlists());
        }
    }, [dispatch, isAuthenticated, watchlists.length]);

    if (!isAuthenticated) return null;

    const handleAddMovie = async (watchlistId) => {
        try {
            await dispatch(addMovieToWatchlist({ watchlistId, movieId })).unwrap();
        } catch (error) {
            toast.error(error || "Film eklenirken hata oluştu!");
        }
    };

    if (status === 'loading') {
        return (
            <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-secondary btn-outline loading">
                    <FiPlus/> Listeye Ekle
                </button>
            </div>
        );
    }

    return (
        <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-secondary btn-outline">
                <FiPlus/> Listeye Ekle
            </button>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52 z-50">
                {watchlists && watchlists.length > 0 ? 
                    watchlists.map(list => (
                        <li key={list._id}>
                            <a onClick={() => handleAddMovie(list._id)} className="cursor-pointer">
                                <FiList className="w-4 h-4" />
                                {list.name}
                            </a>
                        </li>
                    )) : 
                    <li>
                        <span className="text-gray-500">Önce liste oluşturun</span>
                    </li>
                }
            </ul>
        </div>
    );
};

export default AddToWatchlistButton;