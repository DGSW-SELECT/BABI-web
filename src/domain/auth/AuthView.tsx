import { useEffect, useRef, useState } from "react";

function GoogleLogo() {
  const parts = [
    { left: 3.11, top: 4.83, width: 14.33, height: 10.83 },
    { left: 14.26, top: 3.13, width: 19.2, height: 10.19 },
    { left: 6.04, top: 1.84, width: 19.14, height: 8.76 },
    { left: 10.4, top: -1.46, width: 19.14, height: 8.76 },
    { left: 4.11, top: 4.77, width: 21.38, height: 10.22 },
    { left: 9.28, top: -0.99, width: 12.47, height: 10.03 },
  ];
  return (
    <span
      aria-hidden="true"
      className="relative inline-block h-5 w-5 shrink-0 overflow-hidden"
      style={{
        maskImage: "url(/auth/google-mask.svg)",
        maskSize: "20px 20px",
        maskRepeat: "no-repeat",
      }}
    >
      <img
        src="/auth/google-base.png"
        width="26.299"
        height="25.772"
        alt=""
        className="absolute max-w-none"
        style={{ left: -2.8, top: -3.09 }}
      />
      {parts.map((part, index) => (
        <img
          key={index}
          src={`/auth/google-${index}.svg`}
          alt=""
          className="absolute max-w-none"
          style={part}
        />
      ))}
    </span>
  );
}

function Field({
  label,
  password = false,
  small = false,
}: {
  label: string;
  password?: boolean;
  small?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const placeholder = password
    ? "비밀번호를 입력해주세요"
    : `${label}을 입력해주세요`;
  return (
    <label className="flex flex-col gap-[10px] text-[13px] leading-4 text-black">
      {label}
      <span className="relative block">
        <input
          type={
            password && !visible
              ? "password"
              : label === "이메일"
                ? "email"
                : "text"
          }
          autoComplete={
            password ? "new-password" : label === "이메일" ? "email" : "name"
          }
          placeholder={placeholder}
          className={`h-[54px] w-full rounded-[10px] border border-[#bbbaba] bg-white px-5 pr-12 outline-none placeholder:text-[#868282] focus:border-[#7895bb] focus:ring-1 focus:ring-[#7895bb] ${small ? "text-[13px]" : "text-[15px]"}`}
        />
        {password && (
          <button
            type="button"
            aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
            className="absolute inset-y-0 right-3 flex w-9 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-[#7895bb]"
          >
            <img src="/auth/eye.png" width="23" height="23" alt="" />
          </button>
        )}
      </span>
    </label>
  );
}

export function Verification({ onClose }: { onClose: () => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState(Array<string>(6).fill(""));
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + 120_000);

  useEffect(() => {
    const updateRemainingTime = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0) window.clearInterval(intervalId);
    };
    const intervalId = window.setInterval(updateRemainingTime, 1000);
    document.addEventListener("visibilitychange", updateRemainingTime);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", updateRemainingTime);
    };
  }, [expiresAt]);

  const remainingTime = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;
  return (
    <div
      className="absolute inset-0 z-50 bg-black/60"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <button
        type="button"
        aria-label="인증 화면 닫기"
        className="absolute inset-0"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-title"
        className="absolute inset-x-0 bottom-0 h-[487px] rounded-t-[50px] bg-white text-center text-black"
      >
        <button
          type="button"
          aria-label="인증 화면 닫기"
          onClick={onClose}
          className="mx-auto flex h-9 w-32 items-start justify-center pt-[14px]"
        >
          <span className="h-0.5 w-[115px] bg-[#393838]" />
        </button>
        <h2
          id="verification-title"
          className="mt-[35px] text-[28px] leading-9 tracking-[-1.2px]"
        >
          이메일을 확인해주세요
        </h2>
        <p className="mt-[11px] text-[15px] leading-[18px] text-[#959292]">
          입력하신 이메일로 인증번호를 보냈어요
        </p>
        <div
          className="mx-auto mt-[61px] flex w-[calc(100%-52px)] gap-[10px]"
          onPaste={(event) => {
            const value = event.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, 6);
            if (value) {
              event.preventDefault();
              setDigits(Array.from({ length: 6 }, (_, i) => value[i] || ""));
              refs.current[Math.min(value.length, 5)]?.focus();
            }
          }}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                refs.current[index] = node;
              }}
              autoFocus={index === 0}
              aria-label={`인증번호 ${index + 1}번째 자리`}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "").slice(-1);
                setDigits((previous) =>
                  previous.map((d, i) => (i === index ? value : d)),
                );
                if (value) refs.current[index + 1]?.focus();
              }}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !digit)
                  refs.current[index - 1]?.focus();
              }}
              className="h-[65px] min-w-0 flex-1 rounded-[5px] border border-[#696666] bg-white text-center text-2xl outline-none focus:border-[#7895bb] focus:ring-1 focus:ring-[#7895bb]"
            />
          ))}
        </div>
        <p role="timer" aria-label="인증번호 남은 시간" className="mt-9 text-[15px] leading-[18px] text-[#959292]">
          {remainingTime}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mx-4 mt-[26px] h-[65px] w-[calc(100%-32px)] rounded-[10px] bg-[#111] text-xl text-white hover:bg-[#292929]"
        >
          인증하기
        </button>
        <button
          type="button"
          onClick={() => {
            setDigits(Array<string>(6).fill(""));
            setRemainingSeconds(120);
            setExpiresAt(Date.now() + 120_000);
            refs.current[0]?.focus();
          }}
          className="mt-8 text-[13px] text-[#393838] underline underline-offset-4"
        >
          인증번호 재전송
        </button>
      </section>
    </div>
  );
}

