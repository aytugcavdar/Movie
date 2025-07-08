import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchReviewsForModeration, 
    updateReviewModeration, 
    fetchListsForModeration, 
    updateListModeration 
} from '../../redux/adminSlice';
import { FiCheckCircle, FiXCircle, FiInfo, FiMessageSquare, FiList, FiFilm, FiUser, FiHash, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ContentModeration = () => {
    const dispatch = useDispatch();
    const { reviewsForModeration, listsForModeration, status } = useSelector(state => state.admin);
    const [activeTab, setActiveTab] = useState('reviews'); 
    const [selectedItem, setSelectedItem] = useState(null); // Modal için seçilen öğe

    useEffect(() => {
        // Aktif sekmeye göre ilgili veriyi çek
        if (activeTab === 'reviews') {
            dispatch(fetchReviewsForModeration());
        } else {
            dispatch(fetchListsForModeration());
        }
    }, [dispatch, activeTab]);

    const handleReviewModeration = (reviewId, moderationStatus) => {
        dispatch(updateReviewModeration({ reviewId, moderationStatus }))
            .unwrap()
            .then(() => {
                toast.success(`Yorum başarıyla ${moderationStatus === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
                // Listeyi yeniden çekmek yerine state'den çıkarmak daha performanslı olabilir, ama yeniden çekmek en güncel hali garantiler.
                dispatch(fetchReviewsForModeration());
            })
            .catch(err => toast.error(err));
    };

    const handleListModeration = (listId, moderationStatus) => {
        dispatch(updateListModeration({ listId, moderationStatus }))
            .unwrap()
            .then(() => {
                toast.success(`Liste başarıyla ${moderationStatus === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
                dispatch(fetchListsForModeration());
            })
            .catch(err => toast.error(err));
    };

    // Detayları görmek için modalı açan fonksiyon
    const viewDetails = (item, type) => {
        setSelectedItem({ ...item, itemType: type });
        document.getElementById('details_modal').showModal();
    };


    if (status === 'loading' && !reviewsForModeration.length && !listsForModeration.length) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center flex items-center justify-center gap-3">
                    <FiInfo /> İçerik Moderasyonu
                </h1>

                {/* Sekmeler */}
                <div role="tablist" className="tabs tabs-boxed tabs-lg mb-8 bg-base-100 shadow">
                    <a role="tab" className={`tab ${activeTab === 'reviews' ? 'tab-active' : ''}`} onClick={() => setActiveTab('reviews')}>
                        <FiMessageSquare className="mr-2" /> Yorumlar ({reviewsForModeration.length})
                    </a>
                    <a role="tab" className={`tab ${activeTab === 'lists' ? 'tab-active' : ''}`} onClick={() => setActiveTab('lists')}>
                        <FiList className="mr-2" /> Listeler ({listsForModeration.length})
                    </a>
                </div>

                {/* Yorumlar Sekmesi */}
                {activeTab === 'reviews' && (
                    <div className="space-y-6">
                        {reviewsForModeration.length > 0 ? (
                            reviewsForModeration.map(review => (
                                <div key={review._id} className="card bg-base-100 shadow-xl transition-shadow hover:shadow-2xl">
                                    <div className="card-body">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                                <div className="avatar">
                                                    <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                                        <img src={review.user?.avatar?.url || `https://ui-avatars.com/api/?name=${review.user?.username}`} alt="User Avatar" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Link to={`/users/${review.user?.username}`} className="font-semibold link link-hover">{review.user?.username}</Link>
                                                    <div className="text-sm opacity-60"> Film: <Link to={`/movies/${review.movie?._id}`} className="link link-hover">{review.movie?.title}</Link></div>
                                                </div>
                                            </div>
                                            <div className="text-sm opacity-70">
                                                Rapor Sayısı: <span className="badge badge-error badge-outline font-bold">{review.reportCount}</span>
                                            </div>
                                        </div>
                                        <div className="divider my-2"></div>
                                        <h3 className="text-xl font-bold">{review.title}</h3>
                                        <p className="opacity-80 line-clamp-3">{review.content}</p>
                                        <div className="card-actions justify-end mt-4">
                                            <button onClick={() => viewDetails(review, 'review')} className="btn btn-sm btn-outline">Detayları Gör</button>
                                            <button onClick={() => handleReviewModeration(review._id, 'approved')} className="btn btn-sm btn-success"><FiCheckCircle /> Onayla</button>
                                            <button onClick={() => handleReviewModeration(review._id, 'rejected')} className="btn btn-sm btn-error"><FiXCircle /> Reddet</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-10 bg-base-100 rounded-lg shadow-inner">
                                <p className="text-lg">Moderasyon bekleyen yorum bulunamadı.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Listeler Sekmesi */}
                {activeTab === 'lists' && (
                    <div className="space-y-6">
                         {listsForModeration.length > 0 ? (
                            listsForModeration.map(list => (
                                <div key={list._id} className="card bg-base-100 shadow-xl transition-shadow hover:shadow-2xl">
                                     <div className="card-body">
                                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                             <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                                <div className="avatar">
                                                    <div className="w-10 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                                                         <img src={list.user?.avatar?.url || `https://ui-avatars.com/api/?name=${list.user?.username}`} alt="User Avatar" />
                                                     </div>
                                                 </div>
                                                 <div>
                                                     <Link to={`/users/${list.user?.username}`} className="font-semibold link link-hover">{list.user?.username}</Link>
                                                </div>
                                            </div>
                                            <div className="text-sm opacity-70">
                                                 Rapor Sayısı: <span className="badge badge-error badge-outline font-bold">{list.reportCount}</span>
                                            </div>
                                        </div>
                                         <div className="divider my-2"></div>
                                        <h3 className="text-xl font-bold">{list.title}</h3>
                                        <p className="opacity-80 line-clamp-3">{list.description || 'Açıklama yok.'}</p>
                                         <div className="card-actions justify-end mt-4">
                                            <button onClick={() => viewDetails(list, 'list')} className="btn btn-sm btn-outline">Detayları Gör</button>
                                            <button onClick={() => handleListModeration(list._id, 'approved')} className="btn btn-sm btn-success"><FiCheckCircle /> Onayla</button>
                                            <button onClick={() => handleListModeration(list._id, 'rejected')} className="btn btn-sm btn-error"><FiXCircle /> Reddet</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-10 bg-base-100 rounded-lg shadow-inner">
                                <p className="text-lg">Moderasyon bekleyen liste bulunamadı.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Detay Modalı */}
            <dialog id="details_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box w-11/12 max-w-3xl">
                    <h3 className="font-bold text-2xl mb-4">İçerik Detayı</h3>
                    {selectedItem && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-lg"><FiUser /><span className="font-semibold">Kullanıcı:</span> {selectedItem.user?.username}</div>
                            
                            {selectedItem.itemType === 'review' && (
                                <>
                                    <div className="flex items-center gap-2 text-lg"><FiFilm /><span className="font-semibold">Film:</span> {selectedItem.movie?.title}</div>
                                    <div className="flex items-center gap-2 text-lg"><FiHash /><span className="font-semibold">Yorum Başlığı:</span> {selectedItem.title}</div>
                                </>
                            )}

                            {selectedItem.itemType === 'list' && (
                                <div className="flex items-center gap-2 text-lg"><FiList /><span className="font-semibold">Liste Başlığı:</span> {selectedItem.title}</div>
                            )}

                            <div className="flex items-start gap-2 text-lg"><FiFileText /><span className="font-semibold">İçerik:</span></div>
                            <div className="p-4 bg-base-200 rounded-lg max-h-60 overflow-y-auto">
                                <p className="whitespace-pre-wrap">{selectedItem.content || selectedItem.description}</p>
                            </div>

                        </div>
                    )}
                    <div className="modal-action mt-6">
                        <form method="dialog">
                            <button className="btn">Kapat</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop"><button>kapat</button></form>
            </dialog>

        </div>
    );
};

export default ContentModeration;