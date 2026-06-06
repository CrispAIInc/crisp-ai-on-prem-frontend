import { createContext, useContext, useState } from "react";
import AppAlert from '../components/AppAlert';
import { randomUUID } from '../utils';

export const ToastContext = createContext({});

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const notify = (toast) => {
        const id = randomUUID();

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

            {toasts.map((toast) => (
                <AppAlert
                    key={toast.id}
                    {...toast}
                    onClose={() => remove(toast.id)}
                />
            ))}
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
