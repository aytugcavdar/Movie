import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListById, removeMovieFromList, likeList, updateList, deleteList, reportList, addCommentToList } from '../redux/listSlice';
import MovieCard from '../components/MovieCard';
import { FiArrowLeft, FiTrash2, FiHeart, FiEdit, FiEye, FiLock, FiAlertTriangle, FiFlag, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MentionTextarea from '../components/MentionTextarea';
import { renderMentions } from '../utils/renderMentions';

const ListDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { selectedList, status, error } = useSelector(state => state.list);
    const { user: currentUser, isAuthenticated } = useSelector(state => state.auth);

    const [editingList, setEditingList] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(true);
    const [listToDelete, setListToDelete] = useState(null);
    const [commentContent, setCommentContent] = useState('');

    useEffect(() => {
        dispatch(fetchListById(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedList) {
            setEditingList(selectedList);
            setEditTitle(selectedList.title);
            setEditDescription(selectedList.description || '');
            setEditIsPublic(selectedList.isPublic);
        }
    }, [selectedList]);

    const handleLikeList = () => {
        if (!isAuthenticated) {
            toast.error("Beğenmek için giriş yapmalısınız.");
            return;
        }
        dispatch(likeList(id));
    };

    const handleReportList = () => {
        if (!isAuthenticated) {
            toast.error("Listeyi raporlamak için giriş yapmalısınız.");
            return;
        }
        if (currentUser && selectedList.user === currentUser.id) {
            toast.warn("Kendi listenizi raporlayamazsınız.");
            return;
        }
        if (window.confirm("Bu listeyi raporlamak istediğinizden emin misiniz?")) {
            dispatch(reportList(id));
        }
    };

    const handleRemoveMovie = (movieId) => {
        if(window.confirm("Bu filmi listeden kaldırmak istediğinize emin misiniz?")) {
            dispatch(removeMovieFromList({ listId: id, movieId }));
        }
    };

    const handleEditClick = () => {
        document.getElementById('edit_list_modal').showModal();
    };

    const handleUpdateList = (e) => {
        e.preventDefault();
        if (!editTitle.trim()) {
            toast.error("Liste başlığı boş olamaz.");
            return;
        }
        if (editingList) {
            dispatch(updateList({ listId: editingList._id, listData: { title: editTitle, description: editDescription, isPublic: editIsPublic }}))
                .unwrap()
                .then(() => document.getElementById('edit_list_modal').close())
                .catch(err => toast.error(err));
        }
    };

    const handleDeleteClick = () => {
        setListToDelete(selectedList);
        document.getElementById('delete_modal').showModal();
    };

    const confirmDelete = () => {
        if (listToDelete) {
            dispatch(deleteList(listToDelete._id))
                .unwrap()
                .then(() => {
                    toast.success(`"${listToDelete.title}" listesi başarıyla silindi.`);
                    navigate('/lists');
                })
                .catch((err) => toast.error(`Liste silinemedi: ${err}`));
        }
    };
    
    const handleAddComment = (e) => {
        e.preventDefault();
        if (!commentContent.trim()) {
            toast.error("Yorum içeriği boş olamaz.");
            return;
        }
        dispatch(addCommentToList({ listId: id, content: commentContent }))
            .unwrap()
            .then(() => {
                setCommentContent('');
                toast.success("Yorumunuz eklendi.");
                dispatch(fetchListById(id)); // Yorum sonrası listeyi yenile
            })
            .catch(err => toast.error(err));
    };

    if (status === 'loading') {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    if (error || !selectedList) {
        return <div className="alert alert-error">Hata: {error || "Liste bulunamadı."}</div>;
    }

    const canEdit = currentUser && selectedList.user?._id === currentUser.id;
    const canReport = isAuthenticated && currentUser && selectedList.user?._id !== currentUser.id;

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
                            {canEdit && <button className="btn btn-ghost btn-sm btn-circle" onClick={handleEditClick} title="Listeyi Düzenle"><FiEdit size={18} /></button>}
                            {canEdit && <button className="btn btn-ghost btn-sm btn-circle text-error" onClick={handleDeleteClick} title="Listeyi Sil"><FiTrash2 size={18} /></button>}
                            {canReport && <button className="btn btn-ghost btn-sm btn-circle text-warning" onClick={handleReportList} title="Listeyi Raporla"><FiFlag size={18} /></button>}
                        </div>
                    </div>
                </div>

                {selectedList.movies.length === 0 ? (
                    <div className="text-center py-16 bg-base-100 rounded-lg shadow-inner"><p className="text-xl">Bu listede henüz film yok.</p></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {selectedList.movies.map(({ movie }) => (
                            <div key={movie._id} className="relative group">
                                <MovieCard movie={movie} />
                                {canEdit && <button onClick={() => handleRemoveMovie(movie._id)} className="btn btn-sm btn-circle btn-error absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"><FiTrash2 /></button>}
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Yorumlar Bölümü */}
                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <FiMessageSquare /> Yorumlar ({selectedList.comments?.length || 0})
                    </h2>
                    {isAuthenticated && (
                        <div className="card bg-base-100 shadow-xl mb-8">
                            <div className="card-body">
                                <form onSubmit={handleAddComment}>
                                    <div className="form-control">
                                        <MentionTextarea value={commentContent} onChange={setCommentContent} placeholder="Bu liste hakkında bir yorum yazın..." />
                                    </div>
                                    <div className="card-actions justify-end mt-4">
                                        <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>Yorum Yap</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    <div className="space-y-4">
                        {selectedList.comments && [...selectedList.comments].reverse().map(comment => (
                            <div key={comment._id} className="chat chat-start">
                                <div className="chat-image avatar">
                                    <div className="w-10 rounded-full">
                                        <img src={comment.user.avatar?.url || `https://ui-avatars.com/api/?name=${comment.user.username}`} alt="avatar"/>
                                    </div>
                                </div>
                                <div className="chat-header">
                                    <Link to={`/users/${comment.user.username}`} className="font-bold link-hover">{comment.user.username}</Link>
                                </div>
                                <div className="chat-bubble">{renderMentions(comment.content)}</div>
                                <div className="chat-footer opacity-50 text-xs">{new Date(comment.createdAt).toLocaleString('tr-TR')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <dialog id="edit_list_modal" className="modal"><div className="modal-box"><form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form><h3 className="font-bold text-lg">Listeyi Düzenle</h3><form onSubmit={handleUpdateList} className="space-y-4 mt-4"><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input input-bordered w-full" required /><textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="textarea textarea-bordered w-full h-24"></textarea><label className="label cursor-pointer"><span className="label-text">Herkese Açık</span><input type="checkbox" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} className="toggle toggle-primary" /></label><button type="submit" className="btn btn-primary w-full">Güncelle</button></form></div></dialog>
            <dialog id="delete_modal" className="modal"><div className="modal-box"><h3 className="font-bold text-lg text-error">Listeyi Sil</h3><p className="py-4">"{listToDelete?.title}" listesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p><div className="modal-action"><form method="dialog"><button className="btn">İptal</button><button className="btn btn-error ml-2" onClick={confirmDelete}>Evet, Sil</button></form></div></div></dialog>
        </div>
    );
};

export default ListDetail;