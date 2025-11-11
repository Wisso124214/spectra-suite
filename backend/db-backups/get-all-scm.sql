--select * from public.transaction;

SELECT t.tx,
s.name AS subsystem,
c.name AS class,
m.name AS method,
t.description
FROM "transaction" t
INNER JOIN subsystem s ON s.id = t.id_subsystem
INNER JOIN "class" c ON c.id = t.id_class
INNER JOIN method m ON m.id = t.id_method;