import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Plus,
  MessageSquare,
  User,
  LogOut,
  Sun,
  Moon,
  Settings,
  X,
  ChevronDown,
  Menu,
  Crown,
  Info,
  Palette,
  Sparkles,
  AlertTriangle,
  Clock,
  Mail,
  MessageCircle,
  Trash2,
  Bot,
} from "lucide-react";
import { loginWithGoogle, logout, subscribeToAuthChanges } from "./firebase";

/* ============================================================
   CONFIGURATION
   ============================================================ */

const API_URL = "https://apex-backend-y4gf.onrender.com/api/chat";
const ADMIN_EMAIL = "hakibouhamdad@gmail.com";
const WHATSAPP_URL = "https://wa.me/22942620879";
const GMAIL_URL = "mailto:hakibouhamdad@gmail.com";
const APP_VERSION = "1.0.0";

const MODELS = [
  {
    id: "apex-3.0",
    label: "Apex 3.0 Reasoning",
    desc: "Raisonnement avancé (DeepSeek)",
  },
  {
    id: "apex-2.5",
    label: "Apex 2.5 Pro",
    desc: "Polyvalent et puissant (Gemini Pro)",
  },
  {
    id: "apex-2.0",
    label: "Apex 2.0",
    desc: "Ultra rapide (Groq)",
  },
  {
    id: "apex-openrouter",
    label: "Apex OpenRouter",
    desc: "Multi-modèles (OpenRouter)",
  },
  {
    id: "apex-1.5",
    label: "Apex 1.5",
    desc: "Rapide et léger (Gemini Flash)",
  },
  {
    id: "apex-mistral",
    label: "Apex Mistral",
    desc: "Modèle léger (Mistral)",
  },
];

const FORBIDDEN_NAMES = [
  "gemini",
  "chatgpt",
  "gpt-4",
  "gpt-3",
  "openai",
  "deepseek",
  "mistral ai",
  "groq",
  "claude",
  "anthropic",
  "google ai",
  "je suis gemini",
  "je suis chatgpt",
  "développé par google",
  "développé par openai",
];

/* ============================================================
   HELPERS
   ============================================================ */

