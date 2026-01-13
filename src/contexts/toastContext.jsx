import { createContext, useContext, useState } from "react";
import AppAlert from '../components/AppAlert';

const ToastContext = createContext({});

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const notify = (toast) => {
        const id = crypto.randomUUID();

        setToasts((prev) => [
            ...prev,
            { id, ...toast },
        ]);
    };

    const remove = (id) => {
        setToasts((prev) => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ notify }}>
            {children}

            {/* Toast container */}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
                {toasts.map((toast) => (
                    <AppAlert
                        key={toast.id}
                        {...toast}
                        onClose={() => remove(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
