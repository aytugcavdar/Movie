// frontend/src/components/AddToWatchlistButton.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMovieToWatchlist } from '../redux/watchlistSlice';
import { FiList, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AddToWatchlistButton = ({ movieId }) => {
    const dispatch = useDispatch();
    const { items: watchlists, status } = useSelector(state => state.watchlist);
    const { isAuthenticated } = useSelector(state => state.auth);

    if (!isAuthenticated) return null;

    const handleAddMovie = (watchlistId) => {
        dispatch(addMovieToWatchlist({ watchlistId, movieId }));
    };

    return (
        <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-secondary btn-outline">
                <FiPlus/> Listeye Ekle
            </button>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52">
                {watchlists.length > 0 ? watchlists.map(list => (
                    <li key={list._id}>
                        <a onClick={() => handleAddMovie(list._id)}>{list.name}</a>
                    </li>
                )) : <li><a>Önce liste oluşturun</a></li>}
            </ul>
        </div>
    );
};

export default AddToWatchlistButton;