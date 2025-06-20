import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, resendEmailVerification, clearMessages, getMe } from "../redux/authSlice";
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiCamera, FiArrowRight } from 'react-icons/fi';

const Auth = () => {
  const [isSignup, setIsSignup] = useState(true);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, isLoading, error: authError, isEmailSent, isVerified, user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    avatar: "",
  });
  
  const [preview, setPreview] = useState(
    "https://media.istockphoto.com/id/1300845620/tr/vekt%C3%B6r/kullan%C4%B1c%C4%B1-simgesi-d%C3%BCz-beyaz-arka-plan-%C3%BCzerinde-izole-kullan%C4%B1c%C4%B1-sembol%C3%BC-vekt%C3%B6r-ill%C3%BCstrasyonu.jpg?s=612x612&w=0&k=20&c=BapxTLg8R3jjWnvaSXeHqgtou_-FcyBKmAkUsgwQzxU="
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (isSignup) {
      if (!formData.firstName.trim()) newErrors.firstName = "Ad gereklidir";
      if (!formData.lastName.trim()) newErrors.lastName = "Soyad gereklidir";
      if (!formData.username.trim()) newErrors.username = "Kullanıcı adı gereklidir";
      if (formData.username.length < 3) newErrors.username = "Kullanıcı adı en az 3 karakter olmalıdır";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-posta gereklidir";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Şifre gereklidir";
    } else if (formData.password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.readyState === 2) {
            setFormData((prev) => ({ ...prev, avatar: reader.result })); // Base64 string
            setPreview(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isSignup) {
        await dispatch(registerUser(formData)).unwrap();
        toast.success("Kayıt başarılı! E-posta doğrulama linki gönderildi.");
      } else {
        await dispatch(loginUser({ 
          email: formData.email, 
          password: formData.password 
        })).unwrap();
        toast.success("Giriş başarılı!");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setFormData({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      avatar: "",
    });
    setErrors({});
    setPreview("https://media.istockphoto.com/id/1300845620/tr/vekt%C3%B6r/kullan%C4%B1c%C4%B1-simgesi-d%C3%BCz-beyaz-arka-plan-%C3%BCzerinde-izole-kullan%C4%B1c%C4%B1-sembol%C3%BC-vekt%C3%B6r-ill%C3%BCstrasyonu.jpg?s=612x612&w=0&k=20&c=BapxTLg8R3jjWnvaSXeHqgtou_-FcyBKmAkUsgwQzxU=");
  };

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <FiUser className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            {isSignup ? "Hesap Oluştur" : "Giriş Yap"}
          </h1>
          <p className="text-base-content/60">
            {isSignup 
              ? "Yeni hesabınızı oluşturun" 
              : "Hesabınıza giriş yapın"
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Avatar Upload - Only for Signup */}
              {isSignup && (
                <div className="form-control items-center">
                  <div className="relative group cursor-pointer">
                    <div className="avatar">
                      <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img 
                          src={preview} 
                          alt="Avatar preview"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiCamera className="w-6 h-6 text-white" />
                    </div>
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <label className="label">
                    <span className="label-text text-sm">Profil fotoğrafı seçin</span>
                  </label>
                </div>
              )}

              {/* Name Fields - Only for Signup */}
              {isSignup && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="Ad"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`input input-bordered w-full pl-10 ${errors.firstName ? 'input-error' : ''}`}
                      />
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4" />
                    </div>
                    {errors.firstName && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.firstName}</span>
                      </label>
                    )}
                  </div>
                  
                  <div className="form-control">
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Soyad"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`input input-bordered w-full pl-10 ${errors.lastName ? 'input-error' : ''}`}
                      />
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4" />
                    </div>
                    {errors.lastName && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.lastName}</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Username - Only for Signup */}
              {isSignup && (
                <div className="form-control">
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      placeholder="Kullanıcı adı"
                      value={formData.username}
                      onChange={handleChange}
                      className={`input input-bordered w-full pl-10 ${errors.username ? 'input-error' : ''}`}
                    />
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4" />
                  </div>
                  {errors.username && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.username}</span>
                    </label>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="form-control">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="E-posta adresi"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                  />
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4" />
                </div>
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.email}</span>
                  </label>
                )}
              </div>

              {/* Password */}
              <div className="form-control">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Şifre"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  />
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.password}</span>
                  </label>
                )}
              </div>

              {/* Forgot Password Link - Only for Login */}
              {!isSignup && (
                <div className="text-right">
                  <button 
                    type="button"
                    className="link link-primary text-sm"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Şifrenizi mi unuttunuz?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full group"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    {isSignup ? "Hesap Oluştur" : "Giriş Yap"}
                    <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider my-6">veya</div>

            {/* Toggle Mode */}
            <div className="text-center">
              <span className="text-base-content/60">
                {isSignup ? "Zaten hesabınız var mı? " : "Henüz hesabınız yok mu? "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="link link-primary font-semibold"
              >
                {isSignup ? "Giriş Yap" : "Hesap Oluştur"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-base-content/60">
          <p>
            Hesap oluşturarak{" "}
            <button className="link link-primary">Kullanım Şartları</button> ve{" "}
            <button className="link link-primary">Gizlilik Politikası</button>'nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;