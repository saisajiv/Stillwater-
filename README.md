# Stillwater with GitHub sign-in

A meditation app. Visitors sign in with GitHub before the app loads. Each person's
sessions, minutes and streak are saved under their GitHub username (in their browser).

## Set it up

1. **Put the project on GitHub**, then import the repo at vercel.com (or run `vercel` from this folder).
2. **Create a GitHub OAuth app**: GitHub > Settings > Developer settings > OAuth Apps > New OAuth App.
   - Homepage URL: `https://YOUR-APP.vercel.app`
   - Authorization callback URL: `https://YOUR-APP.vercel.app/api/callback`
3. Copy the **Client ID**, then click **Generate a new client secret** and copy it.
4. In Vercel, open the project > Settings > Environment Variables and add:

   | Name | Value |
   | --- | --- |
   | `GITHUB_CLIENT_ID` | your client ID |
   | `GITHUB_CLIENT_SECRET` | your client secret |
   | `SESSION_SECRET` | a long random string, for example the output of `openssl rand -hex 32` |
   | `ALLOWED_USERS` | optional, e.g. `alice,bob` to let only those GitHub users in |
   | `BASE_URL` | optional, only if you use a custom domain, e.g. `https://stillwater.example.com` |

5. Redeploy. Open your URL and press **Continue with GitHub**.

## Run it locally

GitHub allows one callback URL per OAuth app, so create a second OAuth app for local use
with the callback `http://localhost:3000/api/callback`. Put its values in a `.env` file,
then run `npx vercel dev`.

## How it works

- `api/login.js` sends the visitor to GitHub with a random `state` value.
- `api/callback.js` checks the state, trades the code for a token (using your secret,
  which never reaches the browser), reads the GitHub profile, and sets a signed,
  HTTP-only session cookie that lasts 7 days.
- `api/index.js` serves `private/app.html` only to signed-in visitors.
- `api/logout.js` clears the cookie. `api/me.js` returns the signed-in user.

## Good to know

- The music files in `public/music` are plain static files. The page is gated, but
  anyone who knows a file's address can still fetch it. That is fine for royalty-free
  tracks, but don't put private audio there.
- Progress is stored in each person's browser, so it does not follow them to a new device.
  To sync across devices, add a database such as Vercel KV or Supabase and save sessions
  by GitHub user id.
- Keep credit for the artists (Pufino, Guillermo Guareschi, Alegend, Johny Grimes,
  Aylex, Bluewave, from freetouse.com) in the app.
