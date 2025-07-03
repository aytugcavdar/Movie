// frontend/src/pages/ListsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLists, createList } from '../redux/listSlice';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiList, FiHeart, FiEye } from 'react-icons/fi'; // Yeni ikonlar eklendi
import { toast } from 'react-toastify';

const ListsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { lists, status } = useSelector(state => state.list);
    const { isAuthenticated } = useSelector(state => state.auth);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true); // isPublic state'i eklendi

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
        if(!title.trim()) { // Başlık boşluklardan ibaret olamaz
            toast.error("Liste başlığı boş olamaz.");
            return;
        }
        dispatch(createList({ title, description, isPublic })) // isPublic eklendi
            .unwrap()
            .then(() => {
                setTitle('');
                setDescription('');
                setIsPublic(true); // Modalı kapattıktan sonra varsayılan değere sıfırla
                document.getElementById('create_list_modal').close();
            })
            .catch(err => toast.error(err));
    };

    if (status === 'loading' && lists.length === 0) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    }

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold flex items-center gap-3"><FiList size={32} /> Listelerim</h1> {/* İkon eklendi */}
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
                        {lists.map(list => (
                            <div key={list._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border border-base-300"> {/* Kenarlık eklendi */}
                                <div className="card-body p-6"> {/* Padding artırıldı */}
                                    <h2 className="card-title text-2xl mb-2 flex justify-between items-center">
                                        {list.title}
                                        {list.isPublic ? <FiEye className="text-success text-lg" title="Herkese Açık" /> : <FiLock className="text-error text-lg" title="Gizli" />}
                                    </h2>
                                    <p className="text-base-content/70 text-sm mb-4 line-clamp-2">{list.description || "Bu listenin henüz bir açıklaması yok."}</p> {/* Okunabilirlik için line-clamp eklendi */}
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
                        ))}
                    </div>
                )}
            </div>
            
            <dialog id="create_list_modal" className="modal modal-middle sm:modal-middle"> {/* Responsive modal boyutu */}
                <div className="modal-box p-6"> {/* Padding ayarı */}
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
        </div>
    );
};

export default ListsPage;