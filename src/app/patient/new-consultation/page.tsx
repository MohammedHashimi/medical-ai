"use client";

import PatientBottomNav from "@/components/BottomNavigation";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

function getSupportedMimeType(): string {
  const types = [
    "audio/mp4",
    "audio/webm;codecs=opus",
    "audio/webm",
  ];

  for (const type of types) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }

  return "";
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default function NewConsultationPage() {
  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] =
    useState<"vi" | "en">("vi");

  const [isRecording, setIsRecording] =
    useState(false);

  const [recordingTime, setRecordingTime] =
    useState(0);

  const [audioBlob, setAudioBlob] =
    useState<Blob | null>(null);

  const [audioUrl, setAudioUrl] =
    useState<string | null>(null);

  const [uploadedFile, setUploadedFile] =
    useState<File | null>(null);

  const [uploadedAudioUrl, setUploadedAudioUrl] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [uploadError, setUploadError] =
    useState<string | null>(null);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const interval = window.setInterval(() => {
      setRecordingTime(
        (current) => current + 1
      );
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      streamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      if (uploadedAudioUrl) {
        URL.revokeObjectURL(
          uploadedAudioUrl
        );
      }
    };
  }, [audioUrl, uploadedAudioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      setSubmitError(null);
      setSubmitted(false);

      if (
        !navigator.mediaDevices?.getUserMedia
      ) {
        setError(
          "Audio recording is not supported by this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current = stream;

      const mimeType =
        getSupportedMimeType();

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          chunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = () => {
        const finalMimeType =
          recorder.mimeType ||
          mimeType ||
          "audio/webm";

        const blob = new Blob(
          chunksRef.current,
          {
            type: finalMimeType,
          }
        );

        const url =
          URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);

        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      };

      mediaRecorderRef.current =
        recorder;

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioBlob(null);
      setAudioUrl(null);

      setUploadedFile(null);

      if (uploadedAudioUrl) {
        URL.revokeObjectURL(
          uploadedAudioUrl
        );
      }

      setUploadedAudioUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setRecordingTime(0);

      recorder.start();

      setIsRecording(true);
    } catch (err) {
      console.error(
        "Failed to start recording:",
        err
      );

      if (err instanceof DOMException) {
        if (
          err.name === "NotFoundError"
        ) {
          setError(
            "No microphone was found. Please connect or enable a microphone and try again."
          );
        } else if (
          err.name === "NotAllowedError"
        ) {
          setError(
            "Microphone access was denied. Please allow microphone access for PTalk in your browser."
          );
        } else if (
          err.name === "NotReadableError"
        ) {
          setError(
            "The microphone is already being used by another application."
          );
        } else {
          setError(
            `Microphone error: ${err.name} — ${err.message}`
          );
        }
      } else {
        setError(
          "Could not access the microphone."
        );
      }
    }
  };

  const stopRecording = () => {
    const recorder =
      mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state === "inactive"
    ) {
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

    setSubmitError(null);
    setSubmitted(false);
  };

  const downloadRecording = () => {
    if (!audioBlob) {
      return;
    }

    const extension =
      audioBlob.type.includes("mp4")
        ? "m4a"
        : "webm";

    const url =
      URL.createObjectURL(audioBlob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `ptalk-consultation.${extension}`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  const handleAudioUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setUploadError(null);
    setError(null);
    setSubmitError(null);
    setSubmitted(false);

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("audio/")) {
      setUploadError(
        "Please select a valid audio file."
      );

      event.target.value = "";

      return;
    }

    const maxSize =
      50 * 1024 * 1024;

    if (file.size > maxSize) {
      setUploadError(
        "The audio file must be smaller than 50 MB."
      );

      event.target.value = "";

      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);

    setUploadedFile(file);

    if (uploadedAudioUrl) {
      URL.revokeObjectURL(
        uploadedAudioUrl
      );
    }

    const url =
      URL.createObjectURL(file);

    setUploadedAudioUrl(url);
  };

  const deleteUploadedFile = () => {
    if (uploadedAudioUrl) {
      URL.revokeObjectURL(
        uploadedAudioUrl
      );
    }

    setUploadedFile(null);
    setUploadedAudioUrl(null);
    setUploadError(null);
    setSubmitError(null);
    setSubmitted(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitConsultation = async () => {
    setSubmitError(null);
    setSubmitted(false);

    let fileToSend: File | null = null;

    /*
     * Uploaded file has priority.
     */
    if (uploadedFile) {
      fileToSend = uploadedFile;
    }

    /*
     * Otherwise use browser recording.
     */
    else if (audioBlob) {
      const extension =
        audioBlob.type.includes("mp4")
          ? "m4a"
          : "webm";

      fileToSend = new File(
        [audioBlob],
        `ptalk-consultation.${extension}`,
        {
          type:
            audioBlob.type ||
            "audio/webm",
        }
      );
    }

    if (!fileToSend) {
      setSubmitError(
        "Please record a consultation or upload an audio file first."
      );

      return;
    }

    try {
      setIsSubmitting(true);

      console.log(
        "PTALK: submitting consultation"
      );

      console.log(
        "PTALK: language:",
        language
      );

      console.log(
        "PTALK: file:",
        fileToSend.name,
        fileToSend.type,
        fileToSend.size
      );

      const formData = new FormData();

      formData.append(
        "audio",
        fileToSend
      );

      /*
       * Send selected consultation language.
       *
       * vi = Vietnamese
       * en = English
       */
      formData.append(
        "language",
        language
      );

      const response = await fetch(
        "/api/patient/consultation",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log(
        "PTALK: response status:",
        response.status
      );

      const responseText =
        await response.text();

      console.log(
        "PTALK: response:",
        responseText
      );

      let data: {
        error?: string;
        message?: string;
        code?: string;
        consultation_id?: string;
      } = {};

      /*
       * The server may return JSON,
       * but it may also return plain text
       * when a server-side error occurs.
       */
      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        console.error(
          "PTALK: response was not JSON"
        );
      }

      if (!response.ok) {
        if (data.code === "NO_SYMPTOMS") {
          throw new Error(
            "No symptoms were detected. Please describe your symptoms again and try again."
          );
        }

        throw new Error(
          data.error ||
            data.message ||
            responseText ||
            `Request failed with status ${response.status}`
        );
      }

      setSubmitted(true);

      console.log(
        "PTALK: consultation submitted successfully",
        data
      );
    } catch (err) {
      console.error(
        "PTALK: failed to submit consultation:",
        err
      );

      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to submit consultation."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAudio =
    Boolean(audioBlob) ||
    Boolean(uploadedFile);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-4">

          <div className="text-lg font-bold text-slate-900">
            PTalk
          </div>

          <div className="text-xs text-slate-400">
            New consultation
          </div>

        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10">

        {/* Back */}
        <a
          href="/patient"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back
        </a>

        {/* Title */}
        <section className="mt-6">

          <p className="text-sm text-slate-500">
            Clinical consultation
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            New consultation
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Describe your symptoms using a
            recording or upload an existing
            audio file.
          </p>

        </section>

        {/* LANGUAGE */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Consultation language
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Select language
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choose the language that will be spoken
            in the consultation.
          </p>

          <div className="mt-5 rounded-xl bg-slate-100 p-1">

            <div className="grid grid-cols-2 gap-1">

              <button
                type="button"
                onClick={() => {
                  setLanguage("vi");
                  setSubmitError(null);
                  setSubmitted(false);
                }}
                disabled={
                  isRecording ||
                  isSubmitting
                }
                className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                  language === "vi"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                } ${
                  isRecording ||
                  isSubmitting
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
              >
                Vietnamese
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage("en");
                  setSubmitError(null);
                  setSubmitted(false);
                }}
                disabled={
                  isRecording ||
                  isSubmitting
                }
                className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                  language === "en"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                } ${
                  isRecording ||
                  isSubmitting
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
              >
                English
              </button>

            </div>

          </div>

          <div className="mt-4 flex items-center justify-between">

            <span className="text-xs text-slate-500">
              Selected language
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {language === "vi"
                ? "vi"
                : "en"}
            </span>

          </div>

        </section>

        {/* RECORDING */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Option 1
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Record consultation
          </h2>

          <div className="mt-6 flex justify-center">

            <div
              className={`flex h-36 w-36 items-center justify-center rounded-full border-4 ${
                isRecording
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >

              <span className="font-mono text-2xl text-slate-900">
                {formatTime(
                  recordingTime
                )}
              </span>

            </div>

          </div>

          {isRecording && (
            <p className="mt-5 text-center text-sm font-medium text-red-600">
              Recording...
            </p>
          )}

          <div className="mt-6 flex justify-center">

            {!isRecording ? (

              <button
                type="button"
                onClick={
                  startRecording
                }
                className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Start recording
              </button>

            ) : (

              <button
                type="button"
                onClick={
                  stopRecording
                }
                className="rounded-xl bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-700"
              >
                Stop recording
              </button>

            )}

          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

        </section>

        {/* RECORDED AUDIO */}
        {audioBlob && audioUrl && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Recording
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Recording ready
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Format:{" "}
              {audioBlob.type}
              {" · "}
              Size:{" "}
              {(
                audioBlob.size /
                1024
              ).toFixed(1)}{" "}
              KB
            </p>

            <audio
              className="mt-5 w-full"
              controls
              src={audioUrl}
            />

            <div className="mt-5 flex gap-3">

              <button
                type="button"
                onClick={
                  downloadRecording
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Download
              </button>

              <button
                type="button"
                onClick={
                  deleteRecording
                }
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>

            </div>

          </section>
        )}

        {/* UPLOAD */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Option 2
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Upload audio file
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Upload an existing recording
            instead of using the microphone.
          </p>

          <label className="mt-5 block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-slate-400 hover:bg-slate-100">

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={
                handleAudioUpload
              }
              className="hidden"
            />

            <div className="text-sm font-medium text-slate-900">
              Choose audio file
            </div>

            <div className="mt-1 text-xs text-slate-500">
              MP3, WAV, M4A, WebM and other
              supported audio formats
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Maximum file size: 50 MB
            </div>

          </label>

          {uploadError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {uploadError}
            </div>
          )}

          {uploadedFile &&
            uploadedAudioUrl && (

              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">

                <p className="text-sm font-medium text-slate-900">
                  Selected file
                </p>

                <p className="mt-1 break-all text-sm text-slate-600">
                  {uploadedFile.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {uploadedFile.type ||
                    "Unknown audio type"}
                  {" · "}
                  {(
                    uploadedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>

                <audio
                  className="mt-4 w-full"
                  controls
                  src={
                    uploadedAudioUrl
                  }
                />

                <button
                  type="button"
                  onClick={
                    deleteUploadedFile
                  }
                  className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Remove file
                </button>

              </div>

            )}

        </section>

        {/* SUBMIT */}
        {hasAudio && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold text-slate-900">
              Submit consultation
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your audio will be sent to PTalk
              for processing.
            </p>

            {/* Selected language summary */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

              <span className="text-sm text-slate-500">
                Language
              </span>

              <span className="text-sm font-medium text-slate-900">
                {language === "vi"
                  ? "Vietnamese (vi)"
                  : "English (en)"}
              </span>

            </div>

            {submitError && (
              <div className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {submitted && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                Consultation submitted
                successfully.
              </div>
            )}

            <button
              type="button"
              onClick={
                submitConsultation
              }
              disabled={isSubmitting}
              className="mt-5 w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit consultation"}
            </button>

          </section>
        )}

      </div>

      {/* BOTTOM NAVIGATION */}
      <PatientBottomNav />

    </main>
  );
}