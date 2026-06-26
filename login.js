import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



const firebaseConfig = {
  apiKey: "AIzaSyBUfamPSEoP3qIy_MUifGR1X2ZBtyqz_tQ",
  authDomain: "barberia-bunny-c0486.firebaseapp.com",
  projectId: "barberia-bunny-c0486",
  storageBucket: "barberia-bunny-c0486.firebasestorage.app",
  messagingSenderId: "240230509007",
  appId: "1:240230509007:web:82c6e08b72276ce35d4aba"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);



const btnLogin = document.getElementById('btnLogin');

btnLogin.addEventListener('click', async () => {

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {

    await signInWithEmailAndPassword(auth, email, senha);

    alert("Login correcto ✔");

  
    window.location.href = "admin.html";

  } catch (error) {

    console.error(error);
    alert("Email o contraseña incorrectos ❌");
  }

});