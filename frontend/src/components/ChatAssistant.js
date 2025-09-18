'use client';
import { useState } from 'react';
import axios from 'axios';
import { Mic, Send } from 'lucide-react';

export default function ChatAssistant() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const handleAsk = async () => {
        if (!query) return;
        setIsLoading(true);
        setResponse('');
        try {
            const result = await axios.post('http://127.0.0.1:8000/chat', { query });
            setResponse(result.data.response);
        } catch (error) {
            setResponse('Sorry, I could not get an answer. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser doesn't support voice recognition.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
        };
        recognition.start();
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Ask an AI Assistant</h3>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    placeholder={isListening ? "Listening..." : "Ask about fertilizer, pests, etc."}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
                />
                <button 
                    onClick={handleVoiceInput} 
                    className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    <Mic size={20}/>
                </button>
                <button onClick={handleAsk} disabled={isLoading} className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:bg-gray-400">
                    <Send size={20}/>
                </button>
            </div>
            {isLoading && <p className="mt-4 text-center text-gray-600">Getting an answer...</p>}
            {response && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
                </div>
            )}
        </div>
    );
}