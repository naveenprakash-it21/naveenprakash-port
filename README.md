# Naveen Prakash S — Portfolio

Static portfolio website with a Vercel serverless contact endpoint.

## Project structure

```text
api/
  contact.js
public/
  css/
    styles.css
  js/
    main.js
  index.html
.env.example
package.json
```

Vercel serves files from `public/` and deploys functions from `api/`.

## Local development

1. Use Node.js 20.19 or newer and install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add the Gmail address and Google App
   Password. Never commit or share `.env.local`.
3. Run `npm start` (or `npx vercel dev`) and open the local URL it prints. Do
   not add a `dev` script that runs `vercel dev`; that makes Vercel invoke itself.
   If recursive invocation persists, clear the Vercel project's custom
   Development Command in Project Settings.

Required Vercel environment variables:

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`

## Code quality

- `npm run lint` checks the JavaScript API and browser code with ESLint.
- `npm run format` formats the project with Prettier.
- `npm run format:check` checks formatting without changing files.
