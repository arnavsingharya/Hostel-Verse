/* --- HOSTELVERSE ONLINE v4.0 (Firebase Edition) --- */
console.log("HostelVerse Online 🚀");

// --- 1. PASTE YOUR FIREBASE CONFIG HERE ---
// (Get this from the Firebase Console > Project Settings)
const firebaseConfig = {
    apiKey: "AIzaSyD... (PASTE YOURS HERE)",
    authDomain: "hostelverse-....firebaseapp.com",
    databaseURL: "https://hostelverse-....firebasedatabase.app",
    projectId: "hostelverse-...",
    storageBucket: "hostelverse-...",
    messagingSenderId: "...",
    appId: "..."
};

// --- 2. INITIALIZE DATABASE ---
let db;
// We wait for the window.firebase object (loaded from HTML)
document.addEventListener('DOMContentLoaded', () => {
    if (window.firebase) {
        const app = window.firebase.initializeApp(firebaseConfig);
        db = window.firebase.getDatabase(app);
        
        // If we are on the feed page, start listening for live updates
        if (document.getElementById('feed-container')) {
            listenForConfessions();
        }
    } else {
        console.error("Firebase not loaded! Check your HTML <head>.");
    }
});

// --- CONFIGURATION ---
const avatars = ['🦊', '🐱', '🦄', '👻', '🤖', '👾', '🐸', '🦁', '🐵', '🐼', '🐯', '🐙'];

// --- CONFESSION LOGIC (SEND TO CLOUD) ---
function submitConfession() {
    const input = document.getElementById('confessionInput');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return alert("Write something first!");

    // Create Post Object
    const newConfession = {
        id: Date.now(),
        text: text,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        likes: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deviceId: getDeviceId() // To track who owns this post
    };

    // PUSH to Firebase (Cloud)
    const { ref, push } = window.firebase;
    const postsRef = ref(db, 'confessions');
    push(postsRef, newConfession);

    // Go to feed
    window.location.href = 'index.html';
}

// --- FEED LOGIC (LISTEN TO CLOUD) ---
function listenForConfessions() {
    const container = document.getElementById('feed-container');
    const { ref, onValue } = window.firebase;
    const postsRef = ref(db, 'confessions');

    // This runs AUTOMATICALLY whenever the database changes!
    onValue(postsRef, (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = `<p style="text-align:center; opacity:0.5; margin-top: 2rem;">No tea yet. Be the first!</p>`;
            return;
        }

        // Convert object to array and reverse (newest first)
        const confessions = Object.entries(data).map(([key, val]) => ({
            firebaseKey: key, // We need this key to update/delete
            ...val
        })).reverse();

        renderFeed(container, confessions);
    });
}

function renderFeed(container, confessions) {
    const myDeviceId = getDeviceId();
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');

    container.innerHTML = confessions.map(post => {
        const isLiked = likedPosts.includes(post.firebaseKey);
        const isMine = post.deviceId === myDeviceId;

        const likeColor = isLiked ? "#bc13fe" : "white";
        const likeIcon = isLiked ? "🔥" : "🕯️";
        
        // Delete button uses the Firebase Key
        const deleteBtnHtml = isMine 
            ? `<button onclick="deletePost('${post.firebaseKey}')" style="color: #ff4757; background: rgba(255, 71, 87, 0.1); border: 1px solid #ff4757; padding: 5px 10px; border-radius: 8px; font-size: 0.8rem; margin-left: auto;">🗑️ Delete</button>` 
            : '';

        return `
        <div class="glass-card">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <span style="font-size:1.5rem;">${post.avatar}</span>
                <small style="opacity:0.5;">Anonymous • ${post.time}</small>
            </div>
            <p style="white-space: pre-wrap; margin-bottom: 15px;">${post.text}</p>
            <div style="display:flex; align-items:center; justify-content: space-between; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <button onclick="likePost('${post.firebaseKey}', ${post.likes})" style="background:none; border:none; color:${likeColor}; cursor:pointer; font-size: 1rem; font-weight:bold;">${likeIcon} ${post.likes}</button>
                ${deleteBtnHtml}
            </div>
        </div>`;
    }).join('');
}

// --- ACTIONS (UPDATE CLOUD) ---
function likePost(firebaseKey, currentLikes) {
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (likedPosts.includes(firebaseKey)) return;

    // Update in Cloud
    const { ref, update } = window.firebase;
    const postRef = ref(db, 'confessions/' + firebaseKey);
    update(postRef, { likes: currentLikes + 1 });

    // Save locally so I can't like again
    likedPosts.push(firebaseKey);
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
}

function deletePost(firebaseKey) {
    if (confirm("Delete this?")) {
        const { ref, remove } = window.firebase;
        const postRef = ref(db, 'confessions/' + firebaseKey);
        remove(postRef);
    }
}

// --- HELPER: Identify User (For ownership) ---
function getDeviceId() {
    let id = localStorage.getItem('deviceId');
    if (!id) {
        id = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', id);
    }
    return id;
}

// --- GAMES LOGIC (Local Only) ---
// (Paste your Games Logic: Spin Bottle, Truth/Dare, Flames here. They don't need cloud.)
function spinBottle() {
    const bottle = document.getElementById('bottle');
    if (bottle) {
        let currentRotation = parseInt(bottle.getAttribute('data-rotation') || 0);
        currentRotation += Math.floor(Math.random() * 3000) + 720;
        bottle.style.transform = `rotate(${currentRotation}deg)`;
        bottle.setAttribute('data-rotation', currentRotation);
    }
}
// ... Add your getToD(), nextNeverHaveIEver(), calculateFlames() functions here ...
