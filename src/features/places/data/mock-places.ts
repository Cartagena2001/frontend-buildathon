import type { Place } from "@/features/places/types";

const now = new Date("2026-07-04T00:00:00.000Z");

export const MOCK_PLACES: Place[] = [
  {
    id_place: "mock-el-tunco",
    name: "El Tunco",
    location: {
      address: "El Tunco, La Libertad, El Salvador",
      lat: 13.4922,
      lng: -89.3856,
    },
    category: "beach",
    videos: [
      {
        id: "v1",
        url: "https://tiktok.com/@mock/el-tunco",
        caption: "Atardecer épico en El Tunco",
        likes: 48200,
        views: 890000,
      },
    ],
    trending: { likes: 48200, views: 890000, normalized: 0.92 },
    sentiment: {
      score: 0.88,
      summary: "Surf, atardeceres y ambiente relajado. Muy recomendado por creadores.",
    },
    description:
      "Pueblo costero icónico para surf, sunsets y vida nocturna relajada frente al Pacífico.",
    embedding_text: "El Tunco surf beach La Libertad sunset viral",
    updatedAt: now,
  },
  {
    id_place: "mock-punta-roca",
    name: "Punta Roca",
    location: {
      address: "Punta Roca, La Libertad, El Salvador",
      lat: 13.4901,
      lng: -89.3829,
    },
    category: "beach",
    videos: [
      {
        id: "v2",
        url: "https://tiktok.com/@mock/punta-roca",
        caption: "Olas perfectas en Punta Roca",
        likes: 31500,
        views: 620000,
      },
    ],
    trending: { likes: 31500, views: 620000, normalized: 0.78 },
    sentiment: {
      score: 0.85,
      summary: "Spot de surf de clase mundial. Comentarios muy positivos sobre las olas.",
    },
    description:
      "Uno de los breaks de surf más famosos de Centroamérica, ideal para surfistas intermedios y avanzados.",
    embedding_text: "Punta Roca surf waves La Libertad",
    updatedAt: now,
  },
  {
    id_place: "mock-olocuilta",
    name: "Pupusas en Olocuilta",
    location: {
      address: "Olocuilta, La Paz, El Salvador",
      lat: 13.5412,
      lng: -89.0756,
    },
    category: "restaurant",
    videos: [
      {
        id: "v3",
        url: "https://tiktok.com/@mock/olocuilta",
        caption: "Las mejores pupusas revueltas del país",
        likes: 67800,
        views: 1200000,
      },
    ],
    trending: { likes: 67800, views: 1200000, normalized: 0.95 },
    sentiment: {
      score: 0.91,
      summary: "Pupusas crujientes y generosas. Los comentarios destacan el queso y el chicharrón.",
    },
    description:
      "Ruta gastronómica imprescindible: pupuserías tradicionales con cola de locales y turistas.",
    embedding_text: "Olocuilta pupusas food street El Salvador",
    updatedAt: now,
  },
  {
    id_place: "mock-la-pampa",
    name: "La Pampa Escalón",
    location: {
      address: "Escalón, San Salvador, El Salvador",
      lat: 13.701,
      lng: -89.2245,
    },
    category: "nightlife",
    videos: [
      {
        id: "v4",
        url: "https://tiktok.com/@mock/la-pampa",
        caption: "Vida nocturna en Escalón",
        likes: 22400,
        views: 410000,
      },
    ],
    trending: { likes: 22400, views: 410000, normalized: 0.71 },
    sentiment: {
      score: 0.74,
      summary: "Ambiente animado los fines de semana. Mezcla de locales y turistas.",
    },
    description:
      "Zona de bares y restaurantes en Escalón, popular para salir de noche en San Salvador.",
    embedding_text: "La Pampa Escalón nightlife bars San Salvador",
    updatedAt: now,
  },
  {
    id_place: "mock-cafe-santa-ana",
    name: "Café de Santa Ana",
    location: {
      address: "Centro Histórico, Santa Ana, El Salvador",
      lat: 13.9941,
      lng: -89.5598,
    },
    category: "other",
    videos: [
      {
        id: "v5",
        url: "https://tiktok.com/@mock/santa-ana-cafe",
        caption: "Café de especialidad frente al teatro",
        likes: 12800,
        views: 210000,
      },
    ],
    trending: { likes: 12800, views: 210000, normalized: 0.58 },
    sentiment: {
      score: 0.82,
      summary: "Café artesanal en edificio histórico. Muy fotogénico para TikTok.",
    },
    description:
      "Café de especialidad en el corazón del centro histórico de Santa Ana, cerca del teatro.",
    embedding_text: "Santa Ana coffee specialty historic center",
    updatedAt: now,
  },
];
