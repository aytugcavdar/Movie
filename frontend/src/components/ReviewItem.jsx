// frontend/src/components/ReviewItem.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { likeReview } from '../redux/movieSlice';
import { FiHeart, FiMessageSquare } from 'react-icons/fi';

const ReviewItem = ({ review }) => {
    const dispatch = useDispatch();

    const handleLike = () => {
        dispatch(likeReview(review._id));
    };

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
               <div className="space-y-4">
            <h3 className="text-xl font-bold">Yorumlar ({review.length})</h3>

            {review.map(review => (
                <div key={review._id} className="card bg-base-100 shadow">
                    <div className="card-body p-4">
                        {/* Kullanıcı Bilgisi */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="avatar">
                                <div className="w-10 rounded-full">
                                    <img src={review.user.avatar?.url || `https://ui-avatars.com/api/?name=${review.user.username}`} />
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold">{review.user.username}</div>
                                <div className="rating rating-sm">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span 
                                            key={star}
                                            className={`mask mask-star-2 ${star <= review.rating ? 'bg-orange-400' : 'bg-gray-200'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Yorum İçeriği */}
                        <h4 className="font-semibold text-lg">{review.title}</h4>
                        <p className="opacity-80">{review.content}</p>
                        
                        {/* Tarih */}
                        <div className="text-xs opacity-50 text-right mt-2">
                            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                    </div>
                </div>
            ))}
        </div>
                <div className="card-actions justify-end mt-2">
                    <button onClick={handleLike} className="btn btn-ghost btn-sm">
                        <FiHeart /> {review.likesCount || 0}
                    </button>
                    <button className="btn btn-ghost btn-sm">
                        <FiMessageSquare /> {review.commentsCount || 0}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewItem;