
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLists, createList, updateList, deleteList } from '../redux/listSlice'; 
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiList, FiHeart, FiEye, FiLock, FiEdit, FiTrash2, FiAlertTriangle,FiFilm } from 'react-icons/fi'; 
import { toast } from 'react-toastify';

const ListsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { lists, status } = useSelector(state => state.list);
    const { isAuthenticated, user: currentUser } = useSelector(state => state.auth); 
    console.log("ListsPage component rendered",lists);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    // Düzenleme için yeni state'ler
    const [editingList, setEditingList] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(true);

    // Silme için yeni state
    const [listToDelete, setListToDelete] = useState(null);

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
        if(!title.trim()) {
            toast.error("Liste başlığı boş olamaz.");
            return;
        }
        dispatch(createList({ title, description, isPublic }))
            .unwrap()
            .then(() => {
                setTitle('');
                setDescription('');
                setIsPublic(true);
                document.getElementById('create_list_modal').close();
            })
            .catch(err => toast.error(err));
    };

    // Düzenleme modalını açma fonksiyonu
    const handleEditClick = (list) => {
        setEditingList(list);
        setEditTitle(list.title);
        setEditDescription(list.description || '');
        setEditIsPublic(list.isPublic);
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
                setEditingList(null);
            })
            .catch(err => toast.error(err));
        }
    };

    // Silme onay modalını açma fonksiyonu
    const handleDeleteClick = (list) => {
        setListToDelete(list);
        document.getElementById('delete_modal').showModal();
    };

    // Silme işlemini onaylama fonksiyonu
    const confirmDelete = () => {
        if (listToDelete) {
            dispatch(deleteList(listToDelete._id))
                .unwrap()
                .then(() => {
                    toast.success(`"${listToDelete.title}" listesi başarıyla silindi.`);
                    setListToDelete(null);
                })
                .catch((err) => {
                    toast.error(`Liste silinemedi: ${err}`);
                });
        }
    };

    if (status === 'loading' && lists.length === 0) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    }

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold flex items-center gap-3"><FiList size={32} /> Listelerim</h1>
                    <button className="btn btn-primary" onClick={() => document.getElementById('create_list_modal').showModal()}>
                        <FiPlus /> Yeni Liste Oluştur
                    </button>
                </div>

                {lists.length === 0 ? (
                    <div className="text-center py-16 bg-base-100 rounded-lg shadow-inner">
                        <p className="text-lg mb-2">Henüz bir liste oluşturmadınız. Hiç problem değil!</p>
                        <p className="opacity-70 max-w-md mx-auto">
                            Film zevkinizi yansıtan "İzlediklerim", "Favorilerim" veya "İzlenecekler" gibi bir listeyle başlayabilirsiniz.
                        </p>
                        <button className="btn btn-secondary mt-6" onClick={() => document.getElementById('create_list_modal').showModal()}>
                            <FiPlus /> İlk Listenizi Oluşturun
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lists.map(list => {
                            const canEditOrDelete = currentUser && currentUser.id === list.user; // Liste sahibini kontrol et

                            return (
                                <div key={list._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border border-base-300">
                                    <div className="card-body p-6">
                                        <h2 className="card-title text-2xl mb-2 flex justify-between items-center">
                                            {list.title}
                                            <div className="flex items-center gap-2">
                                                {list.isPublic ? <FiEye className="text-success text-lg" title="Herkese Açık" /> : <FiLock className="text-error text-lg" title="Gizli" />}
                                                {canEditOrDelete && (
                                                    <button
                                                        className="btn btn-ghost btn-sm btn-circle"
                                                        onClick={() => handleEditClick(list)}
                                                        title="Listeyi Düzenle"
                                                    >
                                                        <FiEdit size={18} />
                                                    </button>
                                                )}
                                                {canEditOrDelete && (
                                                    <button
                                                        className="btn btn-ghost btn-sm btn-circle text-error"
                                                        onClick={() => handleDeleteClick(list)}
                                                        title="Listeyi Sil"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </h2>
                                        <p className="text-base-content/70 text-sm mb-4 line-clamp-2">{list.description || "Bu listenin henüz bir açıklaması yok."}</p>
                                        <div className="flex items-center gap-2 text-sm text-base-content/60 mb-2">
                                            <FiFilm />
                                            <span>{list.movies.length} film</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-base-content/60">
                                            <FiHeart />
                                            <span>{list.likesCount || 0} beğeni</span>
                                        </div>
                                        <div className="card-actions justify-end mt-4">
                                            <Link to={`/lists/${list._id}`} className="btn btn-primary btn-outline btn-sm">Listeyi Görüntüle</Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <dialog id="create_list_modal" className="modal modal-middle sm:modal-middle">
                <div className="modal-box p-6">
                    <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
                    <h3 className="font-bold text-2xl mb-4 text-center">Yeni Liste Oluştur</h3>
                    <form onSubmit={handleCreateList} className="space-y-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Liste Başlığı</span></label>
                            <input type="text" placeholder="Örn: Favori Bilim Kurgu Filmlerim" className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Açıklama (İsteğe Bağlı)</span></label>
                            <textarea placeholder="Bu listenin ne hakkında olduğunu kısaca açıklayın..." className="textarea textarea-bordered w-full h-24" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
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

export default ListsPage;