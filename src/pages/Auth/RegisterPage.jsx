import React from 'react';
import Register from "../../components/Auth/Register";


function RegisterPage({ theme, setTheme }) {
    return (
        <div className="flex min-h-screen">
            {/* left showcase => gradient wave design*/}
            <div className='relative hidden xl:block p-[4px] w-1/2 max-w-1/2 3xl:w-1/3 4xl:w-1/4 h-screen max-h-screen'>
                <div className='flex items-center text-white absolute top-[5%] left-[5%] z-10'>
                    <img src='/imgs/app-logo-white.png' alt='logo' className='w-16 h-16 ' />
                    <p className='text-3xl'>CrispAI</p>
                </div>
                <img src='/imgs/wave-1.jpg' alt='wave' className='object-cover w-full h-full rounded-3xl' />
                <h2 className="absolute right-0 z-10 text-white top-[80%] w-2/3">The X factor in Rich Media understanding</h2>
            </div>
            {/* signup form */}
            <div className="flex items-center justify-center w-full h-screen xl:w-1/2">
                <div className="w-full max-w-md px-8">
                    <Register theme={theme} />
                </div>
            </div>

        </div>
    );
}

export default RegisterPage;