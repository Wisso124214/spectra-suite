--
-- PostgreSQL database dump
--

\restrict xlRlQrTLB8HvKgafnugqqmYB5hcYo1EoO8cCZSfzdASHm3lL2YkTFGnX6zXB4g7

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-14 05:06:47

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
-- TOC entry 5083 (class 1262 OID 41115)
-- Name: web2db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE web2db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Spain.1252';


ALTER DATABASE web2db OWNER TO postgres;

\unrestrict xlRlQrTLB8HvKgafnugqqmYB5hcYo1EoO8cCZSfzdASHm3lL2YkTFGnX6zXB4g7
\connect web2db
\restrict xlRlQrTLB8HvKgafnugqqmYB5hcYo1EoO8cCZSfzdASHm3lL2YkTFGnX6zXB4g7

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
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 41116)
-- Name: class; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class (
    id integer CONSTRAINT class_id_class_not_null NOT NULL,
    name character varying(30) NOT NULL,
    description character varying(200)
);


ALTER TABLE public.class OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 41121)
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
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 220
-- Name: class_id_class_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.class_id_class_seq OWNED BY public.class.id;


--
-- TOC entry 221 (class 1259 OID 41122)
-- Name: class_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_method (
    id integer NOT NULL,
    id_class integer NOT NULL,
    id_method integer NOT NULL
);


ALTER TABLE public.class_method OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 41128)
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
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 222
-- Name: class_method_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.class_method_id_seq OWNED BY public.class_method.id;


--
-- TOC entry 223 (class 1259 OID 41129)
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
-- TOC entry 224 (class 1259 OID 41135)
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
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 224
-- Name: menu_id_menu_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_id_menu_seq OWNED BY public.menu.id;


--
-- TOC entry 225 (class 1259 OID 41136)
-- Name: method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.method (
    id integer CONSTRAINT method_id_method_not_null NOT NULL,
    name character varying(30) NOT NULL,
    description character varying(200)
);


ALTER TABLE public.method OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 41141)
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
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 226
-- Name: method_id_method_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.method_id_method_seq OWNED BY public.method.id;


--
-- TOC entry 227 (class 1259 OID 41142)
-- Name: method_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.method_profile (
    id integer CONSTRAINT method_profile_id_method_profile_not_null NOT NULL,
    id_method integer NOT NULL,
    id_profile integer NOT NULL
);


ALTER TABLE public.method_profile OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 41148)
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
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 228
-- Name: method_profile_id_method_profile_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.method_profile_id_method_profile_seq OWNED BY public.method_profile.id;


--
-- TOC entry 229 (class 1259 OID 41149)
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
-- TOC entry 230 (class 1259 OID 41155)
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
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 230
-- Name: option_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.option_id_seq OWNED BY public.option.id;


--
-- TOC entry 231 (class 1259 OID 41156)
-- Name: option_menu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.option_menu (
    id integer NOT NULL,
    id_menu integer NOT NULL,
    id_option integer NOT NULL
);


ALTER TABLE public.option_menu OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 41162)
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
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 232
-- Name: option_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.option_menu_id_seq OWNED BY public.option_menu.id;


--
-- TOC entry 233 (class 1259 OID 41163)
-- Name: option_meta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.option_meta (
    id_option integer NOT NULL,
    meta text
);


ALTER TABLE public.option_meta OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 41169)
-- Name: option_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.option_profile (
    id integer NOT NULL,
    id_option integer NOT NULL,
    id_profile integer NOT NULL
);


ALTER TABLE public.option_profile OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 41175)
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
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 235
-- Name: option_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.option_profile_id_seq OWNED BY public.option_profile.id;


--
-- TOC entry 236 (class 1259 OID 41176)
-- Name: profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile (
    id integer CONSTRAINT profile_id_profile_not_null NOT NULL,
    name character varying(30) NOT NULL,
    description character varying(300)
);


ALTER TABLE public.profile OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 41181)
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
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 237
-- Name: profile_id_profile_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profile_id_profile_seq OWNED BY public.profile.id;


--
-- TOC entry 238 (class 1259 OID 41182)
-- Name: subsystem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subsystem (
    id integer CONSTRAINT subsystem_id_subsystem_not_null NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(300)
);


ALTER TABLE public.subsystem OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 41187)
-- Name: subsystem_class; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subsystem_class (
    id integer NOT NULL,
    id_subsystem integer NOT NULL,
    id_class integer NOT NULL
);


