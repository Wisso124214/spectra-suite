--
-- PostgreSQL database dump
--

\restrict d2rKcyPZ0vHJqRscXVTwCbGUdk1twHBRQVmsgd89AD3ILTizpXqELgTtHezAafR

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-07 00:50:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5077 (class 1262 OID 16388)
-- Name: web2db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE web2db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Spain.1252';


ALTER DATABASE web2db OWNER TO postgres;

\unrestrict d2rKcyPZ0vHJqRscXVTwCbGUdk1twHBRQVmsgd89AD3ILTizpXqELgTtHezAafR
\connect web2db
\restrict d2rKcyPZ0vHJqRscXVTwCbGUdk1twHBRQVmsgd89AD3ILTizpXqELgTtHezAafR

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 227 (class 1259 OID 16460)
-- Name: class; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class (
    id integer CONSTRAINT class_id_class_not_null NOT NULL,
    name character varying(30) NOT NULL,
    description character varying(200)
);


ALTER TABLE public.class OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16459)
-- Name: class_id_class_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.class_id_class_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.class_id_class_seq OWNER TO postgres;

--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 226
-- Name: class_id_class_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.class_id_class_seq OWNED BY public.class.id;


--
-- TOC entry 246 (class 1259 OID 24739)
-- Name: class_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_method (
    id integer NOT NULL,
    id_class integer NOT NULL,
    id_method integer NOT NULL
);


ALTER TABLE public.class_method OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 24738)
-- Name: class_method_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.class_method_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.class_method_id_seq OWNER TO postgres;

--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 245
-- Name: class_method_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.class_method_id_seq OWNED BY public.class_method.id;


--
-- TOC entry 231 (class 1259 OID 16498)
-- Name: menu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu (
    id integer CONSTRAINT menu_id_menu_not_null NOT NULL,
    id_subsystem integer NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(200),
    id_parent integer
);


ALTER TABLE public.menu OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16497)
-- Name: menu_id_menu_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_id_menu_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_id_menu_seq OWNER TO postgres;

--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 230
-- Name: menu_id_menu_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_id_menu_seq OWNED BY public.menu.id;


--
-- TOC entry 229 (class 1259 OID 16481)
-- Name: method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.method (
    id integer CONSTRAINT method_id_method_not_null NOT NULL,
    name character varying(30) NOT NULL,
    description character varying(200)
);


ALTER TABLE public.method OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16480)
-- Name: method_id_method_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.method_id_method_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.method_id_method_seq OWNER TO postgres;

--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 228
-- Name: method_id_method_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.method_id_method_seq OWNED BY public.method.id;


--
-- TOC entry 236 (class 1259 OID 16572)
-- Name: method_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.method_profile (
    id integer CONSTRAINT method_profile_id_method_profile_not_null NOT NULL,
    id_method integer NOT NULL,
    id_profile integer NOT NULL
);


ALTER TABLE public.method_profile OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16571)
-- Name: method_profile_id_method_profile_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.method_profile_id_method_profile_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.method_profile_id_method_profile_seq OWNER TO postgres;

--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 235
-- Name: method_profile_id_method_profile_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.method_profile_id_method_profile_seq OWNED BY public.method_profile.id;


--
-- TOC entry 238 (class 1259 OID 24636)
-- Name: option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.option (
    id integer NOT NULL,
    name character varying(80) NOT NULL,
    description character varying(200),
    tx integer NOT NULL
);


ALTER TABLE public.option OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 24635)
-- Name: option_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.option_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.option_id_seq OWNER TO postgres;

--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 237
-- Name: option_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.option_id_seq OWNED BY public.option.id;


--
-- TOC entry 242 (class 1259 OID 24693)
-- Name: option_menu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.option_menu (
    id integer NOT NULL,
    id_menu integer NOT NULL,
    id_option integer NOT NULL
);


ALTER TABLE public.option_menu OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 24692)
-- Name: option_menu_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.option_menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.option_menu_id_seq OWNER TO postgres;

--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 241
-- Name: option_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.option_menu_id_seq OWNED BY public.option_menu.id;


