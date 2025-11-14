import './App.css';
import Header from './components/Header/Header';
import ThemeProvider from './components/Theme/ThemeProvider';
import Login from './pages/Login';
// import { ToasterProvider } from './components/CustomToaster/ToasterContext';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { useAppContext } from './hooks/useAppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Popup from './components/Popup/Popup.tsx';

import { useEffect } from 'react';

function AppContent() {
  const { userData } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const protectedPaths = ['/home'];

  useEffect(() => {
    if (protectedPaths.includes(location.pathname) && !userData) {
      navigate('/login');
    }
  }, [location, userData, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <div className='mt-[6vh] max-h-[90vh] flex flex-col p-0 m-0 overflow-y-auto self-center w-full items-center h-full'>
        <Header />
        <Routes>
          {/* Rutas públicas */}
          <Route path='/' element={userData ? <Home /> : <Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          {userData ? <Route path='/home' element={<Home />} /> : null}

          {/* Catch-all para rutas no manejadas */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

function App() {
  const { isShowingPopup, childrenPopup } = useAppContext();

  return (
    <>
      <Popup isShowingPopup={isShowingPopup}>
        <>{childrenPopup}</>
      </Popup>
      <Toaster position='top-center' />
      <AppContent />
    </>
  );
}

export default App;
