#!/bin/bash
# Script to download required face-api.js model files into the models directory with subdirectories

mkdir -p models/ssd_mobilenetv1
mkdir -p models/face_landmark_68
mkdir -p models/face_recognition

cd models/ssd_mobilenetv1
curl -O https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-weights_manifest.json
curl -O https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-shard1
curl -O https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-shard2

cd ../face_landmark_68
curl -O https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1

cd ../face_recognition
curl -O https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-weights_manifest.json
curl -O https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard1
curl -O https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard2

echo "Download complete. All model files are saved in the 'models' directory."
