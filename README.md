# MovieGPT - Deploy plan

Structure:
  index.html, style.css, app.js, package.json
  api/chat.js   (API key sirf yahan, server side)

Env variables (Vercel > Settings > Environment Variables, Production tick):
  GEMINI_API_KEY = your key (aistudio.google.com/apikey)
  GEMINI_MODEL   = e.g. gemini-2.5-flash
  USE_SEARCH     = true   (optional, fresh movie/OTT info)

Deploy:
  1. GitHub pe naya repo banao, ye sab files push karo.
  2. vercel.com > Add New > Project > repo import > Deploy.
  3. Env variables add karke Redeploy karo.
  4. Site kholo, "Pushpa 2 ki story batao" try karo.

Errors: Vercel > Logs aur browser F12 > Network > /api/chat dekho.
