--
-- PostgreSQL database dump
--

\restrict EmJSEIiXG5KIvVlTA47dkvejpTCUn57CcbAQlTpSggGHgiDJrb4Ld1CRRwxzMbs

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-14 05:22:27

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
-- TOC entry 5083 (class 0 OID 0)
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
-- TOC entry 5084 (class 0 OID 0)
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
-- TOC entry 5085 (class 0 OID 0)
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
-- TOC entry 5086 (class 0 OID 0)
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
-- TOC entry 5087 (class 0 OID 0)
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
-- TOC entry 5088 (class 0 OID 0)
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
-- TOC entry 5089 (class 0 OID 0)
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
-- TOC entry 5090 (class 0 OID 0)
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
-- TOC entry 5091 (class 0 OID 0)
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
-- TOC entry 5092 (class 0 OID 0)
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
-- TOC entry 5093 (class 0 OID 0)
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
-- TOC entry 5094 (class 0 OID 0)
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
    description character varying(200),
    nombre_transaccion character varying(100)
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
-- TOC entry 5095 (class 0 OID 0)
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
-- TOC entry 5096 (class 0 OID 0)
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
-- TOC entry 5097 (class 0 OID 0)
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

INSERT INTO public.class (id, name, description) VALUES (532, 'dbms', 'Gestión de la base de datos');
INSERT INTO public.class (id, name, description) VALUES (533, 'security', 'security');
INSERT INTO public.class (id, name, description) VALUES (534, 'session', 'Gestión de sesiones de usuario');
INSERT INTO public.class (id, name, description) VALUES (535, 'sessionManager', 'Gestión de sesiones');
INSERT INTO public.class (id, name, description) VALUES (536, 'mailer', 'Servicio de envío de correos electrónicos');
INSERT INTO public.class (id, name, description) VALUES (537, 'tokenizer', 'Servicio de generación y verificación de tokens');
INSERT INTO public.class (id, name, description) VALUES (538, 'validator', 'Servicio de validación de datos');
INSERT INTO public.class (id, name, description) VALUES (539, 'formatter', 'Servicio de conversión de formatos de datos');
INSERT INTO public.class (id, name, description) VALUES (540, 'utils', 'Utilidades generales');
INSERT INTO public.class (id, name, description) VALUES (542, 'ftx', 'Full Transactions');
INSERT INTO public.class (id, name, description) VALUES (543, 'bo', 'Business Objects');
INSERT INTO public.class (id, name, description) VALUES (544, 'helpers', 'Helper methods');
INSERT INTO public.class (id, name, description) VALUES (541, 'services', 'Services atomic transactions');


--
-- TOC entry 5051 (class 0 OID 41122)
-- Dependencies: 221
-- Data for Name: class_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.class_method (id, id_class, id_method) VALUES (2603, 532, 2578);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2604, 532, 2579);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2605, 532, 2580);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2606, 532, 2581);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2607, 532, 2582);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2608, 532, 2583);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2609, 532, 2584);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2610, 532, 2585);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2611, 532, 2586);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2612, 532, 2587);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2613, 532, 2588);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2614, 532, 2589);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2615, 532, 2590);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2616, 532, 2591);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2617, 532, 2592);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2618, 532, 2593);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2619, 534, 2594);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2620, 534, 2595);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2621, 534, 2596);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2622, 534, 2597);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2623, 534, 2598);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2624, 534, 2599);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2625, 535, 2600);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2626, 535, 2601);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2627, 535, 2602);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2628, 535, 2603);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2629, 535, 2604);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2630, 535, 2605);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2631, 536, 2606);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2632, 536, 2607);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2633, 537, 2608);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2634, 537, 2609);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2635, 538, 2610);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2636, 538, 2611);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2637, 538, 2612);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2638, 538, 2613);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2639, 538, 2614);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2640, 538, 2615);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2641, 538, 2616);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2642, 539, 2617);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2643, 539, 2618);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2644, 539, 2619);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2645, 540, 2620);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2646, 540, 2621);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2647, 540, 2622);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2648, 532, 2623);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2649, 532, 2624);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2650, 532, 2625);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2651, 534, 2626);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2652, 532, 2627);
INSERT INTO public.class_method (id, id_class, id_method) VALUES (2653, 541, 2628);


