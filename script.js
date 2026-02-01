/* --- HOSTELVERSE ONLINE (Final Ultimate Build) --- */
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
});

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
}

// 🕵️‍♂️ SECRET ADMIN LOGIC (Tap Logo 5 Times)
function setupAdminTrigger() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            if(window.location.pathname.includes('index.html') || window.location.href.endsWith('/')) {
                e.preventDefault();
                logoClicks++;
                
                if (logoClicks === 5) {
                    const password = prompt("🕵️‍♂️ Admin Access Required\nEnter Password:");
                    if (password === "(#Y00cr0y0y)") { 
                        isAdminMode = true;
                        alert("🔓 GOD MODE ACTIVATED");
                        listenForConfessions(); // Refresh feed to show delete buttons
                    } else {
                        alert("❌ Access Denied");
                    }
                    logoClicks = 0;
                }
            }
        });
    }
}

// --- CONFIGURATION ---
const avatars = ['🦊', '🐱', '🦄', '👻', '🤖', '👾', '🐸', '🦁', '🐵', '🐼', '🐯', '🐙'];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // If we are on the Feed page, load posts
    if (document.getElementById('feed-container')) {
        listenForConfessions();
    }
    // Activate Confession Tools
    setupLiveVibe();
    setupCharCounter();
});

// ✨ LIVE VIBE PREVIEW LOGIC
function setupLiveVibe() {
    const selector = document.getElementById('categorySelect');
    const input = document.getElementById('confessionInput');
    
    if (selector && input) {
        selector.addEventListener('change', function() {
            // Remove old classes
            input.classList.remove('cat-crush', 'cat-rant', 'cat-funny', 'cat-scary');
            
            // Add new glow
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
            const current = this.value.length;
            counter.innerText = `${current} / 280`;
            
            if (current >= 280) {
                counter.classList.add('limit-reached');
            } else {
                counter.classList.remove('limit-reached');
            }
        });
    }
}

// 🎲 DICE PROMPT LOGIC
window.rollDicePrompt = function() {
    const prompts = [
        "I lied about...", "My roommate is weird because...", "I have a crush on...", 
        "The food in the mess today was...", "I stole...", "My biggest secret is...", 
        "I cheated on...", "I snuck out to...", "I regret...", "Room number ___ is definitely..."
    ];
    const input = document.getElementById('confessionInput');
    if (input) {
        input.value = prompts[Math.floor(Math.random() * prompts.length)];
        input.focus();
        // Update counter manually
        const counter = document.getElementById('charCount');
        if(counter) counter.innerText = `${input.value.length} / 280`;
    }
};

// #️⃣ ADD HASHTAG LOGIC
window.addTag = function(tagName) {
    const input = document.getElementById('confessionInput');
    if (input) {
        input.value += (input.value.length > 0 ? " " : "") + tagName;
        input.focus();
        const counter = document.getElementById('charCount');
        if(counter) counter.innerText = `${input.value.length} / 280`;
    }
};

