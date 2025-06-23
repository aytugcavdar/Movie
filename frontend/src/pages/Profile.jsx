import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, updateDetails, updatePassword } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiUser, 
  FiMail, 
  FiEdit3, 
  FiSave, 
  FiX, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiCalendar,
  FiUserCheck,
  FiFilm,
  FiHeart,
  FiBookmark,
  FiSettings,
  FiCamera
} from 'react-icons/fi';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useSelector((state) => state.auth);
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      letterboxd: ''
    }
  });
  
  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Lütfen giriş yapın.');
      navigate('/auth');
      return;
    }
    
    if (!user && !authLoading) {
      dispatch(getMe());
    }
  }, [isAuthenticated, user, authLoading, dispatch, navigate]);

  // Update local state when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        bio: user.bio || '',
        socialLinks: {
          twitter: user.socialLinks?.twitter || '',
          instagram: user.socialLinks?.instagram || '',
          letterboxd: user.socialLinks?.letterboxd || ''
        }
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateDetails(profileData)).unwrap();
      toast.success('Profil bilgileri başarıyla güncellendi!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Profil güncellenirken bir hata oluştu: ' + error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır!');
      return;
    }

    try {
      await dispatch(updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      
      toast.success('Şifre başarıyla güncellendi!');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Şifre güncelleme hatası: ' + error);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        bio: user.bio || '',
        socialLinks: {
          twitter: user.socialLinks?.twitter || '',
          instagram: user.socialLinks?.instagram || '',
          letterboxd: user.socialLinks?.letterboxd || ''
        }
      });
    }
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="avatar">
                  <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img 
                      src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random&color=ffffff&size=128`}
                      alt="Profile"
                    />
                  </div>
                </div>
                <button className="btn btn-circle btn-sm btn-primary absolute bottom-0 right-0">
                  <FiCamera size={16} />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl font-bold">{user.fullName}</h1>
                <p className="text-lg text-base-content/70">@{user.username}</p>
                {user.bio && (
                  <p className="mt-2 text-base-content/80">{user.bio}</p>
                )}
                
                {/* Stats */}
                <div className="stats stats-horizontal mt-4 bg-base-200">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <FiFilm size={24} />
                    </div>
                    <div className="stat-title">İncelemeler</div>
                    <div className="stat-value text-primary">{user.reviewsCount || 0}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <FiBookmark size={24} />
                    </div>
                    <div className="stat-title">İzleme Listesi</div>
                    <div className="stat-value text-secondary">{user.watchlistCount || 0}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                  disabled={isEditing}
                >
                  <FiEdit3 size={16} />
                  Profili Düzenle
                </button>
                <button 
                  onClick={() => setIsChangingPassword(true)}
                  className="btn btn-outline"
                  disabled={isChangingPassword}
                >
                  <FiLock size={16} />
                  Şifre Değiştir
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Edit Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <FiUser />
                Profil Bilgileri
              </h2>

              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Ad</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className="input input-bordered"
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Soyad</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="input input-bordered"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Kullanıcı Adı</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      className="input input-bordered"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Biyografi</span>
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className="textarea textarea-bordered h-24"
                      placeholder="Kendiniz hakkında birkaç söz..."
                      maxLength={500}
                    />
                    <label className="label">
                      <span className="label-text-alt">{profileData.bio.length}/500</span>
                    </label>
                  </div>

                  {/* Social Links */}
                  <div className="divider">Sosyal Medya</div>
                  <div className="space-y-3">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Twitter</span>
                      </label>
                      <input
                        type="text"
                        name="socialLinks.twitter"
                        value={profileData.socialLinks.twitter}
                        onChange={handleProfileChange}
                        className="input input-bordered"
                        placeholder="@kullaniciadi"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Instagram</span>
                      </label>
                      <input
                        type="text"
                        name="socialLinks.instagram"
                        value={profileData.socialLinks.instagram}
                        onChange={handleProfileChange}
                        className="input input-bordered"
                        placeholder="@kullaniciadi"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Letterboxd</span>
                      </label>
                      <input
                        type="text"
                        name="socialLinks.letterboxd"
                        value={profileData.socialLinks.letterboxd}
                        onChange={handleProfileChange}
                        className="input input-bordered"
                        placeholder="kullaniciadi"
                      />
                    </div>
                  </div>

                  <div className="card-actions justify-end">
                    <button 
                      type="button" 
                      onClick={cancelEdit}
                      className="btn btn-ghost"
                    >
                      <FiX size={16} />
                      İptal
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={authLoading}
                    >
                      <FiSave size={16} />
                      Kaydet
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Ad</span>
                      </label>
                      <p className="p-3 bg-base-200 rounded">{user.firstName}</p>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Soyad</span>
                      </label>
                      <p className="p-3 bg-base-200 rounded">{user.lastName}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">
                      <span className="label-text">E-posta</span>
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-base-200 rounded">
                      <FiMail />
                      <span>{user.email}</span>
                      {user.emailVerified ? (
                        <div className="badge badge-success">
                          <FiUserCheck size={12} />
                          Doğrulanmış
                        </div>
                      ) : (
                        <div className="badge badge-warning">Doğrulanmamış</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Kullanıcı Adı</span>
                    </label>
                    <p className="p-3 bg-base-200 rounded">@{user.username}</p>
                  </div>

                  {user.bio && (
                    <div>
                      <label className="label">
                        <span className="label-text">Biyografi</span>
                      </label>
                      <p className="p-3 bg-base-200 rounded">{user.bio}</p>
                    </div>
                  )}

                  <div>
                    <label className="label">
                      <span className="label-text">Kayıt Tarihi</span>
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-base-200 rounded">
                      <FiCalendar />
                      <span>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password Change Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <FiLock />
                Güvenlik
              </h2>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Mevcut Şifre</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="input input-bordered w-full pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Yeni Şifre</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="input input-bordered w-full pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Yeni Şifre (Tekrar)</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input input-bordered"
                      required
                    />
                  </div>

                  <div className="card-actions justify-end">
                    <button 
                      type="button" 
                      onClick={cancelPasswordChange}
                      className="btn btn-ghost"
                    >
                      <FiX size={16} />
                      İptal
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={authLoading}
                    >
                      <FiSave size={16} />
                      Şifreyi Güncelle
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="alert alert-info">
                    <FiLock />
                    <span>Şifreniz güvenli bir şekilde şifrelenerek saklanmaktadır.</span>
                  </div>
                  
                  {user.lastLogin && (
                    <div>
                      <label className="label">
                        <span className="label-text">Son Giriş</span>
                      </label>
                      <p className="p-3 bg-base-200 rounded">
                        {new Date(user.lastLogin).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  )}

                  <div className="card-actions">
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className="btn btn-outline w-full"
                    >
                      <FiLock size={16} />
                      Şifre Değiştir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {user.socialLinks && Object.values(user.socialLinks).some(link => link) && (
          <div className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body">
              <h2 className="card-title">Sosyal Medya</h2>
              <div className="flex flex-wrap gap-2">
                {user.socialLinks.twitter && (
                  <a 
                    href={`https://twitter.com/${user.socialLinks.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    Twitter
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a 
                    href={`https://instagram.com/${user.socialLinks.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    Instagram
                  </a>
                )}
                {user.socialLinks.letterboxd && (
                  <a 
                    href={`https://letterboxd.com/${user.socialLinks.letterboxd}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    Letterboxd
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;