ALTER TABLE public.subsystem_class OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 41193)
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
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 240
-- Name: subsystem_class_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subsystem_class_id_seq OWNED BY public.subsystem_class.id;


--
-- TOC entry 241 (class 1259 OID 41194)
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
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 241
-- Name: subsystem_id_subsystem_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subsystem_id_subsystem_seq OWNED BY public.subsystem.id;


--
-- TOC entry 242 (class 1259 OID 41195)
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
-- TOC entry 243 (class 1259 OID 41202)
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
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 243
-- Name: transaction_id_transaction_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaction_id_transaction_seq OWNED BY public.transaction.tx;


--
-- TOC entry 244 (class 1259 OID 41203)
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
-- TOC entry 245 (class 1259 OID 41212)
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
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 245
-- Name: user_id_username_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_username_seq OWNED BY public."user".id;


--
-- TOC entry 246 (class 1259 OID 41213)
-- Name: user_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile (
    id_user integer NOT NULL,
    id_profile integer NOT NULL,
    id integer CONSTRAINT user_profile_id_user_profile_not_null NOT NULL
);


ALTER TABLE public.user_profile OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 41219)
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
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 247
-- Name: user_profile_id_user_profile_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_profile_id_user_profile_seq OWNED BY public.user_profile.id;


--
-- TOC entry 4824 (class 2604 OID 41370)
-- Name: class id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class ALTER COLUMN id SET DEFAULT nextval('public.class_id_class_seq'::regclass);


--
-- TOC entry 4825 (class 2604 OID 41371)
-- Name: class_method id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_method ALTER COLUMN id SET DEFAULT nextval('public.class_method_id_seq'::regclass);


--
-- TOC entry 4826 (class 2604 OID 41372)
-- Name: menu id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu ALTER COLUMN id SET DEFAULT nextval('public.menu_id_menu_seq'::regclass);


--
-- TOC entry 4827 (class 2604 OID 41373)
-- Name: method id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method ALTER COLUMN id SET DEFAULT nextval('public.method_id_method_seq'::regclass);


--
-- TOC entry 4828 (class 2604 OID 41374)
-- Name: method_profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_profile ALTER COLUMN id SET DEFAULT nextval('public.method_profile_id_method_profile_seq'::regclass);


--
-- TOC entry 4829 (class 2604 OID 41375)
-- Name: option id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option ALTER COLUMN id SET DEFAULT nextval('public.option_id_seq'::regclass);


--
-- TOC entry 4830 (class 2604 OID 41376)
-- Name: option_menu id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_menu ALTER COLUMN id SET DEFAULT nextval('public.option_menu_id_seq'::regclass);


--
-- TOC entry 4831 (class 2604 OID 41377)
-- Name: option_profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_profile ALTER COLUMN id SET DEFAULT nextval('public.option_profile_id_seq'::regclass);


--
-- TOC entry 4832 (class 2604 OID 41378)
-- Name: profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile ALTER COLUMN id SET DEFAULT nextval('public.profile_id_profile_seq'::regclass);


--
-- TOC entry 4833 (class 2604 OID 41379)
-- Name: subsystem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem ALTER COLUMN id SET DEFAULT nextval('public.subsystem_id_subsystem_seq'::regclass);


--
-- TOC entry 4834 (class 2604 OID 41380)
-- Name: subsystem_class id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem_class ALTER COLUMN id SET DEFAULT nextval('public.subsystem_class_id_seq'::regclass);


--
-- TOC entry 4835 (class 2604 OID 41381)
-- Name: transaction tx; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction ALTER COLUMN tx SET DEFAULT nextval('public.transaction_id_transaction_seq'::regclass);


--
-- TOC entry 4836 (class 2604 OID 41382)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_username_seq'::regclass);


--
-- TOC entry 4837 (class 2604 OID 41383)
-- Name: user_profile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile ALTER COLUMN id SET DEFAULT nextval('public.user_profile_id_user_profile_seq'::regclass);