--
-- TOC entry 5053 (class 0 OID 41129)
-- Dependencies: 223
-- Data for Name: menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.menu (id, id_subsystem, name, description, id_parent) VALUES (257, 204, 'Gestión de Perfiles', 'Gestión de Perfiles de Usuario y sus Permisos', NULL);
INSERT INTO public.menu (id, id_subsystem, name, description, id_parent) VALUES (258, 204, 'Mantenimiento de Perfiles', 'Crear, Actualizar, Eliminar y Listar Perfiles', 257);
INSERT INTO public.menu (id, id_subsystem, name, description, id_parent) VALUES (259, 204, 'Gestión de Opciones a Perfiles', 'Asignar y Remover Permisos de Opciones a Perfiles', 257);
INSERT INTO public.menu (id, id_subsystem, name, description, id_parent) VALUES (260, 204, 'Gestión de Usuarios', 'Crear, Actualizar, Eliminar y Listar Usuarios', NULL);


--
-- TOC entry 5055 (class 0 OID 41136)
-- Dependencies: 225
-- Data for Name: method; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.method (id, name, description) VALUES (2578, 'query', 'Realiza una consulta en la base de datos');
INSERT INTO public.method (id, name, description) VALUES (2579, 'insert', 'Inserta datos en la base de datos');
INSERT INTO public.method (id, name, description) VALUES (2580, 'updateById', 'Actualiza datos por ID');
INSERT INTO public.method (id, name, description) VALUES (2581, 'updateByUsername', 'Actualiza datos por nombre de usuario');
INSERT INTO public.method (id, name, description) VALUES (2582, 'deleteById', 'Elimina datos por ID');
INSERT INTO public.method (id, name, description) VALUES (2583, 'deleteByUsername', 'Elimina datos por nombre de usuario');
INSERT INTO public.method (id, name, description) VALUES (2584, 'get', 'Obtiene todos los datos de una tabla');
INSERT INTO public.method (id, name, description) VALUES (2585, 'getWhere', 'Obtiene datos filtrados por condiciones');
INSERT INTO public.method (id, name, description) VALUES (2586, 'deleteAll', 'Elimina todos los datos de una tabla');
INSERT INTO public.method (id, name, description) VALUES (2587, 'executeNamedQuery', 'Ejecuta una consulta nombrada predefinida');
INSERT INTO public.method (id, name, description) VALUES (2588, 'executeJsonNamedQuery', 'Ejecuta una serie de consultas nombradas predefinidas, pasándole los parámetros como valores de las keys ({ namedQuery: [params] })');
INSERT INTO public.method (id, name, description) VALUES (2589, 'beginTransaction', 'Inicia una transacción en la base de datos');
INSERT INTO public.method (id, name, description) VALUES (2590, 'commitTransaction', 'Confirma una transacción en la base de datos');
INSERT INTO public.method (id, name, description) VALUES (2591, 'rollbackTransaction', 'Revierte una transacción en la base de datos');
INSERT INTO public.method (id, name, description) VALUES (2592, 'endTransaction', 'Finaliza una transacción en la base de datos');
INSERT INTO public.method (id, name, description) VALUES (2593, 'executeJsonTransaction', 'Ejecuta una serie de consultas dentro de una transacción, pasándole los parámetros como valores de las keys ({ query: [params] })');
INSERT INTO public.method (id, name, description) VALUES (2594, 'init', 'Inicializa el sistema de sesiones');
INSERT INTO public.method (id, name, description) VALUES (2595, 'login', 'Inicia sesión para un usuario');
INSERT INTO public.method (id, name, description) VALUES (2596, 'register', 'Registra un nuevo usuario');
INSERT INTO public.method (id, name, description) VALUES (2597, 'changeActiveProfile', 'Cambia el perfil activo del usuario');
INSERT INTO public.method (id, name, description) VALUES (2598, 'forgotPassword', 'Inicia el proceso de recuperación de contraseña');
INSERT INTO public.method (id, name, description) VALUES (2599, 'resetPassword', 'Restablece la contraseña del usuario');
INSERT INTO public.method (id, name, description) VALUES (2600, 'createAndUpdateSession', 'Crea y actualiza la sesión del usuario');
INSERT INTO public.method (id, name, description) VALUES (2601, 'createSession', 'Crea una nueva sesión');
INSERT INTO public.method (id, name, description) VALUES (2602, 'updateSession', 'Actualiza los datos de la sesión');
INSERT INTO public.method (id, name, description) VALUES (2603, 'destroySession', 'Destruye la sesión actual');
INSERT INTO public.method (id, name, description) VALUES (2604, 'getSession', 'Obtiene los datos de la sesión');
INSERT INTO public.method (id, name, description) VALUES (2605, 'existSession', 'Verifica si existe una sesión activa');
INSERT INTO public.method (id, name, description) VALUES (2606, 'sendEmail', 'Envía un correo electrónico');
INSERT INTO public.method (id, name, description) VALUES (2607, 'sendRecoveryEmail', 'Envía un correo electrónico de recuperación');
INSERT INTO public.method (id, name, description) VALUES (2608, 'generateToken', 'Genera un nuevo token');
INSERT INTO public.method (id, name, description) VALUES (2609, 'verifyToken', 'Verifica un token existente');
INSERT INTO public.method (id, name, description) VALUES (2610, 'validateUsername', 'Valida un nombre de usuario');
INSERT INTO public.method (id, name, description) VALUES (2611, 'validateEmail', 'Valida un correo electrónico');
INSERT INTO public.method (id, name, description) VALUES (2612, 'validatePassword', 'Valida una contraseña');
INSERT INTO public.method (id, name, description) VALUES (2613, 'validateConfirmPassword', 'Valida la confirmación de la contraseña');
INSERT INTO public.method (id, name, description) VALUES (2614, 'getValidationValues', 'Obtiene los valores de validación');
INSERT INTO public.method (id, name, description) VALUES (2615, 'validateName', 'Valida un nombre');
INSERT INTO public.method (id, name, description) VALUES (2616, 'validateDescription', 'Valida una descripción');
INSERT INTO public.method (id, name, description) VALUES (2617, 'formatObjectParams', 'Convierte parámetros de objeto');
INSERT INTO public.method (id, name, description) VALUES (2618, 'formatArrayParams', 'Convierte parámetros de array');
INSERT INTO public.method (id, name, description) VALUES (2619, 'structureToOrderedArray', 'Convierte estructura a array ordenado');
INSERT INTO public.method (id, name, description) VALUES (2620, 'toUpperCaseFirstLetter', 'Convierte la primera letra a mayúscula');
INSERT INTO public.method (id, name, description) VALUES (2621, 'getAllDinamicMethodNames', 'Obtiene todos los nombres de métodos dinámicos');
INSERT INTO public.method (id, name, description) VALUES (2622, 'handleError', 'Maneja errores personalizados');
INSERT INTO public.method (id, name, description) VALUES (2623, 'updatebyid', 'updatebyid');
INSERT INTO public.method (id, name, description) VALUES (2624, 'deletebyid', 'deletebyid');
INSERT INTO public.method (id, name, description) VALUES (2625, 'executenamedquery', 'executenamedquery');
INSERT INTO public.method (id, name, description) VALUES (2626, 'changeactiveprofile', 'changeactiveprofile');
INSERT INTO public.method (id, name, description) VALUES (2627, 'parseMOP', 'Parsear los menus, opciones y perfiles a un formato iterable para el front');
INSERT INTO public.method (id, name, description) VALUES (2628, 'getUserProfiles', 'Obtiene los perfiles de un usuario');


