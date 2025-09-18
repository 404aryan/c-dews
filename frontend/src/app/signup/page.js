'use client';
import { useState } from 'react';
import axios from 'axios';
import { Leaf } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await axios.post(`http://127.0.0.1:8000/register?email=${email}&password=${password}`);
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response.data.detail || 'Signup failed.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="flex justify-center">
                    <Leaf className="w-12 h-12 text-emerald-600"/>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800">Create Your Account</h2>
                <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <button type="submit" className="w-full py-2 px-4 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700">
                        Sign Up
                    </button>
                </form>
                {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
            </div>
        </div>
    );
}