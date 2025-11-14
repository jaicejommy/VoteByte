import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle, AlertCircle, X } from "lucide-react";
import api from "../services/apiService";

const FaceVerification = ({ onVerify, onCancel, theme = "dark", electionId = null, onVerified = null, candidateId = null, candidateName = null }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectLoopRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [detectedFace, setDetectedFace] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

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
              const modelUrl = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

              await window.faceapi.nets.tinyFaceDetector.load(modelUrl);
              await window.faceapi.nets.faceLandmark68Net.load(modelUrl);
              await window.faceapi.nets.faceRecognitionNet.load(modelUrl);

              setIsModelsLoaded(true);
              setModelsLoading(false);
            } catch (modelErr) {
              console.error("Error loading models:", modelErr);
              setError("Failed to load face detection models. Please try again.");
              setModelsLoading(false);
            }
          };

          document.head.appendChild(script);
        } else {
          setIsModelsLoaded(true);
          setModelsLoading(false);
        }
      } catch (err) {
        console.error("Error loading face-api:", err);
        setError("Failed to load face detection. Please try again.");
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

  // Verify face against stored face
  const handleVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsVerifying(true);
    setError("");

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
        setIsVerifying(false);
        return;
      }

      // Convert canvas to blob
      const faceImageBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, "image/png");
      });

      // Send to backend for verification - use the correct endpoint with electionId
      const descriptor = Array.from(detection.descriptor);
      
      try {
        let response;
        
        if (electionId) {
          // Use authenticated API client for face-verify endpoint with electionId
          response = await api.post(`/votes/face-verify/${electionId}`, {
            face_descriptor: descriptor
          });
          
          const result = response.data;
          
          if (result.success) {
            setVerificationResult({
              success: true,
              message: result.message || "Face verified successfully!",
              distance: result.distance,
            });
            // Call onVerified callback after a short delay
            setTimeout(() => {
              if (onVerified) onVerified(result);
            }, 1500);
          } else {
            setVerificationResult({
              success: false,
              message: result.message || "Face verification failed. Please try again.",
              distance: result.distance,
            });
          }
        } else {
          // Fallback: send to generic verify-face endpoint
          response = await api.post('/votes/verify-face', {
            face_descriptor: descriptor
          });
          
          const result = response.data;
          
          if (result.verified) {
            setVerificationResult({
              success: true,
              message: result.message || "Face verified successfully!",
              distance: result.distance,
            });
            if (onVerify) onVerify(result);
          } else {
            setVerificationResult({
              success: false,
              message: result.message || "Face verification failed. Please try again.",
              distance: result.distance,
            });
          }
        }
      } catch (err) {
        console.error('Face verification API error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to verify face');
        setVerificationResult(null);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify face. Please try again.");
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  if (verificationResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed inset-0 flex justify-center items-center z-50 ${theme === "dark" ? "bg-black/50" : "bg-white/50"}`}
      >
        <motion.div
          className={`p-8 rounded-2xl max-w-sm w-full ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            {verificationResult.success ? (
              <>
                <CheckCircle size={32} className="text-green-500" />
                <h3 className={`text-xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                  Verified!
                </h3>
              </>
            ) : (
              <>
                <AlertCircle size={32} className="text-red-500" />
                <h3 className={`text-xl font-bold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                  Not Verified
                </h3>
              </>
            )}
          </div>

          <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            {verificationResult.message}
          </p>

          {verificationResult.distance && (
            <p className={`text-xs mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Distance: {verificationResult.distance.toFixed(4)}
            </p>
          )}

          {!verificationResult.success && (
            <button
              onClick={() => {
                setVerificationResult(null);
                setError("");
              }}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Try Again
            </button>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed inset-0 flex justify-center items-center z-50 ${theme === "dark" ? "bg-black/50" : "bg-white/50"}`}
    >
      <motion.div
        className={`p-6 rounded-2xl max-w-md w-full ${theme === "dark" ? "bg-gray-800 border border-green-500/30" : "bg-white border border-blue-300"}`}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${theme === "dark" ? "text-green-400" : "text-blue-600"}`}>
            <Camera size={20} />
            Face Verification
          </h3>
          <button
            onClick={onCancel}
            className={`p-1 rounded-lg hover:bg-opacity-10 ${theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-300"}`}
          >
            <X size={20} />
          </button>
        </div>

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
        <div className={`relative w-full rounded-lg overflow-hidden mb-4 ${theme === "dark" ? "bg-gray-900" : "bg-gray-200"}`} style={{ minHeight: "280px" }}>
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
            Face detected! Ready to verify.
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
          onClick={handleVerify}
          disabled={!detectedFace || !isCameraReady || !isModelsLoaded || isVerifying}
          className={`w-full py-3 px-4 rounded-lg font-bold transition ${
            detectedFace && isCameraReady && isModelsLoaded && !isVerifying
              ? theme === "dark"
                ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              : theme === "dark"
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gray-400 text-gray-300 cursor-not-allowed"
          }`}
        >
          {!isCameraReady ? "📹 Starting Camera..." : !isModelsLoaded ? "⚙️ Loading Models..." : isVerifying ? "🔄 Verifying..." : "✓ Verify Face"}
        </button>

        <p className={`text-xs mt-3 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          Position your face clearly in the camera frame for best results.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default FaceVerification;
