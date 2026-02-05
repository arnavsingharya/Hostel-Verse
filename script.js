/* --- HOSTELVERSE V6.0 (Search + Fixed Identity + Admin) --- */
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
let isAdminMode = false;
let logoClicks = 0;
let allConfessions = []; // STORE POSTS FOR SEARCH

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

// --- GLOBAL LOADER & TRIGGERS ---
window.addEventListener('load', () => {
    setTimeout(hideLoader, 3000);
    setupAdminTrigger();
    initializeIdentity(); // ASSIGN PERMANENT AVATAR
});

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
}

// 🦊 FIXED IDENTITY LOGIC
const avatars = ['🦊', '🐱', '🦄', '👻', '🤖', '👾', '🐸', '🦁', '🐵', '🐼', '🐯', '🐙', '👽', '💀', '🦖'];

function initializeIdentity() {
    let myAv = localStorage.getItem('userAvatar');
    if (!myAv) {
        // If first time, assign random and SAVE it
        myAv = avatars[Math.floor(Math.random() * avatars.length)];
        localStorage.setItem('userAvatar', myAv);
        console.log("Identity Assigned: " + myAv);
    }
}

function getMyAvatar() {
    return localStorage.getItem('userAvatar') || '👻';
}

// 🕵️‍♂️ SECRET ADMIN LOGIC
function setupAdminTrigger() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            if(window.location.pathname.includes('index.html') || window.location.href.endsWith('/')) {
                e.preventDefault();
                logoClicks++;
                
                if (logoClicks === 5) {
                    let password = prompt("🕵️‍♂️ Admin Access Required\nEnter Password:");
                    if (password !== null && password.trim() === "#Y00cr0y0y") { 
                        isAdminMode = true;
                        alert("🔓 GOD MODE ACTIVATED");
                        listenForConfessions(); // Reload with hidden posts
                    } else {
                        alert("❌ Access Denied");
                    }
                    logoClicks = 0;
                }
            }
        });
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('feed-container')) {
        listenForConfessions();
    }
    setupLiveVibe();
    setupCharCounter();
});

// ✨ LIVE VIBE PREVIEW LOGIC
function setupLiveVibe() {
    const selector = document.getElementById('categorySelect');
    const input = document.getElementById('confessionInput');
    if (selector && input) {
        selector.addEventListener('change', function() {
            input.classList.remove('cat-crush', 'cat-rant', 'cat-funny', 'cat-scary');
            const val = this.value;
            if (val !== 'general') {
                input.classList.add('cat-' + val);
            }
        });
    }
}

// 📝 CHARACTER COUNTER LOGIC
function setupCharCounter() {
    const input = document.getElementById('confessionInput');
    const counter = document.getElementById('charCount');
    if (input && counter) {
        input.addEventListener('input', function() {
            counter.innerText = `${this.value.length} / 280`;
            if (this.value.length >= 280) counter.classList.add('limit-reached');
            else counter.classList.remove('limit-reached');
        });
    }
}

// 🔍 SEARCH BAR LOGIC (CRASH-PROOF VERSION)
window.filterFeed = function() {
    const input = document.getElementById('searchInput');
    const container = document.getElementById('feed-container');
    
    if (!input || !container) return;
    
    const query = input.value.toLowerCase().trim();
    
    // Safety Check: If no posts loaded yet, stop.
    if (!allConfessions || allConfessions.length === 0) {
        console.log("Waiting for data...");
        return;
    }

    const filtered = allConfessions.filter(post => {
        // SAFE GUARDS: We use "|| ''" to treat empty data as blank text instead of crashing
        const text = (post.text || "").toLowerCase();
        const category = (post.category || "").toLowerCase(); 
        
        return text.includes(query) || category.includes(query);
    });
    
    console.log(`Searching for: "${query}" | Found: ${filtered.length}`); // Debugging
    renderFeed(container, filtered);
};

