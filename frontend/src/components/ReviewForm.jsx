import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addReview } from '../redux/movieSlice';
import { toast } from 'react-toastify';
import { FiSend } from 'react-icons/fi';

const ReviewForm = ({ movieId }) => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector(state => state.auth);
    const { status: movieStatus, error: movieError } = useSelector(state => state.movie);

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    if (!isAuthenticated) {
        return (
            <div className="alert alert-info mt-8">
                Yorum yapmak için giriş yapmalısınız.
            </div>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0 || !title.trim() || !content.trim()) {
            toast.error('Lütfen puan, başlık ve yorum alanlarını doldurun.');
            return;
        }

        const reviewData = { rating, title, content };
        dispatch(addReview({ movieId, reviewData }))
            .unwrap()
            .then(() => {
                toast.success('Yorumunuz başarıyla eklendi!');
                // Formu temizle
                setRating(0);
                setTitle('');
                setContent('');
            })
            .catch((err) => {
                toast.error(`Hata: ${err}`);
            });
    };

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Yorumunu Paylaş</h3>
            <form onSubmit={handleSubmit} className="card bg-base-200 p-6 space-y-4">
                {/* Star Rating */}
                <div className="form-control">
                    <label className="label"><span className="label-text">Puanınız</span></label>
                    <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className="cursor-pointer text-3xl"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                            >
                                {(hoverRating || rating) >= star ? '★' : '☆'}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div className="form-control">
                    <label className="label"><span className="label-text">Başlık</span></label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Yorumunuza bir başlık verin"
                        className="input input-bordered"
                        required
                    />
                </div>

                {/* Content */}
                <div className="form-control">
                    <label className="label"><span className="label-text">Yorumunuz</span></label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="textarea textarea-bordered h-24"
                        placeholder="Film hakkındaki düşüncelerinizi yazın..."
                        required
                    ></textarea>
                </div>

                {/* Submit Button */}
                <div className="card-actions justify-end">
                    <button type="submit" className="btn btn-primary" disabled={movieStatus === 'loading'}>
                        {movieStatus === 'loading' ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            <><FiSend /> Gönder</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;