--
-- TOC entry 5057 (class 0 OID 41142)
-- Dependencies: 227
-- Data for Name: method_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6546, 2578, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6547, 2578, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6548, 2578, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6549, 2579, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6550, 2579, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6551, 2580, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6552, 2580, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6553, 2581, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6554, 2581, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6555, 2582, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6556, 2582, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6557, 2583, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6558, 2583, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6559, 2584, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6560, 2584, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6561, 2585, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6562, 2585, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6563, 2586, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6564, 2586, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6565, 2587, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6566, 2587, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6567, 2587, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6568, 2588, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6569, 2588, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6570, 2588, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6571, 2589, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6572, 2589, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6573, 2590, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6574, 2590, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6575, 2591, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6576, 2591, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6577, 2592, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6578, 2592, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6579, 2593, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6580, 2593, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6581, 2594, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6582, 2594, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6583, 2595, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6584, 2595, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6585, 2595, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6586, 2595, 2);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6587, 2595, 3);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6588, 2596, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6589, 2596, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6590, 2596, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6591, 2596, 2);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6592, 2596, 3);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6593, 2597, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6594, 2597, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6595, 2597, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6596, 2597, 2);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6597, 2597, 3);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6598, 2598, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6599, 2598, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6600, 2598, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6601, 2598, 2);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6602, 2598, 3);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6603, 2599, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6604, 2599, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6605, 2599, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6606, 2599, 2);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6607, 2599, 3);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6608, 2600, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6609, 2600, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6610, 2601, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6611, 2601, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6612, 2602, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6613, 2602, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6614, 2603, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6615, 2603, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6616, 2604, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6617, 2604, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6618, 2605, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6619, 2605, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6620, 2606, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6621, 2606, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6622, 2606, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6623, 2606, 2);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6624, 2606, 3);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6625, 2607, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6626, 2607, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6627, 2607, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6628, 2607, 2);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6629, 2607, 3);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6630, 2608, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6631, 2608, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6632, 2608, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6633, 2609, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6634, 2609, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6635, 2609, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6636, 2610, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6637, 2610, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6638, 2610, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6639, 2611, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6640, 2611, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6641, 2611, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6642, 2612, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6643, 2612, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6644, 2612, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6645, 2613, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6646, 2613, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6647, 2613, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6648, 2614, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6649, 2614, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6650, 2614, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6651, 2615, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6652, 2615, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6653, 2615, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6654, 2616, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6655, 2616, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6656, 2616, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6657, 2617, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6658, 2618, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6659, 2619, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6660, 2620, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6661, 2620, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6662, 2620, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6663, 2621, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6664, 2621, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6665, 2621, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6666, 2622, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6667, 2622, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6668, 2622, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6669, 2627, 3);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6670, 2627, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6671, 2627, 11);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6672, 2627, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6674, 2627, 2);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6675, 2628, 1);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6676, 2628, 2);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6677, 2628, 3);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6678, 2628, 10);
INSERT INTO public.method_profile (id, id_method, id_profile) VALUES (6679, 2628, 11);


