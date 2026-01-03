# 🚀 WooInsight AI – Setup Guide

## 🔑 Step 1: Configure
1. Rename `.env.example` → `.env.local`
2. Fill all values:
   - Get `NEXTAUTH_SECRET` from https://generate-secret.vercel.app/32
   - Get WooCommerce keys from: **WooCommerce > Settings > Advanced > REST API**
   - Get `DASHSCOPE_API_KEY` from https://dashscope.console.aliyun.com/apiKey
   - Get `DATABASE_URL` from [Neon.tech](https://neon.tech) (free)

## 🛠️ Step 2: Run Locally
```bash
npm install
npm run dev
```
Visit: http://localhost:3000

## ☁️ Step 3: Deploy to Vercel
1. Push this folder to GitHub
2. Go to https://vercel.com/new
3. Import repo
4. Add all env vars
5. Deploy!
```

