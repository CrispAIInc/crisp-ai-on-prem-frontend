import { useCallback, useContext } from 'react';
import { generateRandomId } from '../utils';
import { MainContext } from '../contexts/mainContext';
import { AuthContext } from '../contexts/authContext';
import makeApiRequest from '../api';

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

    const updateChatTitle = useCallback(async (chatTitle, chatId) => {
        const trimmedTitle = chatTitle?.trim();
        if (!trimmedTitle) {
            throw new Error('Chat title cannot be empty');
        }

        // Optimistic update
        setChatHistory(prev =>
            prev.map(chat =>
                chat.sessionId === chatId
                    ? { ...chat, title: trimmedTitle }
                    : chat
            )
        );

        try {
            const { success, message } = await makeApiRequest(
                '/update-session-title',
                'PUT',
                JSON.stringify({
                    sessionId: chatId,
                    title: trimmedTitle
                })
            );

            if (!success) {
                // Rollback
                setChatHistory(prev =>
                    prev.map(chat =>
                        chat.sessionId === chatId
                            ? { ...chat, title: prev.find(c => c.sessionId === chatId)?.title || '' }
                            : chat
                    )
                );
            }

            return { success, message, updatedTitle: trimmedTitle };
        } catch (err) {
            throw new Error(err.message || 'Failed to update chat title');
        }
    }, [setChatHistory]);


    return {
        addNewChat,
        updateChatTitle
    };

}