--
-- TOC entry 5059 (class 0 OID 41149)
-- Dependencies: 229
-- Data for Name: option; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.option (id, name, description, tx) VALUES (441, 'Crear Perfil', 'Crear un nuevo Perfil de Usuario', 2572);
INSERT INTO public.option (id, name, description, tx) VALUES (442, 'Actualizar Perfil', 'Actualizar un Perfil de Usuario existente', 2616);
INSERT INTO public.option (id, name, description, tx) VALUES (443, 'Eliminar Perfil', 'Eliminar un Perfil de Usuario existente', 2617);
INSERT INTO public.option (id, name, description, tx) VALUES (444, 'Listar Perfiles', 'Listar todos los Perfiles de Usuario', 2577);
INSERT INTO public.option (id, name, description, tx) VALUES (445, 'Asignar Permiso de Opción a Perfil', 'Asignar un Permiso de Opción a un Perfil', 2618);
INSERT INTO public.option (id, name, description, tx) VALUES (446, 'Remover Permiso de Opción de Perfil', 'Remover un Permiso de Opción de un Perfil', 2618);
INSERT INTO public.option (id, name, description, tx) VALUES (447, 'Asignar Permiso de Método de Perfil', 'Asignar un Permiso de Método a un Perfil', 2618);
INSERT INTO public.option (id, name, description, tx) VALUES (448, 'Remover Permiso de Método de Perfil', 'Remover un Permiso de Método de un Perfil', 2618);
INSERT INTO public.option (id, name, description, tx) VALUES (451, 'Crear Usuario', 'Crear un nuevo Usuario', 2572);
INSERT INTO public.option (id, name, description, tx) VALUES (452, 'Actualizar Usuario', 'Actualizar un Usuario existente', 2616);
INSERT INTO public.option (id, name, description, tx) VALUES (453, 'Eliminar Usuario', 'Eliminar un Usuario existente', 2617);
INSERT INTO public.option (id, name, description, tx) VALUES (454, 'Listar Usuarios', 'Listar todos los Usuarios', 2577);


