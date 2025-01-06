import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBA_1kTeTRJco_nFC3J4hlGiadgA56lhYE",
  authDomain: "",
  projectId: "flybook-f23c5",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);