# SentinelX Deployment

## Local setup

1. Create a Supabase project.
2. Open the Supabase SQL editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Run `npm run dev`.

## Edge Function

Install the Supabase CLI, log in, then link your project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy generate-traffic
```

The function uses Supabase's built-in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
environment variables. Do not expose the service role key in the browser or in Vercel.

## Schedule Traffic Generation

In the Supabase dashboard:

1. Go to Edge Functions.
2. Open `generate-traffic`.
3. Add a scheduled trigger. Use every 10 to 15 seconds if your plan allows it.

If scheduled triggers in your Supabase project require cron syntax, use a one-minute
schedule for the free-tier-friendly demo:

```cron
* * * * *
```

For a faster demo, manually invoke the function a few times from the dashboard or CLI.

## Vercel

1. Push the repo to GitHub.
2. Create a new Vercel project from that repo.
3. Add the same public Supabase env vars in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Resume Framing

Say this clearly in interviews: the packet source is simulated because Vercel cannot
capture raw packets or modify the kernel firewall, but the auth, rule engine,
detection logic, realtime dashboard, and CSV export are real application logic.
