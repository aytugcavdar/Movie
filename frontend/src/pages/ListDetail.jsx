
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListById, removeMovieFromList, likeList, updateList, deleteList } from '../redux/listSlice'; // updateList ve deleteList eklendi
import MovieCard from '../components/MovieCard';
import { FiArrowLeft, FiTrash2, FiHeart, FiEdit, FiEye, FiLock, FiAlertTriangle } from 'react-icons/fi'; // FiEdit, FiEye, FiLock, FiAlertTriangle eklendi
import { toast } from 'react-toastify';

const ListDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { selectedList, status, error } = useSelector(state => state.list);
    const { user: currentUser, isAuthenticated } = useSelector(state => state.auth);

    // Düzenleme için yeni state'ler
    const [editingList, setEditingList] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(true);

    // Silme için yeni state
    const [listToDelete, setListToDelete] = useState(null);

    const handleLikeList = () => {
        if (!isAuthenticated) {
            toast.error("Beğenmek için giriş yapmalısınız.");
            return;
        }
        dispatch(likeList(id));
    };

    useEffect(() => {
        dispatch(fetchListById(id));
    }, [dispatch, id]);

    // Liste verileri yüklendiğinde düzenleme formunu doldur
    useEffect(() => {
        if (selectedList) {
            setEditingList(selectedList);
            setEditTitle(selectedList.title);
            setEditDescription(selectedList.description || '');
            setEditIsPublic(selectedList.isPublic);
        }
    }, [selectedList]);

    const handleRemoveMovie = (movieId) => {
        if(window.confirm("Bu filmi listeden kaldırmak istediğinize emin misiniz?")) {
            dispatch(removeMovieFromList({ listId: id, movieId }));
        }
    };

    // Düzenleme modalını açma fonksiyonu
    const handleEditClick = () => {
        document.getElementById('edit_list_modal').showModal();
    };

    // Düzenleme formunu gönderme fonksiyonu
    const handleUpdateList = (e) => {
        e.preventDefault();
        if (!editTitle.trim()) {
            toast.error("Liste başlığı boş olamaz.");
            return;
        }
        if (editingList) {
            dispatch(updateList({
                listId: editingList._id,
                listData: {
                    title: editTitle,
                    description: editDescription,
                    isPublic: editIsPublic
                }
            }))
            .unwrap()
            .then(() => {
                document.getElementById('edit_list_modal').close();
                // selectedList otomatik olarak güncellenecek, ayrı bir setleme gerekmez
            })
            .catch(err => toast.error(err));
        }
    };

    // Silme onay modalını açma fonksiyonu
    const handleDeleteClick = () => {
        setListToDelete(selectedList);
        document.getElementById('delete_modal').showModal();
    };

    // Silme işlemini onaylama fonksiyonu
    const confirmDelete = () => {
        if (listToDelete) {
            dispatch(deleteList(listToDelete._id))
                .unwrap()
                .then(() => {
                    toast.success(`"${listToDelete.title}" listesi başarıyla silindi.`);
                    navigate('/lists'); // Liste silindikten sonra listeler sayfasına yönlendir
                })
                .catch((err) => {
                    toast.error(`Liste silinemedi: ${err}`);
                });
        }
    };

    if (status === 'loading') {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    if (error || !selectedList) {
        return <div className="alert alert-error">Hata: {error || "Liste bulunamadı."}</div>;
    }

    // Liste sahibinin bu listeyi düzenleyip düzenleyemeyeceğini kontrol et
    const canEdit = currentUser && currentUser.id === selectedList.user;

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => navigate('/lists')} className="btn btn-ghost mb-4">
                    <FiArrowLeft /> Listelerime Dön
                </button>

                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold">{selectedList.title}</h1>
                            <p className="text-lg text-base-content/70 mt-2">{selectedList.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                                {selectedList.isPublic ? <FiEye className="text-success text-lg" title="Herkese Açık" /> : <FiLock className="text-error text-lg" title="Gizli" />}
                                <span className="text-sm text-base-content/60">{selectedList.isPublic ? 'Herkese Açık' : 'Gizli'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleLikeList} className="btn btn-ghost">
                                <FiHeart className="text-red-500" />
                                {selectedList.likesCount || 0}
                            </button>
                            {canEdit && (
                                <button
                                    className="btn btn-ghost btn-sm btn-circle"
                                    onClick={handleEditClick}
                                    title="Listeyi Düzenle"
                                >
                                    <FiEdit size={18} />
                                </button>
                            )}
                            {canEdit && (
                                <button
                                    className="btn btn-ghost btn-sm btn-circle text-error"
                                    onClick={handleDeleteClick}
                                    title="Listeyi Sil"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {selectedList.movies.length === 0 ? (
                    <div className="text-center py-16 bg-base-100 rounded-lg shadow-inner">
                        <p className="text-xl">Bu listede henüz film yok.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {selectedList.movies.map(({ movie }) => (
                            <div key={movie._id} className="relative group">
                                <MovieCard movie={movie} />
                                {canEdit && ( // Sadece liste sahibi filmleri kaldırabilir
                                     <button
                                        onClick={() => handleRemoveMovie(movie._id)}
                                        className="btn btn-sm btn-circle btn-error absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                        <FiTrash2 />
                                     </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Genel Liste Düzenleme Modalı */}
            <dialog id="edit_list_modal" className="modal modal-middle sm:modal-middle">
                <div className="modal-box p-6">
                    <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
                    <h3 className="font-bold text-2xl mb-4 text-center">Listeyi Düzenle</h3>
                    <form onSubmit={handleUpdateList} className="space-y-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Liste Başlığı</span></label>
                            <input type="text" placeholder="Liste başlığı" className="input input-bordered w-full" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Açıklama (İsteğe Bağlı)</span></label>
                            <textarea placeholder="Liste açıklaması" className="textarea textarea-bordered w-full h-24" value={editDescription} onChange={(e) => setEditDescription(e.target.value)}></textarea>
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
                        "<strong>{listToDelete?.title}</strong>" listesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
    );
};

export default ListDetail;