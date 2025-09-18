'use client';
import { useState } from 'react';
import axios from 'axios';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await axios.post(`http://127.0.0.1:8000/login?email=${email}&password=${password}`);
            
            // Save the token to the browser's local storage
            localStorage.setItem('userToken', response.data.access_token);
            
            setMessage('Login successful! Redirecting...');
            
            // Redirect to the homepage
            window.location.href = '/'; 
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Login failed.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="flex justify-center">
                    <Leaf className="w-12 h-12 text-emerald-600"/>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="w-full py-2 px-4 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700">
                        Log In
                    </button>
                </form>
                {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
                 <p className="text-center text-sm">
                    Don't have an account?{' '}
                    <a href="/signup" className="font-medium text-emerald-600 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}