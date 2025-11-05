// Cole aqui a configuração do seu projeto Firebase
// 1. Acesse https://firebase.google.com/ e crie um novo projeto.
// 2. Vá para as configurações do projeto e adicione um novo aplicativo da Web.
// 3. Copie o objeto de configuração (firebaseConfig) e cole abaixo.

// FIX: Reverted to Firebase v8 API. The project seems to have an older version of the Firebase SDK,
// which is incompatible with the v9 modular API's `initializeApp` function. All Firebase
// usage has been updated to the v8 namespaced syntax for consistency.
// FIX: Use Firebase v9 compat libraries to support v8 syntax.
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
