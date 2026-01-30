/* --- HOSTELVERSE SCRIPT v3.0 (With 4 Games) --- */
console.log("HostelVerse Script Loaded 🚀");

// --- CONFIGURATION ---
const avatars = ['🦊', '🐱', '🦄', '👻', '🤖', '👾', '🐸', '🦁', '🐵', '🐼', '🐯', '🐙'];
let currentRotation = 0;

// --- SAFE STORAGE HELPERS ---
function getData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        alert("Storage full!");
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('feed-container')) renderFeed();
});

// --- FEED & CONFESSION LOGIC (UNCHANGED) ---
function submitConfession() {
    const input = document.getElementById('confessionInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return alert("Write something first!");

    const confessions = getData('confessions');
    const myPosts = getData('myPosts');
    
    const newId = Date.now();
    const newConfession = {
        id: newId,
        text: text,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        likes: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    confessions.unshift(newConfession);
    myPosts.push(newId);
    saveData('confessions', confessions);
    saveData('myPosts', myPosts);
    window.location.href = 'index.html';
}

function renderFeed() {
    const container = document.getElementById('feed-container');
    if (!container) return;

    const confessions = getData('confessions');
    const likedPosts = getData('likedPosts');
    const myPosts = getData('myPosts');

    if (confessions.length === 0) {
        container.innerHTML = `<p style="text-align:center; opacity:0.5; margin-top: 2rem;">No tea yet. Go to Confess page to start!</p>`;
        return;
    }

    container.innerHTML = confessions.map(post => {
        const isLiked = likedPosts.includes(post.id);
        const isMine = myPosts.includes(post.id);
        const likeColor = isLiked ? "#bc13fe" : "white";
        const likeIcon = isLiked ? "🔥" : "🕯️";
        
        const deleteBtnHtml = isMine 
            ? `<button onclick="deletePost(${post.id})" style="color: #ff4757; background: rgba(255, 71, 87, 0.1); border: 1px solid #ff4757; padding: 5px 10px; border-radius: 8px; font-size: 0.8rem; margin-left: auto;">🗑️ Delete</button>` 
            : '';

        return `
        <div class="glass-card">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <span style="font-size:1.5rem;">${post.avatar}</span>
                <small style="opacity:0.5;">Anonymous • ${post.time}</small>
            </div>
            <p style="white-space: pre-wrap; margin-bottom: 15px;">${post.text}</p>
            <div style="display:flex; align-items:center; justify-content: space-between; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <button onclick="likePost(${post.id})" style="background:none; border:none; color:${likeColor}; cursor:pointer; font-size: 1rem; font-weight:bold;">${likeIcon} ${post.likes}</button>
                ${deleteBtnHtml}
            </div>
        </div>`;
    }).join('');
}

function deletePost(id) {
    if (confirm("Are you sure?")) {
        let confessions = getData('confessions');
        confessions = confessions.filter(p => p.id !== id);
        saveData('confessions', confessions);
        renderFeed();
    }
}

function likePost(id) {
    let likedPosts = getData('likedPosts');
    if (likedPosts.includes(id)) return;
    let confessions = getData('confessions');
    confessions = confessions.map(p => p.id === id ? {...p, likes: (p.likes || 0) + 1} : p);
    likedPosts.push(id);
    saveData('confessions', confessions);
    saveData('likedPosts', likedPosts);
    renderFeed();
}

// --- GAME 1: SPIN THE BOTTLE ---
function spinBottle() {
    const bottle = document.getElementById('bottle');
    if (bottle) {
        currentRotation += Math.floor(Math.random() * 3000) + 720;
        bottle.style.transform = `rotate(${currentRotation}deg)`;
    }
}

// --- GAME 2: TRUTH OR DARE ---
const truths = ["Who is your hostel crush?", "Last lie you told your warden?", "Worst mess food?", "Proxy for a friend?", "Days without shower?", "Stolen Maggi?", "Stalking on Insta?", "Actual CGPA?", "Cried in washroom?", "Snuck out?"];
const dares = ["Text crush 'I know what you did'", "Sing college anthem", "Scream 'Mummy meri shaadi karwa do!'", "Naagin dance 30s", "Call parents say you failed", "Beg neighbor for 10rs", "Wear socks on hands", "Imitate strict prof", "Eat raw coffee"];

function getToD(type) {
    const display = document.getElementById('tod-display');
    if (!display) return;
    const list = type === 'truth' ? truths : dares;
    display.innerText = list[Math.floor(Math.random() * list.length)];
}

// --- GAME 3: NEVER HAVE I EVER ---
const nhie = [
    "Never have I ever eaten someone else's tiffin without asking.",
    "Never have I ever called a teacher 'Mummy' or 'Papa'.",
    "Never have I ever slept in the library.",
    "Never have I ever used a fake medical certificate.",
    "Never have I ever crushed on a friend's sibling.",
    "Never have I ever made Maggi in a kettle.",
    "Never have I ever been caught sleeping in class.",
    "Never have I ever stalked an ex for hours.",
    "Never have I ever lied about my internal marks.",
    "Never have I ever borrowed money and forgotten to return it.",
    "Never have I ever worn the same underwear two days in a row.",
    "Never have I ever hooked up in the hostel.",
    "Never have I ever cried during an exam.",
    "Never have I ever used a proxy to skip class."
];

function nextNeverHaveIEver() {
    const display = document.getElementById('nhie-display');
    if (!display) return;
    display.innerText = nhie[Math.floor(Math.random() * nhie.length)];
}

// --- GAME 4: FLAMES CALCULATOR ---
function calculateFlames() {
    const name1 = document.getElementById('name1').value.toLowerCase().replace(/\s/g, '');
    const name2 = document.getElementById('name2').value.toLowerCase().replace(/\s/g, '');
    const resultDisplay = document.getElementById('flames-result');

    if (!name1 || !name2) {
        resultDisplay.innerText = "Enter both names ya!";
        return;
    }

    // FLAMES Logic (Simplified for fun)
    const combined = name1 + name2;
    let count = 0;
    
    // Count unique characters roughly (Fun algorithm)
    for(let i=0; i<combined.length; i++) {
        count += combined.charCodeAt(i);
    }
    
    const outcomes = ["Friends 🤝", "Lovers ❤️", "Affection 🤗", "Marriage 💍", "Enemies ⚔️", "Siblings  राखी"];
    const result = outcomes[count % outcomes.length]; // Deterministic based on names

    resultDisplay.innerText = result;
    resultDisplay.style.opacity = 0;
    setTimeout(() => { resultDisplay.style.opacity = 1; }, 100);
}