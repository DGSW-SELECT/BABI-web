export default function Wave() {
  return (
    <div className="babi-wave" aria-hidden="true">
      {[0, 0.1, 0.2, 0.3, 0.15].map((d, i) => (
        <i key={i} style={{ animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}
