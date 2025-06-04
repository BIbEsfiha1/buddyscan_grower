# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Database Setup

Run the SQL script in `supabase/diary_entries.sql` on your Supabase project to
create the `users_netlify` and `diary_entries` tables used by the Netlify
functions.  Deploy the `identity-signup` Netlify function so new users are
automatically saved in `users_netlify`.

If you already have diary entries, run `supabase/migrate_existing_users.sql` to
populate `users_netlify` with any missing user IDs.