--
-- TOC entry 240 (class 1259 OID 24663)
-- Name: option_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.option_profile (
    id integer NOT NULL,
    id_option integer NOT NULL,
    id_profile integer NOT NULL
);


ALTER TABLE public.option_profile OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 24662)
-- Name: option_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.option_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.option_profile_id_seq OWNER TO postgres;

--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 239
-- Name: option_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.option_profile_id_seq OWNED BY public.option_profile.id;


--
-- TOC entry 222 (class 1259 OID 16405)
-- Name: profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile (
    id integer CONSTRAINT profile_id_profile_not_null NOT NULL,
    name character varying(30) NOT NULL,
    description character varying(300)
);


ALTER TABLE public.profile OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16404)
-- Name: profile_id_profile_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profile_id_profile_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profile_id_profile_seq OWNER TO postgres;

--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 221
-- Name: profile_id_profile_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profile_id_profile_seq OWNED BY public.profile.id;


--
-- TOC entry 225 (class 1259 OID 16449)
-- Name: subsystem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subsystem (
    id integer CONSTRAINT subsystem_id_subsystem_not_null NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(300)
);


ALTER TABLE public.subsystem OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 24719)
-- Name: subsystem_class; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subsystem_class (
    id integer NOT NULL,
    id_subsystem integer NOT NULL,
    id_class integer NOT NULL
);


ALTER TABLE public.subsystem_class OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 24718)
-- Name: subsystem_class_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subsystem_class_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subsystem_class_id_seq OWNER TO postgres;

--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 243
-- Name: subsystem_class_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subsystem_class_id_seq OWNED BY public.subsystem_class.id;


--
-- TOC entry 224 (class 1259 OID 16448)
-- Name: subsystem_id_subsystem_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subsystem_id_subsystem_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subsystem_id_subsystem_seq OWNER TO postgres;

--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 224
-- Name: subsystem_id_subsystem_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subsystem_id_subsystem_seq OWNED BY public.subsystem.id;


--
-- TOC entry 233 (class 1259 OID 16515)
-- Name: transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction (
    tx integer CONSTRAINT transaction_id_transaction_not_null NOT NULL,
    id_subsystem integer NOT NULL,
    id_class integer NOT NULL,
    id_method integer NOT NULL,
    description character varying(200)
);


ALTER TABLE public.transaction OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16514)
-- Name: transaction_id_transaction_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaction_id_transaction_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaction_id_transaction_seq OWNER TO postgres;

--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 232
-- Name: transaction_id_transaction_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaction_id_transaction_seq OWNED BY public.transaction.tx;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer CONSTRAINT user_id_username_not_null NOT NULL,
    username character varying(30) NOT NULL,
    password character varying(80) NOT NULL,
    email character varying(100) NOT NULL,
    register_date date NOT NULL,
    status character varying(10) NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: user_id_username_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_username_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_username_seq OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 219
-- Name: user_id_username_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_username_seq OWNED BY public."user".id;


--
-- TOC entry 223 (class 1259 OID 16415)
-- Name: user_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile (
    id_user integer NOT NULL,
    id_profile integer NOT NULL,
    id integer CONSTRAINT user_profile_id_user_profile_not_null NOT NULL
);


ALTER TABLE public.user_profile OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16563)
-- Name: user_profile_id_user_profile_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_profile_id_user_profile_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profile_id_user_profile_seq OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 234
-- Name: user_profile_id_user_profile_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_profile_id_user_profile_seq OWNED BY public.user_profile.id;


--
-- TOC entry 4824 (class 2604 OID 16463)
-- Name: class id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class ALTER COLUMN id SET DEFAULT nextval('public.class_id_class_seq'::regclass);


--
-- TOC entry 4833 (class 2604 OID 24742)
-- Name: class_method id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_method ALTER COLUMN id SET DEFAULT nextval('public.class_method_id_seq'::regclass);


--
-- TOC entry 4826 (class 2604 OID 16501)
-- Name: menu id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu ALTER COLUMN id SET DEFAULT nextval('public.menu_id_menu_seq'::regclass);


--
-- TOC entry 4825 (class 2604 OID 16484)
-- Name: method id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method ALTER COLUMN id SET DEFAULT nextval('public.method_id_method_seq'::regclass);


