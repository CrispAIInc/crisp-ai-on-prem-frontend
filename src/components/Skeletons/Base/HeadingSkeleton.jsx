import { useContext } from 'react';
import { MainContext } from '../../../contexts/mainContext.js';

function HeadingSkeleton({ className }) {
  const { theme } = useContext(MainContext);
  return (
    <div className={`${theme === 'light' ? 'bg-slate-300' : 'bg-textColor-300'} w-full h-4 rounded-sm ${className}`}></div>
  );
}

export default HeadingSkeleton;