import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTokenStore = create(
    persist(
        (set) => ({
            tokens: 0,
            setTokens: (newTokens) => {
                if (typeof newTokens !== 'number' || isNaN(newTokens)) {
                    console.error('Invalid token value:', newTokens);
                    return;
                }
                set({ tokens: newTokens });
            },
            incrementTokens: (amount) => {
                if (typeof amount !== 'number' || isNaN(amount)) {
                    console.error('Invalid increment amount:', amount);
                    return;
                }
                set((state) => ({ tokens: state.tokens + amount }));
            },
            decrementTokens: (amount) => {
                if (typeof amount !== 'number' || isNaN(amount)) {
                    console.error('Invalid decrement amount:', amount);
                    return;
                }
                set((state) => ({ tokens: Math.max(0, state.tokens - amount) }));
            },
            resetTokens: () => set({ tokens: 0 }),
        }),
        {
            name: 'token-storage',
            getStorage: () => ({
                setItem: (name, value) => {
                    if (typeof window !== 'undefined') {
                        try {
                            sessionStorage.setItem(name, value);
                        } catch (error) {
                            console.error('Error saving to sessionStorage:', error);
                        }
                    }
                },
                getItem: (name) => {
                    if (typeof window !== 'undefined') {
                        try {
                            return sessionStorage.getItem(name);
                        } catch (error) {
                            console.error('Error reading from sessionStorage:', error);
                            return null;
                        }
                    }
                    return null;
                },
                removeItem: (name) => {
                    if (typeof window !== 'undefined') {
                        try {
                            sessionStorage.removeItem(name);
                        } catch (error) {
                            console.error('Error removing from sessionStorage:', error);
                        }
                    }
                },
            }),
        }
    )
);

export default useTokenStore;