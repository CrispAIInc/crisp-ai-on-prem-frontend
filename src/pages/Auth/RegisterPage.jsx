import React from 'react';
import Register from "../../components/Auth/Register";


function RegisterPage({ theme }) {
    return (
        <div className="flex min-h-screen ">
            {/* left showcase => gradient wave design*/}
            <div className='relative hidden xl:block p-[4px] w-1/2 max-w-1/2 3xl:w-1/3 4xl:w-1/4 h-screen max-h-screen'>
                <div className='flex items-center text-white absolute top-[5%] left-[5%] z-10'>
                    <img src='/imgs/app-logo-white.png' alt='logo' className='w-16 h-16 ' />
                    <p className='text-3xl'>CrispAI</p>
                </div>
                <img src='/imgs/wave-1.jpg' alt='wave' className='object-cover w-full h-full rounded-3xl' />
                <h2 className="absolute bg-black/50 w-fit right-[5%] text-opacity-50 z-10 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-bold bottom-[5%] py-3 px-5 rounded-3xl backdrop-blur-[5px]">The X factor in Rich Media <br /> understanding</h2>
            </div>
            {/* signup form */}
            <div className="flex items-center justify-center flex-1 w-full h-screen xl:w-1/2">
                <div className="w-full max-w-md px-8 ">
                    <Register theme={theme} />
                </div>
            </div>

        </div>
    );
}

export default RegisterPage;