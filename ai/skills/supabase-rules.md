# Supabase Rules

- Use Supabase free tier for data and media.
- Use Supabase Storage public buckets for product media.
- Never expose service role keys in client-side code.
- Public client code may only use public anon credentials.
- Keep storage bucket names centralized in config.
- Validate missing environment variables with clear errors.
