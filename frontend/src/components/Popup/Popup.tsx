import { type ReactElement } from 'react' 

export default function Popup({children = <></>, title = '', isShowingPopup
}: {children: ReactElement, title: string, isShowingPopup: boolean}) {
  return (
    isShowingPopup && <div className='w-full h-full bg-(--gray-background-translucent-light) absolute justify-center items-center flex z-100'>
      <div className='flex flex-col bg-(--gray-background) w-100 h-55 rounded-lg p-6 gap-10 justify-center items-center shadow-[0_0_30px_var(--primary-color-translucent)]'>
        {
          title !== '' && 
          <h1 className='text-lg font-bold text-foreground'>
            {title}
          </h1>
        }
        {children}
      </div>
    </div>
  );
}
