
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListById, removeMovieFromList } from '../redux/listSlice';
import MovieCard from '../components/MovieCard';
import { FiArrowLeft, FiTrash2,FiHeart } from 'react-icons/fi';
import { likeList } from '../redux/listSlice';
import { toast } from 'react-toastify';

const ListDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { selectedList, status, error } = useSelector(state => state.list);
    const { user: currentUser,isAuthenticated } = useSelector(state => state.auth);


    const handleLikeList = () => {
        if (!isAuthenticated) {
            toast.error("Beğenmek için giriş yapmalısınız.");
            return;
        }
        dispatch(likeList(id));
    };

    useEffect(() => {
        dispatch(fetchListById(id));
    }, [dispatch, id]);

    const handleRemoveMovie = (movieId) => {
        if(window.confirm("Bu filmi listeden kaldırmak istediğinize emin misiniz?")) {
            dispatch(removeMovieFromList({ listId: id, movieId }));
        }
    };

    if (status === 'loading') {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
    }

    if (error || !selectedList) {
        return <div className="alert alert-error">Hata: {error || "Liste bulunamadı."}</div>;
    }
    
    // Liste sahibinin bu listeyi düzenleyip düzenleyemeyeceğini kontrol et
    const canEdit = currentUser && currentUser.id === selectedList.user;

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
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={handleLikeList} className="btn btn-ghost">
                                 <FiHeart className="text-red-500" /> 
                                 {selectedList.likesCount || 0}
                             </button>
                        </div>
                    </div>
                </div>
                

                {selectedList.movies.length === 0 ? (
                    <div className="text-center py-16 bg-base-100 rounded-lg shadow-inner">
                        <p className="text-xl">Bu listede henüz film yok.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {selectedList.movies.map(({ movie }) => (
                            <div key={movie._id} className="relative group">
                                <MovieCard movie={movie} />
                                {canEdit && (
                                     <button 
                                        onClick={() => handleRemoveMovie(movie._id)}
                                        className="btn btn-sm btn-circle btn-error absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                        <FiTrash2 />
                                     </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListDetail;