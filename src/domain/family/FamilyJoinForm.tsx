import { useState, type FormEvent } from "react";
import { acceptInvitation, checkInvitation, type Baby } from "./family-api";

export default function FamilyJoinForm({ token, onJoined }: {
  token: string;
  onJoined: (baby: Baby) => void;
}) {
  const [code, setCode] = useState("");
  const [checked, setChecked] = useState<Baby | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      if (checked) {
        onJoined(await acceptInvitation(token, code));
        setChecked(null);
        setCode("");
      } else {
        setChecked(await checkInvitation(token, code));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "초대를 확인하지 못했어요.");
      setChecked(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="mt-5 rounded-[13px] border border-[#d7d7d7] bg-white p-4 text-sm">
      <summary className="cursor-pointer">초대 코드로 참여하기</summary>
      <form className="mt-3 space-y-3" onSubmit={submit}>
        <label className="block">초대 코드
          <input
            className="family-input mt-1 w-full"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={6}
            pattern="[A-Za-z0-9]{6}"
            placeholder="영문·숫자 6자리"
            value={code}
            disabled={pending}
            onChange={(event) => {
              setCode(event.target.value);
              setChecked(null);
              setError("");
            }}
          />
        </label>
        {checked && <p role="status">{checked.name}의 보호자로 참여할 수 있어요.</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <button type="submit" disabled={pending} className="w-full rounded-[10px] bg-[#111] py-3 text-white disabled:opacity-60">
          {pending ? "처리 중…" : checked ? "초대 수락" : "코드 확인"}
        </button>
      </form>
    </details>
  );
}
