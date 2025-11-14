import { useNavigate } from 'react-router-dom';
import useAppContext from '@/hooks/useAppContext';
import { SERVER_URL } from '../../../config';

export default function Header() {
  const navigate = useNavigate();
  const { setUserData, userData } = useAppContext();

  const handleLogoClick = async () => {
    if (userData) {
      navigate('/home');
    } else {
      let response: Response;
      try {
        response = await fetch(`${SERVER_URL}/toProcess`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tx: -1,
            params: {},
          }),
          credentials: 'include',
        }).then((res) => res);
        const data = await response.json();
        const newUserData = { ...userData, ...data?.userData };
        newUserData.profile = newUserData?.activeProfile || null;
        setUserData(newUserData);
        if (newUserData) {
          navigate('/home');
        } else {
          navigate('/login');
        }
      } catch (error) {
        setUserData(null);
        navigate('/login');
        console.error('Error fetching toProcess:', error);
        throw error;
      }
    }
  };

  return (
    <header className='w-full py-4 px-6 bg-(--foreground-absolute) fixed z-10 top-0 left-0 flex items-center justify-end '>
      <div
        className='flex items-center cursor-pointer'
        onClick={handleLogoClick}
      >
        <h1 className='text-2xl font-bold text-foreground'>Event Suite</h1>
        <img
          src='/src/assets/logo-mini.png'
          alt='Event Suite Logo'
          className='h-8 w-8 ml-6 scale-150'
        />
      </div>
    </header>
  );
}