--
-- TOC entry 4828 (class 2604 OID 16575)
-- Name: method_profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_profile ALTER COLUMN id SET DEFAULT nextval('public.method_profile_id_method_profile_seq'::regclass);


--
-- TOC entry 4829 (class 2604 OID 24639)
-- Name: option id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option ALTER COLUMN id SET DEFAULT nextval('public.option_id_seq'::regclass);


--
-- TOC entry 4831 (class 2604 OID 24696)
-- Name: option_menu id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_menu ALTER COLUMN id SET DEFAULT nextval('public.option_menu_id_seq'::regclass);


--
-- TOC entry 4830 (class 2604 OID 24666)
-- Name: option_profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_profile ALTER COLUMN id SET DEFAULT nextval('public.option_profile_id_seq'::regclass);


--
-- TOC entry 4821 (class 2604 OID 16408)
-- Name: profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile ALTER COLUMN id SET DEFAULT nextval('public.profile_id_profile_seq'::regclass);


--
-- TOC entry 4823 (class 2604 OID 16452)
-- Name: subsystem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem ALTER COLUMN id SET DEFAULT nextval('public.subsystem_id_subsystem_seq'::regclass);


--
-- TOC entry 4832 (class 2604 OID 24722)
-- Name: subsystem_class id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem_class ALTER COLUMN id SET DEFAULT nextval('public.subsystem_class_id_seq'::regclass);


--
-- TOC entry 4827 (class 2604 OID 16518)
-- Name: transaction tx; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction ALTER COLUMN tx SET DEFAULT nextval('public.transaction_id_transaction_seq'::regclass);


--
-- TOC entry 4820 (class 2604 OID 16393)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_username_seq'::regclass);


--
-- TOC entry 4822 (class 2604 OID 16564)
-- Name: user_profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile ALTER COLUMN id SET DEFAULT nextval('public.user_profile_id_user_profile_seq'::regclass);


--
-- TOC entry 5052 (class 0 OID 16460)
-- Dependencies: 227
-- Data for Name: class; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class (id, name, description) FROM stdin;
106	dbms	Gestión de la base de datos
107	security	security
108	session	Gestión de sesiones de usuario
109	sessionManager	Gestión de sesiones
110	mailer	Servicio de envío de correos electrónicos
111	tokenizer	Servicio de generación y verificación de tokens
112	validator	Servicio de validación de datos
113	formatter	Servicio de conversión de formatos de datos
114	utils	Utilidades generales
\.


--
-- TOC entry 5071 (class 0 OID 24739)
-- Dependencies: 246
-- Data for Name: class_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class_method (id, id_class, id_method) FROM stdin;
421	106	394
422	106	395
423	106	396
424	106	397
425	106	398
426	106	399
427	106	400
428	106	401
429	106	402
430	106	403
431	106	404
432	106	405
433	106	406
434	106	407
435	106	408
436	106	409
437	108	410
438	108	411
439	108	412
440	108	413
441	108	414
442	108	415
443	109	416
444	109	417
445	109	418
446	109	419
447	109	420
448	109	421
449	110	422
450	110	423
451	111	424
452	111	425
453	112	426
454	112	427
455	112	428
456	112	429
457	112	430
458	112	431
459	112	432
460	113	433
461	113	434
462	113	435
463	114	436
464	114	437
465	114	438
\.


--
-- TOC entry 5056 (class 0 OID 16498)
-- Dependencies: 231
-- Data for Name: menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu (id, id_subsystem, name, description, id_parent) FROM stdin;
98	60	Gestión de Perfiles	Gestión de Perfiles de Usuario y sus Permisos	\N
99	60	Mantenimiento de Perfiles	Crear, Actualizar, Eliminar y Listar Perfiles	98
100	60	Gestión de Opciones a Perfiles	Asignar y Remover Permisos de Opciones a Perfiles	98
101	60	Gestión de Usuarios	Crear, Actualizar, Eliminar y Listar Usuarios	\N
\.