// --- CONFESSION SUBMISSION ---
window.submitConfession = function() {
    const input = document.getElementById('confessionInput');
    const categorySelect = document.getElementById('categorySelect');
    
    if (!input) return;
    const text = input.value.trim();
    if (!text) return alert("Bhai kuch toh likh!");

    if (!db) return alert("Database connecting... try again in a second.");

    const category = categorySelect ? categorySelect.value : 'general';

    const newConfession = {
        text: text,
        category: category,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        likes: 0,
        reports: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deviceId: getDeviceId(),
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    db.ref('confessions').push(newConfession, (error) => {
        if (error) alert("Error: " + error.message);
        else window.location.href = 'index.html'; // Redirect to feed
    });
};

// --- FEED LOGIC (LISTENER) ---
function listenForConfessions() {
    if (!db) { hideLoader(); return; }
    const container = document.getElementById('feed-container');
    
    db.ref('confessions').on('value', (snapshot) => {
        hideLoader();
        const data = snapshot.val();
        if (!data) {
            container.innerHTML = `<p style="text-align:center; opacity:0.5; margin-top: 2rem;">No tea yet.</p>`;
            return;
        }
        
        // Convert object to array and filter out bad posts (unless Admin)
        const confessions = Object.keys(data)
            .map(key => ({ firebaseKey: key, ...data[key] }))
            .filter(post => isAdminMode || (post.reports || 0) < 5); 

        // Sort by newest first
        confessions.sort((a, b) => b.timestamp - a.timestamp);
        renderFeed(container, confessions);
    });
}

// --- RENDER FEED (NOW WITH COMMENTS!) ---
function renderFeed(container, confessions) {
    const myDeviceId = getDeviceId();
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const reportedPosts = JSON.parse(localStorage.getItem('reportedPosts') || '[]');

    container.innerHTML = confessions.map(post => {
        const isLiked = likedPosts.includes(post.firebaseKey);
        const likeColor = isLiked ? "#bc13fe" : "white";
        
        // --- COMMENT LOGIC START ---
        const commentsObj = post.comments || {};
        const commentCount = Object.keys(commentsObj).length;
        
        const commentsHTML = Object.values(commentsObj).map(c => `
            <div class="comment-bubble">
                <strong style="color: #ccc; font-size: 0.7rem;">${c.avatar} • ${c.time}</strong><br>
                ${c.text}
            </div>
        `).join('');
        // --- COMMENT LOGIC END ---

        // Vibe/Category Styling
        let categoryClass = '';
        let categoryEmoji = '';
        if (post.category === 'crush') { categoryClass = 'cat-crush'; categoryEmoji = '❤️ Crush'; }
        else if (post.category === 'rant') { categoryClass = 'cat-rant'; categoryEmoji = '😡 Rant'; }
        else if (post.category === 'funny') { categoryClass = 'cat-funny'; categoryEmoji = '😂 Funny'; }
        else if (post.category === 'scary') { categoryClass = 'cat-scary'; categoryEmoji = '👻 Scary'; }
        
        const catBadge = categoryEmoji ? `<span class="cat-badge">${categoryEmoji}</span>` : '';
        const trendingBadge = (post.likes || 0) >= 10 ? '<span class="trending-badge">🔥 TRENDING</span>' : '';

        // Admin/Owner Tools
        const isMine = post.deviceId === myDeviceId;
        const showDelete = isAdminMode || isMine;
        const deleteBtn = showDelete 
            ? `<button onclick="deletePost('${post.firebaseKey}')" style="color:#ff4757; background:rgba(255,71,87,0.1); border:1px solid #ff4757; padding:5px 10px; border-radius:8px; margin-left:10px; cursor:pointer;">🗑️</button>` 
            : '';

        const reportBtn = (!isMine && !isAdminMode)
            ? `<button onclick="reportPost('${post.firebaseKey}', ${post.reports || 0})" style="background:none; border:none; color:rgba(255,255,255,0.3); cursor:pointer; font-size: 1.2rem; margin-left:auto;">🚩</button>`
            : '<span style="margin-left:auto;"></span>';

        return `
        <div class="glass-card ${categoryClass}">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <span style="font-size:1.5rem;">${post.avatar}</span>
                <small style="opacity:0.5;">Anonymous • ${post.time}</small>
                <div style="margin-left:auto;">${trendingBadge}${catBadge}</div>
            </div>
            
            <p style="white-space: pre-wrap; margin-bottom: 15px;">${post.text}</p>
            
            <div style="display:flex; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <button onclick="likePost('${post.firebaseKey}', ${post.likes || 0})" style="background:none; border:none; color:${likeColor}; cursor:pointer; font-weight:bold; margin-right: 15px;">
                    ${isLiked ? '🔥' : '🕯️'} ${post.likes || 0}
                </button>
                
                <button onclick="toggleComments('${post.firebaseKey}')" style="background:none; border:none; color:white; cursor:pointer; font-size: 0.9rem; opacity: 0.8;">
                    💬 ${commentCount}
                </button>

                ${reportBtn}
                ${deleteBtn}
            </div>

            <div id="comments-${post.firebaseKey}" class="comment-section">
                <div class="comments-list">
                    ${commentCount > 0 ? commentsHTML : '<small style="opacity:0.5; text-align:center;">No comments yet. Be the first!</small>'}
                </div>
                
                <div class="reply-area">
                    <input type="text" id="input-${post.firebaseKey}" class="reply-input" placeholder="Type a reply...">
                    <button onclick="submitComment('${post.firebaseKey}')" class="reply-btn">Send 🚀</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// --- COMMENT ACTIONS ---
window.toggleComments = function(key) {
    const section = document.getElementById(`comments-${key}`);
    if (section) {
        section.style.display = (section.style.display === "block") ? "none" : "block";
    }
};

window.submitComment = function(postKey) {
    const input = document.getElementById(`input-${postKey}`);
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return alert("Empty comment?");

    const newComment = {
        text: text,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
    };

    db.ref('confessions/' + postKey + '/comments').push(newComment, (error) => {
        if (error) alert("Error: " + error.message);
    });
};

// --- ACTIONS (LIKE, REPORT, DELETE) ---
window.likePost = function(key, currentLikes) {
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (likedPosts.includes(key)) return;
    db.ref('confessions/' + key).update({ likes: currentLikes + 1 });
    likedPosts.push(key);
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
};

window.reportPost = function(key, currentReports) {
    let reportedPosts = JSON.parse(localStorage.getItem('reportedPosts') || '[]');
    if (reportedPosts.includes(key)) { alert("Already reported!"); return; }
    if (confirm("Report this post?")) {
        db.ref('confessions/' + key).update({ reports: currentReports + 1 });
        reportedPosts.push(key);
        localStorage.setItem('reportedPosts', JSON.stringify(reportedPosts));
        alert("Report submitted.");
    }
};

window.deletePost = function(key) {
    if (confirm(isAdminMode ? "ADMIN DELETE: Are you sure?" : "Delete your post?")) {
        db.ref('confessions/' + key).remove();
    }
};

function getDeviceId() {
    let id = localStorage.getItem('deviceId');
    if (!id) {
        id = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', id);
    }
    return id;
}

// --- GAMES LOGIC ---
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

// --- APP INSTALL LOGIC (PWA) ---
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', (e) => {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                deferredPrompt = null;
            });
        });
    }
});
