import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clean() {
  const pastRef = collection(db, "chapters", "the_past", "memories");
  let snap = await getDocs(pastRef);
  for (const doc of snap.docs) await deleteDoc(doc.ref);

  const presentRef = collection(db, "chapters", "the_present", "memories");
  snap = await getDocs(presentRef);
  for (const doc of snap.docs) await deleteDoc(doc.ref);

  console.log("Database cleaned!");
  process.exit(0);
}
clean();
