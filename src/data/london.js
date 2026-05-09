// Curated London routes & mock social data.
// Routes use lat/lng waypoints; at runtime each waypoint resolves to the
// nearest real TFL jam cam, so the experience is real even though the
// itineraries are hand-picked.

export const ROUTES = [
  {
    id: "royal",
    name: "Royal London",
    color: "#ffb800",
    icon: "👑",
    duration: "~3h",
    distance: "~4.2 km",
    tagline: "From Trafalgar to the gates of Buck House",
    waypoints: [
      { label: "Trafalgar Sq", lat: 51.508, lng: -0.1281 },
      { label: "Westminster Bdg", lat: 51.5008, lng: -0.1224 },
      { label: "Hyde Park Cnr", lat: 51.5028, lng: -0.153 },
      { label: "Marble Arch", lat: 51.5132, lng: -0.1589 },
    ],
  },
  {
    id: "foodie",
    name: "Foodie Soho",
    color: "#ff2bff",
    icon: "🍜",
    duration: "~4h",
    distance: "~3.1 km",
    tagline: "A 4-stop crawl through the West End",
    waypoints: [
      { label: "Oxford Circus", lat: 51.5154, lng: -0.1411 },
      { label: "Piccadilly Circus", lat: 51.5101, lng: -0.134 },
      { label: "Regent St", lat: 51.5125, lng: -0.1397 },
      { label: "Holborn", lat: 51.5174, lng: -0.1198 },
    ],
  },
  {
    id: "film",
    name: "Film Locations",
    color: "#00e5ff",
    icon: "🎬",
    duration: "~5h",
    distance: "~7.4 km",
    tagline: "Stand where the cameras stood",
    waypoints: [
      { label: "Notting Hill Gate", lat: 51.5094, lng: -0.1962 },
      { label: "Camden High St", lat: 51.539, lng: -0.1426 },
      { label: "Tower Bridge", lat: 51.5055, lng: -0.0754 },
      { label: "London Bridge", lat: 51.5079, lng: -0.0877 },
    ],
  },
  {
    id: "indie",
    name: "Indie East",
    color: "#00ff66",
    icon: "🍻",
    duration: "~3.5h",
    distance: "~3.8 km",
    tagline: "Old St → Shoreditch → Liverpool St",
    waypoints: [
      { label: "Shoreditch High St", lat: 51.524, lng: -0.078 },
      { label: "Old St Roundabout", lat: 51.5258, lng: -0.0876 },
      { label: "Angel Islington", lat: 51.5322, lng: -0.1056 },
      { label: "Liverpool St", lat: 51.5178, lng: -0.0823 },
    ],
  },
  {
    id: "river",
    name: "Thames Crossings",
    color: "#00a4a7",
    icon: "🌉",
    duration: "~6h",
    distance: "~14 km",
    tagline: "West-to-east along the river",
    waypoints: [
      { label: "Hammersmith Bdg", lat: 51.4902, lng: -0.2317 },
      { label: "Westminster Bdg", lat: 51.5008, lng: -0.1224 },
      { label: "London Bridge", lat: 51.5079, lng: -0.0877 },
      { label: "Tower Bridge N", lat: 51.5055, lng: -0.0754 },
      { label: "Greenwich Pier", lat: 51.4825, lng: -0.0085 },
    ],
  },
];

export const QUESTS = [
  { id: "q1", name: "First Frame", desc: "Snap your first cam", target: 1, progress: 1, reward: "ROOKIE badge" },
  { id: "q2", name: "Five-O-Clock Rush", desc: "Snap 3 cams during peak hours", target: 3, progress: 1, reward: "GRIDLOCK sticker pack" },
  { id: "q3", name: "Bridge Hopper", desc: "Hit all 6 Thames cams", target: 6, progress: 3, reward: "RIVERAT badge" },
  { id: "q4", name: "Night Owl", desc: "Snap a cam between 23:00–04:00", target: 1, progress: 0, reward: "VAMPIRE filter" },
  { id: "q5", name: "Postcode Bingo", desc: "Snap cams in 8 different postcodes", target: 8, progress: 4, reward: "CARTOGRAPHER badge" },
  { id: "q6", name: "Caught a Bus", desc: "Photo with a visible double-decker", target: 1, progress: 0, reward: "DECKER frame" },
];

export const FRIENDS = [
  { name: "@maya.km", cams: 41, snaps: 88, streak: 12, you: false },
  { name: "@dan_ldn", cams: 38, snaps: 102, streak: 7, you: false },
  { name: "@you", cams: 14, snaps: 27, streak: 3, you: true },
  { name: "@aoife", cams: 12, snaps: 19, streak: 2, you: false },
  { name: "@kris_kr", cams: 9, snaps: 14, streak: 0, you: false },
  { name: "@theo.b", cams: 6, snaps: 9, streak: 0, you: false },
];

// Feed: who snapped, how long ago, caption, plus a hint about which kind of
// cam to render (resolved at runtime against real TFL data).
export const FEED = [
  { id: "f1", who: "@maya.km", whenAgo: "2m", caption: "neon for breakfast", near: { lat: 51.5101, lng: -0.134 } },
  { id: "f2", who: "@dan_ldn", whenAgo: "11m", caption: "the bridge said hi", near: { lat: 51.5055, lng: -0.0754 } },
  { id: "f3", who: "@aoife", whenAgo: "37m", caption: "shoreditch pigeons are sentient", near: { lat: 51.524, lng: -0.078 } },
  { id: "f4", who: "@kris_kr", whenAgo: "1h", caption: "9 buses in one frame", near: { lat: 51.5154, lng: -0.1411 } },
  { id: "f5", who: "@theo.b", whenAgo: "2h", caption: "the tide is rude today", near: { lat: 51.4825, lng: -0.0085 } },
  { id: "f6", who: "@maya.km", whenAgo: "4h", caption: "marble arch goth phase", near: { lat: 51.5132, lng: -0.1589 } },
];

// Tasks for each stop on a route — flavorful camera missions.
export const MISSION_VERBS = [
  "Get a double-decker in frame",
  "Wave at the camera",
  "Catch a black cab mid-turn",
  "Pose with a bus stop",
  "Find the pigeon",
  "Snap during a green light",
  "Catch someone crossing",
  "Get the skyline behind you",
];

export function missionFor(camId, idx) {
  const len = (camId || "").length;
  return MISSION_VERBS[(idx + len) % MISSION_VERBS.length];
}
