"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const GOAL = 2000000;

// 여기에 실제 후원 안내 링크가 있으면 넣어.
// 예: 토스 프로필 링크, 노션 안내 페이지, 구글폼, 링크트리 등
// 없으면 빈 문자열로 두면 됨.
const BANK_TRANSFER_URL = "https://toss.me/yourlink";

// 계좌 정보
const BANK_NAME = "토스뱅크";
const ACCOUNT_NUMBER = "1002-1311-4187";
const ACCOUNT_HOLDER = "조소은";

const stages = [
  {
    name: "1학년",
    idle: "/assets/characters/grade1_idle.png",
    cheer: "/assets/characters/grade1_happy.png",
    background: "/assets/backgrounds/grade1_bg.png",
    min: 0,
  },
  {
    name: "2학년",
    idle: "/assets/characters/grade2_study.png",
    cheer: "/assets/characters/grade2_happy.png",
    background: "/assets/backgrounds/grade2_bg.png",
    min: 400000,
  },
  {
    name: "3학년",
    idle: "/assets/characters/grade3_shoot.png",
    cheer: "/assets/characters/grade3_happy.png",
    background: "/assets/backgrounds/grade3_bg.png",
    min: 800000,
  },
  {
    name: "4학년",
    idle: "/assets/characters/grade4_edit.png",
    cheer: "/assets/characters/grade4_happy.png",
    background: "/assets/backgrounds/grade4_bg.png",
    min: 1200000,
  },
  {
    name: "5학년",
    idle: "/assets/characters/grade5_graduate.png",
    cheer: "/assets/characters/grade5_happy.png",
    background: "/assets/backgrounds/grade5_bg.png",
    min: 1600000,
  },
];

type MoneyDrop = {
  id: number;
  left: number;
  delay: number;
  size: number;
  rotate: number;
};

export default function Page() {
  const [amount, setAmount] = useState(0);
  const [isCheering, setIsCheering] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [drops, setDrops] = useState<MoneyDrop[]>([]);
  const [copyMessage, setCopyMessage] = useState("");

  const currentStageIndex = useMemo(() => {
    if (amount >= 1600000) return 4;
    if (amount >= 1200000) return 3;
    if (amount >= 800000) return 2;
    if (amount >= 400000) return 1;
    return 0;
  }, [amount]);

  const currentStage = stages[currentStageIndex];
  const progress = Math.min((amount / GOAL) * 100, 100);

  const currentCharacterSrc = isCheering
    ? currentStage.cheer
    : currentStage.idle;

  const triggerCelebration = () => {
    if (!isCheering) {
      setIsCheering(true);
      window.setTimeout(() => setIsCheering(false), 1800);
    }

    setShowBanner(true);
    window.setTimeout(() => setShowBanner(false), 2200);

    const newDrops: MoneyDrop[] = Array.from({ length: 14 }).map(
      (_, index) => ({
        id: Date.now() + index,
        left: 5 + Math.random() * 85,
        delay: Math.random() * 0.35,
        size: 24 + Math.random() * 10,
        rotate: -18 + Math.random() * 36,
      })
    );

    setDrops(newDrops);
    window.setTimeout(() => setDrops([]), 2200);
  };

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(
        `${BANK_NAME} ${ACCOUNT_NUMBER} ${ACCOUNT_HOLDER}`
      );
      setCopyMessage("계좌번호가 복사되었어요.");
    } catch {
      setCopyMessage("복사에 실패했어요.");
    }

    window.setTimeout(() => setCopyMessage(""), 1800);
  };

  const goToDonationLink = () => {
    if (BANK_TRANSFER_URL.trim()) {
      window.open(BANK_TRANSFER_URL, "_blank", "noopener,noreferrer");
    }
  };

  const handleDonate = async (value: number) => {
    setAmount((prev: number) => Math.min(prev + value, GOAL));
  
    triggerCelebration();
  
    await copyAccount();
  
    if (DONATION_LINK.trim()) {
      window.setTimeout(() => {
        window.open(DONATION_LINK, "_blank", "noopener,noreferrer");
      }, 500);
    }
  };

  const handleScreenTap = () => {
    triggerCelebration();
  };

  return (
    <main className="page-shell">
      <div className="page-wrap">
        <header className="title-area">
          <h1>조소은 졸업시키기</h1>
          <p>
            후원하면 캐릭터가 춤추고, 돈이 떨어지고, 현수막이 나오는 졸업 키우기
            게임
          </p>
        </header>

        <section className="money-panel">
          <div className="money-label">현재 후원 금액</div>
          <div className="money-value">
            {amount.toLocaleString()}원 / {GOAL.toLocaleString()}원
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="stage-text">현재 단계: {currentStage.name}</div>
        </section>

        <section className="stage-grid">
          {stages.map((stage, index) => (
            <div
              key={stage.name}
              className={`stage-card ${
                currentStageIndex === index ? "active" : ""
              }`}
            >
              {stage.name}
            </div>
          ))}
        </section>

        <section
          className="game-screen"
          onClick={handleScreenTap}
          onTouchStart={handleScreenTap}
        >
          <Image
            src={currentStage.background}
            alt={currentStage.name}
            fill
            priority
            sizes="100vw"
            className="bg-image"
          />

          {showBanner && (
            <div className="thanks-banner">
              조소은의 졸업을 응원해주셔서 감사합니다
            </div>
          )}

          {drops.map((drop) => (
            <div
              key={drop.id}
              className="money-drop"
              style={{
                left: `${drop.left}%`,
                animationDelay: `${drop.delay}s`,
                fontSize: `${drop.size}px`,
                rotate: `${drop.rotate}deg`,
              }}
            >
              💸💰
            </div>
          ))}

          <div className="character-shadow" />

          <div className="character-wrap">
            <div
              className={
                isCheering ? "character-inner dance-bounce" : "character-inner"
              }
            >
              <Image
                src={currentCharacterSrc}
                alt="캐릭터"
                fill
                sizes="260px"
                className="character-image"
              />
            </div>
          </div>

          <div className="tap-guide">화면을 누르면 캐릭터가 반응해요</div>
        </section>

        <section className="info-grid">
          <div className="account-card">
            <h3>후원 계좌</h3>
            <p>{BANK_NAME}</p>
            <p>{ACCOUNT_NUMBER}</p>
            <p>{ACCOUNT_HOLDER}</p>

            <button className="secondary-btn" onClick={copyAccount}>
              계좌번호 복사
            </button>

            {copyMessage && <div className="copy-message">{copyMessage}</div>}
          </div>

          <div className="donation-card">
            <h3>후원하기</h3>
            <div className="button-grid">
              {[10000, 30000, 50000, 100000].map((value) => (
                <button
                  key={value}
                  className="donate-btn"
                  onClick={() => handleDonate(value)}
                >
                  {value.toLocaleString()}원
                </button>
              ))}
            </div>

            <p className="donation-help">
              버튼을 누르면 캐릭터가 춤추고, 계좌번호가 복사돼요.
              {BANK_TRANSFER_URL.trim()
                ? " 등록한 후원 링크도 함께 열립니다."
                : " 후원 링크를 따로 쓰려면 page.tsx의 BANK_TRANSFER_URL에 넣어주세요."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
