#!/bin/bash
# Kör detta en gång för att sätta alla miljövariabler i Vercel
# Krav: vercel CLI installerad (npm i -g vercel) och inloggad (vercel login)

vercel env add VITE_FIREBASE_API_KEY production <<< "AIzaSyAoxcHZZHnLFnl5i9ngF9LvYekjVef3AD0"
vercel env add VITE_FIREBASE_AUTH_DOMAIN production <<< "manadsblad-2aafd.firebaseapp.com"
vercel env add VITE_FIREBASE_PROJECT_ID production <<< "manadsblad-2aafd"
vercel env add VITE_FIREBASE_STORAGE_BUCKET production <<< "manadsblad-2aafd.firebasestorage.app"
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production <<< "942783898702"
vercel env add VITE_FIREBASE_APP_ID production <<< "1:942783898702:web:eb9e75d02987cf11ef8f1f"

echo "✅ Alla Firebase-miljövariabler tillagda i Vercel!"
echo "Kör nu: vercel --prod"
