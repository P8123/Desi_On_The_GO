import { useState, useRef, useEffect } from "react"
import bgPattern from "@/imports/4.png"
import logoImg from "@/imports/logo.jpg"
import {
  createComment as createCommentRequest,
  createPost as createPostRequest,
  getPosts,
  likePost,
  login,
  logout,
  signup,
  unlikePost,
} from "@/api"

// const APP_URL = 'https://clone-finless-hut.ngrok-free.dev/'
const APP_URL = 'http://localhost:8443/'


// ── PASTE YOUR GEMINI API KEY HERE ────────────────────────────────────
// Get your free key from: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = "AQ.Ab8RN6Kc5PJGZHznpiuJ9DczwW7o0sln4Gj_1ZQbVd8H6JdzsQ"
// ─────────────────────────────────────────────────────────────────────

// ── AI Insight Bubble button ──────────────────────────────────────────
function AIInsightButton({
  keywords,
  motherTongue,
  position = "top",
}: {
  keywords: string[]
  motherTongue: string
  position?: "top" | "bottom"
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ dish: string; text: string } | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  async function handleOpen() {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    if (result) return
    const dishName = keywords[0] ?? keywords.join(", ")
    const prompt = `You are an expert on hyper-local Indian cuisine and regional dialects.
User is viewing the dish: "${dishName}".
User's regional language/mother tongue: "${motherTongue}".

Task:
1. Identify if "${dishName}" has a direct regional equivalent or local name in ${motherTongue}.
2. If the dish name entered is ALREADY in another language, translate it to ${motherTongue}'s equivalent immediately.
3. State clearly in sentence 1: "In ${motherTongue}, this dish is known as [Local Name]."
4. Add 1 short sentence about how it's served or prepared.

RULES:
- Do NOT say "This is a popular dish in India" or give generic responses.
- Keep the entire response under 30 words.
- Be extremely specific.`

    setLoading(true)
    setError(null)
    try {
      const apiKey = GEMINI_API_KEY
      if (!apiKey)
        throw new Error(
          "Please replace YOUR_GEMINI_API_KEY_HERE at the top of App.tsx with your real Gemini API key.",
        )
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      )
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const msg = errBody?.error?.message ?? `HTTP ${res.status}`
        throw new Error(`Gemini error: ${msg}`)
      }
      const data = await res.json()
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "No response from AI."
      setResult({ dish: dishName, text: text.trim() })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  if (!motherTongue || keywords.length === 0) return null

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={handleOpen}
        title={`AI insight in ${motherTongue}`}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
          open
            ? "bg-[#E8650A] border-[#E8650A] text-white shadow-md"
            : "bg-[#E8650A11] border-[#E8650A33] text-[#E8650A] hover:bg-[#E8650A22] hover:border-[#E8650A66]"
        }`}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z" />
        </svg>
        AI
      </button>

      {open && (
        <div
          className={`absolute z-50 w-72 ${
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          } right-0`}
          style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))" }}
        >
          <div
            className={`absolute right-3 w-3 h-3 bg-[#1A1A1A] rotate-45 ${
              position === "top" ? "-bottom-1.5" : "-top-1.5"
            }`}
          />

          <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#E8650A] flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z" />
                  </svg>
                </div>
                <span className="text-white text-[11px] font-bold tracking-wide uppercase">
                  AI Insight
                </span>
                <span className="text-[#555] text-[10px]">·</span>
                <span className="text-[#E8650A] text-[10px] font-semibold">
                  {motherTongue}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#444] hover:text-[#AAA] transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {result && (
              <div className="px-4 pt-3 pb-1">
                <span className="inline-flex items-center gap-1 text-[10px] text-[#666] uppercase tracking-wider font-semibold">
                  <svg
                    width="9"
                    height="9"
                    fill="none"
                    stroke="#E8650A"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  {result.dish}
                </span>
              </div>
            )}

            <div className="px-4 pb-4 pt-2 min-h-[48px] flex items-center">
              {loading && (
                <div className="flex items-center gap-2 text-[#666] text-xs">
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#E8650A"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="#E8650A"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Asking Gemini AI...
                </div>
              )}
              {!loading && error && (
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              )}
              {!loading && result && (
                <p className="text-[#CCC] text-xs leading-relaxed">
                  {result.text}
                </p>
              )}
            </div>

            <div className="px-4 py-2 bg-[#111] flex items-center gap-1.5">
              <svg
                width="9"
                height="9"
                fill="none"
                stroke="#444"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-[#333] text-[10px]">
                Powered by Google Gemini
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type View = "login" | "signup" | "home" | "profile"

interface UserProfile {
  name: string
  email: string
  photo: string | null
  motherTongue: string
}

interface Post {
  id: string
  restaurantName: string
  description: string
  keywords: string[]
  mapLink: string
  photos: string[]
  likes: number
  liked: boolean
  comments: { id: string; text: string; author: string }[]
  authorName: string
  authorPhoto: string | null
  motherTongue?: string
  state?: string
  city?: string
}

// ── All Indian States & their major cities ──────────────────────────────────
const INDIA_STATES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Tirupati", "Guntur", "Nellore"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Tawang"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
  "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Hisar"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Kolhapur"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Puri"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Chandigarh"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
  "Sikkim": ["Gangtok", "Namchi", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Mussoorie"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Lajpat Nagar", "Karol Bagh"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Leh", "Anantnag"],
  "Ladakh": ["Leh", "Kargil"],
}

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-[#E4E0D8] bg-white text-[#1A1A1A] placeholder-[#AAAAAA] text-sm font-medium focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A22] transition-all outline-none"

// ── Tag pill ──────────────────────────────────────────────────────────
function Tag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8650A11] border border-[#E8650A44] text-[#E8650A] text-xs font-semibold">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 text-[#E8650A] hover:text-[#C5530A] leading-none text-sm"
        >
          ×
        </button>
      )}
    </span>
  )
}

// ── Abstract map ──────────────────────────────────────────────────────
function MapPlaceholder({ link }: { link: string }) {
  return (
    <a
      href={link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      title="Open in Google Maps"
      className="block w-full h-full relative overflow-hidden bg-[#E8F4F0] group cursor-pointer"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 120"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <rect width="200" height="120" fill="#E8F4F0" />
        <rect x="0" y="52" width="200" height="8" fill="#fff" opacity="0.7" />
        <rect x="0" y="30" width="200" height="5" fill="#fff" opacity="0.4" />
        <rect x="0" y="85" width="200" height="4" fill="#fff" opacity="0.4" />
        <rect x="40" y="0" width="7" height="120" fill="#fff" opacity="0.7" />
        <rect x="110" y="0" width="5" height="120" fill="#fff" opacity="0.5" />
        <rect x="160" y="0" width="4" height="120" fill="#fff" opacity="0.4" />
        <rect x="15" y="0" width="3" height="120" fill="#fff" opacity="0.3" />
        <rect
          x="50"
          y="10"
          width="55"
          height="18"
          rx="2"
          fill="#C8DDD8"
          opacity="0.6"
        />
        <rect
          x="50"
          y="62"
          width="55"
          height="20"
          rx="2"
          fill="#C8DDD8"
          opacity="0.6"
        />
        <rect
          x="120"
          y="10"
          width="35"
          height="18"
          rx="2"
          fill="#BDD4CE"
          opacity="0.5"
        />
        <rect
          x="120"
          y="62"
          width="35"
          height="20"
          rx="2"
          fill="#BDD4CE"
          opacity="0.5"
        />
        <rect
          x="50"
          y="90"
          width="55"
          height="20"
          rx="2"
          fill="#C8DDD8"
          opacity="0.4"
        />
        <rect
          x="0"
          y="10"
          width="30"
          height="18"
          rx="2"
          fill="#BDD4CE"
          opacity="0.4"
        />
        <rect
          x="168"
          y="10"
          width="28"
          height="40"
          rx="2"
          fill="#C8DDD8"
          opacity="0.4"
        />
        <circle cx="100" cy="56" r="7" fill="#E8650A" />
        <circle cx="100" cy="56" r="3.5" fill="white" />
        <line
          x1="100"
          y1="63"
          x2="100"
          y2="70"
          stroke="#E8650A"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 bg-[#E8650A0A] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="bg-[#E8650A] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Open Maps
        </span>
      </div>
    </a>
  )
}

// ── Photo collage ─────────────────────────────────────────────────────
function PhotoCollage({
  photos,
  className = "",
  scrollable = false,
}: {
  photos: string[]
  className?: string
  scrollable?: boolean
}) {
  if (photos.length === 0)
    return (
      <div
        className={`flex items-center justify-center bg-[#F0EDE8] ${className}`}
      >
        <svg
          width="36"
          height="36"
          fill="none"
          stroke="#CCC"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    )
  if (photos.length === 1)
    return (
      <img src={photos[0]} alt="food" className={`object-cover ${className}`} />
    )
  if (photos.length === 2)
    return (
      <div className={`grid grid-rows-2 gap-0.5 ${className}`}>
        {photos.map((p, i) => (
          <img
            key={i}
            src={p}
            alt="food"
            className="w-full h-full object-cover"
          />
        ))}
      </div>
    )
  if (photos.length === 3)
    return (
      <div className={`grid grid-cols-2 gap-0.5 ${className}`}>
        <img
          src={photos[0]}
          alt="food"
          className="w-full h-full object-cover row-span-2"
        />
        <img
          src={photos[1]}
          alt="food"
          className="w-full h-full object-cover"
        />
        <img
          src={photos[2]}
          alt="food"
          className="w-full h-full object-cover"
        />
      </div>
    )
  if (scrollable) {
    // Modal view: scrollable 2-col grid for all photos
    return (
      <div
        className={`overflow-y-auto ${className}`}
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="grid grid-cols-2 gap-0.5">
          {photos.map((p, i) => (
            <div key={i} className="aspect-square overflow-hidden">
              <img src={p} alt="food" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  // Feed view: fixed 2×2 grid with +N overlay
  return (
    <div className={`grid grid-cols-2 gap-0.5 ${className}`}>
      {photos.slice(0, 4).map((p, i) => (
        <div key={i} className="relative overflow-hidden">
          <img src={p} alt="food" className="w-full h-full object-cover" />
          {i === 3 && photos.length > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                +{photos.length - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Search dropdown ───────────────────────────────────────────────────
function SearchBar({
  posts,
  searchQuery,
  onSearchChange,
}: {
  posts: Post[]
  searchQuery: string
  onSearchChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useState(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setFocused(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  })

  const q = searchQuery.trim().toLowerCase()
  const showDropdown = focused && q.length > 0

  // Dish keyword matches
  const allKeywordWords = posts.flatMap((p) =>
    p.keywords.flatMap((k) => k.toLowerCase().split(/[\s,]+/).filter(Boolean)),
  )
  const allKeywordPhrases = posts.flatMap((p) =>
    p.keywords.map((k) => k.toLowerCase()),
  )
  const wordMatches = Array.from(
    new Set(allKeywordWords.filter((w) => w.includes(q))),
  ).slice(0, 3)
  const phraseMatches = Array.from(
    new Set(
      allKeywordPhrases.filter(
        (k) => k.includes(q) && k !== q && !wordMatches.includes(k),
      ),
    ),
  ).slice(0, 3)
  const dishMatches = Array.from(new Set([...wordMatches, ...phraseMatches])).slice(0, 5)

  // Vendor matches from restaurant names
  const vendorMatches = Array.from(
    new Map(
      posts
        .filter((p) => p.restaurantName.toLowerCase().includes(q))
        .map((p) => [p.restaurantName, p]),
    ).values(),
  ).slice(0, 5)

  // Location matches — state or city name typed
  interface LocationResult {
    label: string;
    type: "state" | "city";
    dishes: string[];
    vendors: string[];
  }
  const locationMatches: LocationResult[] = []
  // Match against states
  const matchedStates = Array.from(new Set(
    posts
      .filter((p) => p.state && p.state.toLowerCase().includes(q))
      .map((p) => p.state as string),
  )).slice(0, 3)
  for (const st of matchedStates) {
    const statePosts = posts.filter((p) => p.state === st)
    const dishes = Array.from(new Set(statePosts.flatMap((p) => p.keywords))).slice(0, 4)
    const vendors = Array.from(new Set(statePosts.map((p) => p.restaurantName))).slice(0, 3)
    locationMatches.push({ label: st, type: "state", dishes, vendors })
  }
  // Match against cities (avoid duplicating a state already added)
  const matchedCities = Array.from(new Set(
    posts
      .filter((p) => p.city && p.city.toLowerCase().includes(q) &&
        !locationMatches.find((l) => l.label === p.state))
      .map((p) => p.city as string),
  )).slice(0, 3)
  for (const ct of matchedCities) {
    const cityPosts = posts.filter((p) => p.city === ct)
    const dishes = Array.from(new Set(cityPosts.flatMap((p) => p.keywords))).slice(0, 4)
    const vendors = Array.from(new Set(cityPosts.map((p) => p.restaurantName))).slice(0, 3)
    locationMatches.push({ label: ct, type: "city", dishes, vendors })
  }

  const hasResults = dishMatches.length > 0 || vendorMatches.length > 0 || locationMatches.length > 0

  const highlight = (text: string) => {
    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) return <span>{text}</span>
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-[#E8650A] font-semibold">
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <div ref={ref} className="flex-1 max-w-xl mx-auto relative">
      {/* Input */}
      <div className="relative">
        <svg
          width="15"
          height="15"
          fill="none"
          stroke={focused ? "#E8650A" : "#666"}
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search dishes, restaurants, cuisines…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setFocused(true)}
          className={`w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#2A2A2A] border text-white placeholder-[#555] text-sm transition-all outline-none ${
            focused
              ? "border-[#E8650A] ring-1 ring-[#E8650A33]"
              : "border-[#3A3A3A]"
          }`}
        />
        {searchQuery && (
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              onSearchChange("")
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#AAA] transition-colors"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-[#1E1E1E] border border-[#2E2E2E] rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
        >
          {!hasResults ? (
            <div className="px-4 py-5 text-center">
              <p className="text-[#555] text-sm">
                No results for{" "}
                <span className="text-[#AAA]">"{searchQuery}"</span>
              </p>
            </div>
          ) : (
            <>
              {/* Dishes */}
              {dishMatches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                    <span className="text-base leading-none">🏷️</span>
                    <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">
                      Dishes
                    </span>
                  </div>
                  {dishMatches.map((dish) => (
                    <button
                      key={dish}
                      onMouseDown={() => {
                        onSearchChange(dish)
                        setFocused(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2A2A2A] transition-colors group text-left"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#E8650A15] flex items-center justify-center shrink-0 group-hover:bg-[#E8650A22] transition-colors">
                        <svg
                          width="12"
                          height="12"
                          fill="none"
                          stroke="#E8650A"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      </div>
                      <span className="text-[#CCC] text-sm group-hover:text-white transition-colors capitalize">
                        {highlight(dish)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Divider between sections */}
              {dishMatches.length > 0 && vendorMatches.length > 0 && (
                <div className="mx-4 my-1 h-px bg-[#2A2A2A]" />
              )}

              {/* Vendors */}
              {vendorMatches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5">
                    <span className="text-base leading-none">🏪</span>
                    <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">
                      Vendors / Dhabas
                    </span>
                  </div>
                  {vendorMatches.map((post) => (
                    <button
                      key={post.id}
                      onMouseDown={() => {
                        onSearchChange(post.restaurantName)
                        setFocused(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2A2A2A] transition-colors group text-left"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#E8650A15] overflow-hidden shrink-0 group-hover:bg-[#E8650A22] transition-colors flex items-center justify-center">
                        {post.photos[0] ? (
                          <img
                            src={post.photos[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            width="12"
                            height="12"
                            fill="none"
                            stroke="#E8650A"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#CCC] text-sm group-hover:text-white transition-colors truncate">
                          {highlight(post.restaurantName)}
                        </p>
                        {post.authorName && (
                          <p className="text-[#444] text-[11px] truncate">
                            by {post.authorName}
                          </p>
                        )}
                      </div>
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        stroke="#444"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        className="shrink-0 group-hover:stroke-[#666] transition-colors"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {/* Location section */}
              {locationMatches.length > 0 && (
                <>
                  {(dishMatches.length > 0 || vendorMatches.length > 0) && (
                    <div className="mx-4 my-1 h-px bg-[#2A2A2A]" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5">
                      <span className="text-base leading-none">📍</span>
                      <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">
                        Location
                      </span>
                    </div>
                    {locationMatches.map((loc) => (
                      <button
                        key={loc.label}
                        onMouseDown={() => { onSearchChange(loc.label); setFocused(false) }}
                        className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-[#2A2A2A] transition-colors group text-left"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#E8650A15] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#E8650A22] transition-colors">
                          <svg width="11" height="11" fill="none" stroke="#E8650A" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[#CCC] text-sm group-hover:text-white transition-colors font-medium">
                              {highlight(loc.label)}
                            </p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E8650A22] text-[#E8650A] font-semibold uppercase">
                              {loc.type}
                            </span>
                          </div>
                          {loc.dishes.length > 0 && (
                            <p className="text-[#555] text-[11px] truncate mt-0.5">
                              🍽 {loc.dishes.join(" · ")}
                            </p>
                          )}
                          {loc.vendors.length > 0 && (
                            <p className="text-[#444] text-[11px] truncate">
                              🏪 {loc.vendors.join(" · ")}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-[#2A2A2A] flex items-center justify-between">
                <span className="text-[10px] text-[#444]">
                  Press Enter to search all results
                </span>
                <span className="text-[10px] text-[#333] font-mono bg-[#2A2A2A] px-1.5 py-0.5 rounded">
                  ↵
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Top Nav (shared) ──────────────────────────────────────────────────
function TopNav({
  onLogoClick,
  onProfileClick,
  onLogout,
  profilePhoto,
  profileName,
  searchQuery,
  onSearchChange,
  posts,
}: {
  onLogoClick: () => void
  onProfileClick: () => void
  onLogout: () => void
  profilePhoto: string | null
  profileName: string
  searchQuery: string
  onSearchChange: (v: string) => void
  posts: Post[]
}) {
  return (
    <nav className="bg-[#1A1A1A] px-4 md:px-8 py-3 flex items-center gap-4 sticky top-0 z-20">
      {/* Logo */}
      <button
        onClick={onLogoClick}
        className="flex items-center gap-2.5 shrink-0"
      >
        <div className="w-9 h-9 bg-[#F0EDE8] rounded-lg overflow-hidden flex items-center justify-center">
          <img
            src={logoImg}
            alt="Desi On The Go"
            className="w-8 h-8 object-contain"
          />
        </div>
        <span className="text-white font-bold text-base tracking-wide hidden sm:block">
          <span className="text-[#E8650A]">DESI</span> ON THE GO
        </span>
      </button>

      {/* Search bar */}
      <SearchBar
        posts={posts}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onProfileClick}
          title="My Profile"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2A2A2A] hover:bg-[#333] border border-[#3A3A3A] transition-colors group"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden bg-[#E8650A33] flex items-center justify-center">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={profileName}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="#E8650A"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <span className="text-sm text-[#CCC] group-hover:text-white transition-colors hidden sm:block font-medium">
            {profileName || "Profile"}
          </span>
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#3A3A3A] text-[#AAA] hover:text-[#E8650A] hover:border-[#E8650A44] transition-colors text-sm font-medium"
        >
          <svg
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </nav>
  )
}

// ── Grid Post Card (photo + name + description only) ─────────────────
function GridPostCard({
  post,
  onClick,
  motherTongue,
}: {
  post: Post
  onClick: () => void
  motherTongue: string
}) {
  const isGuide = post.id == '0'
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 group ${
        isGuide
          ? "shadow-md ring-2 ring-[#E8650A33] hover:ring-[#E8650A66]"
          : "shadow-sm hover:shadow-lg hover:-translate-y-0.5"
      }`}
    >
      {/* Guide badge */}
      {isGuide && (
        <div className="bg-[#E8650A] px-3 py-1.5 flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            fill="none"
            stroke="white"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-white text-[11px] font-semibold tracking-wide uppercase">
            Example Post — Click to explore
          </span>
        </div>
      )}

      {/* Photo */}
      <div className="h-52 shrink-0 overflow-hidden bg-[#F0EDE8]">
        <PhotoCollage
          photos={post.photos}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Name + description */}
      <div className="px-4 py-3.5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-[#E8650A22] flex items-center justify-center shrink-0">
            {post.authorPhoto ? (
              <img
                src={post.authorPhoto}
                alt={post.authorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                width="10"
                height="10"
                fill="none"
                stroke="#E8650A"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <span className="text-[11px] text-[#AAA] font-medium truncate">
            {post.authorName || "Anonymous"}
          </span>
          {isGuide && (
            <span className="ml-auto text-[10px] text-[#E8650A] font-semibold bg-[#E8650A11] px-2 py-0.5 rounded-full">
              Demo
            </span>
          )}
        </div>
        <h3
          className="font-bold text-[#1A1A1A] text-sm leading-snug line-clamp-1 group-hover:text-[#E8650A] transition-colors"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {post.restaurantName}
        </h3>
        {(post.city || post.state) && (
          <div className="flex items-center gap-1 mt-0.5">
            <svg width="9" height="9" fill="none" stroke="#E8650A" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-[10px] text-[#E8650A] font-medium">
              {[post.city, post.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
        <p className="text-xs text-[#777] leading-relaxed line-clamp-2">
          {post.description}
        </p>
        {post.keywords.length > 0 && motherTongue && (
          <div
            className="flex justify-end mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <AIInsightButton
              keywords={post.keywords}
              motherTongue={motherTongue}
              position="top"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Post Detail Modal (full split layout) ─────────────────────────────
function PostDetailModal({
  post,
  onClose,
  onLike,
  onComment,
  motherTongue,
}: {
  post: Post
  onClose: () => void
  onLike: () => Promise<void>
  onComment: (text: string) => Promise<void>
  motherTongue: string
}) {
  const [commentText, setCommentText] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  const submit = async () => {
    const t = commentText.trim()
    if (!t) return
    setCommentSubmitting(true)
    setActionError(null)
    try {
      await onComment(t)
      setCommentText("")
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Unable to add comment.",
      )
    } finally {
      setCommentSubmitting(false)
    }
  }

  // Collage height scales with number of photos
  const collageH =
    post.photos.length === 0
      ? 200
      : post.photos.length === 1
        ? 340
        : post.photos.length <= 3
          ? 300
          : 280

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Fixed-size modal — no scrolling anywhere */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-[#666] hover:text-[#1A1A1A] transition-colors"
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Author strip */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#F0EDE8]">
          <div className="w-8 h-8 rounded-full bg-[#E8650A22] overflow-hidden flex items-center justify-center shrink-0">
            {post.authorPhoto ? (
              <img
                src={post.authorPhoto}
                alt={post.authorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="#E8650A"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A] leading-none">
              {post.authorName || "Desi on the Go"}
            </p>
            <p className="text-[11px] text-[#AAA] mt-0.5">Food explorer</p>
          </div>
        </div>

        {/* Split body */}
        <div className="flex" style={{ height: collageH }}>
          {/* Left — photo collage, dynamic height, scrollable */}
          <div className="w-1/2 shrink-0 bg-[#F0EDE8]">
            <PhotoCollage
              photos={post.photos}
              className="w-full h-full"
              scrollable
            />
          </div>

          {/* Right — fixed layout, no scroll */}
          <div className="w-1/2 flex flex-col border-l border-[#F0EDE8]">
            {/* Map — fixed 40% of right side */}
            <div
              className="border-b border-[#F0EDE8]"
              style={{ height: "42%" }}
            >
              <MapPlaceholder link={post.mapLink} />
            </div>

            {/* Restaurant info — remaining 58% */}
            <div className="flex-1 px-4 py-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3
                      className="font-bold text-[#1A1A1A] text-sm leading-snug"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {post.restaurantName}
                    </h3>
                    {(post.city || post.state) && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <svg width="9" height="9" fill="none" stroke="#E8650A" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="text-[10px] text-[#E8650A] font-medium">
                          {[post.city, post.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                  {post.keywords.length > 0 && motherTongue && (
                    <div className="shrink-0">
                      <AIInsightButton
                        keywords={post.keywords}
                        motherTongue={motherTongue}
                        position="bottom"
                      />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#666] leading-relaxed line-clamp-3">
                  {post.description}
                </p>
                {post.mapLink && (
                  <a
                    href={post.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[#E8650A] font-semibold hover:underline"
                  >
                    <svg
                      width="9"
                      height="9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    View on Google Maps
                  </a>
                )}
              </div>

              {/* Like */}
              <button
                onClick={() => {
                  setActionError(null)
                  void onLike().catch((err: unknown) => {
                    setActionError(
                      err instanceof Error
                        ? err.message
                        : "Unable to update like.",
                    )
                  })
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors self-start ${
                  post.liked
                    ? "text-[#E8650A]"
                    : "text-[#BBB] hover:text-[#E8650A]"
                }`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill={post.liked ? "#E8650A" : "none"}
                  stroke={post.liked ? "#E8650A" : "currentColor"}
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                {post.likes} {post.likes === 1 ? "like" : "likes"}
              </button>
            </div>
          </div>
        </div>

        {/* Comments — fixed section below the split */}
        <div className="border-t border-[#F0EDE8] px-5 py-3 bg-[#FDFCFB]">
          {/* Scrollable comment list — max 3 visible */}
          <div
            className="space-y-2 mb-3 overflow-y-auto"
            style={{ maxHeight: 88 }}
          >
            {(!post.comments || post.comments.length === 0) && (
              <p className="text-[11px] text-[#CCC] text-center py-1">
                No comments yet — be the first!
              </p>
            )}
            {post.comments?.map((c, i) => (
              <div key={c.id || i} className="flex gap-2 items-start">
                <div className="w-5 h-5 rounded-full bg-[#E8650A22] shrink-0 flex items-center justify-center mt-0.5">
                  <svg
                    width="9"
                    height="9"
                    fill="none"
                    stroke="#E8650A"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="bg-[#F0EDE8] rounded-xl px-2.5 py-1.5 flex-1">
                  <span className="text-[11px] font-semibold text-[#1A1A1A] mr-1">
                    {c.author || "User"}
                  </span>
                  <span className="text-[11px] text-[#555]">{c.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input row */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit()
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-[#E4E0D8] bg-white text-xs placeholder-[#AAAAAA] focus:border-[#E8650A] outline-none transition-all"
            />
            <button
              onClick={() => void submit()}
              disabled={!commentText.trim() || commentSubmitting}
              className="px-4 py-2 rounded-xl bg-[#E8650A] hover:bg-[#C5530A] disabled:opacity-50 text-white text-xs font-semibold transition-colors shrink-0"
            >
              {commentSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
          {actionError && (
            <p className="mt-2 text-xs text-red-600">{actionError}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Add Post Modal ────────────────────────────────────────────────────
function AddPostModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (
    post: Omit<Post, "id" | "likes" | "liked" | "comments">,
  ) => Promise<void>
}) {
  const [photos, setPhotos] = useState<string[]>([])
  const [mapLink, setMapLink] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [description, setDescription] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const cityOptions = selectedState ? INDIA_STATES[selectedState] ?? [] : []

  const addKeyword = () => {
    const t = keywordInput.trim().toLowerCase()
    if (t && !keywords.includes(t)) setKeywords((p) => [...p, t])
    setKeywordInput("")
  }

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) =>
        setPhotos((p) => [...p, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async () => {
    if (
      !restaurantName.trim() ||
      !description.trim() ||
      !selectedState ||
      !selectedCity.trim()
    ) {
      setError("Restaurant, description, state, and city are required.")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        restaurantName: restaurantName.trim(),
        description: description.trim(),
        keywords,
        mapLink: mapLink.trim(),
        photos,
        authorName: "",
        authorPhoto: null,
        state: selectedState,
        city: selectedCity.trim(),
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create post.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#F0EDE8] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E0D8] sticky top-0 bg-[#F0EDE8] z-10">
          <h2
            className="text-lg font-bold text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Share a Food Spot
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#555] hover:text-[#1A1A1A] shadow-sm transition-colors"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Photos */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-2 uppercase tracking-wide">
              Photos of the Place
            </label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotos}
            />
            {photos.length === 0 ? (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full h-32 rounded-xl border-2 border-dashed border-[#E8650A66] bg-white flex flex-col items-center justify-center gap-2 hover:border-[#E8650A] hover:bg-[#E8650A08] transition-all group"
              >
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  stroke="#E8650A"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  className="opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-xs text-[#E8650A] font-semibold">
                  Upload photos
                </span>
                <span className="text-[11px] text-[#AAA]">
                  Select multiple at once
                </span>
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    <img
                      src={p}
                      alt="upload"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setPhotos((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-[#E8650A44] flex items-center justify-center text-[#E8650A] hover:border-[#E8650A] transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* State + City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-2 uppercase tracking-wide">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedCity("") }}
                className={inputCls + " appearance-none cursor-pointer"}
              >
                <option value="">Select state…</option>
                {Object.keys(INDIA_STATES).sort().map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-2 uppercase tracking-wide">
                City
              </label>
              {cityOptions.length > 0 ? (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className={inputCls + " appearance-none cursor-pointer"}
                >
                  <option value="">Select city…</option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="City name…"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className={inputCls}
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#555] mb-2 uppercase tracking-wide">
              Restaurant / Eatery Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sharma Ji ka Dhaba"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#555] mb-2 uppercase tracking-wide">
              Description
            </label>
            <textarea
              placeholder="What makes this place special? What did you eat?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E4E0D8] bg-white text-[#1A1A1A] placeholder-[#AAAAAA] text-sm font-medium focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A22] transition-all outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#555] mb-2 uppercase tracking-wide">
              Keywords{" "}
              <span className="text-[#AAA] normal-case font-normal">
                (for search only — not shown on post)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="biryani, street food, halal…"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault()
                    addKeyword()
                  }
                }}
                className={inputCls + " flex-1"}
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-3 rounded-xl bg-[#E8650A] hover:bg-[#C5530A] text-white text-sm font-semibold transition-colors"
              >
                Add
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((k) => (
                  <Tag
                    key={k}
                    label={k}
                    onRemove={() =>
                      setKeywords((p) => p.filter((x) => x !== k))
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#555] mb-2 uppercase tracking-wide">
              Google Maps Link
            </label>
            <input
              type="url"
              placeholder="https://maps.google.com/..."
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              className={inputCls}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={() => void handleSubmit()}
            disabled={
              submitting ||
              !restaurantName.trim() ||
              !description.trim() ||
              !selectedState ||
              !selectedCity.trim()
            }
            className="w-full py-3.5 rounded-xl bg-[#E8650A] hover:bg-[#C5530A] disabled:bg-[#E4E0D8] disabled:text-[#AAA] text-white font-bold text-sm tracking-wide transition-all shadow-md"
          >
            {submitting ? "Creating Post..." : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════════════════
function HomePage({
  posts,
  guidePost,
  profile,
  profilePhoto,
  onLike,
  onComment,
  onAddPost,
  onGoProfile,
  onLogout,
}: {
  posts: Post[]
  guidePost: Post | null
  profile: UserProfile
  profilePhoto: string | null
  onLike: (id: string) => Promise<void>
  onComment: (id: string, text: string) => Promise<void>
  onAddPost: (
    post: Omit<Post, "id" | "likes" | "liked" | "comments">,
  ) => Promise<void>
  onGoProfile: () => void
  onLogout: () => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // Combine real posts + guide post (guide shown at end, only when no real posts yet)
  const allPosts: Post[] = guidePost ? [...posts, guidePost] : posts

  const filtered = allPosts.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.restaurantName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.includes(q)) ||
      p.authorName.toLowerCase().includes(q) ||
      (p.state ?? "").toLowerCase().includes(q) ||
      (p.city ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[#F0EDE8]">
      {showModal && (
        <AddPostModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) =>
            onAddPost({
              ...data,
              authorName: profile.name,
              authorPhoto: profilePhoto,
            })
          }
        />
      )}
      {selectedPost && (
        <PostDetailModal
          post={allPosts.find((p) => p.id === selectedPost.id) ?? selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={() =>
            selectedPost.id !== "guide-post"
              ? onLike(selectedPost.id)
              : Promise.resolve()
          }
          onComment={(text) => {
            if (selectedPost.id !== "guide-post")
              return onComment(selectedPost.id, text)
            return Promise.resolve()
          }}
          motherTongue={profile.motherTongue}
        />
      )}

      <TopNav
        onLogoClick={() => {}}
        onProfileClick={onGoProfile}
        onLogout={onLogout}
        profilePhoto={profilePhoto}
        profileName={profile.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        posts={allPosts}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {searchQuery
                ? `Results for "${searchQuery}"`
                : "What's everyone eating?"}
            </h1>
            <p className="text-sm text-[#888] mt-0.5">
              {filtered.length} {filtered.length === 1 ? "post" : "posts"}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8650A] hover:bg-[#C5530A] text-white font-semibold text-sm transition-all shadow hover:shadow-md"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Post
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-5 shadow-sm">
              {searchQuery ? (
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  stroke="#E8650A"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              ) : (
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  stroke="#E8650A"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )}
            </div>
            <h3 className="font-bold text-[#1A1A1A] text-lg mb-2">
              {searchQuery ? "No posts match your search" : "No posts yet"}
            </h3>
            <p className="text-sm text-[#AAA] max-w-xs mb-6">
              {searchQuery
                ? "Try different keywords or a restaurant name."
                : "Be the first to share a desi food spot!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#E8650A] text-[#E8650A] font-semibold text-sm hover:bg-[#E8650A] hover:text-white transition-all"
              >
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Share a spot
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((post) => (
              <GridPostCard
                key={post.id}
                post={post}
                onClick={() => setSelectedPost(post)}
                motherTongue={profile.motherTongue}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════
function LoginPage({
  onSignIn,
  onGoSignup,
}: {
  onSignIn: (email: string, password: string) => Promise<void>
  onGoSignup: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError("Enter your email address and password.")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSignIn(email.trim(), password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to sign in.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:flex flex-col items-center justify-center w-[55%] relative overflow-hidden"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-[#F0EDE8] rounded-2xl p-8 shadow-2xl flex items-center justify-center w-52 h-52">
          <img
            src={logoImg}
            alt="Desi On The Go"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="mt-6 text-white font-semibold text-lg tracking-wide drop-shadow">
          Find desi food, wherever you go.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-[#F0EDE8] px-8 py-12">
        <div className="md:hidden mb-8 flex items-center justify-center w-28 h-28 bg-white rounded-2xl shadow-md">
          <img
            src={logoImg}
            alt="Desi On The Go"
            className="w-full h-full object-contain p-2"
          />
        </div>
        <div className="w-full max-w-sm">
          <h1
            className="text-3xl font-extrabold text-[#1A1A1A] mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Welcome back
          </h1>
          <p className="text-sm text-[#777] mb-8">
            Sign in to discover desi food near you
          </p>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls + " pr-12"}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#E8650A] transition-colors"
              >
                {showPw ? (
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="text-right mt-2 mb-6">
            <button className="text-xs text-[#E8650A] hover:text-[#C5530A] font-medium transition-colors">
              Having trouble signing in?
            </button>
          </div>
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={handleSignIn}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-[#E8650A] hover:bg-[#C5530A] disabled:cursor-not-allowed disabled:opacity-60 text-white font-bold text-sm tracking-wide transition-all shadow-md"
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
          <p className="text-center mt-6 text-sm text-[#777]">
            Don&apos;t have an account?{" "}
            <button
              onClick={onGoSignup}
              className="text-[#E8650A] font-bold hover:text-[#C5530A] transition-colors"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// SIGN UP
// ══════════════════════════════════════════════════════════════════════
function SignupPage({
  onComplete,
  onGoLogin,
}: {
  onComplete: (profile: UserProfile) => void
  onGoLogin: () => void
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    currentCity: "",
    motherTongue: "",
  })
  const [cityInput, setCityInput] = useState("")
  const [pastCities, setPastCities] = useState<string[]>([])
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [customLanguage, setCustomLanguage] = useState("")

  const COMMON_LANGUAGES = [
    "Hindi",
    "Punjabi",
    "Bengali",
    "Gujarati",
    "Marathi",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Odia",
    "Urdu",
    "Assamese",
    "Other"
  ]
  
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }))
  const addCity = () => {
    const t = cityInput.trim()
    if (t && !pastCities.includes(t)) {
      setPastCities((p) => [...p, t])
      setCityInput("")
    }
  }

  const handleSignup = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.currentCity.trim() ||
      !form.motherTongue.trim()
    ) {
      setError("Please complete all required fields.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    // --- ADD PASSWORD VALIDATION HERE ---
    const passwordRules = /^(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRules.test(form.password)) {
      setError("Password must be at least 8 characters, include 1 uppercase letter and 1 number.")
      return
    }
    // ------------------------------------

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const user = await signup({
        full_name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        current_city: form.currentCity.trim(),
        cities_lived: pastCities,
        mother_tongue: form.motherTongue.trim(),
      })
      onComplete({
        name: user.name,
        email: user.email,
        photo: user.photo,
        motherTongue: user.motherTongue,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create account.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:flex flex-col items-center justify-center w-[42%] relative overflow-hidden"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-[#F0EDE8] rounded-2xl p-6 shadow-2xl flex items-center justify-center w-44 h-44">
          <img
            src={logoImg}
            alt="Desi On The Go"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="mt-6 text-white font-semibold text-base tracking-wide drop-shadow text-center px-8">
          Connect with your roots.
          <br />
          Share the flavours you love.
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F0EDE8] px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl shadow flex items-center justify-center">
              <img
                src={logoImg}
                alt="Desi On The Go"
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
          <h1
            className="text-3xl font-extrabold text-[#1A1A1A] mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Join Desi on the Go
          </h1>
          <p className="text-sm text-[#777] mb-7">
            Tell us a little about yourself
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Priya Sharma"
                  value={form.name}
                  onChange={set("name")}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="priya@example.com"
                  value={form.email}
                  onChange={set("email")}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  className={inputCls + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#E8650A] transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              {/* Changed type="password" to share the showPw state */}
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                className={inputCls}
              />
            </div>
            </div>
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[#E4E0D8]" />
              <span className="text-xs text-[#AAA] font-medium">
                Where are you from?
              </span>
              <div className="flex-1 h-px bg-[#E4E0D8]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wide">
                City Currently Living In
              </label>
              <input
                type="text"
                placeholder="e.g. Toronto"
                value={form.currentCity}
                onChange={set("currentCity")}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wide">
                Cities Lived In Since Childhood
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a city, press Enter"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      addCity()
                    }
                  }}
                  className={inputCls + " flex-1"}
                />
                <button
                  type="button"
                  onClick={addCity}
                  className="px-4 py-3 rounded-xl bg-[#E8650A] hover:bg-[#C5530A] text-white text-sm font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
              {pastCities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {pastCities.map((city) => (
                    <Tag
                      key={city}
                      label={city}
                      onRemove={() =>
                        setPastCities((p) => p.filter((c) => c !== city))
                      }
                    />
                  ))}
                </div>
              )}
            </div>
            <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wide">
              Mother Tongue
            </label>
            
            {/* Dropdown Select */}
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const val = e.target.value
                setSelectedLanguage(val)
                if (val !== "Other") {
                  setCustomLanguage("")
                  setForm((prev) => ({ ...prev, motherTongue: val }))
                } else {
                  setForm((prev) => ({ ...prev, motherTongue: customLanguage }))
                }
              }}
              className={inputCls}
            >
              <option value="" disabled>
                Select your mother tongue
              </option>
              {COMMON_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            {/* Input field shown ONLY if "Other" is selected */}
            {selectedLanguage === "Other" && (
              <input
                type="text"
                placeholder="Type your mother tongue..."
                value={customLanguage}
                onChange={(e) => {
                  const val = e.target.value
                  setCustomLanguage(val)
                  setForm((prev) => ({ ...prev, motherTongue: val }))
                }}
                className={inputCls + " mt-2.5"}
              />
            )}
          </div>
          </div>
          {error && (
            <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={() => void handleSignup()}
            disabled={submitting}
            className="w-full mt-7 py-3.5 rounded-xl bg-[#E8650A] hover:bg-[#C5530A] disabled:cursor-not-allowed disabled:opacity-60 text-white font-bold text-sm tracking-wide transition-all shadow-md"
          >
            {submitting ? "Creating Profile..." : "Create My Profile"}
          </button>
          <p className="text-center mt-5 text-sm text-[#777]">
            Already have an account?{" "}
            <button
              onClick={onGoLogin}
              className="text-[#E8650A] font-bold hover:text-[#C5530A] transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// PROFILE PAGE
// ══════════════════════════════════════════════════════════════════════
function ProfilePage({
  profile,
  profilePhoto,
  onPhotoChange,
  posts,
  onLike,
  onComment,
  onAddPost,
  onGoHome,
  onLogout,
}: {
  profile: UserProfile
  profilePhoto: string | null
  onPhotoChange: (photo: string) => void
  posts: Post[]
  onLike: (id: string) => Promise<void>
  onComment: (id: string, text: string) => Promise<void>
  onAddPost: (
    post: Omit<Post, "id" | "likes" | "liked" | "comments">,
  ) => Promise<void>
  onGoHome: () => void
  onLogout: () => void
}) {
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const myPosts = posts.filter((p) => p.authorName === profile.name)

  return (
    <div className="min-h-screen bg-[#F0EDE8]">
      {showModal && (
        <AddPostModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) =>
            onAddPost({
              ...data,
              authorName: profile.name,
              authorPhoto: profilePhoto,
            })
          }
        />
      )}
      {selectedPost && (
        <PostDetailModal
          post={posts.find((p) => p.id === selectedPost.id) ?? selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={() => onLike(selectedPost.id)}
          onComment={(text) => onComment(selectedPost.id, text)}
          motherTongue={profile.motherTongue}
        />
      )}

      <TopNav
        onLogoClick={onGoHome}
        onProfileClick={() => {}}
        onLogout={onLogout}
        profilePhoto={profilePhoto}
        profileName={profile.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        posts={posts}
      />

      {/* Banner */}
      <div
        className="h-44 relative overflow-hidden"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "top",
        }}
      >
        <div className="absolute inset-0 bg-[#1A1A1A44]" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-lg -mt-14 relative z-10 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="relative -mt-20 shrink-0">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-[#E8650A22] overflow-hidden cursor-pointer group"
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#F0EDE8]">
                    <svg
                      width="32"
                      height="32"
                      fill="none"
                      stroke="#E8650A"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (ev) =>
                    onPhotoChange(ev.target?.result as string)
                  reader.readAsDataURL(file)
                }}
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#E8650A] border-2 border-white flex items-center justify-center cursor-pointer hover:bg-[#C5530A] transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="text-2xl font-bold text-[#1A1A1A] truncate"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {profile.name || "Your Name"}
              </h2>
              <p className="text-sm text-[#777] mt-0.5 truncate">
                {profile.email || "your@email.com"}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  stroke="#E8650A"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-xs text-[#E8650A] font-medium">
                  Desi food explorer
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8650A] hover:bg-[#C5530A] text-white font-semibold text-sm transition-all shadow hover:shadow-md"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Post
            </button>
          </div>
          <div className="flex gap-6 mt-6 pt-5 border-t border-[#F0EDE8]">
            {[
              ["Posts", myPosts.length.toString()],
              ["Following", "0"],
              ["Followers", "0"],
            ].map(([label, val]) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold text-[#1A1A1A]">{val}</div>
                <div className="text-xs text-[#AAA] font-medium uppercase tracking-wide">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My posts grid */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[#888] uppercase tracking-wide mb-4">
            My Posts
          </h3>
          {myPosts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#F0EDE8] flex items-center justify-center mb-4">
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  stroke="#E8650A"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1A1A1A] mb-1">
                No posts yet
              </h3>
              <p className="text-sm text-[#AAA] max-w-xs">
                Share your favourite desi food spots with the community.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#E8650A] text-[#E8650A] font-semibold text-sm hover:bg-[#E8650A] hover:text-white transition-all"
              >
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add your first post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myPosts.map((post) => (
                <GridPostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                  motherTongue={profile.motherTongue}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════
// ── Guide / dummy post shown until the user creates their first post ──
const GUIDE_POST: Post = {
  id: "guide-post",
  restaurantName: "Sharma Ji ka Dhaba",
  description:
    "Hidden gem tucked behind the old bus stand — hand-rolled rotis, slow-cooked dal makhani that's been simmering since 6am, and lassi thick enough to stand a spoon in. A taste of home for every Punjabi far from it.",
  keywords: ["punjabi", "dhaba", "dal makhani", "roti", "lassi", "street food"],
  mapLink: "https://maps.google.com",
  photos: [],
  likes: 42,
  liked: false,
  comments: [
    {
      id: "guide-comment-1",
      text: "This is exactly the kind of place I've been looking for in Toronto!",
      author: "Priya S.",
    },
    {
      id: "guide-comment-2",
      text: "The dal makhani description made me emotional 😭 reminds me of home",
      author: "Rahul M.",
    },
  ],
  authorName: "Desi on the Go",
  authorPhoto: null,
}

export default function App() {
  // Check if BOTH the token and saved profile exist
  const savedToken = localStorage.getItem("access_token")
  const savedProfileJson = localStorage.getItem("user_profile")
  
  const hasValidSession = Boolean(savedToken && savedProfileJson)

  const [view, setView] = useState<View>(hasValidSession ? "home" : "login")
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (savedProfileJson) {
      try {
        return JSON.parse(savedProfileJson)
      } catch {
        // Fallback if JSON is corrupted
      }
    }
    return {
      name: "",
      email: "",
      photo: null,
      motherTongue: "Hindi",
    }
  })

  const [profilePhoto, setProfilePhoto] = useState<string | null>(profile.photo)
  const [posts, setPosts] = useState<Post[]>([])
  const [showGuide, setShowGuide] = useState(true)

  const refreshPosts = async () => {
    try {
      const databasePosts = await getPosts()
      setPosts(databasePosts)
      setShowGuide(databasePosts.length === 0)
    } catch (err) {
      console.error("Unable to load posts:", err)
    }
  }

  // Automatically load posts on mount if session is valid
  useEffect(() => {
    if (hasValidSession) {
      void refreshPosts()
    }
  }, [hasValidSession])

  const addPost = async (
    data: Omit<Post, "id" | "likes" | "liked" | "comments">,
  ) => {
    await createPostRequest({
      restaurant_name: data.restaurantName,
      state: data.state ?? "",
      city: data.city ?? "",
      description: data.description,
      keywords: data.keywords,
      map_link: data.mapLink,
      photos: data.photos,
    })
    await refreshPosts()
  }

  const toggleLike = async (id: string) => {
    const post = posts.find((item) => item.id === id)
    if (!post) return

    if (post.liked) await unlikePost(id)
    else await likePost(id)
    await refreshPosts()
  }

  const addComment = async (id: string, text: string) => {
    await createCommentRequest(id, text)
    await refreshPosts()
  }

  if (view === "login")
    return (
      <LoginPage
        onSignIn={async (email, password) => {
          const user = await login(email, password)
          const newProfile = {
            name: user.name,
            email: user.email,
            photo: user.photo,
            motherTongue: user.motherTongue,
          }
          setProfile(newProfile)
          setProfilePhoto(user.photo)
          
          // Save both profile and ensure token is set
          localStorage.setItem("user_profile", JSON.stringify(newProfile))
          
          setView("home")
          void refreshPosts()
        }}
        onGoSignup={() => setView("signup")}
      />
    )
  if (view === "signup")
    return (
      <SignupPage
        onComplete={(p) => {
          setProfile(p)
          setProfilePhoto(p.photo)
          
          // Save profile to localStorage
          localStorage.setItem("user_profile", JSON.stringify(p))
          
          setView("home")
          void refreshPosts()
        }}
        onGoLogin={() => setView("login")}
      />
    )
  if (view === "home")
    return (
      <HomePage
        posts={posts}
        guidePost={showGuide ? GUIDE_POST : null}
        profile={profile}
        profilePhoto={profilePhoto}
        onLike={toggleLike}
        onComment={addComment}
        onAddPost={addPost}
        onGoProfile={() => setView("profile")}
        onLogout={() => {
          logout()
          localStorage.removeItem("user_profile")
          setPosts([])
          setView("login")
        }}
      />
    )
  return (
    <ProfilePage
      profile={profile}
      profilePhoto={profilePhoto}
      onPhotoChange={setProfilePhoto}
      posts={posts}
      onLike={toggleLike}
      onComment={addComment}
      onAddPost={addPost}
      onGoHome={() => setView("home")}
      onLogout={() => {
        logout()
        localStorage.removeItem("user_profile")
        setPosts([])
        setView("login")
      }}
    />
  )
}