--
-- TOC entry 5061 (class 0 OID 41156)
-- Dependencies: 231
-- Data for Name: option_menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (519, 258, 441);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (520, 258, 442);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (521, 258, 443);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (522, 258, 444);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (523, 259, 445);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (524, 259, 446);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (525, 259, 447);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (526, 259, 448);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (529, 260, 451);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (530, 260, 452);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (531, 260, 453);
INSERT INTO public.option_menu (id, id_menu, id_option) VALUES (532, 260, 454);


--
-- TOC entry 5063 (class 0 OID 41163)
-- Dependencies: 233
-- Data for Name: option_meta; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5064 (class 0 OID 41169)
-- Dependencies: 234
-- Data for Name: option_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1219, 441, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1220, 441, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1221, 441, 11);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1222, 442, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1223, 442, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1224, 442, 11);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1225, 443, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1226, 443, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1227, 443, 11);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1228, 444, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1229, 444, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1230, 444, 11);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1231, 445, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1232, 445, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1233, 446, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1234, 446, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1235, 447, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1236, 447, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1237, 448, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1238, 448, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1249, 451, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1250, 451, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1251, 452, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1252, 452, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1253, 453, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1254, 453, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1255, 454, 10);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1256, 454, 1);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1257, 451, 11);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1259, 452, 11);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1260, 453, 11);
INSERT INTO public.option_profile (id, id_option, id_profile) VALUES (1261, 454, 11);


--
-- TOC entry 5066 (class 0 OID 41176)
-- Dependencies: 236
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.profile (id, name, description) VALUES (1, 'administrador de seguridad', NULL);
INSERT INTO public.profile (id, name, description) VALUES (2, 'administrador de eventos', NULL);
INSERT INTO public.profile (id, name, description) VALUES (3, 'participante', NULL);
INSERT INTO public.profile (id, name, description) VALUES (10, 'super administrador', NULL);
INSERT INTO public.profile (id, name, description) VALUES (11, 'administrador de base de datos', NULL);


--
-- TOC entry 5068 (class 0 OID 41182)
-- Dependencies: 238
-- Data for Name: subsystem; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.subsystem (id, name, description) VALUES (204, 'security', 'Subsistema de seguridad');
INSERT INTO public.subsystem (id, name, description) VALUES (205, 'session', 'Subsistema de gestión de sesiones');
INSERT INTO public.subsystem (id, name, description) VALUES (206, 'ftx', 'Full transactions');


--
-- TOC entry 5069 (class 0 OID 41187)
-- Dependencies: 239
-- Data for Name: subsystem_class; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (497, 204, 532);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (498, 205, 534);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (499, 205, 535);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (500, 206, 536);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (501, 206, 537);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (502, 206, 538);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (503, 206, 539);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (504, 206, 540);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (505, 206, 541);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (506, 206, 542);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (507, 206, 544);
INSERT INTO public.subsystem_class (id, id_subsystem, id_class) VALUES (508, 206, 543);


