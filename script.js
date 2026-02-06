/* --- HOSTELVERSE V11.0 (BULLETPROOF GAMES & LOADER) --- */
console.log("HostelVerse Script Loaded 🚀");

/* =========================================
   🕹️ GAME LOGIC (MOVED TO TOP FOR SAFETY)
   ========================================= */
window.spinBottle = function() {
    const b = document.getElementById('bottle');
    if(b) {
        let r = Math.random() * 3000 + 720;
        b.style.transform = `rotate(${r}deg)`;
    }
};

window.getToD = function(type) {
    const t = ["Who is your crush?", "Last lie you told?", "Worst mess food?", "Stalking anyone?", "Exam cheating story?"];
    const d = ["Text your crush 'I know'", "Dance on table", "Yell 'I love Warden'", "Sing loudly", "Call parents say you failed"];
    document.getElementById('tod-display').innerText = (type==='truth'?t:d)[Math.floor(Math.random()*(type==='truth'?t:d).length)];
};

window.nextNeverHaveIEver = function() {
    const q = ["Never slept in class", "Never lied to parents", "Never used fake ID", "Never crushed on roommate", "Never skipped bath for 3 days"];
    document.getElementById('nhie-display').innerText = q[Math.floor(Math.random()*q.length)];
};

window.calculateFlames = function() {
    const r = ["Friends 🤝", "Lovers ❤️", "Affection 🤗", "Marriage 💍", "Enemies ⚔️", "Siblings  राखी"];
    document.getElementById('flames-result').innerText = r[Math.floor(Math.random()*r.length)];
};

/* =========================================
   🔥 FIREBASE & APP LOGIC
   ========================================= */
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

let db;
let isAdminMode = false;
let logoClicks = 0;
let allConfessions = [];
let isFirstLoad = true; 

// Initialize Firebase safely
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log("✅ Firebase Connected!");
    } catch (e) { console.error("Firebase Error:", e); }
}

// ⏳ FORCE LOADER TO HIDE (Safety Net)
window.addEventListener('load', () => {
    // Hide loader immediately on Games page, or after 2s on Feed
    const isFeed = document.getElementById('feed-container');
    setTimeout(hideLoader, isFeed ? 2500 : 500);
    
    setupAdminTrigger();
    initializeIdentity();
});

function hideLoader() {
    const l = document.getElementById('loader');
    if (l) { 
        l.style.opacity = '0'; 
        setTimeout(() => { l.style.display = 'none'; }, 500); 
    }
}

// 🦊 IDENTITY
const avatars = ['🦊', '🐱', '🦄', '👻', '🤖', '👾', '🐸', '🦁', '🐵', '🐼', '🐯', '🐙', '👽', '💀', '🦖'];
function initializeIdentity() {
    if (!localStorage.getItem('userAvatar')) {
        localStorage.setItem('userAvatar', avatars[Math.floor(Math.random() * avatars.length)]);
    }
}
function getMyAvatar() { return localStorage.getItem('userAvatar') || '👻'; }
function getDeviceId() {
    let id = localStorage.getItem('deviceId');
    if (!id) { id = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9); localStorage.setItem('deviceId', id); }
    return id;
}

// 🔔 NOTIFICATIONS
window.enableNotifications = function() {
    if (!("Notification" in window)) return alert("Not supported.");
    Notification.requestPermission().then(p => {
        if(p==="granted") new Notification("Notifications Active! 🔔");
    });
};

function triggerNotification(text) {
    if (Notification.permission === "granted" && document.hidden) {
        new Notification("New Tea Spilled! ☕", { body: text.substring(0,30)+"...", icon: "Hostel Verse Logo.png" });
    }
}

// 💡 FEEDBACK
window.submitFeedback = function() {
    const t = document.getElementById('feedbackInput').value.trim();
    if (!t) return alert("Empty?");
    if(db) db.ref('feedback').push({text:t, time:new Date().toLocaleString(), deviceId:getDeviceId()});
    alert("Sent! 🚀"); document.getElementById('feedbackInput').value = "";
};

// 🕵️‍♂️ ADMIN TRIGGER
function setupAdminTrigger() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            if(window.location.pathname.includes('index.html') || window.location.href.endsWith('/')) {
                e.preventDefault();
                logoClicks++;
                if (logoClicks === 5) {
                    if (prompt("Password:") === "#Y00cr0y0y") { 
                        isAdminMode = true; alert("🔓 GOD MODE"); 
                        listenForConfessions(); 
                        renderAdminDashboard(); 
                    }
                    logoClicks = 0;
                }
            }
        });
    }
}