--
-- TOC entry 5049 (class 0 OID 41116)
-- Dependencies: 219
-- Data for Name: class; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class (id, name, description) FROM stdin;
532	dbms	Gestión de la base de datos
533	security	security
534	session	Gestión de sesiones de usuario
535	sessionManager	Gestión de sesiones
536	mailer	Servicio de envío de correos electrónicos
537	tokenizer	Servicio de generación y verificación de tokens
538	validator	Servicio de validación de datos
539	formatter	Servicio de conversión de formatos de datos
540	utils	Utilidades generales
542	ftx	Full Transactions
543	bo	Business Objects
544	helpers	Helper methods
541	services	Services atomic transactions
\.


--
-- TOC entry 5051 (class 0 OID 41122)
-- Dependencies: 221
-- Data for Name: class_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class_method (id, id_class, id_method) FROM stdin;
2603	532	2578
2604	532	2579
2605	532	2580
2606	532	2581
2607	532	2582
2608	532	2583
2609	532	2584
2610	532	2585
2611	532	2586
2612	532	2587
2613	532	2588
2614	532	2589
2615	532	2590
2616	532	2591
2617	532	2592
2618	532	2593
2619	534	2594
2620	534	2595
2621	534	2596
2622	534	2597
2623	534	2598
2624	534	2599
2625	535	2600
2626	535	2601
2627	535	2602
2628	535	2603
2629	535	2604
2630	535	2605
2631	536	2606
2632	536	2607
2633	537	2608
2634	537	2609
2635	538	2610
2636	538	2611
2637	538	2612
2638	538	2613
2639	538	2614
2640	538	2615
2641	538	2616
2642	539	2617
2643	539	2618
2644	539	2619
2645	540	2620
2646	540	2621
2647	540	2622
2648	532	2623
2649	532	2624
2650	532	2625
2651	534	2626
2652	532	2627
2653	541	2628
\.


--
-- TOC entry 5053 (class 0 OID 41129)
-- Dependencies: 223
-- Data for Name: menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu (id, id_subsystem, name, description, id_parent) FROM stdin;
257	204	Gestión de Perfiles	Gestión de Perfiles de Usuario y sus Permisos	\N
258	204	Mantenimiento de Perfiles	Crear, Actualizar, Eliminar y Listar Perfiles	257
259	204	Gestión de Opciones a Perfiles	Asignar y Remover Permisos de Opciones a Perfiles	257
260	204	Gestión de Usuarios	Crear, Actualizar, Eliminar y Listar Usuarios	\N
\.


--
-- TOC entry 5055 (class 0 OID 41136)
-- Dependencies: 225
-- Data for Name: method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.method (id, name, description) FROM stdin;
2578	query	Realiza una consulta en la base de datos
2579	insert	Inserta datos en la base de datos
2580	updateById	Actualiza datos por ID
2581	updateByUsername	Actualiza datos por nombre de usuario
2582	deleteById	Elimina datos por ID
2583	deleteByUsername	Elimina datos por nombre de usuario
2584	get	Obtiene todos los datos de una tabla
2585	getWhere	Obtiene datos filtrados por condiciones
2586	deleteAll	Elimina todos los datos de una tabla
2587	executeNamedQuery	Ejecuta una consulta nombrada predefinida
2588	executeJsonNamedQuery	Ejecuta una serie de consultas nombradas predefinidas, pasándole los parámetros como valores de las keys ({ namedQuery: [params] })
2589	beginTransaction	Inicia una transacción en la base de datos
2590	commitTransaction	Confirma una transacción en la base de datos
2591	rollbackTransaction	Revierte una transacción en la base de datos
2592	endTransaction	Finaliza una transacción en la base de datos
2593	executeJsonTransaction	Ejecuta una serie de consultas dentro de una transacción, pasándole los parámetros como valores de las keys ({ query: [params] })
2594	init	Inicializa el sistema de sesiones
2595	login	Inicia sesión para un usuario
2596	register	Registra un nuevo usuario
2597	changeActiveProfile	Cambia el perfil activo del usuario
2598	forgotPassword	Inicia el proceso de recuperación de contraseña
2599	resetPassword	Restablece la contraseña del usuario
2600	createAndUpdateSession	Crea y actualiza la sesión del usuario
2601	createSession	Crea una nueva sesión
2602	updateSession	Actualiza los datos de la sesión
2603	destroySession	Destruye la sesión actual
2604	getSession	Obtiene los datos de la sesión
2605	existSession	Verifica si existe una sesión activa
2606	sendEmail	Envía un correo electrónico
2607	sendRecoveryEmail	Envía un correo electrónico de recuperación
2608	generateToken	Genera un nuevo token
2609	verifyToken	Verifica un token existente
2610	validateUsername	Valida un nombre de usuario
2611	validateEmail	Valida un correo electrónico
2612	validatePassword	Valida una contraseña
2613	validateConfirmPassword	Valida la confirmación de la contraseña
2614	getValidationValues	Obtiene los valores de validación
2615	validateName	Valida un nombre
2616	validateDescription	Valida una descripción
2617	formatObjectParams	Convierte parámetros de objeto
2618	formatArrayParams	Convierte parámetros de array
2619	structureToOrderedArray	Convierte estructura a array ordenado
2620	toUpperCaseFirstLetter	Convierte la primera letra a mayúscula
2621	getAllDinamicMethodNames	Obtiene todos los nombres de métodos dinámicos
2622	handleError	Maneja errores personalizados
2623	updatebyid	updatebyid
2624	deletebyid	deletebyid
2625	executenamedquery	executenamedquery
2626	changeactiveprofile	changeactiveprofile
2627	parseMOP	Parsear los menus, opciones y perfiles a un formato iterable para el front
2628	getUserProfiles	Obtiene los perfiles de un usuario
\.