--
-- TOC entry 5054 (class 0 OID 16481)
-- Dependencies: 229
-- Data for Name: method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.method (id, name, description) FROM stdin;
394	query	Realiza una consulta en la base de datos
395	insert	Inserta datos en la base de datos
396	updateById	Actualiza datos por ID
397	updateByUsername	Actualiza datos por nombre de usuario
398	deleteById	Elimina datos por ID
399	deleteByUsername	Elimina datos por nombre de usuario
400	get	Obtiene todos los datos de una tabla
401	getWhere	Obtiene datos filtrados por condiciones
402	deleteAll	Elimina todos los datos de una tabla
403	executeNamedQuery	Ejecuta una consulta nombrada predefinida
404	executeJsonNamedQuery	Ejecuta una serie de consultas nombradas predefinidas, pasándole los parámetros como valores de las keys ({ namedQuery: [params] })
405	beginTransaction	Inicia una transacción en la base de datos
406	commitTransaction	Confirma una transacción en la base de datos
407	rollbackTransaction	Revierte una transacción en la base de datos
408	endTransaction	Finaliza una transacción en la base de datos
409	executeJsonTransaction	Ejecuta una serie de consultas dentro de una transacción, pasándole los parámetros como valores de las keys ({ query: [params] })
410	init	Inicializa el sistema de sesiones
411	login	Inicia sesión para un usuario
412	register	Registra un nuevo usuario
413	changeActiveProfile	Cambia el perfil activo del usuario
414	forgotPassword	Inicia el proceso de recuperación de contraseña
415	resetPassword	Restablece la contraseña del usuario
416	createAndUpdateSession	Crea y actualiza la sesión del usuario
417	createSession	Crea una nueva sesión
418	updateSession	Actualiza los datos de la sesión
419	destroySession	Destruye la sesión actual
420	getSession	Obtiene los datos de la sesión
421	existSession	Verifica si existe una sesión activa
422	sendEmail	Envía un correo electrónico
423	sendRecoveryEmail	Envía un correo electrónico de recuperación
424	generateToken	Genera un nuevo token
425	verifyToken	Verifica un token existente
426	validateUsername	Valida un nombre de usuario
427	validateEmail	Valida un correo electrónico
428	validatePassword	Valida una contraseña
429	validateConfirmPassword	Valida la confirmación de la contraseña
430	getValidationValues	Obtiene los valores de validación
431	validateName	Valida un nombre
432	validateDescription	Valida una descripción
433	formatObjectParams	Convierte parámetros de objeto
434	formatArrayParams	Convierte parámetros de array
435	structureToOrderedArray	Convierte estructura a array ordenado
436	toUpperCaseFirstLetter	Convierte la primera letra a mayúscula
437	getAllDinamicMethodNames	Obtiene todos los nombres de métodos dinámicos
438	handleError	Maneja errores personalizados
\.


--
-- TOC entry 5061 (class 0 OID 16572)
-- Dependencies: 236
-- Data for Name: method_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.method_profile (id, id_method, id_profile) FROM stdin;
764	394	10
765	394	11
766	394	1
767	395	10
768	395	11
769	396	10
770	396	11
771	397	10
772	397	11
773	398	10
774	398	11
775	399	10
776	399	11
777	400	10
778	400	11
779	401	10
780	401	11
781	402	10
782	402	11
783	403	10
784	403	11
785	403	1
786	404	10
787	404	11
788	404	1
789	405	10
790	405	11
791	406	10
792	406	11
793	407	10
794	407	11
795	408	10
796	408	11
797	409	10
798	409	11
799	410	10
800	410	1
801	411	10
802	411	1
803	411	11
804	411	2
805	411	3
806	412	10
807	412	1
808	412	11
809	412	2
810	412	3
811	413	10
812	413	1
813	413	11
814	413	2
815	413	3
816	414	10
817	414	1
818	414	11
819	414	2
820	414	3
821	415	10
822	415	1
823	415	11
824	415	2
825	415	3
826	416	10
827	416	11
828	417	10
829	417	11
830	418	10
831	418	11
832	419	10
833	419	11
834	420	10
835	420	11
836	421	10
837	421	11
838	422	10
839	422	11
840	422	1
841	422	2
842	422	3
843	423	10
844	423	1
845	423	11
846	423	2
847	423	3
848	424	10
849	424	11
850	424	1
851	425	10
852	425	11
853	425	1
854	426	10
855	426	11
856	426	1
857	427	10
858	427	11
859	427	1
860	428	10
861	428	11
862	428	1
863	429	10
864	429	11
865	429	1
866	430	10
867	430	11
868	430	1
869	431	10
870	431	11
871	431	1
872	432	10
873	432	11
874	432	1
875	433	10
876	434	10
877	435	10
878	436	10
879	436	11
880	436	1
881	437	10
882	437	11
883	437	1
884	438	10
885	438	11
886	438	1
\.


