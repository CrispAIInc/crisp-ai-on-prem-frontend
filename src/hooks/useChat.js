import { useCallback, useContext } from 'react';
import { generateRandomId } from '../utils';
import { MainContext } from '../contexts/mainContext';
import { AuthContext } from '../contexts/authContext';

export default function useChat() {

    const { setCurrentChat, setChatHistory } = useContext(MainContext);
    const { user } = useContext(AuthContext);

    const addNewChat = useCallback((title) => {

        if (!user?.userId) {
            throw new Error('User must be authenticated to create a chat');
        }

        if (!title?.trim()) {
            throw new Error('Chat title is required');
        }

        const now = new Date();

        const newChat = { sessionId: generateRandomId(), title, userId: user.userId, messages: [], created_at: now, updated_at: now };
        setCurrentChat(newChat);
        setChatHistory(prev => ([newChat, ...prev]));
    }, [user?.userId, setCurrentChat, setChatHistory]);

    return {
        addNewChat
    };

}