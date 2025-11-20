-------------------------------------------
-------------------------------------------
------------ Users Profiles ---------------
-------------------------------------------
-------------------------------------------


-------------------------------------------
-- Set User Profiles ----------------------
-------------------------------------------

--update public.profile set name='guest' where id=8;

--insert into public.profile (name) values ('guest2');

--select * from public.user

-------------------------------------------
-- Get User Profiles (by username) --------
-------------------------------------------

-- SELECT "profile".* FROM public."user_profile" up
-- 	INNER JOIN public."profile" ON up.id_profile = "profile".id
-- 	INNER JOIN public."user" u ON up.id_user = u.id
-- 	WHERE u.username = 'Bustos'




-------------------------------------------
-------------------------------------------
---- SCM (Subsystems Classes Methods) -----
-------------------------------------------
-------------------------------------------


-------------------------------------------
-- Get SCMs -------------------------------
-------------------------------------------

--SELECT s.id AS subsystem_id, s.name AS subsystem_name, c.id AS class_id, 
--	c.name AS class_name, m.id AS method_id, m.name AS method_name FROM public."subsystem" s 
-- 	JOIN public."subsystem_class" sc ON s.id = sc.id_subsystem 
-- 	JOIN public."class" c ON sc.id_class = c.id 
-- 	JOIN public."class_method" cm ON c.id = cm.id_class 
--	JOIN public."method" m ON cm.id_method = m.id





-------------------------------------------
-------------------------------------------
------------ Method queries ---------------
-------------------------------------------
-------------------------------------------


-------------------------------------------
-- Filter method by name ------------------
-------------------------------------------

--select * from method where name like '%Password' 
	-- and not 'val'


-------------------------------------------
-- Get tx / method / profile / class ------
-------------------------------------------

-- select t.tx, m.name from public.transaction t 
-- 	join public.method m on t.id_method = m.id 
-- 	where m.name like '%changeActive%'
	
-- select t.tx, m.name from public.transaction t 
-- 	join public.method m on t.id_method = m.id 
--	where t.tx = 2590

-- select p.id, p.name, m.id, m.name from public.method m 
-- 	join public.method_profile mp on mp.id_method = m.id
-- 	join public.profile p on mp.id_profile = p.id
-- 	where m.name like '%changeActive%'

-- select c.id, c.name, m.id, m.name from public.method m 
-- 	join public.class_method mc on mc.id_method = m.id
-- 	join public.class c on mc.id_class = c.id
-- 	where m.name like '%changeActive%'


-------------------------------------------
-- DEL tx / method / profile / class ------
-------------------------------------------

-- 2590

-- delete from public.transaction
-- 	where tx = 2590

-- delete from public.method_profile
-- 	where id_method = 2597

-- delete from public.class_method
-- 	where id_method = 2597

-- delete from public.method m
-- 	where m.name like '%changeActive%'





-------------------------------------------
-------------------------------------------
----- MOP (Menus Options Profiles) --------
-------------------------------------------
-------------------------------------------


-------------------------------------------
-- Get MOPs -------------------------------
-------------------------------------------

-- SELECT tx, m.id AS menu_id, m.name AS menu_name, o.id AS option_id, o.name 
-- 	AS option_name, p.id AS profile_id, p.name AS profile_name FROM 
-- 	public."menu" m JOIN public."option_menu" om ON m.id = om.id_menu 
-- 	JOIN public."option" o ON om.id_option = o.id 
-- 	JOIN public."option_profile" op ON o.id = op.id_option 
-- 	JOIN public."profile" p ON op.id_profile = p.id


-------------------------------------------
-- Get MOP (profile) ----------------------
-------------------------------------------

-- SELECT o.tx, m.id AS menu_id, m.name AS menu_name, o.id AS option_id, 
-- 	o.name AS option_name, p.id AS profile_id, p.name AS profile_name 
-- 	FROM public."menu" m 
-- 	JOIN public."option_menu" om ON m.id = om.id_menu 
-- 	JOIN public."option" o ON om.id_option = o.id 
-- 	JOIN public."option_profile" op ON o.id = op.id_option 
-- 	JOIN public."profile" p ON op.id_profile = p.id 
-- 	WHERE p.name = 'administrador de seguridad';


-------------------------------------------
-- SET MOP --------------------------------
-------------------------------------------

--select * from public.option where name like '%perfil activo%'
--select * from public.option_menu where id_option = 449;
--select * from public.option_profile where id_option = 449

--select * from public.option_profile op join public.option o on op.id_option = o.id where o.name like '%mi usuario%'
--select * from public.option_menu om join public.option o on om.id_option = o.id where o.name like '%mi usuario%'