--
-- TOC entry 5063 (class 0 OID 24636)
-- Dependencies: 238
-- Data for Name: option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.option (id, name, description, tx) FROM stdin;
95	Crear Perfil	Crear un nuevo Perfil de Usuario	393
96	Actualizar Perfil	Actualizar un Perfil de Usuario existente	394
97	Eliminar Perfil	Eliminar un Perfil de Usuario existente	396
98	Listar Perfiles	Listar todos los Perfiles de Usuario	398
99	Asignar Permiso de Opción a Perfil	Asignar un Permiso de Opción a un Perfil	401
100	Cambiar perfil activo	Cambiar el perfil activo de un Usuario	411
\.


--
-- TOC entry 5067 (class 0 OID 24693)
-- Dependencies: 242
-- Data for Name: option_menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.option_menu (id, id_menu, id_option) FROM stdin;
133	99	95
134	99	96
135	99	97
136	99	98
137	100	99
138	101	100
139	101	96
140	101	95
141	101	97
142	101	98
\.


--
-- TOC entry 5065 (class 0 OID 24663)
-- Dependencies: 240
-- Data for Name: option_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.option_profile (id, id_option, id_profile) FROM stdin;
242	95	10
243	95	1
244	95	11
245	96	10
246	96	1
247	96	11
248	97	10
249	97	1
250	97	11
251	98	10
252	98	1
253	98	11
254	99	10
255	99	1
256	100	10
257	100	1
258	100	11
259	100	2
260	100	3
261	96	2
262	96	3
\.


--
-- TOC entry 5047 (class 0 OID 16405)
-- Dependencies: 222
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile (id, name, description) FROM stdin;
1	administrador de seguridad	\N
2	administrador de eventos	\N
3	participante	\N
9	guest2	\N
8	guest	guest
10	super administrador	\N
11	administrador de base de datos	\N
12	profile_o58wyr	profile_o58wyr
13	profile_o5ao26	profile_o5ao26
14	profile_o5kfil	profile_o5kfil
15	profile_o5kg61	profile_o5kg61
16	profile_o72w94	profile_o72w94
17	profile_o72wib	profile_o72wib
18	profile_o73y3j	profile_o73y3j
19	profile_o73yf3	profile_o73yf3
20	profile_o744pb	profile_o744pb
21	profile_o744we	profile_o744we
22	profile_o7y6hz	profile_o7y6hz
\.


--
-- TOC entry 5050 (class 0 OID 16449)
-- Dependencies: 225
-- Data for Name: subsystem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subsystem (id, name, description) FROM stdin;
60	security	Subsistema de seguridad
61	session	Subsistema de gestión de sesiones
62	services	Subsistema de servicios
\.


--
-- TOC entry 5069 (class 0 OID 24719)
-- Dependencies: 244
-- Data for Name: subsystem_class; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subsystem_class (id, id_subsystem, id_class) FROM stdin;
118	60	106
119	61	108
120	61	109
121	62	110
122	62	111
123	62	112
124	62	113
125	62	114
\.