--
-- TOC entry 5057 (class 0 OID 41142)
-- Dependencies: 227
-- Data for Name: method_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.method_profile (id, id_method, id_profile) FROM stdin;
6546	2578	10
6547	2578	11
6548	2578	1
6549	2579	10
6550	2579	11
6551	2580	10
6552	2580	11
6553	2581	10
6554	2581	11
6555	2582	10
6556	2582	11
6557	2583	10
6558	2583	11
6559	2584	10
6560	2584	11
6561	2585	10
6562	2585	11
6563	2586	10
6564	2586	11
6565	2587	10
6566	2587	11
6567	2587	1
6568	2588	10
6569	2588	11
6570	2588	1
6571	2589	10
6572	2589	11
6573	2590	10
6574	2590	11
6575	2591	10
6576	2591	11
6577	2592	10
6578	2592	11
6579	2593	10
6580	2593	11
6581	2594	10
6582	2594	1
6583	2595	10
6584	2595	1
6585	2595	11
6586	2595	2
6587	2595	3
6588	2596	10
6589	2596	1
6590	2596	11
6591	2596	2
6592	2596	3
6593	2597	10
6594	2597	1
6595	2597	11
6596	2597	2
6597	2597	3
6598	2598	10
6599	2598	1
6600	2598	11
6601	2598	2
6602	2598	3
6603	2599	10
6604	2599	1
6605	2599	11
6606	2599	2
6607	2599	3
6608	2600	10
6609	2600	11
6610	2601	10
6611	2601	11
6612	2602	10
6613	2602	11
6614	2603	10
6615	2603	11
6616	2604	10
6617	2604	11
6618	2605	10
6619	2605	11
6620	2606	10
6621	2606	11
6622	2606	1
6623	2606	2
6624	2606	3
6625	2607	10
6626	2607	1
6627	2607	11
6628	2607	2
6629	2607	3
6630	2608	10
6631	2608	11
6632	2608	1
6633	2609	10
6634	2609	11
6635	2609	1
6636	2610	10
6637	2610	11
6638	2610	1
6639	2611	10
6640	2611	11
6641	2611	1
6642	2612	10
6643	2612	11
6644	2612	1
6645	2613	10
6646	2613	11
6647	2613	1
6648	2614	10
6649	2614	11
6650	2614	1
6651	2615	10
6652	2615	11
6653	2615	1
6654	2616	10
6655	2616	11
6656	2616	1
6657	2617	10
6658	2618	10
6659	2619	10
6660	2620	10
6661	2620	11
6662	2620	1
6663	2621	10
6664	2621	11
6665	2621	1
6666	2622	10
6667	2622	11
6668	2622	1
6669	2627	3
6670	2627	1
6671	2627	11
6672	2627	10
6674	2627	2
6675	2628	1
6676	2628	2
6677	2628	3
6678	2628	10
6679	2628	11
\.


