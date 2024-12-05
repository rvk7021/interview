"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { useMedia } from "../context/MediaContext"; // Import context

export default function InterviewPage() {
  const [recordingStream, setRecordingStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answerText, setAnswerText] = useState(""); // State to store the answer text
  const [chatMessages, setChatMessages] = useState([]); // State to store chat messages
  const [timeLeft, setTimeLeft] = useState(30); // Timer state

  const videoRef = useRef(null);
  const screenRef = useRef(null);

  const { screenStream, cameraStream } = useMedia(); // Access screenStream and cameraStream from context
  const router = useRouter(); // Initialize the router for navigation

  // Timer functionality
  useEffect(() => {
    if (timeLeft <= 0) {
      handleEndInterview(); // Automatically end the interview when time runs out
    } else {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer); // Cleanup timer
    }
  }, [timeLeft]);

  // Start recording video and screen-sharing
  useEffect(() => {
    if (screenStream && cameraStream) {
      if (screenRef.current) {
        screenRef.current.srcObject = screenStream;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }

      const recorder = new MediaRecorder(cameraStream);
      recorder.ondataavailable = (event) => {
        setChunks((prev) => [...prev, event.data]); // Ensure chunks are updated correctly
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

        // Stop all streams and navigate to the homepage
        stopStreams();
        router.push("/"); // Redirect to homepage
      };

      recorder.start();
      setMediaRecorder(recorder);
    }
  }, [screenStream, cameraStream, chunks]); // Updated dependencies

  const stopStreams = () => {
    // Stop camera and screen streams
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleEndInterview = () => {
    if (mediaRecorder) {
      mediaRecorder.stop(); // Stop the recording
    } else {
      stopStreams(); // Ensure streams are stopped even if recording didn't start
      router.push("/"); // Redirect to homepage
    }
  };

  const handleSendAnswer = () => {
    // Add the answer to the chat messages
    setChatMessages((prev) => [...prev, { type: "user", text: answerText }]);
    setAnswerText(""); // Clear the answer input
  };

  return (
    <div className="h-screen w-screen bg-gray-900 grid grid-cols-1 md:grid-cols-2 text-white">
      {/* Left Side: Question, Timer, and Answer Section */}
      <div className="flex flex-col justify-start items-center px-6 py-4 bg-gray-800 space-y-6">
        {/* Timer Section */}
        <div className="w-full bg-gray-700 p-4 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-2">Time Left</h1>
          <p className="text-3xl font-semibold">{timeLeft}s</p>
        </div>

        {/* Question Section */}
        <div className="w-full bg-gray-700 p-6 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Question</h1>
          <p className="text-lg">
            Sort the array [5, 2, 9, 1, 5, 6] in ascending order.
          </p>
        </div>

        {/* Answer Text Section */}
        <div className="w-full bg-gray-700 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Your Answer</h1>
          <textarea
            className="w-full h-64 p-4 bg-gray-800 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your answer here..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)} // Update state when text is typed
          ></textarea>
          <button
            onClick={handleSendAnswer}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>

      {/* Right Side: Video Feed, Screen Share, and Chat */}
      <div className="flex flex-col px-6 py-4 bg-gray-900">
        {/* Video Feed and Screen Share */}
        <div className="flex space-x-4 mb-6">
          <div className="w-1/2 bg-gray-700 rounded-lg shadow-md">
            <video
              autoPlay
              muted
              playsInline
              ref={videoRef}
              className="border border-gray-700 rounded-lg w-full h-full"
            ></video>
          </div>
          <div className="w-1/2 bg-gray-700 rounded-lg shadow-md">
            <video
              autoPlay
              playsInline
              ref={screenRef}
              className="border border-gray-700 rounded-lg w-full h-full"
            ></video>
          </div>
        </div>

        {/* Chat Display */}
        <div className="w-full bg-gray-700 mt-6 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Chat</h1>
          <div className="h-48 overflow-y-auto bg-gray-800 p-4 rounded-lg">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 p-2 rounded-lg ${
                  message.type === "user" ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                <p>{message.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* End Interview Button */}
        <button
          onClick={handleEndInterview}
          className="mt-4 bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg self-center"
        >
          End Interview
        </button>
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
