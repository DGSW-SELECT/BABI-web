import Mascot from "../../shared/components/Mascot";
import { useEffect, useState } from "react";
import { fetchRecommendations } from "./api";
import type { Activity, Recommendation } from "./types";

interface Props {
  onStartActivity?: (activity: Activity) => void;
}

export default function ActivityRecommendView({ onStartActivity }: Props) {
  const [page, setPage] = useState(0);
  const [retry, setRetry] = useState(0);
  const [data, setData] = useState<Recommendation | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setApiError(null);
    fetchRecommendations(page)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setApiError(e instanceof Error ? e.message : "문제가 생겼어요. 다시 시도해주세요."));
    return () => { alive = false; };
  }, [page, retry]);

  if (!data) {
    return (
      <section className="babi-screen">
        {apiError ? (
          <>
            <p className="babi-error" role="alert">{apiError}</p>
            <button className="babi-btn babi-btn--dark" onClick={() => setRetry((n) => n + 1)}>다시 시도</button>
          </>
        ) : (
          <p className="babi-hint">불러오는 중…</p>
        )}
      </section>
    );
  }

  const c = data.condition;

  return (
    <section className="babi-screen babi-screen--wide babi-screen--left babi-screen--activity">
      <h2 className="babi-title-left">오늘 지민이에게<br />이런 활동은 어때요?</h2>
      <p className="babi-hint">{data.ageLabel} · 오늘 기록을 바탕으로 추천했어요</p>

      <div className="babi-stats">
        <div className="babi-stat babi-stat--feeding">수유<b>{c.feeding}</b></div>
        <div className="babi-stat babi-stat--sleep">수면<b>{c.sleep}</b></div>
        <div className="babi-stat babi-stat--temperature">체온<b>{c.temp}</b></div>
        <div className="babi-stat babi-stat--cry">울음<b>{c.cry}</b></div>
      </div>

      <div className="babi-card babi-card--hero babi-comment">
        <Mascot size={56} />
        <span>{data.comment}</span>
      </div>

      <div className="babi-act-grid">
      {data.activities.map((a) => (
        <div className="babi-act" key={a.id}>
          <div className="babi-act__ic">{a.icon}</div>
          <div>
            <b>{a.title}</b>
            <p>{a.desc}</p>
          </div>
          <button className="babi-act__go" onClick={() => onStartActivity?.(a)}>시작</button>
        </div>
      ))}
      </div>

      <button className="babi-btn babi-btn--grey" onClick={() => setPage((p) => p + 1)}>
        다른 활동 추천받기
      </button>
    </section>
  );
}
