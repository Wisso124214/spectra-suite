import { useEffect, useState } from 'react';
import { MenuAvatar } from '../MenuAvatar/MenuAvatar';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const [isShowingAvatarIcon, setIsShowingAvatarIcon] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { isLoggedIn } = JSON.parse(userData);
      if (isLoggedIn) {
        setIsShowingAvatarIcon(true);
      }
    }
  }, [location.pathname]);

  return (
    <header className='w-full py-4 px-6 bg-(--foreground-absolute) fixed z-10 top-0 left-0 flex items-center justify-between '>
      <div
        className='flex items-center cursor-pointer'
        onClick={() => {
          navigate('/');
        }}
      >
        <img
          src='/src/assets/logo-mini.png'
          alt='Event Suite Logo'
          className='h-8 w-8 mr-6 scale-150'
        />
        <h1 className='text-2xl font-bold text-foreground'>Event Suite</h1>
      </div>
      {isShowingAvatarIcon && <MenuAvatar />}
    </header>
  );
}
