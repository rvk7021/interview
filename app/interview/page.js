"use client";
import { useEffect, useState, useRef } from "react";

export default function InterviewPage() {
  const [recordingStream, setRecordingStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const videoRef = useRef(null);
  const screenRef = useRef(null);

  // Start recording video and screen-sharing
  useEffect(() => {
    const startScreenShare = async () => {
      try {
        // Screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        if (screenRef.current) {
          screenRef.current.srcObject = screenStream;
        }

        // Webcam and microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setRecordingStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          setChunks((prev) => [...prev, event.data]);
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const formData = new FormData();
          formData.append("file", blob);

          // Send the recorded file to the API
          setIsLoading(true);
          try {
            await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
          } catch (error) {
            console.error("Error uploading the recording:", error);
          }
          setIsLoading(false);
          setCompleted(true);
        };

        recorder.start();
        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        alert(
          "There was an error accessing your camera or screen. Please check your settings and try again."
        );
      }
    };

    startScreenShare();

    return () => {
      if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [recordingStream]);

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    if (recordingStream) {
      recordingStream.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 grid grid-cols-1 md:grid-cols-2 text-white">
      {/* Left Side: Question Section */}
      <div className="flex flex-col justify-center items-center px-6 py-4 bg-gray-800">
        <div className="w-full bg-gray-700 p-6 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Question</h1>
          <p className="text-lg">
            Sort the array [5, 2, 9, 1, 5, 6] in ascending order.
          </p>
        </div>
        <div className="w-full bg-gray-700 mt-6 p-6 rounded-lg shadow-md">
          <h1 className="text-xl font-bold mb-4">Your Video Feed</h1>
          <video
            autoPlay
            muted
            playsInline
            ref={videoRef}
            className="border border-gray-700 rounded-lg w-full h-auto"
          ></video>
        </div>
      </div>

      {/* Right Side: Share Screen and Answer Section */}
      <div className="flex flex-col px-6 py-4 bg-gray-900">
        {/* Share Screen */}
        <div className="w-full bg-gray-700 p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-xl font-bold mb-4">Shared Screen</h1>
          <video
            autoPlay
            playsInline
            ref={screenRef}
            className="border border-gray-700 rounded-lg w-full h-48"
          ></video>
        </div>

        {/* Text Feed */}
        <div className="w-full bg-gray-700 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Your Answer</h1>
          <textarea
            className="w-full h-64 p-4 bg-gray-800 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your answer here..."
          ></textarea>
        </div>
      </div>

      {/* Loader Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-white text-xl">Processing your recording...</div>
        </div>
      )}

      {/* Completion Screen */}
      {completed && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Test Completed!</h1>
            <p className="text-lg">
              Thank you for participating in the interview. Your response has been submitted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
