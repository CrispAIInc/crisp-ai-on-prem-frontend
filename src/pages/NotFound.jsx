import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import notFound from '/notFound.svg';

function NotFound({ theme }) {
    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, nofollow" />
                <title>404 - Page Not Found</title>
                <meta name="description" content="The page you're looking for could not be found." />
            </Helmet>
            <div className={`flex flex-col items-center justify-center h-full gap-10 ${theme === 'dark' && 'bg-background'}`}>
                <img src={notFound} alt="Oops! Page not found - The requested page isn't available on Crisp AI" className='w-[1500px] h-[300px]' />
                <p className={`text-3xl ${theme === "dark" && "text-textColor-100"}`}>Oops! We couldn&apos;t find that page.</p>
                <Link to="/" className="p-2 text-lg text-white bg-blue-500 rounded-md hover:text-blue-700">
                    Go back to the homepage
                </Link>
            </div>
        </>
    );
}

export default NotFound;