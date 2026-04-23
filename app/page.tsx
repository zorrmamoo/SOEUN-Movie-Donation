"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const GOAL = 2000000;

const BANK_NAME = "토스뱅크";
const ACCOUNT_NUMBER = "1002-1311-4187";
const ACCOUNT_HOLDER = "조소은";

type CheerMessage = {
  id: number;
  nickname: string;
  message: string;
  color: string;
  x: string;
  y: string;
  avatar?: string;
};

type MoneyDrop = {
  id: number;
  left: number;
  delay: number;
  size: number;
  rotate: number;
};

const movieInfo = {
  title: "가제: 조소은의 졸업영화",
  genre: "오컬트 드라마",
  runtime: "약 25분",
  logline:
    "고독사 현장을 마주하던 젊은 무당이 버려진 신당과 죽은 무당의 흔적을 통해, 자신 역시 같은 미래에 닿을지 모른다는 공포와 맞선다.",
  synopsis:
    "고독사 현장을 오가며 천도재를 돕는 젊은 무당 여진은 어느 날 은퇴한 무당이 홀로 죽은 공간과 마주한다. 방치된 신당, 끊어진 인간관계, 신에게도 사회에도 버려진 삶의 흔적은 여진에게 타인의 죽음이 아닌 자신의 미래처럼 다가온다. 죽은 무당의 그림자는 점점 여진의 삶을 잠식하고, 여진은 반복되는 고독과 버림의 구조를 끊기 위해 마지막 의식을 준비한다.",
  note:
    "이 영화는 고독사를 개인의 비극이 아니라 사회적 단절과 반복의 문제로 바라본다. 오컬트 장르의 형식을 통해 버려진 존재의 공포와, 그 공포가 다음 존재에게 어떻게 옮겨붙는지를 시각적으로 풀어내고자 한다.",
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

const supporterSpots = [
  { x: "8%", y: "72px" },
  { x: "16%", y: "190px" },
  { x: "24%", y: "28px" },
  { x: "74%", y: "28px" },
  { x: "84%", y: "190px" },
  { x: "90%", y: "78px" },
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

const defaultMessages: CheerMessage[] = [
  {
    id: 1,
    nickname: "익명",
    message: "졸업까지 끝까지 화이팅!",
    color: "#ffd166",
    x: "8%",
    y: "72px",
  },
  {
    id: 2,
    nickname: "친구",
    message: "조소은의 영화 꼭 보고 싶어",
    color: "#90dbf4",
    x: "24%",
    y: "28px",
  },
  {
    id: 3,
    nickname: "촬영팀",
    message: "끝까지 완주하자",
    color: "#ff99c8",
    x: "90%",
    y: "78px",
  },
];

function getRandomColor() {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

async function makePixelAvatar(file: File): Promise<string> {
  const imageUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new window.Image();

    img.onload = () => {
      const smallCanvas = document.createElement("canvas");
      const smallCtx = smallCanvas.getContext("2d");

      const finalCanvas = document.createElement("canvas");
      const finalCtx = finalCanvas.getContext("2d");

      if (!smallCtx || !finalCtx) {
        URL.revokeObjectURL(imageUrl);
        reject(new Error("Canvas 생성 실패"));
        return;
      }

      smallCanvas.width = 32;
      smallCanvas.height = 32;

      finalCanvas.width = 256;
      finalCanvas.height = 256;

      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      smallCtx.clearRect(0, 0, 32, 32);
      smallCtx.drawImage(img, sx, sy, size, size, 0, 0, 32, 32);

      finalCtx.imageSmoothingEnabled = false;
      finalCtx.clearRect(0, 0, 256, 256);
      finalCtx.drawImage(smallCanvas, 0, 0, 32, 32, 0, 0, 256, 256);

      URL.revokeObjectURL(imageUrl);
      resolve(finalCanvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("이미지 로드 실패"));
    };

    img.src = imageUrl;
  });
}

export default function Page() {
  const [amount, setAmount] = useState<number>(0);
  const [isCheering, setIsCheering] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [bubbleMessage, setBubbleMessage] = useState<string>("");
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [drops, setDrops] = useState<MoneyDrop[]>([]);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState<boolean>(false);

  const [nickname, setNickname] = useState<string>("");
  const [cheerText, setCheerText] = useState<string>("");

  const [messages, setMessages] = useState<CheerMessage[]>(defaultMessages);

  useEffect(() => {
    const saved = window.localStorage.getItem("josoeun-support-messages");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as CheerMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch (error) {
      console.error("메시지 불러오기 실패", error);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "josoeun-support-messages",
      JSON.stringify(messages)
    );
  }, [messages]);

  const currentStageIndex = useMemo(() => {
    if (amount >= 1600000) return 4;
    if (amount >= 1200000) return 3;
    if (amount >= 800000) return 2;
    if (amount >= 400000) return 1;
    return 0;
  }, [amount]);

  const currentStage = stages[currentStageIndex];

  const currentCharacterSrc = isCheering
    ? currentStage.cheer
    : currentStage.idle;

  const progress = Math.min((amount / GOAL) * 100, 100);

  const triggerCelebration = () => {
    if (!isCheering) {
      setIsCheering(true);
      window.setTimeout(() => setIsCheering(false), 1800);
    }

    setShowBanner(true);
    window.setTimeout(() => setShowBanner(false), 2200);

    const newDrops: MoneyDrop[] = Array.from({ length: 14 }).map((_, index) => ({
      id: Date.now() + index,
      left: 5 + Math.random() * 85,
      delay: Math.random() * 0.35,
      size: 24 + Math.random() * 10,
      rotate: -18 + Math.random() * 36,
    }));

    setDrops(newDrops);
    window.setTimeout(() => setDrops([]), 2200);
  };

  const handleDonate = async (value: number) => {
    setAmount((prev: number) => Math.min(prev + value, GOAL));
    triggerCelebration();

    try {
      await navigator.clipboard.writeText(
        `${BANK_NAME} ${ACCOUNT_NUMBER} ${ACCOUNT_HOLDER}`
      );
      setCopyMessage("계좌번호가 복사되었어요.");
      setBubbleMessage(`${value.toLocaleString()}원 응원! 계좌번호가 복사되었어요.`);
    } catch {
      setCopyMessage("복사에 실패했어요.");
      setBubbleMessage("복사에 실패했어요.");
    }

    window.setTimeout(() => {
      setCopyMessage("");
      setBubbleMessage("");
    }, 2200);
  };

  const handleAddMessage = async () => {
    const trimmedNickname = nickname.trim();
    const trimmedMessage = cheerText.trim();

    if (!trimmedMessage) return;

    const displayName = trimmedNickname || "익명";
    const currentIndex = messages.length % supporterSpots.length;
    const spot = supporterSpots[currentIndex];

    let avatarDataUrl: string | undefined = undefined;

    if (uploadedFile) {
      try {
        avatarDataUrl = await makePixelAvatar(uploadedFile);
      } catch (error) {
        console.error(error);
      }
    }

    const newMessage: CheerMessage = {
      id: Date.now(),
      nickname: displayName,
      message: trimmedMessage,
      color: getRandomColor(),
      x: spot.x,
      y: spot.y,
      avatar: avatarDataUrl,
    };

    setMessages((prev) => [...prev, newMessage].slice(-6));
    setBubbleMessage(`${displayName}: ${trimmedMessage}`);
    triggerCelebration();

    window.setTimeout(() => {
      setBubbleMessage("");
    }, 3000);

    setNickname("");
    setCheerText("");
    setUploadedFile(null);
  };

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(
        `${BANK_NAME} ${ACCOUNT_NUMBER} ${ACCOUNT_HOLDER}`
      );
      setCopyMessage("계좌번호가 복사되었어요.");
      setBubbleMessage("계좌번호가 복사되었어요!");
    } catch {
      setCopyMessage("복사에 실패했어요.");
      setBubbleMessage("복사에 실패했어요.");
    }

    window.setTimeout(() => {
      setCopyMessage("");
      setBubbleMessage("");
    }, 2200);
  };

  return (
    <main className="page-shell">
      <div className="page-wrap">
        <header className="title-area">
          <div className="title-row">
            <div>
              <h1>조소은 졸업시키기</h1>
              <p>후원은 계좌로, 응원은 메시지와 아바타로 남겨주세요</p>
            </div>

            <button
              className="movie-info-btn"
              onClick={() => setIsMovieModalOpen(true)}
            >
              영화 소개 보기
            </button>
          </div>
        </header>

        <section className="money-panel">
          <div className="money-label">목표 금액</div>
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
              💸
            </div>
          ))}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className="supporter-wrap"
              style={{
                left: msg.x,
                bottom: msg.y,
              }}
            >
              {msg.avatar ? (
                <div
                  className="supporter-image-frame"
                  title={`${msg.nickname}: ${msg.message}`}
                >
                  <div className="supporter-image-head">
                    <img
                      src={msg.avatar}
                      alt={msg.nickname}
                      className="supporter-image-avatar"
                    />
                  </div>
                  <div
                    className="supporter-image-body"
                    style={{ background: msg.color }}
                  />
                </div>
              ) : (
                <div
                  className="supporter-pixel"
                  style={{ background: msg.color }}
                  title={`${msg.nickname}: ${msg.message}`}
                >
                  <div className="supporter-face">
                    <span className="eye left" />
                    <span className="eye right" />
                    <span className="mouth" />
                  </div>
                </div>
              )}

              <div className="supporter-chat">
                <div className="supporter-name">{msg.nickname}</div>
                <div className="supporter-text">{msg.message}</div>
              </div>
            </div>
          ))}

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

            {copyMessage && <div className="copy-message">{copyMessage}</div>}

            <div className="donate-grid">
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

            <input
              className="message-file-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setUploadedFile(file);
              }}
            />

            <button className="submit-btn" onClick={handleAddMessage}>
              등록하기
            </button>

            <div className="message-help">
              이미지를 올리면 픽셀화된 응원 아바타가 화면에 계속 남아요
            </div>
          </div>
        </section>

        <section className="message-list-card">
          <h3>응원 메시지</h3>

          <div className="message-list">
            {messages.map((msg) => (
              <div key={msg.id} className="message-item">
                {msg.avatar ? (
                  <div className="message-uploaded-avatar-box">
                    <img
                      src={msg.avatar}
                      alt={msg.nickname}
                      className="message-uploaded-avatar"
                    />
                  </div>
                ) : (
                  <div
                    className="message-avatar"
                    style={{ background: msg.color }}
                  >
                    <div className="mini-face">
                      <span className="mini-eye left" />
                      <span className="mini-eye right" />
                      <span className="mini-mouth" />
                    </div>
                  </div>
                )}

                <div className="message-content">
                  <div className="message-name">{msg.nickname}</div>
                  <div className="message-body">{msg.message}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {isMovieModalOpen && (
        <div
          className="movie-modal-overlay"
          onClick={() => setIsMovieModalOpen(false)}
        >
          <div
            className="movie-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="movie-modal-close"
              onClick={() => setIsMovieModalOpen(false)}
            >
              닫기
            </button>

            <div className="movie-modal-content">
              <h2>{movieInfo.title}</h2>

              <div className="movie-meta">
                <span>{movieInfo.genre}</span>
                <span>{movieInfo.runtime}</span>
              </div>

              <div className="movie-section">
                <h3>로그라인</h3>
                <p>{movieInfo.logline}</p>
              </div>

              <div className="movie-section">
                <h3>시놉시스</h3>
                <p>{movieInfo.synopsis}</p>
              </div>

              <div className="movie-section">
                <h3>연출의도</h3>
                <p>{movieInfo.note}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}