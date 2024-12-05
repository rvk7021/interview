"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import router for navigation
import { LuClock } from "react-icons/lu";
import { FaYahoo } from "react-icons/fa";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { useMedia } from "./context/MediaContext"; // Import useMedia context

export default function Instruction() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { setScreenStream, setCameraStream } = useMedia(); // Access context methods
  const router = useRouter(); // Initialize the router instance

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setPermissionsGranted(true);
      } catch (error) {
        setErrorMessage("Camera and microphone permissions are required.");
      }
    };

    requestPermissions();
  }, []);

  const handleStartNow = async () => {
    try {
      // Request screen-sharing permissions and set it in the context
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setScreenStream(screenStream); // Set screen stream in context

      // Request camera and microphone permissions, then set it in the context
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(cameraStream); // Set camera stream in context

      // Navigate to /interview route
      router.push("/interview");
    } catch (error) {
      console.error("Error starting screen sharing:", error);
      setErrorMessage("Unable to start screen sharing. Please try again.");
    }
  };

  return (
    <div>
      <div className="text-4xl  font-bold text-blue-900 w-1 mx-auto">Interview</div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* grid 1 */}
        <div className="bg-gray-800 flex flex-col items-center">
          <h1 className="text-[25px] mt-9 font-bold text-white">Demo Interview</h1>
        </div>

        {/* grid 2 */}
        <div className="bg-gray-800 py-6 text-white px-6">
          {/* Logo and Timer Section */}
          <div className="flex items-center justify-center md:justify-end mb-6 space-x-6">
            <div className="flex border-[1px] p-1 rounded-2xl">
              <FaYahoo className="text-blue-700 my-1 text-2xl" />
              <span className="mx-1 my-1 text-lg font-bold">Yahoo</span>
            </div>
            <div className="flex items-center p-2 space-x-2 text-lg border-[1px] rounded-2xl">
              <LuClock className="" />
              <span>10:00 min</span>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-gray-700 opacity-[95%] p-4 rounded-xl">
            <h1 className="text-4xl font-bold mb-4 border-white font-[system-ui] pb-2 border-b-[1px]">Instructions</h1>
            <ol className="text-lg list-decimal list-inside space-y-4">
              <li>Ensure a stable internet connection throughout the interview.</li>
              <li>Keep your microphone and camera enabled.</li>
              <li>Prepare necessary documents for verification.</li>
              <li>Follow the questions and respond clearly.</li>
              <li>Be respectful and professional during the interaction.</li>
            </ol>
          </div>

          <div className="mt-8 bg-gray-700 opacity-95 rounded-2xl p-5">
            <p className="text-lg mb-4">
              <a href="#" className="text-blue-500 font-semibold inline-flex items-center space-x-2">
                <span>Click here</span>
                <FaExternalLinkAlt />
              </a>{" "}
              Follow the questions and respond clearly. Be respectful and professional during the interaction.
            </p>
          </div>

          <div className="mt-6 md:mt-8 flex justify-center">
            <button className="projectbutton" onClick={handleStartNow}>
              <span className="text-lg">Start Now</span>
              <FaArrowRight />
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-500 text-center mt-4">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
            }
