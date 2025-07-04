
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviewsForModeration, updateReviewModeration, fetchListsForModeration, updateListModeration } from '../../redux/adminSlice';
import { FiCheckCircle, FiXCircle, FiInfo, FiMessageSquare, FiList, FiFilm, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ContentModeration = () => {
    const dispatch = useDispatch();
    const { reviewsForModeration, listsForModeration, status } = useSelector(state => state.admin);
    const [activeTab, setActiveTab] = useState('reviews'); 

    useEffect(() => {
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
                
                dispatch(fetchReviewsForModeration());
            })
            .catch(err => toast.error(err));
    };

    const handleListModeration = (listId, moderationStatus) => {
        dispatch(updateListModeration({ listId, moderationStatus }))
            .unwrap()
            .then(() => {
                dispatch(fetchListsForModeration());
            })
            .catch(err => toast.error(err));
    };

    if (status === 'loading') {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    }

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center flex items-center justify-center gap-3">
                    <FiInfo /> İçerik Moderasyonu
                </h1>

                <div role="tablist" className="tabs tabs-boxed mb-8">
                    <a role="tab" className={`tab ${activeTab === 'reviews' ? 'tab-active' : ''}`} onClick={() => setActiveTab('reviews')}>
                        <FiMessageSquare className="mr-2" /> Yorumlar ({reviewsForModeration.length})
                    </a>
                    <a role="tab" className={`tab ${activeTab === 'lists' ? 'tab-active' : ''}`} onClick={() => setActiveTab('lists')}>
                        <FiList className="mr-2" /> Listeler ({listsForModeration.length})
                    </a>
                </div>

                {activeTab === 'reviews' && (
                    <div className="space-y-6">
                        {reviewsForModeration.length > 0 ? (
                            reviewsForModeration.map(review => (
                                <div key={review._id} className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="avatar">
                                                <div className="w-10 rounded-full">
                                                    <img src={review.user?.avatar?.url || `https://ui-avatars.com/api/?name=${review.user?.username}`} alt="User Avatar" />
                                                </div>
                                            </div>
                                            <div>
                                                <Link to={`/users/${review.user?.username}`} className="font-semibold link link-hover">{review.user?.username}</Link>
                                                <span className="text-sm opacity-60 ml-2"> - <Link to={`/movies/${review.movie?._id}`} className="link link-hover">{review.movie?.title}</Link></span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold">{review.title}</h3>
                                        <p className="opacity-80 line-clamp-3">{review.content}</p>
                                        <div className="text-xs opacity-50 mt-2">
                                            Durum: <span className={`font-semibold ${review.moderationStatus === 'pending' ? 'text-warning' : 'text-error'}`}>{review.moderationStatus}</span> | Rapor Sayısı: {review.reportCount}
                                        </div>
                                        <div className="card-actions justify-end mt-4">
                                            <button onClick={() => handleReviewModeration(review._id, 'approved')} className="btn btn-success btn-sm"><FiCheckCircle /> Onayla</button>
                                            <button onClick={() => handleReviewModeration(review._id, 'rejected')} className="btn btn-error btn-sm"><FiXCircle /> Reddet</button>
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

                {activeTab === 'lists' && (
                    <div className="space-y-6">
                        {listsForModeration.length > 0 ? (
                            listsForModeration.map(list => (
                                <div key={list._id} className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="avatar">
                                                <div className="w-10 rounded-full">
                                                    <img src={list.user?.avatar?.url || `https://ui-avatars.com/api/?name=${list.user?.username}`} alt="User Avatar" />
                                                </div>
                                            </div>
                                            <div>
                                                <Link to={`/users/${list.user?.username}`} className="font-semibold link link-hover">{list.user?.username}</Link>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold">{list.title}</h3>
                                        <p className="opacity-80 line-clamp-3">{list.description || 'Açıklama yok.'}</p>
                                        <div className="text-xs opacity-50 mt-2">
                                            Durum: <span className={`font-semibold ${list.moderationStatus === 'pending' ? 'text-warning' : 'text-error'}`}>{list.moderationStatus}</span> | Rapor Sayısı: {list.reportCount}
                                        </div>
                                        <div className="card-actions justify-end mt-4">
                                            <button onClick={() => handleListModeration(list._id, 'approved')} className="btn btn-success btn-sm"><FiCheckCircle /> Onayla</button>
                                            <button onClick={() => handleListModeration(list._id, 'rejected')} className="btn btn-error btn-sm"><FiXCircle /> Reddet</button>
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
        </div>
    );
};

export default ContentModeration;