--
-- TOC entry 5058 (class 0 OID 16515)
-- Dependencies: 233
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction (tx, id_subsystem, id_class, id_method, description) FROM stdin;
392	60	106	394	Realiza una consulta en la base de datos
393	60	106	395	Inserta datos en la base de datos
394	60	106	396	Actualiza datos por ID
395	60	106	397	Actualiza datos por nombre de usuario
396	60	106	398	Elimina datos por ID
397	60	106	399	Elimina datos por nombre de usuario
398	60	106	400	Obtiene todos los datos de una tabla
399	60	106	401	Obtiene datos filtrados por condiciones
400	60	106	402	Elimina todos los datos de una tabla
401	60	106	403	Ejecuta una consulta nombrada predefinida
402	60	106	404	Ejecuta una serie de consultas nombradas predefinidas, pasándole los parámetros como valores de las keys ({ namedQuery: [params] })
403	60	106	405	Inicia una transacción en la base de datos
404	60	106	406	Confirma una transacción en la base de datos
405	60	106	407	Revierte una transacción en la base de datos
406	60	106	408	Finaliza una transacción en la base de datos
407	60	106	409	Ejecuta una serie de consultas dentro de una transacción, pasándole los parámetros como valores de las keys ({ query: [params] })
408	61	108	410	Inicializa el sistema de sesiones
409	61	108	411	Inicia sesión para un usuario
410	61	108	412	Registra un nuevo usuario
411	61	108	413	Cambia el perfil activo del usuario
412	61	108	414	Inicia el proceso de recuperación de contraseña
413	61	108	415	Restablece la contraseña del usuario
414	61	109	416	Crea y actualiza la sesión del usuario
415	61	109	417	Crea una nueva sesión
416	61	109	418	Actualiza los datos de la sesión
417	61	109	419	Destruye la sesión actual
418	61	109	420	Obtiene los datos de la sesión
419	61	109	421	Verifica si existe una sesión activa
420	62	110	422	Envía un correo electrónico
421	62	110	423	Envía un correo electrónico de recuperación
422	62	111	424	Genera un nuevo token
423	62	111	425	Verifica un token existente
424	62	112	426	Valida un nombre de usuario
425	62	112	427	Valida un correo electrónico
426	62	112	428	Valida una contraseña
427	62	112	429	Valida la confirmación de la contraseña
428	62	112	430	Obtiene los valores de validación
429	62	112	431	Valida un nombre
430	62	112	432	Valida una descripción
431	62	113	433	Convierte parámetros de objeto
432	62	113	434	Convierte parámetros de array
433	62	113	435	Convierte estructura a array ordenado
434	62	114	436	Convierte la primera letra a mayúscula
435	62	114	437	Obtiene todos los nombres de métodos dinámicos
436	62	114	438	Maneja errores personalizados
\.


--
-- TOC entry 5045 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, username, password, email, register_date, status) FROM stdin;
17	Bustoss	$2b$10$rnliT0ZflZ6MpGliSAq7VuoZ9eq.pfprG.y1xJzXvdyPDaJbOI6Wq	luissdavidbustosnunez@gmail.com	2025-10-19	active
27	Bustosss	$2b$10$K299m7oBG5MEPnYxFxMIDulX54dEjyURFyJBUtTyfEYbm0Kv8JIVq	luisssdavidbustosnunez@gmail.com	2025-10-19	active
60	test_user_o8udh3	$2b$10$Ph8BVOxC11GMQ25E6ZnCV.HyO45M2clPRtJBkNwmUIXmbfGYhRqn2	user_o8udh3@example.com	2025-11-07	active
32	Bustos4	QWEqwe123·	luis4davidbustosnunez@gmail.com	2025-10-22	active
34	Bustos1	QWEqwe123·	luis1davidbustosnunez@gmail.com	2025-10-22	active
16	Bustos	$2b$10$nxr4rm6juhRW55XDhE2QnefIriF9.OdVf6aZrzH4rtA9jAE/.6wZm	luisdavidbustosnunez@gmail.com	2025-10-19	active
50	repo_user_test	$2b$10$JM6gSDaWvarfy1jxr34/gOMZgYfvYuPuAulgor7HPjxFxP5fY1cm6	repo_user_test@example.com	2025-11-06	active
\.


