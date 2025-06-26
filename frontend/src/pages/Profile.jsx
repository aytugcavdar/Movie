// frontend/src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, updateDetails } from '../redux/authSlice';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiEdit, FiSave, FiCamera } from 'react-icons/fi';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);



  useEffect(() => {
    // Kullanıcı bilgileri yüklendiğinde formu dolduruyoruz
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateDetails(formData))
      .unwrap()
      .then(() => {
        toast.success('Profil başarıyla güncellendi!');
        setIsEditing(false);
        dispatch(getMe()); // Güncel bilgileri tekrar çek
      })
      .catch((err) => {
        toast.error(`Güncelleme başarısız: ${err.message || 'Bir hata oluştu'}`);
      });
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6">
              {/* Avatar */}
              <div className="avatar mb-4 sm:mb-0">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}+${user?.lastName || 'U'}`} alt="Avatar" />
                </div>
              </div>
              {/* Kullanıcı Adı ve Rolü */}
              <div>
                <h1 className="text-3xl font-bold">{user?.fullName}</h1>
                <p className="text-base-content/70">@{user?.username}</p>
                {user?.role === 'admin' && <div className="badge badge-primary mt-2">Admin</div>}
              </div>
            </div>

            <div className="divider my-6">Profil Bilgileri</div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Ad ve Soyad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Ad</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input input-bordered" disabled={!isEditing} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Soyad</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input input-bordered" disabled={!isEditing} />
                </div>
              </div>
              {/* Kullanıcı Adı ve Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Kullanıcı Adı</span></label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} className="input input-bordered" disabled={!isEditing} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">E-posta</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input input-bordered" disabled />
                </div>
              </div>
              {/* Biyografi */}
              <div className="form-control">
                <label className="label"><span className="label-text">Biyografi</span></label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} className="textarea textarea-bordered h-24" disabled={!isEditing}></textarea>
              </div>

              {/* Butonlar */}
              <div className="card-actions justify-end mt-6">
                {isEditing ? (
                  <>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost">İptal</button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? <span className="loading loading-spinner"></span> : <FiSave />}
                      Kaydet
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setIsEditing(true)} className="btn btn-outline btn-primary">
                    <FiEdit />
                    Profili Düzenle
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;