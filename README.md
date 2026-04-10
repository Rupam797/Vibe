# MyVibe Frontend - Real-Time Chat Experience 💬

A modern, high-performance, and visually stunning chat frontend built with React and Vite. MyVibe provides a seamless user experience with real-time updates, beautiful animations, and a production-grade UI.

## 🚀 Key Features

- **Real-Time Messaging**: Instant two-way communication powered by WebSockets and STOMP.
- **Dynamic Presence Tracking**: Real-time "User Joined" and "User Left" notifications with center-aligned pill badges.
- **Smart Online Counter**: Live tracking of active users in every chat room.
- **Hybrid Time Formatting**: Intelligent timestamps that show "just now" or "sec ago" for new messages before snapping to precise clock time.
- **Rich UI/UX**:
  - **Dark/Light Mode**: Fully responsive theme switching.
  - **Emoji Integration**: Integrated Emoji Mart for expressive conversations.
  - **Glassmorphic Design**: Modern header and input area with backdrop blurs and subtle gradients.
  - **Responsive Layout**: Optimized for mobile, tablet, and desktop views.
- **Copy-to-Clipboard**: One-click room ID sharing.
- **Auto-Scrolling**: Keeps you engaged with the latest messages automatically.

## 🛠️ Tech Stack

- **Framework**: [React.js](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Real-Time Communication**: [STOMP.js](https://stomp-js.github.io/stomp-websocket/) & [SockJS](https://github.com/sockjs/sockjs-client)
- **Navigation**: [React Router](https://reactrouter.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-link>
   cd front-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file or update `src/config/AxiosHelper.js` with your backend URL:
   ```javascript
   export const baseURL = "https://your-backend-url.render.com";
   ```

4. **Run in Development Mode**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 📸 Screenshots
## - Join page
<img width="1919" height="870" alt="Screenshot 2026-04-10 143703" src="https://github.com/user-attachments/assets/893ed009-7ed3-42b2-9428-7459ec706263" />
## - Chat Page
<img width="1910" height="860" alt="Screenshot 2026-04-10 143642" src="https://github.com/user-attachments/assets/851a07bf-5968-43e0-aa8e-77b8771d9afb" />

## 📄 License
This project is licensed under the MIT License.
