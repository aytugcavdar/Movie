// frontend/src/pages/WatchlistPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWatchlists, createWatchlist } from '../redux/watchlistSlice';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { FiPlus, FiTrash, FiEye, FiLock } from 'react-icons/fi';

const WatchlistPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: watchlists, status } = useSelector(state => state.watchlist);
    const { isAuthenticated } = useSelector(state => state.auth);

    const [newListName, setNewListName] = useState('');
    const [newListDesc, setNewListDesc] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchWatchlists());
        } else {
            navigate('/auth');
        }
    }, [dispatch, isAuthenticated, navigate]);

    const handleCreateList = (e) => {
        e.preventDefault();
        dispatch(createWatchlist({ name: newListName, description: newListDesc }));
        setNewListName('');
        setNewListDesc('');
        document.getElementById('create_list_modal').close();
    };

    if (status === 'loading') return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">İzleme Listelerim</h1>
                    <button className="btn btn-primary" onClick={() => document.getElementById('create_list_modal').showModal()}>
                        <FiPlus /> Yeni Liste Oluştur
                    </button>
                </div>

                {watchlists.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-lg">Henüz bir izleme listeniz yok.</p>
                        <p className="opacity-70">Hemen bir tane oluşturun!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {watchlists.map(list => (
                            <div key={list._id} className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl">{list.name}</h2>
                                    <p>{list.description}</p>
                                    <div className="divider"></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {list.movies.slice(0, 5).map(item => <MovieCard key={item.movie._id} movie={item.movie} />)}
                                        {list.movies.length > 5 && <div className="flex items-center justify-center">... ve {list.movies.length - 5} daha</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Yeni Liste Oluşturma Modalı */}
            <dialog id="create_list_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg mb-4">Yeni İzleme Listesi</h3>
                    <form onSubmit={handleCreateList} className="space-y-4">
                        <input type="text" placeholder="Liste Adı" className="input input-bordered w-full" value={newListName} onChange={(e) => setNewListName(e.target.value)} required />
                        <textarea placeholder="Açıklama (isteğe bağlı)" className="textarea textarea-bordered w-full" value={newListDesc} onChange={(e) => setNewListDesc(e.target.value)}></textarea>
                        <button type="submit" className="btn btn-primary w-full">Oluştur</button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default WatchlistPage;