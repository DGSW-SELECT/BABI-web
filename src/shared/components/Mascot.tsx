interface Props {
  size?: number;
  className?: string;
}

/** 고해상도 BABI 코끼리 마스코트 */
export default function Mascot({ size = 180, className = "" }: Props) {
  return (
    <img
      className={`babi-mascot ${className}`}
      src="/auth/mascot.png"
      style={{ width: size }}
      alt="BABI 마스코트"
    />
  );
}