function sanitizeIdentity(text) {
  if (!text) return text;
  let cleaned = text;
  FORBIDDEN_NAMES.forEach((name) => {
    const regex = new RegExp(name, "gi");
    cleaned = cleaned.replace(regex, "Apex AI");
  });
  return cleaned;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatNextResetTime() {
  const now = new Date();
  const next = new Date(now);
  const currentHour = now.getHours();
  const resetHours = [1, 7, 13, 19];
  let nextHour = resetHours.find((h) => h > currentHour);
  if (nextHour === undefined) {
    next.setDate(next.getDate() + 1);
    nextHour = resetHours[0];
  }
  next.setHours(nextHour, 0, 0, 0);
  return next.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function loadConversations() {
  try {
    const raw = localStorage.getItem("apex_conversations");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(convs) {
  try {
    localStorage.setItem("apex_conversations", JSON.stringify(convs));
  } catch (e) {
    console.error("Erreur sauvegarde locale:", e);
  }
}

/* ============================================================
   LOGO
   ============================================================ */

function ApexLogo({ size = "text-2xl", className = "" }) {
  return (
    <span
      className={`${size} font-black italic tracking-tight select-none ${className}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      A<span className="text-indigo-500">pex</span>
    </span>
  );
}

/* ============================================================
   LANDING PAGE
   ============================================================ */

function LandingPage({ onLogin, loading, theme, toggleTheme }) {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Multi-modèles",
      desc: "Choisissez parmi 6 modèles Apex AI adaptés à chaque besoin, de la rapidité au raisonnement profond.",
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Identité unifiée",
      desc: "Une seule IA, Apex AI, cohérente et fiable, quel que soit le moteur utilisé en coulisses.",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Design soigné",
      desc: "Interface sombre par défaut, bascule fluide vers le mode clair, expérience fluide sur mobile et desktop.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <ApexLogo size="text-3xl" />
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-apexgray3 hover:opacity-80 transition"
            aria-label="Changer de thème"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      <section className="flex flex-col items-center text-center px-6 pt-16 pb-24 md:pt-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          Propulsé par Apex AI
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold max-w-3xl leading-tight animate-slide-up">
          L'IA qui pense{" "}
          <span className="italic font-black text-indigo-500">avec vous</span>
        </h1>
        <p className="mt-6 max-w-xl text-gray-600 dark:text-gray-400 text-lg animate-slide-up">
          Apex AI combine plusieurs moteurs d'intelligence artificielle pour
          vous offrir des réponses rapides, précises et adaptées à chaque
          situation.
        </p>
        <button
          onClick={onLogin}
          disabled={loading}
          className="mt-10 flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 active:scale-95 transition-transform shadow-xl disabled:opacity-60"
        >
          {loading ? (
            <span>Connexion...</span>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
              Se connecter avec Google
            </>
          )}
        </button>
      </section>

      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-gray-50 dark:bg-apexgray2 border border-gray-100 dark:border-apexgray3 hover:border-indigo-500/50 transition"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-3">Contactez-nous</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Une question, une suggestion ? Contactez directement l'équipe Apex
          AI.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
          <a
            href={GMAIL_URL}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            <Mail className="w-5 h-5" />
            Gmail
          </a>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-apexgray3">
        © 2026 Apex AI. Tous droits réservés. Développé par HAKIBOU Hamdad.
      </footer>
    </div>
  );
}

/* ============================================================
   SETTINGS MODAL
   ============================================================ */

function SettingsModal({ isOpen, onClose, theme, toggleTheme, user, isAdmin }) {
  const [tab, setTab] = useState("display");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-apexgray2 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-apexgray3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-apexgray3 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-100 dark:border-apexgray3">
          <button
            onClick={() => setTab("display")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              tab === "display"
                ? "text-indigo-500 border-b-2 border-indigo-500"
                : "text-gray-500"
            }`}
          >
            Affichage
          </button>
          <button
            onClick={() => setTab("about")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              tab === "about"
                ? "text-indigo-500 border-b-2 border-indigo-500"
                : "text-gray-500"
            }`}
          >
            Infos / À propos
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {tab === "display" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-apexgray3">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="font-medium">Thème</p>
                    <p className="text-xs text-gray-500">
                      {theme === "dark" ? "Mode sombre actif" : "Mode clair actif"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-white dark:bg-apexgray2 hover:opacity-80 transition"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-600" />
                  )}
                </button>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-apexgray3">
                <p className="font-medium mb-1">Compte connecté</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {isAdmin && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-500 text-xs font-bold">
                    <Crown className="w-3.5 h-3.5" />
                    ADMIN / CREATOR — Accès illimité
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "about" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ApexLogo size="text-2xl" />
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Apex AI est une plateforme d'intelligence artificielle
                conversationnelle réunissant plusieurs moteurs IA sous une
                identité unique et cohérente : Apex AI.
              </p>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-apexgray3 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500" />
                  <p className="text-sm font-medium">Crédits de création</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conçu et développé intégralement par{" "}
                  <span className="font-semibold">HAKIBOU Hamdad</span>.
                </p>
              </div>
              <p className="text-xs text-gray-500 text-center pt-2">
                © 2026 Apex AI. Tous droits réservés.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MODEL SELECTOR
   ============================================================ */

function ModelSelector({ selectedModel, setSelectedModel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-apexgray3 hover:opacity-80 transition text-sm font-medium"
      >
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <span className="max-w-[120px] truncate">{current.label}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-apexgray2 rounded-xl shadow-2xl border border-gray-100 dark:border-apexgray3 overflow-hidden z-30 animate-fade-in">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedModel(m.id);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-apexgray3 transition flex flex-col ${
                m.id === selectedModel
                  ? "bg-indigo-500/5 border-l-2 border-indigo-500"
                  : ""
              }`}
            >
              <span className="font-medium text-sm">{m.label}</span>
              <span className="text-xs text-gray-500">{m.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SIDEBAR
   ============================================================ */

function Sidebar({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  user,
  isAdmin,
  onLogout,
  onOpenSettings,
}) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-72 bg-gray-50 dark:bg-apexgray2 border-r border-gray-100 dark:border-apexgray3 z-40 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <ApexLogo size="text-xl" />
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-apexgray3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Nouvelle discussion
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 mt-4 space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-gray-400 text-center mt-8 px-4">
              Aucune conversation pour le moment.
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition ${
                conv.id === activeId
                  ? "bg-indigo-500/10 text-indigo-500"
                  : "hover:bg-gray-100 dark:hover:bg-apexgray3"
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-100 dark:border-apexgray3">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-apexgray3 transition text-sm mb-1"
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </button>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-9 h-9 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.displayName || "Utilisateur"}
              </p>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                  <Crown className="w-3 h-3" />
                  ADMIN VIP
                </span>
              ) : (
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              )}
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-apexgray3 transition flex-shrink-0"
              aria-label="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ============================================================
   CHAT MESSAGE BUBBLE
   ============================================================ */

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      } animate-slide-up`}
    >
      <div
        className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!isUser && (
          <div className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0 text-xs font-black italic">
            A
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed markdown-content ${
            isUser
              ? "bg-indigo-500 text-white rounded-br-sm"
              : "bg-gray-100 dark:bg-apexgray3 text-black dark:text-white rounded-bl-sm"
          } ${message.isError ? "border border-red-500/50" : ""}`}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-end gap-2 max-w-[70%]">
        <div className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0 text-xs font-black italic">
          A
        </div>
        <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-apexgray3 flex items-center gap-2">
          <span className="text-sm text-gray-500">Apex réfléchit</span>
          <span className="flex gap-1">
            <span className="thinking-dot w-1.5 h-1.5 bg-gray-500 rounded-full inline-block" />
            <span className="thinking-dot w-1.5 h-1.5 bg-gray-500 rounded-full inline-block" />
            <span className="thinking-dot w-1.5 h-1.5 bg-gray-500 rounded-full inline-block" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   QUOTA BANNER
   ============================================================ */

function QuotaBanner({ resetTime }) {
  return (
    <div className="mx-4 mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-slide-up">
      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-500">
          Vous avez atteint votre limite d'utilisation.
        </p>
        <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
          <Clock className="w-3.5 h-3.5" />
          Vos crédits seront rechargés à {resetTime}.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD (APP PRINCIPALE APRÈS CONNEXION)
   ============================================================ */

function Dashboard({ user, isAdmin, theme, toggleTheme, onLogout }) {
  const [conversations, setConversations] = useState(() => loadConversations());
  const [activeId, setActiveId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("apex-2.5");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quotaReached, setQuotaReached] = useState(false);
  const [resetTime, setResetTime] = useState("");
  const messagesEndRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isLoading]);

  const createNewConversation = useCallback(() => {
    const newConv = {
      id: generateId(),
      title: "Nouvelle discussion",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setSidebarOpen(false);
  }, []);

  const deleteConversation = useCallback(
    (id) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  const updateConversationMessages = useCallback((convId, updater) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const newMessages = updater(c.messages);
        let title = c.title;
        if (c.messages.length === 0 && newMessages.length > 0) {
          const firstUserMsg = newMessages.find((m) => m.role === "user");
          if (firstUserMsg) {
            title = firstUserMsg.content.slice(0, 40) +
              (firstUserMsg.content.length > 40 ? "..." : "");
          }
        }
        return { ...c, messages: newMessages, title };
      })
    );
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || quotaReached) return;

    let convId = activeId;
    if (!convId) {
      const newConv = {
        id: generateId(),
        title: "Nouvelle discussion",
        messages: [],
        createdAt: Date.now(),
      };
      setConversations((prev) => [newConv, ...prev]);
      convId = newConv.id;
      setActiveId(convId);
    }

    const userMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
    };

    updateConversationMessages(convId, (msgs) => [...msgs, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          model_id: selectedModel,
          user_email: user?.email || "",
        }),
      });

      if (response.status === 429 || response.status === 403) {
        const next = formatNextResetTime();
        setResetTime(next);
        setQuotaReached(true);

        const errorMessage = {
          id: generateId(),
          role: "assistant",
          content:
            "⚠️ Vous avez atteint votre limite de requêtes. Vos crédits seront rechargés bientôt.",
          isError: true,
        };
        updateConversationMessages(convId, (msgs) => [...msgs, errorMessage]);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status})`);
      }

      const data = await response.json();
      const rawReply =
        data.reply ||
        data.message ||
        data.response ||
        data.content ||
        "Désolé, je n'ai pas pu générer de réponse.";

      const cleanReply = sanitizeIdentity(rawReply);

      const assistantMessage = {
        id: generateId(),
        role: "assistant",
        content: cleanReply,
      };

      updateConversationMessages(convId, (msgs) => [...msgs, assistantMessage]);
    } catch (error) {
      console.error("Erreur API:", error);
      const errorMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "❌ Une erreur est survenue lors de la communication avec Apex AI. Veuillez réessayer dans quelques instants.",
        isError: true,
      };
      updateConversationMessages(convId, (msgs) => [...msgs, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [
    input,
    isLoading,
    quotaReached,
    activeId,
    selectedModel,
    user,
    updateConversationMessages,
  ]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const inputDisabled = isLoading || (quotaReached && !isAdmin);

  return (
    <div className="h-screen w-full flex bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        user={user}
        isAdmin={isAdmin}
        onLogout={onLogout}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-apexgray3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-apexgray3"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm truncate max-w-[150px] md:max-w-xs">
              {activeConversation?.title || "Apex AI"}
            </span>
            {isAdmin && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-500 text-[10px] font-bold">
                <Crown className="w-3 h-3" />
                VIP
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-apexgray3 hover:opacity-80 transition"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-2xl font-black italic mb-4">
                A
              </div>
              <h2 className="text-xl font-bold mb-2">
                Bonjour {user?.displayName?.split(" ")[0] || ""} 👋
              </h2>
              <p className="text-gray-500 text-sm max-w-sm">
                Posez une question à Apex AI et commencez votre conversation.
              </p>
            </div>
          ) : (
            <>
              {activeConversation.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <ThinkingBubble />}
            </>
          )}
          <div ref={messagesEndRef} />
        </main>

        {quotaReached && !isAdmin && <QuotaBanner resetTime={resetTime} />}

        <div className="p-4 border-t border-gray-100 dark:border-apexgray3">
          <div
            className={`flex items-end gap-2 rounded-2xl border transition ${
              inputDisabled
                ? "border-gray-200 dark:border-apexgray3 opacity-50"
                : "border-gray-200 dark:border-apexgray3 focus-within:border-indigo-500"
            } bg-gray-50 dark:bg-apexgray2 px-3 py-2`}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={inputDisabled}
              rows={1}
              placeholder={
                inputDisabled && quotaReached
                  ? "Limite atteinte, veuillez patienter..."
                  : "Écrivez votre message à Apex AI..."
              }
              className="flex-1 resize-none bg-transparent outline-none text-sm py-2 px-1 max-h-32 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={inputDisabled || !input.trim()}
              className="p-2.5 rounded-xl bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-600 transition flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        isAdmin={isAdmin}
      />
    </div>
  );
}

/* ============================================================
   APP ROOT
   ============================================================ */

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("apex_theme");
    return saved || "dark";
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("apex_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Échec de la connexion:", error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Échec de la déconnexion:", error);
    }
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white text-2xl font-black italic animate-pulse-slow">
          Apex AI
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LandingPage
        onLogin={handleLogin}
        loading={loginLoading}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      isAdmin={isAdmin}
      theme={theme}
      toggleTheme={toggleTheme}
      onLogout={handleLogout}
    />
  );
        }
               
