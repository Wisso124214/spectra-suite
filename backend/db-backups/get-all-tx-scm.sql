SELECT t.tx,
STRING_AGG(DISTINCT p.name, ', ') AS profiles,
s.name AS subsystem,
c.name AS class,
m.name AS method,
t.description
FROM "transaction" t
INNER JOIN subsystem s ON s.id = t.id_subsystem
INNER JOIN "class" c ON c.id = t.id_class
INNER JOIN method m ON m.id = t.id_method
LEFT JOIN method_profile mp ON mp.id_method = m.id
LEFT JOIN profile p ON p.id = mp.id_profile
GROUP BY t.tx, t.description, s.name, c.name, m.name
ORDER BY t.tx;