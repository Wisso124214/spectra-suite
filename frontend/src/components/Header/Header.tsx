import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className='w-full py-4 px-6 bg-(--foreground-absolute) fixed z-10 top-0 left-0 flex items-center justify-end '>
      <div
        className='flex items-center cursor-pointer'
        onClick={() => {
          navigate('/');
        }}
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
