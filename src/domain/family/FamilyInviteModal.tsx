import { useEffect, useRef, useState } from "react";

type Props = {
  onClose: () => void;
};

export default function FamilyInviteModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const code = "000000";
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setError("");
    } catch {
      setError("복사하지 못했어요. 초대 코드를 길게 눌러 복사해주세요.");
    }
  }

  return (
    <dialog ref={dialogRef} aria-labelledby="family-member-title" className="family-member-dialog"
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <button type="button" aria-label="팝업 닫기" onClick={onClose} className="family-member-backdrop" tabIndex={-1} />
      <section className="family-member-sheet" aria-label="육아 멤버 추가">
        <header className="family-member-heading">
          <div>
            <h2 id="family-member-title">육아 멤버 추가하기</h2>
            <p className="mt-2 text-[13px] leading-5 text-[#78848f]">함께 돌볼 분에게 초대 코드를 공유해주세요.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="family-member-close mt-0.5 self-start"><span /><span /></button>
        </header>
        <div className="family-member-form">
          <div className="rounded-2xl bg-[#edf4fb] px-4 py-6 text-center">
            <p className="text-xs text-[#6687ad]">초대 코드</p>
            <p className="mt-3 select-all text-3xl font-semibold tracking-[0.2em] text-[#121212]">{code}</p>
          </div>
          {error && <p role="alert" className="family-member-error">{error}</p>}
          <button type="button" className="family-member-submit"
            onClick={() => void copyCode()}>
            {copied ? "초대 코드를 복사했어요" : "초대 코드 복사"}
          </button>
          {copied && <p role="status" className="text-center text-xs text-[#6687ad]">복사한 코드를 초대할 분에게 보내주세요.</p>}
        </div>
        <div className="family-member-home-indicator" aria-hidden="true" />
      </section>
    </dialog>
  );
}
