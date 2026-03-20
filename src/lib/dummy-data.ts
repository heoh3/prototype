export interface Word {
  id: number;
  text: string;
  meaning: string;
  registeredBy: "admin" | "user";
  registeredAt: string;
  images: string[];
}

export type ReviewStatus = "waiting_meaning" | "meaning_done" | "generated" | "reviewed";

export interface ReviewImage {
  url: string;
  prompt: string;
  meaning: string;
  approved: boolean | null;
}

export interface ImageReviewWord {
  id: number;
  text: string;
  meaning: string;
  images: ReviewImage[];
  retryCount: number;
  reviewStatus: ReviewStatus;
  memo: string;
}

export const dummyWords: Word[] = [
  { id: 1, text: "apple", meaning: "사과", registeredBy: "admin", registeredAt: "2026-03-01", images: ["https://picsum.photos/seed/apple1/200", "https://picsum.photos/seed/apple2/200", "https://picsum.photos/seed/apple3/200", "https://picsum.photos/seed/apple4/200"] },
  { id: 2, text: "abundant", meaning: "풍부한", registeredBy: "admin", registeredAt: "2026-03-02", images: ["https://picsum.photos/seed/abu1/200", "https://picsum.photos/seed/abu2/200", "https://picsum.photos/seed/abu3/200", "https://picsum.photos/seed/abu4/200"] },
  { id: 6, text: "harmony", meaning: "조화", registeredBy: "user", registeredAt: "2026-03-05", images: ["https://picsum.photos/seed/har1/200", "https://picsum.photos/seed/har2/200", "https://picsum.photos/seed/har3/200", "https://picsum.photos/seed/har4/200"] },
  { id: 8, text: "eloquent", meaning: "유창한", registeredBy: "admin", registeredAt: "2026-03-03", images: ["https://picsum.photos/seed/elo1/200", "https://picsum.photos/seed/elo2/200", "https://picsum.photos/seed/elo3/200", "https://picsum.photos/seed/elo4/200"] },
  { id: 10, text: "perseverance", meaning: "인내", registeredBy: "admin", registeredAt: "2026-03-04", images: ["https://picsum.photos/seed/per1/200", "https://picsum.photos/seed/per2/200", "https://picsum.photos/seed/per3/200", "https://picsum.photos/seed/per4/200"] },
];

export const dummyImageReviewWords: ImageReviewWord[] = [
  {
    id: 3,
    text: "serendipity",
    meaning: "우연한 발견",
    images: [
      { url: "https://picsum.photos/seed/ser1/200", prompt: "A person finding a treasure by accident", meaning: "우연한 발견", approved: null },
      { url: "https://picsum.photos/seed/ser2/200", prompt: "A happy surprise discovery moment", meaning: "뜻밖의 행운", approved: null },
      { url: "https://picsum.photos/seed/ser3/200", prompt: "An unexpected beautiful finding", meaning: "예상치 못한 발견", approved: null },
      { url: "https://picsum.photos/seed/ser4/200", prompt: "A lucky discovery in nature", meaning: "행운의 발견", approved: null },
    ],
    retryCount: 0,
    reviewStatus: "generated",
    memo: "",
  },
  {
    id: 4,
    text: "ephemeral",
    meaning: "덧없는",
    images: [
      { url: "https://picsum.photos/seed/eph1/200", prompt: "A flower wilting quickly in timelapse", meaning: "순간적인", approved: null },
      { url: "https://picsum.photos/seed/eph2/200", prompt: "Morning dew evaporating in sunlight", meaning: "덧없는", approved: null },
      { url: "https://picsum.photos/seed/eph3/200", prompt: "A sandcastle being washed away", meaning: "일시적인", approved: null },
      { url: "https://picsum.photos/seed/eph4/200", prompt: "A soap bubble about to pop", meaning: "찰나의", approved: null },
    ],
    retryCount: 1,
    reviewStatus: "generated",
    memo: "",
  },
  {
    id: 7,
    text: "resilience",
    meaning: "회복력",
    images: [
      { url: "https://picsum.photos/seed/res1/200", prompt: "A tree growing through concrete", meaning: "회복력", approved: true },
      { url: "https://picsum.photos/seed/res2/200", prompt: "A person standing strong in a storm", meaning: "인내심", approved: true },
      { url: "https://picsum.photos/seed/res3/200", prompt: "A plant regrowing after being cut", meaning: "복원력", approved: true },
      { url: "https://picsum.photos/seed/res4/200", prompt: "A phoenix rising from ashes", meaning: "재기", approved: true },
    ],
    retryCount: 2,
    reviewStatus: "reviewed",
    memo: "검토 완료",
  },
  {
    id: 5,
    text: "benevolent",
    meaning: "자비로운",
    images: [
      { url: "https://picsum.photos/seed/ben1/200", prompt: "A kind person helping an elderly", meaning: "자비로운", approved: null },
      { url: "https://picsum.photos/seed/ben2/200", prompt: "Hands giving food to someone", meaning: "친절한", approved: null },
      { url: "https://picsum.photos/seed/ben3/200", prompt: "A warm smile of generosity", meaning: "너그러운", approved: null },
      { url: "https://picsum.photos/seed/ben4/200", prompt: "A gentle hand reaching out", meaning: "인자한", approved: null },
    ],
    retryCount: 3,
    reviewStatus: "generated",
    memo: "3회 초과 - 직접 업로드 필요",
  },
  {
    id: 11,
    text: "affiance",
    meaning: "약혼시키다",
    images: [
      { url: "https://picsum.photos/seed/aff1/200", prompt: "A couple exchanging rings", meaning: "...을 약혼시키다", approved: null },
      { url: "https://picsum.photos/seed/aff2/200", prompt: "A wedding proposal moment", meaning: "신뢰", approved: null },
      { url: "https://picsum.photos/seed/aff3/200", prompt: "A formal engagement ceremony", meaning: "서약", approved: null },
      { url: "https://picsum.photos/seed/aff4/200", prompt: "Hands with engagement ring", meaning: "...을 약혼시키다", approved: null },
    ],
    retryCount: 0,
    reviewStatus: "generated",
    memo: "",
  },
  {
    id: 12,
    text: "aeolian",
    meaning: "",
    images: [],
    retryCount: 0,
    reviewStatus: "waiting_meaning",
    memo: "",
  },
  {
    id: 13,
    text: "anomaly",
    meaning: "",
    images: [],
    retryCount: 0,
    reviewStatus: "waiting_meaning",
    memo: "",
  },
  {
    id: 14,
    text: "cogent",
    meaning: "설득력 있는",
    images: [],
    retryCount: 0,
    reviewStatus: "meaning_done",
    memo: "",
  },
  {
    id: 15,
    text: "diligent",
    meaning: "근면한",
    images: [],
    retryCount: 0,
    reviewStatus: "meaning_done",
    memo: "",
  },
];
