/* --- HOSTELVERSE V9.0 (FEEDBACK + NOTIFICATIONS) --- */
console.log("HostelVerse Script Loaded 🚀");

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
let isFirstLoad = true; // For Notifications

if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log("✅ Firebase Connected!");
    } catch (e) { console.error(e); }
}

window.addEventListener('load', () => {
    setTimeout(hideLoader, 3000);
    setupAdminTrigger();
    initializeIdentity();
});

function hideLoader() {
    const l = document.getElementById('loader');
    if (l) { l.style.opacity = '0'; setTimeout(() => { l.style.display = 'none'; }, 500); }
}

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

// 🔔 NOTIFICATION SYSTEM
window.enableNotifications = function() {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        new Notification("Notifications Enabled! 🔔", { body: "You'll be alerted when tea is spilled." });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification("Notifications Enabled! 🔔", { body: "You'll be alerted when tea is spilled." });
            }
        });
    }
};

function triggerNotification(text) {
    if (Notification.permission === "granted" && document.hidden) {
        new Notification("New Tea Spilled! ☕", { 
            body: text.substring(0, 30) + "...", 
            icon: "Hostel Verse Logo.png" 
        });
    }
}

// 💡 FEEDBACK SYSTEM
window.submitFeedback = function() {
    const text = document.getElementById('feedbackInput').value.trim();
    if (!text) return alert("Please type something!");
    
    db.ref('feedback').push({
        text: text,
        time: new Date().toLocaleString(),
        deviceId: getDeviceId()
    }, (error) => {
        if (!error) {
            alert("Thanks! I'll read this. 🚀");
            document.getElementById('feedbackInput').value = "";
        }
    });
};

function setupAdminTrigger() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            if(window.location.pathname.includes('index.html') || window.location.href.endsWith('/')) {
                e.preventDefault();
                logoClicks++;
                if (logoClicks === 5) {
                    if (prompt("Password:") === "#Y00cr0y0y") { 
                        isAdminMode = true; alert("🔓 GOD MODE"); listenForConfessions(); 
                    }
                    logoClicks = 0;
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('feed-container')) listenForConfessions();
    setupCharCounter();
});

function setupCharCounter() {
    const input = document.getElementById('confessionInput');
    const counter = document.getElementById('charCount');
    if (input && counter) {
        input.addEventListener('input', function() {
            counter.innerText = `${this.value.length} / 280`;
        });
    }
}

window.addPollInput = function() {
    const container = document.getElementById('pollOptionsContainer');
    const count = container.getElementsByTagName('input').length;
    if (count >= 4) { alert("Max 4 options allowed!"); return; }
    const input = document.createElement('input');
    input.type = "text";
    input.className = "poll-input";
    input.placeholder = `Option ${count + 1}`;
    input.style.marginTop = "10px";
    input.style.borderColor = (count === 2) ? "#eccc68" : "#2ecc71";
    container.appendChild(input);
    if (count + 1 >= 4) document.getElementById('addOptBtn').style.display = 'none';
};

window.submitPost = function() {
    const category = document.getElementById('categorySelect').value;
    const isPoll = document.getElementById('poll-mode').style.display === 'block';

    let newPost = {
        category: category,
        avatar: getMyAvatar(),
        likes: 0,
        reports: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deviceId: getDeviceId(),
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    if (isPoll) {
        const question = document.getElementById('pollQuestion').value.trim();
        const inputs = document.querySelectorAll('.poll-input');
        let options = [];
        inputs.forEach(input => { if (input.value.trim()) options.push({ text: input.value.trim(), votes: 0 }); });
        if (!question || options.length < 2) return alert("Question + at least 2 options required!");
        newPost.type = 'poll'; newPost.text = question; newPost.options = options;
    } else {
        const text = document.getElementById('confessionInput').value.trim();
        if (!text) return alert("Write something!");
        newPost.type = 'text'; newPost.text = text;
    }

    db.ref('confessions').push(newPost, (error) => {
        if (error) alert("Error: " + error.message);
        else window.location.href = 'index.html';
    });
};

function listenForConfessions() {
    if (!db) return;
    const container = document.getElementById('feed-container');
    
    db.ref('confessions').on('value', (snapshot) => {
        hideLoader();
        const data = snapshot.val();
        if (!data) { container.innerHTML = `<p style="text-align:center; opacity:0.5;">No posts yet.</p>`; return; }
        
        const previousCount = allConfessions.length;
        
        allConfessions = Object.keys(data)
            .map(key => ({ firebaseKey: key, ...data[key] }))
            .filter(post => isAdminMode || (post.reports || 0) < 5); 

        allConfessions.sort((a, b) => b.timestamp - a.timestamp);
        
        // 🔔 NOTIFICATION TRIGGER
        if (!isFirstLoad && allConfessions.length > previousCount) {
             // Only notify if the new post is NOT mine
             if (allConfessions[0].deviceId !== getDeviceId()) {
                 triggerNotification(allConfessions[0].text);
             }
        }
        isFirstLoad = false;

        renderFeed(container, allConfessions);
    });
}

window.filterFeed = function() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const container = document.getElementById('feed-container');
    if (!allConfessions.length) return;
    const filtered = allConfessions.filter(post => (post.text || "").toLowerCase().includes(query) || (post.category || "").toLowerCase().includes(query));
    renderFeed(container, filtered);
};

