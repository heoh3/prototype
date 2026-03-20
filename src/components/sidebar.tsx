"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface MenuItem {
  label: string;
  href: string;
}

interface MenuGroup {
  icon: string;
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    icon: "👥",
    title: "회원/CS 관리",
    items: [
      { label: "회원 관리", href: "#" },
      { label: "구독 관리", href: "#" },
      { label: "아이템 관리", href: "#" },
      { label: "1:1 문의 목록", href: "#" },
      { label: "도움말", href: "#" },
    ],
  },
  {
    icon: "⚙",
    title: "단어장 관리",
    items: [
      { label: "회원 단어장", href: "#" },
      { label: "공유 단어장", href: "#" },
      { label: "단어장 필터링", href: "#" },
      { label: "단어장 키워드", href: "#" },
      { label: "단어장 관리", href: "#" },
    ],
  },
  {
    icon: "⚙",
    title: "단어 이미지 관리",
    items: [
      { label: "이미지 대시보드", href: "#" },
      { label: "단어 이미지 관리", href: "/image-review" },
    ],
  },
  {
    icon: "📋",
    title: "PICK 서비스",
    items: [
      { label: "영어신 PICK", href: "#" },
      { label: "PICK 카테고리", href: "#" },
      { label: "PICK 기획관", href: "#" },
      { label: "PICK 대표 이미지", href: "#" },
    ],
  },
  {
    icon: "📊",
    title: "통계",
    items: [
      { label: "설치/방문 통계", href: "#" },
      { label: "페이지별 통계", href: "#" },
      { label: "클릭 통계", href: "#" },
      { label: "접속 통계", href: "#" },
      { label: "단어장 공유 통계", href: "#" },
      { label: "pick 통계", href: "#" },
      { label: "구매 통계", href: "#" },
      { label: "자동 결제 통계", href: "#" },
    ],
  },
  {
    icon: "📢",
    title: "마케팅 및 광고",
    items: [
      { label: "광고 관리", href: "#" },
      { label: "마케팅", href: "#" },
      { label: "홈페이지 유입", href: "#" },
      { label: "sns 이미지 관리", href: "#" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(menuGroups.map((g) => g.title))
  );

  const toggleGroup = (title: string) => {
    const next = new Set(openGroups);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    setOpenGroups(next);
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
      <h1 className="text-lg font-bold p-5 border-b border-gray-100">영어신 Admin</h1>
      <nav className="flex flex-col py-2">
        {menuGroups.map((group) => {
          const isOpen = openGroups.has(group.title);
          return (
            <div key={group.title}>
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{group.icon}</span>
                  {group.title}
                </span>
                <span className="text-gray-400 text-xs">{isOpen ? "∧" : "∨"}</span>
              </button>
              {isOpen && (
                <div className="flex flex-col">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`pl-12 pr-4 py-2 text-sm transition ${
                          isActive
                            ? "text-blue-600 font-medium bg-blue-50"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
