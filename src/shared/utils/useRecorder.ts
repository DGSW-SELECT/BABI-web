import { useRef, useState, useCallback } from "react";

interface Options {
  onStop?: (blob: Blob) => void;
  maxMs?: number;
}

/** 마이크 녹음 훅 (MediaRecorder). 녹음이 끝나면 onStop(blob) 호출 */
export default function useRecorder({ onStop, maxMs }: Options = {}) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        onStop?.(new Blob(chunksRef.current, { type: recorder.mimeType }));
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      if (maxMs) timerRef.current = setTimeout(stop, maxMs);
      return true;
    } catch {
      setError("마이크 권한을 허용해주세요.");
      setRecording(false);
      return false;
    }
  }, [onStop, maxMs, stop]);

  return { recording, error, start, stop };
}
