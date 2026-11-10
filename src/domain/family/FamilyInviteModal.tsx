import { useEffect, useRef, useState, type FormEvent } from "react";

import { getInvitationCode, reissueInvitationCode } from "./family-api";

type Props = {
  token: string;
  babyId: number;
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
};

export default function FamilyInviteModal({ token, babyId, onClose, onInvite }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const [code, setCode] = useState("");
  const [confirmReissue, setConfirmReissue] = useState(false);

  async function loadCode(reissue: boolean) {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await (reissue ? reissueInvitationCode(token, babyId) : getInvitationCode(token, babyId));
      setCode(result.code);
    } catch (error) {
      setError(error instanceof Error ? error.message : "초대 코드를 불러오지 못했어요.");
    } finally {
      setConfirmReissue(false);
      setPending(false);
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) return;
    setPending(true);
    setError("");
    try {
      await onInvite(email);
    } catch (error) {
      setError(error instanceof Error ? error.message : "초대에 실패했어요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog ref={dialogRef} onCancel={(event) => {
      event.preventDefault();
      if (!pending) onClose();
    }} aria-labelledby="family-member-title" className="family-member-dialog">
      <button type="button" aria-label="팝업 닫기" onClick={onClose} disabled={pending} className="absolute inset-0 h-full w-full cursor-default bg-black/60" tabIndex={-1} />
      <section className="family-member-sheet relative z-10 w-full rounded-t-[44px] bg-white px-[38px] pt-[34px] pb-[max(55px,env(safe-area-inset-bottom))] text-black max-[360px]:px-7">
        <header className="flex items-center justify-between">
          <h2 id="family-member-title" className="text-[22px] font-semibold leading-7">육아 멤버 초대하기</h2>
          <button type="button" onClick={onClose} disabled={pending} aria-label="닫기" className="-mr-2 grid size-8 place-items-center rounded-lg text-2xl hover:bg-gray-100">×</button>
        </header>
        <p className="mt-3 text-sm">아기 계정 소유자만 이메일 초대를 보낼 수 있어요.</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block text-sm">이메일
            <input name="email" type="email" required maxLength={320} placeholder="이메일을 입력해주세요" className="family-input mt-1 w-full" />
          </label>
          <button type="submit" disabled={pending} className="family-primary h-[54px] w-full rounded-[10px] bg-[#111111] text-[15px] text-white disabled:opacity-60">
            {pending ? "발송 중…" : "초대 이메일 보내기"}
          </button>
        </form>
        <div className="mt-4 space-y-2 border-t border-[#d7d7d7] pt-3 text-sm">
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={pending} onClick={() => void loadCode(false)} className="underline">초대 코드 확인</button>
            <button type="button" disabled={pending} onClick={() => setConfirmReissue(true)} className="underline">초대 코드 재발급</button>
          </div>
          {code && <p role="status">초대 코드: <strong className="select-all tracking-widest">{code}</strong></p>}
          {confirmReissue && (
            <div className="space-y-2">
              <p>재발급하면 기존 코드는 사용할 수 없어요.</p>
              <button type="button" disabled={pending} onClick={() => void loadCode(true)} className="mr-3 underline">재발급하기</button>
              <button type="button" disabled={pending} onClick={() => setConfirmReissue(false)} className="underline">취소</button>
            </div>
          )}
          {error && <p role="alert" className="text-red-700">{error}</p>}
        </div>
      </section>
    </dialog>
  );
}
