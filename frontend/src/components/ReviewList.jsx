import React from 'react';
import { FiStar, FiUser } from 'react-icons/fi';

// Puanı yıldız olarak göstermek için yardımcı bileşen
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<FiStar key={i} className="text-yellow-400 fill-current" />);
    } else {
      stars.push(<FiStar key={i} className="text-gray-300" />);
    }
  }
  return <div className="flex">{stars}</div>;
};


const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-base-200 rounded-lg">
        <h3 className="text-lg font-semibold">Henüz Yorum Yok</h3>
        <p className="text-base-content/60">Bu film için ilk yorumu siz yapın!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold border-b pb-2">Yorumlar ({reviews.length})</h3>
      {reviews.map((review) => (
        <div key={review._id} className="card bg-base-200 shadow-md">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-2">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={review.user.avatar?.url || `https://ui-avatars.com/api/?name=${review.user.username}`} alt={`${review.user.username}'s avatar`} />
                </div>
              </div>
              <div>
                <p className="font-bold text-lg">{review.user.username}</p>
                <StarRating rating={review.rating} />
              </div>
            </div>
            <h4 className="text-xl font-semibold mt-2">{review.title}</h4>
            <p className="text-base-content/80 leading-relaxed">{review.content}</p>
            <div className="text-xs text-right text-base-content/50 mt-4">
              {new Date(review.createdAt).toLocaleDateString('tr-TR')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;