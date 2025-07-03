
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWatchlists, createWatchlist, updateWatchlist, deleteWatchlist } from '../redux/watchlistSlice'; // updateWatchlist ve deleteWatchlist eklendi
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { FiPlus, FiList, FiEye, FiLock, FiEdit, FiTrash2, FiAlertTriangle } from 'react-icons/fi'; // FiEdit, FiTrash2, FiAlertTriangle eklendi
import { toast } from 'react-toastify'; // toast import edildi

const WatchlistPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: watchlists, status } = useSelector(state => state.watchlist);
    const { isAuthenticated } = useSelector(state => state.auth);

    const [newListName, setNewListName] = useState('');
    const [newListDesc, setNewListDesc] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    // Düzenleme için yeni state'ler
    const [editingWatchlist, setEditingWatchlist] = useState(null);
    const [editListName, setEditListName] = useState('');
    const [editListDesc, setEditListDesc] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(true);

    // Silme için yeni state
    const [watchlistToDelete, setWatchlistToDelete] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchWatchlists());
        } else {
            navigate('/auth');
        }
    }, [dispatch, isAuthenticated, navigate]);

    const handleCreateList = (e) => {
        e.preventDefault();
        if(!newListName.trim()) {
            toast.error("Liste adı boş olamaz.");
            return;
        }
        dispatch(createWatchlist({ name: newListName, description: newListDesc, isPublic: isPublic }));
        setNewListName('');
        setNewListDesc('');
        setIsPublic(true);
        document.getElementById('create_list_modal').close();
    };

    // Düzenleme modalını açma fonksiyonu
    const handleEditClick = (list) => {
        setEditingWatchlist(list);
        setEditListName(list.name);
        setEditListDesc(list.description || '');
        setEditIsPublic(list.isPublic);
        document.getElementById('edit_list_modal').showModal(); // Yeni bir modal ID'si
    };

    // Düzenleme formunu gönderme fonksiyonu
    const handleUpdateList = (e) => {
        e.preventDefault();
        if (!editListName.trim()) {
            toast.error("Liste adı boş olamaz.");
            return;
        }
        if (editingWatchlist) {
            dispatch(updateWatchlist({
                watchlistId: editingWatchlist._id,
                watchlistData: {
                    name: editListName,
                    description: editListDesc,
                    isPublic: editIsPublic
                }
            }))
            .unwrap()
            .then(() => {
                document.getElementById('edit_list_modal').close();
                setEditingWatchlist(null); // Modalı kapattıktan sonra state'i sıfırla
            })
            .catch(err => toast.error(err));
        }
    };

    // Silme onay modalını açma fonksiyonu
    const handleDeleteClick = (list) => {
        setWatchlistToDelete(list);
        document.getElementById('delete_modal').showModal();
    };

    // Silme işlemini onaylama fonksiyonu
    const confirmDelete = () => {
        if (watchlistToDelete) {
            dispatch(deleteWatchlist(watchlistToDelete._id))
                .unwrap()
                .then(() => {
                    toast.success(`"${watchlistToDelete.name}" izleme listesi başarıyla silindi.`);
                    setWatchlistToDelete(null); // Modalı kapattıktan sonra state'i sıfırla
                })
                .catch((err) => {
                    toast.error(`Liste silinemedi: ${err}`);
                });
        }
    };


    if (status === 'loading' && watchlists.length === 0) return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold flex items-center gap-3"><FiList size={32} /> İzleme Listelerim</h1>
                    <button className="btn btn-primary" onClick={() => document.getElementById('create_list_modal').showModal()}>
                        <FiPlus /> Yeni Liste Oluştur
                    </button>
                </div>

                {watchlists.length === 0 ? (
                    <div className="text-center py-16 bg-base-100 rounded-lg shadow-inner">
                        <p className="text-lg mb-2">Henüz bir izleme listeniz yok. Hemen bir tane oluşturun!</p>
                        <p className="opacity-70 max-w-md mx-auto">
                            İzlemek istediğiniz filmleri takip etmek veya favorilerinizi saklamak için ideal.
                        </p>
                        <button className="btn btn-secondary mt-6" onClick={() => document.getElementById('create_list_modal').showModal()}>
                            <FiPlus /> İlk İzleme Listenizi Oluşturun
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {watchlists.map(list => (
                            <div key={list._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border border-base-300">
                                <div className="card-body p-6">
                                    <h2 className="card-title text-2xl mb-2 flex justify-between items-center">
                                        {list.name}
                                        <div className="flex items-center gap-2">
                                            {list.isPublic ? <FiEye className="text-success text-lg" title="Herkese Açık" /> : <FiLock className="text-error text-lg" title="Gizli" />}
                                            {/* Düzenle Butonu */}
                                            <button
                                                className="btn btn-ghost btn-sm btn-circle"
                                                onClick={() => handleEditClick(list)}
                                                title="Listeyi Düzenle"
                                            >
                                                <FiEdit size={18} />
                                            </button>
                                            {/* Sil Butonu */}
                                            <button
                                                className="btn btn-ghost btn-sm btn-circle text-error"
                                                onClick={() => handleDeleteClick(list)}
                                                title="Listeyi Sil"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </h2>
                                    <p className="text-base-content/70 text-sm mb-4 line-clamp-2">{list.description || "Bu izleme listesinin henüz bir açıklaması yok."}</p>

                                    {list.movies.length > 0 ? (
                                        <>
                                            <div className="divider"></div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                                {list.movies.slice(0, 6).map(item => <MovieCard key={item.movie._id} movie={item.movie} />)}
                                            </div>
                                            {list.movies.length > 6 && (
                                                <div className="text-center mt-4">
                                                    <span className="text-base-content/60">... ve {list.movies.length - 6} film daha</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-4 text-base-content/70">Bu listede henüz film yok.</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Yeni Liste Oluşturma Modalı */}
                <dialog id="create_list_modal" className="modal modal-middle sm:modal-middle">
                    <div className="modal-box p-6">
                        <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
                        <h3 className="font-bold text-2xl mb-4 text-center">Yeni İzleme Listesi Oluştur</h3>
                        <form onSubmit={handleCreateList} className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Liste Adı</span></label>
                                <input type="text" placeholder="Örn: İzlenecekler Listem" className="input input-bordered w-full" value={newListName} onChange={(e) => setNewListName(e.target.value)} required />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Açıklama (İsteğe Bağlı)</span></label>
                                <textarea placeholder="Bu izleme listesi ne hakkında?" className="textarea textarea-bordered w-full h-24" value={newListDesc} onChange={(e) => setNewListDesc(e.target.value)}></textarea>
                            </div>
                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">Herkese Açık Yap</span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                    />
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary w-full" disabled={status === 'loading'}>
                                {status === 'loading' ? <span className="loading loading-spinner"></span> : "Listeyi Oluştur"}
                            </button>
                        </form>
                    </div>
                </dialog>

                {/* İzleme Listesi Düzenleme Modalı */}
                <dialog id="edit_list_modal" className="modal modal-middle sm:modal-middle">
                    <div className="modal-box p-6">
                        <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
                        <h3 className="font-bold text-2xl mb-4 text-center">İzleme Listesini Düzenle</h3>
                        <form onSubmit={handleUpdateList} className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Liste Adı</span></label>
                                <input type="text" placeholder="Liste adı" className="input input-bordered w-full" value={editListName} onChange={(e) => setEditListName(e.target.value)} required />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Açıklama (İsteğe Bağlı)</span></label>
                                <textarea placeholder="Liste açıklaması" className="textarea textarea-bordered w-full h-24" value={editListDesc} onChange={(e) => setEditListDesc(e.target.value)}></textarea>
                            </div>
                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">Herkese Açık Yap</span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={editIsPublic}
                                        onChange={(e) => setEditIsPublic(e.target.checked)}
                                    />
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary w-full" disabled={status === 'loading'}>
                                {status === 'loading' ? <span className="loading loading-spinner"></span> : "Listeyi Güncelle"}
                            </button>
                        </form>
                    </div>
                </dialog>

                {/* Silme Onay Modalı */}
                <dialog id="delete_modal" className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg flex items-center gap-2"><FiAlertTriangle className="text-error" /> Listeyi Sil</h3>
                        <p className="py-4">
                            "<strong>{watchlistToDelete?.name}</strong>" izleme listesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div className="modal-action">
                            <form method="dialog">
                                <button className="btn">İptal</button>
                                <button className="btn btn-error ml-2" onClick={confirmDelete}>Evet, Sil</button>
                            </form>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
    );
};

export default WatchlistPage;