--DELETE FROM public.user WHERE id = 31;
--select * from public.user

delete FROM public.user_profile WHERE id IN (40, 41);

SELECT u.id, u.username, up.*, p.id, p.name 
FROM public.user u
LEFT JOIN public.user_profile up ON u.id = up.id_user
LEFT JOIN public.profile p ON up.id_profile = p.id;


--insert into public.user_profile (id_user, id_profile)
--values (34, 2)
