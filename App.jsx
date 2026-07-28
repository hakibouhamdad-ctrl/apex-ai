import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Search, Plus, Mic, Send, Settings, User, 
  Sun, Moon, ChevronLeft, ChevronRight, LogOut, Download,
  Menu, X, Zap, Clock, AlertCircle
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// ==================== CONFIGURATION FIREBASE ====================
const firebaseConfig = {
  apiKey: "AIzaSyCq0OxliLM4b6i-6QRyNYgJtlElawCoeOU",
  authDomain: "apex-ai-a323f.firebaseapp.com",
  projectId: "apex-ai-a323f",
  storageBucket: "apex-ai-a323f.firebasestorage.app",
  messagingSenderId: "1024915479428",
  appId: "1:1024915479428:web:67061babface72020c5bd1",
  measurementId: "G-J5B6HWWTPD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// ==================== APPLICATION PRINCIPALE ====================
export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('apex-3.0');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [quotaMessage, setQuotaMessage] = useState('');
  
  const messagesEndRef = useRef(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';
  const secondaryBg = isDark ? 'bg-gray-900' : 'bg-gray-100';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || 'Utilisateur Apex',
          photoURL: currentUser.photoURL || ''
        });
        setCurrentPage('chat');
      } else {
        setUser(null);
        setCurrentPage('landing');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Erreur lors de la connexion Google.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCurrentPage('landing');
      setMessages([]);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsgText = inputMessage;
    const userMessage = {
      id: Date.now(),
      text: userMsgText,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://apex-backend-y4gf.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          model_id: selectedModel,
          user_email: user?.email
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        setQuotaMessage("Limite atteinte ! Attends 1 minute pour réutiliser Apex.");
      } else {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response || "Une erreur s'est produite.",
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Impossible de contacter le serveur Apex.",
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <span className="text-6xl font-black italic">A</span>
      </div>
    );
  }

  // Écran d'accueil / Landing Page
  if (currentPage === 'landing') {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col justify-between p-6`}>
        <nav className="flex justify-between items-center max-w-6xl mx-auto w-full py-4">
          <span className="text-4xl font-black italic">A</span>
          <button 
            onClick={handleLogin}
            className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-all"
          >
            Se connecter
          </button>
        </nav>

        <main className="text-center max-w-3xl mx-auto my-auto py-12">
          <h1 className="text-6xl font-extrabold mb-6">
            Bienvenue sur <span className="italic">Apex AI</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            L'intelligence artificielle conçue et développée par HAKIBOU Hamdad.
          </p>
          <button 
            onClick={handleLogin}
            className="bg-white text-black text-lg px-8 py-4 rounded-full font-bold hover:scale-105 transition-all"
          >
            Démarrer la discussion
          </button>
        </main>

        <footer className="text-center text-gray-500 text-sm">
          © 2026 Apex AI. Tous droits réservés.
        </footer>
      </div>
    );
  }

  // Écran de Chat
  return (
    <div className={`flex h-screen ${bgColor} ${textColor}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ${secondaryBg} ${borderColor} border-r flex flex-col overflow-hidden`}>
        <div className="p-4 flex justify-between items-center border-b border-gray-800">
          <span className="text-2xl font-black italic">Apex AI</span>
          <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        
        <div className="p-4 flex-1">
          <button 
            onClick={() => setMessages([])}
            className="w-full flex items-center gap-2 bg-white text-black font-semibold p-3 rounded-lg hover:bg-gray-200"
          >
            <Plus size={18} /> Nouvelle discussion
          </button>
        </div>

        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={20} />
            <span className="text-sm font-medium truncate">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-2">
              <Menu size={20} />
            </button>
          )}

          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className={`${secondaryBg} ${textColor} p-2 rounded-lg border ${borderColor} text-sm`}
          >
            <option value="apex-3.0">Apex 3.0 (DeepSeek)</option>
            <option value="apex-2.5">Apex 2.5 (Gemini Pro)</option>
            <option value="apex-2.0">Apex 2.0 (Groq)</option>
            <option value="apex-1.5">Apex 1.5 (Gemini Flash)</option>
          </select>

          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-2">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Pose une question à Apex AI...
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xl p-4 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : `${secondaryBg} ${textColor} border ${borderColor}`
                }`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="text-gray-400 text-sm animate-pulse">Apex est en train de réfléchir...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className={`p-4 border-t ${borderColor}`}>
          <div className={`flex items-center gap-2 ${secondaryBg} p-2 rounded-xl border ${borderColor}`}>
            <input 
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Écris ton message..."
              className={`flex-1 bg-transparent outline-none ${textColor} px-2`}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
    }
        
