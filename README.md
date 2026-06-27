# ⟐ Oracle — Life Simulation Engine v2

A professional, futuristic AI life simulator with voice chat, account management, and PWA support.

---

## Features

- 🤖 **AI Life Simulation** — Groq-powered via Netlify Functions (Llama 3.3 70B)
- 🎙️ **Voice Chat** — Full speech-to-text (Web Speech API) + text-to-speech
- 🔐 **Accounts** — Email/password + Google sign-in via Firebase Auth
- 💾 **Cloud Storage** — Simulations saved to Firestore per user
- 📲 **PWA** — Install prompt, service worker, offline support
- 🌐 **6 Life Domains** — Career, Relationships, Health, Finance, Meaning, Growth
- 📱 **Responsive** — Works on desktop and mobile

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd oracle-app
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Add a **Web app**
3. Enable **Authentication** → Sign-in methods:
   - Email/Password ✓
   - Google ✓
4. Enable **Firestore Database** → Start in production mode
5. Add Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /simulations/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

6. Create `.env` in root:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=000000000000
REACT_APP_FIREBASE_APP_ID=1:000:web:abc123
```

### 3. Groq API Key

1. Get your key at [console.groq.com](https://console.groq.com)
2. Add to Netlify environment variables (NOT in code):
   - Key: `GROQ_API_KEY`
   - Value: `gsk_...`

### 4. Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

Or connect your GitHub repo in the Netlify dashboard — it will auto-detect the build settings from `netlify.toml`.

**Netlify environment variables to set:**
- `GROQ_API_KEY` = your Groq key
- `REACT_APP_FIREBASE_*` = all Firebase values above

### 5. Run Locally

```bash
# Install Netlify CLI for functions
npm install -g netlify-cli

# Add GROQ_API_KEY to .env
echo "GROQ_API_KEY=gsk_your_key" >> .env

# Run with Netlify dev (supports functions)
netlify dev
```

---

## PWA Icons

Add `icon-192.png` and `icon-512.png` to the `public/` folder.
You can use any ⟐ glyph on a dark purple background.

---

## Recommended Enhancements (next steps)

- [ ] Push notifications (remind users to check in daily)
- [ ] Simulation export to PDF
- [ ] Mood tracking sliders before each simulation
- [ ] Branching timeline visualization
- [ ] Sharing simulations with a link

---

## Architecture

```
oracle-app/
├── netlify/functions/groq.js     ← Groq API proxy (server-side)
├── public/
│   ├── index.html
│   ├── manifest.json             ← PWA manifest
│   └── sw.js                     ← Service worker
├── src/
│   ├── lib/
│   │   ├── firebase.js           ← Auth + Firestore helpers
│   │   └── AuthContext.js        ← React auth state
│   ├── pages/
│   │   ├── Landing.js            ← Marketing homepage
│   │   ├── Auth.js               ← Sign in / Sign up
│   │   ├── Dashboard.js          ← User dashboard + history
│   │   ├── Simulation.js         ← Core chat + voice interface
│   │   └── Account.js            ← Profile management
│   ├── components/
│   │   └── InstallBanner.js      ← PWA install prompt
│   ├── styles/globals.css        ← Design system
│   └── App.js                    ← Router + PWA bootstrap
└── netlify.toml                  ← Build + redirect config
```
