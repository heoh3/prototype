"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  dummyWords,
  dummyImageReviewWords,
  Word,
  ImageReviewWord,
} from "./dummy-data";

interface WordStore {
  words: Word[];
  setWords: (words: Word[]) => void;
  updateWordImages: (id: number, images: string[]) => void;
  reviewWords: ImageReviewWord[];
  setReviewWords: (words: ImageReviewWord[]) => void;
  completeReview: (reviewWord: ImageReviewWord) => void;
}

const WordStoreContext = createContext<WordStore | null>(null);

export function WordStoreProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<Word[]>(dummyWords);
  const [reviewWords, setReviewWords] =
    useState<ImageReviewWord[]>(dummyImageReviewWords);

  const updateWordImages = (id: number, images: string[]) => {
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, images } : w))
    );
  };

  const completeReview = (reviewWord: ImageReviewWord) => {
    // 이미 통합 단어 관리에 있으면 이미지만 업데이트, 없으면 추가
    setWords((prev) => {
      const exists = prev.find((w) => w.id === reviewWord.id);
      if (exists) {
        return prev.map((w) =>
          w.id === reviewWord.id
            ? { ...w, images: reviewWord.images.map((img) => img.url) }
            : w
        );
      }
      return [
        ...prev,
        {
          id: reviewWord.id,
          text: reviewWord.text,
          meaning: reviewWord.meaning,
          registeredBy: "user" as const,
          registeredAt: new Date().toISOString().split("T")[0],
          images: reviewWord.images.map((img) => img.url),
        },
      ];
    });
  };

  return (
    <WordStoreContext.Provider
      value={{ words, setWords, updateWordImages, reviewWords, setReviewWords, completeReview }}
    >
      {children}
    </WordStoreContext.Provider>
  );
}

export function useWordStore() {
  const ctx = useContext(WordStoreContext);
  if (!ctx) throw new Error("useWordStore must be used within WordStoreProvider");
  return ctx;
}
