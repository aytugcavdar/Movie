import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMovies } from '../../redux/movieSlice';
import { FiEdit, FiTrash2, FiPlusCircle, FiSearch, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MovieManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { movies, status, error } = useSelector((state) => state.movie);
  const { isAuthenticated, isAdmin, loading: authLoading } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage] = useState(10); // Number of movies to display per page

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error('Bu sayfaya erişmek için giriş yapmalısınız.');
        navigate('/auth');
      } else if (!isAdmin) {
        toast.error('Bu sayfaya erişim yetkiniz yok.');
        navigate('/');
      } else {
        dispatch(fetchMovies()); // Fetch movies when component mounts
      }
    }
  }, [dispatch, isAuthenticated, isAdmin, navigate, authLoading]);

  // Pagination logic
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.originalTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredMovies.length / moviesPerPage); i++) {
      pageNumbers.push(i);
    }
    return (
      <div className="join mt-8">
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`join-item btn ${currentPage === number ? 'btn-active btn-primary' : ''}`}
          >
            {number}
          </button>
        ))}
      </div>
    );
  };


  if (authLoading || (status === 'loading' && (!isAuthenticated || !isAdmin))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="alert alert-error shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Hata: Filmler yüklenemedi. {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-base-content mb-8">
          Film Yönetimi
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="form-control w-full md:w-1/2">
            <div className="relative">
              <input
                type="text"
                placeholder="Film başlığına göre ara..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/admin/movies/add')} 
            className="btn btn-primary w-full md:w-auto"
          >
            <FiPlusCircle /> Yeni Film Ekle
          </button>
        </div>

        {status === 'loading' ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="overflow-x-auto bg-base-100 rounded-box shadow-xl">
            <table className="table table-lg">
              <thead>
                <tr>
                  <th>Poster</th>
                  <th>Başlık</th>
                  <th>Orjinal Başlık</th>
                  <th>Yayın Tarihi</th>
                  <th>TMDB ID</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {currentMovies.length > 0 ? (
                  currentMovies.map((movie) => (
                    <tr key={movie._id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <img src={movie.fullPosterUrl || 'https://via.placeholder.com/50x75?text=No+Poster'} alt={movie.title} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{movie.title}</td>
                      <td>{movie.originalTitle}</td>
                      <td>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{movie.tmdbId}</td>
                      <td>
                        <div className={`badge ${movie.isActive ? 'badge-success' : 'badge-error'} badge-outline`}>
                          {movie.isActive ? 'Aktif' : 'Pasif'}
                        </div>
                      </td>
                      <td className="flex items-center space-x-2">
                        <button onClick={() => navigate(`/admin/movies/edit/${movie._id}`)} className="btn btn-info btn-sm btn-square">
                          <FiEdit />
                        </button>
                        <button onClick={() => console.log('Delete:', movie._id)} className="btn btn-error btn-sm btn-square">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8">Film bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {renderPaginationButtons()}
      </div>
    </div>
  );
};

export default MovieManagement;