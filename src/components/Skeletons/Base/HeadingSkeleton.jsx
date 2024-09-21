import { useContext } from 'react';
import { ThemeContext } from '../../../contexts/themeContext.js';

function HeadingSkeleton({ className }) {
  const { theme } = useContext(ThemeContext);
  return (
    <div className={`${theme === 'light' ? 'bg-textColor-100' : 'bg-textColor-300'} w-full h-4 rounded-sm ${className}`}></div>
  );
}

export default HeadingSkeleton;