--
-- TOC entry 5048 (class 0 OID 16415)
-- Dependencies: 223
-- Data for Name: user_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profile (id_user, id_profile, id) FROM stdin;
16	1	19
16	3	20
17	2	21
27	3	22
34	1	42
34	3	43
60	3	70
\.


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 226
-- Name: class_id_class_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_id_class_seq', 114, true);


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 245
-- Name: class_method_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_method_id_seq', 465, true);


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 230
-- Name: menu_id_menu_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_id_menu_seq', 101, true);


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 228
-- Name: method_id_method_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.method_id_method_seq', 438, true);


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 235
-- Name: method_profile_id_method_profile_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.method_profile_id_method_profile_seq', 886, true);


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 237
-- Name: option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.option_id_seq', 100, true);


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 241
-- Name: option_menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.option_menu_id_seq', 142, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 239
-- Name: option_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.option_profile_id_seq', 262, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 221
-- Name: profile_id_profile_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_id_profile_seq', 22, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 243
-- Name: subsystem_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subsystem_class_id_seq', 125, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 224
-- Name: subsystem_id_subsystem_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subsystem_id_subsystem_seq', 62, true);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 232
-- Name: transaction_id_transaction_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaction_id_transaction_seq', 436, true);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 219
-- Name: user_id_username_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_username_seq', 62, true);


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 234
-- Name: user_profile_id_user_profile_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_profile_id_user_profile_seq', 72, true);


--
-- TOC entry 4879 (class 2606 OID 24747)
-- Name: class_method class_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_method
    ADD CONSTRAINT class_method_pkey PRIMARY KEY (id, id_class, id_method);


--
-- TOC entry 4851 (class 2606 OID 16468)
-- Name: class class_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class
    ADD CONSTRAINT class_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 16479)
-- Name: user email_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT email_user UNIQUE (email) INCLUDE (email);


--
-- TOC entry 4867 (class 2606 OID 24678)
-- Name: option id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT id UNIQUE (id);


--
-- TOC entry 4859 (class 2606 OID 16506)
-- Name: menu menu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_pkey PRIMARY KEY (id);


--
-- TOC entry 4855 (class 2606 OID 16489)
-- Name: method method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method
    ADD CONSTRAINT method_pkey PRIMARY KEY (id);


--
-- TOC entry 4865 (class 2606 OID 16580)
-- Name: method_profile method_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_profile
    ADD CONSTRAINT method_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4853 (class 2606 OID 16470)
-- Name: class name_class; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class
    ADD CONSTRAINT name_class UNIQUE (name);


--
-- TOC entry 4861 (class 2606 OID 16508)
-- Name: menu name_menu; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT name_menu UNIQUE (name) INCLUDE (name);


--
-- TOC entry 4857 (class 2606 OID 16491)
-- Name: method name_method; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method
    ADD CONSTRAINT name_method UNIQUE (name) INCLUDE (name);


--
-- TOC entry 4869 (class 2606 OID 24646)
-- Name: option name_option; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT name_option UNIQUE (name);


--
-- TOC entry 4841 (class 2606 OID 16414)
-- Name: profile name_profile; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT name_profile UNIQUE (name);


--
-- TOC entry 4847 (class 2606 OID 16458)
-- Name: subsystem name_subsystem; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem
    ADD CONSTRAINT name_subsystem UNIQUE (name);


--
-- TOC entry 4875 (class 2606 OID 24711)
-- Name: option_menu option_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_menu
    ADD CONSTRAINT option_menu_pkey PRIMARY KEY (id);


--
-- TOC entry 4873 (class 2606 OID 24671)
-- Name: option_profile option_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_profile
    ADD CONSTRAINT option_profile_pkey PRIMARY KEY (id, id_option, id_profile);


--
-- TOC entry 4843 (class 2606 OID 16412)
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4877 (class 2606 OID 24727)
-- Name: subsystem_class subsystem_class_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem_class
    ADD CONSTRAINT subsystem_class_pkey PRIMARY KEY (id, id_subsystem, id_class);


--
-- TOC entry 4849 (class 2606 OID 16456)
-- Name: subsystem subsystem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem
    ADD CONSTRAINT subsystem_pkey PRIMARY KEY (id);


--
-- TOC entry 4863 (class 2606 OID 16525)
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (tx);


