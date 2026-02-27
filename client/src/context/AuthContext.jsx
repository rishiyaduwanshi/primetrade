import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pt_user')) || null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const clearError = () => setError(null);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await loginApi({ email, password });
            const userData = res.data.data.user;
            setUser(userData);
            localStorage.setItem('pt_user', JSON.stringify(userData));
            return userData;
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const signup = useCallback(async (name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await signupApi({ name, email, password });
            const userData = res.data.data.user;
            setUser(userData);
            localStorage.setItem('pt_user', JSON.stringify(userData));
            return userData;
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutApi();
        } catch {
            // ignore
        } finally {
            setUser(null);
            localStorage.removeItem('pt_user');
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, logout, clearError }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
