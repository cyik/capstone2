//This page is NOT used anymore btw //

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
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    faceapi.matchDimensions(canvas, { width: canvas.width, height: canvas.height });

    const interval = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const resized = faceapi.resizeResults(detections, { width: canvas.width, height: canvas.height });

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      resized.forEach(detection => {
        const box = detection.detection.box;
        const expressions = detection.expressions;
        const emotion = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );

        const drawBox = new faceapi.draw.DrawBox(box, {
          label: emotion.toUpperCase(),
          boxColor: "lime",
          lineWidth: 2
        });
        drawBox.draw(canvas);
      });
    }, 200);

    // Cleanup on unmount
    return () => clearInterval(interval);
  };

  return (
    <div className="flex justify-center mt-6">
  <div className="relative inline-block">
    <video
      ref={videoRef}
      autoPlay
      muted
      onPlay={handleVideoOnPlay}
      className="rounded-lg shadow-lg"
      width="640"
      height="480"
    />
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 rounded-lg"
    />
  </div>
</div>
  );
}

export default EmotionDetection;