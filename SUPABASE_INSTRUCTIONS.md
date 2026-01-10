
You are ready to use Supabase as your production database!
1. Sign up at https://supabase.com
2. Create a new project.
3. In the project settings, find your Project URL and anon/public Key.
4. Add them to your `.env` file:
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key

Once added, the app will automatically switch from LocalStorage to Supabase for:
- Users (via `users` table)
- Rooms (via `rooms` table)
- Sessions (via `quiz_sessions` table)

(Note: You will need to create these tables in Supabase SQL Editor. See `SERVICES.md` or ask me to generate the SQL schema for Supabase specifically if you haven't already.)
