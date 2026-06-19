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

const firebaseConfig = {

apiKey: "TON_API_KEY",

authDomain: "TON_PROJET.firebaseapp.com",

projectId: "TON_PROJECT_ID"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const hour = new Date().getHours();

if(hour >= 0 && hour < 6){

document.getElementById(
"closed-screen"
).style.display = "none";

document.getElementById(
"app"
).style.display = "flex";

}else{

document.getElementById(
"app"
).style.display = "none";

}

await signInAnonymously(auth);

let pseudo =
localStorage.getItem(
"midnightPseudo"
);

if(!pseudo){

pseudo =
"Midnight#" +
Math.floor(
1000 + Math.random() * 9000
);

localStorage.setItem(
"midnightPseudo",
pseudo
);

}

document.getElementById(
"user"
).textContent = pseudo;

const messagesRef =
collection(
db,
"messages"
);

document
.getElementById(
"sendBtn"
)
.addEventListener(
"click",
sendMessage
);

document
.getElementById(
"messageInput"
)
.addEventListener(
"keypress",
(e)=>{
if(e.key==="Enter"){
sendMessage();
}
}
);

async function sendMessage(){

const input =
document.getElementById(
"messageInput"
);

const text =
input.value.trim();

if(!text) return;

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

const q =
query(
messagesRef,
orderBy("createdAt")
);

onSnapshot(
q,
(snapshot)=>{

const messages =
document.getElementById(
"messages"
);

messages.innerHTML="";

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
<div class="pseudo">
${data.pseudo}
</div>

<div class="text">
${data.text}
</div>
`;

messages.appendChild(div);

});

messages.scrollTop =
messages.scrollHeight;

}
);
