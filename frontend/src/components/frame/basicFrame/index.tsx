import { ReactNode } from 'react';
import '@/components/cat/idle/index.css';
import { FaXmark } from 'react-icons/fa6';

interface Props {
  children: ReactNode;
}

const BasicFrame = ({ children }: Props) => {
  return (
    <>
      <main>
        <FaXmark size={25} className={'fixed right-64 top-3'} />
        <div className='ml-14 bg-frameColor w-boxWidth h-boxHeight rounded-boxRadius'>
          {children}
        </div>
      </main>
      <div className='character-idle fixed right-[0px] bottom-[0px]' />
    </>
  );
};

export default BasicFrame;
