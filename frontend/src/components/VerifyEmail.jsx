import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { verifyEmail } from "../redux/authSlice";

const VerifyEmail = () => {
  const { verifytoken } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasVerified = useRef(false); // Token'ın sadece bir kez kullanılmasını sağlar
  const { isLoading, error, isEmailVerified, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (verifytoken && !hasVerified.current) {
      hasVerified.current = true; // Token kullanıldı olarak işaretle
      dispatch(verifyEmail(verifytoken));
    }
  }, [verifytoken, dispatch]);

  useEffect(() => {
    if (isAuthenticated && isEmailVerified) {
      // Redirect to home page after successful verification
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isEmailVerified, navigate]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <h2 className="text-2xl font-bold text-base-content">Email Doğrulanıyor...</h2>
          <p className="text-base-content/70">Token işleniyor, lütfen bekleyin</p>
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Bu token tek kullanımlık olduğu için lütfen sayfayı yenilemeyin</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-error text-6xl">❌</div>
          <h2 className="text-2xl font-bold text-error">Doğrulama Başarısız!</h2>
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <div className="bg-base-200 p-4 rounded-lg mt-4">
            <h3 className="font-bold text-sm mb-2">Olası nedenler:</h3>
            <ul className="text-sm text-base-content/70 space-y-1">
              <li>• Token zaten kullanılmış olabilir</li>
              <li>• Token'ın geçerlilik süresi dolmuş olabilir</li>
              <li>• Sayfa birden fazla kez yüklenmiş olabilir</li>
              <li>• Bağlantı geçersiz olabilir</li>
            </ul>
          </div>
          <div className="flex gap-2 mt-4">
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/")}
            >
              Ana Sayfaya Dön
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => navigate("/resend-verification")}
            >
              Yeni Token İste
            </button>
          </div>
        </div>
      );
    }

    if (isEmailVerified) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-success text-6xl animate-bounce">✅</div>
          <h2 className="text-2xl font-bold text-success">Hesap Başarıyla Doğrulandı!</h2>
          <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Email adresiniz onaylandı! Artık tüm özellikleri kullanabilirsiniz.</span>
          </div>
          <div className="text-center">
            <p className="text-base-content/70 mb-2">3 saniye içinde ana sayfaya yönlendirileceksiniz...</p>
            <progress className="progress progress-primary w-56" value="100" max="100"></progress>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/")}
          >
            Hemen Ana Sayfaya Git
          </button>
        </div>
      );
    }

    // Token yoksa veya beklenmedik durum
    if (!verifytoken) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-warning text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-warning">Geçersiz Bağlantı</h2>
          <div className="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>Bu bağlantıda doğrulama token'ı bulunamadı</span>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/")}
          >
            Ana Sayfaya Dön
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-info text-6xl">📧</div>
        <h2 className="text-2xl font-bold text-base-content">Doğrulama Bekleniyor</h2>
        <p className="text-base-content/70">Token işlenmeyi bekliyor...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
              </div>
            </div>
            
            <h1 className="card-title justify-center text-3xl mb-6">Email Doğrulama</h1>
            
            {renderContent()}
            
            {verifytoken && !isLoading && (
              <div className="mt-6 p-4 bg-base-200 rounded-lg">
                <h3 className="font-semibold text-sm text-base-content/70 mb-2">Doğrulama Token:</h3>
                <code className="text-xs bg-base-300 p-2 rounded break-all block">
                  {verifytoken}
                </code>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-base-content/50 text-sm">
            Sorun mu yaşıyorsunuz? 
            <a href="/contact" className="link link-primary ml-1">İletişime geçin</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;