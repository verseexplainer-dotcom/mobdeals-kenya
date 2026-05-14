# Supabase Rules

- Use Supabase Storage only for media.
- Never expose service role keys in client-side code.
- Public client code may only use public anon credentials.
- Keep storage bucket names centralized in config.
- Validate missing environment variables with clear errors.