--
-- TOC entry 4871 (class 2606 OID 32911)
-- Name: option tx; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT tx UNIQUE (tx) INCLUDE (tx);


--
-- TOC entry 4837 (class 2606 OID 16401)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4845 (class 2606 OID 16570)
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 16477)
-- Name: user username_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT username_user UNIQUE (username) INCLUDE (username);


--
-- TOC entry 4884 (class 2606 OID 16533)
-- Name: transaction id_class; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT id_class FOREIGN KEY (id_class) REFERENCES public.class(id);


--
-- TOC entry 4893 (class 2606 OID 24733)
-- Name: subsystem_class id_class; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem_class
    ADD CONSTRAINT id_class FOREIGN KEY (id_class) REFERENCES public.class(id) NOT VALID;


--
-- TOC entry 4895 (class 2606 OID 24748)
-- Name: class_method id_class; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_method
    ADD CONSTRAINT id_class FOREIGN KEY (id_class) REFERENCES public.class(id);


--
-- TOC entry 4891 (class 2606 OID 24700)
-- Name: option_menu id_menu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_menu
    ADD CONSTRAINT id_menu FOREIGN KEY (id_menu) REFERENCES public.menu(id);


--
-- TOC entry 4885 (class 2606 OID 16538)
-- Name: transaction id_method; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT id_method FOREIGN KEY (id_method) REFERENCES public.method(id);


--
-- TOC entry 4887 (class 2606 OID 16581)
-- Name: method_profile id_method; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_profile
    ADD CONSTRAINT id_method FOREIGN KEY (id_method) REFERENCES public.method(id);


--
-- TOC entry 4896 (class 2606 OID 24753)
-- Name: class_method id_method; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_method
    ADD CONSTRAINT id_method FOREIGN KEY (id_method) REFERENCES public.method(id);


--
-- TOC entry 4889 (class 2606 OID 24679)
-- Name: option_profile id_option; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_profile
    ADD CONSTRAINT id_option FOREIGN KEY (id_option) REFERENCES public.option(id) NOT VALID;


--
-- TOC entry 4892 (class 2606 OID 24705)
-- Name: option_menu id_option; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_menu
    ADD CONSTRAINT id_option FOREIGN KEY (id_option) REFERENCES public.option(id);


--
-- TOC entry 4882 (class 2606 OID 24713)
-- Name: menu id_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT id_parent FOREIGN KEY (id_parent) REFERENCES public.menu(id) NOT VALID;


--
-- TOC entry 4880 (class 2606 OID 16425)
-- Name: user_profile id_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT id_profile FOREIGN KEY (id_profile) REFERENCES public.profile(id);


--
-- TOC entry 4888 (class 2606 OID 16586)
-- Name: method_profile id_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_profile
    ADD CONSTRAINT id_profile FOREIGN KEY (id_profile) REFERENCES public.profile(id);


--
-- TOC entry 4890 (class 2606 OID 24672)
-- Name: option_profile id_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_profile
    ADD CONSTRAINT id_profile FOREIGN KEY (id_profile) REFERENCES public.profile(id);


--
-- TOC entry 4883 (class 2606 OID 16509)
-- Name: menu id_subsystem; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT id_subsystem FOREIGN KEY (id_subsystem) REFERENCES public.subsystem(id);


--
-- TOC entry 4886 (class 2606 OID 16528)
-- Name: transaction id_subsystem; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT id_subsystem FOREIGN KEY (id_subsystem) REFERENCES public.subsystem(id);


--
-- TOC entry 4894 (class 2606 OID 24728)
-- Name: subsystem_class id_subsystem; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem_class
    ADD CONSTRAINT id_subsystem FOREIGN KEY (id_subsystem) REFERENCES public.subsystem(id);


--
-- TOC entry 4881 (class 2606 OID 16420)
-- Name: user_profile id_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT id_user FOREIGN KEY (id_user) REFERENCES public."user"(id);


-- Completed on 2025-11-07 00:50:44

--
-- PostgreSQL database dump complete
--

\unrestrict d2rKcyPZ0vHJqRscXVTwCbGUdk1twHBRQVmsgd89AD3ILTizpXqELgTtHezAafR

