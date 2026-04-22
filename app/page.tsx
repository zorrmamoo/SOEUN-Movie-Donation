"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const GOAL = 2000000;

const BANK_NAME = "토스뱅크";
const ACCOUNT_NUMBER = "1002-1311-4187";
const ACCOUNT_HOLDER = "조소은";

type CheerMessage = {
  id: number;
  nickname: string;
  message: string;
  color: string;
};

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

const supporterPositions = [
  { left: "14%", bottom: "64px" },
  { left: "25%", bottom: "28px" },
  { left: "73%", bottom: "34px" },
  { left: "84%", bottom: "68px" },
  { left: "10%", bottom: "140px" },
  { left: "87%", bottom: "150px" },
];

const avatarColors = [
  "#ffd166",
  "#ef476f",
  "#06d6a0",
  "#118ab2",
  "#bdb2ff",
  "#ff99c8",
  "#90dbf4",
  "#caffbf",
];

function getRandomColor() {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

function getInitial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "익";
  return trimmed[0];
}

export default function Page() {
  const [amount] = useState(0);
  const [isCheering, setIsCheering] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState("");

  const [nickname, setNickname] = useState("");
  const [cheerText, setCheerText] = useState("");

  const [messages, setMessages] = useState<CheerMessage[]>([
    {
      id: 1,
      nickname: "익명",
      message: "졸업까지 끝까지 화이팅!",
      color: "#ffd166",
    },
    {
      id: 2,
      nickname: "친구",
      message: "조소은의 영화 꼭 보고 싶어",
      color: "#90dbf4",
    },
    {
      id: 3,
      nickname: "촬영팀",
      message: "끝까지 완주하자",
      color: "#ff99c8",
    },
  ]);

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
  };

  const handleAddMessage = () => {
    const trimmedNickname = nickname.trim();
    const trimmedMessage = cheerText.trim();

    if (!trimmedMessage) return;

    const displayName = trimmedNickname || "익명";

    const newMessage: CheerMessage = {
      id: Date.now(),
      nickname: displayName,
      message: trimmedMessage,
      color: getRandomColor(),
    };

    setMessages((prev) => [newMessage, ...prev].slice(0, 6));
    setBubbleMessage(`${displayName}: ${trimmedMessage}`);
    triggerCelebration();

    window.setTimeout(() => {
      setBubbleMessage("");
    }, 3000);

    setNickname("");
    setCheerText("");
  };

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(
        `${BANK_NAME} ${ACCOUNT_NUMBER} ${ACCOUNT_HOLDER}`
      );
      setBubbleMessage("계좌번호가 복사되었어요!");
      window.setTimeout(() => {
        setBubbleMessage("");
      }, 2200);
    } catch {
      setBubbleMessage("복사에 실패했어요.");
      window.setTimeout(() => {
        setBubbleMessage("");
      }, 2200);
    }
  };

  return (
    <main className="page-shell">
      <div className="page-wrap">
        <header className="title-area">
          <h1>조소은 졸업시키기</h1>
          <p>후원은 계좌로, 응원은 메시지로 남겨주세요</p>
        </header>

        <section className="money-panel">
          <div className="money-label">목표 금액</div>
          <div className="money-value">
            {amount.toLocaleString()}원 / {GOAL.toLocaleString()}원
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="stage-text">현재 단계: {currentStage.name}</div>
        </section>

        <section className="stage-grid">
          {stages.map((stage, index) => (
            <div
              key={stage.name}
              className={`stage-card ${currentStageIndex === index ? "active" : ""}`}
            >
              {stage.name}
            </div>
          ))}
        </section>

        <section className="game-screen">
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

          {bubbleMessage && (
            <div className="speech-bubble">
              {bubbleMessage}
            </div>
          )}

          {messages.slice(0, 6).map((msg, index) => {
            const pos = supporterPositions[index];
            if (!pos) return null;

            return (
              <div
                key={msg.id}
                className="supporter-avatar"
                style={{
                  left: pos.left,
                  bottom: pos.bottom,
                  background: msg.color,
                }}
                title={`${msg.nickname}: ${msg.message}`}
              >
                {getInitial(msg.nickname)}
              </div>
            );
          })}

          <div className="character-shadow" />

          <div className="character-wrap">
            <div className={isCheering ? "character-inner dance-bounce" : "character-inner"}>
              <Image
                src={currentCharacterSrc}
                alt="캐릭터"
                fill
                sizes="380px"
                className="character-image"
              />
            </div>
          </div>

          <div className="tap-guide">응원 메시지를 남기면 캐릭터가 반응해요</div>
        </section>

        <section className="info-grid">
          <div className="account-card">
            <h3>후원 계좌</h3>
            <p>{BANK_NAME}</p>
            <p>{ACCOUNT_NUMBER}</p>
            <p>{ACCOUNT_HOLDER}</p>

            <button className="secondary-btn" onClick={handleCopyAccount}>
              계좌번호 복사
            </button>
          </div>

          <div className="message-card">
            <h3>응원 메시지 남기기</h3>

            <input
              className="message-input"
              type="text"
              placeholder="닉네임 또는 이름"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />

            <textarea
              className="message-textarea"
              placeholder="응원의 한마디를 남겨주세요"
              value={cheerText}
              onChange={(e) => setCheerText(e.target.value)}
            />

            <button className="submit-btn" onClick={handleAddMessage}>
              등록하기
            </button>

            <div className="message-help">
              메시지를 등록하면 캐릭터 옆에 응원 아바타가 생겨요
            </div>
          </div>
        </section>

        <section className="message-list-card">
          <h3>응원 메시지</h3>

          <div className="message-list">
            {messages.map((msg) => (
              <div key={msg.id} className="message-item">
                <div
                  className="message-avatar"
                  style={{ background: msg.color }}
                >
                  {getInitial(msg.nickname)}
                </div>

                <div className="message-content">
                  <div className="message-name">{msg.nickname}</div>
                  <div className="message-body">{msg.message}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