function renderFeed(container, posts) {
    const myId = getDeviceId();
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');

    container.innerHTML = posts.map(post => {
        const isLiked = likedPosts.includes(post.firebaseKey);
        const likeColor = isLiked ? "#bc13fe" : "white";
        const isMine = post.deviceId === myId;
        
        let contentHTML = '';
        if (post.type === 'poll') {
            if (post.options && Array.isArray(post.options)) {
                const totalVotes = post.options.reduce((acc, opt) => acc + (opt.votes || 0), 0);
                const barsHTML = post.options.map((opt, index) => {
                    const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                    const colors = ["#48dbfb", "#ff4757", "#eccc68", "#2ecc71"];
                    const color = colors[index % colors.length];
                    return `<div onclick="votePoll('${post.firebaseKey}', ${index})" style="background:rgba(255,255,255,0.05); border:1px solid ${color}; border-radius:10px; padding:10px; margin-bottom:8px; cursor:pointer; position:relative; overflow:hidden;"><div style="position:absolute; top:0; left:0; height:100%; width:${percent}%; background:${color}; opacity:0.2; z-index:0; transition:width 0.5s;"></div><div style="display:flex; justify-content:space-between; position:relative; z-index:1;"><strong>${opt.text}</strong><span>${percent}%</span></div></div>`;
                }).join('');
                contentHTML = `<h3 style="margin-bottom:15px; font-size:1.1rem;">📊 ${post.text}</h3>${barsHTML}<small style="opacity:0.5; display:block; text-align:right;">Total Votes: ${totalVotes}</small>`;
            } else { contentHTML = `<p style="color:red; font-size:0.8rem;">(Old Poll)</p>`; }
        } else { contentHTML = `<p style="white-space: pre-wrap; margin-bottom: 15px;">${post.text}</p>`; }

        const deleteBtn = (isAdminMode || isMine) ? `<button onclick="deletePost('${post.firebaseKey}')" style="color:#ff4757; background:rgba(255,71,87,0.1); border:1px solid #ff4757; padding:5px 10px; margin-left:10px;">🗑️</button>` : '';
        const commentsObj = post.comments || {};
        const cCount = Object.keys(commentsObj).length;
        const cHTML = Object.entries(commentsObj).map(([id, c]) => {
            const delC = (isAdminMode || c.deviceId === myId) ? `<span onclick="delCom('${post.firebaseKey}','${id}')" style="float:right;color:red;cursor:pointer;">🗑️</span>` : '';
            return `<div class="comment-bubble">${delC}<strong>${c.avatar}</strong><br>${c.text}</div>`;
        }).join('');

        return `<div class="glass-card ${post.category ? 'cat-'+post.category : ''}"><div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><span style="font-size:1.5rem;">${post.avatar}</span><small style="opacity:0.5;">${post.time}</small></div>${contentHTML}<div style="display:flex; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px; margin-top:15px;"><button onclick="likePost('${post.firebaseKey}', ${post.likes || 0})" style="background:none; border:none; color:${likeColor}; font-weight:bold; margin-right:15px;">🔥 ${post.likes || 0}</button><button onclick="toggleComments('${post.firebaseKey}')" style="background:none; border:none; color:white; opacity:0.8;">💬 ${cCount}</button>${deleteBtn}</div><div id="comments-${post.firebaseKey}" class="comment-section"><div class="comments-list">${cHTML || '<small>No comments.</small>'}</div><div class="reply-area"><input type="text" id="input-${post.firebaseKey}" class="reply-input" placeholder="Reply..."><button onclick="submitComment('${post.firebaseKey}')" class="reply-btn">🚀</button></div></div></div>`;
    }).join('');
}

window.votePoll = function(key, index) { const k = `voted_${key}`; if (localStorage.getItem(k)) { alert("Already voted!"); return; } db.ref('confessions/'+key+'/options/'+index+'/votes').transaction((v) => (v || 0) + 1, (e, c) => { if (c) localStorage.setItem(k, 'true'); }); };
window.toggleComments = function(k) { const s=document.getElementById('comments-'+k); if(s)s.style.display=(s.style.display==="block")?"none":"block"; };
window.submitComment = function(k) { const v=document.getElementById('input-'+k).value.trim(); if(v) db.ref('confessions/'+k+'/comments').push({text:v, avatar:getMyAvatar(), time:new Date().toLocaleTimeString(), deviceId:getDeviceId()}); };
window.delCom = function(p,c) { if(confirm("Delete?")) db.ref('confessions/'+p+'/comments/'+c).remove(); };
window.likePost = function(k,l) { let liked=JSON.parse(localStorage.getItem('likedPosts')||'[]'); if(!liked.includes(k)) { db.ref('confessions/'+k).update({likes:l+1}); liked.push(k); localStorage.setItem('likedPosts',JSON.stringify(liked)); }};
window.deletePost = function(k) { if(confirm("Delete?")) db.ref('confessions/'+k).remove(); };
window.rollDicePrompt = function() { document.getElementById('confessionInput').value = ["I lied about...", "Crush on...", "Secret is..."][Math.floor(Math.random()*3)]; };
window.addTag = function(t) { document.getElementById('confessionInput').value += " " + t; };
window.spinBottle=function(){const b=document.getElementById('bottle');if(b){let r=Math.random()*3000+720;b.style.transform=`rotate(${r}deg)`;}};
window.getToD=function(t){document.getElementById('tod-display').innerText="Ask your friends!";};
window.nextNeverHaveIEver=function(){document.getElementById('nhie-display').innerText="Click Next!";};
window.calculateFlames=function(){document.getElementById('flames-result').innerText="❤️";};
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); const b=document.getElementById('installBtn'); if(b){b.style.display='block'; b.onclick=()=>e.prompt();} });