function renderAdminDashboard() {
    // CRASH FIX: Only run if search bar exists
    const input = document.querySelector('input[type="text"]');
    if (!input) return; 
    
    const searchBar = input.parentNode;
    let dashboard = document.getElementById('admin-dashboard');
    if (!dashboard) {
        dashboard = document.createElement('div');
        dashboard.id = 'admin-dashboard';
        searchBar.parentNode.insertBefore(dashboard, searchBar);
    }
    
    if(db) {
        db.ref('feedback').on('value', (s) => {
            const d = s.val();
            if(!d) { dashboard.innerHTML='<div class="glass-card" style="color:gold;">No feedback.</div>'; return; }
            let h = `<div class="glass-card" style="border:2px solid gold; max-height:200px; overflow-y:auto;"><h3>👑 Admin Inbox</h3>`;
            Object.values(d).reverse().forEach(i => {
                h += `<div style="border-bottom:1px solid #333; padding:5px;"><p>"${i.text}"</p><small style="color:gold;">${i.time}</small></div>`;
            });
            dashboard.innerHTML = h + `</div>`;
        });
    }
}

// 🚀 CORE APP LOGIC
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('feed-container')) listenForConfessions();
    setupCharCounter();
});

function setupCharCounter() {
    const i = document.getElementById('confessionInput');
    const c = document.getElementById('charCount');
    if (i && c) i.addEventListener('input', () => c.innerText = `${i.value.length} / 280`);
}

window.addPollInput = function() {
    const c = document.getElementById('pollOptionsContainer');
    if (c.children.length >= 2) { // Logic fix for inputs
         const input = document.createElement('input');
         input.type = "text"; input.className = "poll-input"; input.placeholder = `Option ${c.children.length + 1}`;
         input.style.marginTop = "10px"; input.style.borderColor = "#eccc68";
         c.appendChild(input);
         if(c.children.length >= 4) document.getElementById('addOptBtn').style.display='none';
    }
};

window.submitPost = function() {
    const cat = document.getElementById('categorySelect').value;
    const isPoll = document.getElementById('poll-mode').style.display === 'block';
    
    let p = { category: cat, avatar: getMyAvatar(), likes: 0, reports: 0, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), deviceId: getDeviceId(), timestamp: firebase.database.ServerValue.TIMESTAMP };

    if (isPoll) {
        const q = document.getElementById('pollQuestion').value.trim();
        let opts = [];
        document.querySelectorAll('.poll-input').forEach(i => { if(i.value.trim()) opts.push({text:i.value.trim(), votes:0}); });
        if(!q || opts.length < 2) return alert("Needs Question + 2 Options!");
        p.type='poll'; p.text=q; p.options=opts;
    } else {
        const t = document.getElementById('confessionInput').value.trim();
        if(!t) return alert("Empty!");
        p.type='text'; p.text=t;
    }

    if(db) db.ref('confessions').push(p, (e) => { if(!e) window.location.href='index.html'; });
};

function listenForConfessions() {
    if (!db) return;
    const c = document.getElementById('feed-container');
    db.ref('confessions').on('value', (s) => {
        hideLoader(); // Success!
        const d = s.val();
        if (!d) { c.innerHTML = `<p style="text-align:center; opacity:0.5;">No posts yet.</p>`; return; }
        
        const prev = allConfessions.length;
        allConfessions = Object.keys(d).map(k => ({ firebaseKey: k, ...d[k] })).filter(p => isAdminMode || (p.reports||0) < 5);
        allConfessions.sort((a,b) => b.timestamp - a.timestamp);
        
        if (!isFirstLoad && allConfessions.length > prev) {
             if (allConfessions[0].deviceId !== getDeviceId()) triggerNotification(allConfessions[0].text);
        }
        isFirstLoad = false;
        renderFeed(c, allConfessions);
    });
}

window.filterFeed = function() {
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    const c = document.getElementById('feed-container');
    if(allConfessions.length) renderFeed(c, allConfessions.filter(p=>(p.text||"").toLowerCase().includes(q)));
};

