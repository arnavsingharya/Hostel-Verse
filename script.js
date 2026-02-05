/* --- HOSTELVERSE V7.0 (POLLS + SEARCH + ADMIN) --- */
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

let db;
let isAdminMode = false;
let logoClicks = 0;
let allConfessions = [];

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

// 🦊 FIXED IDENTITY
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

// 🕵️‍♂️ ADMIN
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

// --- SUBMIT POST (TEXT OR POLL) ---
window.submitPost = function() {
    const category = document.getElementById('categorySelect').value;
    
    // Check if we are in Poll Mode (UI logic is in HTML)
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
        // POLL DATA
        const question = document.getElementById('pollQuestion').value.trim();
        const optA = document.getElementById('optionA').value.trim();
        const optB = document.getElementById('optionB').value.trim();

        if (!question || !optA || !optB) return alert("Fill all poll fields!");
        
        newPost.type = 'poll';
        newPost.text = question; // Storing question as 'text' for search compatibility
        newPost.optionA = optA;
        newPost.optionB = optB;
        newPost.votesA = 0;
        newPost.votesB = 0;
    } else {
        // TEXT DATA
        const text = document.getElementById('confessionInput').value.trim();
        if (!text) return alert("Write something!");
        newPost.type = 'text';
        newPost.text = text;
    }

    db.ref('confessions').push(newPost, (error) => {
        if (error) alert("Error: " + error.message);
        else window.location.href = 'index.html';
    });
};

// --- LISTEN & SEARCH ---
function listenForConfessions() {
    if (!db) return;
    const container = document.getElementById('feed-container');
    
    db.ref('confessions').on('value', (snapshot) => {
        hideLoader();
        const data = snapshot.val();
        if (!data) { container.innerHTML = `<p style="text-align:center; opacity:0.5;">No posts yet.</p>`; return; }
        
        allConfessions = Object.keys(data)
            .map(key => ({ firebaseKey: key, ...data[key] }))
            .filter(post => isAdminMode || (post.reports || 0) < 5); 

        allConfessions.sort((a, b) => b.timestamp - a.timestamp);
        renderFeed(container, allConfessions);
    });
}

window.filterFeed = function() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const container = document.getElementById('feed-container');
    if (!allConfessions.length) return;
    
    const filtered = allConfessions.filter(post => {
        return (post.text || "").toLowerCase().includes(query) || (post.category || "").toLowerCase().includes(query);
    });
    renderFeed(container, filtered);
};

