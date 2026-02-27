import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function Login() {
    const { login, loading, error, clearError } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        clearError();
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch {
            // error shown via context
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to PrimeTrade</p>
                </div>

                <Alert message={error} onClose={clearError} />

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-50"
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                    No account?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
