/* --- HOSTELVERSE ONLINE (Fixed & Verified) --- */
console.log("HostelVerse Script Loaded 🚀");

// --- 1. FIREBASE CONFIGURATION (No 'import' lines allowed here!) ---
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
// We check if the 'firebase' object exists (loaded from HTML)
let db;
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log("✅ Firebase Connected!");
    } catch (e) {
        console.error("❌ Firebase Error:", e);
    }
} else {
    console.error("❌ Critical Error: Firebase script tags missing in HTML!");
    alert("Database connection failed. Check your HTML file.");
}

// --- CONFIGURATION ---
const avatars = ['🦊', '🐱', '🦄', '👻', '🤖', '👾', '🐸', '🦁', '🐵', '🐼', '🐯', '🐙'];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // If we are on the Feed page, listen for messages
    if (document.getElementById('feed-container')) {
        listenForConfessions();
    }
});

// --- CONFESSION LOGIC (SEND) ---
// This function MUST be global so the button can see it
window.submitConfession = function() {
    const input = document.getElementById('confessionInput');
    if (!input) {
        console.error("Input box not found!");
        return;
    }

    const text = input.value.trim();
    if (!text) return alert("Bhai kuch toh likh! (Write something)");

    if (!db) return alert("Database not connected! Refresh the page.");

    const newConfession = {
        text: text,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        likes: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deviceId: getDeviceId(),
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    console.log("Sending confession...", newConfession);

    // Push to Firebase
    db.ref('confessions').push(newConfession, (error) => {
        if (error) {
            alert("Error saving: " + error.message);
        } else {
            console.log("Success! Redirecting...");
            window.location.href = 'index.html';
        }
    });
};

// --- FEED LOGIC (LISTEN) ---
function listenForConfessions() {
    if (!db) return;
    
    const container = document.getElementById('feed-container');
    
    db.ref('confessions').on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = `<p style="text-align:center; opacity:0.5; margin-top: 2rem;">No tea yet. Be the first!</p>`;
            return;
        }

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
        
        const deleteBtn = isMine 
            ? `<button onclick="deletePost('${post.firebaseKey}')" style="color:#ff4757; background:rgba(255,71,87,0.1); border:1px solid #ff4757; padding:5px 10px; border-radius:8px; margin-left:auto; cursor:pointer;">🗑️</button>` 
            : '';

        return `
        <div class="glass-card">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <span style="font-size:1.5rem;">${post.avatar}</span>
                <small style="opacity:0.5;">Anonymous • ${post.time}</small>
            </div>
            <p style="white-space: pre-wrap; margin-bottom: 15px;">${post.text}</p>
            <div style="display:flex; align-items:center; justify-content: space-between; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <button onclick="likePost('${post.firebaseKey}', ${post.likes})" style="background:none; border:none; color:${likeColor}; cursor:pointer; font-weight:bold; font-size:1rem;">
                    ${isLiked ? '🔥' : '🕯️'} ${post.likes}
                </button>
                ${deleteBtn}
            </div>
        </div>`;
    }).join('');
}

// --- ACTIONS ---
window.likePost = function(key, currentLikes) {
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (likedPosts.includes(key)) return;
    
    db.ref('confessions/' + key).update({ likes: currentLikes + 1 });
    likedPosts.push(key);
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
};

window.deletePost = function(key) {
    if (confirm("Delete this?")) {
        db.ref('confessions/' + key).remove();
    }
};

// --- HELPER: ID ---
function getDeviceId() {
    let id = localStorage.getItem('deviceId');
    if (!id) {
        id = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', id);
    }
    return id;
}

// --- GAMES (Local) ---
window.spinBottle = function() {
    const bottle = document.getElementById('bottle');
    if (bottle) {
        let currentRotation = parseInt(bottle.getAttribute('data-rotation') || 0);
        currentRotation += Math.floor(Math.random() * 3000) + 720;
        bottle.style.transform = `rotate(${currentRotation}deg)`;
        bottle.setAttribute('data-rotation', currentRotation);
    }
};

const truths = ["Who is your hostel crush?", "Last lie you told warden?", "Worst mess food?", "Proxy for friend?", "Days without shower?", "Stolen Maggi?", "Stalking on Insta?", "Actual CGPA?", "Cried in washroom?", "Snuck out?"];
const dares = ["Text crush 'I know what you did'", "Sing anthem", "Scream 'Mummy meri shaadi karwa do!'", "Naagin dance", "Call parents say you failed", "Beg for 10rs", "Wear socks on hands", "Imitate prof", "Eat raw coffee"];

window.getToD = function(type) {
    const display = document.getElementById('tod-display');
    if (!display) return;
    const list = type === 'truth' ? truths : dares;
    display.innerText = list[Math.floor(Math.random() * list.length)];
};

const nhie = ["Never eaten someone else's tiffin.", "Never called teacher 'Mummy'.", "Never slept in library.", "Never used fake medical.", "Never crushed on friend's sibling.", "Never made Maggi in kettle.", "Never worn same underwear 2 days.", "Never hooked up in hostel."];

window.nextNeverHaveIEver = function() {
    const display = document.getElementById('nhie-display');
    if (display) display.innerText = nhie[Math.floor(Math.random() * nhie.length)];
};

window.calculateFlames = function() {
    const name1 = document.getElementById('name1').value.toLowerCase().replace(/\s/g, '');
    const name2 = document.getElementById('name2').value.toLowerCase().replace(/\s/g, '');
    const resultDisplay = document.getElementById('flames-result');
    if (!name1 || !name2) { resultDisplay.innerText = "Enter names!"; return; }
    const outcomes = ["Friends 🤝", "Lovers ❤️", "Affection 🤗", "Marriage 💍", "Enemies ⚔️", "Siblings  राखी"];
    const combined = name1 + name2;
    let count = 0;
    for(let i=0; i<combined.length; i++) count += combined.charCodeAt(i);
    resultDisplay.innerText = outcomes[count %
