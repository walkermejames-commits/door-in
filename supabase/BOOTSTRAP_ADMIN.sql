-- Run once after signing up the first platform administrator.
-- Replace the UUID with that user's auth.users.id from the Supabase dashboard.
-- Never expose this value or run it from the browser.

insert into public.users (id, role, email, full_name)
values ('REPLACE_WITH_AUTH_USER_UUID', 'admin', 'REPLACE_WITH_ADMIN_EMAIL', 'Platform administrator')
on conflict (id) do update set role = 'admin';
