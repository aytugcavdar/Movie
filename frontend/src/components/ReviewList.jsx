import React from 'react';

const ReviewList = ({ reviews }) => {
    if (!reviews?.length) {
        return (
            <div className="text-center py-8">
                <div className="text-lg opacity-60">Henüz yorum yok</div>
                <div className="text-sm opacity-40">İlk yorumu siz yapın!</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Yorumlar ({reviews.length})</h3>
            
            {reviews.map(review => (
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
    );
};

export default ReviewList;