--
-- TOC entry 5059 (class 0 OID 41149)
-- Dependencies: 229
-- Data for Name: option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.option (id, name, description, tx) FROM stdin;
441	Crear Perfil	Crear un nuevo Perfil de Usuario	2572
442	Actualizar Perfil	Actualizar un Perfil de Usuario existente	2616
443	Eliminar Perfil	Eliminar un Perfil de Usuario existente	2617
444	Listar Perfiles	Listar todos los Perfiles de Usuario	2577
445	Asignar Permiso de Opción a Perfil	Asignar un Permiso de Opción a un Perfil	2618
446	Remover Permiso de Opción de Perfil	Remover un Permiso de Opción de un Perfil	2618
447	Asignar Permiso de Método de Perfil	Asignar un Permiso de Método a un Perfil	2618
448	Remover Permiso de Método de Perfil	Remover un Permiso de Método de un Perfil	2618
451	Crear Usuario	Crear un nuevo Usuario	2572
452	Actualizar Usuario	Actualizar un Usuario existente	2616
453	Eliminar Usuario	Eliminar un Usuario existente	2617
454	Listar Usuarios	Listar todos los Usuarios	2577
\.


--
-- TOC entry 5061 (class 0 OID 41156)
-- Dependencies: 231
-- Data for Name: option_menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.option_menu (id, id_menu, id_option) FROM stdin;
519	258	441
520	258	442
521	258	443
522	258	444
523	259	445
524	259	446
525	259	447
526	259	448
529	260	451
530	260	452
531	260	453
532	260	454
\.


--
-- TOC entry 5063 (class 0 OID 41163)
-- Dependencies: 233
-- Data for Name: option_meta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.option_meta (id_option, meta) FROM stdin;
\.


--
-- TOC entry 5064 (class 0 OID 41169)
-- Dependencies: 234
-- Data for Name: option_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.option_profile (id, id_option, id_profile) FROM stdin;
1219	441	10
1220	441	1
1221	441	11
1222	442	10
1223	442	1
1224	442	11
1225	443	10
1226	443	1
1227	443	11
1228	444	10
1229	444	1
1230	444	11
1231	445	10
1232	445	1
1233	446	10
1234	446	1
1235	447	10
1236	447	1
1237	448	10
1238	448	1
1249	451	10
1250	451	1
1251	452	10
1252	452	1
1253	453	10
1254	453	1
1255	454	10
1256	454	1
1257	451	11
1259	452	11
1260	453	11
1261	454	11
\.


--
-- TOC entry 5066 (class 0 OID 41176)
-- Dependencies: 236
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile (id, name, description) FROM stdin;
1	administrador de seguridad	\N
2	administrador de eventos	\N
3	participante	\N
10	super administrador	\N
11	administrador de base de datos	\N
\.


--
-- TOC entry 5068 (class 0 OID 41182)
-- Dependencies: 238
-- Data for Name: subsystem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subsystem (id, name, description) FROM stdin;
204	security	Subsistema de seguridad
205	session	Subsistema de gestión de sesiones
206	ftx	Full transactions
\.


--
-- TOC entry 5069 (class 0 OID 41187)
-- Dependencies: 239
-- Data for Name: subsystem_class; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subsystem_class (id, id_subsystem, id_class) FROM stdin;
497	204	532
498	205	534
499	205	535
500	206	536
501	206	537
502	206	538
503	206	539
504	206	540
505	206	541
506	206	542
507	206	544
508	206	543
\.


