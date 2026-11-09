// ── Local food images ─────────────────────────────────────────────────────────
import keralaParothaImg from "@/imports/kerala_Parotha_and_curry.jpeg";
import pyazKachoriImg from "@/imports/pyaz_kachori.jpeg";
import gujaratThaliImg from "@/imports/Gujarat_Thali.jpeg";
import dalBatiImg from "@/imports/dal-bati-churma.jpg";
import kandaPohaImg from "@/imports/kanda_poha.jpeg";
import khamanDhoklaImg from "@/imports/khaman-dhokla.jpg";
import misalPavImg from "@/imports/misal_pav.jpeg";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  motherTongue: string;
  currentCity: string;
  citiesLived: string[];
  photo: string | null;
}

export interface Comment {
  id: number;
  text: string;
  author: string;
}

export interface Post {
  id: number;
  authorName: string;
  authorPhoto: string | null;
  motherTongue: string;
  restaurantName: string;
  description: string;
  keywords: string[];
  mapLink: string;
  photos: string[];
  likes: number;
  liked: boolean;
  comments: Comment[];
  state?: string;
  city?: string;
}

// ── Demo Profiles ──────────────────────────────────────────────────────────
export const DEMO_PROFILES: UserProfile[] = [
  {
    id: "user_1",
    name: "Hetal Patel",
    email: "hetal.patel@example.com",
    motherTongue: "Gujarati",
    currentCity: "Toronto",
    citiesLived: ["Ahmedabad", "Surat", "Toronto"],
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
  },
  {
    id: "user_2",
    name: "Aarav Deshmukh",
    email: "aarav.d@example.com",
    motherTongue: "Marathi",
    currentCity: "London",
    citiesLived: ["Pune", "Mumbai", "London"],
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
  },
  {
    id: "user_3",
    name: "Vikram Rathore",
    email: "vikram.r@example.com",
    motherTongue: "Rajasthani",
    currentCity: "Dubai",
    citiesLived: ["Jaipur", "Jodhpur", "Dubai"],
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
  },
  {
    id: "user_4",
    name: "Ananya Nair",
    email: "ananya.nair@example.com",
    motherTongue: "Malayalam",
    currentCity: "New York",
    citiesLived: ["Kochi", "Trivandrum", "New York"],
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
  },
];