--
-- TOC entry 5072 (class 0 OID 41195)
-- Dependencies: 242
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction (tx, id_subsystem, id_class, id_method, description, nombre_transaccion) FROM stdin;
2571	204	532	2578	Realiza una consulta en la base de datos	query
2572	204	532	2579	Inserta datos en la base de datos	insert
2573	204	532	2580	Actualiza datos por ID	updateById
2574	204	532	2581	Actualiza datos por nombre de usuario	updateByUsername
2575	204	532	2582	Elimina datos por ID	deleteById
2576	204	532	2583	Elimina datos por nombre de usuario	deleteByUsername
2577	204	532	2584	Obtiene todos los datos de una tabla	get
2578	204	532	2585	Obtiene datos filtrados por condiciones	getWhere
2579	204	532	2586	Elimina todos los datos de una tabla	deleteAll
2580	204	532	2587	Ejecuta una consulta nombrada predefinida	executeNamedQuery
2581	204	532	2588	Ejecuta una serie de consultas nombradas predefinidas, pasándole los parámetros como valores de las keys ({ namedQuery: [params] })	executeJsonNamedQuery
2582	204	532	2589	Inicia una transacción en la base de datos	beginTransaction
2583	204	532	2590	Confirma una transacción en la base de datos	commitTransaction
2584	204	532	2591	Revierte una transacción en la base de datos	rollbackTransaction
2585	204	532	2592	Finaliza una transacción en la base de datos	endTransaction
2586	204	532	2593	Ejecuta una serie de consultas dentro de una transacción, pasándole los parámetros como valores de las keys ({ query: [params] })	executeJsonTransaction
2587	205	534	2594	Inicializa el sistema de sesiones	init
2588	205	534	2595	Inicia sesión para un usuario	login
2589	205	534	2596	Registra un nuevo usuario	register
2590	205	534	2597	Cambia el perfil activo del usuario	changeActiveProfile
2591	205	534	2598	Inicia el proceso de recuperación de contraseña	forgotPassword
2592	205	534	2599	Restablece la contraseña del usuario	resetPassword
2593	205	535	2600	Crea y actualiza la sesión del usuario	createAndUpdateSession
2594	205	535	2601	Crea una nueva sesión	createSession
2595	205	535	2602	Actualiza los datos de la sesión	updateSession
2596	205	535	2603	Destruye la sesión actual	destroySession
2597	205	535	2604	Obtiene los datos de la sesión	getSession
2598	205	535	2605	Verifica si existe una sesión activa	existSession
2599	206	536	2606	Envía un correo electrónico	sendEmail
2600	206	536	2607	Envía un correo electrónico de recuperación	sendRecoveryEmail
2601	206	537	2608	Genera un nuevo token	generateToken
2602	206	537	2609	Verifica un token existente	verifyToken
2603	206	538	2610	Valida un nombre de usuario	validateUsername
2604	206	538	2611	Valida un correo electrónico	validateEmail
2605	206	538	2612	Valida una contraseña	validatePassword
2606	206	538	2613	Valida la confirmación de la contraseña	validateConfirmPassword
2607	206	538	2614	Obtiene los valores de validación	getValidationValues
2608	206	538	2615	Valida un nombre	validateName
2609	206	538	2616	Valida una descripción	validateDescription
2610	206	539	2617	Convierte parámetros de objeto	formatObjectParams
2611	206	539	2618	Convierte parámetros de array	formatArrayParams
2612	206	539	2619	Convierte estructura a array ordenado	structureToOrderedArray
2613	206	540	2620	Convierte la primera letra a mayúscula	toUpperCaseFirstLetter
2614	206	540	2621	Obtiene todos los nombres de métodos dinámicos	getAllDinamicMethodNames
2615	206	540	2622	Maneja errores personalizados	handleError
2616	204	532	2623	security.dbms.updatebyid	updatebyid
2617	204	532	2624	security.dbms.deletebyid	deletebyid
2618	204	532	2625	security.dbms.executenamedquery	executenamedquery
2619	205	534	2626	session.session.changeactiveprofile	changeactiveprofile
2620	204	532	2627	Parsear los menus, opciones y perfiles a un formato iterable para el front	parseMOP
2621	206	541	2628	Obtiene los perfiles de usuario	getUserProfiles
\.
--
-- TOC entry 5074 (class 0 OID 41203)
-- Dependencies: 244
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."user" (id, username, password, email, register_date, status) VALUES (17, 'Bustoss', '$2b$10$rnliT0ZflZ6MpGliSAq7VuoZ9eq.pfprG.y1xJzXvdyPDaJbOI6Wq', 'luissdavidbustosnunez@gmail.com', '2025-10-19', 'active');
INSERT INTO public."user" (id, username, password, email, register_date, status) VALUES (27, 'Bustosss', '$2b$10$K299m7oBG5MEPnYxFxMIDulX54dEjyURFyJBUtTyfEYbm0Kv8JIVq', 'luisssdavidbustosnunez@gmail.com', '2025-10-19', 'active');
INSERT INTO public."user" (id, username, password, email, register_date, status) VALUES (60, 'test_user_o8udh3', '$2b$10$Ph8BVOxC11GMQ25E6ZnCV.HyO45M2clPRtJBkNwmUIXmbfGYhRqn2', 'user_o8udh3@example.com', '2025-11-07', 'active');
INSERT INTO public."user" (id, username, password, email, register_date, status) VALUES (32, 'Bustos4', 'QWEqwe123·', 'luis4davidbustosnunez@gmail.com', '2025-10-22', 'active');
INSERT INTO public."user" (id, username, password, email, register_date, status) VALUES (34, 'Bustos1', 'QWEqwe123·', 'luis1davidbustosnunez@gmail.com', '2025-10-22', 'active');
INSERT INTO public."user" (id, username, password, email, register_date, status) VALUES (50, 'repo_user_test', '$2b$10$JM6gSDaWvarfy1jxr34/gOMZgYfvYuPuAulgor7HPjxFxP5fY1cm6', 'repo_user_test@example.com', '2025-11-06', 'active');
INSERT INTO public."user" (id, username, password, email, register_date, status) VALUES (66, 'Usuario', '$2b$10$R1mPDf.EcXd4gHXk89xo7eMiguZja.Kwl/D0JQhpfo3fxgjy5ALLK', 'usuario@example.com', '2025-11-07', 'active');
INSERT INTO public."user" (id, username, password, email, register_date, status) VALUES (16, 'Bustos', '$2b$10$ECWHbiA9UV9h6hTzztUM.Oa8IC9GbCx5VyrjJhkh.Puq9ReogQrWO', 'luisdavidbustosnunez@gmail.com', '2025-10-19', 'active');
INSERT INTO public."user" (id, username, password, email, register_date, status) VALUES (67, 'Pepito', '$2b$10$EACSdLZZWkz.fvVQU4ggNeC6zYQ95LSawfx7DqL.jYjZwhlBX4VAu', 'pepito@gmail.com', '2025-11-14', 'active');
INSERT INTO public."user" (id, username, password, email, register_date, status) VALUES (69, 'PepitoAbc', '$2b$10$6iqlRztAuNjxY.inu6LD9u9S/eFnsQBLglUFBnnDSinkJPALQQndK', 'pepitoabc@gmail.com', '2025-11-14', 'active');