// --- RENDER FEED (POLL + TEXT) ---
function renderFeed(container, posts) {
    const myId = getDeviceId();
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');

    container.innerHTML = posts.map(post => {
        const isLiked = likedPosts.includes(post.firebaseKey);
        const likeColor = isLiked ? "#bc13fe" : "white";
        const isMine = post.deviceId === myId;
        
        // --- CONTENT RENDERER (TEXT vs POLL) ---
        let contentHTML = '';
        if (post.type === 'poll') {
            // POLL RENDERER
            const total = (post.votesA || 0) + (post.votesB || 0);
            const perA = total === 0 ? 50 : Math.round(((post.votesA || 0) / total) * 100);
            const perB = total === 0 ? 50 : Math.round(((post.votesB || 0) / total) * 100);
            
            contentHTML = `
                <h3 style="margin-bottom:15px; font-size:1.1rem;">📊 ${post.text}</h3>
                <div onclick="votePoll('${post.firebaseKey}', 'A')" style="background:rgba(255,255,255,0.1); border:1px solid #48dbfb; border-radius:10px; padding:10px; margin-bottom:10px; cursor:pointer; position:relative; overflow:hidden;">
                    <div style="position:absolute; top:0; left:0; height:100%; width:${perA}%; background:rgba(72,219,251,0.3); z-index:0; transition:width 0.5s;"></div>
                    <div style="display:flex; justify-content:space-between; position:relative; z-index:1;">
                        <strong>${post.optionA}</strong>
                        <span>${perA}%</span>
                    </div>
                </div>
                <div onclick="votePoll('${post.firebaseKey}', 'B')" style="background:rgba(255,255,255,0.1); border:1px solid #ff4757; border-radius:10px; padding:10px; cursor:pointer; position:relative; overflow:hidden;">
                    <div style="position:absolute; top:0; left:0; height:100%; width:${perB}%; background:rgba(255,71,87,0.3); z-index:0; transition:width 0.5s;"></div>
                    <div style="display:flex; justify-content:space-between; position:relative; z-index:1;">
                        <strong>${post.optionB}</strong>
                        <span>${perB}%</span>
                    </div>
                </div>
                <small style="opacity:0.5; display:block; text-align:right; margin-top:5px;">Total Votes: ${total}</small>
            `;
        } else {
            // STANDARD TEXT RENDERER
            contentHTML = `<p style="white-space: pre-wrap; margin-bottom: 15px;">${post.text}</p>`;
        }

        // --- BUTTONS ---
        const deleteBtn = (isAdminMode || isMine) ? `<button onclick="deletePost('${post.firebaseKey}')" style="color:#ff4757; background:rgba(255,71,87,0.1); border:1px solid #ff4757; padding:5px 10px; margin-left:10px;">🗑️</button>` : '';

        // Comments
        const commentsObj = post.comments || {};
        const cCount = Object.keys(commentsObj).length;
        const cHTML = Object.entries(commentsObj).map(([id, c]) => {
            const delC = (isAdminMode || c.deviceId === myId) ? `<span onclick="delCom('${post.firebaseKey}','${id}')" style="float:right;color:red;cursor:pointer;">🗑️</span>` : '';
            return `<div class="comment-bubble">${delC}<strong>${c.avatar}</strong><br>${c.text}</div>`;
        }).join('');

        return `
        <div class="glass-card ${post.category ? 'cat-'+post.category : ''}">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <span style="font-size:1.5rem;">${post.avatar}</span>
                <small style="opacity:0.5;">${post.time}</small>
            </div>
            
            ${contentHTML}
            
            <div style="display:flex; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px; margin-top:15px;">
                <button onclick="likePost('${post.firebaseKey}', ${post.likes || 0})" style="background:none; border:none; color:${likeColor}; font-weight:bold; margin-right:15px;">🔥 ${post.likes || 0}</button>
                <button onclick="toggleComments('${post.firebaseKey}')" style="background:none; border:none; color:white; opacity:0.8;">💬 ${cCount}</button>
                ${deleteBtn}
            </div>

            <div id="comments-${post.firebaseKey}" class="comment-section">
                <div class="comments-list">${cHTML || '<small>No comments.</small>'}</div>
                <div class="reply-area">
                    <input type="text" id="input-${post.firebaseKey}" class="reply-input" placeholder="Reply...">
                    <button onclick="submitComment('${post.firebaseKey}')" class="reply-btn">🚀</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// --- VOTING LOGIC ---
window.votePoll = function(key, option) {
    const votedKey = `voted_${key}`;
    if (localStorage.getItem(votedKey)) {
        alert("You already voted! 🚫");
        return;
    }

    const field = option === 'A' ? 'votesA' : 'votesB';
    db.ref('confessions/' + key).transaction(post => {
        if (post) {
            post[field] = (post[field] || 0) + 1;
        }
        return post;
    }, (error, committed) => {
        if (committed) {
            localStorage.setItem(votedKey, 'true');
            // Alert removed to make it feel faster/smoother
        }
    });
};

// --- ACTIONS ---
window.toggleComments = function(k) { const s=document.getElementById('comments-'+k); if(s)s.style.display=(s.style.display==="block")?"none":"block"; };
window.submitComment = function(k) {
    const v=document.getElementById('input-'+k).value.trim();
    if(v) db.ref('confessions/'+k+'/comments').push({text:v, avatar:getMyAvatar(), time:new Date().toLocaleTimeString(), deviceId:getDeviceId()});
};
window.delCom = function(p,c) { if(confirm("Delete?")) db.ref('confessions/'+p+'/comments/'+c).remove(); };
window.likePost = function(k,l) {
    let liked=JSON.parse(localStorage.getItem('likedPosts')||'[]');
    if(!liked.includes(k)) { db.ref('confessions/'+k).update({likes:l+1}); liked.push(k); localStorage.setItem('likedPosts',JSON.stringify(liked)); }
};
window.deletePost = function(k) { if(confirm("Delete?")) db.ref('confessions/'+k).remove(); };

window.rollDicePrompt = function() { document.getElementById('confessionInput').value = ["I lied about...", "Crush on...", "Secret is..."][Math.floor(Math.random()*3)]; };
window.addTag = function(t) { document.getElementById('confessionInput').value += " " + t; };
// GAMES (Existing)
window.spinBottle=function(){const b=document.getElementById('bottle');if(b){let r=Math.random()*3000+720;b.style.transform=`rotate(${r}deg)`;}};
window.getToD=function(t){document.getElementById('tod-display').innerText="Ask your friends!";};
window.nextNeverHaveIEver=function(){document.getElementById('nhie-display').innerText="Click Next!";};
window.calculateFlames=function(){document.getElementById('flames-result').innerText="❤️";};

// PWA
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); const b=document.getElementById('installBtn'); if(b){b.style.display='block'; b.onclick=()=>e.prompt();} });
