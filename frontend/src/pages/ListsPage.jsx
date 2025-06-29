
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLists, createList } from '../redux/listSlice';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiList } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ListsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { lists, status } = useSelector(state => state.list);
    const { isAuthenticated } = useSelector(state => state.auth);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchLists());
        } else {
            toast.error("Listeleri görmek için giriş yapmalısınız.");
            navigate('/auth');
        }
    }, [dispatch, isAuthenticated, navigate]);

    const handleCreateList = (e) => {
        e.preventDefault();
        if(!title) return toast.error("Liste başlığı boş olamaz.");
        dispatch(createList({ title, description }))
            .unwrap()
            .then(() => {
                setTitle('');
                setDescription('');
                document.getElementById('create_list_modal').close();
            })
            .catch(err => toast.error(err));
    };

    if (status === 'loading' && lists.length === 0) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Listelerim</h1>
                    <button className="btn btn-primary" onClick={() => document.getElementById('create_list_modal').showModal()}>
                        <FiPlus /> Yeni Liste Oluştur
                    </button>
                </div>

                {lists.length === 0 ? (
                    <div className="text-center py-16 bg-base-100 rounded-lg shadow-inner">
                        <p className="text-lg">Henüz bir liste oluşturmadınız.</p>
                        <p className="opacity-70">"İzlediklerim" veya "Favorilerim" gibi bir listeyle başlayın!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lists.map(list => (
                            <div key={list._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                                <div className="card-body">
                                    <h2 className="card-title">{list.title}</h2>
                                    <p className="text-base-content/60">{list.description || "Açıklama yok."}</p>
                                    <div className="card-actions justify-between items-center mt-4">
                                        <div className="badge badge-outline">{list.movies.length} film</div>
                                        <Link to={`/lists/${list._id}`} className="btn btn-sm btn-primary btn-outline">Detaylar</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <dialog id="create_list_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
                    <h3 className="font-bold text-lg mb-4">Yeni Liste Oluştur</h3>
                    <form onSubmit={handleCreateList} className="space-y-4">
                        <input type="text" placeholder="Liste Başlığı" className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <textarea placeholder="Açıklama (isteğe bağlı)" className="textarea textarea-bordered w-full" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        <button type="submit" className="btn btn-primary w-full" disabled={status === 'loading'}>
                            {status === 'loading' ? <span className="loading loading-spinner"></span> : "Oluştur"}
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default ListsPage;