--
-- TOC entry 5076 (class 0 OID 41213)
-- Dependencies: 246
-- Data for Name: user_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_profile (id_user, id_profile, id) VALUES (16, 1, 19);
INSERT INTO public.user_profile (id_user, id_profile, id) VALUES (16, 3, 20);
INSERT INTO public.user_profile (id_user, id_profile, id) VALUES (17, 2, 21);
INSERT INTO public.user_profile (id_user, id_profile, id) VALUES (27, 3, 22);
INSERT INTO public.user_profile (id_user, id_profile, id) VALUES (34, 1, 42);
INSERT INTO public.user_profile (id_user, id_profile, id) VALUES (34, 3, 43);
INSERT INTO public.user_profile (id_user, id_profile, id) VALUES (60, 3, 70);
INSERT INTO public.user_profile (id_user, id_profile, id) VALUES (66, 3, 74);
INSERT INTO public.user_profile (id_user, id_profile, id) VALUES (69, 3, 75);


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 220
-- Name: class_id_class_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_id_class_seq', 544, true);


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 222
-- Name: class_method_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_method_id_seq', 2653, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 224
-- Name: menu_id_menu_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_id_menu_seq', 260, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 226
-- Name: method_id_method_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.method_id_method_seq', 2628, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 228
-- Name: method_profile_id_method_profile_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.method_profile_id_method_profile_seq', 6679, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 230
-- Name: option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.option_id_seq', 454, true);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 232
-- Name: option_menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.option_menu_id_seq', 532, true);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 235
-- Name: option_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.option_profile_id_seq', 1261, true);


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 237
-- Name: profile_id_profile_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_id_profile_seq', 25, true);


--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 240
-- Name: subsystem_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subsystem_class_id_seq', 509, true);


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 241
-- Name: subsystem_id_subsystem_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subsystem_id_subsystem_seq', 206, true);


--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 243
-- Name: transaction_id_transaction_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaction_id_transaction_seq', 2621, true);


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 245
-- Name: user_id_username_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_username_seq', 69, true);


--
-- TOC entry 5111 (class 0 OID 0)
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


-- Completed on 2025-11-14 05:22:28

--
-- PostgreSQL database dump complete
--
\unrestrict EmJSEIiXG5KIvVlTA47dkvejpTCUn57CcbAQlTpSggGHgiDJrb4Ld1CRRwxzMbs