function renderFeed(c, posts) {
    const myId = getDeviceId();
    const liked = JSON.parse(localStorage.getItem('likedPosts')||'[]');
    c.innerHTML = posts.map(p => {
        const isLiked = liked.includes(p.firebaseKey);
        const isMine = p.deviceId === myId;
        
        let content = '';
        if (p.type === 'poll' && p.options) {
            const total = p.options.reduce((a,o)=>a+(o.votes||0),0);
            content = `<h3 style="margin-bottom:15px;">📊 ${p.text}</h3>` + p.options.map((o,i)=>{
                const pct = total===0?0:Math.round((o.votes/total)*100);
                const color = ["#48dbfb","#ff4757","#eccc68","#2ecc71"][i%4];
                return `<div onclick="votePoll('${p.firebaseKey}',${i})" style="background:rgba(255,255,255,0.05); border:1px solid ${color}; border-radius:10px; padding:10px; margin-bottom:8px; cursor:pointer; position:relative; overflow:hidden;"><div style="position:absolute; top:0; left:0; height:100%; width:${pct}%; background:${color}; opacity:0.2;"></div><div style="position:relative; display:flex; justify-content:space-between;"><strong>${o.text}</strong><span>${pct}%</span></div></div>`;
            }).join('') + `<small style="display:block; text-align:right; opacity:0.5;">${total} Votes</small>`;
        } else { content = `<p style="white-space:pre-wrap; margin-bottom:15px;">${p.text}</p>`; }

        const delBtn = (isAdminMode||isMine) ? `<button onclick="deletePost('${p.firebaseKey}')" style="color:#ff4757; background:rgba(255,71,87,0.1); border:1px solid #ff4757; padding:5px 10px; margin-left:10px;">🗑️</button>` : '';
        const cCount = p.comments ? Object.keys(p.comments).length : 0;
        
        // RENDER COMMENTS (Fixed Delete Logic)
        const cHTML = p.comments ? Object.entries(p.comments).map(([id, cm]) => {
            const delC = (isAdminMode || cm.deviceId === myId) ? `<span onclick="delCom('${p.firebaseKey}','${id}')" style="float:right;color:red;cursor:pointer;">🗑️</span>` : '';
            return `<div class="comment-bubble">${delC}<strong>${cm.avatar}</strong><br>${cm.text}</div>`;
        }).join('') : '';

        return `<div class="glass-card ${p.category?'cat-'+p.category:''}"><div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><span style="font-size:1.5rem;">${p.avatar}</span><small style="opacity:0.5;">${p.time}</small></div>${content}<div style="display:flex; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px; margin-top:15px;"><button onclick="likePost('${p.firebaseKey}', ${p.likes||0})" style="background:none; border:none; color:${isLiked?'#bc13fe':'white'}; font-weight:bold; margin-right:15px;">🔥 ${p.likes||0}</button><button onclick="toggleComments('${p.firebaseKey}')" style="background:none; border:none; color:white; opacity:0.8;">💬 ${cCount}</button>${delBtn}</div><div id="comments-${p.firebaseKey}" class="comment-section"><div class="comments-list">${cHTML||'<small>No comments.</small>'}</div><div class="reply-area"><input type="text" id="input-${p.firebaseKey}" class="reply-input" placeholder="Reply..."><button onclick="submitComment('${p.firebaseKey}')" class="reply-btn">🚀</button></div></div></div>`;
    }).join('');
}

window.votePoll = function(k, i) { const vk=`v_${k}`; if(localStorage.getItem(vk)) return alert("Already voted!"); db.ref(`confessions/${k}/options/${i}/votes`).transaction(v=>(v||0)+1, (e,c)=>{if(c)localStorage.setItem(vk,'1')}); };
window.toggleComments = function(k) { const s=document.getElementById('comments-'+k); if(s)s.style.display=(s.style.display==="block")?"none":"block"; };
window.submitComment = function(k) { const v=document.getElementById('input-'+k).value.trim(); if(v) db.ref(`confessions/${k}/comments`).push({text:v, avatar:getMyAvatar(), time:new Date().toLocaleTimeString(), deviceId:getDeviceId()}); };
window.delCom = function(p,c) { if(confirm("Delete?")) db.ref(`confessions/${p}/comments/${c}`).remove(); };
window.likePost = function(k,l) { let list=JSON.parse(localStorage.getItem('likedPosts')||'[]'); if(!list.includes(k)) { db.ref(`confessions/${k}`).update({likes:l+1}); list.push(k); localStorage.setItem('likedPosts',JSON.stringify(list)); }};
window.deletePost = function(k) { if(confirm("Delete?")) db.ref(`confessions/${k}`).remove(); };
window.rollDicePrompt = function() { document.getElementById('confessionInput').value = ["I lied about...", "Crush on...", "Secret is..."][Math.floor(Math.random()*3)]; };
window.addTag = function(t) { document.getElementById('confessionInput').value += " " + t; };
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); const b=document.getElementById('installBtn'); if(b){b.style.display='block'; b.onclick=()=>e.prompt();} });