export default function AuthView() {
  const [signup, setSignup] = useState(window.location.hash === "#signup");
  const [verification, setVerification] = useState(false);
  function changeScreen(value: boolean) {
    setSignup(value);
    window.history.replaceState(null, "", value ? "#signup" : "#login");
  }
  return (
    <main className="relative mx-auto min-h-[max(874px,100svh)] w-full max-w-[402px] overflow-hidden bg-[#f8f9fa] pb-[62px] text-black shadow-[0_0_24px_rgba(0,0,0,0.08)]">
      <header className="relative pt-[100px] text-center">
        <div className="relative h-[60px]">
          <span className="auth-wordmark text-[50.4px] leading-[60px]">
            babi
          </span>
          <img
            src="/auth/mascot.png"
            width="79"
            height="87"
            alt="BABI 아기 코끼리"
            className="absolute left-[65.42%] top-[-31px] h-[87px] w-[79px] object-cover"
          />
        </div>
        <h1 className="mt-4 whitespace-nowrap text-[clamp(24px,7.46vw,30px)] leading-9 tracking-[-1.2px]">
          {signup ? "우리아이와 함께 시작해요" : "다시 만나서 반가워요!"}
        </h1>
        <p className="mt-[11px] text-[clamp(12px,3.73vw,15px)] leading-[18px] text-[#959292]">
          {signup
            ? "보호자의 정보를 입력하고 기록을 시작해보세요"
            : "우리아이 맞춤형 AI 육아 파트너"}
        </p>
      </header>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!signup) setVerification(true);
        }}
        className={`mx-auto w-[81.1%] ${signup ? "mt-[39px]" : "mt-[43px]"}`}
      >
        <div className="flex flex-col gap-[10px]">
          {signup && <Field label="이름" small />}
          <Field label="이메일" small={signup} />
          <Field label="비밀번호" password />
          {signup && <Field label="비밀번호 확인" password />}
        </div>
        <button
          type="submit"
          className={`h-14 w-full rounded-[10px] bg-[#111] text-[18px] text-white transition-colors hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7895bb] ${signup ? "mt-[54px]" : "mt-8"}`}
        >
          {signup ? "회원가입" : "로그인"}
        </button>
        {signup ? (
          <p className="mt-[15px] text-center text-[13px] leading-[18px] text-[#868282]">
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              onClick={() => changeScreen(false)}
              className="ml-[9px] text-[14px] text-[#393838] underline underline-offset-4"
            >
              로그인
            </button>
          </p>
        ) : (
          <div className="mt-[15px] flex justify-between text-[13px] leading-[18px] text-[#868282]">
            <button type="button" className="underline underline-offset-4">
              비밀번호를 잊으셨나요?
            </button>
            <button
              type="button"
              onClick={() => changeScreen(true)}
              className="underline underline-offset-4"
            >
              회원가입
            </button>
          </div>
        )}
      </form>
      {!signup && (
        <div className="mt-16">
          <div className="mx-[22px] flex items-center gap-5 text-[14px] leading-[17px] text-[#868282]">
            <span className="h-px flex-1 bg-[#999]" />
            또는
            <span className="h-px flex-1 bg-[#999]" />
          </div>
          <div className="mx-auto mt-8 flex w-[81.1%] flex-col gap-[15px]">
            <button
              type="button"
              className="flex h-[54px] items-center justify-center gap-[15px] rounded bg-[#03c75a] text-[18px] text-white hover:brightness-95"
            >
              <img src="/auth/naver.svg" width="16" height="16" alt="" />
              네이버 계정으로 로그인
            </button>
            <button
              type="button"
              className="flex h-[54px] items-center justify-center gap-2 rounded border border-[#999] bg-white text-[18px] font-medium hover:bg-slate-50"
            >
              <GoogleLogo />
              Google 계정으로 로그인
            </button>
          </div>
        </div>
      )}
      {verification && <Verification onClose={() => setVerification(false)} />}
    </main>
  );
}