--
-- TOC entry 5072 (class 0 OID 41195)
-- Dependencies: 242
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction (tx, id_subsystem, id_class, id_method, description) FROM stdin;
2571	204	532	2578	Realiza una consulta en la base de datos
2572	204	532	2579	Inserta datos en la base de datos
2573	204	532	2580	Actualiza datos por ID
2574	204	532	2581	Actualiza datos por nombre de usuario
2575	204	532	2582	Elimina datos por ID
2576	204	532	2583	Elimina datos por nombre de usuario
2577	204	532	2584	Obtiene todos los datos de una tabla
2578	204	532	2585	Obtiene datos filtrados por condiciones
2579	204	532	2586	Elimina todos los datos de una tabla
2580	204	532	2587	Ejecuta una consulta nombrada predefinida
2581	204	532	2588	Ejecuta una serie de consultas nombradas predefinidas, pasándole los parámetros como valores de las keys ({ namedQuery: [params] })
2582	204	532	2589	Inicia una transacción en la base de datos
2583	204	532	2590	Confirma una transacción en la base de datos
2584	204	532	2591	Revierte una transacción en la base de datos
2585	204	532	2592	Finaliza una transacción en la base de datos
2586	204	532	2593	Ejecuta una serie de consultas dentro de una transacción, pasándole los parámetros como valores de las keys ({ query: [params] })
2587	205	534	2594	Inicializa el sistema de sesiones
2588	205	534	2595	Inicia sesión para un usuario
2589	205	534	2596	Registra un nuevo usuario
2590	205	534	2597	Cambia el perfil activo del usuario
2591	205	534	2598	Inicia el proceso de recuperación de contraseña
2592	205	534	2599	Restablece la contraseña del usuario
2593	205	535	2600	Crea y actualiza la sesión del usuario
2594	205	535	2601	Crea una nueva sesión
2595	205	535	2602	Actualiza los datos de la sesión
2596	205	535	2603	Destruye la sesión actual
2597	205	535	2604	Obtiene los datos de la sesión
2598	205	535	2605	Verifica si existe una sesión activa
2599	206	536	2606	Envía un correo electrónico
2600	206	536	2607	Envía un correo electrónico de recuperación
2601	206	537	2608	Genera un nuevo token
2602	206	537	2609	Verifica un token existente
2603	206	538	2610	Valida un nombre de usuario
2604	206	538	2611	Valida un correo electrónico
2605	206	538	2612	Valida una contraseña
2606	206	538	2613	Valida la confirmación de la contraseña
2607	206	538	2614	Obtiene los valores de validación
2608	206	538	2615	Valida un nombre
2609	206	538	2616	Valida una descripción
2610	206	539	2617	Convierte parámetros de objeto
2611	206	539	2618	Convierte parámetros de array
2612	206	539	2619	Convierte estructura a array ordenado
2613	206	540	2620	Convierte la primera letra a mayúscula
2614	206	540	2621	Obtiene todos los nombres de métodos dinámicos
2615	206	540	2622	Maneja errores personalizados
2616	204	532	2623	security.dbms.updatebyid
2617	204	532	2624	security.dbms.deletebyid
2618	204	532	2625	security.dbms.executenamedquery
2619	205	534	2626	session.session.changeactiveprofile
2620	204	532	2627	Parsear los menus, opciones y perfiles a un formato iterable para el front
2621	206	541	2628	\N
\.


--
-- TOC entry 5074 (class 0 OID 41203)
-- Dependencies: 244
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, username, password, email, register_date, status) FROM stdin;
17	Bustoss	$2b$10$rnliT0ZflZ6MpGliSAq7VuoZ9eq.pfprG.y1xJzXvdyPDaJbOI6Wq	luissdavidbustosnunez@gmail.com	2025-10-19	active
27	Bustosss	$2b$10$K299m7oBG5MEPnYxFxMIDulX54dEjyURFyJBUtTyfEYbm0Kv8JIVq	luisssdavidbustosnunez@gmail.com	2025-10-19	active
60	test_user_o8udh3	$2b$10$Ph8BVOxC11GMQ25E6ZnCV.HyO45M2clPRtJBkNwmUIXmbfGYhRqn2	user_o8udh3@example.com	2025-11-07	active
32	Bustos4	QWEqwe123·	luis4davidbustosnunez@gmail.com	2025-10-22	active
34	Bustos1	QWEqwe123·	luis1davidbustosnunez@gmail.com	2025-10-22	active
50	repo_user_test	$2b$10$JM6gSDaWvarfy1jxr34/gOMZgYfvYuPuAulgor7HPjxFxP5fY1cm6	repo_user_test@example.com	2025-11-06	active
66	Usuario	$2b$10$R1mPDf.EcXd4gHXk89xo7eMiguZja.Kwl/D0JQhpfo3fxgjy5ALLK	usuario@example.com	2025-11-07	active
16	Bustos	$2b$10$ECWHbiA9UV9h6hTzztUM.Oa8IC9GbCx5VyrjJhkh.Puq9ReogQrWO	luisdavidbustosnunez@gmail.com	2025-10-19	active
67	Pepito	$2b$10$EACSdLZZWkz.fvVQU4ggNeC6zYQ95LSawfx7DqL.jYjZwhlBX4VAu	pepito@gmail.com	2025-11-14	active
69	PepitoAbc	$2b$10$6iqlRztAuNjxY.inu6LD9u9S/eFnsQBLglUFBnnDSinkJPALQQndK	pepitoabc@gmail.com	2025-11-14	active
\.


