import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Users, Plus, LogIn, RefreshCw, ArrowRight, Hash, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import { useChatContext } from "../context/ChatContext";
import { useNavigate } from "react-router";

/* ── Random Room ID helpers ── */
const ADJS  = ["Cosmic", "Neon", "Swift", "Vivid", "Solar", "Luna", "Sage", "Volt"];
const NOUNS = ["Den", "Loft", "Deck", "Cove", "Base", "Hub", "Zone", "Nest"];

const genId = () => {
  const a = ADJS[Math.floor(Math.random() * ADJS.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const d = Math.floor(1000 + Math.random() * 9000);
  return `${a}-${n}-${d}`;
};

/* ─────────────────────────────────────────────────── */

const JoinCreateChat = () => {
  const [detail, setDetail]     = useState({ roomId: "", userName: "" });
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading]   = useState(null); // "join" | "create" | null
  const [dark, setDark]         = useState(true);

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleChange = (e) =>
    setDetail((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleGen = useCallback(() => {
    setSpinning(true);
    setTimeout(() => {
      setDetail((p) => ({ ...p, roomId: genId() }));
      setSpinning(false);
    }, 420);
  }, []);

  useEffect(() => { handleGen(); }, []);

  const validate = () => {
    if (!detail.roomId.trim() || !detail.userName.trim()) {
      toast.error("Please fill in all fields");
      return false;
    }
    return true;
  };

  const joinChat = async () => {
    if (!validate() || loading) return;
    setLoading("join");
    try {
      const room = await joinChatApi(detail.roomId);
      toast.success("Joined room!");
      setCurrentUser(detail.userName);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (err) {
      toast.error(err?.status === 400 ? err.response.data : "Couldn't join room");
    } finally {
      setLoading(null);
    }
  };

  const createRoom = async () => {
    if (!validate() || loading) return;
    setLoading("create");
    try {
      const res = await createRoomApi(detail.roomId);
      toast.success("Room created!");
      setCurrentUser(detail.userName);
      setRoomId(res.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (err) {
      toast.error(err?.status === 400 ? "Room already exists" : "Couldn't create room");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="
      min-h-screen relative overflow-hidden flex items-center justify-center p-5
      bg-zinc-50 dark:bg-zinc-950
      transition-colors duration-300
    ">
      {/* ── Background grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#d4d4d8 1px, transparent 1px), linear-gradient(90deg, #d4d4d8 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* dark mode grid uses different color */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Glow orb ── */}
      <div
        className="absolute w-[560px] h-[560px] rounded-full pointer-events-none animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
        }}
      />

      {/* ── Theme toggle (desktop: absolute top-right, hidden on mobile) ── */}
      <button
        onClick={() => setDark((d) => !d)}
        className="
          hidden sm:flex
          absolute top-4 right-4 z-10
          w-10 h-10 rounded-xl items-center justify-center
          bg-white dark:bg-zinc-800
          border border-zinc-200 dark:border-zinc-700
          text-zinc-500 dark:text-zinc-400
          hover:border-indigo-400 dark:hover:border-indigo-500
          hover:text-indigo-500 dark:hover:text-indigo-400
          transition-all duration-200 shadow-sm
        "
        title="Toggle theme"
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* ── Card ── */}
      <div className="
        relative z-10 w-full max-w-[420px] rounded-3xl p-10 sm:p-10 p-7
        bg-white dark:bg-zinc-900
        border border-zinc-200 dark:border-zinc-800
        shadow-xl dark:shadow-[0_32px_64px_rgba(0,0,0,.6)]
        ring-1 ring-inset ring-white/60 dark:ring-white/[0.04]
      "
        style={{ animation: "cardIn .5s cubic-bezier(.22,1,.36,1) both" }}
      >
        <style>{`
          @keyframes cardIn {
            from { opacity: 0; transform: translateY(24px) scale(.97); }
            to   { opacity: 1; transform: none; }
          }
          @keyframes spinAnim { to { transform: rotate(360deg); } }
          .spin-anim { animation: spinAnim .7s linear infinite; }
          @keyframes blinkDot {
            0%, 100% { opacity: 1; }
            50%       { opacity: .35; }
          }
          .blink { animation: blinkDot 2s ease-in-out infinite; }
        `}</style>

        {/* Logo row — logo on left, theme toggle on right (mobile only) */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              bg-indigo-500
              shadow-[0_0_16px_rgba(99,102,241,.45)]
            ">
              <MessageCircle size={20} color="#fff" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-50"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              MyVibe
            </span>
          </div>

          {/* Theme toggle — visible only on mobile */}
          <button
            onClick={() => setDark((d) => !d)}
            className="
              flex sm:hidden
              w-9 h-9 rounded-xl items-center justify-center flex-shrink-0
              bg-zinc-100 dark:bg-zinc-800
              border border-zinc-200 dark:border-zinc-700
              text-zinc-500 dark:text-zinc-400
              hover:border-indigo-400 dark:hover:border-indigo-500
              hover:text-indigo-500 dark:hover:text-indigo-400
              active:scale-90
              transition-all duration-200
            "
            title="Toggle theme"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Heading */}
        <h1
          className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2 leading-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Start a conversation
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
          Create a private room or join an existing one with a Room ID.
        </p>

        {/* Username field */}
        <div className="mb-5">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
            <Users size={11} />
            Display name
          </label>
          <input
            className="
              w-full h-12 px-4 rounded-xl text-sm
              bg-zinc-100 dark:bg-zinc-800
              border border-zinc-200 dark:border-zinc-700
              text-zinc-900 dark:text-zinc-100
              placeholder-zinc-400 dark:placeholder-zinc-600
              outline-none
              focus:border-indigo-500 dark:focus:border-indigo-500
              focus:ring-2 focus:ring-indigo-500/20
              transition-all duration-200
            "
            type="text"
            name="userName"
            placeholder="e.g. Rupam"
            value={detail.userName}
            onChange={handleChange}
            autoComplete="off"
            maxLength={32}
          />
        </div>

        {/* Room ID field */}
        <div className="mb-5">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
            <Hash size={11} />
            Room ID
          </label>
          <div className="flex gap-2">
            <input
              className="
                flex-1 h-12 px-4 rounded-xl text-sm
                bg-zinc-100 dark:bg-zinc-800
                border border-zinc-200 dark:border-zinc-700
                text-zinc-900 dark:text-zinc-100
                placeholder-zinc-400 dark:placeholder-zinc-600
                outline-none
                focus:border-indigo-500 dark:focus:border-indigo-500
                focus:ring-2 focus:ring-indigo-500/20
                transition-all duration-200
              "
              type="text"
              name="roomId"
              placeholder="Enter or generate a Room ID"
              value={detail.roomId}
              onChange={handleChange}
              autoComplete="off"
            />
            <button
              className="
                w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl
                bg-zinc-100 dark:bg-zinc-800
                border border-zinc-200 dark:border-zinc-700
                text-zinc-400 dark:text-zinc-500
                hover:border-indigo-400 dark:hover:border-indigo-500
                hover:text-indigo-500 dark:hover:text-indigo-400
                hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
              onClick={handleGen}
              disabled={spinning}
              title="Generate Room ID"
            >
              <RefreshCw size={16} className={spinning ? "spin-anim" : ""} />
            </button>
          </div>
          <p className="text-[11.5px] text-zinc-400 dark:text-zinc-600 mt-1.5 pl-0.5">
            {spinning ? "Generating…" : "Hit ↺ for a random Room ID"}
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            choose action
          </span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Join */}
          <button
            className="
              h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2
              bg-white dark:bg-zinc-800
              border border-zinc-300 dark:border-zinc-600
              text-zinc-700 dark:text-zinc-200
              hover:border-indigo-400 dark:hover:border-indigo-500
              hover:shadow-[0_0_0_1px_theme(colors.indigo.400)] dark:hover:shadow-[0_0_0_1px_theme(colors.indigo.500)]
              active:scale-95
              disabled:opacity-45 disabled:cursor-not-allowed disabled:scale-100
              transition-all duration-150
            "
            onClick={joinChat}
            disabled={!!loading}
          >
            {loading === "join" ? (
              <><RefreshCw size={15} className="spin-anim" /> Joining…</>
            ) : (
              <><LogIn size={15} /> Join Room</>
            )}
          </button>

          {/* Create */}
          <button
            className="
              h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2
              bg-indigo-500
              text-white
              shadow-[0_4px_16px_rgba(99,102,241,.4)]
              hover:shadow-[0_6px_24px_rgba(99,102,241,.55)]
              hover:bg-indigo-400
              active:scale-95
              disabled:opacity-45 disabled:cursor-not-allowed disabled:scale-100
              transition-all duration-150
            "
            onClick={createRoom}
            disabled={!!loading}
          >
            {loading === "create" ? (
              <><RefreshCw size={15} className="spin-anim" /> Creating…</>
            ) : (
              <><Plus size={15} /> Create Room</>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-7 pt-5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-5">
          <span className="flex items-center gap-1.5 text-[11.5px] text-zinc-400 dark:text-zinc-500">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 blink"
              style={{ boxShadow: "0 0 6px #22c55e" }}
            />
            End-to-end private
          </span>
          <span className="flex items-center gap-1.5 text-[11.5px] text-zinc-400 dark:text-zinc-500">
            <ArrowRight size={11} />
            No sign-up needed
          </span>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;