import { useEffect, useRef, useState } from "react";
import {
  Send, Paperclip, LogOut, Users, Hash, Smile,
  MoreVertical, Phone, Video, Search, MessageCircle,
  Sun, Moon, Wifi, WifiOff, Copy, Check
} from "lucide-react";
import { useChatContext } from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const ChatPage = () => {
  const {
    roomId, currentUser, connected,
    setConnected, setRoomId, setCurrentUser,
  } = useChatContext();

  const navigate  = useNavigate();
  const [messages, setMessages]               = useState([]);
  const [input, setInput]                     = useState("");
  const [isTyping, setIsTyping]               = useState(false);
  const [onlineCount, setOnlineCount]         = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [dark, setDark]                       = useState(true);
  const [wsStatus, setWsStatus]               = useState("connecting");
  const [sending, setSending]                 = useState(false);
  const [copied, setCopied]                   = useState(false);

  const inputRef    = useRef(null);
  const chatBoxRef  = useRef(null);
  const stompRef    = useRef(null);

  /* ── theme ── */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  /* ── guard ── */
  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected, navigate]);

  /* ── load history ── */
  useEffect(() => {
    async function load() {
      try {
        const msgs = await getMessagess(roomId);
        setMessages(msgs);
      } catch (e) { console.error(e); }
    }
    if (connected) load();
  }, [connected, roomId]);

  /* ── auto-scroll ── */
  useEffect(() => {
    if (chatBoxRef.current)
      chatBoxRef.current.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /* ── typing indicator ── */
  useEffect(() => {
    if (!input.length) { setIsTyping(false); return; }
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 1000);
    return () => clearTimeout(t);
  }, [input]);

  /* ── websocket ── */
  useEffect(() => {
    if (!connected) return;
    let reconnectTimer = null;

    const connect = () => {
      setWsStatus("connecting");
      const sock   = new SockJS(`${baseURL}/chat`, null, { transports: ["websocket", "xhr-streaming", "xhr-polling"] });
      const client = Stomp.over(sock);
      client.debug  = () => {};

      client.connect({}, () => {
        stompRef.current = client;
        setWsStatus("live");
        toast.success("Connected to MyVibe!");

        // Subscribe to messages
        client.subscribe(`/topic/room/${roomId}`, (msg) => {
          const newMsg = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMsg]);
        });

        // Subscribe to live user count
        client.subscribe(`/topic/room/${roomId}/users`, (msg) => {
          const count = JSON.parse(msg.body);
          setOnlineCount(count);
        });

      }, (err) => {
        console.error(err);
        setWsStatus("lost");
        toast.error("Connection lost. Retrying…");
        reconnectTimer = setTimeout(connect, 3000);
      });
    };

    connect();
    return () => { if (reconnectTimer) clearTimeout(reconnectTimer); };
  }, [connected, roomId]);

  /* ── send ── */
  const sendMessage = () => {
    const client = stompRef.current;
    if (!client || !connected || !input.trim()) return;
    setSending(true);
    const msg = { sender: currentUser, content: input, roomId };
    client.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(msg));
    setInput("");
    setShowEmojiPicker(false);
    setTimeout(() => setSending(false), 300);
  };

  /* ── copy room id ── */
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── logout ── */
  const handleLogout = () => {
    if (stompRef.current) stompRef.current.disconnect();
    setConnected(false); setRoomId(""); setCurrentUser("");
    navigate("/");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ── avatar colour (deterministic) ── */
  const avatarColor = (name = "") => {
    const hues = [210, 260, 320, 150, 30, 190, 350, 80];
    return `hsl(${hues[name.charCodeAt(0) % hues.length]}, 65%, 55%)`;
  };

  /* ── status badge ── */
  const StatusBadge = () => {
    const map = {
      connecting: { color: "text-amber-400", dot: "bg-amber-400", label: "Connecting…" },
      live:       { color: "text-emerald-400", dot: "bg-emerald-400", label: "Live" },
      lost:       { color: "text-red-400", dot: "bg-red-400", label: "Reconnecting…" },
    };
    const s = map[wsStatus];
    return (
      <span className={`flex items-center gap-1.5 text-xs font-medium ${s.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
        {s.label}
      </span>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .syne { font-family: 'Syne', sans-serif; }

        /* grid bg */
        .chat-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(#e4e4e7 1px, transparent 1px),
            linear-gradient(90deg, #e4e4e7 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: .35;
        }
        .dark .chat-grid {
          background-image:
            linear-gradient(#27272a 1px, transparent 1px),
            linear-gradient(90deg, #27272a 1px, transparent 1px);
          opacity: .2;
        }

        /* scrollbar */
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,.3); border-radius: 99px; }
        .dark .chat-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,.25); }

        /* message pop-in */
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px) scale(.97); }
          to   { opacity: 1; transform: none; }
        }
        .msg-in { animation: msgIn .22s cubic-bezier(.22,1,.36,1) both; }

        /* send button pulse */
        @keyframes sendPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(.88); }
          100% { transform: scale(1); }
        }
        .send-pop { animation: sendPop .3s ease; }

        /* typing dots */
        @keyframes typingDot {
          0%,80%,100% { transform: scale(0); opacity: .4; }
          40%          { transform: scale(1);   opacity: 1; }
        }
        .typing-dot { animation: typingDot 1.2s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: .15s; }
        .typing-dot:nth-child(3) { animation-delay: .3s; }

        /* copy button pop */
        @keyframes copyPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .copy-pop { animation: copyPop .25s ease; }

        /* emoji picker override */
        em-emoji-picker { --border-radius: 16px; --shadow: 0 16px 40px rgba(0,0,0,.25); }
      `}</style>

      {/* ── HEADER ── */}
      <header className="
        relative z-10 flex-shrink-0
        bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl
        border-b border-zinc-200 dark:border-zinc-800
        px-4 sm:px-6 py-3
      ">
        <div className="flex items-center justify-between gap-3">

          {/* Left — logo + room info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_14px_rgba(99,102,241,.4)]">
              <MessageCircle size={17} color="#fff" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="syne font-bold text-base text-zinc-900 dark:text-zinc-50 leading-none">MyVibe</span>
                <span className="hidden sm:block text-zinc-300 dark:text-zinc-700 text-sm">/</span>

                {/* Room ID + Copy button */}
                <div className="hidden sm:flex items-center gap-1">
                  <span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]">
                    <Hash size={12} className="flex-shrink-0" />{roomId}
                  </span>
                  <button
                    onClick={copyRoomId}
                    title="Copy room code"
                    className={`
                      w-6 h-6 flex items-center justify-center rounded-lg
                      transition-all duration-150
                      ${copied
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 copy-pop"
                        : "text-zinc-400 dark:text-zinc-500 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-500 dark:hover:text-indigo-400"
                      }
                    `}
                  >
                    {copied
                      ? <Check size={12} />
                      : <Copy size={12} />
                    }
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-0.5">
                {/* Live user count */}
                <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                  <Users size={11} />
                  <span className="tabular-nums font-semibold text-indigo-400">{onlineCount}</span>
                  <span>{onlineCount === 1 ? "user" : "users"} online</span>
                </span>

                <StatusBadge />

                {isTyping && (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-400">
                    <span className="flex gap-0.5">
                      {[0,1,2].map(i => <span key={i} className="typing-dot w-1 h-1 rounded-full bg-indigo-400 inline-block" />)}
                    </span>
                    typing…
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">

            {/* Mobile copy button (visible only on small screens) */}
            <button
              onClick={copyRoomId}
              title="Copy room code"
              className={`
                sm:hidden w-8 h-8 flex items-center justify-center rounded-xl
                transition-all duration-150
                ${copied
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500"
                  : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-500"
                }
              `}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>

            {[
              { icon: Search, label: "Search", show: "hidden sm:flex" },
              { icon: Phone,  label: "Voice",  show: "hidden sm:flex" },
              { icon: Video,  label: "Video",  show: "hidden sm:flex" },
            ].map(({ icon: Icon, label, show }) => (
              <button key={label} title={label}
                className={`
                  ${show} w-8 h-8 items-center justify-center rounded-xl
                  text-zinc-400 dark:text-zinc-500
                  hover:bg-zinc-100 dark:hover:bg-zinc-800
                  hover:text-zinc-700 dark:hover:text-zinc-300
                  transition-all duration-150
                `}>
                <Icon size={16} />
              </button>
            ))}

            {/* theme toggle */}
            <button
              onClick={() => setDark(d => !d)}
              title="Toggle theme"
              className="
                w-8 h-8 flex items-center justify-center rounded-xl
                text-zinc-400 dark:text-zinc-500
                hover:bg-zinc-100 dark:hover:bg-zinc-800
                hover:text-indigo-500 dark:hover:text-indigo-400
                border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700
                transition-all duration-150
              ">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* user chip */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 ml-1">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ background: avatarColor(currentUser) }}>
                {currentUser?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[80px] truncate">{currentUser}</span>
            </div>

            {/* leave */}
            <button onClick={handleLogout}
              className="
                flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium
                bg-red-50 dark:bg-red-500/10
                border border-red-200 dark:border-red-500/25
                text-red-500 dark:text-red-400
                hover:bg-red-100 dark:hover:bg-red-500/20
                active:scale-95
                transition-all duration-150
              ">
              <LogOut size={13} />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MESSAGE AREA ── */}
      <main
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto chat-scroll relative px-4 sm:px-6 py-4 space-y-3"
      >
        {/* grid bg */}
        <div className="chat-grid" />

        {/* glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,.07) 0%, transparent 70%)" }} />

        {messages.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/10 flex items-center justify-center">
              <MessageCircle size={26} className="text-indigo-400 opacity-60" />
            </div>
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No messages yet — say hi! 👋</p>
          </div>
        )}

        {messages.map((message, index) => {
          const isMe = message.sender === currentUser;
          const prevSender = index > 0 ? messages[index - 1].sender : null;
          const isGrouped = prevSender === message.sender;

          return (
            <div key={index}
              className={`msg-in flex ${isMe ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-3"}`}
            >
              {/* Avatar (others) */}
              {!isMe && (
                <div className={`flex-shrink-0 mr-2.5 ${isGrouped ? "opacity-0 pointer-events-none" : ""}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: avatarColor(message.sender) }}>
                    {message.sender?.charAt(0)?.toUpperCase()}
                  </div>
                </div>
              )}

              <div className="max-w-[72%] sm:max-w-md group relative">
                {/* Sender name */}
                {!isMe && !isGrouped && (
                  <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mb-1 ml-1 block">{message.sender}</span>
                )}

                {/* Bubble */}
                <div className={`
                  relative px-4 py-2.5 text-sm leading-relaxed
                  ${isMe
                    ? "bg-indigo-500 text-white rounded-2xl rounded-br-sm shadow-[0_4px_16px_rgba(99,102,241,.3)]"
                    : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-bl-sm shadow-sm"
                  }
                `}>
                  <p className="break-words">{message.content}</p>

                  <div className={`flex items-center gap-1.5 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className={`text-[10px] ${isMe ? "text-white/60" : "text-zinc-400 dark:text-zinc-500"}`}>
                      {timeAgo(message.timeStamp)}
                    </span>
                    {isMe && (
                      <svg width="14" height="9" viewBox="0 0 14 9" fill="none" className="opacity-70">
                        <path d="M1 4.5L4.5 8L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 4.5L8.5 8L13 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>

                {/* hover action */}
                <button className="
                  absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity
                  w-6 h-6 rounded-lg flex items-center justify-center
                  bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                  text-zinc-400
                  shadow-sm
                "
                  style={{ [isMe ? "left" : "right"]: "-30px" }}>
                  <MoreVertical size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {/* ── INPUT BAR ── */}
      <div className="relative z-10 flex-shrink-0 px-4 sm:px-6 pb-5 pt-2">
        <div className="
          relative
          bg-white dark:bg-zinc-900
          border border-zinc-200 dark:border-zinc-800
          rounded-2xl
          shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,.4)]
          ring-1 ring-inset ring-white/60 dark:ring-white/[.03]
          overflow-visible
        ">
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-[calc(100%+10px)] right-0 z-50">
              <Picker
                data={data}
                theme={dark ? "dark" : "light"}
                onEmojiSelect={(emoji) => {
                  setInput((p) => p + emoji.native);
                  inputRef.current?.focus();
                }}
              />
            </div>
          )}

          <div className="flex items-end gap-2 px-3 py-3">
            {/* Attach */}
            <button title="Attach file"
              className="
                w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl
                text-zinc-400 dark:text-zinc-500
                hover:bg-zinc-100 dark:hover:bg-zinc-800
                hover:text-zinc-600 dark:hover:text-zinc-300
                transition-all duration-150
              ">
              <Paperclip size={17} />
            </button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Send a message…"
                rows={1}
                className="
                  w-full bg-transparent text-sm
                  text-zinc-800 dark:text-zinc-100
                  placeholder-zinc-400 dark:placeholder-zinc-600
                  resize-none outline-none py-2 pr-8
                  leading-relaxed
                "
                style={{ minHeight: "36px", maxHeight: "120px" }}
              />
              {/* Emoji toggle */}
              <button
                onClick={() => setShowEmojiPicker(v => !v)}
                title="Emoji"
                className={`
                  absolute right-0 top-1/2 -translate-y-1/2
                  w-7 h-7 flex items-center justify-center rounded-lg
                  transition-all duration-150
                  ${showEmojiPicker
                    ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }
                `}>
                <Smile size={16} />
              </button>
            </div>

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`
                w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl
                transition-all duration-150
                ${input.trim()
                  ? "bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,.4)] hover:bg-indigo-400 active:scale-90"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                }
                ${sending ? "send-pop" : ""}
              `}>
              <Send size={15} className={input.trim() ? "translate-x-px" : ""} />
            </button>
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between px-4 pb-2.5 -mt-1">
            <span className={`text-[10px] text-zinc-400 dark:text-zinc-600 transition-opacity ${input.length ? "opacity-100" : "opacity-0"}`}>
              {input.length}/1000
            </span>
            <span className="text-[10px] text-zinc-300 dark:text-zinc-700 hidden sm:block">
              Enter to send · Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatPage;