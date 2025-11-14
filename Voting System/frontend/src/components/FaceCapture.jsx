import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle, AlertCircle } from "lucide-react";

const FaceCapture = ({ onCapture, theme = "dark" }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectLoopRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [detectedFace, setDetectedFace] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [error, setError] = useState("");
  const [faceData, setFaceData] = useState(null);

  // Start camera immediately without waiting for models
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 480 },
            height: { ideal: 360 },
            facingMode: "user"
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => {
              setIsCameraReady(true);
              setLoading(false);
            }).catch(err => {
              console.error("Play error:", err);
              setError("Failed to start video stream.");
              setLoading(false);
            });
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        if (err.name === "NotAllowedError") {
          setError("Camera permission denied. Please enable camera access.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else {
          setError("Unable to access camera. Please check permissions and try again.");
        }
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      if (detectLoopRef.current) {
        cancelAnimationFrame(detectLoopRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Load face-api models on mount (in parallel with camera)
  useEffect(() => {
    const loadModels = async () => {
      try {
        setModelsLoading(true);
        setError("");

        if (!window.faceapi) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
          script.async = true;

          script.onerror = () => {
            setError("Failed to load face detection library from CDN. Check your internet connection.");
            setModelsLoading(false);
          };

          script.onload = async () => {
            try {
              // Load models from CDN
              const modelUrl = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

              await window.faceapi.nets.tinyFaceDetector.load(modelUrl);
              await window.faceapi.nets.faceLandmark68Net.load(modelUrl);
              await window.faceapi.nets.faceRecognitionNet.load(modelUrl);

              setIsModelsLoaded(true);
              setModelsLoading(false);
            } catch (modelErr) {
              console.error("Error loading models:", modelErr);
              setError("Failed to load face detection models. Please refresh the page.");
              setModelsLoading(false);
            }
          };

          document.head.appendChild(script);
        } else {
          // face-api already loaded
          setIsModelsLoaded(true);
          setModelsLoading(false);
        }
      } catch (err) {
        console.error("Error loading face-api:", err);
        setError("Failed to load face detection. Please refresh the page.");
        setModelsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Start face detection loop once models are loaded
  useEffect(() => {
    if (!isModelsLoaded || !isCameraReady) return;

    const startDetectionLoop = () => {
      const detectLoop = async () => {
        try {
          if (videoRef.current && window.faceapi) {
            const detection = await window.faceapi
              .detectSingleFace(videoRef.current, new window.faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detection) {
              setDetectedFace(true);
            } else {
              setDetectedFace(false);
            }
          }
        } catch (err) {
          console.error("Detection error:", err);
        }

        detectLoopRef.current = requestAnimationFrame(detectLoop);
      };

      detectLoopRef.current = requestAnimationFrame(detectLoop);
    };

    startDetectionLoop();

    return () => {
      if (detectLoopRef.current) {
        cancelAnimationFrame(detectLoopRef.current);
      }
    };
  }, [isModelsLoaded, isCameraReady]);

  // Capture face photo
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      ctx.drawImage(videoRef.current, 0, 0);

      // Get face descriptor
      const detection = await window.faceapi
        .detectSingleFace(videoRef.current, new window.faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError("No face detected. Please ensure your face is clearly visible.");
        return;
      }

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        const faceDataObj = {
          image: blob,
          descriptor: Array.from(detection.descriptor), // Convert Float32Array to Array
          timestamp: new Date().toISOString(),
        };

        setFaceData(faceDataObj);
        onCapture(faceDataObj);
      }, "image/png");
    } catch (err) {
      console.error("Capture error:", err);
      setError("Failed to capture face. Please try again.");
    }
  };

  const handleRetake = () => {
    setFaceData(null);
    setDetectedFace(false);
    setError("");
  };

  if (faceData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-6 rounded-lg border-2 ${theme === "dark" ? "bg-gray-800 border-green-500" : "bg-blue-50 border-blue-500"}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={24} className={theme === "dark" ? "text-green-500" : "text-blue-500"} />
          <h3 className={`text-lg font-bold ${theme === "dark" ? "text-green-400" : "text-blue-600"}`}>
            Face Captured Successfully!
          </h3>
        </div>
        <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          Your face has been captured and will be stored with your account for verification during voting.
        </p>
        <button
          onClick={handleRetake}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
            theme === "dark"
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-yellow-500 hover:bg-yellow-600 text-white"
          }`}
        >
          Retake Photo
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg border-2 ${theme === "dark" ? "bg-gray-800 border-green-500/30" : "bg-blue-50 border-blue-300"}`}
    >
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === "dark" ? "text-green-400" : "text-blue-600"}`}>
        <Camera size={20} />
        Capture Your Face
      </h3>

      {/* Models Loading Indicator */}
      {modelsLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${theme === "dark" ? "bg-yellow-900/30 border border-yellow-500" : "bg-yellow-100 border border-yellow-500"}`}
        >
          <div className="animate-spin">
            <Camera size={16} className={theme === "dark" ? "text-yellow-500" : "text-yellow-600"} />
          </div>
          <p className={`text-sm ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}>
            Loading face detection models...
          </p>
        </motion.div>
      )}

      {/* Video Display - Always visible when camera is ready */}
      <div className={`relative w-full rounded-lg overflow-hidden mb-4 ${theme === "dark" ? "bg-gray-900" : "bg-gray-200"}`} style={{ minHeight: "300px" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ display: isCameraReady ? "block" : "none" }}
        />
        
        {/* Loading message when camera not yet ready */}
        {!isCameraReady && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin mb-2">
                <Camera size={32} className={theme === "dark" ? "text-green-500" : "text-blue-500"} />
              </div>
              <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>Starting camera...</p>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex items-start gap-2 mb-4 p-3 rounded-lg ${theme === "dark" ? "bg-red-900/30 border border-red-500" : "bg-red-100 border border-red-500"}`}
        >
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className={`text-sm ${theme === "dark" ? "text-red-300" : "text-red-700"}`}>{error}</p>
        </motion.div>
      )}

      {isModelsLoaded && detectedFace && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm mb-4 flex items-center gap-2 ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
        >
          <CheckCircle size={16} />
          Face detected! Ready to capture.
        </motion.p>
      )}

      {isModelsLoaded && !detectedFace && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm mb-4 flex items-center gap-2 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}
        >
          Position your face clearly in the camera frame...
        </motion.p>
      )}

      <button
        onClick={handleCapture}
        disabled={!detectedFace || !isCameraReady || !isModelsLoaded}
        className={`w-full py-3 px-4 rounded-lg font-bold transition ${
          detectedFace && isCameraReady && isModelsLoaded
            ? theme === "dark"
              ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            : theme === "dark"
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-gray-400 text-gray-300 cursor-not-allowed"
        }`}
      >
        {!isCameraReady ? "📹 Starting Camera..." : !isModelsLoaded ? "⚙️ Loading Models..." : "📸 Capture Face"}
      </button>

      <p className={`text-xs mt-3 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        Position your face clearly in the camera frame and ensure good lighting.
      </p>
    </motion.div>
  );
};

export default FaceCapture;
