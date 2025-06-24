// frontend/src/pages/admin/EditMovie.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMovieById, updateMovie } from '../../redux/movieSlice';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const EditMovie = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { selectedMovie, status, error } = useSelector(state => state.movie);
    const [formData, setFormData] = useState({ title: '', overview: '', status: 'Released' });

    useEffect(() => {
        dispatch(fetchMovieById(id));
    }, [id, dispatch]);

    useEffect(() => {
        if (selectedMovie) {
            setFormData({
                title: selectedMovie.title || '',
                overview: selectedMovie.overview || '',
                status: selectedMovie.status || 'Released',
                tagline: selectedMovie.tagline || '',
                runtime: selectedMovie.runtime || 0,
            });
        }
    }, [selectedMovie]);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateMovie({ movieId: id, movieData: formData }))
            .unwrap()
            .then(() => {
                toast.success('Film başarıyla güncellendi!');
                navigate('/admin/movies');
            })
            .catch((err) => {
                toast.error(`Güncelleme başarısız: ${err}`);
            });
    };

    if (status === 'loading') return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/admin/movies')} className="btn btn-ghost mb-4">
                    <FiArrowLeft /> Geri
                </button>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl">Filmi Düzenle: {selectedMovie?.title}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Başlık</span></label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Slogan (Tagline)</span></label>
                                <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className="input input-bordered" />
                            </div>
                             <div className="form-control">
                                <label className="label"><span className="label-text">Süre (dakika)</span></label>
                                <input type="number" name="runtime" value={formData.runtime} onChange={handleChange} className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Özet (Overview)</span></label>
                                <textarea name="overview" value={formData.overview} onChange={handleChange} className="textarea textarea-bordered h-32"></textarea>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Yayın Durumu</span></label>
                                <select name="status" value={formData.status} onChange={handleChange} className="select select-bordered">
                                    <option>Released</option>
                                    <option>Post Production</option>
                                    <option>In Production</option>
                                    <option>Planned</option>
                                    <option>Rumored</option>
                                    <option>Canceled</option>
                                </select>
                            </div>
                            <div className="card-actions justify-end">
                                <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                                    <FiSave /> {status === 'loading' ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditMovie;