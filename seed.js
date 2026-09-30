import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
// Native Node 20 env loading

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

const pastMemories = [
  {
    title: "Unilag FYB",
    caption: "Our final year brethren moments at Unilag. So many memories packed into those final days of undergrad. A closing of one chapter and the beautiful beginning of another.",
    timestamp: Date.now() - 3000,
    photos: []
  },
  {
    title: "Eid Mubarak (2019-2025)",
    caption: "Dressed in our best for Eid. The food, the prayers, the peace. These years gave us such beautiful Eid memories to look back on.",
    timestamp: Date.now() - 2000,
    photos: []
  },
  {
    title: "Random Beautiful Moments",
    caption: "The unplanned, unfiltered, completely random pictures from 2019 to 2025 that ended up being my absolute favorites.",
    timestamp: Date.now() - 1000,
    photos: []
  }
];

const presentMemories = [
  {
    title: "Convocation 2026",
    caption: "The gown, the cap, the smile. You did it! Walking the stage, celebrating all your hard work, and stepping into the real world.",
    timestamp: Date.now() - 3000,
    photos: []
  },
  {
    title: "Eid-ul-Fitr 2026",
    caption: "Our first Eid of 2026. The glow and the joy of completing Ramadan. May Allah accept our prayers.",
    timestamp: Date.now() - 2000,
    photos: []
  },
  {
    title: "Just Us (2026)",
    caption: "Everyday moments and random pictures from this year that remind me how lucky I am to have you in my universe.",
    timestamp: Date.now() - 1000,
    photos: []
  }
];

async function seed() {
  console.log("Seeding Past chapter...");
  const pastRef = collection(db, "chapters", "the_past", "memories");
  for (const m of pastMemories) {
    await addDoc(pastRef, m);
    console.log(`Added: ${m.title}`);
  }

  console.log("Seeding Present chapter...");
  const presentRef = collection(db, "chapters", "the_present", "memories");
  for (const m of presentMemories) {
    await addDoc(presentRef, m);
    console.log(`Added: ${m.title}`);
  }

  console.log("Done seeding!");
  process.exit(0);
}

seed().catch(console.error);