--
-- TOC entry 5076 (class 0 OID 41213)
-- Dependencies: 246
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
66	3	74
69	3	75
\.


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 220
-- Name: class_id_class_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_id_class_seq', 544, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 222
-- Name: class_method_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_method_id_seq', 2653, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 224
-- Name: menu_id_menu_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_id_menu_seq', 260, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 226
-- Name: method_id_method_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.method_id_method_seq', 2628, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 228
-- Name: method_profile_id_method_profile_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.method_profile_id_method_profile_seq', 6679, true);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 230
-- Name: option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.option_id_seq', 454, true);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 232
-- Name: option_menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.option_menu_id_seq', 532, true);


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 235
-- Name: option_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.option_profile_id_seq', 1261, true);


--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 237
-- Name: profile_id_profile_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_id_profile_seq', 25, true);


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 240
-- Name: subsystem_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subsystem_class_id_seq', 509, true);


--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 241
-- Name: subsystem_id_subsystem_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subsystem_id_subsystem_seq', 206, true);


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 243
-- Name: transaction_id_transaction_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaction_id_transaction_seq', 2621, true);


--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 245
-- Name: user_id_username_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_username_seq', 69, true);


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 247
-- Name: user_profile_id_user_profile_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_profile_id_user_profile_seq', 75, true);


--
-- TOC entry 4843 (class 2606 OID 41235)
-- Name: class_method class_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_method
    ADD CONSTRAINT class_method_pkey PRIMARY KEY (id, id_class, id_method);


--
-- TOC entry 4839 (class 2606 OID 41237)
-- Name: class class_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class
    ADD CONSTRAINT class_pkey PRIMARY KEY (id);


--
-- TOC entry 4877 (class 2606 OID 41239)
-- Name: user email_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT email_user UNIQUE (email) INCLUDE (email);


--
-- TOC entry 4855 (class 2606 OID 41241)
-- Name: option id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT id UNIQUE (id);


--
-- TOC entry 4845 (class 2606 OID 41243)
-- Name: menu menu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT menu_pkey PRIMARY KEY (id);


--
-- TOC entry 4849 (class 2606 OID 41245)
-- Name: method method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method
    ADD CONSTRAINT method_pkey PRIMARY KEY (id);


--
-- TOC entry 4853 (class 2606 OID 41247)
-- Name: method_profile method_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_profile
    ADD CONSTRAINT method_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4841 (class 2606 OID 41249)
-- Name: class name_class; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class
    ADD CONSTRAINT name_class UNIQUE (name);


--
-- TOC entry 4847 (class 2606 OID 41251)
-- Name: menu name_menu; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT name_menu UNIQUE (name) INCLUDE (name);


--
-- TOC entry 4851 (class 2606 OID 41253)
-- Name: method name_method; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method
    ADD CONSTRAINT name_method UNIQUE (name) INCLUDE (name);


--
-- TOC entry 4857 (class 2606 OID 41255)
-- Name: option name_option; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT name_option UNIQUE (name);


--
-- TOC entry 4865 (class 2606 OID 41257)
-- Name: profile name_profile; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT name_profile UNIQUE (name);


--
-- TOC entry 4869 (class 2606 OID 41259)
-- Name: subsystem name_subsystem; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem
    ADD CONSTRAINT name_subsystem UNIQUE (name);


--
-- TOC entry 4859 (class 2606 OID 41261)
-- Name: option_menu option_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_menu
    ADD CONSTRAINT option_menu_pkey PRIMARY KEY (id);


--
-- TOC entry 4861 (class 2606 OID 41263)
-- Name: option_meta option_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_meta
    ADD CONSTRAINT option_meta_pkey PRIMARY KEY (id_option);


--
-- TOC entry 4863 (class 2606 OID 41265)
-- Name: option_profile option_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_profile
    ADD CONSTRAINT option_profile_pkey PRIMARY KEY (id, id_option, id_profile);


--
-- TOC entry 4867 (class 2606 OID 41267)
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4873 (class 2606 OID 41269)
-- Name: subsystem_class subsystem_class_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem_class
    ADD CONSTRAINT subsystem_class_pkey PRIMARY KEY (id, id_subsystem, id_class);


--
-- TOC entry 4871 (class 2606 OID 41271)
-- Name: subsystem subsystem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem
    ADD CONSTRAINT subsystem_pkey PRIMARY KEY (id);


--
-- TOC entry 4875 (class 2606 OID 41273)
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (tx);


