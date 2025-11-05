// Cole aqui a configuração do seu projeto Firebase
// 1. Acesse https://firebase.google.com/ e crie um novo projeto.
// 2. Vá para as configurações do projeto e adicione um novo aplicativo da Web.
// 3. Copie o objeto de configuração (firebaseConfig) e cole abaixo.

// The importmap in index.html maps these imports to the Firebase v9 compat libraries,
// allowing the use of the v8 namespaced API (e.g., firebase.firestore()).
// FIX: Use compat imports for Firebase v8 namespaced API to resolve type errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBKKYoTFlTc3reOn8zKwTj9C3ucrQI3s_c",
  authDomain: "florescer-musical.firebaseapp.com",
  projectId: "florescer-musical",
  storageBucket: "florescer-musical.appspot.com",
  messagingSenderId: "663722426749",
  appId: "1:663722426749:web:eaae312c4d8d8083e58c14"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Inicializa o Cloud Firestore e o Firebase Authentication usando a API v8.
export const db = firebase.firestore();
export const auth = firebase.auth();