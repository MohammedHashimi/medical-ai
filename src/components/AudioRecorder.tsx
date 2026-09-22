"use client";

import { useEffect, useRef, useState } from "react";

function getSupportedMimeType(): string {
  const types = [
    "audio/mp4",
    "audio/webm;codecs=opus",
    "audio/webm",
  ];

  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
}

function getFileExtension(mimeType: string): string {
  if (mimeType.includes("mp4")) {
    return "m4a";
  }

  return "webm";
}

export default function AudioRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const interval = window.setInterval(() => {
      setRecordingTime((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Audio recording is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mimeType = getSupportedMimeType();

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const actualMimeType =
          recorder.mimeType || mimeType || "audio/webm";

        const blob = new Blob(chunksRef.current, {
          type: actualMimeType,
        });

        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;
      };

      mediaRecorderRef.current = recorder;

      setRecordingTime(0);
      setAudioBlob(null);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      recorder.start();

      setIsRecording(true);
    } catch (err) {
      console.error("Could not start recording:", err);

      setError(
        "Microphone access was denied or the microphone could not be opened."
      );
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      return;
    }

    recorder.stop();
    setIsRecording(false);
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const downloadRecording = () => {
    if (!audioBlob) {
      return;
    }

    const extension = getFileExtension(audioBlob.type);

    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `ptalk-consultation.${extension}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        New consultation
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Record your symptoms using your microphone.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center">
        <div
          className={`flex h-32 w-32 items-center justify-center rounded-full border-4 ${
            isRecording
              ? "border-red-500 bg-red-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <span className="text-2xl font-mono text-gray-900">
            {formatTime(recordingTime)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Start recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-xl bg-red-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Stop recording
          </button>
        )}
      </div>

      {audioUrl && audioBlob && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm font-medium text-gray-900">
            Recording ready
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Format: {audioBlob.type || "unknown"} · Size:{" "}
            {(audioBlob.size / 1024).toFixed(1)} KB
          </p>

          <audio
            className="mt-4 w-full"
            controls
            src={audioUrl}
          />

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={downloadRecording}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Download audio
            </button>

            <button
              type="button"
              onClick={deleteRecording}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}