import { Link } from "react-router";

export default function FamilyPageHeader({ title }: { title: string }) {
  return (
    <header className="relative mx-5 mt-4 flex h-14 shrink-0 items-center justify-center">
      <Link to="/family" aria-label="마이페이지로 돌아가기"
        className="absolute left-3 grid size-[38px] place-items-center rounded-[10px] hover:bg-[#e9edf2] focus-visible:outline-2 focus-visible:outline-[#7895bb]">
        <img src="/record-assets/close.svg" alt="" className="size-[16.34px]" />
      </Link>
      <h1 className="m-0 text-2xl leading-[33.8px] font-medium tracking-[-0.7px] text-black">{title}</h1>
    </header>
  );
}
