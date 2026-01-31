/* --- HOSTELVERSE ONLINE (Connected to hostel-verse-a432c) --- */
console.log("HostelVerse Script Loaded 🚀");

// --- 1. YOUR FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyADora-jmivunZDqq2L4ZhARgOofa4pQyA",
  authDomain: "hostel-verse-a432c.firebaseapp.com",
  databaseURL: "https://hostel-verse-a432c-default-rtdb.firebaseio.com",
  projectId: "hostel-verse-a432c",
  storageBucket: "hostel-verse-a432c.firebasestorage.app",
  messagingSenderId: "658844045039",
  appId: "1:658844045039:web:105d6e0eda7740857b951a",
  measurementId: "G-FC2QLNWFJG"
};

// --- 2. INITIALIZE CONNECTION ---
let db;
try {
    // Connect to the Cloud
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log("✅ Connected to Cloud Database!");
} catch (error) {
    console.error("❌ Connection Failed. Did you add the script tags in HTML?", error);
}

// --- CONFIGURATION ---
const avatars = ['🦊', '🐱', '🦄', '👻', '🤖', '👾', '🐸', '🦁', '🐵', '🐼', '🐯', '🐙'];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // If we are on the Feed page, start listening for live messages
    if (document.getElementById('feed-container')) {
        listenForConfessions();
    }
});

// --- CONFESSION LOGIC (SEND TO CLOUD) ---
function submitConfession() {
    const input = document.getElementById('confessionInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return alert("Write something first!");

    const newConfession = {
        text: text,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        likes: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deviceId: getDeviceId(), // Used to know which posts are YOURS
        timestamp: firebase.database.ServerValue.TIMESTAMP // Server time for sorting
    };

    // Push to Firebase Cloud
    db.ref('confessions').push(newConfession, (error) => {
        if (error) {
            alert("Error: " + error.message);
        } else {
            // Success! Go to feed.
            window.location.href = 'index.html';
        }
    });
}

// --- FEED LOGIC (LISTEN TO CLOUD) ---
function listenForConfessions() {
    const container = document.getElementById('feed-container');
    
    // This runs AUTOMATICALLY every time someone posts!
    db.ref('confessions').on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = `<p style="text-align:center; opacity:0.5; margin-top: 2rem;">No tea yet. Be the first!</p>`;
            return;
        }

        // Convert data to array
        const confessions = Object.keys(data).map(key => {
            return { firebaseKey: key, ...data[key] };
        });

        // Sort: Newest First
        confessions.sort((a, b) => b.timestamp - a.timestamp);

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
        
        // Delete button (Only shows if YOU posted it)
        const deleteBtn = isMine 
            ? `<button onclick="deletePost('${post.firebaseKey}')" style="color:#ff4757; background:rgba(255,71,87,
