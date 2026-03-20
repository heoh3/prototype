"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ImageReviewWord, ReviewImage, ReviewStatus } from "@/lib/dummy-data";
import { useWordStore } from "@/lib/word-store";
import { TICKETS, Ticket, AcItem } from "@/lib/tickets";

type FilterTab = "all" | "waiting_meaning" | "meaning_done" | "generated" | "reviewed";

const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  waiting_meaning: "뜻 대기",
  meaning_done: "뜻 생성 완료",
  generated: "이미지 생성 완료",
  reviewed: "검토 완료",
};

const REVIEW_STATUS_COLOR: Record<ReviewStatus, string> = {
  waiting_meaning: "bg-gray-100 text-gray-600",
  meaning_done: "bg-yellow-100 text-yellow-700",
  generated: "bg-blue-100 text-blue-700",
  reviewed: "bg-green-100 text-green-700",
};

interface ImageDetail {
  wordId: number;
  imgIndex: number;
  word: ImageReviewWord;
  image: ReviewImage;
}

interface AcInfo {
  ticketId: string;
  ac: string;
  desc: string;
  policy?: string;
  hidden?: { ac: string; desc: string; policy?: string }[];
}

/** AC 아이콘 - 선택된 티켓만 표시, 클릭 시 버튼 옆에 팝오버 (화면 밖 잘림 방지) */
function AcDot({ info, activeTicket }: { info: AcInfo; activeTicket: string | null }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const calcPosition = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const popW = 320;
    const popH = 200;
    const pad = 8;

    let left = r.right + pad;
    let top = r.top;

    // 오른쪽 넘치면 왼쪽으로
    if (left + popW > window.innerWidth - pad) {
      left = r.left - popW - pad;
    }
    // 왼쪽도 넘치면 버튼 아래 중앙
    if (left < pad) {
      left = Math.max(pad, r.left + r.width / 2 - popW / 2);
    }
    // 아래로 넘치면 위로 올림
    if (top + popH > window.innerHeight - pad) {
      top = window.innerHeight - popH - pad;
    }
    if (top < pad) top = pad;

    setPos({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    calcPosition();
    const onScroll = () => calcPosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, calcPosition]);

  if (!activeTicket || info.ticketId !== activeTicket) return null;
  const ticket = TICKETS.find((t) => t.id === info.ticketId);
  const label = `${info.ticketId}-${info.ac}`;

  return (
    <span className="inline-block ml-1 align-middle">
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`inline-flex items-center justify-center px-1.5 h-5 rounded-full text-white text-[9px] font-bold leading-none transition cursor-pointer whitespace-nowrap ${ticket?.dotBg || "bg-red-500 hover:bg-red-600"}`}
      >
        {label}
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[80]" onClick={() => setOpen(false)} />
          {pos && (
            <div
              ref={popRef}
              className="fixed z-[90] w-80 bg-white border border-gray-200 rounded-lg shadow-2xl p-4 text-left"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className="text-xs">
                <div className="font-bold text-sm mb-2" style={{ color: ticket?.color || "red" }}>{label}</div>
                <div className="text-gray-700 text-sm">{info.desc}</div>
                {info.policy && (
                  <div className="text-orange-600 mt-2 border-t border-gray-100 pt-2">* {info.policy}</div>
                )}
                {info.hidden && info.hidden.length > 0 && (
                  <div className="mt-2 border-t border-gray-100 pt-2">
                    <div className="font-bold text-amber-600 mb-1">클릭 시 사용 가능:</div>
                    {info.hidden.map((h) => (
                      <div key={h.ac} className="mt-1">
                        <span className="font-bold" style={{ color: ticket?.color || "red" }}>{info.ticketId}-{h.ac}</span>
                        <span className="text-gray-700 ml-1">{h.desc}</span>
                        {h.policy && <div className="text-orange-600">* {h.policy}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </span>
  );
}

/** 사이드패널 AC 트리 렌더러 */
function AcTree({ items, ticketId, depth = 0 }: { items: AcItem[]; ticketId: string; depth?: number }) {
  return (
    <div className={depth > 0 ? "ml-4 mt-1 space-y-1" : "space-y-4"}>
      {items.map((item) => (
        <div key={item.ac} className={depth === 0 ? "p-3 bg-gray-50 rounded-lg" : ""}>
          <p className={`${depth === 0 ? "font-bold text-gray-900" : "text-gray-600"}`}>
            <span className={`text-red-${depth === 0 ? "500" : "400"} text-xs mr-1 font-bold`}>
              {ticketId}-{item.ac}
            </span>
            {item.desc}
          </p>
          {item.policy && (
            <p className="text-orange-600 text-xs mt-0.5 ml-4">* {item.policy}</p>
          )}
          {item.children && <AcTree items={item.children} ticketId={ticketId} depth={depth + 1} />}
        </div>
      ))}
    </div>
  );
}

export default function ImageReviewPage() {
  const { reviewWords, setReviewWords, completeReview } = useWordStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [imageDetail, setImageDetail] = useState<ImageDetail | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAcPanel, setShowAcPanel] = useState<string | null>(null);

  const t = activeTicket; // 선택된 티켓 ID (null이면 AC 안 보임)
  const T1 = "T1"; // 티켓 shorthand

  const updateWord = (id: number, updates: Partial<ImageReviewWord>) => {
    setReviewWords(
      reviewWords.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  };

  const handleAddWord = () => {
    const trimmed = newWord.trim();
    if (!trimmed) return;
    const nextId = Math.max(...reviewWords.map((w) => w.id), 0) + 1;
    setReviewWords([
      ...reviewWords,
      {
        id: nextId,
        text: trimmed,
        meaning: "",
        images: [],
        retryCount: 0,
        reviewStatus: "waiting_meaning",
        memo: "",
      },
    ]);
    setNewWord("");
    setShowAddModal(false);
  };

  const handleRegenerateOne = (wordId: number, imgIndex: number) => {
    const word = reviewWords.find((w) => w.id === wordId);
    if (!word) return;
    const newUrl = `https://picsum.photos/seed/${Date.now()}_${imgIndex}/200`;
    const newImages = word.images.map((img, i) =>
      i === imgIndex ? { ...img, url: newUrl } : img
    );
    updateWord(wordId, { images: newImages });
    if (imageDetail?.wordId === wordId && imageDetail?.imgIndex === imgIndex) {
      setImageDetail({ ...imageDetail, image: { ...imageDetail.image, url: newUrl }, word: { ...word, images: newImages } });
    }
  };

  const handleUploadOne = (wordId: number, imgIndex: number) => {
    const word = reviewWords.find((w) => w.id === wordId);
    if (!word) return;
    const newUrl = `https://picsum.photos/seed/upload_${Date.now()}_${imgIndex}/200`;
    const newImages = word.images.map((img, i) =>
      i === imgIndex ? { ...img, url: newUrl } : img
    );
    updateWord(wordId, { images: newImages });
    if (imageDetail?.wordId === wordId && imageDetail?.imgIndex === imgIndex) {
      setImageDetail({ ...imageDetail, image: { ...imageDetail.image, url: newUrl }, word: { ...word, images: newImages } });
    }
  };

  const handleBulkRegenerateImages = () => {
    selectedImages.forEach((key) => {
      const [wordId, imgIdx] = key.split("-").map(Number);
      handleRegenerateOne(wordId, imgIdx);
    });
    setSelectedImages(new Set());
  };

  const handleCancelReview = (wordId: number) => {
    updateWord(wordId, { reviewStatus: "generated" });
  };

  const handleCompleteReview = (wordId: number) => {
    const word = reviewWords.find((w) => w.id === wordId);
    if (!word) return;
    updateWord(wordId, { reviewStatus: "reviewed" });
    completeReview({ ...word, reviewStatus: "reviewed" });
  };

  const handleBulkFetchMeaning = () => {
    selectedIds.forEach((id) => {
      const word = reviewWords.find((w) => w.id === id);
      if (word && word.reviewStatus === "waiting_meaning") {
        const fakeMeanings: Record<string, string> = {
          aeolian: "바람의, 바람에 의한",
          anomaly: "변칙, 이례적인 것",
        };
        updateWord(id, {
          reviewStatus: "meaning_done",
          meaning: fakeMeanings[word.text] || `${word.text}의 뜻`,
        });
      }
    });
    setSelectedIds(new Set());
  };

  const handleConfirmMeaning = (wordId: number) => {
    updateWord(wordId, { reviewStatus: "meaning_done" });
  };

  const handleBulkGenerate = () => {
    selectedIds.forEach((id) => {
      const word = reviewWords.find((w) => w.id === id);
      if (word && word.reviewStatus === "meaning_done") {
        updateWord(id, {
          reviewStatus: "generated",
          images: [0, 1, 2, 3].map((i) => ({
            url: `https://picsum.photos/seed/gen_${id}_${i}_${Date.now()}/200`,
            prompt: `Generated prompt for ${word.text} #${i + 1}`,
            meaning: word.meaning || word.text,
            approved: null,
          })),
        });
      }
    });
    setSelectedIds(new Set());
  };

  const handleMemoChange = (wordId: number, memo: string) => {
    updateWord(wordId, { memo });
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    const pagedIds = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((w) => w.id);
    const allSelected = pagedIds.every((id) => selectedIds.has(id));
    const next = new Set(selectedIds);
    if (allSelected) {
      pagedIds.forEach((id) => next.delete(id));
    } else {
      pagedIds.forEach((id) => next.add(id));
    }
    setSelectedIds(next);
  };

  const toggleImageSelect = (wordId: number, imgIdx: number) => {
    const key = `${wordId}-${imgIdx}`;
    const next = new Set(selectedImages);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedImages(next);
  };

  const openImageDetail = (word: ImageReviewWord, imgIndex: number) => {
    setImageDetail({ wordId: word.id, imgIndex, word, image: word.images[imgIndex] });
  };

  const filtered = reviewWords.filter((w) => {
    const matchSearch =
      w.text.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.includes(search);
    const matchTab = activeTab === "all" || w.reviewStatus === activeTab;
    return matchSearch && matchTab;
  });

  const counts = {
    all: reviewWords.length,
    waiting_meaning: reviewWords.filter((w) => w.reviewStatus === "waiting_meaning").length,
    meaning_done: reviewWords.filter((w) => w.reviewStatus === "meaning_done").length,
    generated: reviewWords.filter((w) => w.reviewStatus === "generated").length,
    reviewed: reviewWords.filter((w) => w.reviewStatus === "reviewed").length,
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: `전체 (${counts.all})` },
    { key: "waiting_meaning", label: `뜻 대기 (${counts.waiting_meaning})` },
    { key: "meaning_done", label: `뜻 생성 완료 (${counts.meaning_done})` },
    { key: "generated", label: `이미지 생성 완료 (${counts.generated})` },
    { key: "reviewed", label: `검토 완료 (${counts.reviewed})` },
  ];

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paged = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">단어 이미지 관리</h2>
        <div className="flex gap-2 items-center">
          <span className="inline-flex items-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition"
            >
              단어 등록
            </button>
            <AcDot info={{ ticketId: T1, ac: "1.1", desc: "관리자는 단어를 직접 입력하여 등록할 수 있다" }} activeTicket={t} />
          </span>
          <span className="inline-flex items-center">
            <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition">
              엑셀 업로드
            </button>
            <AcDot info={{ ticketId: T1, ac: "1.2", desc: "관리자는 csv 또는 엑셀 파일로 단어를 일괄 업로드 할 수 있다", policy: "업로드 시 단어만 등록됨. 뜻과 이미지는 배치에서 자동 생성" }} activeTicket={t} />
          </span>
        </div>
      </div>

      {/* 배치 안내 */}
      <div className="mb-4 flex gap-3">
        <div className="flex-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <span className="text-yellow-600 text-sm">i</span>
          <p className="text-sm text-yellow-700">
            <strong>[뜻 대기]</strong> 상태의 단어는 매일 23:00에 자동으로 외부 사전 DB에서 뜻을 가져옵니다.
          </p>
          <AcDot info={{ ticketId: T1, ac: "3.1", desc: "[뜻 대기] 상태의 단어는 자동으로 외부 사전 DB에서 뜻을 가져온다", policy: "배치 시간은 추후 변경 가능. 뜻을 불러오는 방식은 추후 결정 필요" }} activeTicket={t} />
        </div>
        <div className="flex-1 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <span className="text-blue-600 text-sm">i</span>
          <p className="text-sm text-blue-700">
            <strong>[뜻 생성 완료]</strong> 상태의 단어는 매일 23:00에 자동으로 이미지가 생성됩니다.
          </p>
          <AcDot info={{ ticketId: T1, ac: "4.1", desc: "[뜻 생성 완료] 상태의 단어는 자동으로 이미지가 생성된다", policy: "배치 시간은 추후 변경 가능" }} activeTicket={t} />
        </div>
      </div>

      {/* 필터 탭 + 검색 */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg border border-gray-200 px-4 py-3">
        <span className="inline-flex items-center gap-1">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                  activeTab === tab.key
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <AcDot info={{ ticketId: T1, ac: "2.1", desc: "관리자는 상태별 필터링 및 건수를 확인할 수 있다", policy: "상태: [뜻 대기] / [뜻 생성 완료] / [이미지 생성 완료] / [검토 완료] 4가지" }} activeTicket={t} />
        </span>
        <span className="inline-flex items-center">
          <input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <AcDot info={{ ticketId: T1, ac: "2.1.3", desc: "관리자는 단어를 검색할 수 있다" }} activeTicket={t} />
        </span>
      </div>

      {/* 벌크 액션 바 */}
      {(selectedIds.size > 0 || selectedImages.size > 0) && (
        <div className="mb-4 p-3 bg-gray-900 rounded-lg flex items-center justify-between">
          <span className="text-sm text-white">
            {selectedIds.size > 0 && `단어 ${selectedIds.size}개 선택`}
            {selectedIds.size > 0 && selectedImages.size > 0 && " / "}
            {selectedImages.size > 0 && `이미지 ${selectedImages.size}개 선택`}
          </span>
          <div className="flex gap-2 items-center">
            {selectedIds.size > 0 && reviewWords.some((w) => selectedIds.has(w.id) && w.reviewStatus === "waiting_meaning") && (
              <span className="inline-flex items-center">
                <button
                  onClick={handleBulkFetchMeaning}
                  className="px-4 py-1.5 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 transition"
                >
                  선택 단어 뜻 가져오기
                </button>
                <AcDot info={{ ticketId: T1, ac: "3.2", desc: "관리자는 단어를 선택하여 수동으로 뜻을 가져올 수 있다" }} activeTicket={t} />
              </span>
            )}
            {selectedIds.size > 0 && reviewWords.some((w) => selectedIds.has(w.id) && w.reviewStatus === "meaning_done") && (
              <span className="inline-flex items-center">
                <button
                  onClick={handleBulkGenerate}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                >
                  선택 단어 이미지 생성
                </button>
                <AcDot info={{ ticketId: T1, ac: "4.2", desc: "관리자는 단어를 선택하여 수동으로 이미지 생성을 실행할 수 있다", policy: "[뜻 생성 완료] 상태의 단어만 생성 대상" }} activeTicket={t} />
              </span>
            )}
            {selectedImages.size > 0 && (
              <span className="inline-flex items-center">
                <button
                  onClick={handleBulkRegenerateImages}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                >
                  선택 이미지 재생성
                </button>
                <AcDot info={{ ticketId: T1, ac: "5.3", desc: "여러 이미지를 선택하여 일괄 재생성 할 수 있다" }} activeTicket={t} />
              </span>
            )}
            <button
              onClick={() => { setSelectedIds(new Set()); setSelectedImages(new Set()); }}
              className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition"
            >
              선택 해제
            </button>
          </div>
        </div>
      )}

      {/* 테이블 */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400">
          해당하는 단어가 없습니다
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={paged.length > 0 && paged.every((w) => selectedIds.has(w.id))}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">단어</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  검토
                  <AcDot info={{ ticketId: T1, ac: "6.1, 6.2", desc: "관리자는 검토 완료/취소를 통해 유저 노출 여부를 결정할 수 있다", policy: "[검토 완료] 된 단어만 실제 유저에게 노출됨" }} activeTicket={t} />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600" colSpan={4}>
                  이미지
                  <AcDot info={{
                    ticketId: T1,
                    ac: "5",
                    desc: "관리자는 이미지를 확인하고 관리할 수 있다",
                    hidden: [
                      { ac: "5.1", desc: "이미지 클릭 시 프롬프트 및 뜻 확인 가능" },
                      { ac: "5.2", desc: "이미지 상세에서 개별 재생성 가능" },
                      { ac: "5.4", desc: "이미지 상세에서 직접 업로드 가능", policy: "AI 재생성 외에 관리자가 직접 업로드 가능" },
                    ],
                  }} activeTicket={t} />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  메모
                  <AcDot info={{ ticketId: T1, ac: "7", desc: "관리자는 단어별 메모를 작성할 수 있다", policy: "반려 사유, 관리자 자유 메모 등" }} activeTicket={t} />
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((word) => (
                <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedIds.has(word.id)}
                      onChange={() => toggleSelect(word.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{word.text}</div>
                    {word.reviewStatus === "waiting_meaning" ? (
                      <div className="text-xs text-gray-300 mt-0.5">뜻 대기 중...</div>
                    ) : word.reviewStatus === "meaning_done" ? (
                      <div className="mt-1">
                        <input
                          type="text"
                          value={word.meaning}
                          onChange={(e) => updateWord(word.id, { meaning: e.target.value })}
                          className="w-full px-2 py-1 border border-yellow-300 bg-yellow-50 rounded text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 mt-0.5">{word.meaning}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${REVIEW_STATUS_COLOR[word.reviewStatus]}`}>
                      {REVIEW_STATUS_LABEL[word.reviewStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {word.reviewStatus === "meaning_done" && (
                      <button
                        onClick={() => handleConfirmMeaning(word.id)}
                        className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-medium rounded-md hover:bg-yellow-600 transition whitespace-nowrap"
                      >
                        뜻 확정
                      </button>
                    )}
                    {word.reviewStatus === "generated" && (
                      <button
                        onClick={() => handleCompleteReview(word.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition whitespace-nowrap"
                      >
                        검토 완료
                      </button>
                    )}
                    {word.reviewStatus === "reviewed" && (
                      <button
                        onClick={() => handleCancelReview(word.id)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition whitespace-nowrap"
                      >
                        검토 취소
                      </button>
                    )}
                  </td>
                  {[0, 1, 2, 3].map((imgIdx) => {
                    const imgKey = `${word.id}-${imgIdx}`;
                    const isSelected = selectedImages.has(imgKey);
                    return (
                      <td key={imgIdx} className="px-2 py-3">
                        {word.images[imgIdx] ? (
                          <div className="w-28">
                            <div className="relative">
                              {word.reviewStatus !== "reviewed" && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleImageSelect(word.id, imgIdx)}
                                  className="absolute top-1 left-1 z-10 rounded"
                                />
                              )}
                              <button
                                onClick={() => openImageDetail(word, imgIdx)}
                                className="relative group cursor-pointer"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={word.images[imgIdx].url}
                                  alt={`${word.text} ${imgIdx + 1}`}
                                  className={`w-28 h-28 object-cover rounded-lg border-2 transition ${
                                    isSelected
                                      ? "border-blue-500"
                                      : "border-gray-200 group-hover:border-blue-400"
                                  }`}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">상세</span>
                                </div>
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate" title={word.images[imgIdx].meaning}>
                              {word.images[imgIdx].meaning}
                            </p>
                          </div>
                        ) : (
                          <div className="w-28 h-28 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs">
                            없음
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={word.memo}
                      onChange={(e) => handleMemoChange(word.id, e.target.value)}
                      placeholder="메모"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이징 */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-xs text-gray-500">
            총 {filtered.length}개 중 {(safeCurrentPage - 1) * pageSize + 1}-{Math.min(safeCurrentPage * pageSize, filtered.length)}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-30 hover:bg-gray-100 transition"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-30 hover:bg-gray-100 transition"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 py-1 text-xs rounded transition ${
                    page === safeCurrentPage
                      ? "bg-gray-900 text-white"
                      : "border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-30 hover:bg-gray-100 transition"
              >
                ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-30 hover:bg-gray-100 transition"
              >
                »
              </button>
            </div>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10개씩</option>
              <option value={20}>20개씩</option>
              <option value={50}>50개씩</option>
              <option value={100}>100개씩</option>
            </select>
          </div>
        </div>
      )}

      {/* 단어 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4">단어 등록</h3>
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
              placeholder="영어 단어 입력"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddWord}
                className="flex-1 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition"
              >
                등록
              </button>
              <button
                onClick={() => { setShowAddModal(false); setNewWord(""); }}
                className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AC 매핑 플로팅 바 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-white/90 backdrop-blur border border-gray-200 rounded-full shadow-lg px-4 py-2">
        {!activeTicket ? (
          <span className="text-xs text-gray-400 px-2">AC 매핑</span>
        ) : (
          <button
            onClick={() => { setActiveTicket(null); setShowAcPanel(null); }}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 transition"
          >
            ✕ 끄기
          </button>
        )}
        <div className="w-px h-5 bg-gray-200" />
        {TICKETS.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => {
              if (activeTicket === ticket.id) {
                setShowAcPanel(showAcPanel === ticket.id ? null : ticket.id);
              } else {
                setActiveTicket(ticket.id);
                setShowAcPanel(null);
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
              activeTicket === ticket.id
                ? "bg-red-500 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            [{ticket.id}] {ticket.name}
          </button>
        ))}
      </div>

      {/* AC 전체 내용 사이드패널 */}
      {showAcPanel && (() => {
        const ticket = TICKETS.find((t) => t.id === showAcPanel);
        if (!ticket) return null;
        return (
          <>
            <div className="fixed inset-0 bg-black/20 z-[60]" onClick={() => setShowAcPanel(null)} />
            <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-[70] overflow-y-auto border-l border-gray-200">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">[{ticket.id}] {ticket.name}</h3>
                <button
                  onClick={() => setShowAcPanel(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-5 text-sm leading-relaxed">
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">User Story</h4>
                  <p className="text-gray-700">{ticket.userStory}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Acceptance Criteria</h4>
                  <AcTree items={ticket.acList} ticketId={ticket.id} />
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* 이미지 상세 모달 */}
      {imageDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="aspect-square bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageDetail.image.url}
                alt={imageDetail.word.text}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5">
              <div className="mb-3">
                <h3 className="text-lg font-bold">{imageDetail.word.text}</h3>
                <p className="text-sm text-gray-500">{imageDetail.word.meaning}</p>
              </div>

              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">
                  뜻
                  <AcDot info={{ ticketId: T1, ac: "5.1", desc: "각 이미지들을 생성한 프롬프트를 확인할 수 있다" }} activeTicket={t} />
                </p>
                <p className="text-sm">{imageDetail.image.meaning}</p>
              </div>
              <div className="mb-5 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">
                  프롬프트
                  <AcDot info={{ ticketId: T1, ac: "5.1", desc: "프롬프트 확인" }} activeTicket={t} />
                </p>
                <p className="text-sm text-gray-700">{imageDetail.image.prompt}</p>
              </div>

              {imageDetail.word.reviewStatus !== "reviewed" && (
                <div className="flex gap-2 mb-4">
                  <span className="flex-1 inline-flex items-center gap-1">
                    <button
                      onClick={() => handleRegenerateOne(imageDetail.wordId, imageDetail.imgIndex)}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition"
                    >
                      이미지 재생성
                    </button>
                    <AcDot info={{ ticketId: T1, ac: "5.2", desc: "개별 이미지 재생성" }} activeTicket={t} />
                  </span>
                  <span className="flex-1 inline-flex items-center gap-1">
                    <button
                      onClick={() => handleUploadOne(imageDetail.wordId, imageDetail.imgIndex)}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition"
                    >
                      직접 업로드
                    </button>
                    <AcDot info={{ ticketId: T1, ac: "5.4", desc: "직접 이미지 업로드", policy: "AI 재생성 외에 관리자가 직접 업로드 가능" }} activeTicket={t} />
                  </span>
                </div>
              )}

              <button
                onClick={() => setImageDetail(null)}
                className="w-full py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
