import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addReview } from '../redux/movieSlice';
import { toast } from 'react-toastify';

const ReviewForm = ({ movieId }) => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector(state => state.auth);
    const { status } = useSelector(state => state.movie);

    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    if (!isAuthenticated) {
        return <div className="alert alert-info">Yorum yapmak için giriş yapın</div>;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!rating || !title.trim() || !content.trim()) {
            toast.error('Tüm alanları doldurun');
            return;
        }

        dispatch(addReview({ movieId, reviewData: { rating, title, content } }))
             
            .unwrap()
            .then(() => {
                toast.success('Yorum eklendi!');
                setRating(0);
                setTitle('');
                setContent('');
                
            })
            .catch(err => toast.error(err));
    };

    return (
        <div className="card bg-base-200 p-6">
            <h3 className="text-xl font-bold mb-4">Yorum Yap</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Yıldız Puanlama */}
                <div>
                    <label className="label">Puan</label>
                    <div className="rating rating-lg">
                        {[1, 2, 3, 4, 5].map(star => (
                            <input
                                key={star}
                                type="radio"
                                name="rating"
                                className="mask mask-star-2 bg-orange-400"
                                checked={rating === star}
                                onChange={() => setRating(star)}
                            />
                        ))}
                    </div>
                </div>

                {/* Başlık */}
                <div className="form-control">
                    <label className="label">Başlık</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input input-bordered"
                        placeholder="Başlık yazın"
                    />
                </div>

                {/* İçerik */}
                <div className="form-control">
                    <label className="label">Yorum</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="textarea textarea-bordered h-24"
                        placeholder="Yorumunuzu yazın..."
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? <span className="loading loading-spinner" /> : 'Gönder'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;