// --- CONFESSION SUBMISSION (WITH FIXED AVATAR) ---
window.submitConfession = function() {
    const input = document.getElementById('confessionInput');
    const categorySelect = document.getElementById('categorySelect');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return alert("Bhai kuch toh likh!");
    if (!db) return alert("Database connecting...");

    const category = categorySelect ? categorySelect.value : 'general';

    const newConfession = {
        text: text,
        category: category,
        avatar: getMyAvatar(), // USES FIXED AVATAR
        likes: 0,
        reports: 0,
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
    if (!db) { hideLoader(); return; }
    const container = document.getElementById('feed-container');
    
    db.ref('confessions').off();
    db.ref('confessions').on('value', (snapshot) => {
        hideLoader();
        const data = snapshot.val();
        if (!data) {
            container.innerHTML = `<p style="text-align:center; opacity:0.5;">No tea yet.</p>`;
            return;
        }
        
        // Save to global array for searching
        allConfessions = Object.keys(data)
            .map(key => ({ firebaseKey: key, ...data[key] }))
            .filter(post => isAdminMode || (post.reports || 0) < 5); 

        allConfessions.sort((a, b) => b.timestamp - a.timestamp);
        
        // Initial Render
        renderFeed(container, allConfessions);
    });
}

// --- RENDER FEED ---
function renderFeed(container, posts) {
    if(posts.length === 0) {
        container.innerHTML = `<p style="text-align:center; opacity:0.5; margin-top:20px;">No results found.</p>`;
        return;
    }

    const myDeviceId = getDeviceId();
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');

    container.innerHTML = posts.map(post => {
        const isLiked = likedPosts.includes(post.firebaseKey);
        const likeColor = isLiked ? "#bc13fe" : "white";
        
        // Comment Logic
        const commentsObj = post.comments || {};
        const commentCount = Object.keys(commentsObj).length;
        const commentsHTML = Object.entries(commentsObj).map(([commentId, c]) => {
            const isMyComment = c.deviceId === myDeviceId;
            const canDelete = isAdminMode || isMyComment;
            const deleteCommentBtn = canDelete 
                ? `<span onclick="deleteComment('${post.firebaseKey}', '${commentId}')" style="cursor:pointer; float:right; color:#ff4757;">🗑️</span>` 
                : '';
            return `<div class="comment-bubble">${deleteCommentBtn}<strong style="color:#ccc; font-size:0.7rem;">${c.avatar} • ${c.time}</strong><br>${c.text}</div>`;
        }).join('');

        let categoryClass = '';
        let categoryEmoji = '';
        if (post.category === 'crush') { categoryClass = 'cat-crush'; categoryEmoji = '❤️ Crush'; }
        else if (post.category === 'rant') { categoryClass = 'cat-rant'; categoryEmoji = '😡 Rant'; }
        else if (post.category === 'funny') { categoryClass = 'cat-funny'; categoryEmoji = '😂 Funny'; }
        else if (post.category === 'scary') { categoryClass = 'cat-scary'; categoryEmoji = '👻 Scary'; }
        
        const catBadge = categoryEmoji ? `<span class="cat-badge">${categoryEmoji}</span>` : '';
        const trendingBadge = (post.likes || 0) >= 10 ? '<span class="trending-badge">🔥 TRENDING</span>' : '';
        
        const isMine = post.deviceId === myDeviceId;
        const showDelete = isAdminMode || isMine;
        const deleteBtn = showDelete ? `<button onclick="deletePost('${post.firebaseKey}')" style="color:#ff4757; background:rgba(255,71,87,0.1); border:1px solid #ff4757; padding:5px 10px; border-radius:8px; margin-left:10px;">🗑️</button>` : '';

        const reportBtn = (!isMine && !isAdminMode) ? `<button onclick="reportPost('${post.firebaseKey}', ${post.reports || 0})" style="background:none; border:none; color:rgba(255,255,255,0.3); font-size:1.2rem; margin-left:auto;">🚩</button>` : '<span style="margin-left:auto;"></span>';

        return `
        <div class="glass-card ${categoryClass}">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <span style="font-size:1.5rem;">${post.avatar}</span>
                <small style="opacity:0.5;">${post.time}</small>
                <div style="margin-left:auto;">${trendingBadge}${catBadge}</div>
            </div>
            <p style="white-space: pre-wrap; margin-bottom: 15px;">${post.text}</p>
            <div style="display:flex; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <button onclick="likePost('${post.firebaseKey}', ${post.likes || 0})" style="background:none; border:none; color:${likeColor}; cursor:pointer; font-weight:bold; margin-right: 15px;">${isLiked ? '🔥' : '🕯️'} ${post.likes || 0}</button>
                <button onclick="toggleComments('${post.firebaseKey}')" style="background:none; border:none; color:white; cursor:pointer; font-size: 0.9rem; opacity: 0.8;">💬 ${commentCount}</button>
                ${reportBtn}${deleteBtn}
            </div>
            <div id="comments-${post.firebaseKey}" class="comment-section">
                <div class="comments-list">${commentCount > 0 ? commentsHTML : '<small style="opacity:0.5;">No comments yet.</small>'}</div>
                <div class="reply-area">
                    <input type="text" id="input-${post.firebaseKey}" class="reply-input" placeholder="Reply...">
                    <button onclick="submitComment('${post.firebaseKey}')" class="reply-btn">🚀</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// --- STANDARD ACTIONS (Likes, Reports, Comments, Dice, Games) ---
window.toggleComments = function(key) { const s = document.getElementById(`comments-${key}`); if(s) s.style.display = (s.style.display==="block")?"none":"block"; };
window.submitComment = function(key) {
    const input = document.getElementById(`input-${key}`);
    if(!input || !input.value.trim()) return;
    db.ref('confessions/' + key + '/comments').push({
        text: input.value.trim(), avatar: getMyAvatar(), time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        timestamp: Date.now(), deviceId: getDeviceId()
    });
};
window.deleteComment = function(pKey, cKey) { if(confirm("Delete?")) db.ref('confessions/'+pKey+'/comments/'+cKey).remove(); };
window.likePost = function(key, likes) {
    let liked = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if(liked.includes(key)) return;
    db.ref('confessions/'+key).update({likes: likes+1});
    liked.push(key); localStorage.setItem('likedPosts', JSON.stringify(liked));
};
window.reportPost = function(key, r) {
    let reported = JSON.parse(localStorage.getItem('reportedPosts') || '[]');
    if(reported.includes(key)) { alert("Already reported!"); return; }
    if(confirm("Report this post?")) {
        db.ref('confessions/'+key).update({reports: r+1});
        reported.push(key); localStorage.setItem('reportedPosts', JSON.stringify(reported));
        alert("Reported.");
    }
};
window.deletePost = function(key) { if(confirm("Delete post?")) db.ref('confessions/'+key).remove(); };
function getDeviceId() {
    let id = localStorage.getItem('deviceId');
    if (!id) { id = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9); localStorage.setItem('deviceId', id); }
    return id;
}
window.rollDicePrompt = function() {
    const prompts = ["I lied about...", "I have a crush on...", "I stole...", "My secret is...", "Room ___ is..."];
    const input = document.getElementById('confessionInput');
    if(input) input.value = prompts[Math.floor(Math.random()*prompts.length)];
};
window.addTag = function(t) { const i = document.getElementById('confessionInput'); if(i) i.value += " " + t; };
// GAMES
window.spinBottle = function() { const b = document.getElementById('bottle'); if(b) { let r = parseInt(b.getAttribute('data-r')||0)+Math.floor(Math.random()*3000)+720; b.style.transform=`rotate(${r}deg)`; b.setAttribute('data-r', r); }};
window.getToD = function(t) { document.getElementById('tod-display').innerText = (t==='truth'?["Crush?", "Lie?", "Secret?"]:["Dance", "Sing", "Yell"])[Math.floor(Math.random()*3)]; };
window.nextNeverHaveIEver = function() { document.getElementById('nhie-display').innerText = ["Never slept in class", "Never lied to parents", "Never used fake ID"][Math.floor(Math.random()*3)]; };
window.calculateFlames = function() { document.getElementById('flames-result').innerText = ["Friends", "Lovers", "Enemies"][Math.floor(Math.random()*3)]; };

// PWA
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); const btn=document.getElementById('installBtn'); if(btn){ btn.style.display='block'; btn.onclick=()=>{e.prompt();}; }});

