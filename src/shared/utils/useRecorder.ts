import { useEffect, useRef, useState, useCallback } from "react";

interface Options {
  onStop?: (blob: Blob) => void;
  onError?: () => void;
  maxMs?: number;
}

/** 마이크 녹음 훅 (MediaRecorder). 녹음이 끝나면 onStop(blob) 호출 */
export default function useRecorder({ onStop, onError, maxMs }: Options = {}) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mountedRef = useRef(false);
  const startingRef = useRef(false);

  // 화면 이동과 실패 경로에서도 녹음기·타이머·마이크를 함께 정리한다.
  const clearRecorder = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      try {
        if (recorder.state !== "inactive") recorder.stop();
      } catch {
        // 녹음기가 이미 종료됐어도 아래에서 마이크 트랙을 정리한다.
      }
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearRecorder();
    };
  }, [clearRecorder]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (!mountedRef.current || startingRef.current || recorderRef.current) return false;
    startingRef.current = true;
    try {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("녹음을 지원하지 않는 환경이에요.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 권한 창을 기다리는 동안 화면을 나갔다면 얻은 스트림도 바로 닫는다.
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType });
        clearRecorder();
        if (!mountedRef.current) return;
        setRecording(false);
        onStop?.(audio);
      };
      recorder.onerror = () => {
        clearRecorder();
        if (!mountedRef.current) return;
        setRecording(false);
        setError("녹음 중 문제가 생겼어요. 다시 녹음해주세요.");
        onError?.();
      };
      recorder.start();
      setRecording(true);
      if (maxMs && maxMs > 0) timerRef.current = setTimeout(stop, maxMs);
      return true;
    } catch (error) {
      clearRecorder();
      if (mountedRef.current) {
        setError(error instanceof DOMException && error.name === "NotAllowedError"
          ? "마이크 권한을 허용해주세요."
          : "녹음을 시작하지 못했어요. 마이크 연결과 브라우저 지원을 확인해주세요.");
        setRecording(false);
      }
      return false;
    } finally {
      startingRef.current = false;
    }
  }, [onStop, onError, maxMs, stop, clearRecorder]);

  return { recording, error, start, stop };
}
