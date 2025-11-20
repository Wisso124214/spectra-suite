import { type ReactElement } from 'react';
import { useAppContext } from '../../hooks/useAppContext';

export default function Popup({
  children = <></>,
  isShowingPopup,
}: {
  children: ReactElement;
  isShowingPopup: boolean;
}) {
  const { setIsShowingPopup } = useAppContext();
  return (
    isShowingPopup && (
      <div
        className='flex w-full h-full bg-(--gray-background-translucent-light) absolute justify-center items-center z-20'
        onClick={() => setIsShowingPopup(false)}
      >
        <div
          className='flex flex-col bg-(--gray-background) w-100 h-55 rounded-lg p-6 gap-10 justify-center items-center shadow-[0_0_30px_var(--primary-color-translucent)]'
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    )
  );
}