// ── Demo Posts ──────────────────────────────────────────────────────────────
export const DEMO_POSTS: Post[] = [
  // --- GUJARATI POSTS (Hetal Patel) ---
  {
    id: 101,
    authorName: "Hetal Patel",
    authorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
    motherTongue: "Gujarati",
    restaurantName: "Shree Thaker Bhojanalay",
    description: "Authentic unlimited Gujarati Thali served with pure ghee rotis, sweet Surti Undhiyu, crispy farsan, and cold Shrikhand!",
    keywords: ["gujarati thali", "undhiyu", "shrikhand", "authentic thali"],
    mapLink: "https://maps.google.com/?q=Shree+Thaker+Bhojanalay",
    photos: [gujaratThaliImg],
    likes: 24,
    liked: false,
    state: "Gujarat",
    city: "Ahmedabad",
    comments: [
      { id: 1, author: "Aarav Deshmukh", text: "The Undhiyu looks incredible!" },
      { id: 2, author: "Priya Sharma", text: "Best thali in the entire city hands down." },
    ],
  },
  {
    id: 102,
    authorName: "Hetal Patel",
    authorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
    motherTongue: "Gujarati",
    restaurantName: "Das Khaman Center",
    description: "Soft, spongy nylon Khaman Dhokla tempered with mustard seeds, green chilies, and fresh coriander. Served with sweet tamarind chutney.",
    keywords: ["khaman dhokla", "gujarati breakfast", "farsan", "dhokla"],
    mapLink: "https://maps.google.com/?q=Das+Khaman+Center",
    photos: [khamanDhoklaImg],
    likes: 18,
    liked: true,
    state: "Gujarat",
    city: "Surat",
    comments: [{ id: 1, author: "Vikram Rathore", text: "Mustard seed tadka makes all the difference!" }],
  },

  // --- MARATHI POSTS (Aarav Deshmukh) ---
  {
    id: 201,
    authorName: "Aarav Deshmukh",
    authorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
    motherTongue: "Marathi",
    restaurantName: "Katakirr Misal",
    description: "Fiery Puneri Misal Pav with ultra-spicy rassa (tarri), crunchy farsan, chopped onions, and lemon slice. Not for the faint-hearted!",
    keywords: ["misal pav", "puneri misal", "spicy rassa", "marathi street food"],
    mapLink: "https://maps.google.com/?q=Katakirr+Misal",
    photos: [misalPavImg],
    likes: 31,
    liked: false,
    state: "Maharashtra",
    city: "Pune",
    comments: [{ id: 1, author: "Hetal Patel", text: "Looks super spicy! 🌶️" }],
  },
  {
    id: 202,
    authorName: "Aarav Deshmukh",
    authorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
    motherTongue: "Marathi",
    restaurantName: "Bedekar Tea Stall",
    description: "Classic Kanda Poha made with roasted peanuts, curry leaves, fresh grated coconut, and a glass of hot Adrak Masala Chai.",
    keywords: ["kanda poha", "poha", "masala chai", "marathi breakfast"],
    mapLink: "https://maps.google.com/?q=Bedekar+Tea+Stall",
    photos: [kandaPohaImg],
    likes: 15,
    liked: false,
    state: "Maharashtra",
    city: "Mumbai",
    comments: [{ id: 1, author: "Ananya Nair", text: "Poha and chai is the ultimate morning combo!" }],
  },

  // --- RAJASTHANI POSTS (Vikram Rathore) ---
  {
    id: 301,
    authorName: "Vikram Rathore",
    authorPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
    motherTongue: "Rajasthani",
    restaurantName: "Laxmi Mishthan Bhandar (LMB)",
    description: "Authentic Dal Baati Churma soaked in pure desi ghee, served with spicy garlic chutney, Panchmel Dal, and sweet crushed Churma.",
    keywords: ["dal baati churma", "rajasthani thali", "desi ghee", "jaipur special"],
    mapLink: "https://maps.google.com/?q=LMB+Jaipur",
    photos: [dalBatiImg],
    likes: 42,
    liked: true,
    state: "Rajasthan",
    city: "Jaipur",
    comments: [
      { id: 1, author: "Aarav Deshmukh", text: "The garlic chutney here is legendary." },
    ],
  },
  {
    id: 302,
    authorName: "Vikram Rathore",
    authorPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
    motherTongue: "Rajasthani",
    restaurantName: "Rawat Kachori",
    description: "World-famous crispy Pyaz Ki Kachori stuffed with spicy caramelized onion filling, served with sweet date-tamarind chutney.",
    keywords: ["pyaz kachori", "kachori", "jodhpur street food", "crispy snack"],
    mapLink: "https://maps.google.com/?q=Rawat+Kachori",
    photos: [pyazKachoriImg],
    likes: 29,
    liked: false,
    state: "Rajasthan",
    city: "Jodhpur",
    comments: [],
  },

  // --- MALAYALAM POSTS (Ananya Nair) ---
  {
    id: 401,
    authorName: "Ananya Nair",
    authorPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
    motherTongue: "Malayalam",
    restaurantName: "Paragon Restaurant",
    description: "Soft, flaky layered Kerala Parotta with aromatic Malabar Chicken Roast cooked in roasted coconut gravy and curry leaves.",
    keywords: ["kerala parotta", "malabar chicken", "kerala cuisine", "parotta curry"],
    mapLink: "https://maps.google.com/?q=Paragon+Restaurant+Kozhikode",
    photos: [keralaParothaImg],
    likes: 38,
    liked: false,
    state: "Kerala",
    city: "Kozhikode",
    comments: [
      { id: 1, author: "Hetal Patel", text: "Flaky parottas are my absolute favorite!" },
    ],
  },
];
