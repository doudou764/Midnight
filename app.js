import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
query,
orderBy,
onSnapshot,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
getAuth,
signInAnonymously
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* =====================
   FIREBASE CONFIG
===================== */

const firebaseConfig = {

apiKey: "AIzaSyDmuX4WWYittDm81AJB30rOqZCs7RsMJf8",

authDomain: "midnight-fadd0.firebaseapp.com",

projectId: "midnight-fadd0",

storageBucket: "midnight-fadd0.firebasestorage.app",

messagingSenderId: "810459895136",

appId: "1:810459895136:web:6ddf6760b3db4cc648ba05"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

/* =====================
   ELEMENTS
===================== */

const closedScreen =
document.getElementById("closedScreen");

const appScreen =
document.getElementById("app");

const countdown =
document.getElementById("countdown");

const userPseudo =
document.getElementById("userPseudo");

const messagesContainer =
document.getElementById("messages");

const input =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

const onlineCount =
document.getElementById("onlineCount");

const rulesBtn =
document.getElementById("rulesBtn");

const rulesModal =
document.getElementById("rulesModal");

const closeModal =
document.getElementById("closeModal");

const music =
document.getElementById("nightMusic");

document
.getElementById("testMusicBtn")
?.addEventListener("click", () => {

    music.play()
    .then(() => {
        console.log("Musique lancée");
    })
    .catch(err => {
        console.error(err);
    });

});

/* =====================
   MODAL REGLES
===================== */

rulesBtn?.addEventListener(
"click",
()=>{
rulesModal.style.display="flex";
}
);

closeModal?.addEventListener(
"click",
()=>{
rulesModal.style.display="none";
}
);

window.addEventListener(
"click",
(e)=>{
if(e.target===rulesModal){
rulesModal.style.display="none";
}
}
);

/* =====================
   HORAIRES
===================== */

function isMidnightOpen(){

const h =
new Date().getHours();

return h >= 0 && h < 6;
}

function updateAccess(){

if(isMidnightOpen()){

closedScreen.style.display =
"none";

appScreen.style.display =
"flex";

if(music){
music.pause();
music.currentTime = 0;
}

}else{

closedScreen.style.display =
"flex";

appScreen.style.display =
"none";

if(music){

music.play().catch(()=>{
console.log(
"Le navigateur bloque l'autoplay."
);
});

}

}

}

updateAccess();

setInterval(
updateAccess,
30000
);

/* =====================
   COMPTE A REBOURS
===================== */

function updateCountdown(){

const now =
new Date();

const next =
new Date();

next.setDate(
next.getDate()+1
);

next.setHours(
0,
0,
0,
0
);

const diff =
next-now;

const hours =
Math.floor(
diff/(1000*60*60)
);

const mins =
Math.floor(
(diff%(1000*60*60))
/
(1000*60)
);

const secs =
Math.floor(
(diff%(1000*60))
/
1000
);

if(countdown){

countdown.textContent =
`${hours
.toString()
.padStart(2,"0")}:${mins
.toString()
.padStart(2,"0")}:${secs
.toString()
.padStart(2,"0")}`;

}

}

setInterval(
updateCountdown,
1000
);

updateCountdown();

/* =====================
   AUTH FIREBASE
===================== */

await signInAnonymously(auth);

/* =====================
   PSEUDO AUTO
===================== */

let pseudo =
localStorage.getItem(
"midnightPseudo"
);

if(!pseudo){

pseudo =
"Midnight#" +
Math.floor(
1000 +
Math.random()*9000
);

localStorage.setItem(
"midnightPseudo",
pseudo
);

}

userPseudo.textContent =
pseudo;

/* =====================
   UTILISATEURS CONNECTES
===================== */

let fakeUsers =
Math.floor(
10 +
Math.random()*40
);

onlineCount.textContent =
`${fakeUsers} réveillés`;

/* =====================
   ANTI SPAM
===================== */

let lastMessageTime = 0;

function canSend(){

const now = Date.now();

if(now-lastMessageTime < 2000){

alert(
"Attends 2 secondes."
);

return false;
}

lastMessageTime = now;

return true;
}

/* =====================
   COLLECTIONS
===================== */

const messagesRef =
collection(
db,
"messages"
);

const reportsRef =
collection(
db,
"reports"
);

/* =====================
   ENVOI MESSAGE
===================== */

async function sendMessage(){

if(!isMidnightOpen()){

alert(
"Le chat est fermé."
);

return;
}

if(!canSend()) return;

const text =
input.value.trim();

if(!text) return;

if(text.length > 300)
return;

await addDoc(
messagesRef,
{
pseudo,
text,
createdAt:
serverTimestamp()
}
);

input.value="";
}

sendBtn.addEventListener(
"click",
sendMessage
);

input.addEventListener(
"keypress",
(e)=>{

if(e.key==="Enter"){

sendMessage();

}

}
);

/* =====================
   CHARGEMENT MESSAGES
===================== */

const q =
query(
messagesRef,
orderBy("createdAt")
);

onSnapshot(
q,
(snapshot)=>{

messagesContainer.innerHTML="";

snapshot.forEach(
(doc)=>{

const data =
doc.data();

const div =
document.createElement(
"div"
);

div.className =
"message";

div.innerHTML = `

<div class="message-top">

<div class="pseudo">
${data.pseudo}
</div>

<div class="message-actions">

<button
class="report-btn"
data-id="${doc.id}"
>

🚩

</button>

</div>

</div>

<div class="message-text">

${escapeHtml(
data.text
)}

</div>

`;

messagesContainer
.appendChild(div);

});

messagesContainer.scrollTop =
messagesContainer.scrollHeight;

bindReports();

}
);

/* =====================
   SIGNALEMENT
===================== */

function bindReports(){

document
.querySelectorAll(
".report-btn"
)
.forEach(btn=>{

btn.onclick =
async ()=>{

await addDoc(
reportsRef,
{
messageId:
btn.dataset.id,

reportedAt:
serverTimestamp()
}
);

alert(
"Message signalé."
);

};

});

}

/* =====================
   SECURITE HTML
===================== */

function escapeHtml(text){

const div =
document.createElement(
"div"
);

div.innerText =
text;

return div.innerHTML;
}
