import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

  const firebaseConfig = {
    apiKey: "AIzaSyBA_1kTeTRJco_nFC3J4hlGiadgA56lhYE",
    authDomain: "flybook-f23c5.firebaseapp.com",
    databaseURL: "https://flybook-f23c5-default-rtdb.firebaseio.com",
    projectId: "flybook-f23c5",
    storageBucket: "flybook-f23c5.firebasestorage.app",
    messagingSenderId: "241186970198",
    appId: "1:241186970198:web:42258bed73bbb45c8b39f7"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);