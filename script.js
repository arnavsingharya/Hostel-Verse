/* --- HOSTELVERSE ONLINE (Updated) --- */
console.log("HostelVerse Script Loaded 🚀");

// --- 1. FIREBASE CONFIGURATION ---
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

if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log("✅ Firebase Connected!");
    } catch (e) {
        console.error("❌ Firebase Error:", e);
    }
} else {
    console.error("❌ Firebase SDK not found.");
}

// --- GLOBAL LOADER LOGIC ---
// This runs on EVERY page to ensure the loader doesn't get stuck
window.addEventListener('load', () => {
    // If we are NOT on the feed page, remove loader immediately (or after short delay)
    if (!document.getElementById('feed-container')) {
        hideLoader();
    }
    // Safety fallback: Force remove loader after 4 seconds even on Feed page
    setTimeout(hideLoader, 4000);
});

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
}

// --- CONFIGURATION ---
const avatars = ['🦊', '🐱', '🦄', '👻', '🤖', '👾', '🐸', '🦁', '🐵', '🐼', '🐯', '🐙'];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('feed-container')) {
        listenForConfessions();
    }
});

// --- CONFESSION LOGIC ---
window.submitConfession = function() {
    const input = document.getElementById('confessionInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return alert("Bhai kuch toh likh!");

    if (!db) return alert("Database connecting... try again in a second.");

    const newConfession = {
        text: text,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        likes: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deviceId: getDeviceId(),
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    db.ref('confessions').push(newConfession, (error) => {
        if (error) alert("Error: " + error.message);
        else window.location.href = 'index.html';
    });
};

// --- FEED LOGIC ---
function listenForConfessions() {
    if (!db) {
        hideLoader(); // Hide loader if DB fails
        return;
    }
    const container = document.getElementById('feed-container');
    
    db.ref('confessions').on('value', (snapshot) => {
        hideLoader(); // <--- SUCCESS! Hide loader when data arrives
        
        const data = snapshot.val();
        if (!data) {
            container.innerHTML = `<p style="text-align:center; opacity:0.5; margin-top: 2rem;">No tea yet.</p>`;
            return;
        }
        
        const confessions = Object.keys(data).map(key => ({ firebaseKey: key, ...data[key] }));
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
                <button onclick="likePost('${post.firebaseKey}', ${post.likes})" style="background:none; border:none; color:${likeColor}; cursor:pointer; font-weight:bold;">
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

// --- HELPER ---
function getDeviceId() {
    let id = localStorage.getItem('deviceId');
    if (!id) {
        id = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', id);
    }
    return id;
}

// --- GAMES ---
window.spinBottle = function() {
    const bottle = document.getElementById('bottle');
    if (bottle) {
        let r = parseInt(bottle.getAttribute('data-rotation') || 0);
        r += Math.floor(Math.random() * 3000) + 720;
        bottle.style.transform = `rotate(${r}deg)`;
        bottle.setAttribute('data-rotation', r);
    }
};

const truths = ["Who is your hostel crush?", "Last lie you told warden?", "Worst mess food?", "Proxy for friend?", "Days without shower?", "Stolen Maggi?", "Stalking on Insta?", "Actual CGPA?", "Cried in washroom?", "Snuck out?"];
const dares = ["Text crush 'I know what you did'", "Sing anthem", "Scream 'Mummy meri shaadi karwa do!'", "Naagin dance", "Call parents say you failed", "Beg for 10rs", "Wear socks on hands", "Imitate prof", "Eat raw coffee"];

window.getToD = function(type) {
    const d = document.getElementById('tod-display');
    if (d) d.innerText = (type === 'truth' ? truths : dares)[Math.floor(Math.random() * (type === 'truth' ? truths : dares).length)];
};

const nhie = ["Never eaten someone else's tiffin.", "Never called teacher 'Mummy'.", "Never slept in library.", "Never used fake medical.", "Never crushed on friend's sibling.", "Never made Maggi in kettle.", "Never worn same underwear 2 days.", "Never hooked up in hostel."];

window.nextNeverHaveIEver = function() {
    const d = document.getElementById('nhie-display');
    if (d) d.innerText = nhie[Math.floor(Math.random() * nhie.length)];
};

const mlt = ["Most likely to sleep through a fire alarm.", "Most likely to become a billionaire by accident.", "Most likely to get married first.", "Most likely to argue with the professor.", "Most likely to lose their room key.", "Most likely to become a travel vlogger.", "Most likely to survive a zombie apocalypse.", "Most likely to forget their own birthday.", "Most likely to get arrested for something stupid."];

window.nextMostLikely = function() {
    const d = document.getElementById('mlt-display');
    if (d) d.innerText = mlt[Math.floor(Math.random() * mlt.length)];
};

window.calculateFlames = function() {
    const n1 = document.getElementById('name1').value.toLowerCase().replace(/\s/g, '');
    const n2 = document.getElementById('name2').value.toLowerCase().replace(/\s/g, '');
    const d = document.getElementById('flames-result');
    if (!n1 || !n2) { d.innerText = "Enter names!"; return; }
    const o = ["Friends 🤝", "Lovers ❤️", "Affection 🤗", "Marriage 💍", "Enemies ⚔️", "Siblings  राखी"];
    const c = n1 + n2;
    let cnt = 0; for(let i=0; i<c.length; i++) cnt += c.charCodeAt(i);
    d.innerText = o[cnt % o.length];
    d.style.opacity = 0; setTimeout(() => { d.style.opacity = 1; }, 100);
};
