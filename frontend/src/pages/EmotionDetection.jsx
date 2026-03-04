import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

function EmotionDetection() {
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    // Load models first, then start webcam
    loadModels().then(startVideo);
  }, []);

  const loadModels = async () => {
    const MODEL_URL = "/models";

    // Load the tiny face detector & face expression models
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Error accessing webcam:", err));
  };

  const handleVideoOnPlay = () => {
    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    canvasRef.current.innerHTML = "";
    canvasRef.current.append(canvas);

    const displaySize = {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight
    };

    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const resized = faceapi.resizeResults(detections, displaySize);

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      resized.forEach(detection => {
        const box = detection.detection.box;
        const expressions = detection.expressions;
        const emotion = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );

        // Draw green box + emotion label
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: emotion.toUpperCase(),
          boxColor: "lime"
        });
        drawBox.draw(canvas);
      });
    }, 200); // every 200ms
  };

  return (
    <div className="relative flex justify-center mt-6">
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={handleVideoOnPlay}
        className="rounded-lg shadow-lg"
        width="640"
        height="480"
      />
      <div ref={canvasRef} className="absolute top-0 left-0" />
    </div>
  );
}

export default EmotionDetection;