--
-- TOC entry 4879 (class 2606 OID 41275)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4883 (class 2606 OID 41277)
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4881 (class 2606 OID 41279)
-- Name: user username_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT username_user UNIQUE (username) INCLUDE (username);


--
-- TOC entry 4897 (class 2606 OID 41280)
-- Name: transaction id_class; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT id_class FOREIGN KEY (id_class) REFERENCES public.class(id);


--
-- TOC entry 4895 (class 2606 OID 41285)
-- Name: subsystem_class id_class; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem_class
    ADD CONSTRAINT id_class FOREIGN KEY (id_class) REFERENCES public.class(id) NOT VALID;


--
-- TOC entry 4884 (class 2606 OID 41290)
-- Name: class_method id_class; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_method
    ADD CONSTRAINT id_class FOREIGN KEY (id_class) REFERENCES public.class(id);


--
-- TOC entry 4890 (class 2606 OID 41295)
-- Name: option_menu id_menu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_menu
    ADD CONSTRAINT id_menu FOREIGN KEY (id_menu) REFERENCES public.menu(id);


--
-- TOC entry 4898 (class 2606 OID 41300)
-- Name: transaction id_method; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT id_method FOREIGN KEY (id_method) REFERENCES public.method(id);


--
-- TOC entry 4888 (class 2606 OID 41305)
-- Name: method_profile id_method; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_profile
    ADD CONSTRAINT id_method FOREIGN KEY (id_method) REFERENCES public.method(id);


--
-- TOC entry 4885 (class 2606 OID 41310)
-- Name: class_method id_method; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_method
    ADD CONSTRAINT id_method FOREIGN KEY (id_method) REFERENCES public.method(id);


--
-- TOC entry 4893 (class 2606 OID 41315)
-- Name: option_profile id_option; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_profile
    ADD CONSTRAINT id_option FOREIGN KEY (id_option) REFERENCES public.option(id) NOT VALID;


--
-- TOC entry 4891 (class 2606 OID 41320)
-- Name: option_menu id_option; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_menu
    ADD CONSTRAINT id_option FOREIGN KEY (id_option) REFERENCES public.option(id);


--
-- TOC entry 4886 (class 2606 OID 41325)
-- Name: menu id_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT id_parent FOREIGN KEY (id_parent) REFERENCES public.menu(id) NOT VALID;


--
-- TOC entry 4900 (class 2606 OID 41330)
-- Name: user_profile id_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT id_profile FOREIGN KEY (id_profile) REFERENCES public.profile(id);


--
-- TOC entry 4889 (class 2606 OID 41335)
-- Name: method_profile id_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.method_profile
    ADD CONSTRAINT id_profile FOREIGN KEY (id_profile) REFERENCES public.profile(id);


--
-- TOC entry 4894 (class 2606 OID 41340)
-- Name: option_profile id_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_profile
    ADD CONSTRAINT id_profile FOREIGN KEY (id_profile) REFERENCES public.profile(id);


--
-- TOC entry 4887 (class 2606 OID 41345)
-- Name: menu id_subsystem; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu
    ADD CONSTRAINT id_subsystem FOREIGN KEY (id_subsystem) REFERENCES public.subsystem(id);


--
-- TOC entry 4899 (class 2606 OID 41350)
-- Name: transaction id_subsystem; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT id_subsystem FOREIGN KEY (id_subsystem) REFERENCES public.subsystem(id);


--
-- TOC entry 4896 (class 2606 OID 41355)
-- Name: subsystem_class id_subsystem; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subsystem_class
    ADD CONSTRAINT id_subsystem FOREIGN KEY (id_subsystem) REFERENCES public.subsystem(id);


--
-- TOC entry 4901 (class 2606 OID 41360)
-- Name: user_profile id_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT id_user FOREIGN KEY (id_user) REFERENCES public."user"(id);


--
-- TOC entry 4892 (class 2606 OID 41365)
-- Name: option_meta option_meta_id_option_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_meta
    ADD CONSTRAINT option_meta_id_option_fkey FOREIGN KEY (id_option) REFERENCES public.option(id) ON DELETE CASCADE;


-- Completed on 2025-11-14 05:06:47

--
-- PostgreSQL database dump complete
--

\unrestrict xlRlQrTLB8HvKgafnugqqmYB5hcYo1EoO8cCZSfzdASHm3lL2YkTFGnX6zXB4g7

