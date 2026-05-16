import { getGenreById } from "./GlobalGenreEngine";

export interface CultureLesson {
  lessonId: string;
  genreId: string;
  countryCode: string;
  title: string;
  sections: CultureSection[];
  estimatedMinutes: number;
  difficulty: "intro" | "intermediate" | "deep-dive";
}

export interface CultureSection {
  heading: string;
  body: string;
}

export interface UserLearningProgress {
  userId: string;
  completedLessons: string[];
  startedLessons: string[];
  earnedBadges: string[];
}

const lessons: CultureLesson[] = [
  {
    lessonId: "afrobeats-101", genreId: "afrobeats", countryCode: "NG",
    title: "Afrobeats 101: The Sound of Lagos",
    difficulty: "intro", estimatedMinutes: 5,
    sections: [
      { heading: "What is Afrobeats?", body: "Afrobeats is a broad term for popular music from West Africa — primarily Nigeria — that blends highlife, jùjú, Afro-soul, and dancehall with contemporary R&B and hip-hop production." },
      { heading: "Where did it start?", body: "Lagos, Nigeria. Artists like Fela Kuti, King Sunny Ade, and later D'banj and P-Square built the foundations. The 2010s brought Wizkid, Burna Boy, and Davido to global stages." },
      { heading: "Key rhythms", body: "Afrobeats is defined by syncopated drum patterns, call-and-response vocals, and percussive layers from talking drums and shekere. BPM typically falls between 90–110." },
      { heading: "Cultural meaning", body: "Afrobeats is celebration music. It was built in nightclubs and street parties. When you hear it, you're meant to move — it carries joy, love, hustle, and African pride simultaneously." },
    ],
  },
  {
    lessonId: "dancehall-101", genreId: "dancehall", countryCode: "JM",
    title: "Dancehall 101: Kingston Culture",
    difficulty: "intro", estimatedMinutes: 5,
    sections: [
      { heading: "What is Dancehall?", body: "Dancehall evolved from reggae in Kingston, Jamaica in the late 1970s. It's faster, rawer, and more urban than reggae — built on 'riddims' (instrumental tracks) that multiple artists record over." },
      { heading: "The riddim system", body: "Unlike most music cultures, one riddim in dancehall can have 50+ songs from different artists. The riddim is released, deejays toast over it, and a sound system battle begins." },
      { heading: "Language", body: "Dancehall is performed in Patois — a Jamaican Creole that blends West African languages with English. 'Wagwan' (what's going on), 'bredren' (brother), 'dutty' (dirty/real) are common terms." },
      { heading: "Dance culture", body: "Dancehall dances are inseparable from the music. Each era has its iconic moves — 'World Dance,' 'Butterfly,' 'Dutty Wine.' These dances travel globally before the songs do." },
    ],
  },
];

const progressStore = new Map<string, UserLearningProgress>();

export function getCultureLesson(lessonId: string): CultureLesson | null {
  return lessons.find(l => l.lessonId === lessonId) ?? null;
}

export function getLessonsForGenre(genreId: string): CultureLesson[] {
  return lessons.filter(l => l.genreId === genreId);
}

export function getLessonsForCountry(countryCode: string): CultureLesson[] {
  return lessons.filter(l => l.countryCode === countryCode.toUpperCase());
}

export function getAllLessons(): CultureLesson[] {
  return lessons;
}

export function startLesson(userId: string, lessonId: string): UserLearningProgress {
  const existing = progressStore.get(userId) ?? { userId, completedLessons: [], startedLessons: [], earnedBadges: [] };
  if (!existing.startedLessons.includes(lessonId)) {
    existing.startedLessons.push(lessonId);
  }
  progressStore.set(userId, existing);
  return existing;
}

export function completeLesson(userId: string, lessonId: string): UserLearningProgress {
  const existing = progressStore.get(userId) ?? { userId, completedLessons: [], startedLessons: [], earnedBadges: [] };
  if (!existing.completedLessons.includes(lessonId)) {
    existing.completedLessons.push(lessonId);
    const genre = lessons.find(l => l.lessonId === lessonId)?.genreId;
    if (genre) existing.earnedBadges.push(`culture-${genre}`);
  }
  progressStore.set(userId, existing);
  return existing;
}

export function getUserProgress(userId: string): UserLearningProgress {
  return progressStore.get(userId) ?? { userId, completedLessons: [], startedLessons: [], earnedBadges: [] };
}
