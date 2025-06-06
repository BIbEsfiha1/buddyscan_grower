# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

This project uses [Material UI](https://mui.com/) for its base styling along with Tailwind utility classes.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Database Setup

Run the SQL script in `supabase/diary_entries.sql` on your Supabase project to
create the `diary_entries` table used by the Netlify functions. This script also
enables the `uuid-ossp` extension required for `uuid_generate_v4()`.

Make sure your Netlify environment has the variables `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` configured with your project's details so the
functions can connect to Supabase.

Para uma descrição completa da interface em português, consulte [docs/INTERFACE_COMPLETA_PT_BR.md](docs/INTERFACE_COMPLETA_PT_BR.md).
