import "./App.css";
import Header from "./components/Header/Header";
import ThemeProvider from "./components/Theme/ThemeProvider";
import Login from "./pages/Login";
// import { ToasterProvider } from './components/CustomToaster/ToasterContext';
import NotFound from "./pages/NotFound";
import { Toaster } from "react-hot-toast";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";

import { useState, useEffect } from "react";
import Popup from "./components/Popup/Popup.tsx";

function AppContent({setIsShowingPopup}: {setIsShowingPopup: Function}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setIsLoggedIn(JSON.parse(storedUserData).isLoggedIn);
    }
  }, [location.pathname, isLoggedIn]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="mt-[6vh] max-h-[90vh] flex flex-col p-0 m-0 overflow-y-auto self-center w-full items-center h-full">
        <Header />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas protegidas */}
          {/* <Route path='/dishes' element={isLoggedIn ? <Dishes /> : null} /> */}

          {/* Catch-all para rutas no manejadas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

function App() {
  const [isShowingPopup, setIsShowingPopup] = useState(false);
  return (
    <>
      <Router>
        <Toaster position="top-center" />
        <Popup isShowingPopup={isShowingPopup} >
          <h1 className='text-lg font-bold text-foreground'>
            Holaaa
          </h1>
        </Popup>
        <AppContent setIsShowingPopup={setIsShowingPopup} />
      </Router>
    </>
  );
}

export default App;
