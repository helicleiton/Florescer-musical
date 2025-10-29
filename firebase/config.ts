// Cole aqui a configuração do seu projeto Firebase
// 1. Acesse https://firebase.google.com/ e crie um novo projeto.
// 2. Vá para as configurações do projeto e adicione um novo aplicativo da Web.
// 3. Copie o objeto de configuração (firebaseConfig) e cole abaixo.

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBKKYoTFlTc3reOn8zKwTj9C3ucrQI3s_c",
  authDomain: "florescer-musical.firebaseapp.com",
  projectId: "florescer-musical",
  storageBucket: "florescer-musical.appspot.com",
  messagingSenderId: "663722426749",
  appId: "1:663722426749:web:eaae312c4d8d8083e58c14"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Cloud Firestore e obtém uma referência para o serviço
export const db = getFirestore(app);

// Ativa a persistência offline
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Persistência offline falhou: Múltiplas abas abertas.');
    } else if (err.code == 'unimplemented') {
      console.warn('Persistência offline não suportada neste navegador.');
    }
  });