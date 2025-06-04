-- Populate users_netlify with distinct user IDs found in diary_entries
insert into users_netlify(id)
select distinct user_id
from diary_entries
where not exists (
  select 1 from users_netlify u where u.id = diary_entries.user_id
);
