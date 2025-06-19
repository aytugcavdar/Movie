import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import { toast } from 'react-toastify';
import { FiFilm, FiLogIn, FiLogOut, FiUser, FiMenu, FiHome, FiList } from 'react-icons/fi';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Başarıyla çıkış yaptınız.');
      navigate('/');
    } catch (error) {
      toast.error('Çıkış yapılamadı: ' + (error.message || 'Bilinmeyen bir hata oluştu.'));
    }
  };

  // Mobil menü için navigation linkleri
  const navigationLinks = [
    { to: '/', label: 'Ana Sayfa', icon: FiHome },
    { to: '/movies', label: 'Filmler', icon: FiFilm },
    { to: '/lists', label: 'Listeler', icon: FiList }
  ];

  // Kullanıcı giriş yapmışsa gösterilecek menü
  const loggedInMenu = (
    <div className="flex items-center gap-2">
      {/* Masaüstü kullanıcı menüsü */}
      <div className="dropdown dropdown-end">
        <div 
          tabIndex={0} 
          role="button" 
          className="btn btn-ghost btn-circle avatar hover:scale-105 transition-transform duration-200"
        >
          <div className="w-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
            <img
              alt="User Avatar"
              src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}+${user?.lastName || 'U'}&background=random&color=ffffff`}
              className="rounded-full"
            />
          </div>
        </div>
        <ul 
          tabIndex={0} 
          className="dropdown-content menu bg-base-200 rounded-box z-[1] w-60 p-2 shadow-lg border border-base-300 mt-3"
        >
          <li className="border-b border-base-300 pb-2 mb-2">
            <div className="flex items-center gap-3 p-2 cursor-default hover:bg-transparent">
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img
                    src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}+${user?.lastName || 'U'}&background=random&color=ffffff`}
                    alt="Avatar"
                  />
                </div>
              </div>
              <div>
                <div className="font-semibold text-sm">{user?.username || 'Kullanıcı'}</div>
                <div className="text-xs opacity-60">{user?.email}</div>
              </div>
            </div>
          </li>
          <li>
            <Link to="/profile" className="flex items-center gap-3 p-2 hover:bg-primary hover:text-primary-content rounded-lg transition-colors">
              <FiUser size={16} />
              <span>Profil</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 p-2 hover:bg-error hover:text-error-content rounded-lg transition-colors text-left w-full"
            >
              <FiLogOut size={16} />
              <span>Çıkış Yap</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  // Kullanıcı giriş yapmamışsa gösterilecek menü
  const guestMenu = (
    <div className="flex-none">
      <Link 
        to="/auth" 
        className="btn btn-primary btn-outline hover:btn-primary hover:scale-105 transition-all duration-200"
      >
        <FiLogIn size={16} />
        <span className="hidden sm:inline">Giriş Yap / Kayıt Ol</span>
        <span className="sm:hidden">Giriş</span>
      </Link>
    </div>
  );

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50 px-4 border-b border-base-200">
      {/* Logo ve mobil menü */}
      <div className="navbar-start">
        {/* Mobil hamburger menü */}
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <FiMenu size={20} />
          </div>
          <ul 
            tabIndex={0} 
            className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-base-300"
          >
            {navigationLinks.map((link) => (
              <li key={link.to}>
                <Link 
                  to={link.to} 
                  className="flex items-center gap-3 p-2 hover:bg-primary hover:text-primary-content rounded-lg transition-colors"
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logo */}
        <Link 
          to="/" 
          className="btn btn-ghost text-xl lg:text-2xl text-primary font-bold hover:scale-105 transition-transform duration-200"
        >
          <FiFilm size={24} />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MovieApp
          </span>
        </Link>
      </div>

      {/* Masaüstü navigation menüsü */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 text-base font-medium">
          {navigationLinks.map((link) => (
            <li key={link.to}>
              <Link 
                to={link.to}
                className="hover:bg-primary hover:text-primary-content rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Kullanıcı menüsü */}
      <div className="navbar-end">
        {isAuthenticated ? loggedInMenu : guestMenu}
      </div>
    </div>
  );
};

export default Navbar;