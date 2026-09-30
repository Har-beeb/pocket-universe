export const HER_NAME = import.meta.env.VITE_PARTNER_NAME || "My Love";

export const LOVE_LETTER = `In the name of Allah, the Most Gracious, the Most Merciful.

${HER_NAME},

If I could gather every star in the sky and lay them at your feet,
it still would not be enough to show you how much you mean to me.

You came into my world quietly — and then, somehow,
you became the whole universe.

Every memory we've made together is a light I carry with me,
on the ordinary days and on the hard ones.
You have made me better, softer, and more grateful
than I ever thought I could be.

I built this little universe for you —
not because it compares to what you deserve,
but because I wanted you to know:
every chapter of my life is better because you are in it.

May Allah always keep us together, bless our journey,
and make every year more beautiful than the last.

Happy Birthday, ${HER_NAME}.
You are, and always will be, my favourite person.

With all my love.`;

export const chapters = [
  {
    id: "the_past",
    title: "The Journey",
    name: "The Journey",
    year: "2019 — 2025",
    locked: false,
    position: [-8, 2, -12],
    planetType: "terrestrial",
    oceanHue: 350, // Crimson/Lava oceans
    landHue: 25, // Rugged orange/brown land
    planetColor: "#ff4422",
    planetSize: 1.5,
    hasRings: false,
    memories: [],
  },
  {
    id: "the_present",
    title: "The Present",
    name: "The Present",
    year: "2026",
    locked: false,
    position: [0, -2, -5],
    planetType: "ocean",
    oceanHue: 210, // Deep blue ocean
    landHue: 130, // Lush green land
    planetColor: "#22aa77",
    planetSize: 1.7,
    hasRings: false,
    memories: [],
  },
  {
    id: "the_future",
    title: "The Future",
    name: "The Future",
    year: "2027 & Beyond",
    locked: true, // Remains locked!
    position: [8, 2, -12],
    planetType: "gas",
    gasColor1: "#2e231b", // Deep rich browns and golds like Jupiter/Saturn
    gasColor2: "#8c6b45",
    gasColor3: "#d4a977",
    planetColor: "#e6c398",
    planetSize: 1.8,
    hasRings: true,
    ringInnerColor: "#c19a6b", // Majestic dusty gold
    ringOuterColor: "#e8d8c3", // Icy white edge
    ringTilt: -0.3,
    memories: [],
  }
];
