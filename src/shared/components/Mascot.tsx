import mascot from "../assets/babi-mascot.png";

interface Props {
  size?: number;
  className?: string;
}

/** BABI 코끼리 마스코트. 이미지를 교체하려면 src/shared/assets/babi-mascot.png 파일만 바꾸세요. */
export default function Mascot({ size = 180, className = "" }: Props) {
  return (
    <img
      className={`babi-mascot ${className}`}
      src={mascot}
      style={{ width: size }}
      alt="BABI 마스코트"
    />
  );
}
