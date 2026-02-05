/* --- HOSTELVERSE V10.0 (ADMIN DASHBOARD + FEEDBACK + NOTIFICATIONS) --- */
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
let isFirstLoad = true; 

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
        alert("This browser does not support notifications.");
    } else if (Notification.permission === "granted") {
        new Notification("Notifications Active! 🔔", { body: "You'll be alerted when tea is spilled." });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification("Notifications Active! 🔔", { body: "You'll be alerted when tea is spilled." });
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

// 🕵️‍♂️ ADMIN TRIGGER & DASHBOARD
function setupAdminTrigger() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            // Only trigger on Feed page
            if(window.location.pathname.includes('index.html') || window.location.href.endsWith('/')) {
                e.preventDefault();
                logoClicks++;
                if (logoClicks === 5) {
                    if (prompt("Password:") === "#Y00cr0y0y") { 
                        isAdminMode = true; 
                        alert("🔓 GOD MODE ACTIVATED"); 
                        listenForConfessions(); // Refresh feed to show delete buttons
                        renderAdminDashboard(); // SHOW THE FEEDBACK PANEL
                    }
                    logoClicks = 0;
                }
            }
        });
    }
}

// 👑 THE SECRET ADMIN DASHBOARD (Injects HTML into Feed)
function renderAdminDashboard() {
    const searchBar = document.querySelector('input[type="text"]').parentNode; // Find the search bar container
    if (!searchBar) return;

    // Check if dashboard already exists
    let dashboard = document.getElementById('admin-dashboard');
    if (!dashboard) {
        dashboard = document.createElement('div');
        dashboard.id = 'admin-dashboard';
        // Insert dashboard BEFORE the search bar
        searchBar.parentNode.insertBefore(dashboard, searchBar);
    }

    // Live Listen for Feedback
    db.ref('feedback').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            dashboard.innerHTML = '<div class="glass-card" style="border:1px solid gold; color:gold; text-align:center; margin-bottom:20px;">👑 Admin Active: No feedback yet.</div>';
            return;
        }

        let html = `
        <div class="glass-card" style="border: 2px solid #ffd700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); margin-bottom: 25px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 10px; margin-bottom: 15px;">
                <h3 style="color: #ffd700;">👑 Admin Inbox</h3>
                <span style="background:#ffd700; color:black; padding:2px 8px; border-radius:10px; font-size:0.8rem; font-weight:bold;">${Object.keys(data).length} Msgs</span>
            </div>
            <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
        `;

        // Sort Newest First
        const items = [];
        Object.keys(data).forEach(key => items.push(data[key]));
        items.reverse();

        items.forEach(item => {
            html += `
            <div style="background: rgba(255,255,255,0.05); border-left: 3px solid #ffd700; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                <p style="font-size: 0.95rem; margin-bottom: 5px; color: #eee;">"${item.text}"</p>
                <small style="opacity: 0.5; font-size: 0.75rem; color: #ffd700;">📅 ${item.time}</small>
            </div>`;
        });

        html += `</div></div>`;
        dashboard.innerHTML = html;
    });
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
            .map
