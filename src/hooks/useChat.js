import { useCallback, useContext } from 'react';
import { generateRandomId } from '../utils';
import { MainContext } from '../contexts/mainContext';
import { AuthContext } from '../contexts/authContext';
import makeApiRequest from '../api';

export default function useChat() {

    const { currentChat, setCurrentChat, setChatHistory } = useContext(MainContext);
    const { user } = useContext(AuthContext);

    const addNewChat = useCallback((title, messages = []) => {

        if (!user?.userId) {
            throw new Error('User must be authenticated to create a chat');
        }

        if (!title?.trim()) {
            throw new Error('Chat title is required');
        }

        const now = new Date();

        // isTemp means that this chat session has not yet been saved to DB
        const newChat = { sessionId: generateRandomId(), isTemp: true, title, userId: user.userId, messages, created_at: now, updated_at: now };
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

    const deleteChat = useCallback(async (chatIds) => {
        try {
            const ids = Array.isArray(chatIds) ? chatIds : [chatIds];
            const { success, message } = await makeApiRequest('/chat-history', 'DELETE', JSON.stringify({
                session_ids: ids,
            }));
            if (success) {
                setChatHistory(prev =>
                    prev.filter(chat => !ids.includes(chat.sessionId))
                );
                // If the current chat is deleted, clear it
                setCurrentChat(prev => (ids.includes(prev?.sessionId) ? [] : prev));
                return { success: true };
            } else {
                throw new Error(message || 'Failed to delete chat');
            }
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message || 'Failed to delete chat' };
        }
    }, [setChatHistory, setCurrentChat]);


    return {
        addNewChat,
        updateChatTitle,
        deleteChat
    };

}  