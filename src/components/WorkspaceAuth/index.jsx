import React from 'react';

function WorkspaceAuth({ inputPassword, setInputPassword, handleLogin }) {
    return (
        <div className='h-screen bg-background text-textColor-200'>
            <div className="w-[90vw] max-w-[700px] mx-auto flex flex-col items-center justify-center text-center h-full">
                <img draggable={false} src="/protected-route.svg" alt="crisp-ai Protected Route" className="w-2/3 mb-10 h-96" />
                <h2>Restricted Access: Only authorized users may enter. Please provide the password to continue.</h2>
                <div className='flex items-center gap-2 mt-3'>
                    <input
                        type="password"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        placeholder='password'
                        className='p-2 border rounded-md border-textColor-200 w-80'
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <button onClick={handleLogin} className='p-2 text-white rounded-md bg-primary-300'>Submit</button>
                </div>
            </div>
        </div>
    );
}

export default WorkspaceAuth;