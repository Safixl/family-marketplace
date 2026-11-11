--
-- PostgreSQL database dump
--

\restrict 0cleg24KJuHDv6aJfKr0nGHEbL4kEfqzgy61vUHhHrKhdgRMoI8DQ8Z2RICokBL

-- Dumped from database version 16.15 (Homebrew)
-- Dumped by pg_dump version 16.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.achievements (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    description character varying(2000),
    icon character varying(64) DEFAULT '🏆'::character varying NOT NULL,
    reward_amount numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    target_type character varying(32) DEFAULT 'NONE'::character varying NOT NULL,
    target_value integer DEFAULT 0 NOT NULL,
    group_key character varying(64),
    skill character varying(32),
    level integer DEFAULT 0 NOT NULL,
    hidden_reward boolean DEFAULT false NOT NULL,
    reward_store_id bigint,
    xp_reward integer DEFAULT 0 NOT NULL,
    title character varying(100)
);


ALTER TABLE public.achievements OWNER TO familymarket;

--
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.achievements_id_seq OWNER TO familymarket;

--
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- Name: avatar_items; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.avatar_items (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    description character varying(500),
    category character varying(32) DEFAULT 'SKIN'::character varying NOT NULL,
    icon character varying(64) DEFAULT '🎨'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.avatar_items OWNER TO familymarket;

--
-- Name: avatar_items_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.avatar_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.avatar_items_id_seq OWNER TO familymarket;

--
-- Name: avatar_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.avatar_items_id_seq OWNED BY public.avatar_items.id;


--
-- Name: balances; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.balances (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    store_id bigint NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.balances OWNER TO familymarket;

--
-- Name: balances_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.balances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.balances_id_seq OWNER TO familymarket;

--
-- Name: balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.balances_id_seq OWNED BY public.balances.id;


--
-- Name: child_achievements; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.child_achievements (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    achievement_id bigint NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.child_achievements OWNER TO familymarket;

--
-- Name: child_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.child_achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.child_achievements_id_seq OWNER TO familymarket;

--
-- Name: child_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.child_achievements_id_seq OWNED BY public.child_achievements.id;


--
-- Name: child_avatar_items; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.child_avatar_items (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    item_id bigint NOT NULL,
    equipped boolean DEFAULT false NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.child_avatar_items OWNER TO familymarket;

--
-- Name: child_avatar_items_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.child_avatar_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.child_avatar_items_id_seq OWNER TO familymarket;

--
-- Name: child_avatar_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.child_avatar_items_id_seq OWNED BY public.child_avatar_items.id;


--
-- Name: child_equipment; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.child_equipment (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    equipment_id bigint NOT NULL,
    is_identified boolean DEFAULT false NOT NULL,
    equipped boolean DEFAULT false NOT NULL,
    acquired_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.child_equipment OWNER TO familymarket;

--
-- Name: child_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.child_equipment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.child_equipment_id_seq OWNER TO familymarket;

--
-- Name: child_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.child_equipment_id_seq OWNED BY public.child_equipment.id;


--
-- Name: child_limits; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.child_limits (
    child_id bigint NOT NULL,
    tv_minutes integer DEFAULT 0 NOT NULL,
    pc_minutes integer DEFAULT 0 NOT NULL,
    console_minutes integer DEFAULT 0 NOT NULL,
    phone_minutes integer DEFAULT 0 NOT NULL,
    tablet_minutes integer DEFAULT 0 NOT NULL,
    pocket_weekly integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    settings text
);


ALTER TABLE public.child_limits OWNER TO familymarket;

--
-- Name: child_quest_states; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.child_quest_states (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    quest_id bigint NOT NULL,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    accepted_at timestamp with time zone,
    starts_at timestamp with time zone,
    next_available_at timestamp with time zone,
    completed_at timestamp with time zone
);


ALTER TABLE public.child_quest_states OWNER TO familymarket;

--
-- Name: child_quest_states_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.child_quest_states_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.child_quest_states_id_seq OWNER TO familymarket;

--
-- Name: child_quest_states_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.child_quest_states_id_seq OWNED BY public.child_quest_states.id;


--
-- Name: child_task_cards; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.child_task_cards (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    card_id bigint NOT NULL,
    day date NOT NULL,
    status character varying(20) DEFAULT 'PENDING_PARENT'::character varying NOT NULL,
    started_at timestamp with time zone,
    submitted_at timestamp with time zone,
    answers_json character varying(8000),
    result_percent integer
);


ALTER TABLE public.child_task_cards OWNER TO familymarket;

--
-- Name: child_task_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.child_task_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.child_task_cards_id_seq OWNER TO familymarket;

--
-- Name: child_task_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.child_task_cards_id_seq OWNED BY public.child_task_cards.id;


--
-- Name: child_tracked_achievements; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.child_tracked_achievements (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    achievement_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.child_tracked_achievements OWNER TO familymarket;

--
-- Name: child_tracked_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.child_tracked_achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.child_tracked_achievements_id_seq OWNER TO familymarket;

--
-- Name: child_tracked_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.child_tracked_achievements_id_seq OWNED BY public.child_tracked_achievements.id;


--
-- Name: children; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.children (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    avatar_emoji character varying(16) DEFAULT '😊'::character varying NOT NULL,
    access_key character varying(64) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    age integer,
    theme character varying(32) DEFAULT 'wow'::character varying NOT NULL,
    home_widgets character varying(500) DEFAULT '["balances","stats","achievements","orders"]'::character varying NOT NULL,
    birth_date date
);


ALTER TABLE public.children OWNER TO familymarket;

--
-- Name: children_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.children_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.children_id_seq OWNER TO familymarket;

--
-- Name: children_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.children_id_seq OWNED BY public.children.id;


--
-- Name: daily_logs; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.daily_logs (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    skill character varying(32) NOT NULL,
    day date NOT NULL,
    payload character varying(4000),
    points numeric(12,2) DEFAULT 0 NOT NULL,
    xp integer DEFAULT 0 NOT NULL,
    full_clear boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.daily_logs OWNER TO familymarket;

--
-- Name: daily_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.daily_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_logs_id_seq OWNER TO familymarket;

--
-- Name: daily_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.daily_logs_id_seq OWNED BY public.daily_logs.id;


--
-- Name: deposits; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.deposits (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    store_id bigint NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    rate numeric(5,2) DEFAULT 5 NOT NULL,
    last_interest_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.deposits OWNER TO familymarket;

--
-- Name: deposits_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.deposits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deposits_id_seq OWNER TO familymarket;

--
-- Name: deposits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.deposits_id_seq OWNED BY public.deposits.id;


--
-- Name: dungeon_characters; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.dungeon_characters (
    child_id bigint NOT NULL,
    class character varying(16),
    status character varying(20) DEFAULT 'LOCKED'::character varying NOT NULL,
    stamina integer DEFAULT 100 NOT NULL,
    max_stamina_bonus integer DEFAULT 0 NOT NULL,
    last_refresh_day date,
    victories integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    max_cleared_rank character varying(4) DEFAULT 'NONE'::character varying NOT NULL
);


ALTER TABLE public.dungeon_characters OWNER TO familymarket;

--
-- Name: dungeon_sessions; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.dungeon_sessions (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    dungeon_code character varying(32) NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    rooms_total integer NOT NULL,
    current_room integer DEFAULT 1 NOT NULL,
    tactic_ok boolean DEFAULT false NOT NULL,
    discovered_json text DEFAULT '[]'::text NOT NULL,
    killed_json text DEFAULT '[]'::text NOT NULL,
    log_json text DEFAULT '[]'::text NOT NULL,
    reward_coins numeric(12,2) DEFAULT 0 NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone,
    resume_day date,
    rank character varying(4) DEFAULT 'F'::character varying NOT NULL,
    monster_level integer DEFAULT 1 NOT NULL,
    dungeon_name character varying(150),
    dungeon_emoji character varying(8),
    reward_claimed boolean DEFAULT false NOT NULL
);


ALTER TABLE public.dungeon_sessions OWNER TO familymarket;

--
-- Name: dungeon_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.dungeon_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dungeon_sessions_id_seq OWNER TO familymarket;

--
-- Name: dungeon_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.dungeon_sessions_id_seq OWNED BY public.dungeon_sessions.id;


--
-- Name: equipment_defs; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.equipment_defs (
    id bigint NOT NULL,
    code character varying(40) NOT NULL,
    name character varying(150) NOT NULL,
    slot character varying(16) NOT NULL,
    rarity character varying(16) DEFAULT 'COMMON'::character varying NOT NULL,
    stat_multiplier numeric(5,2) DEFAULT 1 NOT NULL,
    icon character varying(8) DEFAULT '🗡️'::character varying NOT NULL,
    description character varying(300)
);


ALTER TABLE public.equipment_defs OWNER TO familymarket;

--
-- Name: equipment_defs_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.equipment_defs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_defs_id_seq OWNER TO familymarket;

--
-- Name: equipment_defs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.equipment_defs_id_seq OWNED BY public.equipment_defs.id;


--
-- Name: house_check_requests; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.house_check_requests (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    store_id bigint NOT NULL,
    day date NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    room_score integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone
);


ALTER TABLE public.house_check_requests OWNER TO familymarket;

--
-- Name: house_check_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.house_check_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.house_check_requests_id_seq OWNER TO familymarket;

--
-- Name: house_check_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.house_check_requests_id_seq OWNED BY public.house_check_requests.id;


--
-- Name: house_days; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.house_days (
    id bigint NOT NULL,
    store_id bigint NOT NULL,
    child_id bigint NOT NULL,
    day date NOT NULL,
    room_score integer DEFAULT 0 NOT NULL,
    living_score integer DEFAULT 0 NOT NULL,
    points numeric(12,2) DEFAULT 0 NOT NULL,
    settled boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    comment character varying(2000)
);


ALTER TABLE public.house_days OWNER TO familymarket;

--
-- Name: house_days_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.house_days_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.house_days_id_seq OWNER TO familymarket;

--
-- Name: house_days_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.house_days_id_seq OWNED BY public.house_days.id;


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.inventory_items (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    store_id bigint NOT NULL,
    product_id bigint NOT NULL,
    purchase_id bigint NOT NULL,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    item_type character varying(20) DEFAULT 'COUPON'::character varying NOT NULL
);


ALTER TABLE public.inventory_items OWNER TO familymarket;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.inventory_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_items_id_seq OWNER TO familymarket;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.inventory_items_id_seq OWNED BY public.inventory_items.id;


--
-- Name: lang_card_attempts; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.lang_card_attempts (
    id bigint NOT NULL,
    task_id bigint NOT NULL,
    answer character varying(300) NOT NULL,
    correct boolean NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lang_card_attempts OWNER TO familymarket;

--
-- Name: lang_card_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.lang_card_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lang_card_attempts_id_seq OWNER TO familymarket;

--
-- Name: lang_card_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.lang_card_attempts_id_seq OWNED BY public.lang_card_attempts.id;


--
-- Name: lang_card_settings; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.lang_card_settings (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    task_type character varying(32) NOT NULL,
    minutes integer DEFAULT 20 NOT NULL,
    difficulty character varying(8) DEFAULT 'EASY'::character varying NOT NULL
);


ALTER TABLE public.lang_card_settings OWNER TO familymarket;

--
-- Name: lang_card_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.lang_card_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lang_card_settings_id_seq OWNER TO familymarket;

--
-- Name: lang_card_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.lang_card_settings_id_seq OWNED BY public.lang_card_settings.id;


--
-- Name: lang_card_tasks; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.lang_card_tasks (
    id bigint NOT NULL,
    card_id bigint NOT NULL,
    task_type character varying(32) NOT NULL,
    text character varying(600) NOT NULL,
    answer character varying(200) DEFAULT ''::character varying NOT NULL,
    word_id bigint
);


ALTER TABLE public.lang_card_tasks OWNER TO familymarket;

--
-- Name: lang_card_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.lang_card_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lang_card_tasks_id_seq OWNER TO familymarket;

--
-- Name: lang_card_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.lang_card_tasks_id_seq OWNED BY public.lang_card_tasks.id;


--
-- Name: lang_cards; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.lang_cards (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    card_date date NOT NULL,
    task_type character varying(32) NOT NULL,
    minutes integer NOT NULL,
    difficulty character varying(8) DEFAULT 'EASY'::character varying NOT NULL,
    status character varying(20) DEFAULT 'CREATED'::character varying NOT NULL,
    started_at timestamp with time zone,
    deadline timestamp with time zone,
    submitted_at timestamp with time zone,
    result_percent integer,
    base_reward integer DEFAULT 0 NOT NULL,
    multiplier integer DEFAULT 1 NOT NULL,
    xp_earned integer DEFAULT 0 NOT NULL,
    parent_comment character varying(300),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lang_cards OWNER TO familymarket;

--
-- Name: lang_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.lang_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lang_cards_id_seq OWNER TO familymarket;

--
-- Name: lang_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.lang_cards_id_seq OWNED BY public.lang_cards.id;


--
-- Name: lang_word_progress; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.lang_word_progress (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    word_id bigint NOT NULL,
    status character varying(16) DEFAULT 'ACTIVE'::character varying NOT NULL,
    correct_streak integer DEFAULT 0 NOT NULL,
    total_correct integer DEFAULT 0 NOT NULL,
    total_attempts integer DEFAULT 0 NOT NULL,
    activated_at timestamp with time zone,
    learned_at timestamp with time zone
);


ALTER TABLE public.lang_word_progress OWNER TO familymarket;

--
-- Name: lang_word_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.lang_word_progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lang_word_progress_id_seq OWNER TO familymarket;

--
-- Name: lang_word_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.lang_word_progress_id_seq OWNED BY public.lang_word_progress.id;


--
-- Name: lang_words; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.lang_words (
    id bigint NOT NULL,
    lang character varying(8) DEFAULT 'en'::character varying NOT NULL,
    foreign_text character varying(100) NOT NULL,
    ru_text character varying(100) NOT NULL,
    difficulty_level integer DEFAULT 1 NOT NULL,
    sort_order integer NOT NULL
);


ALTER TABLE public.lang_words OWNER TO familymarket;

--
-- Name: lang_words_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.lang_words_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lang_words_id_seq OWNER TO familymarket;

--
-- Name: lang_words_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.lang_words_id_seq OWNED BY public.lang_words.id;


--
-- Name: limit_events; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.limit_events (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    limit_type character varying(20) NOT NULL,
    action character varying(20) NOT NULL,
    seconds integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.limit_events OWNER TO familymarket;

--
-- Name: limit_events_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.limit_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.limit_events_id_seq OWNER TO familymarket;

--
-- Name: limit_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.limit_events_id_seq OWNED BY public.limit_events.id;


--
-- Name: limit_freeze; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.limit_freeze (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    limit_type character varying(20) NOT NULL,
    frozen boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.limit_freeze OWNER TO familymarket;

--
-- Name: limit_freeze_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.limit_freeze_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.limit_freeze_id_seq OWNER TO familymarket;

--
-- Name: limit_freeze_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.limit_freeze_id_seq OWNED BY public.limit_freeze.id;


--
-- Name: limit_usage; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.limit_usage (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    limit_type character varying(20) NOT NULL,
    day date NOT NULL,
    used_seconds integer DEFAULT 0 NOT NULL,
    extended_seconds integer DEFAULT 0 NOT NULL,
    running boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone
);


ALTER TABLE public.limit_usage OWNER TO familymarket;

--
-- Name: limit_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.limit_usage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.limit_usage_id_seq OWNER TO familymarket;

--
-- Name: limit_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.limit_usage_id_seq OWNED BY public.limit_usage.id;


--
-- Name: logic_card_attempts; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.logic_card_attempts (
    id bigint NOT NULL,
    task_id bigint NOT NULL,
    answer character varying(100) NOT NULL,
    correct boolean NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.logic_card_attempts OWNER TO familymarket;

--
-- Name: logic_card_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.logic_card_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logic_card_attempts_id_seq OWNER TO familymarket;

--
-- Name: logic_card_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.logic_card_attempts_id_seq OWNED BY public.logic_card_attempts.id;


--
-- Name: logic_card_tasks; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.logic_card_tasks (
    id bigint NOT NULL,
    card_id bigint NOT NULL,
    topic_code character varying(32) NOT NULL,
    task_type character varying(16) NOT NULL,
    text character varying(500) NOT NULL,
    answer character varying(100) NOT NULL
);


ALTER TABLE public.logic_card_tasks OWNER TO familymarket;

--
-- Name: logic_card_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.logic_card_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logic_card_tasks_id_seq OWNER TO familymarket;

--
-- Name: logic_card_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.logic_card_tasks_id_seq OWNED BY public.logic_card_tasks.id;


--
-- Name: logic_cards; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.logic_cards (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    card_date date NOT NULL,
    final_level character varying(16) NOT NULL,
    label character varying(50) NOT NULL,
    description character varying(500) NOT NULL,
    task_count integer NOT NULL,
    task_types character varying(200) NOT NULL,
    minutes integer NOT NULL,
    status character varying(20) DEFAULT 'CREATED'::character varying NOT NULL,
    started_at timestamp with time zone,
    deadline timestamp with time zone,
    submitted_at timestamp with time zone,
    result_percent integer,
    xp_reward integer DEFAULT 0 NOT NULL,
    xp_earned integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.logic_cards OWNER TO familymarket;

--
-- Name: logic_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.logic_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logic_cards_id_seq OWNER TO familymarket;

--
-- Name: logic_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.logic_cards_id_seq OWNED BY public.logic_cards.id;


--
-- Name: logic_olympiad_cards; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.logic_olympiad_cards (
    id bigint NOT NULL,
    title character varying(200) NOT NULL,
    grade_label character varying(50) NOT NULL,
    minutes integer DEFAULT 60 NOT NULL
);


ALTER TABLE public.logic_olympiad_cards OWNER TO familymarket;

--
-- Name: logic_olympiad_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.logic_olympiad_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logic_olympiad_cards_id_seq OWNER TO familymarket;

--
-- Name: logic_olympiad_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.logic_olympiad_cards_id_seq OWNED BY public.logic_olympiad_cards.id;


--
-- Name: logic_olympiad_tasks; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.logic_olympiad_tasks (
    id bigint NOT NULL,
    card_id bigint NOT NULL,
    task_type character varying(16) NOT NULL,
    text character varying(500) NOT NULL,
    answer character varying(100) NOT NULL
);


ALTER TABLE public.logic_olympiad_tasks OWNER TO familymarket;

--
-- Name: logic_olympiad_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.logic_olympiad_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logic_olympiad_tasks_id_seq OWNER TO familymarket;

--
-- Name: logic_olympiad_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.logic_olympiad_tasks_id_seq OWNED BY public.logic_olympiad_tasks.id;


--
-- Name: logic_topic_settings; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.logic_topic_settings (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    topic_id bigint NOT NULL,
    active boolean DEFAULT true NOT NULL,
    base_difficulty character varying(16) DEFAULT 'MEDIUM'::character varying NOT NULL
);


ALTER TABLE public.logic_topic_settings OWNER TO familymarket;

--
-- Name: logic_topic_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.logic_topic_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logic_topic_settings_id_seq OWNER TO familymarket;

--
-- Name: logic_topic_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.logic_topic_settings_id_seq OWNED BY public.logic_topic_settings.id;


--
-- Name: logic_topics; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.logic_topics (
    id bigint NOT NULL,
    code character varying(32) NOT NULL,
    name character varying(100) NOT NULL,
    grade_label character varying(50) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.logic_topics OWNER TO familymarket;

--
-- Name: logic_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.logic_topics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logic_topics_id_seq OWNER TO familymarket;

--
-- Name: logic_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.logic_topics_id_seq OWNED BY public.logic_topics.id;


--
-- Name: math_attempts; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.math_attempts (
    id bigint NOT NULL,
    task_id bigint NOT NULL,
    child_id bigint NOT NULL,
    answer character varying(255) NOT NULL,
    correct boolean DEFAULT false NOT NULL,
    points numeric(12,2) DEFAULT 0 NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.math_attempts OWNER TO familymarket;

--
-- Name: math_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.math_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.math_attempts_id_seq OWNER TO familymarket;

--
-- Name: math_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.math_attempts_id_seq OWNED BY public.math_attempts.id;


--
-- Name: math_card_attempts; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.math_card_attempts (
    id bigint NOT NULL,
    task_id bigint NOT NULL,
    answer character varying(100) NOT NULL,
    correct boolean NOT NULL,
    attempted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.math_card_attempts OWNER TO familymarket;

--
-- Name: math_card_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.math_card_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.math_card_attempts_id_seq OWNER TO familymarket;

--
-- Name: math_card_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.math_card_attempts_id_seq OWNED BY public.math_card_attempts.id;


--
-- Name: math_card_tasks; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.math_card_tasks (
    id bigint NOT NULL,
    card_id bigint NOT NULL,
    topic_code character varying(32) NOT NULL,
    task_type character varying(16) NOT NULL,
    text character varying(500) NOT NULL,
    answer character varying(100) NOT NULL
);


ALTER TABLE public.math_card_tasks OWNER TO familymarket;

--
-- Name: math_card_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.math_card_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.math_card_tasks_id_seq OWNER TO familymarket;

--
-- Name: math_card_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.math_card_tasks_id_seq OWNED BY public.math_card_tasks.id;


--
-- Name: math_cards; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.math_cards (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    card_date date NOT NULL,
    final_level character varying(16) NOT NULL,
    label character varying(50) NOT NULL,
    description character varying(500) NOT NULL,
    task_count integer NOT NULL,
    task_types character varying(200) NOT NULL,
    minutes integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'CREATED'::character varying NOT NULL,
    started_at timestamp with time zone,
    deadline timestamp with time zone,
    submitted_at timestamp with time zone,
    result_percent integer,
    xp_reward integer DEFAULT 0 NOT NULL,
    xp_earned integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.math_cards OWNER TO familymarket;

--
-- Name: math_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.math_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.math_cards_id_seq OWNER TO familymarket;

--
-- Name: math_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.math_cards_id_seq OWNED BY public.math_cards.id;


--
-- Name: math_olympiad_cards; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.math_olympiad_cards (
    id bigint NOT NULL,
    title character varying(200) NOT NULL,
    grade_label character varying(50) NOT NULL,
    minutes integer DEFAULT 60 NOT NULL
);


ALTER TABLE public.math_olympiad_cards OWNER TO familymarket;

--
-- Name: math_olympiad_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.math_olympiad_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.math_olympiad_cards_id_seq OWNER TO familymarket;

--
-- Name: math_olympiad_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.math_olympiad_cards_id_seq OWNED BY public.math_olympiad_cards.id;


--
-- Name: math_olympiad_tasks; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.math_olympiad_tasks (
    id bigint NOT NULL,
    card_id bigint NOT NULL,
    task_type character varying(16) NOT NULL,
    text character varying(500) NOT NULL,
    answer character varying(100) NOT NULL
);


ALTER TABLE public.math_olympiad_tasks OWNER TO familymarket;

--
-- Name: math_olympiad_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.math_olympiad_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.math_olympiad_tasks_id_seq OWNER TO familymarket;

--
-- Name: math_olympiad_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.math_olympiad_tasks_id_seq OWNED BY public.math_olympiad_tasks.id;


--
-- Name: math_tasks; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.math_tasks (
    id bigint NOT NULL,
    store_id bigint NOT NULL,
    child_id bigint,
    title character varying(255) NOT NULL,
    description character varying(2000),
    answer character varying(255) NOT NULL,
    points numeric(12,2) DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.math_tasks OWNER TO familymarket;

--
-- Name: math_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.math_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.math_tasks_id_seq OWNER TO familymarket;

--
-- Name: math_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.math_tasks_id_seq OWNED BY public.math_tasks.id;


--
-- Name: math_topic_settings; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.math_topic_settings (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    topic_id bigint NOT NULL,
    active boolean DEFAULT true NOT NULL,
    base_difficulty character varying(16) DEFAULT 'MEDIUM'::character varying NOT NULL
);


ALTER TABLE public.math_topic_settings OWNER TO familymarket;

--
-- Name: math_topic_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.math_topic_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.math_topic_settings_id_seq OWNER TO familymarket;

--
-- Name: math_topic_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.math_topic_settings_id_seq OWNED BY public.math_topic_settings.id;


--
-- Name: math_topics; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.math_topics (
    id bigint NOT NULL,
    code character varying(32) NOT NULL,
    name character varying(100) NOT NULL,
    grade_label character varying(50) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.math_topics OWNER TO familymarket;

--
-- Name: math_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.math_topics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.math_topics_id_seq OWNER TO familymarket;

--
-- Name: math_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.math_topics_id_seq OWNED BY public.math_topics.id;


--
-- Name: parent_notifications; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.parent_notifications (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    child_id bigint,
    type character varying(40) NOT NULL,
    title character varying(255) NOT NULL,
    payload character varying(2000),
    ref_type character varying(40),
    ref_id bigint,
    status character varying(20) DEFAULT 'NEW'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.parent_notifications OWNER TO familymarket;

--
-- Name: parent_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.parent_notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parent_notifications_id_seq OWNER TO familymarket;

--
-- Name: parent_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.parent_notifications_id_seq OWNED BY public.parent_notifications.id;


--
-- Name: pocket_disbursements; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.pocket_disbursements (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    week_start date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pocket_disbursements OWNER TO familymarket;

--
-- Name: pocket_disbursements_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.pocket_disbursements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pocket_disbursements_id_seq OWNER TO familymarket;

--
-- Name: pocket_disbursements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.pocket_disbursements_id_seq OWNED BY public.pocket_disbursements.id;


--
-- Name: pocket_extensions; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.pocket_extensions (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    week_start date NOT NULL,
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pocket_extensions OWNER TO familymarket;

--
-- Name: pocket_extensions_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.pocket_extensions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pocket_extensions_id_seq OWNER TO familymarket;

--
-- Name: pocket_extensions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.pocket_extensions_id_seq OWNED BY public.pocket_extensions.id;


--
-- Name: pocket_requests; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.pocket_requests (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone
);


ALTER TABLE public.pocket_requests OWNER TO familymarket;

--
-- Name: pocket_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.pocket_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pocket_requests_id_seq OWNER TO familymarket;

--
-- Name: pocket_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.pocket_requests_id_seq OWNED BY public.pocket_requests.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    store_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    description character varying(2000),
    price numeric(12,2) NOT NULL,
    limit_per_child integer,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    effect_type character varying(20) DEFAULT 'NONE'::character varying NOT NULL,
    effect_limit character varying(20),
    effect_value integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO familymarket;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO familymarket;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.purchases (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    store_id bigint NOT NULL,
    product_id bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    confirmed_at timestamp with time zone
);


ALTER TABLE public.purchases OWNER TO familymarket;

--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.purchases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_id_seq OWNER TO familymarket;

--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: quest_submissions; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.quest_submissions (
    id bigint NOT NULL,
    quest_id bigint NOT NULL,
    child_id bigint NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    comment character varying(1000),
    photo_url character varying(1000),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone
);


ALTER TABLE public.quest_submissions OWNER TO familymarket;

--
-- Name: quest_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.quest_submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quest_submissions_id_seq OWNER TO familymarket;

--
-- Name: quest_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.quest_submissions_id_seq OWNED BY public.quest_submissions.id;


--
-- Name: quests; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.quests (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    child_id bigint,
    type character varying(20) DEFAULT 'STORY'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    description character varying(2000),
    icon character varying(64) DEFAULT '📜'::character varying NOT NULL,
    reward_store_id bigint,
    reward_amount numeric(12,2) DEFAULT 0 NOT NULL,
    xp_reward integer DEFAULT 0 NOT NULL,
    seasonal_event_id bigint,
    repeatable boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    basic_description character varying(2000),
    accept_description character varying(2000),
    duration_minutes integer,
    cooldown_hours integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.quests OWNER TO familymarket;

--
-- Name: quests_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.quests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quests_id_seq OWNER TO familymarket;

--
-- Name: quests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.quests_id_seq OWNED BY public.quests.id;


--
-- Name: reading_bookmarks; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.reading_bookmarks (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    book_id bigint NOT NULL,
    page integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reading_bookmarks OWNER TO familymarket;

--
-- Name: reading_bookmarks_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.reading_bookmarks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reading_bookmarks_id_seq OWNER TO familymarket;

--
-- Name: reading_bookmarks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.reading_bookmarks_id_seq OWNED BY public.reading_bookmarks.id;


--
-- Name: reading_books; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.reading_books (
    id bigint NOT NULL,
    store_id bigint NOT NULL,
    child_id bigint,
    name character varying(255) NOT NULL,
    author character varying(255),
    series character varying(255),
    genre character varying(100),
    pages integer DEFAULT 0 NOT NULL,
    multiplier numeric(5,2) DEFAULT 1 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reading_books OWNER TO familymarket;

--
-- Name: reading_books_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.reading_books_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reading_books_id_seq OWNER TO familymarket;

--
-- Name: reading_books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.reading_books_id_seq OWNED BY public.reading_books.id;


--
-- Name: reading_logs; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.reading_logs (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    book_id bigint NOT NULL,
    points numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    read_at date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reading_logs OWNER TO familymarket;

--
-- Name: reading_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.reading_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reading_logs_id_seq OWNER TO familymarket;

--
-- Name: reading_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.reading_logs_id_seq OWNED BY public.reading_logs.id;


--
-- Name: reading_page_marks; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.reading_page_marks (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    book_id bigint NOT NULL,
    page integer NOT NULL,
    day date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reading_page_marks OWNER TO familymarket;

--
-- Name: reading_page_marks_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.reading_page_marks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reading_page_marks_id_seq OWNER TO familymarket;

--
-- Name: reading_page_marks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.reading_page_marks_id_seq OWNED BY public.reading_page_marks.id;


--
-- Name: reading_requests; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.reading_requests (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    store_id bigint NOT NULL,
    title character varying(500) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone
);


ALTER TABLE public.reading_requests OWNER TO familymarket;

--
-- Name: reading_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.reading_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reading_requests_id_seq OWNER TO familymarket;

--
-- Name: reading_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.reading_requests_id_seq OWNED BY public.reading_requests.id;


--
-- Name: reading_settings; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.reading_settings (
    child_id bigint NOT NULL,
    store_id bigint NOT NULL,
    pages_target integer DEFAULT 20 NOT NULL,
    reward_amount numeric(12,2) DEFAULT 0 NOT NULL,
    xp_reward integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reading_settings OWNER TO familymarket;

--
-- Name: seasonal_events; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.seasonal_events (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    description character varying(2000),
    token_name character varying(50) DEFAULT 'жетон'::character varying NOT NULL,
    token_icon character varying(16) DEFAULT '🎟️'::character varying NOT NULL,
    starts_at date NOT NULL,
    ends_at date NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.seasonal_events OWNER TO familymarket;

--
-- Name: seasonal_events_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.seasonal_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seasonal_events_id_seq OWNER TO familymarket;

--
-- Name: seasonal_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.seasonal_events_id_seq OWNED BY public.seasonal_events.id;


--
-- Name: skill_activations; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.skill_activations (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    skill character varying(40) NOT NULL,
    store_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.skill_activations OWNER TO familymarket;

--
-- Name: skill_activations_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.skill_activations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skill_activations_id_seq OWNER TO familymarket;

--
-- Name: skill_activations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.skill_activations_id_seq OWNED BY public.skill_activations.id;


--
-- Name: sport_card_tasks; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.sport_card_tasks (
    id bigint NOT NULL,
    card_id bigint NOT NULL,
    title character varying(300) NOT NULL,
    description character varying(500)
);


ALTER TABLE public.sport_card_tasks OWNER TO familymarket;

--
-- Name: sport_card_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.sport_card_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sport_card_tasks_id_seq OWNER TO familymarket;

--
-- Name: sport_card_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.sport_card_tasks_id_seq OWNED BY public.sport_card_tasks.id;


--
-- Name: sport_cards; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.sport_cards (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    card_date date NOT NULL,
    direction_id bigint NOT NULL,
    status character varying(20) DEFAULT 'CREATED'::character varying NOT NULL,
    base_reward integer DEFAULT 10 NOT NULL,
    multiplier integer DEFAULT 1 NOT NULL,
    xp_earned integer DEFAULT 0 NOT NULL,
    parent_comment character varying(300),
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sport_cards OWNER TO familymarket;

--
-- Name: sport_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.sport_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sport_cards_id_seq OWNER TO familymarket;

--
-- Name: sport_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.sport_cards_id_seq OWNED BY public.sport_cards.id;


--
-- Name: sport_directions; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.sport_directions (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(8) DEFAULT '⚽'::character varying NOT NULL,
    status character varying(16) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sport_directions OWNER TO familymarket;

--
-- Name: sport_directions_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.sport_directions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sport_directions_id_seq OWNER TO familymarket;

--
-- Name: sport_directions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.sport_directions_id_seq OWNED BY public.sport_directions.id;


--
-- Name: sport_requests; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.sport_requests (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    comment character varying(300),
    status character varying(16) DEFAULT 'PENDING'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sport_requests OWNER TO familymarket;

--
-- Name: sport_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.sport_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sport_requests_id_seq OWNER TO familymarket;

--
-- Name: sport_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.sport_requests_id_seq OWNED BY public.sport_requests.id;


--
-- Name: sport_tasks; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.sport_tasks (
    id bigint NOT NULL,
    direction_id bigint NOT NULL,
    title character varying(300) NOT NULL,
    description character varying(500),
    grade_min integer DEFAULT 1 NOT NULL,
    grade_max integer DEFAULT 8 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.sport_tasks OWNER TO familymarket;

--
-- Name: sport_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.sport_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sport_tasks_id_seq OWNER TO familymarket;

--
-- Name: sport_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.sport_tasks_id_seq OWNED BY public.sport_tasks.id;


--
-- Name: stores; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.stores (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    description character varying(2000),
    currency_name character varying(50) DEFAULT 'монета'::character varying NOT NULL,
    currency_icon character varying(16) DEFAULT '🪙'::character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    template_type character varying(32),
    wardrobe boolean DEFAULT false NOT NULL,
    seasonal_event_id bigint
);


ALTER TABLE public.stores OWNER TO familymarket;

--
-- Name: stores_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.stores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stores_id_seq OWNER TO familymarket;

--
-- Name: stores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.stores_id_seq OWNED BY public.stores.id;


--
-- Name: task_cards; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.task_cards (
    id bigint NOT NULL,
    parent_id bigint NOT NULL,
    store_id bigint,
    child_id bigint,
    skill character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    description character varying(2000),
    icon character varying(64) DEFAULT '🎴'::character varying NOT NULL,
    difficulty character varying(20) DEFAULT 'EASY'::character varying NOT NULL,
    tasks_json character varying(8000) NOT NULL,
    duration_minutes integer NOT NULL,
    reward_amount numeric(12,2) DEFAULT 0 NOT NULL,
    reward_store_id bigint,
    xp_reward integer DEFAULT 0 NOT NULL,
    house_bonus integer DEFAULT 0 NOT NULL,
    rarity character varying(20) DEFAULT 'COMMON'::character varying NOT NULL,
    hidden_reward boolean DEFAULT false NOT NULL,
    success_percent integer DEFAULT 80 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.task_cards OWNER TO familymarket;

--
-- Name: task_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.task_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_cards_id_seq OWNER TO familymarket;

--
-- Name: task_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.task_cards_id_seq OWNED BY public.task_cards.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email_verified boolean DEFAULT true NOT NULL,
    verification_code character varying(10),
    verification_expires timestamp with time zone,
    reset_token character varying(64),
    reset_expires timestamp with time zone
);


ALTER TABLE public.users OWNER TO familymarket;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO familymarket;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: familymarket
--

CREATE TABLE public.wishlist_items (
    id bigint NOT NULL,
    child_id bigint NOT NULL,
    title character varying(500) NOT NULL,
    status character varying(20) DEFAULT 'OPEN'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    link character varying(1000),
    price numeric(12,2),
    desire integer DEFAULT 3 NOT NULL
);


ALTER TABLE public.wishlist_items OWNER TO familymarket;

--
-- Name: wishlist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: familymarket
--

CREATE SEQUENCE public.wishlist_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlist_items_id_seq OWNER TO familymarket;

--
-- Name: wishlist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familymarket
--

ALTER SEQUENCE public.wishlist_items_id_seq OWNED BY public.wishlist_items.id;


--
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- Name: avatar_items id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.avatar_items ALTER COLUMN id SET DEFAULT nextval('public.avatar_items_id_seq'::regclass);


--
-- Name: balances id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.balances ALTER COLUMN id SET DEFAULT nextval('public.balances_id_seq'::regclass);


--
-- Name: child_achievements id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_achievements ALTER COLUMN id SET DEFAULT nextval('public.child_achievements_id_seq'::regclass);


--
-- Name: child_avatar_items id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_avatar_items ALTER COLUMN id SET DEFAULT nextval('public.child_avatar_items_id_seq'::regclass);


--
-- Name: child_equipment id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_equipment ALTER COLUMN id SET DEFAULT nextval('public.child_equipment_id_seq'::regclass);


--
-- Name: child_quest_states id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_quest_states ALTER COLUMN id SET DEFAULT nextval('public.child_quest_states_id_seq'::regclass);


--
-- Name: child_task_cards id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_task_cards ALTER COLUMN id SET DEFAULT nextval('public.child_task_cards_id_seq'::regclass);


--
-- Name: child_tracked_achievements id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_tracked_achievements ALTER COLUMN id SET DEFAULT nextval('public.child_tracked_achievements_id_seq'::regclass);


--
-- Name: children id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.children ALTER COLUMN id SET DEFAULT nextval('public.children_id_seq'::regclass);


--
-- Name: daily_logs id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.daily_logs ALTER COLUMN id SET DEFAULT nextval('public.daily_logs_id_seq'::regclass);


--
-- Name: deposits id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.deposits ALTER COLUMN id SET DEFAULT nextval('public.deposits_id_seq'::regclass);


--
-- Name: dungeon_sessions id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.dungeon_sessions ALTER COLUMN id SET DEFAULT nextval('public.dungeon_sessions_id_seq'::regclass);


--
-- Name: equipment_defs id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.equipment_defs ALTER COLUMN id SET DEFAULT nextval('public.equipment_defs_id_seq'::regclass);


--
-- Name: house_check_requests id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.house_check_requests ALTER COLUMN id SET DEFAULT nextval('public.house_check_requests_id_seq'::regclass);


--
-- Name: house_days id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.house_days ALTER COLUMN id SET DEFAULT nextval('public.house_days_id_seq'::regclass);


--
-- Name: inventory_items id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.inventory_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_items_id_seq'::regclass);


--
-- Name: lang_card_attempts id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_attempts ALTER COLUMN id SET DEFAULT nextval('public.lang_card_attempts_id_seq'::regclass);


--
-- Name: lang_card_settings id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_settings ALTER COLUMN id SET DEFAULT nextval('public.lang_card_settings_id_seq'::regclass);


--
-- Name: lang_card_tasks id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_tasks ALTER COLUMN id SET DEFAULT nextval('public.lang_card_tasks_id_seq'::regclass);


--
-- Name: lang_cards id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_cards ALTER COLUMN id SET DEFAULT nextval('public.lang_cards_id_seq'::regclass);


--
-- Name: lang_word_progress id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_word_progress ALTER COLUMN id SET DEFAULT nextval('public.lang_word_progress_id_seq'::regclass);


--
-- Name: lang_words id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_words ALTER COLUMN id SET DEFAULT nextval('public.lang_words_id_seq'::regclass);


--
-- Name: limit_events id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_events ALTER COLUMN id SET DEFAULT nextval('public.limit_events_id_seq'::regclass);


--
-- Name: limit_freeze id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_freeze ALTER COLUMN id SET DEFAULT nextval('public.limit_freeze_id_seq'::regclass);


--
-- Name: limit_usage id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_usage ALTER COLUMN id SET DEFAULT nextval('public.limit_usage_id_seq'::regclass);


--
-- Name: logic_card_attempts id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_card_attempts ALTER COLUMN id SET DEFAULT nextval('public.logic_card_attempts_id_seq'::regclass);


--
-- Name: logic_card_tasks id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_card_tasks ALTER COLUMN id SET DEFAULT nextval('public.logic_card_tasks_id_seq'::regclass);


--
-- Name: logic_cards id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_cards ALTER COLUMN id SET DEFAULT nextval('public.logic_cards_id_seq'::regclass);


--
-- Name: logic_olympiad_cards id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_olympiad_cards ALTER COLUMN id SET DEFAULT nextval('public.logic_olympiad_cards_id_seq'::regclass);


--
-- Name: logic_olympiad_tasks id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_olympiad_tasks ALTER COLUMN id SET DEFAULT nextval('public.logic_olympiad_tasks_id_seq'::regclass);


--
-- Name: logic_topic_settings id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_topic_settings ALTER COLUMN id SET DEFAULT nextval('public.logic_topic_settings_id_seq'::regclass);


--
-- Name: logic_topics id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_topics ALTER COLUMN id SET DEFAULT nextval('public.logic_topics_id_seq'::regclass);


--
-- Name: math_attempts id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_attempts ALTER COLUMN id SET DEFAULT nextval('public.math_attempts_id_seq'::regclass);


--
-- Name: math_card_attempts id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_card_attempts ALTER COLUMN id SET DEFAULT nextval('public.math_card_attempts_id_seq'::regclass);


--
-- Name: math_card_tasks id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_card_tasks ALTER COLUMN id SET DEFAULT nextval('public.math_card_tasks_id_seq'::regclass);


--
-- Name: math_cards id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_cards ALTER COLUMN id SET DEFAULT nextval('public.math_cards_id_seq'::regclass);


--
-- Name: math_olympiad_cards id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_olympiad_cards ALTER COLUMN id SET DEFAULT nextval('public.math_olympiad_cards_id_seq'::regclass);


--
-- Name: math_olympiad_tasks id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_olympiad_tasks ALTER COLUMN id SET DEFAULT nextval('public.math_olympiad_tasks_id_seq'::regclass);


--
-- Name: math_tasks id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_tasks ALTER COLUMN id SET DEFAULT nextval('public.math_tasks_id_seq'::regclass);


--
-- Name: math_topic_settings id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_topic_settings ALTER COLUMN id SET DEFAULT nextval('public.math_topic_settings_id_seq'::regclass);


--
-- Name: math_topics id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_topics ALTER COLUMN id SET DEFAULT nextval('public.math_topics_id_seq'::regclass);


--
-- Name: parent_notifications id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.parent_notifications ALTER COLUMN id SET DEFAULT nextval('public.parent_notifications_id_seq'::regclass);


--
-- Name: pocket_disbursements id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.pocket_disbursements ALTER COLUMN id SET DEFAULT nextval('public.pocket_disbursements_id_seq'::regclass);


--
-- Name: pocket_extensions id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.pocket_extensions ALTER COLUMN id SET DEFAULT nextval('public.pocket_extensions_id_seq'::regclass);


--
-- Name: pocket_requests id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.pocket_requests ALTER COLUMN id SET DEFAULT nextval('public.pocket_requests_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: quest_submissions id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.quest_submissions ALTER COLUMN id SET DEFAULT nextval('public.quest_submissions_id_seq'::regclass);


--
-- Name: quests id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.quests ALTER COLUMN id SET DEFAULT nextval('public.quests_id_seq'::regclass);


--
-- Name: reading_bookmarks id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_bookmarks ALTER COLUMN id SET DEFAULT nextval('public.reading_bookmarks_id_seq'::regclass);


--
-- Name: reading_books id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_books ALTER COLUMN id SET DEFAULT nextval('public.reading_books_id_seq'::regclass);


--
-- Name: reading_logs id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_logs ALTER COLUMN id SET DEFAULT nextval('public.reading_logs_id_seq'::regclass);


--
-- Name: reading_page_marks id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_page_marks ALTER COLUMN id SET DEFAULT nextval('public.reading_page_marks_id_seq'::regclass);


--
-- Name: reading_requests id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_requests ALTER COLUMN id SET DEFAULT nextval('public.reading_requests_id_seq'::regclass);


--
-- Name: seasonal_events id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.seasonal_events ALTER COLUMN id SET DEFAULT nextval('public.seasonal_events_id_seq'::regclass);


--
-- Name: skill_activations id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.skill_activations ALTER COLUMN id SET DEFAULT nextval('public.skill_activations_id_seq'::regclass);


--
-- Name: sport_card_tasks id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_card_tasks ALTER COLUMN id SET DEFAULT nextval('public.sport_card_tasks_id_seq'::regclass);


--
-- Name: sport_cards id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_cards ALTER COLUMN id SET DEFAULT nextval('public.sport_cards_id_seq'::regclass);


--
-- Name: sport_directions id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_directions ALTER COLUMN id SET DEFAULT nextval('public.sport_directions_id_seq'::regclass);


--
-- Name: sport_requests id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_requests ALTER COLUMN id SET DEFAULT nextval('public.sport_requests_id_seq'::regclass);


--
-- Name: sport_tasks id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_tasks ALTER COLUMN id SET DEFAULT nextval('public.sport_tasks_id_seq'::regclass);


--
-- Name: stores id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.stores ALTER COLUMN id SET DEFAULT nextval('public.stores_id_seq'::regclass);


--
-- Name: task_cards id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.task_cards ALTER COLUMN id SET DEFAULT nextval('public.task_cards_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wishlist_items id; Type: DEFAULT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.wishlist_items ALTER COLUMN id SET DEFAULT nextval('public.wishlist_items_id_seq'::regclass);


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.achievements (id, parent_id, name, description, icon, reward_amount, created_at, target_type, target_value, group_key, skill, level, hidden_reward, reward_store_id, xp_reward, title) FROM stdin;
1601	4	Атлет	Первый старт — 1 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721802+03	SPORT_DAYS	1	SPORT_DAYS	SPORT	1	f	\N	10	\N
1602	4	Атлет	Юный спортсмен — 5 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721803+03	SPORT_DAYS	5	SPORT_DAYS	SPORT	2	f	\N	25	\N
1603	4	Атлет	Тренированный — 10 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721804+03	SPORT_DAYS	10	SPORT_DAYS	SPORT	3	f	\N	50	\N
1604	4	Атлет	Уверенный атлет — 25 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721805+03	SPORT_DAYS	25	SPORT_DAYS	SPORT	4	f	\N	85	\N
1605	4	Атлет	Крепкий спортсмен — 50 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721806+03	SPORT_DAYS	50	SPORT_DAYS	SPORT	5	f	\N	130	\N
1606	4	Атлет	Стальной корпус — 100 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721807+03	SPORT_DAYS	100	SPORT_DAYS	SPORT	6	f	\N	190	\N
1607	4	Атлет	Мастер тренировок — 150 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721808+03	SPORT_DAYS	150	SPORT_DAYS	SPORT	7	f	\N	270	\N
1608	4	Атлет	Суператлет — 200 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721809+03	SPORT_DAYS	200	SPORT_DAYS	SPORT	8	f	\N	370	\N
1609	4	Атлет	Марафонец жизни — 250 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721811+03	SPORT_DAYS	250	SPORT_DAYS	SPORT	9	f	\N	500	\N
1610	4	Атлет	Железный чемпион — 300 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721812+03	SPORT_DAYS	300	SPORT_DAYS	SPORT	10	f	\N	660	\N
1611	4	Атлет	Легенда спорта — 365 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:39:50.721813+03	SPORT_DAYS	365	SPORT_DAYS	SPORT	11	f	\N	860	\N
1612	4	Несгибаемый	Двойной шаг — 2 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.721834+03	SPORT_STREAK	2	SPORT_STREAK	SPORT	1	f	\N	10	\N
1613	4	Несгибаемый	Тройка — 3 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.721834+03	SPORT_STREAK	3	SPORT_STREAK	SPORT	2	f	\N	25	\N
1614	4	Несгибаемый	Пятёрка — 5 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.721835+03	SPORT_STREAK	5	SPORT_STREAK	SPORT	3	f	\N	50	\N
1615	4	Несгибаемый	Неделя движения — 7 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.721836+03	SPORT_STREAK	7	SPORT_STREAK	SPORT	4	f	\N	85	\N
1616	4	Несгибаемый	Десять дней силы — 10 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.721837+03	SPORT_STREAK	10	SPORT_STREAK	SPORT	5	f	\N	130	\N
1617	4	Несгибаемый	Две недели ритма — 14 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.721838+03	SPORT_STREAK	14	SPORT_STREAK	SPORT	6	f	\N	190	\N
1618	4	Несгибаемый	Три недели привычки — 21 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.721839+03	SPORT_STREAK	21	SPORT_STREAK	SPORT	7	f	\N	270	\N
1619	4	Несгибаемый	Месяц стальной воли — 30 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.721839+03	SPORT_STREAK	30	SPORT_STREAK	SPORT	8	f	\N	370	\N
1620	4	Несгибаемый	Полтора месяца напора — 45 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.72184+03	SPORT_STREAK	45	SPORT_STREAK	SPORT	9	f	\N	500	\N
1621	4	Несгибаемый	Два месяца огня — 60 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.721841+03	SPORT_STREAK	60	SPORT_STREAK	SPORT	10	f	\N	660	\N
1622	4	Несгибаемый	Несгибаемый чемпион — 90 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:39:50.721842+03	SPORT_STREAK	90	SPORT_STREAK	SPORT	11	f	\N	860	\N
1788	1	Атлет	Первый старт — 1 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122081+03	SPORT_DAYS	1	SPORT_DAYS	SPORT	1	f	\N	10	\N
1624	4	Логик	Первая связка — 1 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.747706+03	LOGIC_TASKS	1	LOGIC_TASKS	LOGIC	1	f	\N	10	\N
1625	4	Логик	Смышлёный детектив — 10 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.747708+03	LOGIC_TASKS	10	LOGIC_TASKS	LOGIC	2	f	\N	25	\N
1626	4	Логик	Распутывающий узлы — 25 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.747709+03	LOGIC_TASKS	25	LOGIC_TASKS	LOGIC	3	f	\N	50	\N
1627	4	Логик	Аналитик — 50 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.747709+03	LOGIC_TASKS	50	LOGIC_TASKS	LOGIC	4	f	\N	85	\N
1628	4	Логик	Мастер головоломок — 100 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.747709+03	LOGIC_TASKS	100	LOGIC_TASKS	LOGIC	5	f	\N	130	\N
1629	4	Логик	Стратег — 200 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.74771+03	LOGIC_TASKS	200	LOGIC_TASKS	LOGIC	6	f	\N	190	\N
1630	4	Логик	Мыслитель-виртуоз — 350 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.74771+03	LOGIC_TASKS	350	LOGIC_TASKS	LOGIC	7	f	\N	270	\N
1631	4	Логик	Архитектор решений — 500 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.747711+03	LOGIC_TASKS	500	LOGIC_TASKS	LOGIC	8	f	\N	370	\N
1632	4	Логик	Владыка дедукции — 750 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.747711+03	LOGIC_TASKS	750	LOGIC_TASKS	LOGIC	9	f	\N	500	\N
1633	4	Логик	Логический гроссмейстер — 1000 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.747715+03	LOGIC_TASKS	1000	LOGIC_TASKS	LOGIC	10	f	\N	660	\N
1634	4	Логик	Абсолютный разум — 1500 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:39:50.747716+03	LOGIC_TASKS	1500	LOGIC_TASKS	LOGIC	11	f	\N	860	\N
1635	4	Логическая Дисциплина	Первая нить — 2 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.747726+03	LOGIC_STREAK	2	LOGIC_STREAK	LOGIC	1	f	\N	10	\N
1636	4	Логическая Дисциплина	Двойная связка — 3 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.747727+03	LOGIC_STREAK	3	LOGIC_STREAK	LOGIC	2	f	\N	25	\N
1637	4	Логическая Дисциплина	Пять узлов — 5 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.747727+03	LOGIC_STREAK	5	LOGIC_STREAK	LOGIC	3	f	\N	50	\N
1638	4	Логическая Дисциплина	Неделя размышлений — 7 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.747728+03	LOGIC_STREAK	7	LOGIC_STREAK	LOGIC	4	f	\N	85	\N
1639	4	Логическая Дисциплина	Десять дней ясности — 10 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.747728+03	LOGIC_STREAK	10	LOGIC_STREAK	LOGIC	5	f	\N	130	\N
1640	4	Логическая Дисциплина	Две недели фокуса — 14 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.747729+03	LOGIC_STREAK	14	LOGIC_STREAK	LOGIC	6	f	\N	190	\N
1641	4	Логическая Дисциплина	Три недели сосредоточенности — 21 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.747729+03	LOGIC_STREAK	21	LOGIC_STREAK	LOGIC	7	f	\N	270	\N
1642	4	Логическая Дисциплина	Месяц острого ума — 30 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.747729+03	LOGIC_STREAK	30	LOGIC_STREAK	LOGIC	8	f	\N	370	\N
1643	4	Логическая Дисциплина	Полтора месяца дедукции — 45 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.74773+03	LOGIC_STREAK	45	LOGIC_STREAK	LOGIC	9	f	\N	500	\N
1644	4	Логическая Дисциплина	Два месяца безупречности — 60 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.74773+03	LOGIC_STREAK	60	LOGIC_STREAK	LOGIC	10	f	\N	660	\N
1645	4	Логическая Дисциплина	Непрерывный разум — 90 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:39:50.747731+03	LOGIC_STREAK	90	LOGIC_STREAK	LOGIC	11	f	\N	860	\N
1646	4	Картограф Логики	Первая карта — 1 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.747746+03	LOGIC_CARDS	1	LOGIC_CARDS	LOGIC	1	f	\N	10	\N
1647	4	Картограф Логики	Наметивший путь — 5 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.747747+03	LOGIC_CARDS	5	LOGIC_CARDS	LOGIC	2	f	\N	25	\N
1648	4	Картограф Логики	Уверенный следопыт — 10 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.747747+03	LOGIC_CARDS	10	LOGIC_CARDS	LOGIC	3	f	\N	50	\N
1649	4	Картограф Логики	Исследователь схем — 25 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.747747+03	LOGIC_CARDS	25	LOGIC_CARDS	LOGIC	4	f	\N	85	\N
1650	4	Картограф Логики	Открыватель закономерностей — 50 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.747748+03	LOGIC_CARDS	50	LOGIC_CARDS	LOGIC	5	f	\N	130	\N
1651	4	Картограф Логики	Картограф узоров — 75 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.747748+03	LOGIC_CARDS	75	LOGIC_CARDS	LOGIC	6	f	\N	190	\N
1652	4	Картограф Логики	Мастер маршрутов — 100 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.747749+03	LOGIC_CARDS	100	LOGIC_CARDS	LOGIC	7	f	\N	270	\N
1653	4	Картограф Логики	Гроссмейстер маршрутов — 150 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.747749+03	LOGIC_CARDS	150	LOGIC_CARDS	LOGIC	8	f	\N	370	\N
1654	4	Картограф Логики	Архитектор логических путей — 200 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.74775+03	LOGIC_CARDS	200	LOGIC_CARDS	LOGIC	9	f	\N	500	\N
1655	4	Картограф Логики	Великий геометр разума — 250 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.74775+03	LOGIC_CARDS	250	LOGIC_CARDS	LOGIC	10	f	\N	660	\N
1656	4	Картограф Логики	Абсолютный картограф — 300 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:39:50.747751+03	LOGIC_CARDS	300	LOGIC_CARDS	LOGIC	11	f	\N	860	\N
1658	4	Полиглот	Первое слово — 1 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761962+03	LANG_WORDS	1	LANG_WORDS	LANG	1	f	\N	10	\N
1659	4	Полиглот	Юный полиглот — 10 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761963+03	LANG_WORDS	10	LANG_WORDS	LANG	2	f	\N	25	\N
1660	4	Полиглот	Собеседник — 25 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761964+03	LANG_WORDS	25	LANG_WORDS	LANG	3	f	\N	50	\N
1661	4	Полиглот	Знаток слов — 50 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761964+03	LANG_WORDS	50	LANG_WORDS	LANG	4	f	\N	85	\N
1662	4	Полиглот	Уверенный переводчик — 100 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761964+03	LANG_WORDS	100	LANG_WORDS	LANG	5	f	\N	130	\N
1663	4	Полиглот	Мастер лексики — 150 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761965+03	LANG_WORDS	150	LANG_WORDS	LANG	6	f	\N	190	\N
1664	4	Полиглот	Хранитель словаря — 200 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761965+03	LANG_WORDS	200	LANG_WORDS	LANG	7	f	\N	270	\N
1665	4	Полиглот	Владыка языков — 300 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761966+03	LANG_WORDS	300	LANG_WORDS	LANG	8	f	\N	370	\N
1666	4	Полиглот	Билингва-гроссмейстер — 400 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761966+03	LANG_WORDS	400	LANG_WORDS	LANG	9	f	\N	500	\N
1667	4	Полиглот	Живой переводчик — 500 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761967+03	LANG_WORDS	500	LANG_WORDS	LANG	10	f	\N	660	\N
1668	4	Полиглот	Абсолютный полиглот — 750 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:39:50.761967+03	LANG_WORDS	750	LANG_WORDS	LANG	11	f	\N	860	\N
1669	4	Языковая Дисциплина	Два дня подряд — 2 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.761985+03	LANG_STREAK	2	LANG_STREAK	LANG	1	f	\N	10	\N
1670	4	Языковая Дисциплина	Тройное усердие — 3 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.761986+03	LANG_STREAK	3	LANG_STREAK	LANG	2	f	\N	25	\N
1671	4	Языковая Дисциплина	Пятёрка практики — 5 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.761986+03	LANG_STREAK	5	LANG_STREAK	LANG	3	f	\N	50	\N
1672	4	Языковая Дисциплина	Неделя языка — 7 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.761986+03	LANG_STREAK	7	LANG_STREAK	LANG	4	f	\N	85	\N
1673	4	Языковая Дисциплина	Десять дней речи — 10 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.761987+03	LANG_STREAK	10	LANG_STREAK	LANG	5	f	\N	130	\N
1674	4	Языковая Дисциплина	Две недели погружения — 14 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.761987+03	LANG_STREAK	14	LANG_STREAK	LANG	6	f	\N	190	\N
1675	4	Языковая Дисциплина	Три недели разговора — 21 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.761988+03	LANG_STREAK	21	LANG_STREAK	LANG	7	f	\N	270	\N
1676	4	Языковая Дисциплина	Месяц беглости — 30 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.761988+03	LANG_STREAK	30	LANG_STREAK	LANG	8	f	\N	370	\N
1677	4	Языковая Дисциплина	Полтора месяца полиглота — 45 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.761989+03	LANG_STREAK	45	LANG_STREAK	LANG	9	f	\N	500	\N
1678	4	Языковая Дисциплина	Два месяца языковой стали — 60 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.761989+03	LANG_STREAK	60	LANG_STREAK	LANG	10	f	\N	660	\N
1679	4	Языковая Дисциплина	Языковой чемпион — 90 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:39:50.76199+03	LANG_STREAK	90	LANG_STREAK	LANG	11	f	\N	860	\N
1680	4	Мастер Карточек Языка	Первая карточка — 1 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.762006+03	LANG_CARDS	1	LANG_CARDS	LANG	1	f	\N	10	\N
1681	4	Мастер Карточек Языка	Набирающий словарь — 5 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.762006+03	LANG_CARDS	5	LANG_CARDS	LANG	2	f	\N	25	\N
1682	4	Мастер Карточек Языка	Уверенный чтец — 10 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.762007+03	LANG_CARDS	10	LANG_CARDS	LANG	3	f	\N	50	\N
1683	4	Мастер Карточек Языка	Практик диалогов — 25 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.762007+03	LANG_CARDS	25	LANG_CARDS	LANG	4	f	\N	85	\N
1684	4	Мастер Карточек Языка	Мастер перевода — 50 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.762008+03	LANG_CARDS	50	LANG_CARDS	LANG	5	f	\N	130	\N
1685	4	Мастер Карточек Языка	Знаток фраз — 75 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.762008+03	LANG_CARDS	75	LANG_CARDS	LANG	6	f	\N	190	\N
1686	4	Мастер Карточек Языка	Коллекционер выражений — 100 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.762008+03	LANG_CARDS	100	LANG_CARDS	LANG	7	f	\N	270	\N
1687	4	Мастер Карточек Языка	Гроссмейстер карточек — 150 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.762009+03	LANG_CARDS	150	LANG_CARDS	LANG	8	f	\N	370	\N
1688	4	Мастер Карточек Языка	Архитектор речи — 200 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.762009+03	LANG_CARDS	200	LANG_CARDS	LANG	9	f	\N	500	\N
1689	4	Мастер Карточек Языка	Великий лингвист практики — 250 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.76201+03	LANG_CARDS	250	LANG_CARDS	LANG	10	f	\N	660	\N
1690	4	Мастер Карточек Языка	Абсолютный мастер карточек — 300 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:39:50.76201+03	LANG_CARDS	300	LANG_CARDS	LANG	11	f	\N	860	\N
1789	1	Атлет	Юный спортсмен — 5 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122082+03	SPORT_DAYS	5	SPORT_DAYS	SPORT	2	f	\N	25	\N
1790	1	Атлет	Тренированный — 10 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122083+03	SPORT_DAYS	10	SPORT_DAYS	SPORT	3	f	\N	50	\N
1791	1	Атлет	Уверенный атлет — 25 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122084+03	SPORT_DAYS	25	SPORT_DAYS	SPORT	4	f	\N	85	\N
1792	1	Атлет	Крепкий спортсмен — 50 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122085+03	SPORT_DAYS	50	SPORT_DAYS	SPORT	5	f	\N	130	\N
1793	1	Атлет	Стальной корпус — 100 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122086+03	SPORT_DAYS	100	SPORT_DAYS	SPORT	6	f	\N	190	\N
1794	1	Атлет	Мастер тренировок — 150 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122087+03	SPORT_DAYS	150	SPORT_DAYS	SPORT	7	f	\N	270	\N
1795	1	Атлет	Суператлет — 200 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122088+03	SPORT_DAYS	200	SPORT_DAYS	SPORT	8	f	\N	370	\N
1796	1	Атлет	Марафонец жизни — 250 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122092+03	SPORT_DAYS	250	SPORT_DAYS	SPORT	9	f	\N	500	\N
1797	1	Атлет	Железный чемпион — 300 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122095+03	SPORT_DAYS	300	SPORT_DAYS	SPORT	10	f	\N	660	\N
1798	1	Атлет	Легенда спорта — 365 дней.\nАктивные дни в спорте и хобби.	🏃	0.00	2026-11-11 22:53:00.122096+03	SPORT_DAYS	365	SPORT_DAYS	SPORT	11	f	\N	860	\N
1799	1	Несгибаемый	Двойной шаг — 2 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122111+03	SPORT_STREAK	2	SPORT_STREAK	SPORT	1	f	\N	10	\N
1800	1	Несгибаемый	Тройка — 3 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122112+03	SPORT_STREAK	3	SPORT_STREAK	SPORT	2	f	\N	25	\N
1801	1	Несгибаемый	Пятёрка — 5 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122113+03	SPORT_STREAK	5	SPORT_STREAK	SPORT	3	f	\N	50	\N
1802	1	Несгибаемый	Неделя движения — 7 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122113+03	SPORT_STREAK	7	SPORT_STREAK	SPORT	4	f	\N	85	\N
1803	1	Несгибаемый	Десять дней силы — 10 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122114+03	SPORT_STREAK	10	SPORT_STREAK	SPORT	5	f	\N	130	\N
1804	1	Несгибаемый	Две недели ритма — 14 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122115+03	SPORT_STREAK	14	SPORT_STREAK	SPORT	6	f	\N	190	\N
1805	1	Несгибаемый	Три недели привычки — 21 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122116+03	SPORT_STREAK	21	SPORT_STREAK	SPORT	7	f	\N	270	\N
1806	1	Несгибаемый	Месяц стальной воли — 30 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122117+03	SPORT_STREAK	30	SPORT_STREAK	SPORT	8	f	\N	370	\N
1807	1	Несгибаемый	Полтора месяца напора — 45 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122117+03	SPORT_STREAK	45	SPORT_STREAK	SPORT	9	f	\N	500	\N
1808	1	Несгибаемый	Два месяца огня — 60 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122118+03	SPORT_STREAK	60	SPORT_STREAK	SPORT	10	f	\N	660	\N
1809	1	Несгибаемый	Несгибаемый чемпион — 90 дней подряд.\nСерия активных дней без пропусков.	🔥	0.00	2026-11-11 22:53:00.122119+03	SPORT_STREAK	90	SPORT_STREAK	SPORT	11	f	\N	860	\N
1810	1	Логик	Первая связка — 1 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.14907+03	LOGIC_TASKS	1	LOGIC_TASKS	LOGIC	1	f	\N	10	\N
1811	1	Логик	Смышлёный детектив — 10 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.149072+03	LOGIC_TASKS	10	LOGIC_TASKS	LOGIC	2	f	\N	25	\N
1812	1	Логик	Распутывающий узлы — 25 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.149072+03	LOGIC_TASKS	25	LOGIC_TASKS	LOGIC	3	f	\N	50	\N
1813	1	Логик	Аналитик — 50 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.149073+03	LOGIC_TASKS	50	LOGIC_TASKS	LOGIC	4	f	\N	85	\N
1814	1	Логик	Мастер головоломок — 100 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.149074+03	LOGIC_TASKS	100	LOGIC_TASKS	LOGIC	5	f	\N	130	\N
1815	1	Логик	Стратег — 200 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.149074+03	LOGIC_TASKS	200	LOGIC_TASKS	LOGIC	6	f	\N	190	\N
1816	1	Логик	Мыслитель-виртуоз — 350 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.149075+03	LOGIC_TASKS	350	LOGIC_TASKS	LOGIC	7	f	\N	270	\N
1817	1	Логик	Архитектор решений — 500 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.149075+03	LOGIC_TASKS	500	LOGIC_TASKS	LOGIC	8	f	\N	370	\N
1818	1	Логик	Владыка дедукции — 750 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.149075+03	LOGIC_TASKS	750	LOGIC_TASKS	LOGIC	9	f	\N	500	\N
1819	1	Логик	Логический гроссмейстер — 1000 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.149076+03	LOGIC_TASKS	1000	LOGIC_TASKS	LOGIC	10	f	\N	660	\N
1820	1	Логик	Абсолютный разум — 1500 задач.\nРешённые задачи в дейликах логики.	🧩	0.00	2026-11-11 22:53:00.149076+03	LOGIC_TASKS	1500	LOGIC_TASKS	LOGIC	11	f	\N	860	\N
1821	1	Логическая Дисциплина	Первая нить — 2 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149095+03	LOGIC_STREAK	2	LOGIC_STREAK	LOGIC	1	f	\N	10	\N
1822	1	Логическая Дисциплина	Двойная связка — 3 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149095+03	LOGIC_STREAK	3	LOGIC_STREAK	LOGIC	2	f	\N	25	\N
1823	1	Логическая Дисциплина	Пять узлов — 5 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149096+03	LOGIC_STREAK	5	LOGIC_STREAK	LOGIC	3	f	\N	50	\N
1824	1	Логическая Дисциплина	Неделя размышлений — 7 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149096+03	LOGIC_STREAK	7	LOGIC_STREAK	LOGIC	4	f	\N	85	\N
1825	1	Логическая Дисциплина	Десять дней ясности — 10 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149097+03	LOGIC_STREAK	10	LOGIC_STREAK	LOGIC	5	f	\N	130	\N
1826	1	Логическая Дисциплина	Две недели фокуса — 14 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149097+03	LOGIC_STREAK	14	LOGIC_STREAK	LOGIC	6	f	\N	190	\N
1827	1	Логическая Дисциплина	Три недели сосредоточенности — 21 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149098+03	LOGIC_STREAK	21	LOGIC_STREAK	LOGIC	7	f	\N	270	\N
1828	1	Логическая Дисциплина	Месяц острого ума — 30 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149098+03	LOGIC_STREAK	30	LOGIC_STREAK	LOGIC	8	f	\N	370	\N
1829	1	Логическая Дисциплина	Полтора месяца дедукции — 45 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149098+03	LOGIC_STREAK	45	LOGIC_STREAK	LOGIC	9	f	\N	500	\N
1830	1	Логическая Дисциплина	Два месяца безупречности — 60 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149099+03	LOGIC_STREAK	60	LOGIC_STREAK	LOGIC	10	f	\N	660	\N
1831	1	Логическая Дисциплина	Непрерывный разум — 90 дней подряд.\nСерия дней без пропусков в логике.	🔥	0.00	2026-11-11 22:53:00.149099+03	LOGIC_STREAK	90	LOGIC_STREAK	LOGIC	11	f	\N	860	\N
1832	1	Картограф Логики	Первая карта — 1 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149109+03	LOGIC_CARDS	1	LOGIC_CARDS	LOGIC	1	f	\N	10	\N
1833	1	Картограф Логики	Наметивший путь — 5 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149111+03	LOGIC_CARDS	5	LOGIC_CARDS	LOGIC	2	f	\N	25	\N
1834	1	Картограф Логики	Уверенный следопыт — 10 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149111+03	LOGIC_CARDS	10	LOGIC_CARDS	LOGIC	3	f	\N	50	\N
1835	1	Картограф Логики	Исследователь схем — 25 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149112+03	LOGIC_CARDS	25	LOGIC_CARDS	LOGIC	4	f	\N	85	\N
1836	1	Картограф Логики	Открыватель закономерностей — 50 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149112+03	LOGIC_CARDS	50	LOGIC_CARDS	LOGIC	5	f	\N	130	\N
1837	1	Картограф Логики	Картограф узоров — 75 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149113+03	LOGIC_CARDS	75	LOGIC_CARDS	LOGIC	6	f	\N	190	\N
1838	1	Картограф Логики	Мастер маршрутов — 100 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149113+03	LOGIC_CARDS	100	LOGIC_CARDS	LOGIC	7	f	\N	270	\N
1839	1	Картограф Логики	Гроссмейстер маршрутов — 150 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149114+03	LOGIC_CARDS	150	LOGIC_CARDS	LOGIC	8	f	\N	370	\N
1840	1	Картограф Логики	Архитектор логических путей — 200 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149114+03	LOGIC_CARDS	200	LOGIC_CARDS	LOGIC	9	f	\N	500	\N
1841	1	Картограф Логики	Великий геометр разума — 250 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149115+03	LOGIC_CARDS	250	LOGIC_CARDS	LOGIC	10	f	\N	660	\N
1842	1	Картограф Логики	Абсолютный картограф — 300 карточек.\nУспешно решённые логические карточки.	🗺️	0.00	2026-11-11 22:53:00.149115+03	LOGIC_CARDS	300	LOGIC_CARDS	LOGIC	11	f	\N	860	\N
1843	1	Полиглот	Первое слово — 1 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165134+03	LANG_WORDS	1	LANG_WORDS	LANG	1	f	\N	10	\N
1844	1	Полиглот	Юный полиглот — 10 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165135+03	LANG_WORDS	10	LANG_WORDS	LANG	2	f	\N	25	\N
1845	1	Полиглот	Собеседник — 25 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165136+03	LANG_WORDS	25	LANG_WORDS	LANG	3	f	\N	50	\N
1846	1	Полиглот	Знаток слов — 50 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165136+03	LANG_WORDS	50	LANG_WORDS	LANG	4	f	\N	85	\N
1847	1	Полиглот	Уверенный переводчик — 100 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165137+03	LANG_WORDS	100	LANG_WORDS	LANG	5	f	\N	130	\N
1848	1	Полиглот	Мастер лексики — 150 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165137+03	LANG_WORDS	150	LANG_WORDS	LANG	6	f	\N	190	\N
1849	1	Полиглот	Хранитель словаря — 200 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165138+03	LANG_WORDS	200	LANG_WORDS	LANG	7	f	\N	270	\N
1850	1	Полиглот	Владыка языков — 300 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165138+03	LANG_WORDS	300	LANG_WORDS	LANG	8	f	\N	370	\N
1851	1	Полиглот	Билингва-гроссмейстер — 400 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165138+03	LANG_WORDS	400	LANG_WORDS	LANG	9	f	\N	500	\N
1852	1	Полиглот	Живой переводчик — 500 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165139+03	LANG_WORDS	500	LANG_WORDS	LANG	10	f	\N	660	\N
1853	1	Полиглот	Абсолютный полиглот — 750 слов.\nВыученные иностранные слова.	🌍	0.00	2026-11-11 22:53:00.165139+03	LANG_WORDS	750	LANG_WORDS	LANG	11	f	\N	860	\N
1854	1	Языковая Дисциплина	Два дня подряд — 2 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165152+03	LANG_STREAK	2	LANG_STREAK	LANG	1	f	\N	10	\N
1855	1	Языковая Дисциплина	Тройное усердие — 3 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165153+03	LANG_STREAK	3	LANG_STREAK	LANG	2	f	\N	25	\N
1856	1	Языковая Дисциплина	Пятёрка практики — 5 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165153+03	LANG_STREAK	5	LANG_STREAK	LANG	3	f	\N	50	\N
1857	1	Языковая Дисциплина	Неделя языка — 7 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165153+03	LANG_STREAK	7	LANG_STREAK	LANG	4	f	\N	85	\N
1858	1	Языковая Дисциплина	Десять дней речи — 10 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165154+03	LANG_STREAK	10	LANG_STREAK	LANG	5	f	\N	130	\N
1859	1	Языковая Дисциплина	Две недели погружения — 14 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165154+03	LANG_STREAK	14	LANG_STREAK	LANG	6	f	\N	190	\N
1860	1	Языковая Дисциплина	Три недели разговора — 21 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165155+03	LANG_STREAK	21	LANG_STREAK	LANG	7	f	\N	270	\N
1861	1	Языковая Дисциплина	Месяц беглости — 30 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165155+03	LANG_STREAK	30	LANG_STREAK	LANG	8	f	\N	370	\N
1862	1	Языковая Дисциплина	Полтора месяца полиглота — 45 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165156+03	LANG_STREAK	45	LANG_STREAK	LANG	9	f	\N	500	\N
1863	1	Языковая Дисциплина	Два месяца языковой стали — 60 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165156+03	LANG_STREAK	60	LANG_STREAK	LANG	10	f	\N	660	\N
1864	1	Языковая Дисциплина	Языковой чемпион — 90 дней подряд.\nСерия дней без пропусков в языке.	🔥	0.00	2026-11-11 22:53:00.165156+03	LANG_STREAK	90	LANG_STREAK	LANG	11	f	\N	860	\N
1865	1	Мастер Карточек Языка	Первая карточка — 1 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.165175+03	LANG_CARDS	1	LANG_CARDS	LANG	1	f	\N	10	\N
1866	1	Мастер Карточек Языка	Набирающий словарь — 5 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.165176+03	LANG_CARDS	5	LANG_CARDS	LANG	2	f	\N	25	\N
1867	1	Мастер Карточек Языка	Уверенный чтец — 10 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.165176+03	LANG_CARDS	10	LANG_CARDS	LANG	3	f	\N	50	\N
1868	1	Мастер Карточек Языка	Практик диалогов — 25 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.165177+03	LANG_CARDS	25	LANG_CARDS	LANG	4	f	\N	85	\N
1869	1	Мастер Карточек Языка	Мастер перевода — 50 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.165177+03	LANG_CARDS	50	LANG_CARDS	LANG	5	f	\N	130	\N
1870	1	Мастер Карточек Языка	Знаток фраз — 75 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.165177+03	LANG_CARDS	75	LANG_CARDS	LANG	6	f	\N	190	\N
1871	1	Мастер Карточек Языка	Коллекционер выражений — 100 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.165178+03	LANG_CARDS	100	LANG_CARDS	LANG	7	f	\N	270	\N
1872	1	Мастер Карточек Языка	Гроссмейстер карточек — 150 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.165178+03	LANG_CARDS	150	LANG_CARDS	LANG	8	f	\N	370	\N
1873	1	Мастер Карточек Языка	Архитектор речи — 200 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.165179+03	LANG_CARDS	200	LANG_CARDS	LANG	9	f	\N	500	\N
1874	1	Мастер Карточек Языка	Великий лингвист практики — 250 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.165179+03	LANG_CARDS	250	LANG_CARDS	LANG	10	f	\N	660	\N
1875	1	Мастер Карточек Языка	Абсолютный мастер карточек — 300 карточек.\nУспешно пройденные карточки языка.	🗂️	0.00	2026-11-11 22:53:00.16518+03	LANG_CARDS	300	LANG_CARDS	LANG	11	f	\N	860	\N
1657	4	Первая разгадка	Решить первую задачу в дейлике логики.	🏅	0.00	2026-11-11 22:39:50.747753+03	NONE	0	LOGIC_TASKS	READING	0	f	\N	130	\N
1417	4	Главный босс школы	Покоритель ВПР — сдать Всероссийские проверочные работы по математике на максимальный балл:\nВПР за 4 класс (базовая арифметика и логика)\nВПР за 5 класс (дроби и основы геометрии)\nВПР за 6 класс (отрицательные числа, пропорции)\nВПР за 7 класс (начало алгебры и геометрии)\nВПР за 8 класс (функции, системы, теоремы)	🛡️	0.00	2026-11-08 23:19:52.709074+03	NONE	0	MATH_QUEST_VPR	MATH	0	f	\N	130	\N
1418	4	Олимпийский резерв	Успешно поучаствовать в школьных или онлайн-олимпиадах:\nШкольный этап Всероссийской олимпиады\nОлимпиада «Кенгуру» (или аналогичная)\nНабрать более 80% правильных ответов в любом олимпиадном туре	🎪	0.00	2026-11-08 23:19:52.709074+03	NONE	0	MATH_QUEST_OLYMP	MATH	0	f	\N	130	\N
1419	4	Звездная Карта	Карточки особого уровня — решить 5 уникальных нестандартных задач повышенной сложности:\nОсобая карточка №1\nОсобая карточка №2\nОсобая карточка №3\nОсобая карточка №4\nОсобая карточка №5	⭐	0.00	2026-11-08 23:19:52.709074+03	NONE	0	MATH_QUEST_STAR	MATH	0	f	\N	130	\N
1420	4	Математический универсал	Правильно решить за один день хотя бы по одному заданию из 6 разных тем (уравнение, текстовая задача, пример на скорость, дробь, геометрия, степень).	🔮	0.00	2026-11-08 23:19:52.709074+03	NONE	0	MATH_UNIVERSAL	MATH	0	f	\N	130	\N
1421	4	Убийца гигантов	Безошибочно решить пример, в котором больше 10 действий (со скобками, умножением и делением).	🦖	0.00	2026-11-08 23:19:52.709074+03	NONE	0	MATH_GIANT	MATH	0	f	\N	130	\N
1422	4	Быстрее калькулятора	Решить 20 простых примеров на умножение/деление в уме меньше чем за 1 минуту.	⏱️	0.00	2026-11-08 23:19:52.709074+03	NONE	0	MATH_FAST	MATH	0	f	\N	130	\N
1423	4	Юный профессор	Объяснить родителю или другу, как решается сложное уравнение или задача, так, чтобы они всё поняли.	👨‍🏫	0.00	2026-11-08 23:19:52.709075+03	NONE	0	MATH_PROF	MATH	0	f	\N	130	\N
1424	4	Вычислительный стрик	Заниматься математикой и решать не менее 15 примеров каждый день в течение 21 дня без перерывов.	🔥	0.00	2026-11-08 23:19:52.709075+03	MATH_STREAK	21	MATH_STREAK	MATH	0	f	\N	130	\N
1425	4	Детектив ошибок	Найти ошибку в чужом решении (или специально допущенную родителем ошибку в примере) и исправить её.	🔎	0.00	2026-11-08 23:19:52.709075+03	NONE	0	MATH_ERR_DETECT	MATH	0	f	\N	130	\N
1427	4	Циркуль-мастер	Построить идеальный геометрический чертёж с помощью линейки и циркуля без помарок с первой попытки.	📐	0.00	2026-11-08 23:19:52.709075+03	NONE	0	MATH_COMPASS	MATH	0	f	\N	130	\N
1428	4	Карточный стратег	Первая пара — 3 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709076+03	MATH_CARD_SUCCESS	3	MATH_CARD_DAY	MATH	1	f	\N	10	\N
1429	4	Карточный стратег	Любитель карточек — 10 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709076+03	MATH_CARD_SUCCESS	10	MATH_CARD_DAY	MATH	2	f	\N	25	\N
85	1	Хранитель тайн · Приключения	Гроссмейстер — 25 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.848698+03	READING_GENRE_ADVENTURE	25	READING_GENRE_ADVENTURE	READING	8	f	\N	370	\N
1430	4	Карточный стратег	Десятка за картами — 25 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709077+03	MATH_CARD_SUCCESS	25	MATH_CARD_DAY	MATH	3	f	\N	50	\N
1431	4	Карточный стратег	Пятидесятый рубеж — 50 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709077+03	MATH_CARD_SUCCESS	50	MATH_CARD_DAY	MATH	4	f	\N	85	\N
1432	4	Карточный стратег	Карточный ветеран — 80 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709077+03	MATH_CARD_SUCCESS	80	MATH_CARD_DAY	MATH	5	f	\N	130	\N
1433	4	Карточный стратег	Штурман колоды — 120 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709077+03	MATH_CARD_SUCCESS	120	MATH_CARD_DAY	MATH	6	f	\N	190	\N
1434	4	Карточный стратег	Сто семьдесят — 170 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709077+03	MATH_CARD_SUCCESS	170	MATH_CARD_DAY	MATH	7	f	\N	270	\N
1435	4	Карточный стратег	Мастер колоды — 230 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709077+03	MATH_CARD_SUCCESS	230	MATH_CARD_DAY	MATH	8	f	\N	370	\N
1436	4	Карточный стратег	Триста карт — 300 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709078+03	MATH_CARD_SUCCESS	300	MATH_CARD_DAY	MATH	9	f	\N	500	\N
668	3	Ловец рифм · Поэзия	Ученик — 1 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.640732+03	READING_GENRE_POETRY	1	READING_GENRE_POETRY	READING	1	f	\N	10	\N
1437	4	Карточный стратег	Гроссмейстер карт — 380 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709078+03	MATH_CARD_SUCCESS	380	MATH_CARD_DAY	MATH	10	f	\N	660	\N
1438	4	Карточный стратег	Повелитель Карточной Колоды — 450 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 23:19:52.709078+03	MATH_CARD_SUCCESS	450	MATH_CARD_DAY	MATH	11	f	\N	860	\N
1439	4	Карточный марафонец	Разминка — 3 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.709079+03	MATH_CARD_STREAK	3	MATH_CARD_STREAK	MATH	1	f	\N	10	\N
1440	4	Карточный марафонец	Неделя в строю — 7 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.709079+03	MATH_CARD_STREAK	7	MATH_CARD_STREAK	MATH	2	f	\N	25	\N
1441	4	Карточный марафонец	Двухнедельный марафон — 14 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.709079+03	MATH_CARD_STREAK	14	MATH_CARD_STREAK	MATH	3	f	\N	50	\N
1442	4	Карточный марафонец	Три недели упорства — 21 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.709079+03	MATH_CARD_STREAK	21	MATH_CARD_STREAK	MATH	4	f	\N	85	\N
1443	4	Карточный марафонец	Месяц математики — 30 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.709079+03	MATH_CARD_STREAK	30	MATH_CARD_STREAK	MATH	5	f	\N	130	\N
1444	4	Карточный марафонец	Полтора месяца — 45 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.70908+03	MATH_CARD_STREAK	45	MATH_CARD_STREAK	MATH	6	f	\N	190	\N
1445	4	Карточный марафонец	Два месяца — 60 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.70908+03	MATH_CARD_STREAK	60	MATH_CARD_STREAK	MATH	7	f	\N	270	\N
1447	4	Карточный марафонец	Сезон математика — 120 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.70908+03	MATH_CARD_STREAK	120	MATH_CARD_STREAK	MATH	9	f	\N	500	\N
1448	4	Карточный марафонец	Полгода точности — 180 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.70908+03	MATH_CARD_STREAK	180	MATH_CARD_STREAK	MATH	10	f	\N	660	\N
1449	4	Карточный марафонец	Год точных наук — 365 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.70908+03	MATH_CARD_STREAK	365	MATH_CARD_STREAK	MATH	11	f	\N	860	\N
1450	4	Первая победа	Успешно решить первую карточку уровня «Лёгкая».	🃏	0.00	2026-11-08 23:19:52.709081+03	MATH_CARD_LVL_EASY	1	MATH_CARD_LVL_EASY	MATH	0	f	\N	130	\N
1451	4	Хардкорщик	Успешно решить карточку уровня «Хард».	🔥	0.00	2026-11-08 23:19:52.709081+03	MATH_CARD_LVL_EXTREME	1	MATH_CARD_LVL_EXTREME	MATH	0	f	\N	130	\N
1452	4	Олимпийский запас	Успешно решить олимпиадную карточку.	🏆	0.00	2026-11-08 23:19:52.709081+03	MATH_CARD_LVL_OLYMPIAD	1	MATH_CARD_LVL_OLYMPIAD	MATH	0	f	\N	130	\N
1453	4	Магистр Чистоты	Гость в собственном доме — 50 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.750231+03	HOUSE_ROOM_POINTS	50	HOUSE_CLEAN_POINTS	HOUSE	1	f	\N	10	\N
1454	4	Магистр Чистоты	Борьба с пылью — 250 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.750234+03	HOUSE_ROOM_POINTS	250	HOUSE_CLEAN_POINTS	HOUSE	2	f	\N	25	\N
1455	4	Магистр Чистоты	Видимый пол — 600 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.750235+03	HOUSE_ROOM_POINTS	600	HOUSE_CLEAN_POINTS	HOUSE	3	f	\N	50	\N
1456	4	Магистр Чистоты	Аккуратный жилец — 1200 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.750236+03	HOUSE_ROOM_POINTS	1200	HOUSE_CLEAN_POINTS	HOUSE	4	f	\N	85	\N
1457	4	Магистр Чистоты	Хранитель уюта — 2000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.750237+03	HOUSE_ROOM_POINTS	2000	HOUSE_CLEAN_POINTS	HOUSE	5	f	\N	130	\N
1458	4	Магистр Чистоты	Эксперт клининга — 3000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.750237+03	HOUSE_ROOM_POINTS	3000	HOUSE_CLEAN_POINTS	HOUSE	6	f	\N	190	\N
1459	4	Магистр Чистоты	Гроза беспорядка — 4200 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.750238+03	HOUSE_ROOM_POINTS	4200	HOUSE_CLEAN_POINTS	HOUSE	7	f	\N	270	\N
1460	4	Магистр Чистоты	Эстетичный хозяин — 5500 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.750239+03	HOUSE_ROOM_POINTS	5500	HOUSE_CLEAN_POINTS	HOUSE	8	f	\N	370	\N
1461	4	Магистр Чистоты	Остров безупречности — 7000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.75024+03	HOUSE_ROOM_POINTS	7000	HOUSE_CLEAN_POINTS	HOUSE	9	f	\N	500	\N
1462	4	Магистр Чистоты	Перфекционист — 8500 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.750241+03	HOUSE_ROOM_POINTS	8500	HOUSE_CLEAN_POINTS	HOUSE	10	f	\N	660	\N
1463	4	Магистр Чистоты	Абсолютный Повелитель Чистоты — 10000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 23:19:52.750241+03	HOUSE_ROOM_POINTS	10000	HOUSE_CLEAN_POINTS	HOUSE	11	f	\N	860	\N
1464	4	Незаменимый помощник	Разовая услуга — 50 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750281+03	HOUSE_HELP_POINTS	50	HOUSE_HELP_POINTS	HOUSE	1	f	\N	10	\N
1465	4	Незаменимый помощник	Полезный союзник — 200 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750281+03	HOUSE_HELP_POINTS	200	HOUSE_HELP_POINTS	HOUSE	2	f	\N	25	\N
1466	4	Незаменимый помощник	Семейная опора — 500 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750283+03	HOUSE_HELP_POINTS	500	HOUSE_HELP_POINTS	HOUSE	3	f	\N	50	\N
1468	4	Незаменимый помощник	Менеджер комфорта — 1800 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750284+03	HOUSE_HELP_POINTS	1800	HOUSE_HELP_POINTS	HOUSE	5	f	\N	130	\N
1469	4	Незаменимый помощник	Хранитель домашнего очага — 2800 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750285+03	HOUSE_HELP_POINTS	2800	HOUSE_HELP_POINTS	HOUSE	6	f	\N	190	\N
1470	4	Незаменимый помощник	Управляющий бытом — 4000 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750286+03	HOUSE_HELP_POINTS	4000	HOUSE_HELP_POINTS	HOUSE	7	f	\N	270	\N
1471	4	Незаменимый помощник	Правая рука семьи — 5300 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750286+03	HOUSE_HELP_POINTS	5300	HOUSE_HELP_POINTS	HOUSE	8	f	\N	370	\N
86	1	Хранитель тайн · Приключения	Магистр — 30 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.8487+03	READING_GENRE_ADVENTURE	30	READING_GENRE_ADVENTURE	READING	9	f	\N	500	\N
1472	4	Незаменимый помощник	Шеф-помощник — 6700 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750287+03	HOUSE_HELP_POINTS	6700	HOUSE_HELP_POINTS	HOUSE	9	f	\N	500	\N
1473	4	Незаменимый помощник	Легенда кооперации — 8200 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750288+03	HOUSE_HELP_POINTS	8200	HOUSE_HELP_POINTS	HOUSE	10	f	\N	660	\N
1474	4	Незаменимый помощник	Генеральный директор Уюта — 10000 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750288+03	HOUSE_HELP_POINTS	10000	HOUSE_HELP_POINTS	HOUSE	11	f	\N	860	\N
1479	4	Шеф-мойщик	Шеф — 250 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.751164+03	NONE	250	HOUSE_CAT_DISHES	HOUSE	5	f	\N	130	\N
1480	4	Шеф-мойщик	Эксперт — 400 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.751165+03	NONE	400	HOUSE_CAT_DISHES	HOUSE	6	f	\N	190	\N
905	3	Карточный стратег	Любитель карточек — 10 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740723+03	MATH_CARD_SUCCESS	10	MATH_CARD_DAY	MATH	2	f	\N	25	\N
1524	4	Эко-патруль	Эксперт — 400 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752855+03	NONE	400	HOUSE_CAT_TRASH	HOUSE	6	f	\N	190	\N
1481	4	Шеф-мойщик	Гроссмейстер — 600 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.751165+03	NONE	600	HOUSE_CAT_DISHES	HOUSE	7	f	\N	270	\N
1482	4	Шеф-мойщик	Магистр — 850 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.751166+03	NONE	850	HOUSE_CAT_DISHES	HOUSE	8	f	\N	370	\N
1483	4	Шеф-мойщик	Легенда быта — 1100 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.751167+03	NONE	1100	HOUSE_CAT_DISHES	HOUSE	9	f	\N	500	\N
1484	4	Шеф-мойщик	Хранитель очага — 1400 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.751168+03	NONE	1400	HOUSE_CAT_DISHES	HOUSE	10	f	\N	660	\N
1485	4	Шеф-мойщик	Генеральный директор Уюта — 1700 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.751168+03	NONE	1700	HOUSE_CAT_DISHES	HOUSE	11	f	\N	860	\N
1486	4	Повелитель швабры	Стажер — 5 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.751987+03	NONE	5	HOUSE_CAT_MOP	HOUSE	1	f	\N	10	\N
1487	4	Повелитель швабры	Новичок — 20 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.751988+03	NONE	20	HOUSE_CAT_MOP	HOUSE	2	f	\N	25	\N
1489	4	Повелитель швабры	Мастер — 120 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.75199+03	NONE	120	HOUSE_CAT_MOP	HOUSE	4	f	\N	85	\N
1490	4	Повелитель швабры	Шеф — 250 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.751991+03	NONE	250	HOUSE_CAT_MOP	HOUSE	5	f	\N	130	\N
1491	4	Повелитель швабры	Эксперт — 400 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.751991+03	NONE	400	HOUSE_CAT_MOP	HOUSE	6	f	\N	190	\N
1492	4	Повелитель швабры	Гроссмейстер — 600 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.751996+03	NONE	600	HOUSE_CAT_MOP	HOUSE	7	f	\N	270	\N
1493	4	Повелитель швабры	Магистр — 850 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.751997+03	NONE	850	HOUSE_CAT_MOP	HOUSE	8	f	\N	370	\N
1476	4	Шеф-мойщик	Новичок — 20 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.751162+03	NONE	20	HOUSE_CAT_DISHES	HOUSE	2	f	\N	25	\N
88	1	Хранитель тайн · Приключения	Божество жанра — 40 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.848726+03	READING_GENRE_ADVENTURE	40	READING_GENRE_ADVENTURE	READING	11	f	\N	860	\N
1494	4	Повелитель швабры	Легенда быта — 1100 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.751997+03	NONE	1100	HOUSE_CAT_MOP	HOUSE	9	f	\N	500	\N
31	1	Литературный турист	Покоритель горизонтов — 9 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.847772+03	READING_GENRES	9	READING_GENRES	READING	9	f	\N	500	\N
1495	4	Повелитель швабры	Хранитель очага — 1400 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.751998+03	NONE	1400	HOUSE_CAT_MOP	HOUSE	10	f	\N	660	\N
1496	4	Повелитель швабры	Генеральный директор Уюта — 1700 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.751999+03	NONE	1700	HOUSE_CAT_MOP	HOUSE	11	f	\N	860	\N
946	3	Незаменимый помощник	Управляющий бытом — 4000 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795717+03	HOUSE_HELP_POINTS	4000	HOUSE_HELP_POINTS	HOUSE	7	f	\N	270	\N
1043	3	Идеальный месяц	Поддерживать порядок в своей комнате на оценку «+2» 30 дней подряд без единого срыва в «0» или «−1».	👑	0.00	2026-11-08 17:06:23.795883+03	HOUSE_CLEAN_STREAK	30	HOUSE_PERFECT_MONTH	HOUSE	0	f	\N	130	\N
1131	4	Хранитель тайн · Приключения	Эксперт — 16 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.631124+03	READING_GENRE_ADVENTURE	16	READING_GENRE_ADVENTURE	READING	6	f	\N	190	\N
1232	4	Неудержимый	Читать каждый день без пропусков в течение 30 дней.	🔥	0.00	2026-11-08 23:19:52.639975+03	READING_STREAK	30	READING_STREAK	READING	0	f	\N	130	\N
45	1	Мастер заклинаний · Фэнтези	Ученик — 1 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.848566+03	READING_GENRE_FANTASY	1	READING_GENRE_FANTASY	READING	1	f	\N	10	\N
1497	4	Стильный эксперт	Стажер — 5 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.752009+03	NONE	5	HOUSE_CAT_LAUNDRY	HOUSE	1	f	\N	10	\N
1498	4	Стильный эксперт	Новичок — 20 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.752009+03	NONE	20	HOUSE_CAT_LAUNDRY	HOUSE	2	f	\N	25	\N
1499	4	Стильный эксперт	Практик — 60 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.75201+03	NONE	60	HOUSE_CAT_LAUNDRY	HOUSE	3	f	\N	50	\N
1500	4	Стильный эксперт	Мастер — 120 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.752011+03	NONE	120	HOUSE_CAT_LAUNDRY	HOUSE	4	f	\N	85	\N
1501	4	Стильный эксперт	Шеф — 250 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.752012+03	NONE	250	HOUSE_CAT_LAUNDRY	HOUSE	5	f	\N	130	\N
1503	4	Стильный эксперт	Гроссмейстер — 600 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.752013+03	NONE	600	HOUSE_CAT_LAUNDRY	HOUSE	7	f	\N	270	\N
1504	4	Стильный эксперт	Магистр — 850 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.752014+03	NONE	850	HOUSE_CAT_LAUNDRY	HOUSE	8	f	\N	370	\N
1505	4	Стильный эксперт	Легенда быта — 1100 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.752014+03	NONE	1100	HOUSE_CAT_LAUNDRY	HOUSE	9	f	\N	500	\N
1506	4	Стильный эксперт	Хранитель очага — 1400 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.752015+03	NONE	1400	HOUSE_CAT_LAUNDRY	HOUSE	10	f	\N	660	\N
1507	4	Стильный эксперт	Генеральный директор Уюта — 1700 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.752016+03	NONE	1700	HOUSE_CAT_LAUNDRY	HOUSE	11	f	\N	860	\N
1508	4	Добытчик ресурсов	Стажер — 5 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.75202+03	NONE	5	HOUSE_CAT_SHOPPING	HOUSE	1	f	\N	10	\N
1509	4	Добытчик ресурсов	Новичок — 20 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.752021+03	NONE	20	HOUSE_CAT_SHOPPING	HOUSE	2	f	\N	25	\N
1573	4	Дитя леса	Прочесть первый цикл «Котов-Воителей» Эрин Хантер «Пророчество начинается»:\n«Наставник Надежды»\n«Огонь и Вода»\n«Лес Тайн»\n«Бушующая Буря»\n«Опасная Тропа»\n«Самая Тёмная Ночь»	🐾	0.00	2026-11-11 22:23:25.61455+03	NONE	0	READING_QUEST_WARRIORS_PROPHECY	READING	0	f	\N	130	\N
1574	4	Избранник звёзд	Прочесть второй цикл «Котов-Воителей» Эрин Хантер «Новое пророчество»:\n«Лунная Полночь»\n«Восход Луны»\n«Спасение»\n«Звёздный Свет»\n«Сумерки»\n«Закат»	🌙	0.00	2026-11-11 22:23:25.614556+03	NONE	0	READING_QUEST_WARRIORS_NEW	READING	0	f	\N	130	\N
1575	4	Сила трёх	Прочесть третий цикл «Котов-Воителей» Эрин Хантер «Сила трёх»:\n«Прозрение»\n«Тёмная Река»\n«Изгнанники»\n«Затмение»\n«Долгие Тени»\n«Восход Солнца»	⚡	0.00	2026-11-11 22:23:25.61456+03	NONE	0	READING_QUEST_WARRIORS_POWER	READING	0	f	\N	130	\N
1576	4	Знамение Солнца	Прочесть четвёртый цикл «Котов-Воителей» Эрин Хантер «Знамение Солнца»:\n«Четвёртый Ученик»\n«Затухающие Эхо»\n«Ночные Шёпоты»\n«Знак Луны»\n«Забытый Воин»\n«Последняя Надежда»	☀️	0.00	2026-11-11 22:23:25.614672+03	NONE	0	READING_QUEST_WARRIORS_OMEN	READING	0	f	\N	130	\N
22	1	Книжный червь	Повелитель библиотек — 300 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.847731+03	READING_BOOKS	300	READING_BOOKS	READING	11	f	\N	860	\N
23	1	Литературный турист	Первый шаг за порог — 1 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.847756+03	READING_GENRES	1	READING_GENRES	READING	1	f	\N	10	\N
166	1	Смех сквозь строки · Юмор	Ученик — 1 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.84928+03	READING_GENRE_HUMOR	1	READING_GENRE_HUMOR	READING	1	f	\N	10	\N
375	1	Юный профессор	Объяснить родителю или другу, как решается сложное уравнение или задача, так, чтобы они всё поняли.	👨‍🏫	0.00	2026-11-07 21:38:42.927593+03	NONE	0	MATH_PROF	MATH	0	f	\N	130	\N
417	1	Незаменимый помощник	Полезный союзник — 200 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.971466+03	HOUSE_HELP_POINTS	200	HOUSE_HELP_POINTS	HOUSE	2	f	\N	25	\N
442	1	Повелитель швабры	Шеф — 250 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.971575+03	NONE	250	HOUSE_CAT_MOP	HOUSE	5	f	\N	130	\N
465	1	Добытчик ресурсов	Эксперт — 400 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.971609+03	NONE	400	HOUSE_CAT_SHOPPING	HOUSE	6	f	\N	190	\N
491	1	Су-шеф	Хранитель очага — 1400 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.971644+03	NONE	1400	HOUSE_CAT_COOKING	HOUSE	10	f	\N	660	\N
573	3	Мастер заклинаний · Фэнтези	Искатель — 12 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.640469+03	READING_GENRE_FANTASY	12	READING_GENRE_FANTASY	READING	5	f	\N	130	\N
597	3	Детектив с лупой · Детективы	Мастер — 20 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.64051+03	READING_GENRE_DETECTIVE	20	READING_GENRE_DETECTIVE	READING	7	f	\N	270	\N
598	3	Детектив с лупой · Детективы	Гроссмейстер — 25 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.640511+03	READING_GENRE_DETECTIVE	25	READING_GENRE_DETECTIVE	READING	8	f	\N	370	\N
599	3	Детектив с лупой · Детективы	Магистр — 30 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.640512+03	READING_GENRE_DETECTIVE	30	READING_GENRE_DETECTIVE	READING	9	f	\N	500	\N
600	3	Детектив с лупой · Детективы	Легенда — 35 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.640513+03	READING_GENRE_DETECTIVE	35	READING_GENRE_DETECTIVE	READING	10	f	\N	660	\N
601	3	Детектив с лупой · Детективы	Божество жанра — 40 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.640514+03	READING_GENRE_DETECTIVE	40	READING_GENRE_DETECTIVE	READING	11	f	\N	860	\N
620	3	Проводник в реальность · Современная проза	Гроссмейстер — 25 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.640616+03	READING_GENRE_CONTEMPORARY	25	READING_GENRE_CONTEMPORARY	READING	8	f	\N	370	\N
688	3	Живые картинки · Комиксы и манга	Легенда — 35 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640767+03	READING_GENRE_COMICS	35	READING_GENRE_COMICS	READING	10	f	\N	660	\N
709	3	Быстрее ветра	Прочитать полноценную книгу (от 200 страниц) быстрее, чем за 3 дня.	⚡	0.00	2026-11-08 17:06:23.640835+03	NONE	0	READING_FAST	READING	0	f	\N	130	\N
74	1	Детектив с лупой · Детективы	Гроссмейстер — 25 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.848661+03	READING_GENRE_DETECTIVE	25	READING_GENRE_DETECTIVE	READING	8	f	\N	370	\N
860	3	Зона хардкора	Стажер — 1 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740612+03	MATH_CARD_DONE_HARD	1	MATH_CAT_CARD_HARD	MATH	1	f	\N	10	\N
912	3	Карточный стратег	Триста карт — 300 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740728+03	MATH_CARD_SUCCESS	300	MATH_CARD_DAY	MATH	9	f	\N	500	\N
47	1	Мастер заклинаний · Фэнтези	Подмастерье — 5 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.848572+03	READING_GENRE_FANTASY	5	READING_GENRE_FANTASY	READING	3	f	\N	50	\N
979	3	Стильный эксперт	Гроссмейстер — 600 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.79581+03	NONE	600	HOUSE_CAT_LAUNDRY	HOUSE	7	f	\N	270	\N
1058	4	Марафонец страниц	Книжный титан — 65000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626447+03	READING_PAGES	65000	READING_PAGES	READING	10	f	\N	660	\N
560	3	Покоритель циклов	Ценитель продолжений — 4 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.640341+03	READING_SERIES	4	READING_SERIES	READING	3	f	\N	50	\N
1234	4	Литературный критик	Рассказать родителям содержательные отзывы на 10 разных книг.	🗣️	0.00	2026-11-08 23:19:52.640959+03	NONE	0	READING_CRITIC	READING	0	f	\N	130	\N
1263	4	Испытатель тестов	Тестовый дебютант — 5 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709022+03	MATH_CARDS	5	MATH_TESTS	MATH	1	f	\N	10	\N
1510	4	Добытчик ресурсов	Практик — 60 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.752021+03	NONE	60	HOUSE_CAT_SHOPPING	HOUSE	3	f	\N	50	\N
1511	4	Добытчик ресурсов	Мастер — 120 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.752022+03	NONE	120	HOUSE_CAT_SHOPPING	HOUSE	4	f	\N	85	\N
1512	4	Добытчик ресурсов	Шеф — 250 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.752023+03	NONE	250	HOUSE_CAT_SHOPPING	HOUSE	5	f	\N	130	\N
1513	4	Добытчик ресурсов	Эксперт — 400 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.752023+03	NONE	400	HOUSE_CAT_SHOPPING	HOUSE	6	f	\N	190	\N
55	1	Мастер заклинаний · Фэнтези	Божество жанра — 40 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.84859+03	READING_GENRE_FANTASY	40	READING_GENRE_FANTASY	READING	11	f	\N	860	\N
1514	4	Добытчик ресурсов	Гроссмейстер — 600 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.752024+03	NONE	600	HOUSE_CAT_SHOPPING	HOUSE	7	f	\N	270	\N
1515	4	Добытчик ресурсов	Магистр — 850 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.752025+03	NONE	850	HOUSE_CAT_SHOPPING	HOUSE	8	f	\N	370	\N
1516	4	Добытчик ресурсов	Легенда быта — 1100 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.752025+03	NONE	1100	HOUSE_CAT_SHOPPING	HOUSE	9	f	\N	500	\N
1517	4	Добытчик ресурсов	Хранитель очага — 1400 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.752026+03	NONE	1400	HOUSE_CAT_SHOPPING	HOUSE	10	f	\N	660	\N
1518	4	Добытчик ресурсов	Генеральный директор Уюта — 1700 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 23:19:52.752027+03	NONE	1700	HOUSE_CAT_SHOPPING	HOUSE	11	f	\N	860	\N
1519	4	Эко-патруль	Стажер — 5 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752851+03	NONE	5	HOUSE_CAT_TRASH	HOUSE	1	f	\N	10	\N
1520	4	Эко-патруль	Новичок — 20 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752852+03	NONE	20	HOUSE_CAT_TRASH	HOUSE	2	f	\N	25	\N
1521	4	Эко-патруль	Практик — 60 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752852+03	NONE	60	HOUSE_CAT_TRASH	HOUSE	3	f	\N	50	\N
1522	4	Эко-патруль	Мастер — 120 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752853+03	NONE	120	HOUSE_CAT_TRASH	HOUSE	4	f	\N	85	\N
1523	4	Эко-патруль	Шеф — 250 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752854+03	NONE	250	HOUSE_CAT_TRASH	HOUSE	5	f	\N	130	\N
1525	4	Эко-патруль	Гроссмейстер — 600 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752855+03	NONE	600	HOUSE_CAT_TRASH	HOUSE	7	f	\N	270	\N
1526	4	Эко-патруль	Магистр — 850 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752856+03	NONE	850	HOUSE_CAT_TRASH	HOUSE	8	f	\N	370	\N
1527	4	Эко-патруль	Легенда быта — 1100 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752857+03	NONE	1100	HOUSE_CAT_TRASH	HOUSE	9	f	\N	500	\N
1528	4	Эко-патруль	Хранитель очага — 1400 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752858+03	NONE	1400	HOUSE_CAT_TRASH	HOUSE	10	f	\N	660	\N
1529	4	Эко-патруль	Генеральный директор Уюта — 1700 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 23:19:52.752858+03	NONE	1700	HOUSE_CAT_TRASH	HOUSE	11	f	\N	860	\N
1530	4	Су-шеф	Стажер — 5 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.75344+03	NONE	5	HOUSE_CAT_COOKING	HOUSE	1	f	\N	10	\N
1531	4	Су-шеф	Новичок — 20 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.753441+03	NONE	20	HOUSE_CAT_COOKING	HOUSE	2	f	\N	25	\N
1532	4	Су-шеф	Практик — 60 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.75345+03	NONE	60	HOUSE_CAT_COOKING	HOUSE	3	f	\N	50	\N
1533	4	Су-шеф	Мастер — 120 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.75345+03	NONE	120	HOUSE_CAT_COOKING	HOUSE	4	f	\N	85	\N
1534	4	Су-шеф	Шеф — 250 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.753451+03	NONE	250	HOUSE_CAT_COOKING	HOUSE	5	f	\N	130	\N
1535	4	Су-шеф	Эксперт — 400 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.753452+03	NONE	400	HOUSE_CAT_COOKING	HOUSE	6	f	\N	190	\N
1536	4	Су-шеф	Гроссмейстер — 600 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.753453+03	NONE	600	HOUSE_CAT_COOKING	HOUSE	7	f	\N	270	\N
1537	4	Су-шеф	Магистр — 850 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.753453+03	NONE	850	HOUSE_CAT_COOKING	HOUSE	8	f	\N	370	\N
1538	4	Су-шеф	Легенда быта — 1100 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.753454+03	NONE	1100	HOUSE_CAT_COOKING	HOUSE	9	f	\N	500	\N
89	1	Проводник в реальность · Современная проза	Ученик — 1 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849044+03	READING_GENRE_CONTEMPORARY	1	READING_GENRE_CONTEMPORARY	READING	1	f	\N	10	\N
1539	4	Су-шеф	Хранитель очага — 1400 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.753455+03	NONE	1400	HOUSE_CAT_COOKING	HOUSE	10	f	\N	660	\N
1540	4	Су-шеф	Генеральный директор Уюта — 1700 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 23:19:52.753455+03	NONE	1700	HOUSE_CAT_COOKING	HOUSE	11	f	\N	860	\N
1541	4	Домашний инженер	Стажер — 5 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.75346+03	NONE	5	HOUSE_CAT_REPAIR	HOUSE	1	f	\N	10	\N
1542	4	Домашний инженер	Новичок — 20 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.753461+03	NONE	20	HOUSE_CAT_REPAIR	HOUSE	2	f	\N	25	\N
1543	4	Домашний инженер	Практик — 60 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.753462+03	NONE	60	HOUSE_CAT_REPAIR	HOUSE	3	f	\N	50	\N
1544	4	Домашний инженер	Мастер — 120 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.753462+03	NONE	120	HOUSE_CAT_REPAIR	HOUSE	4	f	\N	85	\N
1545	4	Домашний инженер	Шеф — 250 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.753463+03	NONE	250	HOUSE_CAT_REPAIR	HOUSE	5	f	\N	130	\N
1546	4	Домашний инженер	Эксперт — 400 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.753464+03	NONE	400	HOUSE_CAT_REPAIR	HOUSE	6	f	\N	190	\N
1547	4	Домашний инженер	Гроссмейстер — 600 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.753464+03	NONE	600	HOUSE_CAT_REPAIR	HOUSE	7	f	\N	270	\N
1548	4	Домашний инженер	Магистр — 850 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.753465+03	NONE	850	HOUSE_CAT_REPAIR	HOUSE	8	f	\N	370	\N
1549	4	Домашний инженер	Легенда быта — 1100 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.753466+03	NONE	1100	HOUSE_CAT_REPAIR	HOUSE	9	f	\N	500	\N
1550	4	Домашний инженер	Хранитель очага — 1400 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.753466+03	NONE	1400	HOUSE_CAT_REPAIR	HOUSE	10	f	\N	660	\N
1551	4	Домашний инженер	Генеральный директор Уюта — 1700 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 23:19:52.753467+03	NONE	1700	HOUSE_CAT_REPAIR	HOUSE	11	f	\N	860	\N
1552	4	Ботаник-хранитель	Стажер — 5 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754101+03	NONE	5	HOUSE_CAT_PLANTS	HOUSE	1	f	\N	10	\N
1553	4	Ботаник-хранитель	Новичок — 20 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754102+03	NONE	20	HOUSE_CAT_PLANTS	HOUSE	2	f	\N	25	\N
1554	4	Ботаник-хранитель	Практик — 60 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754103+03	NONE	60	HOUSE_CAT_PLANTS	HOUSE	3	f	\N	50	\N
1555	4	Ботаник-хранитель	Мастер — 120 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754103+03	NONE	120	HOUSE_CAT_PLANTS	HOUSE	4	f	\N	85	\N
1556	4	Ботаник-хранитель	Шеф — 250 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754104+03	NONE	250	HOUSE_CAT_PLANTS	HOUSE	5	f	\N	130	\N
1557	4	Ботаник-хранитель	Эксперт — 400 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754104+03	NONE	400	HOUSE_CAT_PLANTS	HOUSE	6	f	\N	190	\N
90	1	Проводник в реальность · Современная проза	Новичок — 3 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849047+03	READING_GENRE_CONTEMPORARY	3	READING_GENRE_CONTEMPORARY	READING	2	f	\N	25	\N
1691	4	Первое слово	Выучить первое иностранное слово.	🏅	0.00	2026-11-11 22:39:50.762015+03	NONE	0	LANG_WORDS	READING	0	f	\N	130	\N
1037	3	Ботаник-хранитель	Хранитель очага — 1400 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795859+03	NONE	1400	HOUSE_CAT_PLANTS	HOUSE	10	f	\N	660	\N
1038	3	Ботаник-хранитель	Генеральный директор Уюта — 1700 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795859+03	NONE	1700	HOUSE_CAT_PLANTS	HOUSE	11	f	\N	860	\N
1039	3	Ультимативный Геймер	Купить комбо для отдыха:\nТелевизор 📺\nИгровая приставка 🎮\nКресло-мешок или пуфик 🛋️	🎮	0.00	2026-11-08 17:06:23.795864+03	NONE	0	HOUSE_SET_GAMER	HOUSE	0	f	\N	130	\N
548	3	Литературный турист	Местный турист — 2 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.640313+03	READING_GENRES	2	READING_GENRES	READING	2	f	\N	25	\N
93	1	Проводник в реальность · Современная проза	Искатель — 12 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849053+03	READING_GENRE_CONTEMPORARY	12	READING_GENRE_CONTEMPORARY	READING	5	f	\N	130	\N
94	1	Проводник в реальность · Современная проза	Эксперт — 16 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849054+03	READING_GENRE_CONTEMPORARY	16	READING_GENRE_CONTEMPORARY	READING	6	f	\N	190	\N
95	1	Проводник в реальность · Современная проза	Мастер — 20 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849056+03	READING_GENRE_CONTEMPORARY	20	READING_GENRE_CONTEMPORARY	READING	7	f	\N	270	\N
96	1	Проводник в реальность · Современная проза	Гроссмейстер — 25 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849058+03	READING_GENRE_CONTEMPORARY	25	READING_GENRE_CONTEMPORARY	READING	8	f	\N	370	\N
97	1	Проводник в реальность · Современная проза	Магистр — 30 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849059+03	READING_GENRE_CONTEMPORARY	30	READING_GENRE_CONTEMPORARY	READING	9	f	\N	500	\N
98	1	Проводник в реальность · Современная проза	Легенда — 35 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849061+03	READING_GENRE_CONTEMPORARY	35	READING_GENRE_CONTEMPORARY	READING	10	f	\N	660	\N
99	1	Проводник в реальность · Современная проза	Божество жанра — 40 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849063+03	READING_GENRE_CONTEMPORARY	40	READING_GENRE_CONTEMPORARY	READING	11	f	\N	860	\N
258	1	Король Пропорций	Математический Титан — 20000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.927328+03	NONE	20000	MATH_CAT_MULTDIV	MATH	11	f	\N	860	\N
374	1	Быстрее калькулятора	Решить 20 простых примеров на умножение/деление в уме меньше чем за 1 минуту.	⏱️	0.00	2026-11-07 21:38:42.927587+03	NONE	0	MATH_FAST	MATH	0	f	\N	130	\N
425	1	Незаменимый помощник	Легенда кооперации — 8200 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.971475+03	HOUSE_HELP_POINTS	8200	HOUSE_HELP_POINTS	HOUSE	10	f	\N	660	\N
450	1	Стильный эксперт	Новичок — 20 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.971592+03	NONE	20	HOUSE_CAT_LAUNDRY	HOUSE	2	f	\N	25	\N
522	1	Сам себе дизайнер	Полностью переставить мебель в комнате или переоформить рабочий стол для максимального удобства.	🔧	0.00	2026-11-07 21:38:42.971726+03	NONE	0	HOUSE_DESIGNER	HOUSE	0	f	\N	130	\N
580	3	Капитан звездолета · Научная фантастика / Sci-Fi	Ученик — 1 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.640488+03	READING_GENRE_SCIFI	1	READING_GENRE_SCIFI	READING	1	f	\N	10	\N
604	3	Хранитель тайн · Приключения	Подмастерье — 5 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.640528+03	READING_GENRE_ADVENTURE	5	READING_GENRE_ADVENTURE	READING	3	f	\N	50	\N
605	3	Хранитель тайн · Приключения	Специалист — 8 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.640529+03	READING_GENRE_ADVENTURE	8	READING_GENRE_ADVENTURE	READING	4	f	\N	85	\N
607	3	Хранитель тайн · Приключения	Эксперт — 16 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.640531+03	READING_GENRE_ADVENTURE	16	READING_GENRE_ADVENTURE	READING	6	f	\N	190	\N
1623	4	Первый флаг	Провести первый активный день в спорте или хобби.	🏅	0.00	2026-11-11 22:39:50.721849+03	NONE	0	SPORT_DAYS	READING	0	f	\N	130	\N
546	3	Книжный червь	Повелитель библиотек — 300 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.6403+03	READING_BOOKS	300	READING_BOOKS	READING	11	f	\N	860	\N
46	1	Мастер заклинаний · Фэнтези	Новичок — 3 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.848569+03	READING_GENRE_FANTASY	3	READING_GENRE_FANTASY	READING	2	f	\N	25	\N
923	3	Карточный марафонец	Сезон математика — 120 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740746+03	MATH_CARD_STREAK	120	MATH_CARD_STREAK	MATH	9	f	\N	500	\N
1012	3	Су-шеф	Гроссмейстер — 600 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.79584+03	NONE	600	HOUSE_CAT_COOKING	HOUSE	7	f	\N	270	\N
1196	4	Ловец рифм · Поэзия	Искатель — 12 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.632851+03	READING_GENRE_POETRY	12	READING_GENRE_POETRY	READING	5	f	\N	130	\N
1597	1	Верный Пёс Стаи	Прочесть цикл «Хроники стаи» Эрин Хантер о собаках:\n«Пустой Город»\n«Дорога Во Тьме»\n«Тьма Наступает»\n«Разбитая Тропа»	🐕	0.00	2026-11-11 22:32:38.885199+03	NONE	0	READING_QUEST_SURVIVORS	READING	0	f	\N	130	\N
63	1	Капитан звездолета · Научная фантастика / Sci-Fi	Гроссмейстер — 25 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848623+03	READING_GENRE_SCIFI	25	READING_GENRE_SCIFI	READING	8	f	\N	370	\N
100	1	Исследователь прошлого · Исторические романы	Ученик — 1 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.849072+03	READING_GENRE_HISTORY	1	READING_GENRE_HISTORY	READING	1	f	\N	10	\N
101	1	Исследователь прошлого · Исторические романы	Новичок — 3 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.849073+03	READING_GENRE_HISTORY	3	READING_GENRE_HISTORY	READING	2	f	\N	25	\N
102	1	Исследователь прошлого · Исторические романы	Подмастерье — 5 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.849075+03	READING_GENRE_HISTORY	5	READING_GENRE_HISTORY	READING	3	f	\N	50	\N
103	1	Исследователь прошлого · Исторические романы	Специалист — 8 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.849077+03	READING_GENRE_HISTORY	8	READING_GENRE_HISTORY	READING	4	f	\N	85	\N
104	1	Исследователь прошлого · Исторические романы	Искатель — 12 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.849078+03	READING_GENRE_HISTORY	12	READING_GENRE_HISTORY	READING	5	f	\N	130	\N
105	1	Исследователь прошлого · Исторические романы	Эксперт — 16 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.84908+03	READING_GENRE_HISTORY	16	READING_GENRE_HISTORY	READING	6	f	\N	190	\N
555	3	Литературный турист	Покоритель горизонтов — 9 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.64032+03	READING_GENRES	9	READING_GENRES	READING	9	f	\N	500	\N
87	1	Хранитель тайн · Приключения	Легенда — 35 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.848702+03	READING_GENRE_ADVENTURE	35	READING_GENRE_ADVENTURE	READING	10	f	\N	660	\N
106	1	Исследователь прошлого · Исторические романы	Мастер — 20 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.849082+03	READING_GENRE_HISTORY	20	READING_GENRE_HISTORY	READING	7	f	\N	270	\N
107	1	Исследователь прошлого · Исторические романы	Гроссмейстер — 25 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.849083+03	READING_GENRE_HISTORY	25	READING_GENRE_HISTORY	READING	8	f	\N	370	\N
108	1	Исследователь прошлого · Исторические романы	Магистр — 30 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.849085+03	READING_GENRE_HISTORY	30	READING_GENRE_HISTORY	READING	9	f	\N	500	\N
109	1	Исследователь прошлого · Исторические романы	Легенда — 35 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.849087+03	READING_GENRE_HISTORY	35	READING_GENRE_HISTORY	READING	10	f	\N	660	\N
110	1	Исследователь прошлого · Исторические романы	Божество жанра — 40 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-07 21:38:42.849088+03	READING_GENRE_HISTORY	40	READING_GENRE_HISTORY	READING	11	f	\N	860	\N
111	1	Шепот в темноте · Ужасы и мистика	Ученик — 1 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.849095+03	READING_GENRE_HORROR	1	READING_GENRE_HORROR	READING	1	f	\N	10	\N
112	1	Шепот в темноте · Ужасы и мистика	Новичок — 3 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.849097+03	READING_GENRE_HORROR	3	READING_GENRE_HORROR	READING	2	f	\N	25	\N
113	1	Шепот в темноте · Ужасы и мистика	Подмастерье — 5 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.849099+03	READING_GENRE_HORROR	5	READING_GENRE_HORROR	READING	3	f	\N	50	\N
114	1	Шепот в темноте · Ужасы и мистика	Специалист — 8 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.8491+03	READING_GENRE_HORROR	8	READING_GENRE_HORROR	READING	4	f	\N	85	\N
115	1	Шепот в темноте · Ужасы и мистика	Искатель — 12 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.849102+03	READING_GENRE_HORROR	12	READING_GENRE_HORROR	READING	5	f	\N	130	\N
116	1	Шепот в темноте · Ужасы и мистика	Эксперт — 16 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.849104+03	READING_GENRE_HORROR	16	READING_GENRE_HORROR	READING	6	f	\N	190	\N
1598	1	Царь Земли Смелых	Прочесть цикл «Земля Смелых» Эрин Хантер о африканских животных:\n«Разбитая Гордость»\n«Кровь и Кость»	🦁	0.00	2026-11-11 22:32:38.885199+03	NONE	0	READING_QUEST_BRAVELANDS	READING	0	f	\N	130	\N
1599	1	Хранитель Бамбука	Прочесть цикл «Бамбуковое королевство» Эрин Хантер о пандах:\n«Потоп»\n«Река Пепла»	🐼	0.00	2026-11-11 22:32:38.8852+03	NONE	0	READING_QUEST_BAMBOO	READING	0	f	\N	130	\N
64	1	Капитан звездолета · Научная фантастика / Sci-Fi	Магистр — 30 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848625+03	READING_GENRE_SCIFI	30	READING_GENRE_SCIFI	READING	9	f	\N	500	\N
117	1	Шепот в темноте · Ужасы и мистика	Мастер — 20 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.849106+03	READING_GENRE_HORROR	20	READING_GENRE_HORROR	READING	7	f	\N	270	\N
118	1	Шепот в темноте · Ужасы и мистика	Гроссмейстер — 25 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.849107+03	READING_GENRE_HORROR	25	READING_GENRE_HORROR	READING	8	f	\N	370	\N
119	1	Шепот в темноте · Ужасы и мистика	Магистр — 30 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.849109+03	READING_GENRE_HORROR	30	READING_GENRE_HORROR	READING	9	f	\N	500	\N
672	3	Ловец рифм · Поэзия	Искатель — 12 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.640737+03	READING_GENRE_POETRY	12	READING_GENRE_POETRY	READING	5	f	\N	130	\N
120	1	Шепот в темноте · Ужасы и мистика	Легенда — 35 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.849111+03	READING_GENRE_HORROR	35	READING_GENRE_HORROR	READING	10	f	\N	660	\N
121	1	Шепот в темноте · Ужасы и мистика	Божество жанра — 40 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-07 21:38:42.849112+03	READING_GENRE_HORROR	40	READING_GENRE_HORROR	READING	11	f	\N	860	\N
521	1	Мини-минимализм	Провести глобальное расхламление: выбросить или отдать 30 ненужных вещей из своей комнаты.	🎒	0.00	2026-11-07 21:38:42.971721+03	NONE	0	HOUSE_MINIMALISM	HOUSE	0	f	\N	130	\N
122	1	Ученый совет · Научпоп и энциклопедии	Ученик — 1 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.84913+03	READING_GENRE_SCIENCE	1	READING_GENRE_SCIENCE	READING	1	f	\N	10	\N
123	1	Ученый совет · Научпоп и энциклопедии	Новичок — 3 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.849132+03	READING_GENRE_SCIENCE	3	READING_GENRE_SCIENCE	READING	2	f	\N	25	\N
39	1	Покоритель циклов	Коллекционер саг — 10 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.84784+03	READING_SERIES	10	READING_SERIES	READING	6	f	\N	190	\N
124	1	Ученый совет · Научпоп и энциклопедии	Подмастерье — 5 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.849134+03	READING_GENRE_SCIENCE	5	READING_GENRE_SCIENCE	READING	3	f	\N	50	\N
125	1	Ученый совет · Научпоп и энциклопедии	Специалист — 8 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.849136+03	READING_GENRE_SCIENCE	8	READING_GENRE_SCIENCE	READING	4	f	\N	85	\N
126	1	Ученый совет · Научпоп и энциклопедии	Искатель — 12 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.849137+03	READING_GENRE_SCIENCE	12	READING_GENRE_SCIENCE	READING	5	f	\N	130	\N
127	1	Ученый совет · Научпоп и энциклопедии	Эксперт — 16 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.849141+03	READING_GENRE_SCIENCE	16	READING_GENRE_SCIENCE	READING	6	f	\N	190	\N
128	1	Ученый совет · Научпоп и энциклопедии	Мастер — 20 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.849168+03	READING_GENRE_SCIENCE	20	READING_GENRE_SCIENCE	READING	7	f	\N	270	\N
129	1	Ученый совет · Научпоп и энциклопедии	Гроссмейстер — 25 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.849171+03	READING_GENRE_SCIENCE	25	READING_GENRE_SCIENCE	READING	8	f	\N	370	\N
131	1	Ученый совет · Научпоп и энциклопедии	Легенда — 35 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.849174+03	READING_GENRE_SCIENCE	35	READING_GENRE_SCIENCE	READING	10	f	\N	660	\N
132	1	Ученый совет · Научпоп и энциклопедии	Божество жанра — 40 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.849176+03	READING_GENRE_SCIENCE	40	READING_GENRE_SCIENCE	READING	11	f	\N	860	\N
133	1	Мудрая сова · Сказки, мифы, легенды	Ученик — 1 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.8492+03	READING_GENRE_FAIRYTALE	1	READING_GENRE_FAIRYTALE	READING	1	f	\N	10	\N
134	1	Мудрая сова · Сказки, мифы, легенды	Новичок — 3 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.849201+03	READING_GENRE_FAIRYTALE	3	READING_GENRE_FAIRYTALE	READING	2	f	\N	25	\N
135	1	Мудрая сова · Сказки, мифы, легенды	Подмастерье — 5 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.849203+03	READING_GENRE_FAIRYTALE	5	READING_GENRE_FAIRYTALE	READING	3	f	\N	50	\N
136	1	Мудрая сова · Сказки, мифы, легенды	Специалист — 8 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.849205+03	READING_GENRE_FAIRYTALE	8	READING_GENRE_FAIRYTALE	READING	4	f	\N	85	\N
137	1	Мудрая сова · Сказки, мифы, легенды	Искатель — 12 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.849206+03	READING_GENRE_FAIRYTALE	12	READING_GENRE_FAIRYTALE	READING	5	f	\N	130	\N
138	1	Мудрая сова · Сказки, мифы, легенды	Эксперт — 16 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.849208+03	READING_GENRE_FAIRYTALE	16	READING_GENRE_FAIRYTALE	READING	6	f	\N	190	\N
139	1	Мудрая сова · Сказки, мифы, легенды	Мастер — 20 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.84921+03	READING_GENRE_FAIRYTALE	20	READING_GENRE_FAIRYTALE	READING	7	f	\N	270	\N
140	1	Мудрая сова · Сказки, мифы, легенды	Гроссмейстер — 25 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.849212+03	READING_GENRE_FAIRYTALE	25	READING_GENRE_FAIRYTALE	READING	8	f	\N	370	\N
141	1	Мудрая сова · Сказки, мифы, легенды	Магистр — 30 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.849213+03	READING_GENRE_FAIRYTALE	30	READING_GENRE_FAIRYTALE	READING	9	f	\N	500	\N
142	1	Мудрая сова · Сказки, мифы, легенды	Легенда — 35 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.849215+03	READING_GENRE_FAIRYTALE	35	READING_GENRE_FAIRYTALE	READING	10	f	\N	660	\N
143	1	Мудрая сова · Сказки, мифы, легенды	Божество жанра — 40 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-07 21:38:42.849217+03	READING_GENRE_FAIRYTALE	40	READING_GENRE_FAIRYTALE	READING	11	f	\N	860	\N
144	1	Ловец рифм · Поэзия	Ученик — 1 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.849223+03	READING_GENRE_POETRY	1	READING_GENRE_POETRY	READING	1	f	\N	10	\N
145	1	Ловец рифм · Поэзия	Новичок — 3 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.849225+03	READING_GENRE_POETRY	3	READING_GENRE_POETRY	READING	2	f	\N	25	\N
147	1	Ловец рифм · Поэзия	Специалист — 8 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.849228+03	READING_GENRE_POETRY	8	READING_GENRE_POETRY	READING	4	f	\N	85	\N
148	1	Ловец рифм · Поэзия	Искатель — 12 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.84923+03	READING_GENRE_POETRY	12	READING_GENRE_POETRY	READING	5	f	\N	130	\N
149	1	Ловец рифм · Поэзия	Эксперт — 16 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.849232+03	READING_GENRE_POETRY	16	READING_GENRE_POETRY	READING	6	f	\N	190	\N
150	1	Ловец рифм · Поэзия	Мастер — 20 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.849233+03	READING_GENRE_POETRY	20	READING_GENRE_POETRY	READING	7	f	\N	270	\N
151	1	Ловец рифм · Поэзия	Гроссмейстер — 25 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.849235+03	READING_GENRE_POETRY	25	READING_GENRE_POETRY	READING	8	f	\N	370	\N
152	1	Ловец рифм · Поэзия	Магистр — 30 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.849236+03	READING_GENRE_POETRY	30	READING_GENRE_POETRY	READING	9	f	\N	500	\N
153	1	Ловец рифм · Поэзия	Легенда — 35 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.849238+03	READING_GENRE_POETRY	35	READING_GENRE_POETRY	READING	10	f	\N	660	\N
154	1	Ловец рифм · Поэзия	Божество жанра — 40 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.84924+03	READING_GENRE_POETRY	40	READING_GENRE_POETRY	READING	11	f	\N	860	\N
155	1	Живые картинки · Комиксы и манга	Ученик — 1 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.84925+03	READING_GENRE_COMICS	1	READING_GENRE_COMICS	READING	1	f	\N	10	\N
156	1	Живые картинки · Комиксы и манга	Новичок — 3 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.849251+03	READING_GENRE_COMICS	3	READING_GENRE_COMICS	READING	2	f	\N	25	\N
157	1	Живые картинки · Комиксы и манга	Подмастерье — 5 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.849253+03	READING_GENRE_COMICS	5	READING_GENRE_COMICS	READING	3	f	\N	50	\N
158	1	Живые картинки · Комиксы и манга	Специалист — 8 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.849255+03	READING_GENRE_COMICS	8	READING_GENRE_COMICS	READING	4	f	\N	85	\N
159	1	Живые картинки · Комиксы и манга	Искатель — 12 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.849258+03	READING_GENRE_COMICS	12	READING_GENRE_COMICS	READING	5	f	\N	130	\N
160	1	Живые картинки · Комиксы и манга	Эксперт — 16 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.84926+03	READING_GENRE_COMICS	16	READING_GENRE_COMICS	READING	6	f	\N	190	\N
161	1	Живые картинки · Комиксы и манга	Мастер — 20 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.849261+03	READING_GENRE_COMICS	20	READING_GENRE_COMICS	READING	7	f	\N	270	\N
162	1	Живые картинки · Комиксы и манга	Гроссмейстер — 25 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.849263+03	READING_GENRE_COMICS	25	READING_GENRE_COMICS	READING	8	f	\N	370	\N
163	1	Живые картинки · Комиксы и манга	Магистр — 30 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.849265+03	READING_GENRE_COMICS	30	READING_GENRE_COMICS	READING	9	f	\N	500	\N
164	1	Живые картинки · Комиксы и манга	Легенда — 35 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.849266+03	READING_GENRE_COMICS	35	READING_GENRE_COMICS	READING	10	f	\N	660	\N
165	1	Живые картинки · Комиксы и манга	Божество жанра — 40 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-07 21:38:42.849268+03	READING_GENRE_COMICS	40	READING_GENRE_COMICS	READING	11	f	\N	860	\N
167	1	Смех сквозь строки · Юмор	Новичок — 3 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.849282+03	READING_GENRE_HUMOR	3	READING_GENRE_HUMOR	READING	2	f	\N	25	\N
168	1	Смех сквозь строки · Юмор	Подмастерье — 5 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.849284+03	READING_GENRE_HUMOR	5	READING_GENRE_HUMOR	READING	3	f	\N	50	\N
169	1	Смех сквозь строки · Юмор	Специалист — 8 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.849286+03	READING_GENRE_HUMOR	8	READING_GENRE_HUMOR	READING	4	f	\N	85	\N
170	1	Смех сквозь строки · Юмор	Искатель — 12 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.849287+03	READING_GENRE_HUMOR	12	READING_GENRE_HUMOR	READING	5	f	\N	130	\N
171	1	Смех сквозь строки · Юмор	Эксперт — 16 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.849289+03	READING_GENRE_HUMOR	16	READING_GENRE_HUMOR	READING	6	f	\N	190	\N
172	1	Смех сквозь строки · Юмор	Мастер — 20 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.849291+03	READING_GENRE_HUMOR	20	READING_GENRE_HUMOR	READING	7	f	\N	270	\N
173	1	Смех сквозь строки · Юмор	Гроссмейстер — 25 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.849292+03	READING_GENRE_HUMOR	25	READING_GENRE_HUMOR	READING	8	f	\N	370	\N
174	1	Смех сквозь строки · Юмор	Магистр — 30 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.849294+03	READING_GENRE_HUMOR	30	READING_GENRE_HUMOR	READING	9	f	\N	500	\N
175	1	Смех сквозь строки · Юмор	Легенда — 35 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.849296+03	READING_GENRE_HUMOR	35	READING_GENRE_HUMOR	READING	10	f	\N	660	\N
218	1	Испытатель тестов	Критик ошибок — 50 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.927163+03	MATH_CARDS	50	MATH_TESTS	MATH	4	f	\N	85	\N
176	1	Смех сквозь строки · Юмор	Божество жанра — 40 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-07 21:38:42.849297+03	READING_GENRE_HUMOR	40	READING_GENRE_HUMOR	READING	11	f	\N	860	\N
177	1	Мальчик, который выжил	Прочесть серию о Гарри Поттере:\n«Гарри Поттер и философский камень»\n«Гарри Поттер и Тайная комната»\n«Гарри Поттер и узник Азкабана»\n«Гарри Поттер и Кубок огня»\n«Гарри Поттер и Орден Феникса»\n«Гарри Поттер и Принц-полукровка»\n«Гарри Поттер и Дары Смерти»\n«Гарри Поттер и Проклятое дитя»	⚡	0.00	2026-11-07 21:38:42.849312+03	NONE	0	READING_QUEST_HP	READING	0	f	\N	130	\N
178	1	Хранитель Кольца	Прочесть «Властелин колец»:\n«Братство Кольца»\n«Две крепости»\n«Возвращение короля»	💍	0.00	2026-11-07 21:38:42.849324+03	NONE	0	READING_QUEST_LOTR	READING	0	f	\N	130	\N
179	1	Через шкаф в Нарнию	Прочесть «Хроники Нарнии»:\n«Племянник чародея»\n«Лев, Колдунья и Платяной шкаф»\n«Конь и его мальчик»\n«Принц Каспиан»\n«Покоритель зари»\n«Серебряное кресло»\n«Последняя битва»	🦁	0.00	2026-11-07 21:38:42.849724+03	NONE	0	READING_QUEST_NARNIA	READING	0	f	\N	130	\N
180	1	Житель Изумрудного города	Прочесть цикл А. Волкова:\n«Волшебник Изумрудного города»\n«Урфин Джюс и его деревянные солдаты»\n«Семь подземных королей»\n«Огненный бог Марранов»\n«Желтый туман»\n«Тайна заброшенного замка»	💚	0.00	2026-11-07 21:38:42.849731+03	NONE	0	READING_QUEST_EMERALD	READING	0	f	\N	130	\N
181	1	Перси Джексон и олимпийцы	Прочесть серию Р. Риордана:\n«Похититель молний»\n«Море чудовищ»\n«Проклятие титана»\n«Лабиринт смерти»\n«Последнее пророчество»	🔱	0.00	2026-11-07 21:38:42.849739+03	NONE	0	READING_QUEST_PERCY	READING	0	f	\N	130	\N
182	1	Абсолютный Всевед	Прочитать хотя бы по одной книге из всех 12 жанров: Фэнтези, Научная фантастика, Детектив, Приключения, Современная проза, Исторические романы, Ужасы, Научпоп, Сказки, Поэзия, Комиксы, Юмор.	🌟	0.00	2026-11-07 21:38:42.84975+03	READING_GENRES	12	READING_OMNIVORE	READING	0	f	\N	130	\N
183	1	Книжный Кит	Прочитать одну тяжёлую книгу объёмом более 600 страниц.	🐋	0.00	2026-11-07 21:38:42.849758+03	READING_HEAVY_BOOKS	1	READING_WHALE	READING	0	f	\N	130	\N
184	1	Неудержимый	Читать каждый день без пропусков в течение 30 дней.	🔥	0.00	2026-11-07 21:38:42.849763+03	READING_STREAK	30	READING_STREAK	READING	0	f	\N	130	\N
185	1	Быстрее ветра	Прочитать полноценную книгу (от 200 страниц) быстрее, чем за 3 дня.	⚡	0.00	2026-11-07 21:38:42.849766+03	NONE	0	READING_FAST	READING	0	f	\N	130	\N
186	1	Литературный критик	Рассказать родителям содержательные отзывы на 10 разных книг.	🗣️	0.00	2026-11-07 21:38:42.849775+03	NONE	0	READING_CRITIC	READING	0	f	\N	130	\N
187	1	Книжный первооткрыватель	Прочитать книгу совершенно нового автора, о котором раньше никогда не слышал.	🧭	0.00	2026-11-07 21:38:42.849786+03	NONE	0	READING_PIONEER	READING	0	f	\N	130	\N
188	1	Второе дыхание	Перечитать свою самую любимую книгу от начала до конца ещё раз.	🔄	0.00	2026-11-07 21:38:42.849794+03	NONE	0	READING_REREAD	READING	0	f	\N	130	\N
189	1	Судья экранизаций	Прочитать книгу, посмотреть по ней фильм/мультфильм и честно сравнить их.	🎬	0.00	2026-11-07 21:38:42.849801+03	NONE	0	READING_MOVIE	READING	0	f	\N	130	\N
190	1	Ночной дозор	Тайком или с разрешения прочитать целую главу под одеялом с фонариком.	🔦	0.00	2026-11-07 21:38:42.849809+03	NONE	0	READING_NIGHT	READING	0	f	\N	130	\N
191	1	Чтение без границ	Прочитать книгу полностью вне дома (в парке, в путешествии, в поезде).	🎒	0.00	2026-11-07 21:38:42.849814+03	NONE	0	READING_OUTSIDE	READING	0	f	\N	130	\N
192	1	Книжный стилист	Навести идеальный порядок на своей книжной полке и расставить книги по цветам, авторам или размеру.	📚	0.00	2026-11-07 21:38:42.849819+03	NONE	0	READING_SHELF	READING	0	f	\N	130	\N
193	1	Вычислительная машина	Цифровой первоклашка — 100 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.927092+03	MATH_TASKS	100	MATH_EXAMPLES	MATH	1	f	\N	10	\N
194	1	Вычислительная машина	Калькулятор на батарейках — 500 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.927094+03	MATH_TASKS	500	MATH_EXAMPLES	MATH	2	f	\N	25	\N
195	1	Вычислительная машина	Счетные счеты — 1500 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.927096+03	MATH_TASKS	1500	MATH_EXAMPLES	MATH	3	f	\N	50	\N
65	1	Капитан звездолета · Научная фантастика / Sci-Fi	Легенда — 35 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848627+03	READING_GENRE_SCIFI	35	READING_GENRE_SCIFI	READING	10	f	\N	660	\N
91	1	Проводник в реальность · Современная проза	Подмастерье — 5 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849048+03	READING_GENRE_CONTEMPORARY	5	READING_GENRE_CONTEMPORARY	READING	3	f	\N	50	\N
196	1	Вычислительная машина	Властелин плюсов и минусов — 3000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.927097+03	MATH_TASKS	3000	MATH_EXAMPLES	MATH	4	f	\N	85	\N
197	1	Вычислительная машина	Умножающий разум — 5000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.927097+03	MATH_TASKS	5000	MATH_EXAMPLES	MATH	5	f	\N	130	\N
198	1	Вычислительная машина	Процессор Core i3 — 10000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.927098+03	MATH_TASKS	10000	MATH_EXAMPLES	MATH	6	f	\N	190	\N
199	1	Вычислительная машина	Мастер алгоритмов — 20000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.927099+03	MATH_TASKS	20000	MATH_EXAMPLES	MATH	7	f	\N	270	\N
200	1	Вычислительная машина	Цифровой гроссмейстер — 35000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.9271+03	MATH_TASKS	35000	MATH_EXAMPLES	MATH	8	f	\N	370	\N
201	1	Вычислительная машина	Квантовый компьютер — 50000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.927101+03	MATH_TASKS	50000	MATH_EXAMPLES	MATH	9	f	\N	500	\N
202	1	Вычислительная машина	Укротитель бесконечности — 65000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.927102+03	MATH_TASKS	65000	MATH_EXAMPLES	MATH	10	f	\N	660	\N
203	1	Вычислительная машина	Абсолютный Вычислитель — 80000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-07 21:38:42.927103+03	MATH_TASKS	80000	MATH_EXAMPLES	MATH	11	f	\N	860	\N
205	1	Главный архитектор	Распутыватель клубков — 15 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.927129+03	NONE	15	MATH_WORD	MATH	2	f	\N	25	\N
206	1	Главный архитектор	Логический детектив — 40 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.92713+03	NONE	40	MATH_WORD	MATH	3	f	\N	50	\N
207	1	Главный архитектор	Инженер смыслов — 80 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.927131+03	NONE	80	MATH_WORD	MATH	4	f	\N	85	\N
208	1	Главный архитектор	Мастер чертежей — 150 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.927131+03	NONE	150	MATH_WORD	MATH	5	f	\N	130	\N
209	1	Главный архитектор	Взломщик теорем — 250 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.927132+03	NONE	250	MATH_WORD	MATH	6	f	\N	190	\N
210	1	Главный архитектор	Конструктор решений — 400 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.927133+03	NONE	400	MATH_WORD	MATH	7	f	\N	270	\N
211	1	Главный архитектор	Проектировщик матриц — 600 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.927134+03	NONE	600	MATH_WORD	MATH	8	f	\N	370	\N
212	1	Главный архитектор	Профессор логики — 850 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.927136+03	NONE	850	MATH_WORD	MATH	9	f	\N	500	\N
608	3	Хранитель тайн · Приключения	Мастер — 20 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.640532+03	READING_GENRE_ADVENTURE	20	READING_GENRE_ADVENTURE	READING	7	f	\N	270	\N
213	1	Главный архитектор	Архитектор гипотез — 1100 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.927137+03	NONE	1100	MATH_WORD	MATH	10	f	\N	660	\N
215	1	Испытатель тестов	Тестовый дебютант — 5 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.92716+03	MATH_CARDS	5	MATH_TESTS	MATH	1	f	\N	10	\N
216	1	Испытатель тестов	Уверенный отличник — 15 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.927161+03	MATH_CARDS	15	MATH_TESTS	MATH	2	f	\N	25	\N
217	1	Испытатель тестов	Охотник за пятерками — 30 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.927162+03	MATH_CARDS	30	MATH_TESTS	MATH	3	f	\N	50	\N
219	1	Испытатель тестов	Гроза контрольных — 80 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.927164+03	MATH_CARDS	80	MATH_TESTS	MATH	5	f	\N	130	\N
220	1	Испытатель тестов	Тестовый эксперт — 120 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.927165+03	MATH_CARDS	120	MATH_TESTS	MATH	6	f	\N	190	\N
237	1	Арифметика в уме	Стажер — 10 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.927249+03	NONE	10	MATH_CAT_ARITHMETIC	MATH	1	f	\N	10	\N
221	1	Испытатель тестов	Несокрушимый разум — 170 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.927165+03	MATH_CARDS	170	MATH_TESTS	MATH	7	f	\N	270	\N
223	1	Испытатель тестов	Железный отличник — 300 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.927167+03	MATH_CARDS	300	MATH_TESTS	MATH	9	f	\N	500	\N
224	1	Испытатель тестов	Провидец ответов — 380 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.927168+03	MATH_CARDS	380	MATH_TESTS	MATH	10	f	\N	660	\N
225	1	Испытатель тестов	Абсолютный Цензор — 450 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.927169+03	MATH_CARDS	450	MATH_TESTS	MATH	11	f	\N	860	\N
227	1	Укротитель Иксов	Новичок — 50 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.927237+03	NONE	50	MATH_CAT_EQUATIONS	MATH	2	f	\N	25	\N
228	1	Укротитель Иксов	Практик — 150 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.927238+03	NONE	150	MATH_CAT_EQUATIONS	MATH	3	f	\N	50	\N
229	1	Укротитель Иксов	Специалист — 400 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.927239+03	NONE	400	MATH_CAT_EQUATIONS	MATH	4	f	\N	85	\N
230	1	Укротитель Иксов	Аналитик — 1000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.92724+03	NONE	1000	MATH_CAT_EQUATIONS	MATH	5	f	\N	130	\N
231	1	Укротитель Иксов	Эксперт — 2500 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.927241+03	NONE	2500	MATH_CAT_EQUATIONS	MATH	6	f	\N	190	\N
232	1	Укротитель Иксов	Мастер — 5000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.927242+03	NONE	5000	MATH_CAT_EQUATIONS	MATH	7	f	\N	270	\N
233	1	Укротитель Иксов	Гроссмейстер — 8000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.927243+03	NONE	8000	MATH_CAT_EQUATIONS	MATH	8	f	\N	370	\N
234	1	Укротитель Иксов	Магистр — 12000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.927244+03	NONE	12000	MATH_CAT_EQUATIONS	MATH	9	f	\N	500	\N
235	1	Укротитель Иксов	Легенда — 16000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.927244+03	NONE	16000	MATH_CAT_EQUATIONS	MATH	10	f	\N	660	\N
556	3	Литературный турист	Кругосветный путешественник — 10 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.640323+03	READING_GENRES	10	READING_GENRES	READING	10	f	\N	660	\N
236	1	Укротитель Иксов	Математический Титан — 20000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.927245+03	NONE	20000	MATH_CAT_EQUATIONS	MATH	11	f	\N	860	\N
238	1	Арифметика в уме	Новичок — 50 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.927305+03	NONE	50	MATH_CAT_ARITHMETIC	MATH	2	f	\N	25	\N
239	1	Арифметика в уме	Практик — 150 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.927306+03	NONE	150	MATH_CAT_ARITHMETIC	MATH	3	f	\N	50	\N
240	1	Арифметика в уме	Специалист — 400 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.927307+03	NONE	400	MATH_CAT_ARITHMETIC	MATH	4	f	\N	85	\N
241	1	Арифметика в уме	Аналитик — 1000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.927308+03	NONE	1000	MATH_CAT_ARITHMETIC	MATH	5	f	\N	130	\N
242	1	Арифметика в уме	Эксперт — 2500 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.927309+03	NONE	2500	MATH_CAT_ARITHMETIC	MATH	6	f	\N	190	\N
243	1	Арифметика в уме	Мастер — 5000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.92731+03	NONE	5000	MATH_CAT_ARITHMETIC	MATH	7	f	\N	270	\N
244	1	Арифметика в уме	Гроссмейстер — 8000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.927311+03	NONE	8000	MATH_CAT_ARITHMETIC	MATH	8	f	\N	370	\N
245	1	Арифметика в уме	Магистр — 12000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.927312+03	NONE	12000	MATH_CAT_ARITHMETIC	MATH	9	f	\N	500	\N
246	1	Арифметика в уме	Легенда — 16000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.927313+03	NONE	16000	MATH_CAT_ARITHMETIC	MATH	10	f	\N	660	\N
247	1	Арифметика в уме	Математический Титан — 20000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-07 21:38:42.927314+03	NONE	20000	MATH_CAT_ARITHMETIC	MATH	11	f	\N	860	\N
248	1	Король Пропорций	Стажер — 10 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.927318+03	NONE	10	MATH_CAT_MULTDIV	MATH	1	f	\N	10	\N
249	1	Король Пропорций	Новичок — 50 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.927319+03	NONE	50	MATH_CAT_MULTDIV	MATH	2	f	\N	25	\N
251	1	Король Пропорций	Специалист — 400 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.927321+03	NONE	400	MATH_CAT_MULTDIV	MATH	4	f	\N	85	\N
252	1	Король Пропорций	Аналитик — 1000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.927322+03	NONE	1000	MATH_CAT_MULTDIV	MATH	5	f	\N	130	\N
253	1	Король Пропорций	Эксперт — 2500 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.927323+03	NONE	2500	MATH_CAT_MULTDIV	MATH	6	f	\N	190	\N
254	1	Король Пропорций	Мастер — 5000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.927323+03	NONE	5000	MATH_CAT_MULTDIV	MATH	7	f	\N	270	\N
255	1	Король Пропорций	Гроссмейстер — 8000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.927325+03	NONE	8000	MATH_CAT_MULTDIV	MATH	8	f	\N	370	\N
256	1	Король Пропорций	Магистр — 12000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.927326+03	NONE	12000	MATH_CAT_MULTDIV	MATH	9	f	\N	500	\N
40	1	Покоритель циклов	Знаток сиквелов — 12 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.847842+03	READING_SERIES	12	READING_SERIES	READING	7	f	\N	270	\N
257	1	Король Пропорций	Легенда — 16000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.927327+03	NONE	16000	MATH_CAT_MULTDIV	MATH	10	f	\N	660	\N
260	1	Сила в Кубе	Новичок — 50 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.927335+03	NONE	50	MATH_CAT_POWER	MATH	2	f	\N	25	\N
261	1	Сила в Кубе	Практик — 150 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.927335+03	NONE	150	MATH_CAT_POWER	MATH	3	f	\N	50	\N
262	1	Сила в Кубе	Специалист — 400 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.927336+03	NONE	400	MATH_CAT_POWER	MATH	4	f	\N	85	\N
263	1	Сила в Кубе	Аналитик — 1000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.927337+03	NONE	1000	MATH_CAT_POWER	MATH	5	f	\N	130	\N
264	1	Сила в Кубе	Эксперт — 2500 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.927338+03	NONE	2500	MATH_CAT_POWER	MATH	6	f	\N	190	\N
265	1	Сила в Кубе	Мастер — 5000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.927339+03	NONE	5000	MATH_CAT_POWER	MATH	7	f	\N	270	\N
266	1	Сила в Кубе	Гроссмейстер — 8000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.92734+03	NONE	8000	MATH_CAT_POWER	MATH	8	f	\N	370	\N
675	3	Ловец рифм · Поэзия	Гроссмейстер — 25 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.64074+03	READING_GENRE_POETRY	25	READING_GENRE_POETRY	READING	8	f	\N	370	\N
267	1	Сила в Кубе	Магистр — 12000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.927341+03	NONE	12000	MATH_CAT_POWER	MATH	9	f	\N	500	\N
268	1	Сила в Кубе	Легенда — 16000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.927342+03	NONE	16000	MATH_CAT_POWER	MATH	10	f	\N	660	\N
269	1	Сила в Кубе	Математический Титан — 20000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.927343+03	NONE	20000	MATH_CAT_POWER	MATH	11	f	\N	860	\N
270	1	Извлекатель Корней	Стажер — 10 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.927348+03	NONE	10	MATH_CAT_ROOT	MATH	1	f	\N	10	\N
271	1	Извлекатель Корней	Новичок — 50 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.927349+03	NONE	50	MATH_CAT_ROOT	MATH	2	f	\N	25	\N
272	1	Извлекатель Корней	Практик — 150 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.92735+03	NONE	150	MATH_CAT_ROOT	MATH	3	f	\N	50	\N
273	1	Извлекатель Корней	Специалист — 400 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.927351+03	NONE	400	MATH_CAT_ROOT	MATH	4	f	\N	85	\N
274	1	Извлекатель Корней	Аналитик — 1000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.927352+03	NONE	1000	MATH_CAT_ROOT	MATH	5	f	\N	130	\N
275	1	Извлекатель Корней	Эксперт — 2500 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.927353+03	NONE	2500	MATH_CAT_ROOT	MATH	6	f	\N	190	\N
276	1	Извлекатель Корней	Мастер — 5000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.927354+03	NONE	5000	MATH_CAT_ROOT	MATH	7	f	\N	270	\N
277	1	Извлекатель Корней	Гроссмейстер — 8000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.927355+03	NONE	8000	MATH_CAT_ROOT	MATH	8	f	\N	370	\N
278	1	Извлекатель Корней	Магистр — 12000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.927356+03	NONE	12000	MATH_CAT_ROOT	MATH	9	f	\N	500	\N
557	3	Литературный турист	Космополит всея литературы — 12 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.640324+03	READING_GENRES	12	READING_GENRES	READING	11	f	\N	860	\N
279	1	Извлекатель Корней	Легенда — 16000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.927357+03	NONE	16000	MATH_CAT_ROOT	MATH	10	f	\N	660	\N
280	1	Извлекатель Корней	Математический Титан — 20000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-07 21:38:42.927358+03	NONE	20000	MATH_CAT_ROOT	MATH	11	f	\N	860	\N
281	1	Повелитель Долей	Стажер — 10 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.927366+03	NONE	10	MATH_CAT_FRACTIONS	MATH	1	f	\N	10	\N
282	1	Повелитель Долей	Новичок — 50 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.927367+03	NONE	50	MATH_CAT_FRACTIONS	MATH	2	f	\N	25	\N
283	1	Повелитель Долей	Практик — 150 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.927368+03	NONE	150	MATH_CAT_FRACTIONS	MATH	3	f	\N	50	\N
284	1	Повелитель Долей	Специалист — 400 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.927369+03	NONE	400	MATH_CAT_FRACTIONS	MATH	4	f	\N	85	\N
285	1	Повелитель Долей	Аналитик — 1000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.927369+03	NONE	1000	MATH_CAT_FRACTIONS	MATH	5	f	\N	130	\N
286	1	Повелитель Долей	Эксперт — 2500 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.92737+03	NONE	2500	MATH_CAT_FRACTIONS	MATH	6	f	\N	190	\N
66	1	Капитан звездолета · Научная фантастика / Sci-Fi	Божество жанра — 40 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848629+03	READING_GENRE_SCIFI	40	READING_GENRE_SCIFI	READING	11	f	\N	860	\N
287	1	Повелитель Долей	Мастер — 5000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.927371+03	NONE	5000	MATH_CAT_FRACTIONS	MATH	7	f	\N	270	\N
288	1	Повелитель Долей	Гроссмейстер — 8000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.927372+03	NONE	8000	MATH_CAT_FRACTIONS	MATH	8	f	\N	370	\N
289	1	Повелитель Долей	Магистр — 12000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.927373+03	NONE	12000	MATH_CAT_FRACTIONS	MATH	9	f	\N	500	\N
290	1	Повелитель Долей	Легенда — 16000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.927374+03	NONE	16000	MATH_CAT_FRACTIONS	MATH	10	f	\N	660	\N
291	1	Повелитель Долей	Математический Титан — 20000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-07 21:38:42.927375+03	NONE	20000	MATH_CAT_FRACTIONS	MATH	11	f	\N	860	\N
292	1	Геометрический Гений	Стажер — 10 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.927385+03	NONE	10	MATH_CAT_GEOMETRY	MATH	1	f	\N	10	\N
293	1	Геометрический Гений	Новичок — 50 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.927386+03	NONE	50	MATH_CAT_GEOMETRY	MATH	2	f	\N	25	\N
294	1	Геометрический Гений	Практик — 150 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.927387+03	NONE	150	MATH_CAT_GEOMETRY	MATH	3	f	\N	50	\N
295	1	Геометрический Гений	Специалист — 400 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.927388+03	NONE	400	MATH_CAT_GEOMETRY	MATH	4	f	\N	85	\N
296	1	Геометрический Гений	Аналитик — 1000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.927389+03	NONE	1000	MATH_CAT_GEOMETRY	MATH	5	f	\N	130	\N
41	1	Покоритель циклов	Мастер многотомников — 15 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.847844+03	READING_SERIES	15	READING_SERIES	READING	8	f	\N	370	\N
297	1	Геометрический Гений	Эксперт — 2500 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.927389+03	NONE	2500	MATH_CAT_GEOMETRY	MATH	6	f	\N	190	\N
298	1	Геометрический Гений	Мастер — 5000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.92739+03	NONE	5000	MATH_CAT_GEOMETRY	MATH	7	f	\N	270	\N
299	1	Геометрический Гений	Гроссмейстер — 8000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.927391+03	NONE	8000	MATH_CAT_GEOMETRY	MATH	8	f	\N	370	\N
300	1	Геометрический Гений	Магистр — 12000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.927392+03	NONE	12000	MATH_CAT_GEOMETRY	MATH	9	f	\N	500	\N
301	1	Геометрический Гений	Легенда — 16000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.927393+03	NONE	16000	MATH_CAT_GEOMETRY	MATH	10	f	\N	660	\N
430	1	Шеф-мойщик	Мастер — 120 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.971554+03	NONE	120	HOUSE_CAT_DISHES	HOUSE	4	f	\N	85	\N
302	1	Геометрический Гений	Математический Титан — 20000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-07 21:38:42.927394+03	NONE	20000	MATH_CAT_GEOMETRY	MATH	11	f	\N	860	\N
303	1	Легкая прогулка	Стажер — 1 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.927458+03	MATH_CARD_DONE_EASY	1	MATH_CAT_CARD_EASY	MATH	1	f	\N	10	\N
304	1	Легкая прогулка	Новичок — 3 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.927459+03	MATH_CARD_DONE_EASY	3	MATH_CAT_CARD_EASY	MATH	2	f	\N	25	\N
305	1	Легкая прогулка	Практик — 6 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.92746+03	MATH_CARD_DONE_EASY	6	MATH_CAT_CARD_EASY	MATH	3	f	\N	50	\N
306	1	Легкая прогулка	Специалист — 10 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.927461+03	MATH_CARD_DONE_EASY	10	MATH_CAT_CARD_EASY	MATH	4	f	\N	85	\N
307	1	Легкая прогулка	Аналитик — 15 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.927462+03	MATH_CARD_DONE_EASY	15	MATH_CAT_CARD_EASY	MATH	5	f	\N	130	\N
308	1	Легкая прогулка	Эксперт — 21 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.927463+03	MATH_CARD_DONE_EASY	21	MATH_CAT_CARD_EASY	MATH	6	f	\N	190	\N
309	1	Легкая прогулка	Мастер — 28 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.927464+03	MATH_CARD_DONE_EASY	28	MATH_CAT_CARD_EASY	MATH	7	f	\N	270	\N
310	1	Легкая прогулка	Гроссмейстер — 36 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.927464+03	MATH_CARD_DONE_EASY	36	MATH_CAT_CARD_EASY	MATH	8	f	\N	370	\N
311	1	Легкая прогулка	Магистр — 45 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.927465+03	MATH_CARD_DONE_EASY	45	MATH_CAT_CARD_EASY	MATH	9	f	\N	500	\N
312	1	Легкая прогулка	Легенда — 55 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.927466+03	MATH_CARD_DONE_EASY	55	MATH_CAT_CARD_EASY	MATH	10	f	\N	660	\N
313	1	Легкая прогулка	Математический Титан — 66 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-07 21:38:42.927467+03	MATH_CARD_DONE_EASY	66	MATH_CAT_CARD_EASY	MATH	11	f	\N	860	\N
314	1	Крепкий орешек	Стажер — 1 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.927475+03	MATH_CARD_DONE_MEDIUM	1	MATH_CAT_CARD_MEDIUM	MATH	1	f	\N	10	\N
315	1	Крепкий орешек	Новичок — 3 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.927476+03	MATH_CARD_DONE_MEDIUM	3	MATH_CAT_CARD_MEDIUM	MATH	2	f	\N	25	\N
316	1	Крепкий орешек	Практик — 6 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.927477+03	MATH_CARD_DONE_MEDIUM	6	MATH_CAT_CARD_MEDIUM	MATH	3	f	\N	50	\N
317	1	Крепкий орешек	Специалист — 10 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.927478+03	MATH_CARD_DONE_MEDIUM	10	MATH_CAT_CARD_MEDIUM	MATH	4	f	\N	85	\N
318	1	Крепкий орешек	Аналитик — 15 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.927479+03	MATH_CARD_DONE_MEDIUM	15	MATH_CAT_CARD_MEDIUM	MATH	5	f	\N	130	\N
1578	1	Избранник звёзд	Прочесть второй цикл «Котов-Воителей» Эрин Хантер «Новое пророчество»:\n«Лунная Полночь»\n«Восход Луны»\n«Спасение»\n«Звёздный Свет»\n«Сумерки»\n«Закат»	🌙	0.00	2026-11-11 22:23:42.146051+03	NONE	0	READING_QUEST_WARRIORS_NEW	READING	0	f	\N	130	\N
320	1	Крепкий орешек	Мастер — 28 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.92748+03	MATH_CARD_DONE_MEDIUM	28	MATH_CAT_CARD_MEDIUM	MATH	7	f	\N	270	\N
321	1	Крепкий орешек	Гроссмейстер — 36 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.927481+03	MATH_CARD_DONE_MEDIUM	36	MATH_CAT_CARD_MEDIUM	MATH	8	f	\N	370	\N
322	1	Крепкий орешек	Магистр — 45 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.927482+03	MATH_CARD_DONE_MEDIUM	45	MATH_CAT_CARD_MEDIUM	MATH	9	f	\N	500	\N
323	1	Крепкий орешек	Легенда — 55 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.927483+03	MATH_CARD_DONE_MEDIUM	55	MATH_CAT_CARD_MEDIUM	MATH	10	f	\N	660	\N
324	1	Крепкий орешек	Математический Титан — 66 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.927483+03	MATH_CARD_DONE_MEDIUM	66	MATH_CAT_CARD_MEDIUM	MATH	11	f	\N	860	\N
325	1	Высокий полёт	Стажер — 1 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.92749+03	MATH_CARD_DONE_HIGH	1	MATH_CAT_CARD_HIGH	MATH	1	f	\N	10	\N
326	1	Высокий полёт	Новичок — 3 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.927491+03	MATH_CARD_DONE_HIGH	3	MATH_CAT_CARD_HIGH	MATH	2	f	\N	25	\N
327	1	Высокий полёт	Практик — 6 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.927491+03	MATH_CARD_DONE_HIGH	6	MATH_CAT_CARD_HIGH	MATH	3	f	\N	50	\N
328	1	Высокий полёт	Специалист — 10 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.927492+03	MATH_CARD_DONE_HIGH	10	MATH_CAT_CARD_HIGH	MATH	4	f	\N	85	\N
329	1	Высокий полёт	Аналитик — 15 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.927493+03	MATH_CARD_DONE_HIGH	15	MATH_CAT_CARD_HIGH	MATH	5	f	\N	130	\N
330	1	Высокий полёт	Эксперт — 21 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.927494+03	MATH_CARD_DONE_HIGH	21	MATH_CAT_CARD_HIGH	MATH	6	f	\N	190	\N
331	1	Высокий полёт	Мастер — 28 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.927495+03	MATH_CARD_DONE_HIGH	28	MATH_CAT_CARD_HIGH	MATH	7	f	\N	270	\N
332	1	Высокий полёт	Гроссмейстер — 36 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.927496+03	MATH_CARD_DONE_HIGH	36	MATH_CAT_CARD_HIGH	MATH	8	f	\N	370	\N
333	1	Высокий полёт	Магистр — 45 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.927496+03	MATH_CARD_DONE_HIGH	45	MATH_CAT_CARD_HIGH	MATH	9	f	\N	500	\N
334	1	Высокий полёт	Легенда — 55 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.927497+03	MATH_CARD_DONE_HIGH	55	MATH_CAT_CARD_HIGH	MATH	10	f	\N	660	\N
335	1	Высокий полёт	Математический Титан — 66 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-07 21:38:42.927498+03	MATH_CARD_DONE_HIGH	66	MATH_CAT_CARD_HIGH	MATH	11	f	\N	860	\N
336	1	Зона хардкора	Стажер — 1 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.927506+03	MATH_CARD_DONE_HARD	1	MATH_CAT_CARD_HARD	MATH	1	f	\N	10	\N
338	1	Зона хардкора	Практик — 6 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.927508+03	MATH_CARD_DONE_HARD	6	MATH_CAT_CARD_HARD	MATH	3	f	\N	50	\N
339	1	Зона хардкора	Специалист — 10 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.927508+03	MATH_CARD_DONE_HARD	10	MATH_CAT_CARD_HARD	MATH	4	f	\N	85	\N
340	1	Зона хардкора	Аналитик — 15 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.927509+03	MATH_CARD_DONE_HARD	15	MATH_CAT_CARD_HARD	MATH	5	f	\N	130	\N
344	1	Зона хардкора	Магистр — 45 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.927512+03	MATH_CARD_DONE_HARD	45	MATH_CAT_CARD_HARD	MATH	9	f	\N	500	\N
345	1	Зона хардкора	Легенда — 55 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.927513+03	MATH_CARD_DONE_HARD	55	MATH_CAT_CARD_HARD	MATH	10	f	\N	660	\N
346	1	Зона хардкора	Математический Титан — 66 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.927514+03	MATH_CARD_DONE_HARD	66	MATH_CAT_CARD_HARD	MATH	11	f	\N	860	\N
347	1	Хардкор-экстрим	Стажер — 1 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.927523+03	MATH_CARD_DONE_EXTREME	1	MATH_CAT_CARD_EXTREME	MATH	1	f	\N	10	\N
348	1	Хардкор-экстрим	Новичок — 3 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.927524+03	MATH_CARD_DONE_EXTREME	3	MATH_CAT_CARD_EXTREME	MATH	2	f	\N	25	\N
349	1	Хардкор-экстрим	Практик — 6 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.927525+03	MATH_CARD_DONE_EXTREME	6	MATH_CAT_CARD_EXTREME	MATH	3	f	\N	50	\N
350	1	Хардкор-экстрим	Специалист — 10 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.927526+03	MATH_CARD_DONE_EXTREME	10	MATH_CAT_CARD_EXTREME	MATH	4	f	\N	85	\N
351	1	Хардкор-экстрим	Аналитик — 15 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.927527+03	MATH_CARD_DONE_EXTREME	15	MATH_CAT_CARD_EXTREME	MATH	5	f	\N	130	\N
352	1	Хардкор-экстрим	Эксперт — 21 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.927528+03	MATH_CARD_DONE_EXTREME	21	MATH_CAT_CARD_EXTREME	MATH	6	f	\N	190	\N
353	1	Хардкор-экстрим	Мастер — 28 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.927529+03	MATH_CARD_DONE_EXTREME	28	MATH_CAT_CARD_EXTREME	MATH	7	f	\N	270	\N
354	1	Хардкор-экстрим	Гроссмейстер — 36 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.927529+03	MATH_CARD_DONE_EXTREME	36	MATH_CAT_CARD_EXTREME	MATH	8	f	\N	370	\N
356	1	Хардкор-экстрим	Легенда — 55 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.927531+03	MATH_CARD_DONE_EXTREME	55	MATH_CAT_CARD_EXTREME	MATH	10	f	\N	660	\N
357	1	Хардкор-экстрим	Математический Титан — 66 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.927532+03	MATH_CARD_DONE_EXTREME	66	MATH_CAT_CARD_EXTREME	MATH	11	f	\N	860	\N
358	1	Олимпийская вершина	Стажер — 1 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.927538+03	MATH_CARD_DONE_OLYMPIAD	1	MATH_CAT_CARD_OLYMPIAD	MATH	1	f	\N	10	\N
359	1	Олимпийская вершина	Новичок — 2 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.927538+03	MATH_CARD_DONE_OLYMPIAD	2	MATH_CAT_CARD_OLYMPIAD	MATH	2	f	\N	25	\N
360	1	Олимпийская вершина	Практик — 3 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.927539+03	MATH_CARD_DONE_OLYMPIAD	3	MATH_CAT_CARD_OLYMPIAD	MATH	3	f	\N	50	\N
361	1	Олимпийская вершина	Специалист — 5 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.92754+03	MATH_CARD_DONE_OLYMPIAD	5	MATH_CAT_CARD_OLYMPIAD	MATH	4	f	\N	85	\N
362	1	Олимпийская вершина	Аналитик — 7 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.927541+03	MATH_CARD_DONE_OLYMPIAD	7	MATH_CAT_CARD_OLYMPIAD	MATH	5	f	\N	130	\N
363	1	Олимпийская вершина	Эксперт — 10 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.927542+03	MATH_CARD_DONE_OLYMPIAD	10	MATH_CAT_CARD_OLYMPIAD	MATH	6	f	\N	190	\N
364	1	Олимпийская вершина	Мастер — 13 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.927543+03	MATH_CARD_DONE_OLYMPIAD	13	MATH_CAT_CARD_OLYMPIAD	MATH	7	f	\N	270	\N
365	1	Олимпийская вершина	Гроссмейстер — 17 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.927543+03	MATH_CARD_DONE_OLYMPIAD	17	MATH_CAT_CARD_OLYMPIAD	MATH	8	f	\N	370	\N
366	1	Олимпийская вершина	Магистр — 21 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.927544+03	MATH_CARD_DONE_OLYMPIAD	21	MATH_CAT_CARD_OLYMPIAD	MATH	9	f	\N	500	\N
367	1	Олимпийская вершина	Легенда — 26 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.927545+03	MATH_CARD_DONE_OLYMPIAD	26	MATH_CAT_CARD_OLYMPIAD	MATH	10	f	\N	660	\N
69	1	Детектив с лупой · Детективы	Подмастерье — 5 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.848652+03	READING_GENRE_DETECTIVE	5	READING_GENRE_DETECTIVE	READING	3	f	\N	50	\N
368	1	Олимпийская вершина	Математический Титан — 33 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-07 21:38:42.927546+03	MATH_CARD_DONE_OLYMPIAD	33	MATH_CAT_CARD_OLYMPIAD	MATH	11	f	\N	860	\N
369	1	Главный босс школы	Покоритель ВПР — сдать Всероссийские проверочные работы по математике на максимальный балл:\nВПР за 4 класс (базовая арифметика и логика)\nВПР за 5 класс (дроби и основы геометрии)\nВПР за 6 класс (отрицательные числа, пропорции)\nВПР за 7 класс (начало алгебры и геометрии)\nВПР за 8 класс (функции, системы, теоремы)	🛡️	0.00	2026-11-07 21:38:42.927556+03	NONE	0	MATH_QUEST_VPR	MATH	0	f	\N	130	\N
370	1	Олимпийский резерв	Успешно поучаствовать в школьных или онлайн-олимпиадах:\nШкольный этап Всероссийской олимпиады\nОлимпиада «Кенгуру» (или аналогичная)\nНабрать более 80% правильных ответов в любом олимпиадном туре	🎪	0.00	2026-11-07 21:38:42.927565+03	NONE	0	MATH_QUEST_OLYMP	MATH	0	f	\N	130	\N
371	1	Звездная Карта	Карточки особого уровня — решить 5 уникальных нестандартных задач повышенной сложности:\nОсобая карточка №1\nОсобая карточка №2\nОсобая карточка №3\nОсобая карточка №4\nОсобая карточка №5	⭐	0.00	2026-11-07 21:38:42.927572+03	NONE	0	MATH_QUEST_STAR	MATH	0	f	\N	130	\N
372	1	Математический универсал	Правильно решить за один день хотя бы по одному заданию из 6 разных тем (уравнение, текстовая задача, пример на скорость, дробь, геометрия, степень).	🔮	0.00	2026-11-07 21:38:42.927575+03	NONE	0	MATH_UNIVERSAL	MATH	0	f	\N	130	\N
373	1	Убийца гигантов	Безошибочно решить пример, в котором больше 10 действий (со скобками, умножением и делением).	🦖	0.00	2026-11-07 21:38:42.927584+03	NONE	0	MATH_GIANT	MATH	0	f	\N	130	\N
376	1	Вычислительный стрик	Заниматься математикой и решать не менее 15 примеров каждый день в течение 21 дня без перерывов.	🔥	0.00	2026-11-07 21:38:42.927595+03	MATH_STREAK	21	MATH_STREAK	MATH	0	f	\N	130	\N
377	1	Детектив ошибок	Найти ошибку в чужом решении (или специально допущенную родителем ошибку в примере) и исправить её.	🔎	0.00	2026-11-07 21:38:42.927601+03	NONE	0	MATH_ERR_DETECT	MATH	0	f	\N	130	\N
378	1	Идеальный черновик	Исписать целую тетрадь в клетку аккуратными вычислениями без единой вырванной страницы.	📓	0.00	2026-11-07 21:38:42.927604+03	NONE	0	MATH_NOTEBOOK	MATH	0	f	\N	130	\N
379	1	Циркуль-мастер	Построить идеальный геометрический чертёж с помощью линейки и циркуля без помарок с первой попытки.	📐	0.00	2026-11-07 21:38:42.927607+03	NONE	0	MATH_COMPASS	MATH	0	f	\N	130	\N
431	1	Шеф-мойщик	Шеф — 250 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.971555+03	NONE	250	HOUSE_CAT_DISHES	HOUSE	5	f	\N	130	\N
380	1	Карточный стратег	Первая пара — 3 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.927627+03	MATH_CARD_SUCCESS	3	MATH_CARD_DAY	MATH	1	f	\N	10	\N
381	1	Карточный стратег	Любитель карточек — 10 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.927628+03	MATH_CARD_SUCCESS	10	MATH_CARD_DAY	MATH	2	f	\N	25	\N
382	1	Карточный стратег	Десятка за картами — 25 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.927629+03	MATH_CARD_SUCCESS	25	MATH_CARD_DAY	MATH	3	f	\N	50	\N
383	1	Карточный стратег	Пятидесятый рубеж — 50 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.92763+03	MATH_CARD_SUCCESS	50	MATH_CARD_DAY	MATH	4	f	\N	85	\N
384	1	Карточный стратег	Карточный ветеран — 80 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.927631+03	MATH_CARD_SUCCESS	80	MATH_CARD_DAY	MATH	5	f	\N	130	\N
385	1	Карточный стратег	Штурман колоды — 120 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.927632+03	MATH_CARD_SUCCESS	120	MATH_CARD_DAY	MATH	6	f	\N	190	\N
386	1	Карточный стратег	Сто семьдесят — 170 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.927633+03	MATH_CARD_SUCCESS	170	MATH_CARD_DAY	MATH	7	f	\N	270	\N
387	1	Карточный стратег	Мастер колоды — 230 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.927634+03	MATH_CARD_SUCCESS	230	MATH_CARD_DAY	MATH	8	f	\N	370	\N
70	1	Детектив с лупой · Детективы	Специалист — 8 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.848654+03	READING_GENRE_DETECTIVE	8	READING_GENRE_DETECTIVE	READING	4	f	\N	85	\N
71	1	Детектив с лупой · Детективы	Искатель — 12 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.848656+03	READING_GENRE_DETECTIVE	12	READING_GENRE_DETECTIVE	READING	5	f	\N	130	\N
388	1	Карточный стратег	Триста карт — 300 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.927635+03	MATH_CARD_SUCCESS	300	MATH_CARD_DAY	MATH	9	f	\N	500	\N
389	1	Карточный стратег	Гроссмейстер карт — 380 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.927636+03	MATH_CARD_SUCCESS	380	MATH_CARD_DAY	MATH	10	f	\N	660	\N
390	1	Карточный стратег	Повелитель Карточной Колоды — 450 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-07 21:38:42.927636+03	MATH_CARD_SUCCESS	450	MATH_CARD_DAY	MATH	11	f	\N	860	\N
391	1	Карточный марафонец	Разминка — 3 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.927652+03	MATH_CARD_STREAK	3	MATH_CARD_STREAK	MATH	1	f	\N	10	\N
392	1	Карточный марафонец	Неделя в строю — 7 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.927653+03	MATH_CARD_STREAK	7	MATH_CARD_STREAK	MATH	2	f	\N	25	\N
393	1	Карточный марафонец	Двухнедельный марафон — 14 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.927654+03	MATH_CARD_STREAK	14	MATH_CARD_STREAK	MATH	3	f	\N	50	\N
394	1	Карточный марафонец	Три недели упорства — 21 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.927655+03	MATH_CARD_STREAK	21	MATH_CARD_STREAK	MATH	4	f	\N	85	\N
395	1	Карточный марафонец	Месяц математики — 30 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.927656+03	MATH_CARD_STREAK	30	MATH_CARD_STREAK	MATH	5	f	\N	130	\N
396	1	Карточный марафонец	Полтора месяца — 45 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.927657+03	MATH_CARD_STREAK	45	MATH_CARD_STREAK	MATH	6	f	\N	190	\N
397	1	Карточный марафонец	Два месяца — 60 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.927658+03	MATH_CARD_STREAK	60	MATH_CARD_STREAK	MATH	7	f	\N	270	\N
398	1	Карточный марафонец	Квартал без остановки — 90 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.927658+03	MATH_CARD_STREAK	90	MATH_CARD_STREAK	MATH	8	f	\N	370	\N
399	1	Карточный марафонец	Сезон математика — 120 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.927659+03	MATH_CARD_STREAK	120	MATH_CARD_STREAK	MATH	9	f	\N	500	\N
400	1	Карточный марафонец	Полгода точности — 180 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.92766+03	MATH_CARD_STREAK	180	MATH_CARD_STREAK	MATH	10	f	\N	660	\N
42	1	Покоритель циклов	Архивариус историй — 18 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.847845+03	READING_SERIES	18	READING_SERIES	READING	9	f	\N	500	\N
401	1	Карточный марафонец	Год точных наук — 365 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-07 21:38:42.927661+03	MATH_CARD_STREAK	365	MATH_CARD_STREAK	MATH	11	f	\N	860	\N
405	1	Магистр Чистоты	Гость в собственном доме — 50 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.971432+03	HOUSE_ROOM_POINTS	50	HOUSE_CLEAN_POINTS	HOUSE	1	f	\N	10	\N
406	1	Магистр Чистоты	Борьба с пылью — 250 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.971434+03	HOUSE_ROOM_POINTS	250	HOUSE_CLEAN_POINTS	HOUSE	2	f	\N	25	\N
407	1	Магистр Чистоты	Видимый пол — 600 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.971435+03	HOUSE_ROOM_POINTS	600	HOUSE_CLEAN_POINTS	HOUSE	3	f	\N	50	\N
408	1	Магистр Чистоты	Аккуратный жилец — 1200 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.971436+03	HOUSE_ROOM_POINTS	1200	HOUSE_CLEAN_POINTS	HOUSE	4	f	\N	85	\N
409	1	Магистр Чистоты	Хранитель уюта — 2000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.971438+03	HOUSE_ROOM_POINTS	2000	HOUSE_CLEAN_POINTS	HOUSE	5	f	\N	130	\N
410	1	Магистр Чистоты	Эксперт клининга — 3000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.971438+03	HOUSE_ROOM_POINTS	3000	HOUSE_CLEAN_POINTS	HOUSE	6	f	\N	190	\N
411	1	Магистр Чистоты	Гроза беспорядка — 4200 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.971439+03	HOUSE_ROOM_POINTS	4200	HOUSE_CLEAN_POINTS	HOUSE	7	f	\N	270	\N
412	1	Магистр Чистоты	Эстетичный хозяин — 5500 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.97144+03	HOUSE_ROOM_POINTS	5500	HOUSE_CLEAN_POINTS	HOUSE	8	f	\N	370	\N
413	1	Магистр Чистоты	Остров безупречности — 7000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.971442+03	HOUSE_ROOM_POINTS	7000	HOUSE_CLEAN_POINTS	HOUSE	9	f	\N	500	\N
414	1	Магистр Чистоты	Перфекционист — 8500 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.971443+03	HOUSE_ROOM_POINTS	8500	HOUSE_CLEAN_POINTS	HOUSE	10	f	\N	660	\N
415	1	Магистр Чистоты	Абсолютный Повелитель Чистоты — 10000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-07 21:38:42.971444+03	HOUSE_ROOM_POINTS	10000	HOUSE_CLEAN_POINTS	HOUSE	11	f	\N	860	\N
418	1	Незаменимый помощник	Семейная опора — 500 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.971467+03	HOUSE_HELP_POINTS	500	HOUSE_HELP_POINTS	HOUSE	3	f	\N	50	\N
419	1	Незаменимый помощник	Мастер на все руки — 1000 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.971468+03	HOUSE_HELP_POINTS	1000	HOUSE_HELP_POINTS	HOUSE	4	f	\N	85	\N
420	1	Незаменимый помощник	Менеджер комфорта — 1800 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.971469+03	HOUSE_HELP_POINTS	1800	HOUSE_HELP_POINTS	HOUSE	5	f	\N	130	\N
421	1	Незаменимый помощник	Хранитель домашнего очага — 2800 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.97147+03	HOUSE_HELP_POINTS	2800	HOUSE_HELP_POINTS	HOUSE	6	f	\N	190	\N
422	1	Незаменимый помощник	Управляющий бытом — 4000 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.971471+03	HOUSE_HELP_POINTS	4000	HOUSE_HELP_POINTS	HOUSE	7	f	\N	270	\N
423	1	Незаменимый помощник	Правая рука семьи — 5300 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.971472+03	HOUSE_HELP_POINTS	5300	HOUSE_HELP_POINTS	HOUSE	8	f	\N	370	\N
424	1	Незаменимый помощник	Шеф-помощник — 6700 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.971473+03	HOUSE_HELP_POINTS	6700	HOUSE_HELP_POINTS	HOUSE	9	f	\N	500	\N
426	1	Незаменимый помощник	Генеральный директор Уюта — 10000 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.971476+03	HOUSE_HELP_POINTS	10000	HOUSE_HELP_POINTS	HOUSE	11	f	\N	860	\N
428	1	Шеф-мойщик	Новичок — 20 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.971552+03	NONE	20	HOUSE_CAT_DISHES	HOUSE	2	f	\N	25	\N
429	1	Шеф-мойщик	Практик — 60 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.971553+03	NONE	60	HOUSE_CAT_DISHES	HOUSE	3	f	\N	50	\N
432	1	Шеф-мойщик	Эксперт — 400 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.971556+03	NONE	400	HOUSE_CAT_DISHES	HOUSE	6	f	\N	190	\N
433	1	Шеф-мойщик	Гроссмейстер — 600 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.971557+03	NONE	600	HOUSE_CAT_DISHES	HOUSE	7	f	\N	270	\N
434	1	Шеф-мойщик	Магистр — 850 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.971558+03	NONE	850	HOUSE_CAT_DISHES	HOUSE	8	f	\N	370	\N
435	1	Шеф-мойщик	Легенда быта — 1100 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.971559+03	NONE	1100	HOUSE_CAT_DISHES	HOUSE	9	f	\N	500	\N
436	1	Шеф-мойщик	Хранитель очага — 1400 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.97156+03	NONE	1400	HOUSE_CAT_DISHES	HOUSE	10	f	\N	660	\N
437	1	Шеф-мойщик	Генеральный директор Уюта — 1700 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.97156+03	NONE	1700	HOUSE_CAT_DISHES	HOUSE	11	f	\N	860	\N
438	1	Повелитель швабры	Стажер — 5 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.971571+03	NONE	5	HOUSE_CAT_MOP	HOUSE	1	f	\N	10	\N
439	1	Повелитель швабры	Новичок — 20 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.971572+03	NONE	20	HOUSE_CAT_MOP	HOUSE	2	f	\N	25	\N
440	1	Повелитель швабры	Практик — 60 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.971573+03	NONE	60	HOUSE_CAT_MOP	HOUSE	3	f	\N	50	\N
441	1	Повелитель швабры	Мастер — 120 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.971574+03	NONE	120	HOUSE_CAT_MOP	HOUSE	4	f	\N	85	\N
444	1	Повелитель швабры	Гроссмейстер — 600 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.971577+03	NONE	600	HOUSE_CAT_MOP	HOUSE	7	f	\N	270	\N
445	1	Повелитель швабры	Магистр — 850 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.971578+03	NONE	850	HOUSE_CAT_MOP	HOUSE	8	f	\N	370	\N
446	1	Повелитель швабры	Легенда быта — 1100 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.971579+03	NONE	1100	HOUSE_CAT_MOP	HOUSE	9	f	\N	500	\N
447	1	Повелитель швабры	Хранитель очага — 1400 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.97158+03	NONE	1400	HOUSE_CAT_MOP	HOUSE	10	f	\N	660	\N
8	1	Марафонец страниц	Ультрамарафонец — 35000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.84766+03	READING_PAGES	35000	READING_PAGES	READING	8	f	\N	370	\N
448	1	Повелитель швабры	Генеральный директор Уюта — 1700 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.971581+03	NONE	1700	HOUSE_CAT_MOP	HOUSE	11	f	\N	860	\N
449	1	Стильный эксперт	Стажер — 5 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.971591+03	NONE	5	HOUSE_CAT_LAUNDRY	HOUSE	1	f	\N	10	\N
451	1	Стильный эксперт	Практик — 60 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.971592+03	NONE	60	HOUSE_CAT_LAUNDRY	HOUSE	3	f	\N	50	\N
452	1	Стильный эксперт	Мастер — 120 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.971593+03	NONE	120	HOUSE_CAT_LAUNDRY	HOUSE	4	f	\N	85	\N
453	1	Стильный эксперт	Шеф — 250 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.971594+03	NONE	250	HOUSE_CAT_LAUNDRY	HOUSE	5	f	\N	130	\N
454	1	Стильный эксперт	Эксперт — 400 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.971596+03	NONE	400	HOUSE_CAT_LAUNDRY	HOUSE	6	f	\N	190	\N
455	1	Стильный эксперт	Гроссмейстер — 600 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.971597+03	NONE	600	HOUSE_CAT_LAUNDRY	HOUSE	7	f	\N	270	\N
456	1	Стильный эксперт	Магистр — 850 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.971598+03	NONE	850	HOUSE_CAT_LAUNDRY	HOUSE	8	f	\N	370	\N
457	1	Стильный эксперт	Легенда быта — 1100 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.971599+03	NONE	1100	HOUSE_CAT_LAUNDRY	HOUSE	9	f	\N	500	\N
458	1	Стильный эксперт	Хранитель очага — 1400 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.9716+03	NONE	1400	HOUSE_CAT_LAUNDRY	HOUSE	10	f	\N	660	\N
459	1	Стильный эксперт	Генеральный директор Уюта — 1700 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-07 21:38:42.971601+03	NONE	1700	HOUSE_CAT_LAUNDRY	HOUSE	11	f	\N	860	\N
460	1	Добытчик ресурсов	Стажер — 5 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.971604+03	NONE	5	HOUSE_CAT_SHOPPING	HOUSE	1	f	\N	10	\N
461	1	Добытчик ресурсов	Новичок — 20 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.971605+03	NONE	20	HOUSE_CAT_SHOPPING	HOUSE	2	f	\N	25	\N
462	1	Добытчик ресурсов	Практик — 60 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.971606+03	NONE	60	HOUSE_CAT_SHOPPING	HOUSE	3	f	\N	50	\N
463	1	Добытчик ресурсов	Мастер — 120 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.971607+03	NONE	120	HOUSE_CAT_SHOPPING	HOUSE	4	f	\N	85	\N
464	1	Добытчик ресурсов	Шеф — 250 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.971608+03	NONE	250	HOUSE_CAT_SHOPPING	HOUSE	5	f	\N	130	\N
466	1	Добытчик ресурсов	Гроссмейстер — 600 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.97161+03	NONE	600	HOUSE_CAT_SHOPPING	HOUSE	7	f	\N	270	\N
467	1	Добытчик ресурсов	Магистр — 850 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.97161+03	NONE	850	HOUSE_CAT_SHOPPING	HOUSE	8	f	\N	370	\N
468	1	Добытчик ресурсов	Легенда быта — 1100 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.971611+03	NONE	1100	HOUSE_CAT_SHOPPING	HOUSE	9	f	\N	500	\N
469	1	Добытчик ресурсов	Хранитель очага — 1400 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.971612+03	NONE	1400	HOUSE_CAT_SHOPPING	HOUSE	10	f	\N	660	\N
470	1	Добытчик ресурсов	Генеральный директор Уюта — 1700 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-07 21:38:42.971613+03	NONE	1700	HOUSE_CAT_SHOPPING	HOUSE	11	f	\N	860	\N
473	1	Эко-патруль	Практик — 60 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.971621+03	NONE	60	HOUSE_CAT_TRASH	HOUSE	3	f	\N	50	\N
474	1	Эко-патруль	Мастер — 120 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.971622+03	NONE	120	HOUSE_CAT_TRASH	HOUSE	4	f	\N	85	\N
475	1	Эко-патруль	Шеф — 250 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.971623+03	NONE	250	HOUSE_CAT_TRASH	HOUSE	5	f	\N	130	\N
476	1	Эко-патруль	Эксперт — 400 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.971624+03	NONE	400	HOUSE_CAT_TRASH	HOUSE	6	f	\N	190	\N
477	1	Эко-патруль	Гроссмейстер — 600 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.971625+03	NONE	600	HOUSE_CAT_TRASH	HOUSE	7	f	\N	270	\N
478	1	Эко-патруль	Магистр — 850 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.971626+03	NONE	850	HOUSE_CAT_TRASH	HOUSE	8	f	\N	370	\N
479	1	Эко-патруль	Легенда быта — 1100 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.971627+03	NONE	1100	HOUSE_CAT_TRASH	HOUSE	9	f	\N	500	\N
480	1	Эко-патруль	Хранитель очага — 1400 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.971628+03	NONE	1400	HOUSE_CAT_TRASH	HOUSE	10	f	\N	660	\N
481	1	Эко-патруль	Генеральный директор Уюта — 1700 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.971629+03	NONE	1700	HOUSE_CAT_TRASH	HOUSE	11	f	\N	860	\N
482	1	Су-шеф	Стажер — 5 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.971636+03	NONE	5	HOUSE_CAT_COOKING	HOUSE	1	f	\N	10	\N
483	1	Су-шеф	Новичок — 20 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.971637+03	NONE	20	HOUSE_CAT_COOKING	HOUSE	2	f	\N	25	\N
484	1	Су-шеф	Практик — 60 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.971637+03	NONE	60	HOUSE_CAT_COOKING	HOUSE	3	f	\N	50	\N
485	1	Су-шеф	Мастер — 120 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.971638+03	NONE	120	HOUSE_CAT_COOKING	HOUSE	4	f	\N	85	\N
486	1	Су-шеф	Шеф — 250 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.971639+03	NONE	250	HOUSE_CAT_COOKING	HOUSE	5	f	\N	130	\N
487	1	Су-шеф	Эксперт — 400 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.97164+03	NONE	400	HOUSE_CAT_COOKING	HOUSE	6	f	\N	190	\N
488	1	Су-шеф	Гроссмейстер — 600 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.971641+03	NONE	600	HOUSE_CAT_COOKING	HOUSE	7	f	\N	270	\N
489	1	Су-шеф	Магистр — 850 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.971642+03	NONE	850	HOUSE_CAT_COOKING	HOUSE	8	f	\N	370	\N
490	1	Су-шеф	Легенда быта — 1100 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.971643+03	NONE	1100	HOUSE_CAT_COOKING	HOUSE	9	f	\N	500	\N
492	1	Су-шеф	Генеральный директор Уюта — 1700 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-07 21:38:42.971645+03	NONE	1700	HOUSE_CAT_COOKING	HOUSE	11	f	\N	860	\N
493	1	Домашний инженер	Стажер — 5 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971649+03	NONE	5	HOUSE_CAT_REPAIR	HOUSE	1	f	\N	10	\N
494	1	Домашний инженер	Новичок — 20 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971651+03	NONE	20	HOUSE_CAT_REPAIR	HOUSE	2	f	\N	25	\N
495	1	Домашний инженер	Практик — 60 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971651+03	NONE	60	HOUSE_CAT_REPAIR	HOUSE	3	f	\N	50	\N
496	1	Домашний инженер	Мастер — 120 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971652+03	NONE	120	HOUSE_CAT_REPAIR	HOUSE	4	f	\N	85	\N
497	1	Домашний инженер	Шеф — 250 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971653+03	NONE	250	HOUSE_CAT_REPAIR	HOUSE	5	f	\N	130	\N
498	1	Домашний инженер	Эксперт — 400 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971654+03	NONE	400	HOUSE_CAT_REPAIR	HOUSE	6	f	\N	190	\N
146	1	Ловец рифм · Поэзия	Подмастерье — 5 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-07 21:38:42.849227+03	READING_GENRE_POETRY	5	READING_GENRE_POETRY	READING	3	f	\N	50	\N
499	1	Домашний инженер	Гроссмейстер — 600 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971655+03	NONE	600	HOUSE_CAT_REPAIR	HOUSE	7	f	\N	270	\N
500	1	Домашний инженер	Магистр — 850 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971656+03	NONE	850	HOUSE_CAT_REPAIR	HOUSE	8	f	\N	370	\N
501	1	Домашний инженер	Легенда быта — 1100 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971657+03	NONE	1100	HOUSE_CAT_REPAIR	HOUSE	9	f	\N	500	\N
502	1	Домашний инженер	Хранитель очага — 1400 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971658+03	NONE	1400	HOUSE_CAT_REPAIR	HOUSE	10	f	\N	660	\N
504	1	Ботаник-хранитель	Стажер — 5 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.971666+03	NONE	5	HOUSE_CAT_PLANTS	HOUSE	1	f	\N	10	\N
505	1	Ботаник-хранитель	Новичок — 20 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.971667+03	NONE	20	HOUSE_CAT_PLANTS	HOUSE	2	f	\N	25	\N
506	1	Ботаник-хранитель	Практик — 60 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.971668+03	NONE	60	HOUSE_CAT_PLANTS	HOUSE	3	f	\N	50	\N
507	1	Ботаник-хранитель	Мастер — 120 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.971669+03	NONE	120	HOUSE_CAT_PLANTS	HOUSE	4	f	\N	85	\N
508	1	Ботаник-хранитель	Шеф — 250 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.97167+03	NONE	250	HOUSE_CAT_PLANTS	HOUSE	5	f	\N	130	\N
509	1	Ботаник-хранитель	Эксперт — 400 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.971671+03	NONE	400	HOUSE_CAT_PLANTS	HOUSE	6	f	\N	190	\N
510	1	Ботаник-хранитель	Гроссмейстер — 600 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.971672+03	NONE	600	HOUSE_CAT_PLANTS	HOUSE	7	f	\N	270	\N
511	1	Ботаник-хранитель	Магистр — 850 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.971677+03	NONE	850	HOUSE_CAT_PLANTS	HOUSE	8	f	\N	370	\N
512	1	Ботаник-хранитель	Легенда быта — 1100 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.971678+03	NONE	1100	HOUSE_CAT_PLANTS	HOUSE	9	f	\N	500	\N
513	1	Ботаник-хранитель	Хранитель очага — 1400 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.971679+03	NONE	1400	HOUSE_CAT_PLANTS	HOUSE	10	f	\N	660	\N
518	1	Умный дом	Технологический апгрейд комнаты:\nУмная колонка 🔊\nУмные розетки или RGB-лента, управляемая голосом 📱	🎵	0.00	2026-11-07 21:38:42.971707+03	NONE	0	HOUSE_SET_SMARTHOME	HOUSE	0	f	\N	130	\N
12	1	Книжный червь	Слушатель историй — 1 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.847713+03	READING_BOOKS	1	READING_BOOKS	READING	1	f	\N	10	\N
519	1	Идеальный месяц	Поддерживать порядок в своей комнате на оценку «+2» 30 дней подряд без единого срыва в «0» или «−1».	👑	0.00	2026-11-07 21:38:42.971715+03	HOUSE_CLEAN_STREAK	30	HOUSE_PERFECT_MONTH	HOUSE	0	f	\N	130	\N
520	1	Максимальный оборот	Заработать за один день полные +8 баллов: +2 за идеальную комнату и +6 за шесть разных видов помощи.	🚀	0.00	2026-11-07 21:38:42.971718+03	NONE	0	HOUSE_MAX_DAY	HOUSE	0	f	\N	130	\N
1	1	Марафонец страниц	Спринтер-новичок — 100 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.847635+03	READING_PAGES	100	READING_PAGES	READING	1	f	\N	10	\N
2	1	Марафонец страниц	Бегун по строчкам — 500 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.847647+03	READING_PAGES	500	READING_PAGES	READING	2	f	\N	25	\N
3	1	Марафонец страниц	Торпедо — 1500 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.84765+03	READING_PAGES	1500	READING_PAGES	READING	3	f	\N	50	\N
4	1	Марафонец страниц	Покоритель глав — 3000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.847652+03	READING_PAGES	3000	READING_PAGES	READING	4	f	\N	85	\N
5	1	Марафонец страниц	Выносливый чтец — 5000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.847654+03	READING_PAGES	5000	READING_PAGES	READING	5	f	\N	130	\N
6	1	Марафонец страниц	Марафонец — 10000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.847656+03	READING_PAGES	10000	READING_PAGES	READING	6	f	\N	190	\N
11	1	Марафонец страниц	Бесконечный двигатель — 80000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.847666+03	READING_PAGES	80000	READING_PAGES	READING	11	f	\N	860	\N
503	1	Домашний инженер	Генеральный директор Уюта — 1700 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-07 21:38:42.971659+03	NONE	1700	HOUSE_CAT_REPAIR	HOUSE	11	f	\N	860	\N
525	3	Марафонец страниц	Спринтер-новичок — 100 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.640252+03	READING_PAGES	100	READING_PAGES	READING	1	f	\N	10	\N
526	3	Марафонец страниц	Бегун по строчкам — 500 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.640259+03	READING_PAGES	500	READING_PAGES	READING	2	f	\N	25	\N
528	3	Марафонец страниц	Покоритель глав — 3000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.640262+03	READING_PAGES	3000	READING_PAGES	READING	4	f	\N	85	\N
529	3	Марафонец страниц	Выносливый чтец — 5000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.640263+03	READING_PAGES	5000	READING_PAGES	READING	5	f	\N	130	\N
530	3	Марафонец страниц	Марафонец — 10000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.640265+03	READING_PAGES	10000	READING_PAGES	READING	6	f	\N	190	\N
531	3	Марафонец страниц	Железный читатель — 20000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.640266+03	READING_PAGES	20000	READING_PAGES	READING	7	f	\N	270	\N
532	3	Марафонец страниц	Ультрамарафонец — 35000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.640267+03	READING_PAGES	35000	READING_PAGES	READING	8	f	\N	370	\N
13	1	Книжный червь	Книжный новобранец — 5 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.847715+03	READING_BOOKS	5	READING_BOOKS	READING	2	f	\N	25	\N
14	1	Книжный червь	Искатель смыслов — 15 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.847717+03	READING_BOOKS	15	READING_BOOKS	READING	3	f	\N	50	\N
15	1	Книжный червь	Книголюб-исследователь — 30 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.847719+03	READING_BOOKS	30	READING_BOOKS	READING	4	f	\N	85	\N
16	1	Книжный червь	Хранитель страниц — 50 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.84772+03	READING_BOOKS	50	READING_BOOKS	READING	5	f	\N	130	\N
533	3	Марафонец страниц	Пресмыкающийся по буквам — 50000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.640268+03	READING_PAGES	50000	READING_PAGES	READING	9	f	\N	500	\N
534	3	Марафонец страниц	Книжный титан — 65000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.640269+03	READING_PAGES	65000	READING_PAGES	READING	10	f	\N	660	\N
535	3	Марафонец страниц	Бесконечный двигатель — 80000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.64027+03	READING_PAGES	80000	READING_PAGES	READING	11	f	\N	860	\N
536	3	Книжный червь	Слушатель историй — 1 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.64029+03	READING_BOOKS	1	READING_BOOKS	READING	1	f	\N	10	\N
537	3	Книжный червь	Книжный новобранец — 5 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.640291+03	READING_BOOKS	5	READING_BOOKS	READING	2	f	\N	25	\N
538	3	Книжный червь	Искатель смыслов — 15 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.640292+03	READING_BOOKS	15	READING_BOOKS	READING	3	f	\N	50	\N
539	3	Книжный червь	Книголюб-исследователь — 30 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.640293+03	READING_BOOKS	30	READING_BOOKS	READING	4	f	\N	85	\N
540	3	Книжный червь	Хранитель страниц — 50 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.640294+03	READING_BOOKS	50	READING_BOOKS	READING	5	f	\N	130	\N
541	3	Книжный червь	Мастер сюжетов — 80 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.640295+03	READING_BOOKS	80	READING_BOOKS	READING	6	f	\N	190	\N
542	3	Книжный червь	Книжный гроссмейстер — 120 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.640296+03	READING_BOOKS	120	READING_BOOKS	READING	7	f	\N	270	\N
543	3	Книжный червь	Проводник по мирам — 160 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.640297+03	READING_BOOKS	160	READING_BOOKS	READING	8	f	\N	370	\N
544	3	Книжный червь	Магистр слова — 200 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.640298+03	READING_BOOKS	200	READING_BOOKS	READING	9	f	\N	500	\N
545	3	Книжный червь	Мудрец книжных глубин — 250 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 17:06:23.640299+03	READING_BOOKS	250	READING_BOOKS	READING	10	f	\N	660	\N
547	3	Литературный турист	Первый шаг за порог — 1 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.640311+03	READING_GENRES	1	READING_GENRES	READING	1	f	\N	10	\N
561	3	Покоритель циклов	Охотник за томами — 6 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.640342+03	READING_SERIES	6	READING_SERIES	READING	4	f	\N	85	\N
562	3	Покоритель циклов	Хранитель франшиз — 8 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.640343+03	READING_SERIES	8	READING_SERIES	READING	5	f	\N	130	\N
563	3	Покоритель циклов	Коллекционер саг — 10 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.640344+03	READING_SERIES	10	READING_SERIES	READING	6	f	\N	190	\N
564	3	Покоритель циклов	Знаток сиквелов — 12 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.640345+03	READING_SERIES	12	READING_SERIES	READING	7	f	\N	270	\N
565	3	Покоритель циклов	Мастер многотомников — 15 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.640346+03	READING_SERIES	15	READING_SERIES	READING	8	f	\N	370	\N
566	3	Покоритель циклов	Архивариус историй — 18 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.640347+03	READING_SERIES	18	READING_SERIES	READING	9	f	\N	500	\N
567	3	Покоритель циклов	Покоритель эпиков — 22 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.640348+03	READING_SERIES	22	READING_SERIES	READING	10	f	\N	660	\N
572	3	Мастер заклинаний · Фэнтези	Специалист — 8 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.640468+03	READING_GENRE_FANTASY	8	READING_GENRE_FANTASY	READING	4	f	\N	85	\N
574	3	Мастер заклинаний · Фэнтези	Эксперт — 16 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.64047+03	READING_GENRE_FANTASY	16	READING_GENRE_FANTASY	READING	6	f	\N	190	\N
575	3	Мастер заклинаний · Фэнтези	Мастер — 20 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.640471+03	READING_GENRE_FANTASY	20	READING_GENRE_FANTASY	READING	7	f	\N	270	\N
576	3	Мастер заклинаний · Фэнтези	Гроссмейстер — 25 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.640476+03	READING_GENRE_FANTASY	25	READING_GENRE_FANTASY	READING	8	f	\N	370	\N
577	3	Мастер заклинаний · Фэнтези	Магистр — 30 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.640477+03	READING_GENRE_FANTASY	30	READING_GENRE_FANTASY	READING	9	f	\N	500	\N
578	3	Мастер заклинаний · Фэнтези	Легенда — 35 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.640478+03	READING_GENRE_FANTASY	35	READING_GENRE_FANTASY	READING	10	f	\N	660	\N
579	3	Мастер заклинаний · Фэнтези	Божество жанра — 40 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.640479+03	READING_GENRE_FANTASY	40	READING_GENRE_FANTASY	READING	11	f	\N	860	\N
581	3	Капитан звездолета · Научная фантастика / Sci-Fi	Новичок — 3 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.640489+03	READING_GENRE_SCIFI	3	READING_GENRE_SCIFI	READING	2	f	\N	25	\N
582	3	Капитан звездолета · Научная фантастика / Sci-Fi	Подмастерье — 5 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.64049+03	READING_GENRE_SCIFI	5	READING_GENRE_SCIFI	READING	3	f	\N	50	\N
583	3	Капитан звездолета · Научная фантастика / Sci-Fi	Специалист — 8 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.640491+03	READING_GENRE_SCIFI	8	READING_GENRE_SCIFI	READING	4	f	\N	85	\N
584	3	Капитан звездолета · Научная фантастика / Sci-Fi	Искатель — 12 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.640492+03	READING_GENRE_SCIFI	12	READING_GENRE_SCIFI	READING	5	f	\N	130	\N
586	3	Капитан звездолета · Научная фантастика / Sci-Fi	Мастер — 20 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.640494+03	READING_GENRE_SCIFI	20	READING_GENRE_SCIFI	READING	7	f	\N	270	\N
62	1	Капитан звездолета · Научная фантастика / Sci-Fi	Мастер — 20 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848621+03	READING_GENRE_SCIFI	20	READING_GENRE_SCIFI	READING	7	f	\N	270	\N
587	3	Капитан звездолета · Научная фантастика / Sci-Fi	Гроссмейстер — 25 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.640495+03	READING_GENRE_SCIFI	25	READING_GENRE_SCIFI	READING	8	f	\N	370	\N
588	3	Капитан звездолета · Научная фантастика / Sci-Fi	Магистр — 30 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.640497+03	READING_GENRE_SCIFI	30	READING_GENRE_SCIFI	READING	9	f	\N	500	\N
589	3	Капитан звездолета · Научная фантастика / Sci-Fi	Легенда — 35 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.640498+03	READING_GENRE_SCIFI	35	READING_GENRE_SCIFI	READING	10	f	\N	660	\N
590	3	Капитан звездолета · Научная фантастика / Sci-Fi	Божество жанра — 40 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.640499+03	READING_GENRE_SCIFI	40	READING_GENRE_SCIFI	READING	11	f	\N	860	\N
591	3	Детектив с лупой · Детективы	Ученик — 1 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.640503+03	READING_GENRE_DETECTIVE	1	READING_GENRE_DETECTIVE	READING	1	f	\N	10	\N
592	3	Детектив с лупой · Детективы	Новичок — 3 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.640504+03	READING_GENRE_DETECTIVE	3	READING_GENRE_DETECTIVE	READING	2	f	\N	25	\N
593	3	Детектив с лупой · Детективы	Подмастерье — 5 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.640505+03	READING_GENRE_DETECTIVE	5	READING_GENRE_DETECTIVE	READING	3	f	\N	50	\N
594	3	Детектив с лупой · Детективы	Специалист — 8 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.640506+03	READING_GENRE_DETECTIVE	8	READING_GENRE_DETECTIVE	READING	4	f	\N	85	\N
595	3	Детектив с лупой · Детективы	Искатель — 12 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.640508+03	READING_GENRE_DETECTIVE	12	READING_GENRE_DETECTIVE	READING	5	f	\N	130	\N
596	3	Детектив с лупой · Детективы	Эксперт — 16 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 17:06:23.640509+03	READING_GENRE_DETECTIVE	16	READING_GENRE_DETECTIVE	READING	6	f	\N	190	\N
602	3	Хранитель тайн · Приключения	Ученик — 1 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.640526+03	READING_GENRE_ADVENTURE	1	READING_GENRE_ADVENTURE	READING	1	f	\N	10	\N
609	3	Хранитель тайн · Приключения	Гроссмейстер — 25 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.640533+03	READING_GENRE_ADVENTURE	25	READING_GENRE_ADVENTURE	READING	8	f	\N	370	\N
610	3	Хранитель тайн · Приключения	Магистр — 30 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.640534+03	READING_GENRE_ADVENTURE	30	READING_GENRE_ADVENTURE	READING	9	f	\N	500	\N
611	3	Хранитель тайн · Приключения	Легенда — 35 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.640535+03	READING_GENRE_ADVENTURE	35	READING_GENRE_ADVENTURE	READING	10	f	\N	660	\N
612	3	Хранитель тайн · Приключения	Божество жанра — 40 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.640541+03	READING_GENRE_ADVENTURE	40	READING_GENRE_ADVENTURE	READING	11	f	\N	860	\N
613	3	Проводник в реальность · Современная проза	Ученик — 1 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.640608+03	READING_GENRE_CONTEMPORARY	1	READING_GENRE_CONTEMPORARY	READING	1	f	\N	10	\N
614	3	Проводник в реальность · Современная проза	Новичок — 3 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.640609+03	READING_GENRE_CONTEMPORARY	3	READING_GENRE_CONTEMPORARY	READING	2	f	\N	25	\N
615	3	Проводник в реальность · Современная проза	Подмастерье — 5 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.64061+03	READING_GENRE_CONTEMPORARY	5	READING_GENRE_CONTEMPORARY	READING	3	f	\N	50	\N
616	3	Проводник в реальность · Современная проза	Специалист — 8 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.640611+03	READING_GENRE_CONTEMPORARY	8	READING_GENRE_CONTEMPORARY	READING	4	f	\N	85	\N
617	3	Проводник в реальность · Современная проза	Искатель — 12 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.640613+03	READING_GENRE_CONTEMPORARY	12	READING_GENRE_CONTEMPORARY	READING	5	f	\N	130	\N
618	3	Проводник в реальность · Современная проза	Эксперт — 16 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.640614+03	READING_GENRE_CONTEMPORARY	16	READING_GENRE_CONTEMPORARY	READING	6	f	\N	190	\N
619	3	Проводник в реальность · Современная проза	Мастер — 20 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.640615+03	READING_GENRE_CONTEMPORARY	20	READING_GENRE_CONTEMPORARY	READING	7	f	\N	270	\N
603	3	Хранитель тайн · Приключения	Новичок — 3 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.640527+03	READING_GENRE_ADVENTURE	3	READING_GENRE_ADVENTURE	READING	2	f	\N	25	\N
622	3	Проводник в реальность · Современная проза	Легенда — 35 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.640618+03	READING_GENRE_CONTEMPORARY	35	READING_GENRE_CONTEMPORARY	READING	10	f	\N	660	\N
623	3	Проводник в реальность · Современная проза	Божество жанра — 40 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.640619+03	READING_GENRE_CONTEMPORARY	40	READING_GENRE_CONTEMPORARY	READING	11	f	\N	860	\N
624	3	Исследователь прошлого · Исторические романы	Ученик — 1 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.640628+03	READING_GENRE_HISTORY	1	READING_GENRE_HISTORY	READING	1	f	\N	10	\N
625	3	Исследователь прошлого · Исторические романы	Новичок — 3 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.640629+03	READING_GENRE_HISTORY	3	READING_GENRE_HISTORY	READING	2	f	\N	25	\N
626	3	Исследователь прошлого · Исторические романы	Подмастерье — 5 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.64063+03	READING_GENRE_HISTORY	5	READING_GENRE_HISTORY	READING	3	f	\N	50	\N
627	3	Исследователь прошлого · Исторические романы	Специалист — 8 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.640631+03	READING_GENRE_HISTORY	8	READING_GENRE_HISTORY	READING	4	f	\N	85	\N
628	3	Исследователь прошлого · Исторические романы	Искатель — 12 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.640632+03	READING_GENRE_HISTORY	12	READING_GENRE_HISTORY	READING	5	f	\N	130	\N
629	3	Исследователь прошлого · Исторические романы	Эксперт — 16 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.640633+03	READING_GENRE_HISTORY	16	READING_GENRE_HISTORY	READING	6	f	\N	190	\N
630	3	Исследователь прошлого · Исторические романы	Мастер — 20 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.640634+03	READING_GENRE_HISTORY	20	READING_GENRE_HISTORY	READING	7	f	\N	270	\N
631	3	Исследователь прошлого · Исторические романы	Гроссмейстер — 25 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.640636+03	READING_GENRE_HISTORY	25	READING_GENRE_HISTORY	READING	8	f	\N	370	\N
632	3	Исследователь прошлого · Исторические романы	Магистр — 30 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.640637+03	READING_GENRE_HISTORY	30	READING_GENRE_HISTORY	READING	9	f	\N	500	\N
633	3	Исследователь прошлого · Исторические романы	Легенда — 35 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.640638+03	READING_GENRE_HISTORY	35	READING_GENRE_HISTORY	READING	10	f	\N	660	\N
636	3	Шепот в темноте · Ужасы и мистика	Новичок — 3 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640645+03	READING_GENRE_HORROR	3	READING_GENRE_HORROR	READING	2	f	\N	25	\N
637	3	Шепот в темноте · Ужасы и мистика	Подмастерье — 5 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640646+03	READING_GENRE_HORROR	5	READING_GENRE_HORROR	READING	3	f	\N	50	\N
638	3	Шепот в темноте · Ужасы и мистика	Специалист — 8 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640647+03	READING_GENRE_HORROR	8	READING_GENRE_HORROR	READING	4	f	\N	85	\N
639	3	Шепот в темноте · Ужасы и мистика	Искатель — 12 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640648+03	READING_GENRE_HORROR	12	READING_GENRE_HORROR	READING	5	f	\N	130	\N
640	3	Шепот в темноте · Ужасы и мистика	Эксперт — 16 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640649+03	READING_GENRE_HORROR	16	READING_GENRE_HORROR	READING	6	f	\N	190	\N
641	3	Шепот в темноте · Ужасы и мистика	Мастер — 20 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640651+03	READING_GENRE_HORROR	20	READING_GENRE_HORROR	READING	7	f	\N	270	\N
72	1	Детектив с лупой · Детективы	Эксперт — 16 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.848657+03	READING_GENRE_DETECTIVE	16	READING_GENRE_DETECTIVE	READING	6	f	\N	190	\N
642	3	Шепот в темноте · Ужасы и мистика	Гроссмейстер — 25 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640652+03	READING_GENRE_HORROR	25	READING_GENRE_HORROR	READING	8	f	\N	370	\N
643	3	Шепот в темноте · Ужасы и мистика	Магистр — 30 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640653+03	READING_GENRE_HORROR	30	READING_GENRE_HORROR	READING	9	f	\N	500	\N
644	3	Шепот в темноте · Ужасы и мистика	Легенда — 35 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640654+03	READING_GENRE_HORROR	35	READING_GENRE_HORROR	READING	10	f	\N	660	\N
645	3	Шепот в темноте · Ужасы и мистика	Божество жанра — 40 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640655+03	READING_GENRE_HORROR	40	READING_GENRE_HORROR	READING	11	f	\N	860	\N
646	3	Ученый совет · Научпоп и энциклопедии	Ученик — 1 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.640667+03	READING_GENRE_SCIENCE	1	READING_GENRE_SCIENCE	READING	1	f	\N	10	\N
647	3	Ученый совет · Научпоп и энциклопедии	Новичок — 3 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.640669+03	READING_GENRE_SCIENCE	3	READING_GENRE_SCIENCE	READING	2	f	\N	25	\N
673	3	Ловец рифм · Поэзия	Эксперт — 16 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.640738+03	READING_GENRE_POETRY	16	READING_GENRE_POETRY	READING	6	f	\N	190	\N
648	3	Ученый совет · Научпоп и энциклопедии	Подмастерье — 5 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.64067+03	READING_GENRE_SCIENCE	5	READING_GENRE_SCIENCE	READING	3	f	\N	50	\N
649	3	Ученый совет · Научпоп и энциклопедии	Специалист — 8 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.640671+03	READING_GENRE_SCIENCE	8	READING_GENRE_SCIENCE	READING	4	f	\N	85	\N
650	3	Ученый совет · Научпоп и энциклопедии	Искатель — 12 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.640672+03	READING_GENRE_SCIENCE	12	READING_GENRE_SCIENCE	READING	5	f	\N	130	\N
651	3	Ученый совет · Научпоп и энциклопедии	Эксперт — 16 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.640674+03	READING_GENRE_SCIENCE	16	READING_GENRE_SCIENCE	READING	6	f	\N	190	\N
652	3	Ученый совет · Научпоп и энциклопедии	Мастер — 20 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.640697+03	READING_GENRE_SCIENCE	20	READING_GENRE_SCIENCE	READING	7	f	\N	270	\N
653	3	Ученый совет · Научпоп и энциклопедии	Гроссмейстер — 25 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.640704+03	READING_GENRE_SCIENCE	25	READING_GENRE_SCIENCE	READING	8	f	\N	370	\N
654	3	Ученый совет · Научпоп и энциклопедии	Магистр — 30 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.640706+03	READING_GENRE_SCIENCE	30	READING_GENRE_SCIENCE	READING	9	f	\N	500	\N
655	3	Ученый совет · Научпоп и энциклопедии	Легенда — 35 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.640707+03	READING_GENRE_SCIENCE	35	READING_GENRE_SCIENCE	READING	10	f	\N	660	\N
656	3	Ученый совет · Научпоп и энциклопедии	Божество жанра — 40 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 17:06:23.640708+03	READING_GENRE_SCIENCE	40	READING_GENRE_SCIENCE	READING	11	f	\N	860	\N
657	3	Мудрая сова · Сказки, мифы, легенды	Ученик — 1 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.640716+03	READING_GENRE_FAIRYTALE	1	READING_GENRE_FAIRYTALE	READING	1	f	\N	10	\N
658	3	Мудрая сова · Сказки, мифы, легенды	Новичок — 3 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.640717+03	READING_GENRE_FAIRYTALE	3	READING_GENRE_FAIRYTALE	READING	2	f	\N	25	\N
659	3	Мудрая сова · Сказки, мифы, легенды	Подмастерье — 5 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.640718+03	READING_GENRE_FAIRYTALE	5	READING_GENRE_FAIRYTALE	READING	3	f	\N	50	\N
660	3	Мудрая сова · Сказки, мифы, легенды	Специалист — 8 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.640719+03	READING_GENRE_FAIRYTALE	8	READING_GENRE_FAIRYTALE	READING	4	f	\N	85	\N
661	3	Мудрая сова · Сказки, мифы, легенды	Искатель — 12 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.64072+03	READING_GENRE_FAIRYTALE	12	READING_GENRE_FAIRYTALE	READING	5	f	\N	130	\N
662	3	Мудрая сова · Сказки, мифы, легенды	Эксперт — 16 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.640721+03	READING_GENRE_FAIRYTALE	16	READING_GENRE_FAIRYTALE	READING	6	f	\N	190	\N
663	3	Мудрая сова · Сказки, мифы, легенды	Мастер — 20 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.640723+03	READING_GENRE_FAIRYTALE	20	READING_GENRE_FAIRYTALE	READING	7	f	\N	270	\N
664	3	Мудрая сова · Сказки, мифы, легенды	Гроссмейстер — 25 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.640724+03	READING_GENRE_FAIRYTALE	25	READING_GENRE_FAIRYTALE	READING	8	f	\N	370	\N
665	3	Мудрая сова · Сказки, мифы, легенды	Магистр — 30 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.640725+03	READING_GENRE_FAIRYTALE	30	READING_GENRE_FAIRYTALE	READING	9	f	\N	500	\N
666	3	Мудрая сова · Сказки, мифы, легенды	Легенда — 35 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.640726+03	READING_GENRE_FAIRYTALE	35	READING_GENRE_FAIRYTALE	READING	10	f	\N	660	\N
667	3	Мудрая сова · Сказки, мифы, легенды	Божество жанра — 40 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 17:06:23.640727+03	READING_GENRE_FAIRYTALE	40	READING_GENRE_FAIRYTALE	READING	11	f	\N	860	\N
669	3	Ловец рифм · Поэзия	Новичок — 3 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.640734+03	READING_GENRE_POETRY	3	READING_GENRE_POETRY	READING	2	f	\N	25	\N
670	3	Ловец рифм · Поэзия	Подмастерье — 5 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.640735+03	READING_GENRE_POETRY	5	READING_GENRE_POETRY	READING	3	f	\N	50	\N
671	3	Ловец рифм · Поэзия	Специалист — 8 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.640736+03	READING_GENRE_POETRY	8	READING_GENRE_POETRY	READING	4	f	\N	85	\N
678	3	Ловец рифм · Поэзия	Божество жанра — 40 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.640744+03	READING_GENRE_POETRY	40	READING_GENRE_POETRY	READING	11	f	\N	860	\N
679	3	Живые картинки · Комиксы и манга	Ученик — 1 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640752+03	READING_GENRE_COMICS	1	READING_GENRE_COMICS	READING	1	f	\N	10	\N
680	3	Живые картинки · Комиксы и манга	Новичок — 3 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640754+03	READING_GENRE_COMICS	3	READING_GENRE_COMICS	READING	2	f	\N	25	\N
681	3	Живые картинки · Комиксы и манга	Подмастерье — 5 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640755+03	READING_GENRE_COMICS	5	READING_GENRE_COMICS	READING	3	f	\N	50	\N
682	3	Живые картинки · Комиксы и манга	Специалист — 8 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640756+03	READING_GENRE_COMICS	8	READING_GENRE_COMICS	READING	4	f	\N	85	\N
1050	4	Марафонец страниц	Бегун по строчкам — 500 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626439+03	READING_PAGES	500	READING_PAGES	READING	2	f	\N	25	\N
24	1	Литературный турист	Местный турист — 2 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.847758+03	READING_GENRES	2	READING_GENRES	READING	2	f	\N	25	\N
683	3	Живые картинки · Комиксы и манга	Искатель — 12 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640761+03	READING_GENRE_COMICS	12	READING_GENRE_COMICS	READING	5	f	\N	130	\N
684	3	Живые картинки · Комиксы и манга	Эксперт — 16 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640762+03	READING_GENRE_COMICS	16	READING_GENRE_COMICS	READING	6	f	\N	190	\N
685	3	Живые картинки · Комиксы и манга	Мастер — 20 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640763+03	READING_GENRE_COMICS	20	READING_GENRE_COMICS	READING	7	f	\N	270	\N
686	3	Живые картинки · Комиксы и манга	Гроссмейстер — 25 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640764+03	READING_GENRE_COMICS	25	READING_GENRE_COMICS	READING	8	f	\N	370	\N
68	1	Детектив с лупой · Детективы	Новичок — 3 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.84865+03	READING_GENRE_DETECTIVE	3	READING_GENRE_DETECTIVE	READING	2	f	\N	25	\N
687	3	Живые картинки · Комиксы и манга	Магистр — 30 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640765+03	READING_GENRE_COMICS	30	READING_GENRE_COMICS	READING	9	f	\N	500	\N
690	3	Смех сквозь строки · Юмор	Ученик — 1 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.640773+03	READING_GENRE_HUMOR	1	READING_GENRE_HUMOR	READING	1	f	\N	10	\N
691	3	Смех сквозь строки · Юмор	Новичок — 3 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.640774+03	READING_GENRE_HUMOR	3	READING_GENRE_HUMOR	READING	2	f	\N	25	\N
692	3	Смех сквозь строки · Юмор	Подмастерье — 5 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.640775+03	READING_GENRE_HUMOR	5	READING_GENRE_HUMOR	READING	3	f	\N	50	\N
693	3	Смех сквозь строки · Юмор	Специалист — 8 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.640776+03	READING_GENRE_HUMOR	8	READING_GENRE_HUMOR	READING	4	f	\N	85	\N
694	3	Смех сквозь строки · Юмор	Искатель — 12 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.640777+03	READING_GENRE_HUMOR	12	READING_GENRE_HUMOR	READING	5	f	\N	130	\N
695	3	Смех сквозь строки · Юмор	Эксперт — 16 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.640778+03	READING_GENRE_HUMOR	16	READING_GENRE_HUMOR	READING	6	f	\N	190	\N
676	3	Ловец рифм · Поэзия	Магистр — 30 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.640741+03	READING_GENRE_POETRY	30	READING_GENRE_POETRY	READING	9	f	\N	500	\N
696	3	Смех сквозь строки · Юмор	Мастер — 20 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.640779+03	READING_GENRE_HUMOR	20	READING_GENRE_HUMOR	READING	7	f	\N	270	\N
697	3	Смех сквозь строки · Юмор	Гроссмейстер — 25 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.64078+03	READING_GENRE_HUMOR	25	READING_GENRE_HUMOR	READING	8	f	\N	370	\N
698	3	Смех сквозь строки · Юмор	Магистр — 30 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.640781+03	READING_GENRE_HUMOR	30	READING_GENRE_HUMOR	READING	9	f	\N	500	\N
699	3	Смех сквозь строки · Юмор	Легенда — 35 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.640783+03	READING_GENRE_HUMOR	35	READING_GENRE_HUMOR	READING	10	f	\N	660	\N
700	3	Смех сквозь строки · Юмор	Божество жанра — 40 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 17:06:23.640784+03	READING_GENRE_HUMOR	40	READING_GENRE_HUMOR	READING	11	f	\N	860	\N
701	3	Мальчик, который выжил	Прочесть серию о Гарри Поттере:\n«Гарри Поттер и философский камень»\n«Гарри Поттер и Тайная комната»\n«Гарри Поттер и узник Азкабана»\n«Гарри Поттер и Кубок огня»\n«Гарри Поттер и Орден Феникса»\n«Гарри Поттер и Принц-полукровка»\n«Гарри Поттер и Дары Смерти»\n«Гарри Поттер и Проклятое дитя»	⚡	0.00	2026-11-08 17:06:23.640795+03	NONE	0	READING_QUEST_HP	READING	0	f	\N	130	\N
1051	4	Марафонец страниц	Торпедо — 1500 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626442+03	READING_PAGES	1500	READING_PAGES	READING	3	f	\N	50	\N
707	3	Книжный Кит	Прочитать одну тяжёлую книгу объёмом более 600 страниц.	🐋	0.00	2026-11-08 17:06:23.640827+03	READING_HEAVY_BOOKS	1	READING_WHALE	READING	0	f	\N	130	\N
703	3	Через шкаф в Нарнию	Прочесть «Хроники Нарнии»:\n«Племянник чародея»\n«Лев, Колдунья и Платяной шкаф»\n«Конь и его мальчик»\n«Принц Каспиан»\n«Покоритель зари»\n«Серебряное кресло»\n«Последняя битва»	🦁	0.00	2026-11-08 17:06:23.640812+03	NONE	0	READING_QUEST_NARNIA	READING	0	f	\N	130	\N
704	3	Житель Изумрудного города	Прочесть цикл А. Волкова:\n«Волшебник Изумрудного города»\n«Урфин Джюс и его деревянные солдаты»\n«Семь подземных королей»\n«Огненный бог Марранов»\n«Желтый туман»\n«Тайна заброшенного замка»	💚	0.00	2026-11-08 17:06:23.640816+03	NONE	0	READING_QUEST_EMERALD	READING	0	f	\N	130	\N
705	3	Перси Джексон и олимпийцы	Прочесть серию Р. Риордана:\n«Похититель молний»\n«Море чудовищ»\n«Проклятие титана»\n«Лабиринт смерти»\n«Последнее пророчество»	🔱	0.00	2026-11-08 17:06:23.640819+03	NONE	0	READING_QUEST_PERCY	READING	0	f	\N	130	\N
7	1	Марафонец страниц	Железный читатель — 20000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.847658+03	READING_PAGES	20000	READING_PAGES	READING	7	f	\N	270	\N
226	1	Укротитель Иксов	Стажер — 10 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-07 21:38:42.927236+03	NONE	10	MATH_CAT_EQUATIONS	MATH	1	f	\N	10	\N
706	3	Абсолютный Всевед	Прочитать хотя бы по одной книге из всех 12 жанров: Фэнтези, Научная фантастика, Детектив, Приключения, Современная проза, Исторические романы, Ужасы, Научпоп, Сказки, Поэзия, Комиксы, Юмор.	🌟	0.00	2026-11-08 17:06:23.640823+03	READING_GENRES	12	READING_OMNIVORE	READING	0	f	\N	130	\N
558	3	Покоритель циклов	Свидетель дилогии — 1 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.640339+03	READING_SERIES	1	READING_SERIES	READING	1	f	\N	10	\N
710	3	Литературный критик	Рассказать родителям содержательные отзывы на 10 разных книг.	🗣️	0.00	2026-11-08 17:06:23.640841+03	NONE	0	READING_CRITIC	READING	0	f	\N	130	\N
711	3	Книжный первооткрыватель	Прочитать книгу совершенно нового автора, о котором раньше никогда не слышал.	🧭	0.00	2026-11-08 17:06:23.640849+03	NONE	0	READING_PIONEER	READING	0	f	\N	130	\N
712	3	Второе дыхание	Перечитать свою самую любимую книгу от начала до конца ещё раз.	🔄	0.00	2026-11-08 17:06:23.640852+03	NONE	0	READING_REREAD	READING	0	f	\N	130	\N
713	3	Судья экранизаций	Прочитать книгу, посмотреть по ней фильм/мультфильм и честно сравнить их.	🎬	0.00	2026-11-08 17:06:23.640855+03	NONE	0	READING_MOVIE	READING	0	f	\N	130	\N
714	3	Ночной дозор	Тайком или с разрешения прочитать целую главу под одеялом с фонариком.	🔦	0.00	2026-11-08 17:06:23.640861+03	NONE	0	READING_NIGHT	READING	0	f	\N	130	\N
715	3	Чтение без границ	Прочитать книгу полностью вне дома (в парке, в путешествии, в поезде).	🎒	0.00	2026-11-08 17:06:23.640867+03	NONE	0	READING_OUTSIDE	READING	0	f	\N	130	\N
716	3	Книжный стилист	Навести идеальный порядок на своей книжной полке и расставить книги по цветам, авторам или размеру.	📚	0.00	2026-11-08 17:06:23.640871+03	NONE	0	READING_SHELF	READING	0	f	\N	130	\N
717	3	Вычислительная машина	Цифровой первоклашка — 100 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.740115+03	MATH_TASKS	100	MATH_EXAMPLES	MATH	1	f	\N	10	\N
718	3	Вычислительная машина	Калькулятор на батарейках — 500 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.740117+03	MATH_TASKS	500	MATH_EXAMPLES	MATH	2	f	\N	25	\N
719	3	Вычислительная машина	Счетные счеты — 1500 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.740119+03	MATH_TASKS	1500	MATH_EXAMPLES	MATH	3	f	\N	50	\N
720	3	Вычислительная машина	Властелин плюсов и минусов — 3000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.74012+03	MATH_TASKS	3000	MATH_EXAMPLES	MATH	4	f	\N	85	\N
721	3	Вычислительная машина	Умножающий разум — 5000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.74012+03	MATH_TASKS	5000	MATH_EXAMPLES	MATH	5	f	\N	130	\N
722	3	Вычислительная машина	Процессор Core i3 — 10000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.740121+03	MATH_TASKS	10000	MATH_EXAMPLES	MATH	6	f	\N	190	\N
1052	4	Марафонец страниц	Покоритель глав — 3000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626443+03	READING_PAGES	3000	READING_PAGES	READING	4	f	\N	85	\N
723	3	Вычислительная машина	Мастер алгоритмов — 20000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.740122+03	MATH_TASKS	20000	MATH_EXAMPLES	MATH	7	f	\N	270	\N
724	3	Вычислительная машина	Цифровой гроссмейстер — 35000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.740123+03	MATH_TASKS	35000	MATH_EXAMPLES	MATH	8	f	\N	370	\N
725	3	Вычислительная машина	Квантовый компьютер — 50000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.740124+03	MATH_TASKS	50000	MATH_EXAMPLES	MATH	9	f	\N	500	\N
748	3	Испытатель тестов	Провидец ответов — 380 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.740172+03	MATH_CARDS	380	MATH_TESTS	MATH	10	f	\N	660	\N
726	3	Вычислительная машина	Укротитель бесконечности — 65000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.740125+03	MATH_TASKS	65000	MATH_EXAMPLES	MATH	10	f	\N	660	\N
708	3	Неудержимый	Читать каждый день без пропусков в течение 30 дней.	🔥	0.00	2026-11-08 17:06:23.640831+03	READING_STREAK	30	READING_STREAK	READING	0	f	\N	130	\N
727	3	Вычислительная машина	Абсолютный Вычислитель — 80000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 17:06:23.740126+03	MATH_TASKS	80000	MATH_EXAMPLES	MATH	11	f	\N	860	\N
728	3	Главный архитектор	Искатель условий — 5 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.740139+03	NONE	5	MATH_WORD	MATH	1	f	\N	10	\N
73	1	Детектив с лупой · Детективы	Мастер — 20 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.848659+03	READING_GENRE_DETECTIVE	20	READING_GENRE_DETECTIVE	READING	7	f	\N	270	\N
729	3	Главный архитектор	Распутыватель клубков — 15 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.74014+03	NONE	15	MATH_WORD	MATH	2	f	\N	25	\N
730	3	Главный архитектор	Логический детектив — 40 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.740141+03	NONE	40	MATH_WORD	MATH	3	f	\N	50	\N
731	3	Главный архитектор	Инженер смыслов — 80 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.740142+03	NONE	80	MATH_WORD	MATH	4	f	\N	85	\N
732	3	Главный архитектор	Мастер чертежей — 150 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.740142+03	NONE	150	MATH_WORD	MATH	5	f	\N	130	\N
733	3	Главный архитектор	Взломщик теорем — 250 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.740143+03	NONE	250	MATH_WORD	MATH	6	f	\N	190	\N
43	1	Покоритель циклов	Покоритель эпиков — 22 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.847847+03	READING_SERIES	22	READING_SERIES	READING	10	f	\N	660	\N
734	3	Главный архитектор	Конструктор решений — 400 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.740144+03	NONE	400	MATH_WORD	MATH	7	f	\N	270	\N
735	3	Главный архитектор	Проектировщик матриц — 600 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.740145+03	NONE	600	MATH_WORD	MATH	8	f	\N	370	\N
1566	4	Умный дом	Технологический апгрейд комнаты:\nУмная колонка 🔊\nУмные розетки или RGB-лента, управляемая голосом 📱	🎵	0.00	2026-11-08 23:19:52.754132+03	NONE	0	HOUSE_SET_SMARTHOME	HOUSE	0	f	\N	130	\N
737	3	Главный архитектор	Архитектор гипотез — 1100 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.740147+03	NONE	1100	MATH_WORD	MATH	10	f	\N	660	\N
738	3	Главный архитектор	Повелитель Математических Миров — 1400 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.74015+03	NONE	1400	MATH_WORD	MATH	11	f	\N	860	\N
739	3	Испытатель тестов	Тестовый дебютант — 5 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.740164+03	MATH_CARDS	5	MATH_TESTS	MATH	1	f	\N	10	\N
740	3	Испытатель тестов	Уверенный отличник — 15 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.740165+03	MATH_CARDS	15	MATH_TESTS	MATH	2	f	\N	25	\N
741	3	Испытатель тестов	Охотник за пятерками — 30 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.740166+03	MATH_CARDS	30	MATH_TESTS	MATH	3	f	\N	50	\N
742	3	Испытатель тестов	Критик ошибок — 50 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.740167+03	MATH_CARDS	50	MATH_TESTS	MATH	4	f	\N	85	\N
743	3	Испытатель тестов	Гроза контрольных — 80 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.740168+03	MATH_CARDS	80	MATH_TESTS	MATH	5	f	\N	130	\N
744	3	Испытатель тестов	Тестовый эксперт — 120 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.740169+03	MATH_CARDS	120	MATH_TESTS	MATH	6	f	\N	190	\N
745	3	Испытатель тестов	Несокрушимый разум — 170 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.74017+03	MATH_CARDS	170	MATH_TESTS	MATH	7	f	\N	270	\N
746	3	Испытатель тестов	Магистр экзаменов — 230 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.74017+03	MATH_CARDS	230	MATH_TESTS	MATH	8	f	\N	370	\N
747	3	Испытатель тестов	Железный отличник — 300 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.740171+03	MATH_CARDS	300	MATH_TESTS	MATH	9	f	\N	500	\N
761	3	Арифметика в уме	Стажер — 10 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740252+03	NONE	10	MATH_CAT_ARITHMETIC	MATH	1	f	\N	10	\N
749	3	Испытатель тестов	Абсолютный Цензор — 450 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 17:06:23.740173+03	MATH_CARDS	450	MATH_TESTS	MATH	11	f	\N	860	\N
750	3	Укротитель Иксов	Стажер — 10 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.740239+03	NONE	10	MATH_CAT_EQUATIONS	MATH	1	f	\N	10	\N
751	3	Укротитель Иксов	Новичок — 50 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.74024+03	NONE	50	MATH_CAT_EQUATIONS	MATH	2	f	\N	25	\N
752	3	Укротитель Иксов	Практик — 150 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.740241+03	NONE	150	MATH_CAT_EQUATIONS	MATH	3	f	\N	50	\N
753	3	Укротитель Иксов	Специалист — 400 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.740242+03	NONE	400	MATH_CAT_EQUATIONS	MATH	4	f	\N	85	\N
754	3	Укротитель Иксов	Аналитик — 1000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.740243+03	NONE	1000	MATH_CAT_EQUATIONS	MATH	5	f	\N	130	\N
755	3	Укротитель Иксов	Эксперт — 2500 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.740244+03	NONE	2500	MATH_CAT_EQUATIONS	MATH	6	f	\N	190	\N
756	3	Укротитель Иксов	Мастер — 5000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.740245+03	NONE	5000	MATH_CAT_EQUATIONS	MATH	7	f	\N	270	\N
757	3	Укротитель Иксов	Гроссмейстер — 8000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.740246+03	NONE	8000	MATH_CAT_EQUATIONS	MATH	8	f	\N	370	\N
759	3	Укротитель Иксов	Легенда — 16000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.740247+03	NONE	16000	MATH_CAT_EQUATIONS	MATH	10	f	\N	660	\N
760	3	Укротитель Иксов	Математический Титан — 20000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.740248+03	NONE	20000	MATH_CAT_EQUATIONS	MATH	11	f	\N	860	\N
762	3	Арифметика в уме	Новичок — 50 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740253+03	NONE	50	MATH_CAT_ARITHMETIC	MATH	2	f	\N	25	\N
763	3	Арифметика в уме	Практик — 150 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740254+03	NONE	150	MATH_CAT_ARITHMETIC	MATH	3	f	\N	50	\N
764	3	Арифметика в уме	Специалист — 400 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740255+03	NONE	400	MATH_CAT_ARITHMETIC	MATH	4	f	\N	85	\N
765	3	Арифметика в уме	Аналитик — 1000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740261+03	NONE	1000	MATH_CAT_ARITHMETIC	MATH	5	f	\N	130	\N
766	3	Арифметика в уме	Эксперт — 2500 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740262+03	NONE	2500	MATH_CAT_ARITHMETIC	MATH	6	f	\N	190	\N
767	3	Арифметика в уме	Мастер — 5000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740263+03	NONE	5000	MATH_CAT_ARITHMETIC	MATH	7	f	\N	270	\N
768	3	Арифметика в уме	Гроссмейстер — 8000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740264+03	NONE	8000	MATH_CAT_ARITHMETIC	MATH	8	f	\N	370	\N
769	3	Арифметика в уме	Магистр — 12000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740265+03	NONE	12000	MATH_CAT_ARITHMETIC	MATH	9	f	\N	500	\N
770	3	Арифметика в уме	Легенда — 16000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740266+03	NONE	16000	MATH_CAT_ARITHMETIC	MATH	10	f	\N	660	\N
771	3	Арифметика в уме	Математический Титан — 20000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 17:06:23.740267+03	NONE	20000	MATH_CAT_ARITHMETIC	MATH	11	f	\N	860	\N
772	3	Король Пропорций	Стажер — 10 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.740271+03	NONE	10	MATH_CAT_MULTDIV	MATH	1	f	\N	10	\N
773	3	Король Пропорций	Новичок — 50 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.740272+03	NONE	50	MATH_CAT_MULTDIV	MATH	2	f	\N	25	\N
774	3	Король Пропорций	Практик — 150 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.740273+03	NONE	150	MATH_CAT_MULTDIV	MATH	3	f	\N	50	\N
775	3	Король Пропорций	Специалист — 400 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.740274+03	NONE	400	MATH_CAT_MULTDIV	MATH	4	f	\N	85	\N
776	3	Король Пропорций	Аналитик — 1000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.740275+03	NONE	1000	MATH_CAT_MULTDIV	MATH	5	f	\N	130	\N
777	3	Король Пропорций	Эксперт — 2500 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.740276+03	NONE	2500	MATH_CAT_MULTDIV	MATH	6	f	\N	190	\N
778	3	Король Пропорций	Мастер — 5000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.740277+03	NONE	5000	MATH_CAT_MULTDIV	MATH	7	f	\N	270	\N
779	3	Король Пропорций	Гроссмейстер — 8000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.74028+03	NONE	8000	MATH_CAT_MULTDIV	MATH	8	f	\N	370	\N
780	3	Король Пропорций	Магистр — 12000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.740281+03	NONE	12000	MATH_CAT_MULTDIV	MATH	9	f	\N	500	\N
781	3	Король Пропорций	Легенда — 16000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.740283+03	NONE	16000	MATH_CAT_MULTDIV	MATH	10	f	\N	660	\N
782	3	Король Пропорций	Математический Титан — 20000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 17:06:23.740284+03	NONE	20000	MATH_CAT_MULTDIV	MATH	11	f	\N	860	\N
783	3	Сила в Кубе	Стажер — 10 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.740287+03	NONE	10	MATH_CAT_POWER	MATH	1	f	\N	10	\N
784	3	Сила в Кубе	Новичок — 50 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.740288+03	NONE	50	MATH_CAT_POWER	MATH	2	f	\N	25	\N
785	3	Сила в Кубе	Практик — 150 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.740289+03	NONE	150	MATH_CAT_POWER	MATH	3	f	\N	50	\N
786	3	Сила в Кубе	Специалист — 400 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.74029+03	NONE	400	MATH_CAT_POWER	MATH	4	f	\N	85	\N
787	3	Сила в Кубе	Аналитик — 1000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.740291+03	NONE	1000	MATH_CAT_POWER	MATH	5	f	\N	130	\N
788	3	Сила в Кубе	Эксперт — 2500 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.740292+03	NONE	2500	MATH_CAT_POWER	MATH	6	f	\N	190	\N
789	3	Сила в Кубе	Мастер — 5000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.740293+03	NONE	5000	MATH_CAT_POWER	MATH	7	f	\N	270	\N
790	3	Сила в Кубе	Гроссмейстер — 8000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.740293+03	NONE	8000	MATH_CAT_POWER	MATH	8	f	\N	370	\N
791	3	Сила в Кубе	Магистр — 12000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.740295+03	NONE	12000	MATH_CAT_POWER	MATH	9	f	\N	500	\N
792	3	Сила в Кубе	Легенда — 16000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.740295+03	NONE	16000	MATH_CAT_POWER	MATH	10	f	\N	660	\N
793	3	Сила в Кубе	Математический Титан — 20000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 17:06:23.740296+03	NONE	20000	MATH_CAT_POWER	MATH	11	f	\N	860	\N
794	3	Извлекатель Корней	Стажер — 10 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.7403+03	NONE	10	MATH_CAT_ROOT	MATH	1	f	\N	10	\N
795	3	Извлекатель Корней	Новичок — 50 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.740301+03	NONE	50	MATH_CAT_ROOT	MATH	2	f	\N	25	\N
796	3	Извлекатель Корней	Практик — 150 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.740303+03	NONE	150	MATH_CAT_ROOT	MATH	3	f	\N	50	\N
797	3	Извлекатель Корней	Специалист — 400 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.740304+03	NONE	400	MATH_CAT_ROOT	MATH	4	f	\N	85	\N
798	3	Извлекатель Корней	Аналитик — 1000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.740305+03	NONE	1000	MATH_CAT_ROOT	MATH	5	f	\N	130	\N
799	3	Извлекатель Корней	Эксперт — 2500 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.740306+03	NONE	2500	MATH_CAT_ROOT	MATH	6	f	\N	190	\N
800	3	Извлекатель Корней	Мастер — 5000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.740307+03	NONE	5000	MATH_CAT_ROOT	MATH	7	f	\N	270	\N
801	3	Извлекатель Корней	Гроссмейстер — 8000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.740308+03	NONE	8000	MATH_CAT_ROOT	MATH	8	f	\N	370	\N
802	3	Извлекатель Корней	Магистр — 12000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.740309+03	NONE	12000	MATH_CAT_ROOT	MATH	9	f	\N	500	\N
803	3	Извлекатель Корней	Легенда — 16000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.740312+03	NONE	16000	MATH_CAT_ROOT	MATH	10	f	\N	660	\N
804	3	Извлекатель Корней	Математический Титан — 20000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 17:06:23.740313+03	NONE	20000	MATH_CAT_ROOT	MATH	11	f	\N	860	\N
805	3	Повелитель Долей	Стажер — 10 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.740317+03	NONE	10	MATH_CAT_FRACTIONS	MATH	1	f	\N	10	\N
806	3	Повелитель Долей	Новичок — 50 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.740318+03	NONE	50	MATH_CAT_FRACTIONS	MATH	2	f	\N	25	\N
807	3	Повелитель Долей	Практик — 150 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.740319+03	NONE	150	MATH_CAT_FRACTIONS	MATH	3	f	\N	50	\N
808	3	Повелитель Долей	Специалист — 400 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.74032+03	NONE	400	MATH_CAT_FRACTIONS	MATH	4	f	\N	85	\N
809	3	Повелитель Долей	Аналитик — 1000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.74032+03	NONE	1000	MATH_CAT_FRACTIONS	MATH	5	f	\N	130	\N
810	3	Повелитель Долей	Эксперт — 2500 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.740321+03	NONE	2500	MATH_CAT_FRACTIONS	MATH	6	f	\N	190	\N
811	3	Повелитель Долей	Мастер — 5000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.740322+03	NONE	5000	MATH_CAT_FRACTIONS	MATH	7	f	\N	270	\N
812	3	Повелитель Долей	Гроссмейстер — 8000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.740323+03	NONE	8000	MATH_CAT_FRACTIONS	MATH	8	f	\N	370	\N
813	3	Повелитель Долей	Магистр — 12000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.740324+03	NONE	12000	MATH_CAT_FRACTIONS	MATH	9	f	\N	500	\N
403	1	Хардкорщик	Успешно решить карточку уровня «Хард».	🔥	0.00	2026-11-07 21:38:42.927665+03	MATH_CARD_LVL_EXTREME	1	MATH_CARD_LVL_EXTREME	MATH	0	f	\N	130	\N
404	1	Олимпийский запас	Успешно решить олимпиадную карточку.	🏆	0.00	2026-11-07 21:38:42.928033+03	MATH_CARD_LVL_OLYMPIAD	1	MATH_CARD_LVL_OLYMPIAD	MATH	0	f	\N	130	\N
814	3	Повелитель Долей	Легенда — 16000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.740325+03	NONE	16000	MATH_CAT_FRACTIONS	MATH	10	f	\N	660	\N
815	3	Повелитель Долей	Математический Титан — 20000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 17:06:23.740326+03	NONE	20000	MATH_CAT_FRACTIONS	MATH	11	f	\N	860	\N
816	3	Геометрический Гений	Стажер — 10 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.740333+03	NONE	10	MATH_CAT_GEOMETRY	MATH	1	f	\N	10	\N
817	3	Геометрический Гений	Новичок — 50 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.740334+03	NONE	50	MATH_CAT_GEOMETRY	MATH	2	f	\N	25	\N
818	3	Геометрический Гений	Практик — 150 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.740334+03	NONE	150	MATH_CAT_GEOMETRY	MATH	3	f	\N	50	\N
819	3	Геометрический Гений	Специалист — 400 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.740335+03	NONE	400	MATH_CAT_GEOMETRY	MATH	4	f	\N	85	\N
820	3	Геометрический Гений	Аналитик — 1000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.740336+03	NONE	1000	MATH_CAT_GEOMETRY	MATH	5	f	\N	130	\N
821	3	Геометрический Гений	Эксперт — 2500 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.740337+03	NONE	2500	MATH_CAT_GEOMETRY	MATH	6	f	\N	190	\N
822	3	Геометрический Гений	Мастер — 5000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.740338+03	NONE	5000	MATH_CAT_GEOMETRY	MATH	7	f	\N	270	\N
824	3	Геометрический Гений	Магистр — 12000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.74034+03	NONE	12000	MATH_CAT_GEOMETRY	MATH	9	f	\N	500	\N
825	3	Геометрический Гений	Легенда — 16000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.740341+03	NONE	16000	MATH_CAT_GEOMETRY	MATH	10	f	\N	660	\N
826	3	Геометрический Гений	Математический Титан — 20000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.740342+03	NONE	20000	MATH_CAT_GEOMETRY	MATH	11	f	\N	860	\N
827	3	Легкая прогулка	Стажер — 1 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.740534+03	MATH_CARD_DONE_EASY	1	MATH_CAT_CARD_EASY	MATH	1	f	\N	10	\N
828	3	Легкая прогулка	Новичок — 3 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.740536+03	MATH_CARD_DONE_EASY	3	MATH_CAT_CARD_EASY	MATH	2	f	\N	25	\N
829	3	Легкая прогулка	Практик — 6 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.740537+03	MATH_CARD_DONE_EASY	6	MATH_CAT_CARD_EASY	MATH	3	f	\N	50	\N
830	3	Легкая прогулка	Специалист — 10 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.740545+03	MATH_CARD_DONE_EASY	10	MATH_CAT_CARD_EASY	MATH	4	f	\N	85	\N
831	3	Легкая прогулка	Аналитик — 15 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.740546+03	MATH_CARD_DONE_EASY	15	MATH_CAT_CARD_EASY	MATH	5	f	\N	130	\N
832	3	Легкая прогулка	Эксперт — 21 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.740546+03	MATH_CARD_DONE_EASY	21	MATH_CAT_CARD_EASY	MATH	6	f	\N	190	\N
1053	4	Марафонец страниц	Выносливый чтец — 5000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626443+03	READING_PAGES	5000	READING_PAGES	READING	5	f	\N	130	\N
833	3	Легкая прогулка	Мастер — 28 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.740547+03	MATH_CARD_DONE_EASY	28	MATH_CAT_CARD_EASY	MATH	7	f	\N	270	\N
834	3	Легкая прогулка	Гроссмейстер — 36 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.740548+03	MATH_CARD_DONE_EASY	36	MATH_CAT_CARD_EASY	MATH	8	f	\N	370	\N
835	3	Легкая прогулка	Магистр — 45 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.740549+03	MATH_CARD_DONE_EASY	45	MATH_CAT_CARD_EASY	MATH	9	f	\N	500	\N
836	3	Легкая прогулка	Легенда — 55 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.740549+03	MATH_CARD_DONE_EASY	55	MATH_CAT_CARD_EASY	MATH	10	f	\N	660	\N
837	3	Легкая прогулка	Математический Титан — 66 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 17:06:23.74055+03	MATH_CARD_DONE_EASY	66	MATH_CAT_CARD_EASY	MATH	11	f	\N	860	\N
838	3	Крепкий орешек	Стажер — 1 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.740582+03	MATH_CARD_DONE_MEDIUM	1	MATH_CAT_CARD_MEDIUM	MATH	1	f	\N	10	\N
839	3	Крепкий орешек	Новичок — 3 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.740583+03	MATH_CARD_DONE_MEDIUM	3	MATH_CAT_CARD_MEDIUM	MATH	2	f	\N	25	\N
840	3	Крепкий орешек	Практик — 6 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.740584+03	MATH_CARD_DONE_MEDIUM	6	MATH_CAT_CARD_MEDIUM	MATH	3	f	\N	50	\N
841	3	Крепкий орешек	Специалист — 10 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.740585+03	MATH_CARD_DONE_MEDIUM	10	MATH_CAT_CARD_MEDIUM	MATH	4	f	\N	85	\N
842	3	Крепкий орешек	Аналитик — 15 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.740586+03	MATH_CARD_DONE_MEDIUM	15	MATH_CAT_CARD_MEDIUM	MATH	5	f	\N	130	\N
844	3	Крепкий орешек	Мастер — 28 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.740587+03	MATH_CARD_DONE_MEDIUM	28	MATH_CAT_CARD_MEDIUM	MATH	7	f	\N	270	\N
845	3	Крепкий орешек	Гроссмейстер — 36 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.740588+03	MATH_CARD_DONE_MEDIUM	36	MATH_CAT_CARD_MEDIUM	MATH	8	f	\N	370	\N
846	3	Крепкий орешек	Магистр — 45 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.740588+03	MATH_CARD_DONE_MEDIUM	45	MATH_CAT_CARD_MEDIUM	MATH	9	f	\N	500	\N
847	3	Крепкий орешек	Легенда — 55 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.740589+03	MATH_CARD_DONE_MEDIUM	55	MATH_CAT_CARD_MEDIUM	MATH	10	f	\N	660	\N
848	3	Крепкий орешек	Математический Титан — 66 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.74059+03	MATH_CARD_DONE_MEDIUM	66	MATH_CAT_CARD_MEDIUM	MATH	11	f	\N	860	\N
849	3	Высокий полёт	Стажер — 1 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740596+03	MATH_CARD_DONE_HIGH	1	MATH_CAT_CARD_HIGH	MATH	1	f	\N	10	\N
850	3	Высокий полёт	Новичок — 3 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740597+03	MATH_CARD_DONE_HIGH	3	MATH_CAT_CARD_HIGH	MATH	2	f	\N	25	\N
851	3	Высокий полёт	Практик — 6 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740598+03	MATH_CARD_DONE_HIGH	6	MATH_CAT_CARD_HIGH	MATH	3	f	\N	50	\N
852	3	Высокий полёт	Специалист — 10 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740602+03	MATH_CARD_DONE_HIGH	10	MATH_CAT_CARD_HIGH	MATH	4	f	\N	85	\N
853	3	Высокий полёт	Аналитик — 15 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740603+03	MATH_CARD_DONE_HIGH	15	MATH_CAT_CARD_HIGH	MATH	5	f	\N	130	\N
854	3	Высокий полёт	Эксперт — 21 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740603+03	MATH_CARD_DONE_HIGH	21	MATH_CAT_CARD_HIGH	MATH	6	f	\N	190	\N
427	1	Шеф-мойщик	Стажер — 5 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-07 21:38:42.971551+03	NONE	5	HOUSE_CAT_DISHES	HOUSE	1	f	\N	10	\N
472	1	Эко-патруль	Новичок — 20 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.97162+03	NONE	20	HOUSE_CAT_TRASH	HOUSE	2	f	\N	25	\N
75	1	Детектив с лупой · Детективы	Магистр — 30 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.848663+03	READING_GENRE_DETECTIVE	30	READING_GENRE_DETECTIVE	READING	9	f	\N	500	\N
855	3	Высокий полёт	Мастер — 28 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740604+03	MATH_CARD_DONE_HIGH	28	MATH_CAT_CARD_HIGH	MATH	7	f	\N	270	\N
25	1	Литературный турист	Любопытный путник — 3 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.84776+03	READING_GENRES	3	READING_GENRES	READING	3	f	\N	50	\N
856	3	Высокий полёт	Гроссмейстер — 36 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740605+03	MATH_CARD_DONE_HIGH	36	MATH_CAT_CARD_HIGH	MATH	8	f	\N	370	\N
857	3	Высокий полёт	Магистр — 45 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740605+03	MATH_CARD_DONE_HIGH	45	MATH_CAT_CARD_HIGH	MATH	9	f	\N	500	\N
858	3	Высокий полёт	Легенда — 55 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740606+03	MATH_CARD_DONE_HIGH	55	MATH_CAT_CARD_HIGH	MATH	10	f	\N	660	\N
859	3	Высокий полёт	Математический Титан — 66 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 17:06:23.740607+03	MATH_CARD_DONE_HIGH	66	MATH_CAT_CARD_HIGH	MATH	11	f	\N	860	\N
862	3	Зона хардкора	Практик — 6 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740613+03	MATH_CARD_DONE_HARD	6	MATH_CAT_CARD_HARD	MATH	3	f	\N	50	\N
863	3	Зона хардкора	Специалист — 10 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740614+03	MATH_CARD_DONE_HARD	10	MATH_CAT_CARD_HARD	MATH	4	f	\N	85	\N
864	3	Зона хардкора	Аналитик — 15 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740615+03	MATH_CARD_DONE_HARD	15	MATH_CAT_CARD_HARD	MATH	5	f	\N	130	\N
865	3	Зона хардкора	Эксперт — 21 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740615+03	MATH_CARD_DONE_HARD	21	MATH_CAT_CARD_HARD	MATH	6	f	\N	190	\N
677	3	Ловец рифм · Поэзия	Легенда — 35 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.640742+03	READING_GENRE_POETRY	35	READING_GENRE_POETRY	READING	10	f	\N	660	\N
866	3	Зона хардкора	Мастер — 28 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740616+03	MATH_CARD_DONE_HARD	28	MATH_CAT_CARD_HARD	MATH	7	f	\N	270	\N
867	3	Зона хардкора	Гроссмейстер — 36 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740617+03	MATH_CARD_DONE_HARD	36	MATH_CAT_CARD_HARD	MATH	8	f	\N	370	\N
868	3	Зона хардкора	Магистр — 45 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740617+03	MATH_CARD_DONE_HARD	45	MATH_CAT_CARD_HARD	MATH	9	f	\N	500	\N
869	3	Зона хардкора	Легенда — 55 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740618+03	MATH_CARD_DONE_HARD	55	MATH_CAT_CARD_HARD	MATH	10	f	\N	660	\N
870	3	Зона хардкора	Математический Титан — 66 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740619+03	MATH_CARD_DONE_HARD	66	MATH_CAT_CARD_HARD	MATH	11	f	\N	860	\N
871	3	Хардкор-экстрим	Стажер — 1 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740626+03	MATH_CARD_DONE_EXTREME	1	MATH_CAT_CARD_EXTREME	MATH	1	f	\N	10	\N
872	3	Хардкор-экстрим	Новичок — 3 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740632+03	MATH_CARD_DONE_EXTREME	3	MATH_CAT_CARD_EXTREME	MATH	2	f	\N	25	\N
18	1	Книжный червь	Книжный гроссмейстер — 120 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.847724+03	READING_BOOKS	120	READING_BOOKS	READING	7	f	\N	270	\N
873	3	Хардкор-экстрим	Практик — 6 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740633+03	MATH_CARD_DONE_EXTREME	6	MATH_CAT_CARD_EXTREME	MATH	3	f	\N	50	\N
337	1	Зона хардкора	Новичок — 3 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.927507+03	MATH_CARD_DONE_HARD	3	MATH_CAT_CARD_HARD	MATH	2	f	\N	25	\N
874	3	Хардкор-экстрим	Специалист — 10 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740633+03	MATH_CARD_DONE_EXTREME	10	MATH_CAT_CARD_EXTREME	MATH	4	f	\N	85	\N
1054	4	Марафонец страниц	Марафонец — 10000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626444+03	READING_PAGES	10000	READING_PAGES	READING	6	f	\N	190	\N
26	1	Литературный турист	Смелый первопроходец — 4 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.847762+03	READING_GENRES	4	READING_GENRES	READING	4	f	\N	85	\N
875	3	Хардкор-экстрим	Аналитик — 15 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740634+03	MATH_CARD_DONE_EXTREME	15	MATH_CAT_CARD_EXTREME	MATH	5	f	\N	130	\N
876	3	Хардкор-экстрим	Эксперт — 21 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740635+03	MATH_CARD_DONE_EXTREME	21	MATH_CAT_CARD_EXTREME	MATH	6	f	\N	190	\N
877	3	Хардкор-экстрим	Мастер — 28 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740636+03	MATH_CARD_DONE_EXTREME	28	MATH_CAT_CARD_EXTREME	MATH	7	f	\N	270	\N
559	3	Покоритель циклов	Собиратель трилогий — 2 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.64034+03	READING_SERIES	2	READING_SERIES	READING	2	f	\N	25	\N
878	3	Хардкор-экстрим	Гроссмейстер — 36 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740636+03	MATH_CARD_DONE_EXTREME	36	MATH_CAT_CARD_EXTREME	MATH	8	f	\N	370	\N
879	3	Хардкор-экстрим	Магистр — 45 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740637+03	MATH_CARD_DONE_EXTREME	45	MATH_CAT_CARD_EXTREME	MATH	9	f	\N	500	\N
880	3	Хардкор-экстрим	Легенда — 55 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740638+03	MATH_CARD_DONE_EXTREME	55	MATH_CAT_CARD_EXTREME	MATH	10	f	\N	660	\N
881	3	Хардкор-экстрим	Математический Титан — 66 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 17:06:23.740639+03	MATH_CARD_DONE_EXTREME	66	MATH_CAT_CARD_EXTREME	MATH	11	f	\N	860	\N
882	3	Олимпийская вершина	Стажер — 1 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.740644+03	MATH_CARD_DONE_OLYMPIAD	1	MATH_CAT_CARD_OLYMPIAD	MATH	1	f	\N	10	\N
883	3	Олимпийская вершина	Новичок — 2 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.740645+03	MATH_CARD_DONE_OLYMPIAD	2	MATH_CAT_CARD_OLYMPIAD	MATH	2	f	\N	25	\N
884	3	Олимпийская вершина	Практик — 3 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.740646+03	MATH_CARD_DONE_OLYMPIAD	3	MATH_CAT_CARD_OLYMPIAD	MATH	3	f	\N	50	\N
885	3	Олимпийская вершина	Специалист — 5 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.740646+03	MATH_CARD_DONE_OLYMPIAD	5	MATH_CAT_CARD_OLYMPIAD	MATH	4	f	\N	85	\N
886	3	Олимпийская вершина	Аналитик — 7 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.740647+03	MATH_CARD_DONE_OLYMPIAD	7	MATH_CAT_CARD_OLYMPIAD	MATH	5	f	\N	130	\N
887	3	Олимпийская вершина	Эксперт — 10 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.740648+03	MATH_CARD_DONE_OLYMPIAD	10	MATH_CAT_CARD_OLYMPIAD	MATH	6	f	\N	190	\N
888	3	Олимпийская вершина	Мастер — 13 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.740648+03	MATH_CARD_DONE_OLYMPIAD	13	MATH_CAT_CARD_OLYMPIAD	MATH	7	f	\N	270	\N
889	3	Олимпийская вершина	Гроссмейстер — 17 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.740649+03	MATH_CARD_DONE_OLYMPIAD	17	MATH_CAT_CARD_OLYMPIAD	MATH	8	f	\N	370	\N
890	3	Олимпийская вершина	Магистр — 21 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.74065+03	MATH_CARD_DONE_OLYMPIAD	21	MATH_CAT_CARD_OLYMPIAD	MATH	9	f	\N	500	\N
891	3	Олимпийская вершина	Легенда — 26 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.740651+03	MATH_CARD_DONE_OLYMPIAD	26	MATH_CAT_CARD_OLYMPIAD	MATH	10	f	\N	660	\N
1055	4	Марафонец страниц	Железный читатель — 20000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626445+03	READING_PAGES	20000	READING_PAGES	READING	7	f	\N	270	\N
892	3	Олимпийская вершина	Математический Титан — 33 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 17:06:23.740651+03	MATH_CARD_DONE_OLYMPIAD	33	MATH_CAT_CARD_OLYMPIAD	MATH	11	f	\N	860	\N
76	1	Детектив с лупой · Детективы	Легенда — 35 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.848665+03	READING_GENRE_DETECTIVE	35	READING_GENRE_DETECTIVE	READING	10	f	\N	660	\N
893	3	Главный босс школы	Покоритель ВПР — сдать Всероссийские проверочные работы по математике на максимальный балл:\nВПР за 4 класс (базовая арифметика и логика)\nВПР за 5 класс (дроби и основы геометрии)\nВПР за 6 класс (отрицательные числа, пропорции)\nВПР за 7 класс (начало алгебры и геометрии)\nВПР за 8 класс (функции, системы, теоремы)	🛡️	0.00	2026-11-08 17:06:23.740662+03	NONE	0	MATH_QUEST_VPR	MATH	0	f	\N	130	\N
894	3	Олимпийский резерв	Успешно поучаствовать в школьных или онлайн-олимпиадах:\nШкольный этап Всероссийской олимпиады\nОлимпиада «Кенгуру» (или аналогичная)\nНабрать более 80% правильных ответов в любом олимпиадном туре	🎪	0.00	2026-11-08 17:06:23.74067+03	NONE	0	MATH_QUEST_OLYMP	MATH	0	f	\N	130	\N
895	3	Звездная Карта	Карточки особого уровня — решить 5 уникальных нестандартных задач повышенной сложности:\nОсобая карточка №1\nОсобая карточка №2\nОсобая карточка №3\nОсобая карточка №4\nОсобая карточка №5	⭐	0.00	2026-11-08 17:06:23.740674+03	NONE	0	MATH_QUEST_STAR	MATH	0	f	\N	130	\N
896	3	Математический универсал	Правильно решить за один день хотя бы по одному заданию из 6 разных тем (уравнение, текстовая задача, пример на скорость, дробь, геометрия, степень).	🔮	0.00	2026-11-08 17:06:23.740677+03	NONE	0	MATH_UNIVERSAL	MATH	0	f	\N	130	\N
898	3	Быстрее калькулятора	Решить 20 простых примеров на умножение/деление в уме меньше чем за 1 минуту.	⏱️	0.00	2026-11-08 17:06:23.740688+03	NONE	0	MATH_FAST	MATH	0	f	\N	130	\N
44	1	Покоритель циклов	Властелин Книжных Вселенных — 25 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.847849+03	READING_SERIES	25	READING_SERIES	READING	11	f	\N	860	\N
48	1	Мастер заклинаний · Фэнтези	Специалист — 8 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.848574+03	READING_GENRE_FANTASY	8	READING_GENRE_FANTASY	READING	4	f	\N	85	\N
899	3	Юный профессор	Объяснить родителю или другу, как решается сложное уравнение или задача, так, чтобы они всё поняли.	👨‍🏫	0.00	2026-11-08 17:06:23.740691+03	NONE	0	MATH_PROF	MATH	0	f	\N	130	\N
900	3	Вычислительный стрик	Заниматься математикой и решать не менее 15 примеров каждый день в течение 21 дня без перерывов.	🔥	0.00	2026-11-08 17:06:23.740694+03	MATH_STREAK	21	MATH_STREAK	MATH	0	f	\N	130	\N
901	3	Детектив ошибок	Найти ошибку в чужом решении (или специально допущенную родителем ошибку в примере) и исправить её.	🔎	0.00	2026-11-08 17:06:23.740699+03	NONE	0	MATH_ERR_DETECT	MATH	0	f	\N	130	\N
902	3	Идеальный черновик	Исписать целую тетрадь в клетку аккуратными вычислениями без единой вырванной страницы.	📓	0.00	2026-11-08 17:06:23.740702+03	NONE	0	MATH_NOTEBOOK	MATH	0	f	\N	130	\N
903	3	Циркуль-мастер	Построить идеальный геометрический чертёж с помощью линейки и циркуля без помарок с первой попытки.	📐	0.00	2026-11-08 17:06:23.740704+03	NONE	0	MATH_COMPASS	MATH	0	f	\N	130	\N
904	3	Карточный стратег	Первая пара — 3 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740722+03	MATH_CARD_SUCCESS	3	MATH_CARD_DAY	MATH	1	f	\N	10	\N
515	1	Ультимативный Геймер	Купить комбо для отдыха:\nТелевизор 📺\nИгровая приставка 🎮\nКресло-мешок или пуфик 🛋️	🎮	0.00	2026-11-07 21:38:42.971692+03	NONE	0	HOUSE_SET_GAMER	HOUSE	0	f	\N	130	\N
906	3	Карточный стратег	Десятка за картами — 25 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740723+03	MATH_CARD_SUCCESS	25	MATH_CARD_DAY	MATH	3	f	\N	50	\N
907	3	Карточный стратег	Пятидесятый рубеж — 50 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740724+03	MATH_CARD_SUCCESS	50	MATH_CARD_DAY	MATH	4	f	\N	85	\N
908	3	Карточный стратег	Карточный ветеран — 80 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740725+03	MATH_CARD_SUCCESS	80	MATH_CARD_DAY	MATH	5	f	\N	130	\N
909	3	Карточный стратег	Штурман колоды — 120 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740725+03	MATH_CARD_SUCCESS	120	MATH_CARD_DAY	MATH	6	f	\N	190	\N
910	3	Карточный стратег	Сто семьдесят — 170 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740726+03	MATH_CARD_SUCCESS	170	MATH_CARD_DAY	MATH	7	f	\N	270	\N
911	3	Карточный стратег	Мастер колоды — 230 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740727+03	MATH_CARD_SUCCESS	230	MATH_CARD_DAY	MATH	8	f	\N	370	\N
913	3	Карточный стратег	Гроссмейстер карт — 380 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740728+03	MATH_CARD_SUCCESS	380	MATH_CARD_DAY	MATH	10	f	\N	660	\N
914	3	Карточный стратег	Повелитель Карточной Колоды — 450 карточек.\nУспешно решённые ежедневные карточки «Математика» (80%+ верных ответов).	🃏	0.00	2026-11-08 17:06:23.740729+03	MATH_CARD_SUCCESS	450	MATH_CARD_DAY	MATH	11	f	\N	860	\N
916	3	Карточный марафонец	Неделя в строю — 7 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740741+03	MATH_CARD_STREAK	7	MATH_CARD_STREAK	MATH	2	f	\N	25	\N
918	3	Карточный марафонец	Три недели упорства — 21 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740743+03	MATH_CARD_STREAK	21	MATH_CARD_STREAK	MATH	4	f	\N	85	\N
919	3	Карточный марафонец	Месяц математики — 30 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740743+03	MATH_CARD_STREAK	30	MATH_CARD_STREAK	MATH	5	f	\N	130	\N
920	3	Карточный марафонец	Полтора месяца — 45 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740744+03	MATH_CARD_STREAK	45	MATH_CARD_STREAK	MATH	6	f	\N	190	\N
921	3	Карточный марафонец	Два месяца — 60 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740745+03	MATH_CARD_STREAK	60	MATH_CARD_STREAK	MATH	7	f	\N	270	\N
922	3	Карточный марафонец	Квартал без остановки — 90 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740745+03	MATH_CARD_STREAK	90	MATH_CARD_STREAK	MATH	8	f	\N	370	\N
924	3	Карточный марафонец	Полгода точности — 180 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740747+03	MATH_CARD_STREAK	180	MATH_CARD_STREAK	MATH	10	f	\N	660	\N
925	3	Карточный марафонец	Год точных наук — 365 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740748+03	MATH_CARD_STREAK	365	MATH_CARD_STREAK	MATH	11	f	\N	860	\N
929	3	Магистр Чистоты	Гость в собственном доме — 50 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.795687+03	HOUSE_ROOM_POINTS	50	HOUSE_CLEAN_POINTS	HOUSE	1	f	\N	10	\N
930	3	Магистр Чистоты	Борьба с пылью — 250 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.795689+03	HOUSE_ROOM_POINTS	250	HOUSE_CLEAN_POINTS	HOUSE	2	f	\N	25	\N
931	3	Магистр Чистоты	Видимый пол — 600 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.795689+03	HOUSE_ROOM_POINTS	600	HOUSE_CLEAN_POINTS	HOUSE	3	f	\N	50	\N
932	3	Магистр Чистоты	Аккуратный жилец — 1200 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.79569+03	HOUSE_ROOM_POINTS	1200	HOUSE_CLEAN_POINTS	HOUSE	4	f	\N	85	\N
933	3	Магистр Чистоты	Хранитель уюта — 2000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.79569+03	HOUSE_ROOM_POINTS	2000	HOUSE_CLEAN_POINTS	HOUSE	5	f	\N	130	\N
934	3	Магистр Чистоты	Эксперт клининга — 3000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.795691+03	HOUSE_ROOM_POINTS	3000	HOUSE_CLEAN_POINTS	HOUSE	6	f	\N	190	\N
935	3	Магистр Чистоты	Гроза беспорядка — 4200 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.795691+03	HOUSE_ROOM_POINTS	4200	HOUSE_CLEAN_POINTS	HOUSE	7	f	\N	270	\N
936	3	Магистр Чистоты	Эстетичный хозяин — 5500 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.795692+03	HOUSE_ROOM_POINTS	5500	HOUSE_CLEAN_POINTS	HOUSE	8	f	\N	370	\N
915	3	Карточный марафонец	Разминка — 3 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740741+03	MATH_CARD_STREAK	3	MATH_CARD_STREAK	MATH	1	f	\N	10	\N
937	3	Магистр Чистоты	Остров безупречности — 7000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.795692+03	HOUSE_ROOM_POINTS	7000	HOUSE_CLEAN_POINTS	HOUSE	9	f	\N	500	\N
938	3	Магистр Чистоты	Перфекционист — 8500 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.795693+03	HOUSE_ROOM_POINTS	8500	HOUSE_CLEAN_POINTS	HOUSE	10	f	\N	660	\N
897	3	Убийца гигантов	Безошибочно решить пример, в котором больше 10 действий (со скобками, умножением и делением).	🦖	0.00	2026-11-08 17:06:23.740684+03	NONE	0	MATH_GIANT	MATH	0	f	\N	130	\N
1164	4	Шепот в темноте · Ужасы и мистика	Эксперт — 16 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.632798+03	READING_GENRE_HORROR	16	READING_GENRE_HORROR	READING	6	f	\N	190	\N
939	3	Магистр Чистоты	Абсолютный Повелитель Чистоты — 10000 баллов.\nНакопленные баллы за порядок в СВОЕЙ комнате. Идеальный темп — около 700–1000 баллов в год.	🧹	0.00	2026-11-08 17:06:23.795693+03	HOUSE_ROOM_POINTS	10000	HOUSE_CLEAN_POINTS	HOUSE	11	f	\N	860	\N
940	3	Незаменимый помощник	Разовая услуга — 50 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795714+03	HOUSE_HELP_POINTS	50	HOUSE_HELP_POINTS	HOUSE	1	f	\N	10	\N
941	3	Незаменимый помощник	Полезный союзник — 200 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795715+03	HOUSE_HELP_POINTS	200	HOUSE_HELP_POINTS	HOUSE	2	f	\N	25	\N
942	3	Незаменимый помощник	Семейная опора — 500 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795715+03	HOUSE_HELP_POINTS	500	HOUSE_HELP_POINTS	HOUSE	3	f	\N	50	\N
943	3	Незаменимый помощник	Мастер на все руки — 1000 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795716+03	HOUSE_HELP_POINTS	1000	HOUSE_HELP_POINTS	HOUSE	4	f	\N	85	\N
1040	3	Кибер-оазис	Собрать идеальное рабочее место:\nКомпьютер или ноутбук 💻\nУмный свет для стола 💡\nУдобное кресло 💺	🧠	0.00	2026-11-08 17:06:23.795867+03	NONE	0	HOUSE_SET_CYBER	HOUSE	0	f	\N	130	\N
944	3	Незаменимый помощник	Менеджер комфорта — 1800 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795716+03	HOUSE_HELP_POINTS	1800	HOUSE_HELP_POINTS	HOUSE	5	f	\N	130	\N
945	3	Незаменимый помощник	Хранитель домашнего очага — 2800 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795717+03	HOUSE_HELP_POINTS	2800	HOUSE_HELP_POINTS	HOUSE	6	f	\N	190	\N
947	3	Незаменимый помощник	Правая рука семьи — 5300 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795717+03	HOUSE_HELP_POINTS	5300	HOUSE_HELP_POINTS	HOUSE	8	f	\N	370	\N
948	3	Незаменимый помощник	Шеф-помощник — 6700 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795718+03	HOUSE_HELP_POINTS	6700	HOUSE_HELP_POINTS	HOUSE	9	f	\N	500	\N
1002	3	Эко-патруль	Магистр — 850 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795826+03	NONE	850	HOUSE_CAT_TRASH	HOUSE	8	f	\N	370	\N
949	3	Незаменимый помощник	Легенда кооперации — 8200 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795718+03	HOUSE_HELP_POINTS	8200	HOUSE_HELP_POINTS	HOUSE	10	f	\N	660	\N
950	3	Незаменимый помощник	Генеральный директор Уюта — 10000 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 17:06:23.795719+03	HOUSE_HELP_POINTS	10000	HOUSE_HELP_POINTS	HOUSE	11	f	\N	860	\N
951	3	Шеф-мойщик	Стажер — 5 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795784+03	NONE	5	HOUSE_CAT_DISHES	HOUSE	1	f	\N	10	\N
952	3	Шеф-мойщик	Новичок — 20 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795784+03	NONE	20	HOUSE_CAT_DISHES	HOUSE	2	f	\N	25	\N
953	3	Шеф-мойщик	Практик — 60 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795785+03	NONE	60	HOUSE_CAT_DISHES	HOUSE	3	f	\N	50	\N
954	3	Шеф-мойщик	Мастер — 120 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795785+03	NONE	120	HOUSE_CAT_DISHES	HOUSE	4	f	\N	85	\N
955	3	Шеф-мойщик	Шеф — 250 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795786+03	NONE	250	HOUSE_CAT_DISHES	HOUSE	5	f	\N	130	\N
956	3	Шеф-мойщик	Эксперт — 400 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795786+03	NONE	400	HOUSE_CAT_DISHES	HOUSE	6	f	\N	190	\N
957	3	Шеф-мойщик	Гроссмейстер — 600 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795787+03	NONE	600	HOUSE_CAT_DISHES	HOUSE	7	f	\N	270	\N
958	3	Шеф-мойщик	Магистр — 850 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795787+03	NONE	850	HOUSE_CAT_DISHES	HOUSE	8	f	\N	370	\N
959	3	Шеф-мойщик	Легенда быта — 1100 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795788+03	NONE	1100	HOUSE_CAT_DISHES	HOUSE	9	f	\N	500	\N
960	3	Шеф-мойщик	Хранитель очага — 1400 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795788+03	NONE	1400	HOUSE_CAT_DISHES	HOUSE	10	f	\N	660	\N
962	3	Повелитель швабры	Стажер — 5 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.795795+03	NONE	5	HOUSE_CAT_MOP	HOUSE	1	f	\N	10	\N
963	3	Повелитель швабры	Новичок — 20 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.795796+03	NONE	20	HOUSE_CAT_MOP	HOUSE	2	f	\N	25	\N
964	3	Повелитель швабры	Практик — 60 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.795796+03	NONE	60	HOUSE_CAT_MOP	HOUSE	3	f	\N	50	\N
965	3	Повелитель швабры	Мастер — 120 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.795799+03	NONE	120	HOUSE_CAT_MOP	HOUSE	4	f	\N	85	\N
966	3	Повелитель швабры	Шеф — 250 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.7958+03	NONE	250	HOUSE_CAT_MOP	HOUSE	5	f	\N	130	\N
967	3	Повелитель швабры	Эксперт — 400 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.7958+03	NONE	400	HOUSE_CAT_MOP	HOUSE	6	f	\N	190	\N
968	3	Повелитель швабры	Гроссмейстер — 600 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.795801+03	NONE	600	HOUSE_CAT_MOP	HOUSE	7	f	\N	270	\N
969	3	Повелитель швабры	Магистр — 850 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.795801+03	NONE	850	HOUSE_CAT_MOP	HOUSE	8	f	\N	370	\N
970	3	Повелитель швабры	Легенда быта — 1100 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.795801+03	NONE	1100	HOUSE_CAT_MOP	HOUSE	9	f	\N	500	\N
971	3	Повелитель швабры	Хранитель очага — 1400 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.795802+03	NONE	1400	HOUSE_CAT_MOP	HOUSE	10	f	\N	660	\N
972	3	Повелитель швабры	Генеральный директор Уюта — 1700 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 17:06:23.795802+03	NONE	1700	HOUSE_CAT_MOP	HOUSE	11	f	\N	860	\N
973	3	Стильный эксперт	Стажер — 5 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.795807+03	NONE	5	HOUSE_CAT_LAUNDRY	HOUSE	1	f	\N	10	\N
974	3	Стильный эксперт	Новичок — 20 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.795808+03	NONE	20	HOUSE_CAT_LAUNDRY	HOUSE	2	f	\N	25	\N
975	3	Стильный эксперт	Практик — 60 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.795808+03	NONE	60	HOUSE_CAT_LAUNDRY	HOUSE	3	f	\N	50	\N
976	3	Стильный эксперт	Мастер — 120 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.795809+03	NONE	120	HOUSE_CAT_LAUNDRY	HOUSE	4	f	\N	85	\N
977	3	Стильный эксперт	Шеф — 250 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.795809+03	NONE	250	HOUSE_CAT_LAUNDRY	HOUSE	5	f	\N	130	\N
978	3	Стильный эксперт	Эксперт — 400 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.79581+03	NONE	400	HOUSE_CAT_LAUNDRY	HOUSE	6	f	\N	190	\N
1056	4	Марафонец страниц	Ультрамарафонец — 35000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626446+03	READING_PAGES	35000	READING_PAGES	READING	8	f	\N	370	\N
980	3	Стильный эксперт	Магистр — 850 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.795811+03	NONE	850	HOUSE_CAT_LAUNDRY	HOUSE	8	f	\N	370	\N
982	3	Стильный эксперт	Хранитель очага — 1400 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.795812+03	NONE	1400	HOUSE_CAT_LAUNDRY	HOUSE	10	f	\N	660	\N
983	3	Стильный эксперт	Генеральный директор Уюта — 1700 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.795812+03	NONE	1700	HOUSE_CAT_LAUNDRY	HOUSE	11	f	\N	860	\N
985	3	Добытчик ресурсов	Новичок — 20 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795815+03	NONE	20	HOUSE_CAT_SHOPPING	HOUSE	2	f	\N	25	\N
986	3	Добытчик ресурсов	Практик — 60 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795816+03	NONE	60	HOUSE_CAT_SHOPPING	HOUSE	3	f	\N	50	\N
987	3	Добытчик ресурсов	Мастер — 120 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795816+03	NONE	120	HOUSE_CAT_SHOPPING	HOUSE	4	f	\N	85	\N
988	3	Добытчик ресурсов	Шеф — 250 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795817+03	NONE	250	HOUSE_CAT_SHOPPING	HOUSE	5	f	\N	130	\N
989	3	Добытчик ресурсов	Эксперт — 400 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795817+03	NONE	400	HOUSE_CAT_SHOPPING	HOUSE	6	f	\N	190	\N
990	3	Добытчик ресурсов	Гроссмейстер — 600 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795818+03	NONE	600	HOUSE_CAT_SHOPPING	HOUSE	7	f	\N	270	\N
991	3	Добытчик ресурсов	Магистр — 850 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795818+03	NONE	850	HOUSE_CAT_SHOPPING	HOUSE	8	f	\N	370	\N
992	3	Добытчик ресурсов	Легенда быта — 1100 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795819+03	NONE	1100	HOUSE_CAT_SHOPPING	HOUSE	9	f	\N	500	\N
993	3	Добытчик ресурсов	Хранитель очага — 1400 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795819+03	NONE	1400	HOUSE_CAT_SHOPPING	HOUSE	10	f	\N	660	\N
994	3	Добытчик ресурсов	Генеральный директор Уюта — 1700 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795819+03	NONE	1700	HOUSE_CAT_SHOPPING	HOUSE	11	f	\N	860	\N
996	3	Эко-патруль	Новичок — 20 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795823+03	NONE	20	HOUSE_CAT_TRASH	HOUSE	2	f	\N	25	\N
1061	4	Книжный червь	Книжный новобранец — 5 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627902+03	READING_BOOKS	5	READING_BOOKS	READING	2	f	\N	25	\N
997	3	Эко-патруль	Практик — 60 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795824+03	NONE	60	HOUSE_CAT_TRASH	HOUSE	3	f	\N	50	\N
998	3	Эко-патруль	Мастер — 120 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795824+03	NONE	120	HOUSE_CAT_TRASH	HOUSE	4	f	\N	85	\N
999	3	Эко-патруль	Шеф — 250 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795825+03	NONE	250	HOUSE_CAT_TRASH	HOUSE	5	f	\N	130	\N
1000	3	Эко-патруль	Эксперт — 400 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795825+03	NONE	400	HOUSE_CAT_TRASH	HOUSE	6	f	\N	190	\N
1001	3	Эко-патруль	Гроссмейстер — 600 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795826+03	NONE	600	HOUSE_CAT_TRASH	HOUSE	7	f	\N	270	\N
1003	3	Эко-патруль	Легенда быта — 1100 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795827+03	NONE	1100	HOUSE_CAT_TRASH	HOUSE	9	f	\N	500	\N
471	1	Эко-патруль	Стажер — 5 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-07 21:38:42.971619+03	NONE	5	HOUSE_CAT_TRASH	HOUSE	1	f	\N	10	\N
1004	3	Эко-патруль	Хранитель очага — 1400 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795827+03	NONE	1400	HOUSE_CAT_TRASH	HOUSE	10	f	\N	660	\N
1005	3	Эко-патруль	Генеральный директор Уюта — 1700 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795827+03	NONE	1700	HOUSE_CAT_TRASH	HOUSE	11	f	\N	860	\N
1006	3	Су-шеф	Стажер — 5 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.795837+03	NONE	5	HOUSE_CAT_COOKING	HOUSE	1	f	\N	10	\N
1007	3	Су-шеф	Новичок — 20 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.795837+03	NONE	20	HOUSE_CAT_COOKING	HOUSE	2	f	\N	25	\N
1009	3	Су-шеф	Мастер — 120 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.795838+03	NONE	120	HOUSE_CAT_COOKING	HOUSE	4	f	\N	85	\N
1010	3	Су-шеф	Шеф — 250 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.795839+03	NONE	250	HOUSE_CAT_COOKING	HOUSE	5	f	\N	130	\N
1011	3	Су-шеф	Эксперт — 400 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.795839+03	NONE	400	HOUSE_CAT_COOKING	HOUSE	6	f	\N	190	\N
1013	3	Су-шеф	Магистр — 850 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.79584+03	NONE	850	HOUSE_CAT_COOKING	HOUSE	8	f	\N	370	\N
1014	3	Су-шеф	Легенда быта — 1100 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.795841+03	NONE	1100	HOUSE_CAT_COOKING	HOUSE	9	f	\N	500	\N
1015	3	Су-шеф	Хранитель очага — 1400 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.795841+03	NONE	1400	HOUSE_CAT_COOKING	HOUSE	10	f	\N	660	\N
1016	3	Су-шеф	Генеральный директор Уюта — 1700 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.795842+03	NONE	1700	HOUSE_CAT_COOKING	HOUSE	11	f	\N	860	\N
1017	3	Домашний инженер	Стажер — 5 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795845+03	NONE	5	HOUSE_CAT_REPAIR	HOUSE	1	f	\N	10	\N
1018	3	Домашний инженер	Новичок — 20 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795845+03	NONE	20	HOUSE_CAT_REPAIR	HOUSE	2	f	\N	25	\N
1019	3	Домашний инженер	Практик — 60 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795846+03	NONE	60	HOUSE_CAT_REPAIR	HOUSE	3	f	\N	50	\N
568	3	Покоритель циклов	Властелин Книжных Вселенных — 25 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 17:06:23.640349+03	READING_SERIES	25	READING_SERIES	READING	11	f	\N	860	\N
569	3	Мастер заклинаний · Фэнтези	Ученик — 1 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.640463+03	READING_GENRE_FANTASY	1	READING_GENRE_FANTASY	READING	1	f	\N	10	\N
1020	3	Домашний инженер	Мастер — 120 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795846+03	NONE	120	HOUSE_CAT_REPAIR	HOUSE	4	f	\N	85	\N
1021	3	Домашний инженер	Шеф — 250 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795847+03	NONE	250	HOUSE_CAT_REPAIR	HOUSE	5	f	\N	130	\N
1022	3	Домашний инженер	Эксперт — 400 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795847+03	NONE	400	HOUSE_CAT_REPAIR	HOUSE	6	f	\N	190	\N
1023	3	Домашний инженер	Гроссмейстер — 600 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795848+03	NONE	600	HOUSE_CAT_REPAIR	HOUSE	7	f	\N	270	\N
1024	3	Домашний инженер	Магистр — 850 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795848+03	NONE	850	HOUSE_CAT_REPAIR	HOUSE	8	f	\N	370	\N
1025	3	Домашний инженер	Легенда быта — 1100 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795849+03	NONE	1100	HOUSE_CAT_REPAIR	HOUSE	9	f	\N	500	\N
1026	3	Домашний инженер	Хранитель очага — 1400 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795849+03	NONE	1400	HOUSE_CAT_REPAIR	HOUSE	10	f	\N	660	\N
1027	3	Домашний инженер	Генеральный директор Уюта — 1700 действий · Домашний инженер. Мелкий ремонт, сборка мебели, замена лампочки или чистка фильтров.	🛠️	0.00	2026-11-08 17:06:23.795849+03	NONE	1700	HOUSE_CAT_REPAIR	HOUSE	11	f	\N	860	\N
1028	3	Ботаник-хранитель	Стажер — 5 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795855+03	NONE	5	HOUSE_CAT_PLANTS	HOUSE	1	f	\N	10	\N
1029	3	Ботаник-хранитель	Новичок — 20 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795855+03	NONE	20	HOUSE_CAT_PLANTS	HOUSE	2	f	\N	25	\N
1030	3	Ботаник-хранитель	Практик — 60 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795856+03	NONE	60	HOUSE_CAT_PLANTS	HOUSE	3	f	\N	50	\N
1031	3	Ботаник-хранитель	Мастер — 120 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795856+03	NONE	120	HOUSE_CAT_PLANTS	HOUSE	4	f	\N	85	\N
1032	3	Ботаник-хранитель	Шеф — 250 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795857+03	NONE	250	HOUSE_CAT_PLANTS	HOUSE	5	f	\N	130	\N
1033	3	Ботаник-хранитель	Эксперт — 400 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795857+03	NONE	400	HOUSE_CAT_PLANTS	HOUSE	6	f	\N	190	\N
1034	3	Ботаник-хранитель	Гроссмейстер — 600 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795857+03	NONE	600	HOUSE_CAT_PLANTS	HOUSE	7	f	\N	270	\N
1035	3	Ботаник-хранитель	Магистр — 850 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795858+03	NONE	850	HOUSE_CAT_PLANTS	HOUSE	8	f	\N	370	\N
1036	3	Ботаник-хранитель	Легенда быта — 1100 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 17:06:23.795858+03	NONE	1100	HOUSE_CAT_PLANTS	HOUSE	9	f	\N	500	\N
1042	3	Умный дом	Технологический апгрейд комнаты:\nУмная колонка 🔊\nУмные розетки или RGB-лента, управляемая голосом 📱	🎵	0.00	2026-11-08 17:06:23.795875+03	NONE	0	HOUSE_SET_SMARTHOME	HOUSE	0	f	\N	130	\N
514	1	Ботаник-хранитель	Генеральный директор Уюта — 1700 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-07 21:38:42.97168+03	NONE	1700	HOUSE_CAT_PLANTS	HOUSE	11	f	\N	860	\N
570	3	Мастер заклинаний · Фэнтези	Новичок — 3 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.640465+03	READING_GENRE_FANTASY	3	READING_GENRE_FANTASY	READING	2	f	\N	25	\N
516	1	Кибер-оазис	Собрать идеальное рабочее место:\nКомпьютер или ноутбук 💻\nУмный свет для стола 💡\nУдобное кресло 💺	🧠	0.00	2026-11-07 21:38:42.971696+03	NONE	0	HOUSE_SET_CYBER	HOUSE	0	f	\N	130	\N
517	1	Моя крепость	Максимальный уровень личных границ:\nСобственный замок на дверь комнаты 🔑\nЛичный сейф или закрывающийся ящик 🔓	🔐	0.00	2026-11-07 21:38:42.971701+03	NONE	0	HOUSE_SET_FORTRESS	HOUSE	0	f	\N	130	\N
1044	3	Максимальный оборот	Заработать за один день полные +8 баллов: +2 за идеальную комнату и +6 за шесть разных видов помощи.	🚀	0.00	2026-11-08 17:06:23.795886+03	NONE	0	HOUSE_MAX_DAY	HOUSE	0	f	\N	130	\N
1045	3	Мини-минимализм	Провести глобальное расхламление: выбросить или отдать 30 ненужных вещей из своей комнаты.	🎒	0.00	2026-11-08 17:06:23.795888+03	NONE	0	HOUSE_MINIMALISM	HOUSE	0	f	\N	130	\N
1046	3	Сам себе дизайнер	Полностью переставить мебель в комнате или переоформить рабочий стол для максимального удобства.	🔧	0.00	2026-11-08 17:06:23.795891+03	NONE	0	HOUSE_DESIGNER	HOUSE	0	f	\N	130	\N
1047	3	Сезонная эвакуация	Самостоятельно разобрать гардероб, убрать сезонные вещи на хранение и аккуратно сложить текущую одежду.	📦	0.00	2026-11-08 17:06:23.795894+03	NONE	0	HOUSE_SEASONAL	HOUSE	0	f	\N	130	\N
1048	3	Генеральный разгром	Провести «глубокую» уборку: помыть окна в комнате, протереть пыль на шкафах и постирать шторы.	🧼	0.00	2026-11-08 17:06:23.795898+03	NONE	0	HOUSE_DEEP_CLEAN	HOUSE	0	f	\N	130	\N
523	1	Сезонная эвакуация	Самостоятельно разобрать гардероб, убрать сезонные вещи на хранение и аккуратно сложить текущую одежду.	📦	0.00	2026-11-07 21:38:42.971734+03	NONE	0	HOUSE_SEASONAL	HOUSE	0	f	\N	130	\N
27	1	Литературный турист	Следопыт — 5 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.847763+03	READING_GENRES	5	READING_GENRES	READING	5	f	\N	130	\N
28	1	Литературный турист	Картограф вселенных — 6 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.847765+03	READING_GENRES	6	READING_GENRES	READING	6	f	\N	190	\N
29	1	Литературный турист	Искатель приключений — 7 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.847767+03	READING_GENRES	7	READING_GENRES	READING	7	f	\N	270	\N
1057	4	Марафонец страниц	Пресмыкающийся по буквам — 50000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626446+03	READING_PAGES	50000	READING_PAGES	READING	9	f	\N	500	\N
1059	4	Марафонец страниц	Бесконечный двигатель — 80000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626448+03	READING_PAGES	80000	READING_PAGES	READING	11	f	\N	860	\N
1062	4	Книжный червь	Искатель смыслов — 15 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627903+03	READING_BOOKS	15	READING_BOOKS	READING	3	f	\N	50	\N
1063	4	Книжный червь	Книголюб-исследователь — 30 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627903+03	READING_BOOKS	30	READING_BOOKS	READING	4	f	\N	85	\N
606	3	Хранитель тайн · Приключения	Искатель — 12 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 17:06:23.64053+03	READING_GENRE_ADVENTURE	12	READING_GENRE_ADVENTURE	READING	5	f	\N	130	\N
1064	4	Книжный червь	Хранитель страниц — 50 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627904+03	READING_BOOKS	50	READING_BOOKS	READING	5	f	\N	130	\N
1065	4	Книжный червь	Мастер сюжетов — 80 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627905+03	READING_BOOKS	80	READING_BOOKS	READING	6	f	\N	190	\N
1066	4	Книжный червь	Книжный гроссмейстер — 120 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627906+03	READING_BOOKS	120	READING_BOOKS	READING	7	f	\N	270	\N
1067	4	Книжный червь	Проводник по мирам — 160 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627907+03	READING_BOOKS	160	READING_BOOKS	READING	8	f	\N	370	\N
1068	4	Книжный червь	Магистр слова — 200 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627907+03	READING_BOOKS	200	READING_BOOKS	READING	9	f	\N	500	\N
571	3	Мастер заклинаний · Фэнтези	Подмастерье — 5 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 17:06:23.640466+03	READING_GENRE_FANTASY	5	READING_GENRE_FANTASY	READING	3	f	\N	50	\N
1069	4	Книжный червь	Мудрец книжных глубин — 250 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627908+03	READING_BOOKS	250	READING_BOOKS	READING	10	f	\N	660	\N
1070	4	Книжный червь	Повелитель библиотек — 300 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627909+03	READING_BOOKS	300	READING_BOOKS	READING	11	f	\N	860	\N
1071	4	Литературный турист	Первый шаг за порог — 1 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.628355+03	READING_GENRES	1	READING_GENRES	READING	1	f	\N	10	\N
1072	4	Литературный турист	Местный турист — 2 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.628357+03	READING_GENRES	2	READING_GENRES	READING	2	f	\N	25	\N
1073	4	Литературный турист	Любопытный путник — 3 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.628357+03	READING_GENRES	3	READING_GENRES	READING	3	f	\N	50	\N
1074	4	Литературный турист	Смелый первопроходец — 4 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.628358+03	READING_GENRES	4	READING_GENRES	READING	4	f	\N	85	\N
1075	4	Литературный турист	Следопыт — 5 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.628359+03	READING_GENRES	5	READING_GENRES	READING	5	f	\N	130	\N
1076	4	Литературный турист	Картограф вселенных — 6 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.62836+03	READING_GENRES	6	READING_GENRES	READING	6	f	\N	190	\N
77	1	Детектив с лупой · Детективы	Божество жанра — 40 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.848667+03	READING_GENRE_DETECTIVE	40	READING_GENRE_DETECTIVE	READING	11	f	\N	860	\N
49	1	Мастер заклинаний · Фэнтези	Искатель — 12 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.848576+03	READING_GENRE_FANTASY	12	READING_GENRE_FANTASY	READING	5	f	\N	130	\N
1077	4	Литературный турист	Искатель приключений — 7 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.62836+03	READING_GENRES	7	READING_GENRES	READING	7	f	\N	270	\N
1078	4	Литературный турист	Межпространственный гид — 8 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.628361+03	READING_GENRES	8	READING_GENRES	READING	8	f	\N	370	\N
1079	4	Литературный турист	Покоритель горизонтов — 9 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.628362+03	READING_GENRES	9	READING_GENRES	READING	9	f	\N	500	\N
1080	4	Литературный турист	Кругосветный путешественник — 10 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.628367+03	READING_GENRES	10	READING_GENRES	READING	10	f	\N	660	\N
1081	4	Литературный турист	Космополит всея литературы — 12 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 23:19:52.628368+03	READING_GENRES	12	READING_GENRES	READING	11	f	\N	860	\N
1082	4	Покоритель циклов	Свидетель дилогии — 1 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.629727+03	READING_SERIES	1	READING_SERIES	READING	1	f	\N	10	\N
1083	4	Покоритель циклов	Собиратель трилогий — 2 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.629729+03	READING_SERIES	2	READING_SERIES	READING	2	f	\N	25	\N
1084	4	Покоритель циклов	Ценитель продолжений — 4 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.62973+03	READING_SERIES	4	READING_SERIES	READING	3	f	\N	50	\N
1085	4	Покоритель циклов	Охотник за томами — 6 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.62973+03	READING_SERIES	6	READING_SERIES	READING	4	f	\N	85	\N
1086	4	Покоритель циклов	Хранитель франшиз — 8 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.629731+03	READING_SERIES	8	READING_SERIES	READING	5	f	\N	130	\N
1049	4	Марафонец страниц	Спринтер-новичок — 100 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 23:19:52.626408+03	READING_PAGES	100	READING_PAGES	READING	1	f	\N	10	\N
1087	4	Покоритель циклов	Коллекционер саг — 10 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.629732+03	READING_SERIES	10	READING_SERIES	READING	6	f	\N	190	\N
1088	4	Покоритель циклов	Знаток сиквелов — 12 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.629732+03	READING_SERIES	12	READING_SERIES	READING	7	f	\N	270	\N
1089	4	Покоритель циклов	Мастер многотомников — 15 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.629733+03	READING_SERIES	15	READING_SERIES	READING	8	f	\N	370	\N
1090	4	Покоритель циклов	Архивариус историй — 18 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.629734+03	READING_SERIES	18	READING_SERIES	READING	9	f	\N	500	\N
1091	4	Покоритель циклов	Покоритель эпиков — 22 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.629735+03	READING_SERIES	22	READING_SERIES	READING	10	f	\N	660	\N
1092	4	Покоритель циклов	Властелин Книжных Вселенных — 25 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-08 23:19:52.629735+03	READING_SERIES	25	READING_SERIES	READING	11	f	\N	860	\N
1093	4	Мастер заклинаний · Фэнтези	Ученик — 1 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.630131+03	READING_GENRE_FANTASY	1	READING_GENRE_FANTASY	READING	1	f	\N	10	\N
78	1	Хранитель тайн · Приключения	Ученик — 1 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.848684+03	READING_GENRE_ADVENTURE	1	READING_GENRE_ADVENTURE	READING	1	f	\N	10	\N
1094	4	Мастер заклинаний · Фэнтези	Новичок — 3 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.630136+03	READING_GENRE_FANTASY	3	READING_GENRE_FANTASY	READING	2	f	\N	25	\N
1095	4	Мастер заклинаний · Фэнтези	Подмастерье — 5 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.630137+03	READING_GENRE_FANTASY	5	READING_GENRE_FANTASY	READING	3	f	\N	50	\N
1096	4	Мастер заклинаний · Фэнтези	Специалист — 8 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.630138+03	READING_GENRE_FANTASY	8	READING_GENRE_FANTASY	READING	4	f	\N	85	\N
1097	4	Мастер заклинаний · Фэнтези	Искатель — 12 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.630139+03	READING_GENRE_FANTASY	12	READING_GENRE_FANTASY	READING	5	f	\N	130	\N
1098	4	Мастер заклинаний · Фэнтези	Эксперт — 16 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.63014+03	READING_GENRE_FANTASY	16	READING_GENRE_FANTASY	READING	6	f	\N	190	\N
1099	4	Мастер заклинаний · Фэнтези	Мастер — 20 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.630141+03	READING_GENRE_FANTASY	20	READING_GENRE_FANTASY	READING	7	f	\N	270	\N
1100	4	Мастер заклинаний · Фэнтези	Гроссмейстер — 25 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.630146+03	READING_GENRE_FANTASY	25	READING_GENRE_FANTASY	READING	8	f	\N	370	\N
1101	4	Мастер заклинаний · Фэнтези	Магистр — 30 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.630147+03	READING_GENRE_FANTASY	30	READING_GENRE_FANTASY	READING	9	f	\N	500	\N
1102	4	Мастер заклинаний · Фэнтези	Легенда — 35 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.630148+03	READING_GENRE_FANTASY	35	READING_GENRE_FANTASY	READING	10	f	\N	660	\N
1103	4	Мастер заклинаний · Фэнтези	Божество жанра — 40 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-08 23:19:52.630149+03	READING_GENRE_FANTASY	40	READING_GENRE_FANTASY	READING	11	f	\N	860	\N
50	1	Мастер заклинаний · Фэнтези	Эксперт — 16 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.848578+03	READING_GENRE_FANTASY	16	READING_GENRE_FANTASY	READING	6	f	\N	190	\N
1104	4	Капитан звездолета · Научная фантастика / Sci-Fi	Ученик — 1 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.630156+03	READING_GENRE_SCIFI	1	READING_GENRE_SCIFI	READING	1	f	\N	10	\N
1105	4	Капитан звездолета · Научная фантастика / Sci-Fi	Новичок — 3 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.630157+03	READING_GENRE_SCIFI	3	READING_GENRE_SCIFI	READING	2	f	\N	25	\N
1106	4	Капитан звездолета · Научная фантастика / Sci-Fi	Подмастерье — 5 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.630158+03	READING_GENRE_SCIFI	5	READING_GENRE_SCIFI	READING	3	f	\N	50	\N
1107	4	Капитан звездолета · Научная фантастика / Sci-Fi	Специалист — 8 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.630159+03	READING_GENRE_SCIFI	8	READING_GENRE_SCIFI	READING	4	f	\N	85	\N
1108	4	Капитан звездолета · Научная фантастика / Sci-Fi	Искатель — 12 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.63016+03	READING_GENRE_SCIFI	12	READING_GENRE_SCIFI	READING	5	f	\N	130	\N
1109	4	Капитан звездолета · Научная фантастика / Sci-Fi	Эксперт — 16 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.630161+03	READING_GENRE_SCIFI	16	READING_GENRE_SCIFI	READING	6	f	\N	190	\N
1110	4	Капитан звездолета · Научная фантастика / Sci-Fi	Мастер — 20 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.630161+03	READING_GENRE_SCIFI	20	READING_GENRE_SCIFI	READING	7	f	\N	270	\N
1111	4	Капитан звездолета · Научная фантастика / Sci-Fi	Гроссмейстер — 25 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.630162+03	READING_GENRE_SCIFI	25	READING_GENRE_SCIFI	READING	8	f	\N	370	\N
1112	4	Капитан звездолета · Научная фантастика / Sci-Fi	Магистр — 30 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.630163+03	READING_GENRE_SCIFI	30	READING_GENRE_SCIFI	READING	9	f	\N	500	\N
1113	4	Капитан звездолета · Научная фантастика / Sci-Fi	Легенда — 35 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.630164+03	READING_GENRE_SCIFI	35	READING_GENRE_SCIFI	READING	10	f	\N	660	\N
1114	4	Капитан звездолета · Научная фантастика / Sci-Fi	Божество жанра — 40 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 23:19:52.630165+03	READING_GENRE_SCIFI	40	READING_GENRE_SCIFI	READING	11	f	\N	860	\N
1115	4	Детектив с лупой · Детективы	Ученик — 1 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.630179+03	READING_GENRE_DETECTIVE	1	READING_GENRE_DETECTIVE	READING	1	f	\N	10	\N
1116	4	Детектив с лупой · Детективы	Новичок — 3 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.63018+03	READING_GENRE_DETECTIVE	3	READING_GENRE_DETECTIVE	READING	2	f	\N	25	\N
1117	4	Детектив с лупой · Детективы	Подмастерье — 5 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.630181+03	READING_GENRE_DETECTIVE	5	READING_GENRE_DETECTIVE	READING	3	f	\N	50	\N
1118	4	Детектив с лупой · Детективы	Специалист — 8 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.630181+03	READING_GENRE_DETECTIVE	8	READING_GENRE_DETECTIVE	READING	4	f	\N	85	\N
1119	4	Детектив с лупой · Детективы	Искатель — 12 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.630182+03	READING_GENRE_DETECTIVE	12	READING_GENRE_DETECTIVE	READING	5	f	\N	130	\N
1120	4	Детектив с лупой · Детективы	Эксперт — 16 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.630183+03	READING_GENRE_DETECTIVE	16	READING_GENRE_DETECTIVE	READING	6	f	\N	190	\N
1121	4	Детектив с лупой · Детективы	Мастер — 20 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.630184+03	READING_GENRE_DETECTIVE	20	READING_GENRE_DETECTIVE	READING	7	f	\N	270	\N
1122	4	Детектив с лупой · Детективы	Гроссмейстер — 25 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.630185+03	READING_GENRE_DETECTIVE	25	READING_GENRE_DETECTIVE	READING	8	f	\N	370	\N
1123	4	Детектив с лупой · Детективы	Магистр — 30 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.630186+03	READING_GENRE_DETECTIVE	30	READING_GENRE_DETECTIVE	READING	9	f	\N	500	\N
1124	4	Детектив с лупой · Детективы	Легенда — 35 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.630187+03	READING_GENRE_DETECTIVE	35	READING_GENRE_DETECTIVE	READING	10	f	\N	660	\N
1125	4	Детектив с лупой · Детективы	Божество жанра — 40 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-08 23:19:52.630187+03	READING_GENRE_DETECTIVE	40	READING_GENRE_DETECTIVE	READING	11	f	\N	860	\N
1126	4	Хранитель тайн · Приключения	Ученик — 1 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.631119+03	READING_GENRE_ADVENTURE	1	READING_GENRE_ADVENTURE	READING	1	f	\N	10	\N
1127	4	Хранитель тайн · Приключения	Новичок — 3 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.631121+03	READING_GENRE_ADVENTURE	3	READING_GENRE_ADVENTURE	READING	2	f	\N	25	\N
1128	4	Хранитель тайн · Приключения	Подмастерье — 5 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.631121+03	READING_GENRE_ADVENTURE	5	READING_GENRE_ADVENTURE	READING	3	f	\N	50	\N
1129	4	Хранитель тайн · Приключения	Специалист — 8 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.631122+03	READING_GENRE_ADVENTURE	8	READING_GENRE_ADVENTURE	READING	4	f	\N	85	\N
1130	4	Хранитель тайн · Приключения	Искатель — 12 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.631123+03	READING_GENRE_ADVENTURE	12	READING_GENRE_ADVENTURE	READING	5	f	\N	130	\N
1132	4	Хранитель тайн · Приключения	Мастер — 20 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.631277+03	READING_GENRE_ADVENTURE	20	READING_GENRE_ADVENTURE	READING	7	f	\N	270	\N
1133	4	Хранитель тайн · Приключения	Гроссмейстер — 25 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.631279+03	READING_GENRE_ADVENTURE	25	READING_GENRE_ADVENTURE	READING	8	f	\N	370	\N
1134	4	Хранитель тайн · Приключения	Магистр — 30 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.63128+03	READING_GENRE_ADVENTURE	30	READING_GENRE_ADVENTURE	READING	9	f	\N	500	\N
1135	4	Хранитель тайн · Приключения	Легенда — 35 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.631281+03	READING_GENRE_ADVENTURE	35	READING_GENRE_ADVENTURE	READING	10	f	\N	660	\N
1136	4	Хранитель тайн · Приключения	Божество жанра — 40 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-08 23:19:52.631282+03	READING_GENRE_ADVENTURE	40	READING_GENRE_ADVENTURE	READING	11	f	\N	860	\N
1137	4	Проводник в реальность · Современная проза	Ученик — 1 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631698+03	READING_GENRE_CONTEMPORARY	1	READING_GENRE_CONTEMPORARY	READING	1	f	\N	10	\N
79	1	Хранитель тайн · Приключения	Новичок — 3 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.848686+03	READING_GENRE_ADVENTURE	3	READING_GENRE_ADVENTURE	READING	2	f	\N	25	\N
1138	4	Проводник в реальность · Современная проза	Новичок — 3 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631704+03	READING_GENRE_CONTEMPORARY	3	READING_GENRE_CONTEMPORARY	READING	2	f	\N	25	\N
1139	4	Проводник в реальность · Современная проза	Подмастерье — 5 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631706+03	READING_GENRE_CONTEMPORARY	5	READING_GENRE_CONTEMPORARY	READING	3	f	\N	50	\N
1140	4	Проводник в реальность · Современная проза	Специалист — 8 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631709+03	READING_GENRE_CONTEMPORARY	8	READING_GENRE_CONTEMPORARY	READING	4	f	\N	85	\N
1141	4	Проводник в реальность · Современная проза	Искатель — 12 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631711+03	READING_GENRE_CONTEMPORARY	12	READING_GENRE_CONTEMPORARY	READING	5	f	\N	130	\N
1142	4	Проводник в реальность · Современная проза	Эксперт — 16 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631731+03	READING_GENRE_CONTEMPORARY	16	READING_GENRE_CONTEMPORARY	READING	6	f	\N	190	\N
1143	4	Проводник в реальность · Современная проза	Мастер — 20 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631746+03	READING_GENRE_CONTEMPORARY	20	READING_GENRE_CONTEMPORARY	READING	7	f	\N	270	\N
1144	4	Проводник в реальность · Современная проза	Гроссмейстер — 25 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631747+03	READING_GENRE_CONTEMPORARY	25	READING_GENRE_CONTEMPORARY	READING	8	f	\N	370	\N
1145	4	Проводник в реальность · Современная проза	Магистр — 30 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631748+03	READING_GENRE_CONTEMPORARY	30	READING_GENRE_CONTEMPORARY	READING	9	f	\N	500	\N
1146	4	Проводник в реальность · Современная проза	Легенда — 35 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631755+03	READING_GENRE_CONTEMPORARY	35	READING_GENRE_CONTEMPORARY	READING	10	f	\N	660	\N
1147	4	Проводник в реальность · Современная проза	Божество жанра — 40 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 23:19:52.631756+03	READING_GENRE_CONTEMPORARY	40	READING_GENRE_CONTEMPORARY	READING	11	f	\N	860	\N
1148	4	Исследователь прошлого · Исторические романы	Ученик — 1 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.632754+03	READING_GENRE_HISTORY	1	READING_GENRE_HISTORY	READING	1	f	\N	10	\N
1149	4	Исследователь прошлого · Исторические романы	Новичок — 3 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.632757+03	READING_GENRE_HISTORY	3	READING_GENRE_HISTORY	READING	2	f	\N	25	\N
1150	4	Исследователь прошлого · Исторические романы	Подмастерье — 5 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.632758+03	READING_GENRE_HISTORY	5	READING_GENRE_HISTORY	READING	3	f	\N	50	\N
1151	4	Исследователь прошлого · Исторические романы	Специалист — 8 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.632759+03	READING_GENRE_HISTORY	8	READING_GENRE_HISTORY	READING	4	f	\N	85	\N
1152	4	Исследователь прошлого · Исторические романы	Искатель — 12 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.632759+03	READING_GENRE_HISTORY	12	READING_GENRE_HISTORY	READING	5	f	\N	130	\N
1153	4	Исследователь прошлого · Исторические романы	Эксперт — 16 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.63276+03	READING_GENRE_HISTORY	16	READING_GENRE_HISTORY	READING	6	f	\N	190	\N
1154	4	Исследователь прошлого · Исторические романы	Мастер — 20 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.632761+03	READING_GENRE_HISTORY	20	READING_GENRE_HISTORY	READING	7	f	\N	270	\N
1155	4	Исследователь прошлого · Исторические романы	Гроссмейстер — 25 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.632762+03	READING_GENRE_HISTORY	25	READING_GENRE_HISTORY	READING	8	f	\N	370	\N
1156	4	Исследователь прошлого · Исторические романы	Магистр — 30 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.632763+03	READING_GENRE_HISTORY	30	READING_GENRE_HISTORY	READING	9	f	\N	500	\N
1157	4	Исследователь прошлого · Исторические романы	Легенда — 35 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.632764+03	READING_GENRE_HISTORY	35	READING_GENRE_HISTORY	READING	10	f	\N	660	\N
1158	4	Исследователь прошлого · Исторические романы	Божество жанра — 40 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 23:19:52.632765+03	READING_GENRE_HISTORY	40	READING_GENRE_HISTORY	READING	11	f	\N	860	\N
1159	4	Шепот в темноте · Ужасы и мистика	Ученик — 1 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.632794+03	READING_GENRE_HORROR	1	READING_GENRE_HORROR	READING	1	f	\N	10	\N
1160	4	Шепот в темноте · Ужасы и мистика	Новичок — 3 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.632795+03	READING_GENRE_HORROR	3	READING_GENRE_HORROR	READING	2	f	\N	25	\N
1161	4	Шепот в темноте · Ужасы и мистика	Подмастерье — 5 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.632796+03	READING_GENRE_HORROR	5	READING_GENRE_HORROR	READING	3	f	\N	50	\N
1162	4	Шепот в темноте · Ужасы и мистика	Специалист — 8 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.632796+03	READING_GENRE_HORROR	8	READING_GENRE_HORROR	READING	4	f	\N	85	\N
1163	4	Шепот в темноте · Ужасы и мистика	Искатель — 12 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.632797+03	READING_GENRE_HORROR	12	READING_GENRE_HORROR	READING	5	f	\N	130	\N
1165	4	Шепот в темноте · Ужасы и мистика	Мастер — 20 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.632799+03	READING_GENRE_HORROR	20	READING_GENRE_HORROR	READING	7	f	\N	270	\N
1167	4	Шепот в темноте · Ужасы и мистика	Магистр — 30 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.632801+03	READING_GENRE_HORROR	30	READING_GENRE_HORROR	READING	9	f	\N	500	\N
1168	4	Шепот в темноте · Ужасы и мистика	Легенда — 35 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.632801+03	READING_GENRE_HORROR	35	READING_GENRE_HORROR	READING	10	f	\N	660	\N
1169	4	Шепот в темноте · Ужасы и мистика	Божество жанра — 40 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.632802+03	READING_GENRE_HORROR	40	READING_GENRE_HORROR	READING	11	f	\N	860	\N
1170	4	Ученый совет · Научпоп и энциклопедии	Ученик — 1 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632815+03	READING_GENRE_SCIENCE	1	READING_GENRE_SCIENCE	READING	1	f	\N	10	\N
1171	4	Ученый совет · Научпоп и энциклопедии	Новичок — 3 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632816+03	READING_GENRE_SCIENCE	3	READING_GENRE_SCIENCE	READING	2	f	\N	25	\N
1172	4	Ученый совет · Научпоп и энциклопедии	Подмастерье — 5 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632816+03	READING_GENRE_SCIENCE	5	READING_GENRE_SCIENCE	READING	3	f	\N	50	\N
1173	4	Ученый совет · Научпоп и энциклопедии	Специалист — 8 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632817+03	READING_GENRE_SCIENCE	8	READING_GENRE_SCIENCE	READING	4	f	\N	85	\N
1174	4	Ученый совет · Научпоп и энциклопедии	Искатель — 12 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632818+03	READING_GENRE_SCIENCE	12	READING_GENRE_SCIENCE	READING	5	f	\N	130	\N
1175	4	Ученый совет · Научпоп и энциклопедии	Эксперт — 16 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632819+03	READING_GENRE_SCIENCE	16	READING_GENRE_SCIENCE	READING	6	f	\N	190	\N
1176	4	Ученый совет · Научпоп и энциклопедии	Мастер — 20 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632821+03	READING_GENRE_SCIENCE	20	READING_GENRE_SCIENCE	READING	7	f	\N	270	\N
1177	4	Ученый совет · Научпоп и энциклопедии	Гроссмейстер — 25 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632822+03	READING_GENRE_SCIENCE	25	READING_GENRE_SCIENCE	READING	8	f	\N	370	\N
1178	4	Ученый совет · Научпоп и энциклопедии	Магистр — 30 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632823+03	READING_GENRE_SCIENCE	30	READING_GENRE_SCIENCE	READING	9	f	\N	500	\N
1179	4	Ученый совет · Научпоп и энциклопедии	Легенда — 35 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632824+03	READING_GENRE_SCIENCE	35	READING_GENRE_SCIENCE	READING	10	f	\N	660	\N
1180	4	Ученый совет · Научпоп и энциклопедии	Божество жанра — 40 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-08 23:19:52.632825+03	READING_GENRE_SCIENCE	40	READING_GENRE_SCIENCE	READING	11	f	\N	860	\N
1181	4	Мудрая сова · Сказки, мифы, легенды	Ученик — 1 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.632832+03	READING_GENRE_FAIRYTALE	1	READING_GENRE_FAIRYTALE	READING	1	f	\N	10	\N
1182	4	Мудрая сова · Сказки, мифы, легенды	Новичок — 3 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.632833+03	READING_GENRE_FAIRYTALE	3	READING_GENRE_FAIRYTALE	READING	2	f	\N	25	\N
1183	4	Мудрая сова · Сказки, мифы, легенды	Подмастерье — 5 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.632834+03	READING_GENRE_FAIRYTALE	5	READING_GENRE_FAIRYTALE	READING	3	f	\N	50	\N
1184	4	Мудрая сова · Сказки, мифы, легенды	Специалист — 8 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.632835+03	READING_GENRE_FAIRYTALE	8	READING_GENRE_FAIRYTALE	READING	4	f	\N	85	\N
1185	4	Мудрая сова · Сказки, мифы, легенды	Искатель — 12 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.632836+03	READING_GENRE_FAIRYTALE	12	READING_GENRE_FAIRYTALE	READING	5	f	\N	130	\N
1186	4	Мудрая сова · Сказки, мифы, легенды	Эксперт — 16 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.632836+03	READING_GENRE_FAIRYTALE	16	READING_GENRE_FAIRYTALE	READING	6	f	\N	190	\N
1187	4	Мудрая сова · Сказки, мифы, легенды	Мастер — 20 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.632837+03	READING_GENRE_FAIRYTALE	20	READING_GENRE_FAIRYTALE	READING	7	f	\N	270	\N
1188	4	Мудрая сова · Сказки, мифы, легенды	Гроссмейстер — 25 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.632838+03	READING_GENRE_FAIRYTALE	25	READING_GENRE_FAIRYTALE	READING	8	f	\N	370	\N
1189	4	Мудрая сова · Сказки, мифы, легенды	Магистр — 30 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.632839+03	READING_GENRE_FAIRYTALE	30	READING_GENRE_FAIRYTALE	READING	9	f	\N	500	\N
1191	4	Мудрая сова · Сказки, мифы, легенды	Божество жанра — 40 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.632841+03	READING_GENRE_FAIRYTALE	40	READING_GENRE_FAIRYTALE	READING	11	f	\N	860	\N
1193	4	Ловец рифм · Поэзия	Новичок — 3 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.632849+03	READING_GENRE_POETRY	3	READING_GENRE_POETRY	READING	2	f	\N	25	\N
1194	4	Ловец рифм · Поэзия	Подмастерье — 5 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.63285+03	READING_GENRE_POETRY	5	READING_GENRE_POETRY	READING	3	f	\N	50	\N
1195	4	Ловец рифм · Поэзия	Специалист — 8 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.63285+03	READING_GENRE_POETRY	8	READING_GENRE_POETRY	READING	4	f	\N	85	\N
1197	4	Ловец рифм · Поэзия	Эксперт — 16 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.632852+03	READING_GENRE_POETRY	16	READING_GENRE_POETRY	READING	6	f	\N	190	\N
1198	4	Ловец рифм · Поэзия	Мастер — 20 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.632853+03	READING_GENRE_POETRY	20	READING_GENRE_POETRY	READING	7	f	\N	270	\N
1199	4	Ловец рифм · Поэзия	Гроссмейстер — 25 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.632854+03	READING_GENRE_POETRY	25	READING_GENRE_POETRY	READING	8	f	\N	370	\N
1591	1	Начало племён	Прочесть цикл «Котов-Воителей» Эрин Хантер «Начало племён»:\n«Солнечная Тропа»\n«Гроза Грядёт»\n«Первая Битва»\n«Пылающая Звезда»\n«Разделённый Лес»\n«Путь Звёзд»	🌅	0.00	2026-11-11 22:32:38.885197+03	NONE	0	READING_QUEST_WARRIORS_DAWN	READING	0	f	\N	130	\N
1200	4	Ловец рифм · Поэзия	Магистр — 30 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.632855+03	READING_GENRE_POETRY	30	READING_GENRE_POETRY	READING	9	f	\N	500	\N
1201	4	Ловец рифм · Поэзия	Легенда — 35 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.632855+03	READING_GENRE_POETRY	35	READING_GENRE_POETRY	READING	10	f	\N	660	\N
1202	4	Ловец рифм · Поэзия	Божество жанра — 40 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.632856+03	READING_GENRE_POETRY	40	READING_GENRE_POETRY	READING	11	f	\N	860	\N
1203	4	Живые картинки · Комиксы и манга	Ученик — 1 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.634175+03	READING_GENRE_COMICS	1	READING_GENRE_COMICS	READING	1	f	\N	10	\N
1204	4	Живые картинки · Комиксы и манга	Новичок — 3 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.634177+03	READING_GENRE_COMICS	3	READING_GENRE_COMICS	READING	2	f	\N	25	\N
1205	4	Живые картинки · Комиксы и манга	Подмастерье — 5 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.634178+03	READING_GENRE_COMICS	5	READING_GENRE_COMICS	READING	3	f	\N	50	\N
1206	4	Живые картинки · Комиксы и манга	Специалист — 8 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.634179+03	READING_GENRE_COMICS	8	READING_GENRE_COMICS	READING	4	f	\N	85	\N
1207	4	Живые картинки · Комиксы и манга	Искатель — 12 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.63418+03	READING_GENRE_COMICS	12	READING_GENRE_COMICS	READING	5	f	\N	130	\N
1208	4	Живые картинки · Комиксы и манга	Эксперт — 16 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.634181+03	READING_GENRE_COMICS	16	READING_GENRE_COMICS	READING	6	f	\N	190	\N
1209	4	Живые картинки · Комиксы и манга	Мастер — 20 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.634181+03	READING_GENRE_COMICS	20	READING_GENRE_COMICS	READING	7	f	\N	270	\N
1210	4	Живые картинки · Комиксы и манга	Гроссмейстер — 25 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.634182+03	READING_GENRE_COMICS	25	READING_GENRE_COMICS	READING	8	f	\N	370	\N
1211	4	Живые картинки · Комиксы и манга	Магистр — 30 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.634186+03	READING_GENRE_COMICS	30	READING_GENRE_COMICS	READING	9	f	\N	500	\N
1212	4	Живые картинки · Комиксы и манга	Легенда — 35 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.634187+03	READING_GENRE_COMICS	35	READING_GENRE_COMICS	READING	10	f	\N	660	\N
1213	4	Живые картинки · Комиксы и манга	Божество жанра — 40 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 23:19:52.634188+03	READING_GENRE_COMICS	40	READING_GENRE_COMICS	READING	11	f	\N	860	\N
1214	4	Смех сквозь строки · Юмор	Ученик — 1 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.635077+03	READING_GENRE_HUMOR	1	READING_GENRE_HUMOR	READING	1	f	\N	10	\N
1215	4	Смех сквозь строки · Юмор	Новичок — 3 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.635079+03	READING_GENRE_HUMOR	3	READING_GENRE_HUMOR	READING	2	f	\N	25	\N
1216	4	Смех сквозь строки · Юмор	Подмастерье — 5 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.635079+03	READING_GENRE_HUMOR	5	READING_GENRE_HUMOR	READING	3	f	\N	50	\N
1217	4	Смех сквозь строки · Юмор	Специалист — 8 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.63508+03	READING_GENRE_HUMOR	8	READING_GENRE_HUMOR	READING	4	f	\N	85	\N
1218	4	Смех сквозь строки · Юмор	Искатель — 12 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.635081+03	READING_GENRE_HUMOR	12	READING_GENRE_HUMOR	READING	5	f	\N	130	\N
1220	4	Смех сквозь строки · Юмор	Мастер — 20 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.635083+03	READING_GENRE_HUMOR	20	READING_GENRE_HUMOR	READING	7	f	\N	270	\N
1592	1	Видение Теней	Прочесть цикл «Котов-Воителей» Эрин Хантер «Видение Теней»:\n«Путь Ученика»\n«Гром и Тень»\n«Расколотое Небо»\n«Самая Тёмная Ночь»\n«Огненная Река»\n«Свирепая Буря»	👁️	0.00	2026-11-11 22:32:38.885197+03	NONE	0	READING_QUEST_WARRIORS_VISION	READING	0	f	\N	130	\N
81	1	Хранитель тайн · Приключения	Специалист — 8 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.84869+03	READING_GENRE_ADVENTURE	8	READING_GENRE_ADVENTURE	READING	4	f	\N	85	\N
1221	4	Смех сквозь строки · Юмор	Гроссмейстер — 25 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.635084+03	READING_GENRE_HUMOR	25	READING_GENRE_HUMOR	READING	8	f	\N	370	\N
1222	4	Смех сквозь строки · Юмор	Магистр — 30 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.635085+03	READING_GENRE_HUMOR	30	READING_GENRE_HUMOR	READING	9	f	\N	500	\N
1223	4	Смех сквозь строки · Юмор	Легенда — 35 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.635085+03	READING_GENRE_HUMOR	35	READING_GENRE_HUMOR	READING	10	f	\N	660	\N
1224	4	Смех сквозь строки · Юмор	Божество жанра — 40 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.635086+03	READING_GENRE_HUMOR	40	READING_GENRE_HUMOR	READING	11	f	\N	860	\N
1247	4	Вычислительная машина	Мастер алгоритмов — 20000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709017+03	MATH_TASKS	20000	MATH_EXAMPLES	MATH	7	f	\N	270	\N
1225	4	Мальчик, который выжил	Прочесть серию о Гарри Поттере:\n«Гарри Поттер и философский камень»\n«Гарри Поттер и Тайная комната»\n«Гарри Поттер и узник Азкабана»\n«Гарри Поттер и Кубок огня»\n«Гарри Поттер и Орден Феникса»\n«Гарри Поттер и Принц-полукровка»\n«Гарри Поттер и Дары Смерти»\n«Гарри Поттер и Проклятое дитя»	⚡	0.00	2026-11-08 23:19:52.6351+03	NONE	0	READING_QUEST_HP	READING	0	f	\N	130	\N
1226	4	Хранитель Кольца	Прочесть «Властелин колец»:\n«Братство Кольца»\n«Две крепости»\n«Возвращение короля»	💍	0.00	2026-11-08 23:19:52.635106+03	NONE	0	READING_QUEST_LOTR	READING	0	f	\N	130	\N
1227	4	Через шкаф в Нарнию	Прочесть «Хроники Нарнии»:\n«Племянник чародея»\n«Лев, Колдунья и Платяной шкаф»\n«Конь и его мальчик»\n«Принц Каспиан»\n«Покоритель зари»\n«Серебряное кресло»\n«Последняя битва»	🦁	0.00	2026-11-08 23:19:52.6379+03	NONE	0	READING_QUEST_NARNIA	READING	0	f	\N	130	\N
1228	4	Житель Изумрудного города	Прочесть цикл А. Волкова:\n«Волшебник Изумрудного города»\n«Урфин Джюс и его деревянные солдаты»\n«Семь подземных королей»\n«Огненный бог Марранов»\n«Желтый туман»\n«Тайна заброшенного замка»	💚	0.00	2026-11-08 23:19:52.638858+03	NONE	0	READING_QUEST_EMERALD	READING	0	f	\N	130	\N
1229	4	Перси Джексон и олимпийцы	Прочесть серию Р. Риордана:\n«Похититель молний»\n«Море чудовищ»\n«Проклятие титана»\n«Лабиринт смерти»\n«Последнее пророчество»	🔱	0.00	2026-11-08 23:19:52.638863+03	NONE	0	READING_QUEST_PERCY	READING	0	f	\N	130	\N
1230	4	Абсолютный Всевед	Прочитать хотя бы по одной книге из всех 12 жанров: Фэнтези, Научная фантастика, Детектив, Приключения, Современная проза, Исторические романы, Ужасы, Научпоп, Сказки, Поэзия, Комиксы, Юмор.	🌟	0.00	2026-11-08 23:19:52.639963+03	READING_GENRES	12	READING_OMNIVORE	READING	0	f	\N	130	\N
1233	4	Быстрее ветра	Прочитать полноценную книгу (от 200 страниц) быстрее, чем за 3 дня.	⚡	0.00	2026-11-08 23:19:52.639985+03	NONE	0	READING_FAST	READING	0	f	\N	130	\N
1235	4	Книжный первооткрыватель	Прочитать книгу совершенно нового автора, о котором раньше никогда не слышал.	🧭	0.00	2026-11-08 23:19:52.640969+03	NONE	0	READING_PIONEER	READING	0	f	\N	130	\N
1237	4	Судья экранизаций	Прочитать книгу, посмотреть по ней фильм/мультфильм и честно сравнить их.	🎬	0.00	2026-11-08 23:19:52.640991+03	NONE	0	READING_MOVIE	READING	0	f	\N	130	\N
1238	4	Ночной дозор	Тайком или с разрешения прочитать целую главу под одеялом с фонариком.	🔦	0.00	2026-11-08 23:19:52.640999+03	NONE	0	READING_NIGHT	READING	0	f	\N	130	\N
1239	4	Чтение без границ	Прочитать книгу полностью вне дома (в парке, в путешествии, в поезде).	🎒	0.00	2026-11-08 23:19:52.641001+03	NONE	0	READING_OUTSIDE	READING	0	f	\N	130	\N
1240	4	Книжный стилист	Навести идеальный порядок на своей книжной полке и расставить книги по цветам, авторам или размеру.	📚	0.00	2026-11-08 23:19:52.64101+03	NONE	0	READING_SHELF	READING	0	f	\N	130	\N
1231	4	Книжный Кит	Прочитать одну тяжёлую книгу объёмом более 600 страниц.	🐋	0.00	2026-11-08 23:19:52.639972+03	READING_HEAVY_BOOKS	1	READING_WHALE	READING	0	f	\N	130	\N
1241	4	Вычислительная машина	Цифровой первоклашка — 100 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709013+03	MATH_TASKS	100	MATH_EXAMPLES	MATH	1	f	\N	10	\N
1242	4	Вычислительная машина	Калькулятор на батарейках — 500 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709016+03	MATH_TASKS	500	MATH_EXAMPLES	MATH	2	f	\N	25	\N
1243	4	Вычислительная машина	Счетные счеты — 1500 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709016+03	MATH_TASKS	1500	MATH_EXAMPLES	MATH	3	f	\N	50	\N
1244	4	Вычислительная машина	Властелин плюсов и минусов — 3000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709017+03	MATH_TASKS	3000	MATH_EXAMPLES	MATH	4	f	\N	85	\N
1245	4	Вычислительная машина	Умножающий разум — 5000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709017+03	MATH_TASKS	5000	MATH_EXAMPLES	MATH	5	f	\N	130	\N
1246	4	Вычислительная машина	Процессор Core i3 — 10000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709017+03	MATH_TASKS	10000	MATH_EXAMPLES	MATH	6	f	\N	190	\N
1248	4	Вычислительная машина	Цифровой гроссмейстер — 35000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709017+03	MATH_TASKS	35000	MATH_EXAMPLES	MATH	8	f	\N	370	\N
1249	4	Вычислительная машина	Квантовый компьютер — 50000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709018+03	MATH_TASKS	50000	MATH_EXAMPLES	MATH	9	f	\N	500	\N
80	1	Хранитель тайн · Приключения	Подмастерье — 5 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.848688+03	READING_GENRE_ADVENTURE	5	READING_GENRE_ADVENTURE	READING	3	f	\N	50	\N
1250	4	Вычислительная машина	Укротитель бесконечности — 65000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709018+03	MATH_TASKS	65000	MATH_EXAMPLES	MATH	10	f	\N	660	\N
1251	4	Вычислительная машина	Абсолютный Вычислитель — 80000 примеров.\nВсего решено примеров и уравнений. Считаются любые числовые выражения, включая карточки, дроби и алгебру.	🔢	0.00	2026-11-08 23:19:52.709018+03	MATH_TASKS	80000	MATH_EXAMPLES	MATH	11	f	\N	860	\N
1252	4	Главный архитектор	Искатель условий — 5 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.709019+03	NONE	5	MATH_WORD	MATH	1	f	\N	10	\N
1253	4	Главный архитектор	Распутыватель клубков — 15 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.709019+03	NONE	15	MATH_WORD	MATH	2	f	\N	25	\N
1478	4	Шеф-мойщик	Мастер — 120 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.751163+03	NONE	120	HOUSE_CAT_DISHES	HOUSE	4	f	\N	85	\N
1254	4	Главный архитектор	Логический детектив — 40 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.709019+03	NONE	40	MATH_WORD	MATH	3	f	\N	50	\N
30	1	Литературный турист	Межпространственный гид — 8 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.847768+03	READING_GENRES	8	READING_GENRES	READING	8	f	\N	370	\N
1255	4	Главный архитектор	Инженер смыслов — 80 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.70902+03	NONE	80	MATH_WORD	MATH	4	f	\N	85	\N
1256	4	Главный архитектор	Мастер чертежей — 150 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.70902+03	NONE	150	MATH_WORD	MATH	5	f	\N	130	\N
1257	4	Главный архитектор	Взломщик теорем — 250 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.70902+03	NONE	250	MATH_WORD	MATH	6	f	\N	190	\N
1593	1	Нарушенный Кодекс	Прочесть цикл «Котов-Воителей» Эрин Хантер «Нарушенный кодекс»:\n«Затерянные Звёзды»\n«Тихая Оттепель»\n«Покров Теней»\n«Тьма Внутри»\n«Земля Без Звёзд»\n«Свет в Тумане»	⚖️	0.00	2026-11-11 22:32:38.885198+03	NONE	0	READING_QUEST_WARRIORS_BROKEN	READING	0	f	\N	130	\N
1258	4	Главный архитектор	Конструктор решений — 400 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.70902+03	NONE	400	MATH_WORD	MATH	7	f	\N	270	\N
1259	4	Главный архитектор	Проектировщик матриц — 600 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.709021+03	NONE	600	MATH_WORD	MATH	8	f	\N	370	\N
1260	4	Главный архитектор	Профессор логики — 850 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.709021+03	NONE	850	MATH_WORD	MATH	9	f	\N	500	\N
1261	4	Главный архитектор	Архитектор гипотез — 1100 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.709021+03	NONE	1100	MATH_WORD	MATH	10	f	\N	660	\N
1262	4	Главный архитектор	Повелитель Математических Миров — 1400 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 23:19:52.709021+03	NONE	1400	MATH_WORD	MATH	11	f	\N	860	\N
1264	4	Испытатель тестов	Уверенный отличник — 15 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709022+03	MATH_CARDS	15	MATH_TESTS	MATH	2	f	\N	25	\N
1265	4	Испытатель тестов	Охотник за пятерками — 30 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709022+03	MATH_CARDS	30	MATH_TESTS	MATH	3	f	\N	50	\N
1266	4	Испытатель тестов	Критик ошибок — 50 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709022+03	MATH_CARDS	50	MATH_TESTS	MATH	4	f	\N	85	\N
1267	4	Испытатель тестов	Гроза контрольных — 80 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709023+03	MATH_CARDS	80	MATH_TESTS	MATH	5	f	\N	130	\N
82	1	Хранитель тайн · Приключения	Искатель — 12 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.848692+03	READING_GENRE_ADVENTURE	12	READING_GENRE_ADVENTURE	READING	5	f	\N	130	\N
1268	4	Испытатель тестов	Тестовый эксперт — 120 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709023+03	MATH_CARDS	120	MATH_TESTS	MATH	6	f	\N	190	\N
1270	4	Испытатель тестов	Магистр экзаменов — 230 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709023+03	MATH_CARDS	230	MATH_TESTS	MATH	8	f	\N	370	\N
1271	4	Испытатель тестов	Железный отличник — 300 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709023+03	MATH_CARDS	300	MATH_TESTS	MATH	9	f	\N	500	\N
1272	4	Испытатель тестов	Провидец ответов — 380 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709023+03	MATH_CARDS	380	MATH_TESTS	MATH	10	f	\N	660	\N
1273	4	Испытатель тестов	Абсолютный Цензор — 450 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709024+03	MATH_CARDS	450	MATH_TESTS	MATH	11	f	\N	860	\N
51	1	Мастер заклинаний · Фэнтези	Мастер — 20 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.84858+03	READING_GENRE_FANTASY	20	READING_GENRE_FANTASY	READING	7	f	\N	270	\N
1274	4	Укротитель Иксов	Стажер — 10 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.709026+03	NONE	10	MATH_CAT_EQUATIONS	MATH	1	f	\N	10	\N
1275	4	Укротитель Иксов	Новичок — 50 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.709026+03	NONE	50	MATH_CAT_EQUATIONS	MATH	2	f	\N	25	\N
1276	4	Укротитель Иксов	Практик — 150 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.709027+03	NONE	150	MATH_CAT_EQUATIONS	MATH	3	f	\N	50	\N
1277	4	Укротитель Иксов	Специалист — 400 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.709027+03	NONE	400	MATH_CAT_EQUATIONS	MATH	4	f	\N	85	\N
1278	4	Укротитель Иксов	Аналитик — 1000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.709027+03	NONE	1000	MATH_CAT_EQUATIONS	MATH	5	f	\N	130	\N
1279	4	Укротитель Иксов	Эксперт — 2500 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.709027+03	NONE	2500	MATH_CAT_EQUATIONS	MATH	6	f	\N	190	\N
1280	4	Укротитель Иксов	Мастер — 5000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.709027+03	NONE	5000	MATH_CAT_EQUATIONS	MATH	7	f	\N	270	\N
52	1	Мастер заклинаний · Фэнтези	Гроссмейстер — 25 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.848584+03	READING_GENRE_FANTASY	25	READING_GENRE_FANTASY	READING	8	f	\N	370	\N
53	1	Мастер заклинаний · Фэнтези	Магистр — 30 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.848586+03	READING_GENRE_FANTASY	30	READING_GENRE_FANTASY	READING	9	f	\N	500	\N
1281	4	Укротитель Иксов	Гроссмейстер — 8000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.709028+03	NONE	8000	MATH_CAT_EQUATIONS	MATH	8	f	\N	370	\N
1282	4	Укротитель Иксов	Магистр — 12000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.70903+03	NONE	12000	MATH_CAT_EQUATIONS	MATH	9	f	\N	500	\N
1283	4	Укротитель Иксов	Легенда — 16000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.70903+03	NONE	16000	MATH_CAT_EQUATIONS	MATH	10	f	\N	660	\N
1284	4	Укротитель Иксов	Математический Титан — 20000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 23:19:52.70903+03	NONE	20000	MATH_CAT_EQUATIONS	MATH	11	f	\N	860	\N
1285	4	Арифметика в уме	Стажер — 10 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.70903+03	NONE	10	MATH_CAT_ARITHMETIC	MATH	1	f	\N	10	\N
1286	4	Арифметика в уме	Новичок — 50 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.709031+03	NONE	50	MATH_CAT_ARITHMETIC	MATH	2	f	\N	25	\N
1287	4	Арифметика в уме	Практик — 150 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.709031+03	NONE	150	MATH_CAT_ARITHMETIC	MATH	3	f	\N	50	\N
1288	4	Арифметика в уме	Специалист — 400 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.709031+03	NONE	400	MATH_CAT_ARITHMETIC	MATH	4	f	\N	85	\N
1289	4	Арифметика в уме	Аналитик — 1000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.709031+03	NONE	1000	MATH_CAT_ARITHMETIC	MATH	5	f	\N	130	\N
1290	4	Арифметика в уме	Эксперт — 2500 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.709031+03	NONE	2500	MATH_CAT_ARITHMETIC	MATH	6	f	\N	190	\N
1291	4	Арифметика в уме	Мастер — 5000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.709032+03	NONE	5000	MATH_CAT_ARITHMETIC	MATH	7	f	\N	270	\N
1292	4	Арифметика в уме	Гроссмейстер — 8000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.709032+03	NONE	8000	MATH_CAT_ARITHMETIC	MATH	8	f	\N	370	\N
1293	4	Арифметика в уме	Магистр — 12000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.709032+03	NONE	12000	MATH_CAT_ARITHMETIC	MATH	9	f	\N	500	\N
1294	4	Арифметика в уме	Легенда — 16000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.709032+03	NONE	16000	MATH_CAT_ARITHMETIC	MATH	10	f	\N	660	\N
1295	4	Арифметика в уме	Математический Титан — 20000 заданий · Арифметика в уме. Простые цифры наподобие 2+2=? и 7×8: быстрый счёт без черновика.	⚡	0.00	2026-11-08 23:19:52.709032+03	NONE	20000	MATH_CAT_ARITHMETIC	MATH	11	f	\N	860	\N
1296	4	Король Пропорций	Стажер — 10 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709033+03	NONE	10	MATH_CAT_MULTDIV	MATH	1	f	\N	10	\N
1297	4	Король Пропорций	Новичок — 50 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709033+03	NONE	50	MATH_CAT_MULTDIV	MATH	2	f	\N	25	\N
1298	4	Король Пропорций	Практик — 150 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709033+03	NONE	150	MATH_CAT_MULTDIV	MATH	3	f	\N	50	\N
1299	4	Король Пропорций	Специалист — 400 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709033+03	NONE	400	MATH_CAT_MULTDIV	MATH	4	f	\N	85	\N
1300	4	Король Пропорций	Аналитик — 1000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709033+03	NONE	1000	MATH_CAT_MULTDIV	MATH	5	f	\N	130	\N
1301	4	Король Пропорций	Эксперт — 2500 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709034+03	NONE	2500	MATH_CAT_MULTDIV	MATH	6	f	\N	190	\N
1302	4	Король Пропорций	Мастер — 5000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709034+03	NONE	5000	MATH_CAT_MULTDIV	MATH	7	f	\N	270	\N
1303	4	Король Пропорций	Гроссмейстер — 8000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709034+03	NONE	8000	MATH_CAT_MULTDIV	MATH	8	f	\N	370	\N
1304	4	Король Пропорций	Магистр — 12000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709034+03	NONE	12000	MATH_CAT_MULTDIV	MATH	9	f	\N	500	\N
1305	4	Король Пропорций	Легенда — 16000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709034+03	NONE	16000	MATH_CAT_MULTDIV	MATH	10	f	\N	660	\N
1306	4	Король Пропорций	Математический Титан — 20000 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-08 23:19:52.709034+03	NONE	20000	MATH_CAT_MULTDIV	MATH	11	f	\N	860	\N
1307	4	Сила в Кубе	Стажер — 10 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709035+03	NONE	10	MATH_CAT_POWER	MATH	1	f	\N	10	\N
83	1	Хранитель тайн · Приключения	Эксперт — 16 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.848694+03	READING_GENRE_ADVENTURE	16	READING_GENRE_ADVENTURE	READING	6	f	\N	190	\N
1308	4	Сила в Кубе	Новичок — 50 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709035+03	NONE	50	MATH_CAT_POWER	MATH	2	f	\N	25	\N
1309	4	Сила в Кубе	Практик — 150 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709035+03	NONE	150	MATH_CAT_POWER	MATH	3	f	\N	50	\N
1310	4	Сила в Кубе	Специалист — 400 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709035+03	NONE	400	MATH_CAT_POWER	MATH	4	f	\N	85	\N
1311	4	Сила в Кубе	Аналитик — 1000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709036+03	NONE	1000	MATH_CAT_POWER	MATH	5	f	\N	130	\N
1312	4	Сила в Кубе	Эксперт — 2500 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709036+03	NONE	2500	MATH_CAT_POWER	MATH	6	f	\N	190	\N
1313	4	Сила в Кубе	Мастер — 5000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709036+03	NONE	5000	MATH_CAT_POWER	MATH	7	f	\N	270	\N
1314	4	Сила в Кубе	Гроссмейстер — 8000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709036+03	NONE	8000	MATH_CAT_POWER	MATH	8	f	\N	370	\N
1315	4	Сила в Кубе	Магистр — 12000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709036+03	NONE	12000	MATH_CAT_POWER	MATH	9	f	\N	500	\N
1316	4	Сила в Кубе	Легенда — 16000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709037+03	NONE	16000	MATH_CAT_POWER	MATH	10	f	\N	660	\N
1318	4	Извлекатель Корней	Стажер — 10 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709037+03	NONE	10	MATH_CAT_ROOT	MATH	1	f	\N	10	\N
1319	4	Извлекатель Корней	Новичок — 50 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709037+03	NONE	50	MATH_CAT_ROOT	MATH	2	f	\N	25	\N
1320	4	Извлекатель Корней	Практик — 150 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709037+03	NONE	150	MATH_CAT_ROOT	MATH	3	f	\N	50	\N
1594	1	Беззвёздное Племя	Прочесть цикл «Котов-Воителей» Эрин Хантер «Беззвёздное племя»:\n«Река»\n«Небо»\n«Тень»\n«Гром»\n«Звезда»	🌑	0.00	2026-11-11 22:32:38.885198+03	NONE	0	READING_QUEST_WARRIORS_CLAN	READING	0	f	\N	130	\N
1321	4	Извлекатель Корней	Специалист — 400 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709038+03	NONE	400	MATH_CAT_ROOT	MATH	4	f	\N	85	\N
1322	4	Извлекатель Корней	Аналитик — 1000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709038+03	NONE	1000	MATH_CAT_ROOT	MATH	5	f	\N	130	\N
1323	4	Извлекатель Корней	Эксперт — 2500 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709042+03	NONE	2500	MATH_CAT_ROOT	MATH	6	f	\N	190	\N
1324	4	Извлекатель Корней	Мастер — 5000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709043+03	NONE	5000	MATH_CAT_ROOT	MATH	7	f	\N	270	\N
1325	4	Извлекатель Корней	Гроссмейстер — 8000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709043+03	NONE	8000	MATH_CAT_ROOT	MATH	8	f	\N	370	\N
1326	4	Извлекатель Корней	Магистр — 12000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709043+03	NONE	12000	MATH_CAT_ROOT	MATH	9	f	\N	500	\N
1327	4	Извлекатель Корней	Легенда — 16000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709043+03	NONE	16000	MATH_CAT_ROOT	MATH	10	f	\N	660	\N
1328	4	Извлекатель Корней	Математический Титан — 20000 заданий · Извлекатель Корней. Квадратные корни: магия высвобождения чисел из-под знака корня.	🌱	0.00	2026-11-08 23:19:52.709043+03	NONE	20000	MATH_CAT_ROOT	MATH	11	f	\N	860	\N
1329	4	Повелитель Долей	Стажер — 10 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709044+03	NONE	10	MATH_CAT_FRACTIONS	MATH	1	f	\N	10	\N
1330	4	Повелитель Долей	Новичок — 50 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709044+03	NONE	50	MATH_CAT_FRACTIONS	MATH	2	f	\N	25	\N
1331	4	Повелитель Долей	Практик — 150 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709044+03	NONE	150	MATH_CAT_FRACTIONS	MATH	3	f	\N	50	\N
1332	4	Повелитель Долей	Специалист — 400 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709044+03	NONE	400	MATH_CAT_FRACTIONS	MATH	4	f	\N	85	\N
1333	4	Повелитель Долей	Аналитик — 1000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709044+03	NONE	1000	MATH_CAT_FRACTIONS	MATH	5	f	\N	130	\N
1334	4	Повелитель Долей	Эксперт — 2500 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709045+03	NONE	2500	MATH_CAT_FRACTIONS	MATH	6	f	\N	190	\N
1335	4	Повелитель Долей	Мастер — 5000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709045+03	NONE	5000	MATH_CAT_FRACTIONS	MATH	7	f	\N	270	\N
1336	4	Повелитель Долей	Гроссмейстер — 8000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709045+03	NONE	8000	MATH_CAT_FRACTIONS	MATH	8	f	\N	370	\N
1337	4	Повелитель Долей	Магистр — 12000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709045+03	NONE	12000	MATH_CAT_FRACTIONS	MATH	9	f	\N	500	\N
1338	4	Повелитель Долей	Легенда — 16000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709045+03	NONE	16000	MATH_CAT_FRACTIONS	MATH	10	f	\N	660	\N
1339	4	Повелитель Долей	Математический Титан — 20000 заданий · Повелитель Долей. Дроби и проценты: обыкновенные, десятичные дроби, задачи на проценты (5–6 класс).	🍕	0.00	2026-11-08 23:19:52.709046+03	NONE	20000	MATH_CAT_FRACTIONS	MATH	11	f	\N	860	\N
1340	4	Геометрический Гений	Стажер — 10 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709046+03	NONE	10	MATH_CAT_GEOMETRY	MATH	1	f	\N	10	\N
1595	1	Меняющиеся Небеса	Прочесть новый цикл «Котов-Воителей» Эрин Хантер «Меняющиеся небеса»:\n«Путь Старейшин»	☁️	0.00	2026-11-11 22:32:38.885198+03	NONE	0	READING_QUEST_WARRIORS_SKIES	READING	0	f	\N	130	\N
1341	4	Геометрический Гений	Новичок — 50 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709046+03	NONE	50	MATH_CAT_GEOMETRY	MATH	2	f	\N	25	\N
1342	4	Геометрический Гений	Практик — 150 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709046+03	NONE	150	MATH_CAT_GEOMETRY	MATH	3	f	\N	50	\N
1343	4	Геометрический Гений	Специалист — 400 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709047+03	NONE	400	MATH_CAT_GEOMETRY	MATH	4	f	\N	85	\N
1344	4	Геометрический Гений	Аналитик — 1000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709047+03	NONE	1000	MATH_CAT_GEOMETRY	MATH	5	f	\N	130	\N
1345	4	Геометрический Гений	Эксперт — 2500 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709047+03	NONE	2500	MATH_CAT_GEOMETRY	MATH	6	f	\N	190	\N
1346	4	Геометрический Гений	Мастер — 5000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709047+03	NONE	5000	MATH_CAT_GEOMETRY	MATH	7	f	\N	270	\N
1347	4	Геометрический Гений	Гроссмейстер — 8000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709047+03	NONE	8000	MATH_CAT_GEOMETRY	MATH	8	f	\N	370	\N
1348	4	Геометрический Гений	Магистр — 12000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709048+03	NONE	12000	MATH_CAT_GEOMETRY	MATH	9	f	\N	500	\N
1349	4	Геометрический Гений	Легенда — 16000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709048+03	NONE	16000	MATH_CAT_GEOMETRY	MATH	10	f	\N	660	\N
1350	4	Геометрический Гений	Математический Титан — 20000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 23:19:52.709048+03	NONE	20000	MATH_CAT_GEOMETRY	MATH	11	f	\N	860	\N
1351	4	Легкая прогулка	Стажер — 1 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709051+03	MATH_CARD_DONE_EASY	1	MATH_CAT_CARD_EASY	MATH	1	f	\N	10	\N
1352	4	Легкая прогулка	Новичок — 3 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709051+03	MATH_CARD_DONE_EASY	3	MATH_CAT_CARD_EASY	MATH	2	f	\N	25	\N
1353	4	Легкая прогулка	Практик — 6 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709051+03	MATH_CARD_DONE_EASY	6	MATH_CAT_CARD_EASY	MATH	3	f	\N	50	\N
1354	4	Легкая прогулка	Специалист — 10 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709052+03	MATH_CARD_DONE_EASY	10	MATH_CAT_CARD_EASY	MATH	4	f	\N	85	\N
1355	4	Легкая прогулка	Аналитик — 15 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709052+03	MATH_CARD_DONE_EASY	15	MATH_CAT_CARD_EASY	MATH	5	f	\N	130	\N
1356	4	Легкая прогулка	Эксперт — 21 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709052+03	MATH_CARD_DONE_EASY	21	MATH_CAT_CARD_EASY	MATH	6	f	\N	190	\N
1357	4	Легкая прогулка	Мастер — 28 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709052+03	MATH_CARD_DONE_EASY	28	MATH_CAT_CARD_EASY	MATH	7	f	\N	270	\N
1359	4	Легкая прогулка	Магистр — 45 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709055+03	MATH_CARD_DONE_EASY	45	MATH_CAT_CARD_EASY	MATH	9	f	\N	500	\N
1360	4	Легкая прогулка	Легенда — 55 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709055+03	MATH_CARD_DONE_EASY	55	MATH_CAT_CARD_EASY	MATH	10	f	\N	660	\N
1596	1	Странник Севера	Прочесть книгу цикла «Странников» Эрин Хантер о медведях:\n«Токло спешит на выручку»	🐻	0.00	2026-11-11 22:32:38.885199+03	NONE	0	READING_QUEST_SEEKERS	READING	0	f	\N	130	\N
1361	4	Легкая прогулка	Математический Титан — 66 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709056+03	MATH_CARD_DONE_EASY	66	MATH_CAT_CARD_EASY	MATH	11	f	\N	860	\N
1362	4	Крепкий орешек	Стажер — 1 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.709056+03	MATH_CARD_DONE_MEDIUM	1	MATH_CAT_CARD_MEDIUM	MATH	1	f	\N	10	\N
1363	4	Крепкий орешек	Новичок — 3 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.709059+03	MATH_CARD_DONE_MEDIUM	3	MATH_CAT_CARD_MEDIUM	MATH	2	f	\N	25	\N
1364	4	Крепкий орешек	Практик — 6 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.709059+03	MATH_CARD_DONE_MEDIUM	6	MATH_CAT_CARD_MEDIUM	MATH	3	f	\N	50	\N
1365	4	Крепкий орешек	Специалист — 10 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.709059+03	MATH_CARD_DONE_MEDIUM	10	MATH_CAT_CARD_MEDIUM	MATH	4	f	\N	85	\N
1366	4	Крепкий орешек	Аналитик — 15 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.709059+03	MATH_CARD_DONE_MEDIUM	15	MATH_CAT_CARD_MEDIUM	MATH	5	f	\N	130	\N
1367	4	Крепкий орешек	Эксперт — 21 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.709059+03	MATH_CARD_DONE_MEDIUM	21	MATH_CAT_CARD_MEDIUM	MATH	6	f	\N	190	\N
1368	4	Крепкий орешек	Мастер — 28 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.70906+03	MATH_CARD_DONE_MEDIUM	28	MATH_CAT_CARD_MEDIUM	MATH	7	f	\N	270	\N
1369	4	Крепкий орешек	Гроссмейстер — 36 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.70906+03	MATH_CARD_DONE_MEDIUM	36	MATH_CAT_CARD_MEDIUM	MATH	8	f	\N	370	\N
1413	4	Олимпийская вершина	Гроссмейстер — 17 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709073+03	MATH_CARD_DONE_OLYMPIAD	17	MATH_CAT_CARD_OLYMPIAD	MATH	8	f	\N	370	\N
1414	4	Олимпийская вершина	Магистр — 21 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709073+03	MATH_CARD_DONE_OLYMPIAD	21	MATH_CAT_CARD_OLYMPIAD	MATH	9	f	\N	500	\N
1415	4	Олимпийская вершина	Легенда — 26 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709073+03	MATH_CARD_DONE_OLYMPIAD	26	MATH_CAT_CARD_OLYMPIAD	MATH	10	f	\N	660	\N
1416	4	Олимпийская вершина	Математический Титан — 33 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709073+03	MATH_CARD_DONE_OLYMPIAD	33	MATH_CAT_CARD_OLYMPIAD	MATH	11	f	\N	860	\N
585	3	Капитан звездолета · Научная фантастика / Sci-Fi	Эксперт — 16 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-08 17:06:23.640493+03	READING_GENRE_SCIFI	16	READING_GENRE_SCIFI	READING	6	f	\N	190	\N
1426	4	Идеальный черновик	Исписать целую тетрадь в клетку аккуратными вычислениями без единой вырванной страницы.	📓	0.00	2026-11-08 23:19:52.709075+03	NONE	0	MATH_NOTEBOOK	MATH	0	f	\N	130	\N
1446	4	Карточный марафонец	Квартал без остановки — 90 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 23:19:52.70908+03	MATH_CARD_STREAK	90	MATH_CARD_STREAK	MATH	8	f	\N	370	\N
1467	4	Незаменимый помощник	Мастер на все руки — 1000 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-08 23:19:52.750283+03	HOUSE_HELP_POINTS	1000	HOUSE_HELP_POINTS	HOUSE	4	f	\N	85	\N
1475	4	Шеф-мойщик	Стажер — 5 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.75116+03	NONE	5	HOUSE_CAT_DISHES	HOUSE	1	f	\N	10	\N
1488	4	Повелитель швабры	Практик — 60 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-08 23:19:52.751989+03	NONE	60	HOUSE_CAT_MOP	HOUSE	3	f	\N	50	\N
1502	4	Стильный эксперт	Эксперт — 400 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 23:19:52.752012+03	NONE	400	HOUSE_CAT_LAUNDRY	HOUSE	6	f	\N	190	\N
250	1	Король Пропорций	Практик — 150 заданий · Король Пропорций. Умножение и деление: в столбик, многозначные числа, сокращение дробей.	✖️	0.00	2026-11-07 21:38:42.92732+03	NONE	150	MATH_CAT_MULTDIV	MATH	3	f	\N	50	\N
222	1	Испытатель тестов	Магистр экзаменов — 230 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-07 21:38:42.927166+03	MATH_CARDS	230	MATH_TESTS	MATH	8	f	\N	370	\N
130	1	Ученый совет · Научпоп и энциклопедии	Магистр — 30 книг · Научпоп и энциклопедии. от Любознайки до Академика наук.	🧠	0.00	2026-11-07 21:38:42.849172+03	READING_GENRE_SCIENCE	30	READING_GENRE_SCIENCE	READING	9	f	\N	500	\N
204	1	Главный архитектор	Искатель условий — 5 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.927128+03	NONE	5	MATH_WORD	MATH	1	f	\N	10	\N
214	1	Главный архитектор	Повелитель Математических Миров — 1400 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-07 21:38:42.927138+03	NONE	1400	MATH_WORD	MATH	11	f	\N	860	\N
1577	1	Дитя леса	Прочесть первый цикл «Котов-Воителей» Эрин Хантер «Пророчество начинается»:\n«Наставник Надежды»\n«Огонь и Вода»\n«Лес Тайн»\n«Бушующая Буря»\n«Опасная Тропа»\n«Самая Тёмная Ночь»	🐾	0.00	2026-11-11 22:23:42.146051+03	NONE	0	READING_QUEST_WARRIORS_PROPHECY	READING	0	f	\N	130	\N
259	1	Сила в Кубе	Стажер — 10 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-07 21:38:42.927334+03	NONE	10	MATH_CAT_POWER	MATH	1	f	\N	10	\N
319	1	Крепкий орешек	Эксперт — 21 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-07 21:38:42.927479+03	MATH_CARD_DONE_MEDIUM	21	MATH_CAT_CARD_MEDIUM	MATH	6	f	\N	190	\N
341	1	Зона хардкора	Эксперт — 21 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.92751+03	MATH_CARD_DONE_HARD	21	MATH_CAT_CARD_HARD	MATH	6	f	\N	190	\N
1579	1	Сила трёх	Прочесть третий цикл «Котов-Воителей» Эрин Хантер «Сила трёх»:\n«Прозрение»\n«Тёмная Река»\n«Изгнанники»\n«Затмение»\n«Долгие Тени»\n«Восход Солнца»	⚡	0.00	2026-11-11 22:23:42.146051+03	NONE	0	READING_QUEST_WARRIORS_POWER	READING	0	f	\N	130	\N
1580	1	Знамение Солнца	Прочесть четвёртый цикл «Котов-Воителей» Эрин Хантер «Знамение Солнца»:\n«Четвёртый Ученик»\n«Затухающие Эхо»\n«Ночные Шёпоты»\n«Знак Луны»\n«Забытый Воин»\n«Последняя Надежда»	☀️	0.00	2026-11-11 22:23:42.146052+03	NONE	0	READING_QUEST_WARRIORS_OMEN	READING	0	f	\N	130	\N
342	1	Зона хардкора	Мастер — 28 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.927511+03	MATH_CARD_DONE_HARD	28	MATH_CAT_CARD_HARD	MATH	7	f	\N	270	\N
343	1	Зона хардкора	Гроссмейстер — 36 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-07 21:38:42.927512+03	MATH_CARD_DONE_HARD	36	MATH_CAT_CARD_HARD	MATH	8	f	\N	370	\N
355	1	Хардкор-экстрим	Магистр — 45 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-07 21:38:42.92753+03	MATH_CARD_DONE_EXTREME	45	MATH_CAT_CARD_EXTREME	MATH	9	f	\N	500	\N
416	1	Незаменимый помощник	Разовая услуга — 50 баллов.\nВсего баллов за ПОМОЩЬ по дому. При помощи на 3–4 балла в день за 6 лет — около 7000–8000 баллов.	🤝	0.00	2026-11-07 21:38:42.971465+03	HOUSE_HELP_POINTS	50	HOUSE_HELP_POINTS	HOUSE	1	f	\N	10	\N
443	1	Повелитель швабры	Эксперт — 400 действий · Повелитель швабры. Мытьё полов или качественная сухая уборка пылесосом во всей квартире.	🌊	0.00	2026-11-07 21:38:42.971576+03	NONE	400	HOUSE_CAT_MOP	HOUSE	6	f	\N	190	\N
634	3	Исследователь прошлого · Исторические романы	Божество жанра — 40 книг · Исторические романы. от Очевидца до Хранителя Времени.	🛡️	0.00	2026-11-08 17:06:23.640639+03	READING_GENRE_HISTORY	40	READING_GENRE_HISTORY	READING	11	f	\N	860	\N
635	3	Шепот в темноте · Ужасы и мистика	Ученик — 1 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 17:06:23.640644+03	READING_GENRE_HORROR	1	READING_GENRE_HORROR	READING	1	f	\N	10	\N
702	3	Хранитель Кольца	Прочесть «Властелин колец»:\n«Братство Кольца»\n«Две крепости»\n«Возвращение короля»	💍	0.00	2026-11-08 17:06:23.640801+03	NONE	0	READING_QUEST_LOTR	READING	0	f	\N	130	\N
736	3	Главный архитектор	Профессор логики — 850 задач.\nРешено текстовых задач: логика, движение, работа, проценты, геометрические построения. Выдаётся родителем.	🧩	0.00	2026-11-08 17:06:23.740146+03	NONE	850	MATH_WORD	MATH	9	f	\N	500	\N
758	3	Укротитель Иксов	Магистр — 12000 заданий · Укротитель Иксов. Уравнения: от простых x + 2 = 4 до систем уравнений и квадратных корней.	⚖️	0.00	2026-11-08 17:06:23.740247+03	NONE	12000	MATH_CAT_EQUATIONS	MATH	9	f	\N	500	\N
823	3	Геометрический Гений	Гроссмейстер — 8000 заданий · Геометрический Гений. Геометрия: площади, периметры, углы и работа с фигурами (7–8 класс).	📐	0.00	2026-11-08 17:06:23.740339+03	NONE	8000	MATH_CAT_GEOMETRY	MATH	8	f	\N	370	\N
843	3	Крепкий орешек	Эксперт — 21 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 17:06:23.740586+03	MATH_CARD_DONE_MEDIUM	21	MATH_CAT_CARD_MEDIUM	MATH	6	f	\N	190	\N
928	3	Олимпийский запас	Успешно решить олимпиадную карточку.	🏆	0.00	2026-11-08 17:06:23.740758+03	MATH_CARD_LVL_OLYMPIAD	1	MATH_CARD_LVL_OLYMPIAD	MATH	0	f	\N	130	\N
917	3	Карточный марафонец	Двухнедельный марафон — 14 дней.\nДней подряд с завершённой карточкой по математике (не пропускать ни дня).	📅	0.00	2026-11-08 17:06:23.740742+03	MATH_CARD_STREAK	14	MATH_CARD_STREAK	MATH	3	f	\N	50	\N
927	3	Хардкорщик	Успешно решить карточку уровня «Хард».	🔥	0.00	2026-11-08 17:06:23.740752+03	MATH_CARD_LVL_EXTREME	1	MATH_CARD_LVL_EXTREME	MATH	0	f	\N	130	\N
984	3	Добытчик ресурсов	Стажер — 5 действий · Добытчик ресурсов. Поход в магазин за продуктами по списку.	🛒	0.00	2026-11-08 17:06:23.795815+03	NONE	5	HOUSE_CAT_SHOPPING	HOUSE	1	f	\N	10	\N
1008	3	Су-шеф	Практик — 60 действий · Су-шеф. Приготовление завтрака/обеда/ужина на всю семью (или активная помощь в готовке).	🍳	0.00	2026-11-08 17:06:23.795838+03	NONE	60	HOUSE_CAT_COOKING	HOUSE	3	f	\N	50	\N
1190	4	Мудрая сова · Сказки, мифы, легенды	Легенда — 35 книг · Сказки, мифы, легенды. от Слушателя няни до Хранителя древних преданий.	🦉	0.00	2026-11-08 23:19:52.63284+03	READING_GENRE_FAIRYTALE	35	READING_GENRE_FAIRYTALE	READING	10	f	\N	660	\N
1219	4	Смех сквозь строки · Юмор	Эксперт — 16 книг · Юмор. от Улыбающегося читателя до Короля комедии.	🤡	0.00	2026-11-08 23:19:52.635082+03	READING_GENRE_HUMOR	16	READING_GENRE_HUMOR	READING	6	f	\N	190	\N
1317	4	Сила в Кубе	Математический Титан — 20000 заданий · Сила в Кубе. Возведение в квадрат и степень: прокачка работы со степенями чисел.	🔝	0.00	2026-11-08 23:19:52.709037+03	NONE	20000	MATH_CAT_POWER	MATH	11	f	\N	860	\N
1358	4	Легкая прогулка	Гроссмейстер — 36 карточек · Легкая прогулка. Успешно решённые ежедневные карточки уровня «Лёгкая» (80%+ верных).	🃏	0.00	2026-11-08 23:19:52.709052+03	MATH_CARD_DONE_EASY	36	MATH_CAT_CARD_EASY	MATH	8	f	\N	370	\N
1370	4	Крепкий орешек	Магистр — 45 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.70906+03	MATH_CARD_DONE_MEDIUM	45	MATH_CAT_CARD_MEDIUM	MATH	9	f	\N	500	\N
1371	4	Крепкий орешек	Легенда — 55 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.70906+03	MATH_CARD_DONE_MEDIUM	55	MATH_CAT_CARD_MEDIUM	MATH	10	f	\N	660	\N
1389	4	Зона хардкора	Эксперт — 21 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709063+03	MATH_CARD_DONE_HARD	21	MATH_CAT_CARD_HARD	MATH	6	f	\N	190	\N
1372	4	Крепкий орешек	Математический Титан — 66 карточек · Крепкий орешек. Успешно решённые ежедневные карточки уровня «Обычная».	⚔️	0.00	2026-11-08 23:19:52.70906+03	MATH_CARD_DONE_MEDIUM	66	MATH_CAT_CARD_MEDIUM	MATH	11	f	\N	860	\N
1373	4	Высокий полёт	Стажер — 1 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709061+03	MATH_CARD_DONE_HIGH	1	MATH_CAT_CARD_HIGH	MATH	1	f	\N	10	\N
1374	4	Высокий полёт	Новичок — 3 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709061+03	MATH_CARD_DONE_HIGH	3	MATH_CAT_CARD_HIGH	MATH	2	f	\N	25	\N
1375	4	Высокий полёт	Практик — 6 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709061+03	MATH_CARD_DONE_HIGH	6	MATH_CAT_CARD_HIGH	MATH	3	f	\N	50	\N
1376	4	Высокий полёт	Специалист — 10 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709061+03	MATH_CARD_DONE_HIGH	10	MATH_CAT_CARD_HIGH	MATH	4	f	\N	85	\N
1377	4	Высокий полёт	Аналитик — 15 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709061+03	MATH_CARD_DONE_HIGH	15	MATH_CAT_CARD_HIGH	MATH	5	f	\N	130	\N
1378	4	Высокий полёт	Эксперт — 21 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709062+03	MATH_CARD_DONE_HIGH	21	MATH_CAT_CARD_HIGH	MATH	6	f	\N	190	\N
1379	4	Высокий полёт	Мастер — 28 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709062+03	MATH_CARD_DONE_HIGH	28	MATH_CAT_CARD_HIGH	MATH	7	f	\N	270	\N
1380	4	Высокий полёт	Гроссмейстер — 36 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709062+03	MATH_CARD_DONE_HIGH	36	MATH_CAT_CARD_HIGH	MATH	8	f	\N	370	\N
67	1	Детектив с лупой · Детективы	Ученик — 1 книг · Детективы. от Помощника шерифа до Шерлока Холмса.	🔍	0.00	2026-11-07 21:38:42.848648+03	READING_GENRE_DETECTIVE	1	READING_GENRE_DETECTIVE	READING	1	f	\N	10	\N
1381	4	Высокий полёт	Магистр — 45 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709062+03	MATH_CARD_DONE_HIGH	45	MATH_CAT_CARD_HIGH	MATH	9	f	\N	500	\N
1382	4	Высокий полёт	Легенда — 55 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709062+03	MATH_CARD_DONE_HIGH	55	MATH_CAT_CARD_HIGH	MATH	10	f	\N	660	\N
1383	4	Высокий полёт	Математический Титан — 66 карточек · Высокий полёт. Успешно решённые ежедневные карточки уровня «Высокая».	🚀	0.00	2026-11-08 23:19:52.709062+03	MATH_CARD_DONE_HIGH	66	MATH_CAT_CARD_HIGH	MATH	11	f	\N	860	\N
1384	4	Зона хардкора	Стажер — 1 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709063+03	MATH_CARD_DONE_HARD	1	MATH_CAT_CARD_HARD	MATH	1	f	\N	10	\N
1385	4	Зона хардкора	Новичок — 3 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709063+03	MATH_CARD_DONE_HARD	3	MATH_CAT_CARD_HARD	MATH	2	f	\N	25	\N
1386	4	Зона хардкора	Практик — 6 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709063+03	MATH_CARD_DONE_HARD	6	MATH_CAT_CARD_HARD	MATH	3	f	\N	50	\N
1387	4	Зона хардкора	Специалист — 10 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709063+03	MATH_CARD_DONE_HARD	10	MATH_CAT_CARD_HARD	MATH	4	f	\N	85	\N
1388	4	Зона хардкора	Аналитик — 15 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709063+03	MATH_CARD_DONE_HARD	15	MATH_CAT_CARD_HARD	MATH	5	f	\N	130	\N
1390	4	Зона хардкора	Мастер — 28 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709064+03	MATH_CARD_DONE_HARD	28	MATH_CAT_CARD_HARD	MATH	7	f	\N	270	\N
1405	4	Хардкор-экстрим	Математический Титан — 66 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709066+03	MATH_CARD_DONE_EXTREME	66	MATH_CAT_CARD_EXTREME	MATH	11	f	\N	860	\N
674	3	Ловец рифм · Поэзия	Мастер — 20 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 17:06:23.640739+03	READING_GENRE_POETRY	20	READING_GENRE_POETRY	READING	7	f	\N	270	\N
92	1	Проводник в реальность · Современная проза	Специалист — 8 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-07 21:38:42.849051+03	READING_GENRE_CONTEMPORARY	8	READING_GENRE_CONTEMPORARY	READING	4	f	\N	85	\N
1558	4	Ботаник-хранитель	Гроссмейстер — 600 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754105+03	NONE	600	HOUSE_CAT_PLANTS	HOUSE	7	f	\N	270	\N
1559	4	Ботаник-хранитель	Магистр — 850 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754105+03	NONE	850	HOUSE_CAT_PLANTS	HOUSE	8	f	\N	370	\N
56	1	Капитан звездолета · Научная фантастика / Sci-Fi	Ученик — 1 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848609+03	READING_GENRE_SCIFI	1	READING_GENRE_SCIFI	READING	1	f	\N	10	\N
1560	4	Ботаник-хранитель	Легенда быта — 1100 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754106+03	NONE	1100	HOUSE_CAT_PLANTS	HOUSE	9	f	\N	500	\N
1561	4	Ботаник-хранитель	Хранитель очага — 1400 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754106+03	NONE	1400	HOUSE_CAT_PLANTS	HOUSE	10	f	\N	660	\N
1569	4	Мини-минимализм	Провести глобальное расхламление: выбросить или отдать 30 ненужных вещей из своей комнаты.	🎒	0.00	2026-11-08 23:19:52.754619+03	NONE	0	HOUSE_MINIMALISM	HOUSE	0	f	\N	130	\N
1570	4	Сам себе дизайнер	Полностью переставить мебель в комнате или переоформить рабочий стол для максимального удобства.	🔧	0.00	2026-11-08 23:19:52.754625+03	NONE	0	HOUSE_DESIGNER	HOUSE	0	f	\N	130	\N
1571	4	Сезонная эвакуация	Самостоятельно разобрать гардероб, убрать сезонные вещи на хранение и аккуратно сложить текущую одежду.	📦	0.00	2026-11-08 23:19:52.754632+03	NONE	0	HOUSE_SEASONAL	HOUSE	0	f	\N	130	\N
1391	4	Зона хардкора	Гроссмейстер — 36 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709064+03	MATH_CARD_DONE_HARD	36	MATH_CAT_CARD_HARD	MATH	8	f	\N	370	\N
1392	4	Зона хардкора	Магистр — 45 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709064+03	MATH_CARD_DONE_HARD	45	MATH_CAT_CARD_HARD	MATH	9	f	\N	500	\N
1393	4	Зона хардкора	Легенда — 55 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709064+03	MATH_CARD_DONE_HARD	55	MATH_CAT_CARD_HARD	MATH	10	f	\N	660	\N
84	1	Хранитель тайн · Приключения	Мастер — 20 книг · Приключения. от Юнги до Легендарного первооткрывателя.	🗺️	0.00	2026-11-07 21:38:42.848696+03	READING_GENRE_ADVENTURE	20	READING_GENRE_ADVENTURE	READING	7	f	\N	270	\N
1394	4	Зона хардкора	Математический Титан — 66 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 23:19:52.709064+03	MATH_CARD_DONE_HARD	66	MATH_CAT_CARD_HARD	MATH	11	f	\N	860	\N
1395	4	Хардкор-экстрим	Стажер — 1 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709064+03	MATH_CARD_DONE_EXTREME	1	MATH_CAT_CARD_EXTREME	MATH	1	f	\N	10	\N
1572	4	Генеральный разгром	Провести «глубокую» уборку: помыть окна в комнате, протереть пыль на шкафах и постирать шторы.	🧼	0.00	2026-11-08 23:19:52.75464+03	NONE	0	HOUSE_DEEP_CLEAN	HOUSE	0	f	\N	130	\N
621	3	Проводник в реальность · Современная проза	Магистр — 30 книг · Современная проза. от Наблюдателя до Знатока человеческих душ.	🏫	0.00	2026-11-08 17:06:23.640617+03	READING_GENRE_CONTEMPORARY	30	READING_GENRE_CONTEMPORARY	READING	9	f	\N	500	\N
689	3	Живые картинки · Комиксы и манга	Божество жанра — 40 книг · Комиксы и манга. от Листателя страниц до Архивариуса визуального искусства.	🎨	0.00	2026-11-08 17:06:23.640768+03	READING_GENRE_COMICS	40	READING_GENRE_COMICS	READING	11	f	\N	860	\N
861	3	Зона хардкора	Новичок — 3 карточек · Зона хардкора. Успешно решённые ежедневные карточки уровня «Сложная».	🔥	0.00	2026-11-08 17:06:23.740613+03	MATH_CARD_DONE_HARD	3	MATH_CAT_CARD_HARD	MATH	2	f	\N	25	\N
961	3	Шеф-мойщик	Генеральный директор Уюта — 1700 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 17:06:23.795789+03	NONE	1700	HOUSE_CAT_DISHES	HOUSE	11	f	\N	860	\N
981	3	Стильный эксперт	Легенда быта — 1100 действий · Стильный эксперт. Загрузка стиральной машины, развешивание белья или глажка одежды.	🧺	0.00	2026-11-08 17:06:23.795811+03	NONE	1100	HOUSE_CAT_LAUNDRY	HOUSE	9	f	\N	500	\N
1060	4	Книжный червь	Слушатель историй — 1 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-08 23:19:52.627898+03	READING_BOOKS	1	READING_BOOKS	READING	1	f	\N	10	\N
1269	4	Испытатель тестов	Несокрушимый разум — 170 работ.\nУспешно сданные тесты, контрольные и карточки на «4» и «5».	📝	0.00	2026-11-08 23:19:52.709023+03	MATH_CARDS	170	MATH_TESTS	MATH	7	f	\N	270	\N
1166	4	Шепот в темноте · Ужасы и мистика	Гроссмейстер — 25 книг · Ужасы и мистика. от Боязливого полуночника до Повелителя кошмаров.	👻	0.00	2026-11-08 23:19:52.6328+03	READING_GENRE_HORROR	25	READING_GENRE_HORROR	READING	8	f	\N	370	\N
1236	4	Второе дыхание	Перечитать свою самую любимую книгу от начала до конца ещё раз.	🔄	0.00	2026-11-08 23:19:52.640985+03	NONE	0	READING_REREAD	READING	0	f	\N	130	\N
1477	4	Шеф-мойщик	Практик — 60 действий · Шеф-мойщик. Мытьё посуды или загрузка/разгрузка посудомойки.	🍽️	0.00	2026-11-08 23:19:52.751162+03	NONE	60	HOUSE_CAT_DISHES	HOUSE	3	f	\N	50	\N
1396	4	Хардкор-экстрим	Новичок — 3 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709065+03	MATH_CARD_DONE_EXTREME	3	MATH_CAT_CARD_EXTREME	MATH	2	f	\N	25	\N
1397	4	Хардкор-экстрим	Практик — 6 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709065+03	MATH_CARD_DONE_EXTREME	6	MATH_CAT_CARD_EXTREME	MATH	3	f	\N	50	\N
1398	4	Хардкор-экстрим	Специалист — 10 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709065+03	MATH_CARD_DONE_EXTREME	10	MATH_CAT_CARD_EXTREME	MATH	4	f	\N	85	\N
1399	4	Хардкор-экстрим	Аналитик — 15 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709065+03	MATH_CARD_DONE_EXTREME	15	MATH_CAT_CARD_EXTREME	MATH	5	f	\N	130	\N
1400	4	Хардкор-экстрим	Эксперт — 21 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709065+03	MATH_CARD_DONE_EXTREME	21	MATH_CAT_CARD_EXTREME	MATH	6	f	\N	190	\N
1401	4	Хардкор-экстрим	Мастер — 28 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709066+03	MATH_CARD_DONE_EXTREME	28	MATH_CAT_CARD_EXTREME	MATH	7	f	\N	270	\N
1402	4	Хардкор-экстрим	Гроссмейстер — 36 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709066+03	MATH_CARD_DONE_EXTREME	36	MATH_CAT_CARD_EXTREME	MATH	8	f	\N	370	\N
1403	4	Хардкор-экстрим	Магистр — 45 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709066+03	MATH_CARD_DONE_EXTREME	45	MATH_CAT_CARD_EXTREME	MATH	9	f	\N	500	\N
1404	4	Хардкор-экстрим	Легенда — 55 карточек · Хардкор-экстрим. Успешно решённые ежедневные карточки уровня «Хард» — для настоящих смельчаков.	💀	0.00	2026-11-08 23:19:52.709066+03	MATH_CARD_DONE_EXTREME	55	MATH_CAT_CARD_EXTREME	MATH	10	f	\N	660	\N
1568	4	Максимальный оборот	Заработать за один день полные +8 баллов: +2 за идеальную комнату и +6 за шесть разных видов помощи.	🚀	0.00	2026-11-08 23:19:52.754615+03	NONE	0	HOUSE_MAX_DAY	HOUSE	0	f	\N	130	\N
549	3	Литературный турист	Любопытный путник — 3 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.640314+03	READING_GENRES	3	READING_GENRES	READING	3	f	\N	50	\N
1565	4	Моя крепость	Максимальный уровень личных границ:\nСобственный замок на дверь комнаты 🔑\nЛичный сейф или закрывающийся ящик 🔓	🔐	0.00	2026-11-08 23:19:52.754127+03	NONE	0	HOUSE_SET_FORTRESS	HOUSE	0	f	\N	130	\N
35	1	Покоритель циклов	Собиратель трилогий — 2 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.847833+03	READING_SERIES	2	READING_SERIES	READING	2	f	\N	25	\N
36	1	Покоритель циклов	Ценитель продолжений — 4 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.847835+03	READING_SERIES	4	READING_SERIES	READING	3	f	\N	50	\N
37	1	Покоритель циклов	Охотник за томами — 6 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.847836+03	READING_SERIES	6	READING_SERIES	READING	4	f	\N	85	\N
38	1	Покоритель циклов	Хранитель франшиз — 8 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.847838+03	READING_SERIES	8	READING_SERIES	READING	5	f	\N	130	\N
402	1	Первая победа	Успешно решить первую карточку уровня «Лёгкая».	🃏	0.00	2026-11-07 21:38:42.927663+03	MATH_CARD_LVL_EASY	1	MATH_CARD_LVL_EASY	MATH	0	f	\N	130	\N
19	1	Книжный червь	Проводник по мирам — 160 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.847726+03	READING_BOOKS	160	READING_BOOKS	READING	8	f	\N	370	\N
20	1	Книжный червь	Магистр слова — 200 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.847727+03	READING_BOOKS	200	READING_BOOKS	READING	9	f	\N	500	\N
21	1	Книжный червь	Мудрец книжных глубин — 250 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.847729+03	READING_BOOKS	250	READING_BOOKS	READING	10	f	\N	660	\N
554	3	Литературный турист	Межпространственный гид — 8 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.640319+03	READING_GENRES	8	READING_GENRES	READING	8	f	\N	370	\N
9	1	Марафонец страниц	Пресмыкающийся по буквам — 50000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.847662+03	READING_PAGES	50000	READING_PAGES	READING	9	f	\N	500	\N
57	1	Капитан звездолета · Научная фантастика / Sci-Fi	Новичок — 3 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848611+03	READING_GENRE_SCIFI	3	READING_GENRE_SCIFI	READING	2	f	\N	25	\N
58	1	Капитан звездолета · Научная фантастика / Sci-Fi	Подмастерье — 5 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848613+03	READING_GENRE_SCIFI	5	READING_GENRE_SCIFI	READING	3	f	\N	50	\N
59	1	Капитан звездолета · Научная фантастика / Sci-Fi	Специалист — 8 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848615+03	READING_GENRE_SCIFI	8	READING_GENRE_SCIFI	READING	4	f	\N	85	\N
550	3	Литературный турист	Смелый первопроходец — 4 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.640315+03	READING_GENRES	4	READING_GENRES	READING	4	f	\N	85	\N
551	3	Литературный турист	Следопыт — 5 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.640316+03	READING_GENRES	5	READING_GENRES	READING	5	f	\N	130	\N
10	1	Марафонец страниц	Книжный титан — 65000 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-07 21:38:42.847664+03	READING_PAGES	65000	READING_PAGES	READING	10	f	\N	660	\N
527	3	Марафонец страниц	Торпедо — 1500 страниц.\nВсего прочитано страниц. Шкала прокачки физической выносливости чтеца.	👟	0.00	2026-11-08 17:06:23.640261+03	READING_PAGES	1500	READING_PAGES	READING	3	f	\N	50	\N
17	1	Книжный червь	Мастер сюжетов — 80 книг.\nВсего прочитано книг. Шкала накопления мудрости и личного авторитета.	🐛	0.00	2026-11-07 21:38:42.847722+03	READING_BOOKS	80	READING_BOOKS	READING	6	f	\N	190	\N
995	3	Эко-патруль	Стажер — 5 действий · Эко-патруль. Вынос мусора (включая сортировку, если она есть).	🗑️	0.00	2026-11-08 17:06:23.795823+03	NONE	5	HOUSE_CAT_TRASH	HOUSE	1	f	\N	10	\N
1192	4	Ловец рифм · Поэзия	Ученик — 1 книг · Поэзия. от Чтеца стишков до Бессмертного поэта.	📜	0.00	2026-11-08 23:19:52.632845+03	READING_GENRE_POETRY	1	READING_GENRE_POETRY	READING	1	f	\N	10	\N
926	3	Первая победа	Успешно решить первую карточку уровня «Лёгкая».	🃏	0.00	2026-11-08 17:06:23.74075+03	MATH_CARD_LVL_EASY	1	MATH_CARD_LVL_EASY	MATH	0	f	\N	130	\N
1562	4	Ботаник-хранитель	Генеральный директор Уюта — 1700 действий · Ботаник-хранитель. Полив всех комнатных растений или уход за домашним питомцем.	🌱	0.00	2026-11-08 23:19:52.754107+03	NONE	1700	HOUSE_CAT_PLANTS	HOUSE	11	f	\N	860	\N
1563	4	Ультимативный Геймер	Купить комбо для отдыха:\nТелевизор 📺\nИгровая приставка 🎮\nКресло-мешок или пуфик 🛋️	🎮	0.00	2026-11-08 23:19:52.754115+03	NONE	0	HOUSE_SET_GAMER	HOUSE	0	f	\N	130	\N
1564	4	Кибер-оазис	Собрать идеальное рабочее место:\nКомпьютер или ноутбук 💻\nУмный свет для стола 💡\nУдобное кресло 💺	🧠	0.00	2026-11-08 23:19:52.754124+03	NONE	0	HOUSE_SET_CYBER	HOUSE	0	f	\N	130	\N
34	1	Покоритель циклов	Свидетель дилогии — 1 серий.\nПрочитано книжных серий. Шкала верности большим историям и долгим приключениям.	⛓️	0.00	2026-11-07 21:38:42.847831+03	READING_SERIES	1	READING_SERIES	READING	1	f	\N	10	\N
60	1	Капитан звездолета · Научная фантастика / Sci-Fi	Искатель — 12 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848617+03	READING_GENRE_SCIFI	12	READING_GENRE_SCIFI	READING	5	f	\N	130	\N
61	1	Капитан звездолета · Научная фантастика / Sci-Fi	Эксперт — 16 книг · Научная фантастика / Sci-Fi. от Кадета академии до Адмирала Галактики.	🚀	0.00	2026-11-07 21:38:42.848619+03	READING_GENRE_SCIFI	16	READING_GENRE_SCIFI	READING	6	f	\N	190	\N
552	3	Литературный турист	Картограф вселенных — 6 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.640317+03	READING_GENRES	6	READING_GENRES	READING	6	f	\N	190	\N
553	3	Литературный турист	Искатель приключений — 7 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-08 17:06:23.640318+03	READING_GENRES	7	READING_GENRES	READING	7	f	\N	270	\N
1567	4	Идеальный месяц	Поддерживать порядок в своей комнате на оценку «+2» 30 дней подряд без единого срыва в «0» или «−1».	👑	0.00	2026-11-08 23:19:52.754612+03	HOUSE_CLEAN_STREAK	30	HOUSE_PERFECT_MONTH	HOUSE	0	f	\N	130	\N
1041	3	Моя крепость	Максимальный уровень личных границ:\nСобственный замок на дверь комнаты 🔑\nЛичный сейф или закрывающийся ящик 🔓	🔐	0.00	2026-11-08 17:06:23.79587+03	NONE	0	HOUSE_SET_FORTRESS	HOUSE	0	f	\N	130	\N
524	1	Генеральный разгром	Провести «глубокую» уборку: помыть окна в комнате, протереть пыль на шкафах и постирать шторы.	🧼	0.00	2026-11-07 21:38:42.971739+03	NONE	0	HOUSE_DEEP_CLEAN	HOUSE	0	f	\N	130	\N
1582	4	Начало племён	Прочесть цикл «Котов-Воителей» Эрин Хантер «Начало племён»:\n«Солнечная Тропа»\n«Гроза Грядёт»\n«Первая Битва»\n«Пылающая Звезда»\n«Разделённый Лес»\n«Путь Звёзд»	🌅	0.00	2026-11-11 22:31:15.361846+03	NONE	0	READING_QUEST_WARRIORS_DAWN	READING	0	f	\N	130	\N
1583	4	Видение Теней	Прочесть цикл «Котов-Воителей» Эрин Хантер «Видение Теней»:\n«Путь Ученика»\n«Гром и Тень»\n«Расколотое Небо»\n«Самая Тёмная Ночь»\n«Огненная Река»\n«Свирепая Буря»	👁️	0.00	2026-11-11 22:31:15.361849+03	NONE	0	READING_QUEST_WARRIORS_VISION	READING	0	f	\N	130	\N
1584	4	Нарушенный Кодекс	Прочесть цикл «Котов-Воителей» Эрин Хантер «Нарушенный кодекс»:\n«Затерянные Звёзды»\n«Тихая Оттепель»\n«Покров Теней»\n«Тьма Внутри»\n«Земля Без Звёзд»\n«Свет в Тумане»	⚖️	0.00	2026-11-11 22:31:15.361851+03	NONE	0	READING_QUEST_WARRIORS_BROKEN	READING	0	f	\N	130	\N
1585	4	Беззвёздное Племя	Прочесть цикл «Котов-Воителей» Эрин Хантер «Беззвёздное племя»:\n«Река»\n«Небо»\n«Тень»\n«Гром»\n«Звезда»	🌑	0.00	2026-11-11 22:31:15.361854+03	NONE	0	READING_QUEST_WARRIORS_CLAN	READING	0	f	\N	130	\N
1586	4	Меняющиеся Небеса	Прочесть новый цикл «Котов-Воителей» Эрин Хантер «Меняющиеся небеса»:\n«Путь Старейшин»	☁️	0.00	2026-11-11 22:31:15.361856+03	NONE	0	READING_QUEST_WARRIORS_SKIES	READING	0	f	\N	130	\N
1587	4	Странник Севера	Прочесть книгу цикла «Странников» Эрин Хантер о медведях:\n«Токло спешит на выручку»	🐻	0.00	2026-11-11 22:31:15.361859+03	NONE	0	READING_QUEST_SEEKERS	READING	0	f	\N	130	\N
1588	4	Верный Пёс Стаи	Прочесть цикл «Хроники стаи» Эрин Хантер о собаках:\n«Пустой Город»\n«Дорога Во Тьме»\n«Тьма Наступает»\n«Разбитая Тропа»	🐕	0.00	2026-11-11 22:31:15.361861+03	NONE	0	READING_QUEST_SURVIVORS	READING	0	f	\N	130	\N
1589	4	Царь Земли Смелых	Прочесть цикл «Земля Смелых» Эрин Хантер о африканских животных:\n«Разбитая Гордость»\n«Кровь и Кость»	🦁	0.00	2026-11-11 22:31:15.361863+03	NONE	0	READING_QUEST_BRAVELANDS	READING	0	f	\N	130	\N
1590	4	Хранитель Бамбука	Прочесть цикл «Бамбуковое королевство» Эрин Хантер о пандах:\n«Потоп»\n«Река Пепла»	🐼	0.00	2026-11-11 22:31:15.361865+03	NONE	0	READING_QUEST_BAMBOO	READING	0	f	\N	130	\N
1406	4	Олимпийская вершина	Стажер — 1 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709071+03	MATH_CARD_DONE_OLYMPIAD	1	MATH_CAT_CARD_OLYMPIAD	MATH	1	f	\N	10	\N
1407	4	Олимпийская вершина	Новичок — 2 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709072+03	MATH_CARD_DONE_OLYMPIAD	2	MATH_CAT_CARD_OLYMPIAD	MATH	2	f	\N	25	\N
1408	4	Олимпийская вершина	Практик — 3 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709072+03	MATH_CARD_DONE_OLYMPIAD	3	MATH_CAT_CARD_OLYMPIAD	MATH	3	f	\N	50	\N
54	1	Мастер заклинаний · Фэнтези	Легенда — 35 книг · Фэнтези. от Ученика чародея до Верховного Мага.	🔮	0.00	2026-11-07 21:38:42.848588+03	READING_GENRE_FANTASY	35	READING_GENRE_FANTASY	READING	10	f	\N	660	\N
1409	4	Олимпийская вершина	Специалист — 5 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709072+03	MATH_CARD_DONE_OLYMPIAD	5	MATH_CAT_CARD_OLYMPIAD	MATH	4	f	\N	85	\N
1410	4	Олимпийская вершина	Аналитик — 7 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709072+03	MATH_CARD_DONE_OLYMPIAD	7	MATH_CAT_CARD_OLYMPIAD	MATH	5	f	\N	130	\N
1411	4	Олимпийская вершина	Эксперт — 10 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709072+03	MATH_CARD_DONE_OLYMPIAD	10	MATH_CAT_CARD_OLYMPIAD	MATH	6	f	\N	190	\N
1412	4	Олимпийская вершина	Мастер — 13 карточек · Олимпийская вершина. Успешно решённые олимпиадные карточки. Примерно 1 раз в 2 месяца — вершина покоряется за 5–6 лет.	🏆	0.00	2026-11-08 23:19:52.709072+03	MATH_CARD_DONE_OLYMPIAD	13	MATH_CAT_CARD_OLYMPIAD	MATH	7	f	\N	270	\N
32	1	Литературный турист	Кругосветный путешественник — 10 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.847773+03	READING_GENRES	10	READING_GENRES	READING	10	f	\N	660	\N
33	1	Литературный турист	Космополит всея литературы — 12 жанров.\nКоличество освоенных жанров (всего 12). Шкала кругозора и разнообразия интересов.	🎒	0.00	2026-11-07 21:38:42.847775+03	READING_GENRES	12	READING_GENRES	READING	11	f	\N	860	\N
\.


--
-- Data for Name: avatar_items; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.avatar_items (id, parent_id, name, description, category, icon, created_at) FROM stdin;
\.


--
-- Data for Name: balances; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.balances (id, child_id, store_id, amount, updated_at) FROM stdin;
1	6	13	432.00	2026-11-08 23:19:02.140579+03
2	1	4	832.00	2026-11-08 23:23:52.544035+03
3	1	2	4.00	2026-11-09 03:43:03.791354+03
4	1	16	1.00	2026-11-09 05:22:30.408686+03
\.


--
-- Data for Name: child_achievements; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.child_achievements (id, child_id, achievement_id, unlocked_at) FROM stdin;
1	1	1	2026-11-08 23:21:39.489012+03
2	1	12	2026-11-08 23:21:39.523349+03
3	1	23	2026-11-08 23:21:39.614827+03
4	1	34	2026-11-08 23:21:39.636138+03
5	1	45	2026-11-08 23:21:39.657041+03
6	1	2	2026-11-08 23:23:52.575252+03
7	6	1049	2026-11-09 03:53:48.195856+03
8	6	1060	2026-11-09 03:53:48.2027+03
9	6	1071	2026-11-09 03:53:48.221512+03
10	6	1082	2026-11-09 03:53:48.225392+03
11	6	1093	2026-11-09 03:53:48.229919+03
\.


--
-- Data for Name: child_avatar_items; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.child_avatar_items (id, child_id, item_id, equipped, unlocked_at) FROM stdin;
\.


--
-- Data for Name: child_equipment; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.child_equipment (id, child_id, equipment_id, is_identified, equipped, acquired_at) FROM stdin;
\.


--
-- Data for Name: child_limits; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.child_limits (child_id, tv_minutes, pc_minutes, console_minutes, phone_minutes, tablet_minutes, pocket_weekly, updated_at, settings) FROM stdin;
1	0	60	0	0	0	0	2026-11-07 21:48:11.542573+03	{"disabled":[],"custom":[]}
3	60	0	0	0	0	0	2026-11-08 16:08:27.334773+03	{"disabled":["TABLET"],"custom":[{"id":"C1","name":"Лего","minutes":45,"enabled":true},{"id":"C2","name":"Прогулка","minutes":30,"enabled":false}]}
\.


--
-- Data for Name: child_quest_states; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.child_quest_states (id, child_id, quest_id, status, accepted_at, starts_at, next_available_at, completed_at) FROM stdin;
\.


--
-- Data for Name: child_task_cards; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.child_task_cards (id, child_id, card_id, day, status, started_at, submitted_at, answers_json, result_percent) FROM stdin;
1	1	1	2026-11-08	DONE	2026-11-09 02:47:48.437719+03	2026-11-09 02:48:12.455136+03	["4"]	100
\.


--
-- Data for Name: child_tracked_achievements; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.child_tracked_achievements (id, child_id, achievement_id, created_at) FROM stdin;
\.


--
-- Data for Name: children; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.children (id, parent_id, name, avatar_emoji, access_key, active, created_at, age, theme, home_widgets, birth_date) FROM stdin;
1	1	Никита	😊	R82T-2P3W-QPFP	t	2026-11-07 21:37:46.594733+03	10	wow	["balances","stats","achievements","orders"]	2020-01-01
3	3	Тестовый ребёнок	😊	JGT6-3YP2-6NWY	t	2026-11-08 16:08:27.260611+03	10	wow	["balances","stats","achievements","orders"]	2020-01-01
4	3	Второй ребёнок	🦊	4D7P-UXFP-NK64	t	2026-11-08 16:42:59.392003+03	8	wow	["balances","stats","achievements","orders"]	2015-05-10
5	1	Боб	😊	QK83-BR7B-W4V6	t	2026-11-08 23:16:12.509409+03	\N	wow	["balances","stats","achievements","orders"]	2020-12-21
6	4	Миша	🦁	9M49-TJ87-ZMXE	t	2026-11-08 23:18:33.599029+03	\N	wow	["balances","stats","achievements","orders"]	2020-01-01
\.


--
-- Data for Name: daily_logs; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.daily_logs (id, child_id, skill, day, payload, points, xp, full_clear, created_at) FROM stdin;
1	1	MATH	2026-11-08	{"done":"0"}	1.00	0	f	2026-11-09 03:43:03.799654+03
2	6	MATH	2026-11-08	{"done":"0,1,2"}	3.00	2	t	2026-11-09 03:53:48.133582+03
3	6	LOGIC	2026-11-08	{"done":"0,1,2"}	3.00	2	t	2026-11-09 04:54:09.708417+03
4	1	HOUSE	2026-11-08	{}	1.00	1	t	2026-11-09 05:22:30.333663+03
\.


--
-- Data for Name: deposits; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.deposits (id, child_id, store_id, amount, rate, last_interest_at, created_at) FROM stdin;
\.


--
-- Data for Name: dungeon_characters; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.dungeon_characters (child_id, class, status, stamina, max_stamina_bonus, last_refresh_day, victories, created_at, max_cleared_rank) FROM stdin;
1	\N	LOCKED	100	0	2026-11-11	0	2026-11-07 21:44:17.458507+03	NONE
\.


--
-- Data for Name: dungeon_sessions; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.dungeon_sessions (id, child_id, dungeon_code, status, rooms_total, current_room, tactic_ok, discovered_json, killed_json, log_json, reward_coins, started_at, finished_at, resume_day, rank, monster_level, dungeon_name, dungeon_emoji, reward_claimed) FROM stdin;
\.


--
-- Data for Name: equipment_defs; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.equipment_defs (id, code, name, slot, rarity, stat_multiplier, icon, description) FROM stdin;
1	rusty_sword	Ржавый меч	HAND_R	COMMON	1.00	🗡️	Лучше, чем ничего
2	iron_sword	Железный меч	HAND_R	COMMON	1.30	⚔️	Надёжное оружие ополченца
3	oak_bow	Дубовый лук	HAND_R	COMMON	1.20	🏹	Простой, но меткий
10	leather_armor	Кожаный доспех	BODY	COMMON	1.10	🎽	Скрипит, но держит удар
11	chain_mail	Кольчуга	BODY	UNCOMMON	1.50	⛓️	Звенит на каждом шагу
13	mage_robe	Мантия мага	BODY	RARE	1.80	🧙	Пылает звёздной пылью
14	dragon_scale	Чешуя дракона	BODY	EPIC	2.40	🐲	Не пробить даже копьём
12	iron_shield	Железный щит	HAND_L	UNCOMMON	1.40	🛡️	Крепкий и надёжный в строю
15	lucky_charm	Счастливые перчатки	GLOVES	COMMON	1.10	🧤	Тёплый на ощупь
21	cloth_hood	Тканевый капюшон	HEAD	COMMON	1.00	🧢	Простая защита от сквозняков
22	iron_helm	Железный шлем	HEAD	UNCOMMON	1.40	⛑️	Плотно сидит на голове
23	wizard_hat	Шляпа волшебника	HEAD	RARE	1.80	🎩	Из неё сыплются искры
24	dragon_crown	Корона Драконьего Пика	HEAD	EPIC	2.40	👑	Тяжела как сама гора
25	padded_vest	Стёганая куртка	BODY	COMMON	1.00	👕	Мягкая и тёплая
26	night_woven	Ткань ночных ткачей	BODY	RARE	1.90	🧥	Сшита из лунного света
27	wool_leggings	Шерстяные штаны	LEGS	COMMON	1.00	👖	Не жмут при беге
28	ranger_leggings	Штаны следопыта	LEGS	UNCOMMON	1.40	👖	Прочные и тихие
29	star_leggings	Штаны Звёздного Патруля	LEGS	RARE	1.80	✨	Светятся в темноте
30	canvas_gloves	Парусиновые рукавицы	GLOVES	COMMON	1.00	🧤	Всё держат крепко
31	gauntlets	Латные перчатки	GLOVES	RARE	1.90	🥊	Пальцы не согнуть
32	worn_sandals	Поношенные сандалии	BOOTS	COMMON	1.00	👟	Зато свои
33	tracker_boots	Сапоги следопыта	BOOTS	RARE	1.80	🥾	Следы сами затираются
34	buckler	Малый баклер	HAND_L	COMMON	1.10	🛡️	Лёгкий, но ловкий
35	towershield	Башенный щит	HAND_L	EPIC	2.50	🛡️	За ним как за стеной
16	traveler_ring	Кольцо странника	HAND_L	UNCOMMON	1.40	💍	Ускоряет шаг героя
17	sages_pendant	Венец мудреца	HEAD	RARE	1.80	👑	Шепчет подсказки на ушко
18	shadow_cloak	Плащ теней	BODY	EPIC	2.30	🧥	Растворяется в полумраке
19	champion_medal	Медаль чемпиона	HEAD	LEGENDARY	3.00	🏅	Сияет в памяти таверны
20	speed_boots	Сапоги-скороходы	BOOTS	UNCOMMON	1.50	🥾	Пыль летит из-под пят
4	apprentice_wand	Волшебная палочка ученика	HAND_R	COMMON	1.20	🪄	Слегка искрит на концах
5	steel_spear	Стальное копьё	HAND_R	UNCOMMON	1.60	🔱	Достаёт дальше, чем кажется
6	flame_blade	Пылающий клинок	HAND_R	RARE	2.00	🔥	Разогревает воздух вокруг
7	storm_bow	Лук Гроз	HAND_R	RARE	2.00	🏹	Стрелы гудят как ветер
8	frost_staff	Посох Стужи	HAND_R	EPIC	2.60	❄️	Иней на деревянной рукояти
9	dragonfang_blade	Клинок Драконьего Клыка	HAND_R	LEGENDARY	3.20	🐉	Легенда подземелий
36	spell_tome	Гримуар заклинаний	HAND_L	RARE	1.90	📕	Шепчет слова силы
37	parry_dagger	Кинжал для левой руки	HAND_L	UNCOMMON	1.50	🗡️	Отвечает на удары
\.


--
-- Data for Name: house_check_requests; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.house_check_requests (id, child_id, store_id, day, status, room_score, created_at, resolved_at) FROM stdin;
1	1	16	2026-11-09	APPROVED	1	2026-11-09 05:22:17.052138+03	2026-11-09 05:22:30.324712+03
\.


--
-- Data for Name: house_days; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.house_days (id, store_id, child_id, day, room_score, living_score, points, settled, updated_at, comment) FROM stdin;
1	16	1	2026-11-09	1	0	1.00	f	2026-11-09 05:22:30.326223+03	Нейтральное состояние «жилой» комнаты. Серьёзной грязи нет, но есть лёгкий беспорядок: не заправлена кровать, на стуле висит пара вещей, на столе лежит раскрытая книга или школьные принадлежности. Баллы не начисляются, но и не отнимаются.
3	16	1	2026-11-08	1	0	1.00	f	2026-11-09 22:37:11.773963+03	\N
4	16	1	2026-11-07	1	0	1.00	f	2026-11-09 22:37:14.584789+03	\N
5	16	1	2026-11-06	1	0	1.00	f	2026-11-09 22:37:35.091402+03	\N
6	16	1	2026-11-05	1	0	1.00	f	2026-11-09 22:37:37.72245+03	\N
2	16	1	2026-11-04	1	0	1.00	f	2026-11-09 22:37:40.48723+03	\N
7	16	1	2026-11-03	1	0	1.00	f	2026-11-09 22:37:43.637924+03	\N
8	16	1	2026-11-02	1	0	1.00	f	2026-11-09 22:37:46.49285+03	\N
9	16	1	2026-11-01	1	0	1.00	f	2026-11-09 22:37:49.437694+03	\N
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.inventory_items (id, child_id, store_id, product_id, purchase_id, status, created_at, resolved_at, item_type) FROM stdin;
\.


--
-- Data for Name: lang_card_attempts; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.lang_card_attempts (id, task_id, answer, correct, attempted_at) FROM stdin;
\.


--
-- Data for Name: lang_card_settings; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.lang_card_settings (id, parent_id, task_type, minutes, difficulty) FROM stdin;
1	1	WORD_WALL	20	EASY
2	1	SECRET_STORIES	25	EASY
3	1	DECODE	20	EASY
4	1	SPELLING	20	EASY
5	1	SHARE_SECRET	15	EASY
6	1	MASTERY	15	EASY
\.


--
-- Data for Name: lang_card_tasks; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.lang_card_tasks (id, card_id, task_type, text, answer, word_id) FROM stdin;
\.


--
-- Data for Name: lang_cards; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.lang_cards (id, child_id, card_date, task_type, minutes, difficulty, status, started_at, deadline, submitted_at, result_percent, base_reward, multiplier, xp_earned, parent_comment, created_at) FROM stdin;
\.


--
-- Data for Name: lang_word_progress; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.lang_word_progress (id, child_id, word_id, status, correct_streak, total_correct, total_attempts, activated_at, learned_at) FROM stdin;
1	1	1	ACTIVE	0	0	0	2026-11-07 21:44:27.321684+03	\N
\.


--
-- Data for Name: lang_words; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.lang_words (id, lang, foreign_text, ru_text, difficulty_level, sort_order) FROM stdin;
1	en	hello	привет	1	1
2	en	goodbye	пока	1	2
3	en	yes	да	1	3
4	en	no	нет	1	4
5	en	please	пожалуйста	1	5
6	en	thank you	спасибо	1	6
7	en	sorry	извини(те)	1	7
8	en	mom	мама	1	8
9	en	dad	папа	1	9
10	en	family	семья	1	10
11	en	cat	кот	1	11
12	en	dog	собака	1	12
13	en	house	дом	1	13
14	en	sun	солнце	1	14
15	en	moon	луна	1	15
16	en	water	вода	1	16
17	en	milk	молоко	1	17
18	en	bread	хлеб	1	18
19	en	big	большой	1	19
20	en	small	маленький	1	20
21	en	good	хороший	1	21
22	en	bad	плохой	1	22
23	en	day	день	1	23
24	en	night	ночь	1	24
25	en	friend	друг	1	25
26	en	school	школа	1	26
27	en	book	книга	1	27
28	en	pen	ручка	1	28
29	en	one	один	1	29
30	en	two	два	1	30
31	en	three	три	1	31
32	en	four	четыре	1	32
33	en	five	пять	1	33
34	en	red	красный	1	34
35	en	blue	синий	1	35
36	en	green	зелёный	1	36
37	en	yellow	жёлтый	1	37
38	en	boy	мальчик	1	38
39	en	girl	девочка	1	39
40	en	tree	дерево	1	40
41	en	flower	цветок	1	41
42	en	apple	яблоко	2	42
43	en	egg	яйцо	2	43
44	en	bird	птица	2	44
45	en	fish	рыба	2	45
46	en	ball	мяч	2	46
47	en	toy	игрушка	2	47
48	en	chair	стул	2	48
49	en	table	стол	2	49
50	en	window	окно	2	50
51	en	door	дверь	2	51
52	en	run	бегать	2	52
53	en	jump	прыгать	2	53
54	en	play	играть	2	54
55	en	sing	петь	2	55
56	en	swim	плавать	2	56
57	en	eat	есть	2	57
58	en	drink	пить	2	58
59	en	sleep	спать	2	59
60	en	walk	гулять	2	60
61	en	read	читать	2	61
62	en	write	писать	2	62
63	en	draw	рисовать	2	63
64	en	count	считать	2	64
65	en	my	мой	2	65
66	en	your	твой	2	66
67	en	we	мы	2	67
68	en	they	они	2	68
69	en	cold	холодный	2	69
70	en	hot	горячий	2	70
71	en	happy	счастливый	2	71
72	en	sad	грустный	2	72
73	en	winter	зима	2	73
74	en	spring	весна	2	74
75	en	summer	лето	2	75
76	en	autumn	осень	2	76
77	en	brother	брат	3	77
78	en	sister	сестра	3	78
79	en	grandmother	бабушка	3	79
80	en	grandfather	дедушка	3	80
81	en	breakfast	завтрак	3	81
82	en	lunch	обед	3	82
83	en	dinner	ужин	3	83
84	en	city	город	3	84
85	en	street	улица	3	85
86	en	car	машина	3	86
87	en	bus	автобус	3	87
88	en	train	поезд	3	88
89	en	weather	погода	3	89
90	en	rain	дождь	3	90
91	en	snow	снег	3	91
92	en	wind	ветер	3	92
93	en	like	нравиться	3	93
94	en	want	хотеть	3	94
95	en	know	знать	3	95
96	en	think	думать	3	96
97	en	look	смотреть	3	97
98	en	listen	слушать	3	98
99	en	help	помогать	3	99
100	en	work	работать	3	100
101	en	question	вопрос	3	101
102	en	answer	ответ	3	102
103	en	story	история	3	103
104	en	game	игра	3	104
105	en	music	музыка	3	105
106	en	sport	спорт	3	106
107	en	teacher	учитель	4	107
108	en	doctor	врач	4	108
109	en	kitchen	кухня	4	109
110	en	bedroom	спальня	4	110
111	en	garden	сад	4	111
112	en	market	рынок	4	112
113	en	hospital	больница	4	113
114	en	library	библиотека	4	114
115	en	homework	домашнее задание	4	115
116	en	holiday	праздник	4	116
117	en	present	подарок	4	117
118	en	money	деньги	4	118
119	en	cheap	дешёвый	4	119
120	en	expensive	дорогой	4	120
121	en	beautiful	красивый	4	121
122	en	interesting	интересный	4	122
123	en	fast	быстрый	4	123
124	en	slow	медленный	4	124
125	en	early	ранний	4	125
126	en	late	поздний	4	126
127	en	always	всегда	4	127
128	en	never	никогда	4	128
129	en	often	часто	4	129
130	en	sometimes	иногда	4	130
131	en	journey	путешествие	5	131
132	en	language	язык	5	132
133	en	remember	помнить	5	133
134	en	forget	забывать	5	134
135	en	decide	решать	5	135
136	en	important	важный	5	136
137	en	understand	понимать	5	137
138	en	learn	учиться	5	138
139	en	teach	учить	5	139
140	en	try	пытаться	5	140
141	en	travel	путешествовать	5	141
142	en	fly	летать	5	142
143	en	arrive	прибывать	5	143
144	en	leave	покидать	5	144
145	en	comfortable	удобный	5	145
146	en	successful	успешный	5	146
147	en	experience	опыт	5	147
148	en	knowledge	знание	5	148
149	en	opportunity	возможность	5	149
150	en	advice	совет	5	150
151	en	achieve	достигать	6	151
152	en	development	развитие	6	152
153	en	environment	окружающая среда	6	153
154	en	government	правительство	6	154
155	en	society	общество	6	155
156	en	improve	улучшать	6	156
157	en	increase	увеличивать	6	157
158	en	decrease	уменьшать	6	158
159	en	offer	предлагать	6	159
160	en	suggest	предлагать	6	160
161	en	accept	принимать	6	161
162	en	refuse	отказываться	6	162
163	en	explain	объяснять	6	163
164	en	describe	описывать	6	164
165	en	compare	сравнивать	6	165
166	en	decision	решение	6	166
167	en	purpose	цель	6	167
168	en	instead	вместо	6	168
169	en	although	хотя	6	169
170	en	however	однако	6	170
171	en	therefore	следовательно	6	171
172	en	wisdom	мудрость	6	172
173	en	courage	смелость	6	173
174	en	confidence	уверенность	6	174
175	en	responsibility	ответственность	6	175
\.


--
-- Data for Name: limit_events; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.limit_events (id, child_id, limit_type, action, seconds, created_at) FROM stdin;
1	1	CONSOLE	START	0	2026-11-07 21:48:17.562898+03
2	1	CONSOLE	STOP	1	2026-11-07 21:48:18.651999+03
3	1	PC	START	0	2026-11-07 21:48:18.725984+03
4	1	PC	STOP	21	2026-11-07 21:48:40.172953+03
5	3	C1	START	0	2026-11-08 16:11:09.939704+03
6	3	C1	STOP	3315	2026-11-08 17:06:24.990813+03
\.


--
-- Data for Name: limit_freeze; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.limit_freeze (id, child_id, limit_type, frozen, updated_at) FROM stdin;
\.


--
-- Data for Name: limit_usage; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.limit_usage (id, child_id, limit_type, day, used_seconds, extended_seconds, running, started_at) FROM stdin;
1	1	CONSOLE	2026-11-07	1	0	f	\N
2	1	PC	2026-11-07	21	0	f	\N
3	3	C1	2026-11-08	2700	0	f	\N
\.


--
-- Data for Name: logic_card_attempts; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.logic_card_attempts (id, task_id, answer, correct, attempted_at) FROM stdin;
1	33	9	f	2026-11-09 04:54:09.69394+03
2	34	9	f	2026-11-09 04:54:09.699032+03
3	35	9	f	2026-11-09 04:54:09.699582+03
4	36	9	f	2026-11-09 04:54:09.699894+03
5	37	9	f	2026-11-09 04:54:09.700236+03
6	38	9	f	2026-11-09 04:54:09.700626+03
7	39	9	f	2026-11-09 04:54:09.700892+03
8	40	9	f	2026-11-09 04:54:09.701121+03
9	41	9	f	2026-11-09 04:54:09.918754+03
10	42	9	f	2026-11-09 04:54:09.919199+03
11	43	9	f	2026-11-09 04:54:09.919432+03
12	44	9	f	2026-11-09 04:54:09.919645+03
13	45	9	f	2026-11-09 04:54:09.919856+03
14	46	9	f	2026-11-09 04:54:09.920056+03
15	47	9	f	2026-11-09 04:54:09.920323+03
16	48	9	f	2026-11-09 04:54:09.920578+03
17	49	9	f	2026-11-09 04:54:09.920815+03
18	50	9	f	2026-11-09 04:54:09.921043+03
19	27	7	f	2026-11-09 04:54:39.782457+03
20	28	7	f	2026-11-09 04:54:39.783534+03
21	29	7	f	2026-11-09 04:54:39.783787+03
22	30	7	f	2026-11-09 04:54:39.783995+03
23	31	7	f	2026-11-09 04:54:39.78419+03
24	32	7	f	2026-11-09 04:54:39.784393+03
\.


--
-- Data for Name: logic_card_tasks; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.logic_card_tasks (id, card_id, topic_code, task_type, text, answer) FROM stdin;
1	1	PATTERN	PATTERN	Продолжи ряд: 8, 11, 14, 17, ?	20
2	1	ODD	ODD	Найди лишнее число: 28, 6, 24, 22, 39	39
3	1	RIDDLE	RIDDLE	Во дворе 3 кошек (по 4 лапы) и 3 куриц (по 2 лапы). Сколько всего лап?	18
4	1	SYMBOLS	SYMBOLS	🍎 + 🍎 = 14, 🍎 + 🍋 = 15 → 🍋 = ?	8
5	1	BALANCE	BALANCE	🪨 = 3 📦, 📦 = 3 кг → 🪨 = ?	9
6	1	RIDDLE	RIDDLE	Сегодня понедельник. Какой день недели будет через 3 дня?	четверг
7	2	PATTERN	PATTERN	Продолжи ряд: 25, 30, 35, 40, ?	45
8	2	ODD	ODD	Найди лишнее число: 24, 44, 37, 8, 20	37
9	2	RIDDLE	RIDDLE	Бревно длиной 5 метров распилили на части по 1 метру. Сколько сделали распилов?	4
10	2	SYMBOLS	SYMBOLS	🍌 × 2 = 12, 🍌 + 🍋 = 14 → 🍋 = ?	8
11	2	BALANCE	BALANCE	🐱 = 3 🐰, 🐰 = 3 🦊, 🦊 = 4 кг → 🐱 = ?	36
12	2	RIDDLE	RIDDLE	Сегодня пятница. Какой день недели будет через 27 дней?	четверг
13	2	PATTERN	PATTERN	Продолжи ряд: 37, 42, 47, 52, ?	57
14	2	ODD	ODD	Найди лишнее число: 28, 45, 12, 20, 16	45
15	3	PATTERN	PATTERN	Продолжи ряд: 7, 19, 55, 163, ?	487
16	3	ODD	ODD	Найди лишнее число: 76, 64, 27, 125, 8	76
17	3	RIDDLE	RIDDLE	В классе 9 учеников. Каждый подарил по открытке всем остальным. Сколько всего открытек подарили?	72
18	3	SYMBOLS	SYMBOLS	🍒 + 🍒 = 10, 🍒 + 🍐 = 10, 🍐 × 2 + 🍇 = 16 → 🍇 = ?	6
19	3	BALANCE	BALANCE	🪨 = 2 📦, 📦 = 3 🎁, 🎁 = 4 🎁, 🎁 = 1 кг → 🪨 = ?	24
20	3	RIDDLE	RIDDLE	Узор повторяется: 🔴 🟡 🔵 🔴 🟡 🔵 … Какого цвета будет 10-й элемент?	🔴
21	3	PATTERN	PATTERN	Продолжи ряд: 8, 22, 64, 190, ?	568
22	3	ODD	ODD	Найди лишнее число: 27, 101, 8, 64, 125	101
23	3	RIDDLE	RIDDLE	В классе 5 учеников. Каждый подарил по открытке всем остальным. Сколько всего открытек подарили?	20
24	3	SYMBOLS	SYMBOLS	🍎 + 🍎 = 20, 🍎 + 🍒 = 22, 🍒 × 2 + 🍌 = 32 → 🍌 = ?	8
25	3	BALANCE	BALANCE	🪨 = 2 📦, 📦 = 3 🎁, 🎁 = 2 🎁, 🎁 = 1 кг → 🪨 = ?	12
26	3	RIDDLE	RIDDLE	Узор повторяется: 🔴 🟡 🔵 🔴 🟡 🔵 … Какого цвета будет 15-й элемент?	🔵
27	4	PATTERN	PATTERN	Продолжи ряд: 5, 10, 15, 20, ?	25
28	4	ODD	ODD	Найди лишнее число: 22, 24, 10, 57, 14	57
29	4	RIDDLE	RIDDLE	Во дворе 4 кошек (по 4 лапы) и 5 куриц (по 2 лапы). Сколько всего лап?	26
30	4	SYMBOLS	SYMBOLS	🍐 + 🍐 = 10, 🍐 + 🍎 = 14 → 🍎 = ?	9
31	4	BALANCE	BALANCE	🪨 = 3 📦, 📦 = 7 кг → 🪨 = ?	21
32	4	RIDDLE	RIDDLE	Сегодня четверг. Какой день недели будет через 2 дня?	суббота
33	5	PATTERN	PATTERN	Продолжи ряд: 29, 37, 45, 53, ?	61
34	5	ODD	ODD	Найди лишнее число: 48, 8, 14, 36, 24	14
35	5	RIDDLE	RIDDLE	Бревно длиной 9 метров распилили на части по 1 метру. Сколько сделали распилов?	8
36	5	SYMBOLS	SYMBOLS	🍐 × 2 = 18, 🍐 + 🍋 = 12 → 🍋 = ?	3
37	5	BALANCE	BALANCE	🐱 = 3 🐰, 🐰 = 2 🦊, 🦊 = 1 кг → 🐱 = ?	6
38	5	RIDDLE	RIDDLE	Сегодня понедельник. Какой день недели будет через 10 дней?	четверг
39	5	PATTERN	PATTERN	Продолжи ряд: 37, 45, 53, 61, ?	69
40	5	ODD	ODD	Найди лишнее число: 48, 8, 12, 45, 40	45
41	6	PATTERN	PATTERN	Продолжи ряд: 5, 15, 45, 135, ?	405
42	6	ODD	ODD	Найди лишнее число: 14, 31, 11, 2, 37	14
43	6	RIDDLE	RIDDLE	Ручка дороже карандаша на 8 руб. Вместе они стоят 24 руб. Сколько стоит ручка?	16
44	6	SYMBOLS	SYMBOLS	🍒 + 🍒 = 6, 🍒 + 🍎 = 10, 🍎 + 🍋 = 13 → 🍋 = ?	6
45	6	BALANCE	BALANCE	2 🪨 = 3 📦, 📦 = 8 кг → 🪨 = ?	12
46	6	RIDDLE	RIDDLE	Сейчас март. Какой месяц наступит через 12 месяцев?	март
47	6	PATTERN	PATTERN	Продолжи ряд: 4, 12, 36, 108, ?	324
48	6	ODD	ODD	Найди лишнее число: 19, 41, 10, 37, 3	10
49	6	RIDDLE	RIDDLE	Вася стоит в очереди 6-й с начала и 5-й с конца. Сколько всего человек в очереди?	10
50	6	SYMBOLS	SYMBOLS	🍌 + 🍌 = 4, 🍌 + 🍒 = 7, 🍒 + 🍋 = 11 → 🍋 = ?	6
51	7	PATTERN	PATTERN	Продолжи ряд: 5, 7, 10, 14, ?	19
52	7	ODD	ODD	Найди лишнее число: 81, 16, 25, 4, 64	64
53	7	RIDDLE	RIDDLE	У Маши было 48 конфет. Она отдала подруге половину и ещё 3 конфеты. Сколько конфет отдала Маша?	27
54	7	SYMBOLS	SYMBOLS	🍋 + 🍋 = 6, 🍋 + 🍎 = 16, 🍎 × 2 + 🍇 = 29 → 🍇 = ?	3
55	7	BALANCE	BALANCE	3 🐱 = 5 🐰, 🐱 = 5 кг → 🐰 = ?	3
56	7	RIDDLE	RIDDLE	Буквы идут по алфавиту, но некоторые пропущены: А, В, Д. Какая буква будет следующей?	Ё
57	7	PATTERN	PATTERN	Продолжи ряд: 2, 3, 5, 8, ?	12
58	7	ODD	ODD	Найди лишнее число: 21, 9, 16, 4, 100	21
59	7	RIDDLE	RIDDLE	Улитка за день поднимается по столбу на 6 дм, а за ночь сползает на 2 дм. Столб высотой 12 дм. На какой день улитка доберётся до вершины?	2
60	7	SYMBOLS	SYMBOLS	🍌 + 🍌 = 30, 🍌 + 🍒 = 24, 🍒 × 2 + 🍐 = 25 → 🍐 = ?	7
61	8	PATTERN	PATTERN	Продолжи ряд: 19, 21, 20, 22, 21, 23, ?	22
62	8	ODD	ODD	Найди лишнее число: 27, 64, 8, 125, 25	25
63	8	RIDDLE	RIDDLE	В классе 8 учеников. Каждый подарил по открытке всем остальным. Сколько всего открытек подарили?	56
64	8	SYMBOLS	SYMBOLS	🍒 + 🍒 = 28, 🍒 + 🍇 = 24, 🍇 × 2 + 🍎 = 30 → 🍎 = ?	10
65	8	BALANCE	BALANCE	🪨 = 3 📦, 📦 = 2 🎁, 🎁 = 2 🎁, 🎁 = 4 кг → 🪨 = ?	48
66	8	RIDDLE	RIDDLE	Узор повторяется: 🔴 🟡 🔵 🔴 🟡 🔵 … Какого цвета будет 13-й элемент?	🔴
67	8	PATTERN	PATTERN	Продолжи ряд: 6, 16, 46, 136, ?	406
68	8	ODD	ODD	Найди лишнее число: 27, 125, 8, 64, 25	25
69	8	RIDDLE	RIDDLE	Бабушке и внуку вместе 36 лет. Бабушка старше внука в 5 раз. Сколько лет внуку?	6
70	8	SYMBOLS	SYMBOLS	🍐 + 🍐 = 6, 🍐 + 🍌 = 14, 🍌 × 2 + 🍋 = 32 → 🍋 = ?	10
71	8	BALANCE	BALANCE	🪨 = 3 📦, 📦 = 2 🎁, 🎁 = 3 🎁, 🎁 = 1 кг → 🪨 = ?	18
72	8	RIDDLE	RIDDLE	Узор повторяется: 🔴 🟡 🔵 🔴 🟡 🔵 … Какого цвета будет 17-й элемент?	🟡
73	9	OLYMPIAD	RIDDLE	Сколько раз цифра 7 встречается в числах от 1 до 100?	20
74	9	OLYMPIAD	RIDDLE	Один кирпич весит килограмм и ещё полкирпича. Сколько килограммов весит кирпич?	2
75	9	OLYMPIAD	PATTERN	Продолжи ряд: 1, 11, 21, 1211, 111221, ?	312211
76	9	OLYMPIAD	RIDDLE	Двое играли в шахматы 2 часа. Сколько часов играл каждый?	2
77	10	PATTERN	PATTERN	Продолжи ряд: 5, 15, 45, 135, ?	405
78	10	ODD	ODD	Найди лишнее число: 14, 31, 11, 2, 37	14
79	10	RIDDLE	RIDDLE	Ручка дороже карандаша на 8 руб. Вместе они стоят 24 руб. Сколько стоит ручка?	16
80	10	SYMBOLS	SYMBOLS	🍒 + 🍒 = 6, 🍒 + 🍎 = 10, 🍎 + 🍋 = 13 → 🍋 = ?	6
81	10	BALANCE	BALANCE	2 🪨 = 3 📦, 📦 = 8 кг → 🪨 = ?	12
82	10	RIDDLE	RIDDLE	Сейчас март. Какой месяц наступит через 12 месяцев?	март
83	10	PATTERN	PATTERN	Продолжи ряд: 4, 12, 36, 108, ?	324
84	10	ODD	ODD	Найди лишнее число: 19, 41, 10, 37, 3	10
85	10	RIDDLE	RIDDLE	Вася стоит в очереди 6-й с начала и 5-й с конца. Сколько всего человек в очереди?	10
86	10	SYMBOLS	SYMBOLS	🍌 + 🍌 = 4, 🍌 + 🍒 = 7, 🍒 + 🍋 = 11 → 🍋 = ?	6
87	10	PATTERN	PATTERN	Продолжи ряд: 29, 37, 45, 53, ?	61
88	10	ODD	ODD	Найди лишнее число: 48, 8, 14, 36, 24	14
89	10	RIDDLE	RIDDLE	Бревно длиной 9 метров распилили на части по 1 метру. Сколько сделали распилов?	8
90	10	SYMBOLS	SYMBOLS	🍐 × 2 = 18, 🍐 + 🍋 = 12 → 🍋 = ?	3
91	10	BALANCE	BALANCE	🐱 = 3 🐰, 🐰 = 2 🦊, 🦊 = 1 кг → 🐱 = ?	6
92	10	RIDDLE	RIDDLE	Сегодня понедельник. Какой день недели будет через 10 дней?	четверг
93	10	PATTERN	PATTERN	Продолжи ряд: 37, 45, 53, 61, ?	69
94	10	ODD	ODD	Найди лишнее число: 48, 8, 12, 45, 40	45
95	10	PATTERN	PATTERN	Продолжи ряд: 5, 10, 15, 20, ?	25
96	10	ODD	ODD	Найди лишнее число: 22, 24, 10, 57, 14	57
97	10	RIDDLE	RIDDLE	Во дворе 4 кошек (по 4 лапы) и 5 куриц (по 2 лапы). Сколько всего лап?	26
98	10	SYMBOLS	SYMBOLS	🍐 + 🍐 = 10, 🍐 + 🍎 = 14 → 🍎 = ?	9
99	10	BALANCE	BALANCE	🪨 = 3 📦, 📦 = 7 кг → 🪨 = ?	21
100	10	RIDDLE	RIDDLE	Сегодня четверг. Какой день недели будет через 2 дня?	суббота
101	11	PATTERN	PATTERN	Продолжи ряд: 3, 6, 12, 24, ?	48
102	11	ODD	ODD	Найди лишнее число: 19, 24, 41, 7, 17	24
103	11	RIDDLE	RIDDLE	Ручка дороже карандаша на 6 руб. Вместе они стоят 28 руб. Сколько стоит ручка?	17
104	11	SYMBOLS	SYMBOLS	🍋 + 🍋 = 12, 🍋 + 🍒 = 15, 🍒 + 🍎 = 13 → 🍎 = ?	4
105	11	BALANCE	BALANCE	3 🪨 = 5 📦, 📦 = 9 кг → 🪨 = ?	15
106	11	RIDDLE	RIDDLE	Сейчас февраль. Какой месяц наступит через 4 месяцев?	июнь
107	11	PATTERN	PATTERN	Продолжи ряд: 1, 2, 4, 8, ?	16
108	11	ODD	ODD	Найди лишнее число: 28, 3, 17, 43, 29	28
109	11	RIDDLE	RIDDLE	Ручка дороже карандаша на 6 руб. Вместе они стоят 38 руб. Сколько стоит ручка?	22
110	11	SYMBOLS	SYMBOLS	🍇 + 🍇 = 4, 🍇 + 🍎 = 11, 🍎 + 🍌 = 12 → 🍌 = ?	3
111	12	PATTERN	PATTERN	Продолжи ряд: 8, 9, 11, 14, ?	18
112	12	ODD	ODD	Найди лишнее число: 64, 25, 49, 16, 71	71
113	12	RIDDLE	RIDDLE	У Маши было 36 конфет. Она отдала подруге половину и ещё 3 конфеты. Сколько конфет отдала Маша?	21
114	12	SYMBOLS	SYMBOLS	🍌 + 🍌 = 28, 🍌 + 🍒 = 17, 🍒 × 2 + 🍎 = 10 → 🍎 = ?	4
115	12	BALANCE	BALANCE	2 🐱 = 5 🐰, 🐱 = 20 кг → 🐰 = ?	8
116	12	RIDDLE	RIDDLE	Буквы идут по алфавиту, но некоторые пропущены: А, В, Д. Какая буква будет следующей?	Ё
117	12	PATTERN	PATTERN	Продолжи ряд: 2, 6, 11, 17, ?	24
118	12	ODD	ODD	Найди лишнее число: 10, 81, 100, 25, 36	10
119	12	RIDDLE	RIDDLE	У Маши было 22 конфет. Она отдала подруге половину и ещё 3 конфеты. Сколько конфет отдала Маша?	14
120	12	SYMBOLS	SYMBOLS	🍎 + 🍎 = 18, 🍎 + 🍇 = 21, 🍇 × 2 + 🍌 = 38 → 🍌 = ?	14
121	13	OLYMPIAD	RIDDLE	Полтора судака стоят полтора рубля. Сколько рублей стоят 5 судаков?	5
122	13	OLYMPIAD	RIDDLE	Одно яйцо варится 4 минуты. Сколько минут варятся 5 яиц?	4
123	13	OLYMPIAD	RIDDLE	Книга стоит 100 рублей и ещё полкниги. Сколько стоит книга?	200
124	13	OLYMPIAD	RIDDLE	На берёзе росло 8 яблок. Ветер сдул 3. Сколько яблок осталось на берёзе?	0
125	14	PATTERN	PATTERN	Продолжи ряд: 10, 13, 16, 19, ?	22
126	14	ODD	ODD	Найди лишнее число: 10, 28, 23, 6, 2	23
127	14	RIDDLE	RIDDLE	Кате 15 лет, её брат на 5 года младше. Сколько лет брату?	10
128	14	SYMBOLS	SYMBOLS	🍇 + 🍇 = 12, 🍇 + 🍎 = 14 → 🍎 = ?	8
129	14	BALANCE	BALANCE	🪨 = 3 📦, 📦 = 2 кг → 🪨 = ?	6
130	14	RIDDLE	RIDDLE	Сегодня понедельник. Какой день недели будет через 2 дня?	среда
131	15	PATTERN	PATTERN	Продолжи ряд: 27, 31, 35, 39, ?	43
132	15	ODD	ODD	Найди лишнее число: 36, 16, 43, 48, 40	43
133	15	RIDDLE	RIDDLE	Через 4 лет Пете будет 16 лет. Сколько лет Пете сейчас?	12
134	15	SYMBOLS	SYMBOLS	🍋 × 2 = 14, 🍋 + 🍐 = 9 → 🍐 = ?	2
135	15	RIDDLE	RIDDLE	Сегодня воскресенье. Какой день недели будет через 15 дней?	понедельник
136	15	PATTERN	PATTERN	Продолжи ряд: 33, 38, 43, 48, ?	53
137	15	ODD	ODD	Найди лишнее число: 40, 22, 32, 20, 36	22
138	15	RIDDLE	RIDDLE	Бревно длиной 7 метров распилили на части по 1 метру. Сколько сделали распилов?	6
139	16	PATTERN	PATTERN	Продолжи ряд: 5, 15, 45, 135, ?	405
140	16	ODD	ODD	Найди лишнее число: 47, 17, 5, 13, 24	24
141	16	RIDDLE	RIDDLE	Вася стоит в очереди 3-й с начала и 6-й с конца. Сколько всего человек в очереди?	8
142	16	SYMBOLS	SYMBOLS	🍌 + 🍌 = 12, 🍌 + 🍐 = 9, 🍐 + 🍇 = 6 → 🍇 = ?	3
143	16	BALANCE	BALANCE	3 🪨 = 5 📦, 📦 = 12 кг → 🪨 = ?	20
144	16	RIDDLE	RIDDLE	Сейчас май. Какой месяц наступит через 10 месяцев?	март
145	16	ODD	ODD	Найди лишнее число: 2, 29, 30, 7, 5	30
146	16	RIDDLE	RIDDLE	Вася стоит в очереди 2-й с начала и 3-й с конца. Сколько всего человек в очереди?	4
147	16	SYMBOLS	SYMBOLS	🍐 + 🍐 = 14, 🍐 + 🍌 = 9, 🍌 + 🍎 = 7 → 🍎 = ?	5
148	16	BALANCE	BALANCE	3 🪨 = 4 📦, 📦 = 12 кг → 🪨 = ?	16
149	17	PATTERN	PATTERN	Продолжи ряд: 5, 6, 8, 11, ?	15
150	17	ODD	ODD	Найди лишнее число: 64, 4, 81, 49, 16	81
151	17	RIDDLE	RIDDLE	Улитка за день поднимается по столбу на 3 дм, а за ночь сползает на 1 дм. Столб высотой 6 дм. На какой день улитка доберётся до вершины?	2
152	17	SYMBOLS	SYMBOLS	🍌 + 🍌 = 4, 🍌 + 🍐 = 4, 🍐 × 2 + 🍇 = 13 → 🍇 = ?	9
153	17	BALANCE	BALANCE	3 🐱 = 5 🐰, 🐱 = 20 кг → 🐰 = ?	12
154	17	RIDDLE	RIDDLE	Буквы идут по алфавиту, но некоторые пропущены: Д, Е, Ё. Какая буква будет следующей?	Ж
155	17	PATTERN	PATTERN	Продолжи ряд: 1, 4, 8, 13, ?	19
156	17	ODD	ODD	Найди лишнее число: 49, 64, 36, 100, 16	49
157	17	RIDDLE	RIDDLE	Улитка за день поднимается по столбу на 5 дм, а за ночь сползает на 1 дм. Столб высотой 7 дм. На какой день улитка доберётся до вершины?	1
158	17	SYMBOLS	SYMBOLS	🍎 + 🍎 = 24, 🍎 + 🍒 = 18, 🍒 × 2 + 🍌 = 15 → 🍌 = ?	3
159	18	PATTERN	PATTERN	Продолжи ряд: 6, 16, 46, 136, ?	406
160	18	ODD	ODD	Найди лишнее число: 64, 125, 8, 27, 33	33
161	18	RIDDLE	RIDDLE	В классе 7 учеников. Каждый подарил по открытке всем остальным. Сколько всего открытек подарили?	42
162	18	SYMBOLS	SYMBOLS	🍇 + 🍇 = 30, 🍇 + 🍒 = 17, 🍒 × 2 + 🍐 = 16 → 🍐 = ?	12
163	18	BALANCE	BALANCE	🪨 = 2 📦, 📦 = 2 🎁, 🎁 = 4 🎁, 🎁 = 1 кг → 🪨 = ?	16
164	18	RIDDLE	RIDDLE	Узор повторяется: 🔴 🟡 🔵 🔴 🟡 🔵 … Какого цвета будет 19-й элемент?	🔴
165	18	ODD	ODD	Найди лишнее число: 64, 125, 8, 9, 27	9
166	18	SYMBOLS	SYMBOLS	🍐 + 🍐 = 4, 🍐 + 🍒 = 8, 🍒 × 2 + 🍇 = 26 → 🍇 = ?	14
167	18	BALANCE	BALANCE	🪨 = 3 📦, 📦 = 2 🎁, 🎁 = 3 🎁, 🎁 = 1 кг → 🪨 = ?	18
168	18	RIDDLE	RIDDLE	Узор повторяется: 🔴 🟡 🔵 🔴 🟡 🔵 … Какого цвета будет 20-й элемент?	🟡
169	18	PATTERN	PATTERN	Продолжи ряд: 19, 25, 22, 28, 25, 31, ?	28
170	18	ODD	ODD	Найди лишнее число: 8, 27, 17, 64, 125	17
171	19	OLYMPIAD	RIDDLE	У Маши было 3 яблока, 2 половинки и 4 четвертинки. Сколько всего яблок у Маши?	5
172	19	OLYMPIAD	RIDDLE	Сколько концов у трёх с половиной палок?	8
173	19	OLYMPIAD	ODD	Найди лишнее: круг, квадрат, треугольник, куб	куб
174	19	OLYMPIAD	RIDDLE	Термометр показывает 5 градусов. Сколько градусов покажут два таких термометра?	5
\.


--
-- Data for Name: logic_cards; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.logic_cards (id, child_id, card_date, final_level, label, description, task_count, task_types, minutes, status, started_at, deadline, submitted_at, result_percent, xp_reward, xp_earned, created_at) FROM stdin;
3	1	2026-11-08	EXTREME	Хард	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	12	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	50	CREATED	\N	\N	\N	\N	75	0	2026-11-09 03:24:21.474712+03
15	1	2026-11-09	MEDIUM	Средний	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	8	PATTERN,ODD,RIDDLE,SYMBOLS	35	CREATED	\N	\N	\N	\N	10	0	2026-11-09 15:37:41.339871+03
16	1	2026-11-09	HIGH	Высокий	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	10	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	40	CREATED	\N	\N	\N	\N	25	0	2026-11-09 15:37:41.358247+03
6	6	2026-11-08	HIGH	Высокий	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	10	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	40	FAILED	2026-11-09 04:54:09.904128+03	2026-11-09 05:34:09.904128+03	2026-11-09 04:54:09.921267+03	0	25	0	2026-11-09 04:53:14.171748+03
2	1	2026-11-08	MEDIUM	Средний	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	8	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	35	CREATED	\N	\N	\N	\N	10	0	2026-11-09 03:14:47.497353+03
17	1	2026-11-09	HARD	Сложный	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	10	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	45	CREATED	\N	\N	\N	\N	50	0	2026-11-09 15:37:41.367873+03
1	1	2026-11-08	EASY	Легкий	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	6	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	30	CREATED	\N	\N	\N	\N	5	0	2026-11-09 02:48:30.910866+03
7	6	2026-11-08	HARD	Сложный	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	10	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	45	CREATED	\N	\N	\N	\N	50	0	2026-11-09 04:53:14.186411+03
8	6	2026-11-08	EXTREME	Хард	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	12	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	50	CREATED	\N	\N	\N	\N	75	0	2026-11-09 04:53:14.200617+03
9	6	2026-11-08	OLYMPIAD	Олимпиада	Олимпиада · Логика 5-6 класс	4	RIDDLE,PATTERN	60	CREATED	\N	\N	\N	\N	125	0	2026-11-09 04:53:14.213226+03
18	1	2026-11-09	EXTREME	Хард	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	12	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	50	CREATED	\N	\N	\N	\N	75	0	2026-11-09 15:37:41.375345+03
19	1	2026-11-09	OLYMPIAD	Олимпиада	Олимпиада · Логика 1-2 класс	4	RIDDLE,ODD	60	CREATED	\N	\N	\N	\N	125	0	2026-11-09 15:37:41.385837+03
4	6	2026-11-08	EASY	Легкий	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	6	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	30	FAILED	2026-11-09 04:54:39.757946+03	2026-11-09 05:24:39.757946+03	2026-11-09 04:54:39.784598+03	0	5	0	2026-11-09 04:53:14.146679+03
5	6	2026-11-08	MEDIUM	Средний	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	8	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	35	FAILED	2026-11-09 04:54:09.672227+03	2026-11-09 05:29:09.672227+03	2026-11-09 04:54:09.701349+03	0	10	0	2026-11-09 04:53:14.159291+03
10	6	2026-11-08	REVIEW	Работа над ошибками	Повтори задачи, где были ошибки	24	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	0	APPROVED	\N	\N	\N	\N	0	0	2026-11-09 04:54:39.801192+03
11	1	2026-11-08	HIGH	Высокий	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	10	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	40	CREATED	\N	\N	\N	\N	25	0	2026-11-09 04:55:00.457205+03
12	1	2026-11-08	HARD	Сложный	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	10	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	45	CREATED	\N	\N	\N	\N	50	0	2026-11-09 04:55:00.471539+03
13	1	2026-11-08	OLYMPIAD	Олимпиада	Олимпиада · Логика 3-4 класс	4	RIDDLE	60	CREATED	\N	\N	\N	\N	125	0	2026-11-09 04:55:00.47662+03
14	1	2026-11-09	EASY	Легкий	Сегодня тренируем: Закономерности, Найди лишнее, Логические загадки, Символьная алгебра, Весы и пропорции, Последовательности	6	PATTERN,ODD,RIDDLE,SYMBOLS,BALANCE	30	CREATED	\N	\N	\N	\N	5	0	2026-11-09 15:37:41.211581+03
\.


--
-- Data for Name: logic_olympiad_cards; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.logic_olympiad_cards (id, title, grade_label, minutes) FROM stdin;
1	Олимпиада · Логика 1-2 класс	1-2 класс	60
2	Олимпиада · Логика 3-4 класс	3-4 класс	60
3	Олимпиада · Логика 5-6 класс	5-6 класс	60
4	Олимпиада · Логика 7-8 класс	7-8 класс	60
\.


--
-- Data for Name: logic_olympiad_tasks; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.logic_olympiad_tasks (id, card_id, task_type, text, answer) FROM stdin;
1	1	RIDDLE	У Маши было 3 яблока, 2 половинки и 4 четвертинки. Сколько всего яблок у Маши?	5
2	1	RIDDLE	Сколько концов у трёх с половиной палок?	8
3	1	ODD	Найди лишнее: круг, квадрат, треугольник, куб	куб
4	1	RIDDLE	Термометр показывает 5 градусов. Сколько градусов покажут два таких термометра?	5
5	2	RIDDLE	Полтора судака стоят полтора рубля. Сколько рублей стоят 5 судаков?	5
6	2	RIDDLE	Одно яйцо варится 4 минуты. Сколько минут варятся 5 яиц?	4
7	2	RIDDLE	Книга стоит 100 рублей и ещё полкниги. Сколько стоит книга?	200
8	2	RIDDLE	На берёзе росло 8 яблок. Ветер сдул 3. Сколько яблок осталось на берёзе?	0
9	3	RIDDLE	Сколько раз цифра 7 встречается в числах от 1 до 100?	20
10	3	RIDDLE	Один кирпич весит килограмм и ещё полкирпича. Сколько килограммов весит кирпич?	2
11	3	PATTERN	Продолжи ряд: 1, 11, 21, 1211, 111221, ?	312211
12	3	RIDDLE	Двое играли в шахматы 2 часа. Сколько часов играл каждый?	2
13	4	RIDDLE	Сумма трёх последовательных чётных чисел равна 42. Найди наибольшее из них	16
14	4	RIDDLE	Сколько диагоналей у восьмиугольника?	20
15	4	RIDDLE	Возраст дедушки выражается наименьшим трёхзначным числом, записанным разными цифрами. Сколько лет дедушке?	102
16	4	RIDDLE	Петя сказал: «Позавчера мне было 10 лет, а в следующем году исполнится 13». Какое число его день рождения?	31
\.


--
-- Data for Name: logic_topic_settings; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.logic_topic_settings (id, parent_id, topic_id, active, base_difficulty) FROM stdin;
1	1	1	t	MEDIUM
2	1	2	t	MEDIUM
3	1	3	t	MEDIUM
4	1	4	t	MEDIUM
5	1	5	t	MEDIUM
6	1	6	t	MEDIUM
7	4	1	t	MEDIUM
8	4	2	t	MEDIUM
9	4	3	t	MEDIUM
10	4	4	t	MEDIUM
11	4	5	t	MEDIUM
12	4	6	t	MEDIUM
\.


--
-- Data for Name: logic_topics; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.logic_topics (id, code, name, grade_label, sort_order) FROM stdin;
1	PATTERN	Закономерности	1-2 класс	1
2	ODD	Найди лишнее	1-3 класс	2
3	RIDDLE	Логические загадки	2-5 класс	3
4	SYMBOLS	Символьная алгебра	3-5 класс	4
5	BALANCE	Весы и пропорции	4-6 класс	5
6	SEQUENCES	Последовательности	5-8 класс	6
\.


--
-- Data for Name: math_attempts; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.math_attempts (id, task_id, child_id, answer, correct, points, attempted_at) FROM stdin;
\.


--
-- Data for Name: math_card_attempts; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.math_card_attempts (id, task_id, answer, correct, attempted_at) FROM stdin;
1	66	0	t	2026-11-09 03:43:03.687592+03
2	67	6	t	2026-11-09 03:43:03.72398+03
3	68	6	f	2026-11-09 03:43:03.724909+03
4	69	2	f	2026-11-09 03:43:03.72521+03
5	70	6	f	2026-11-09 03:43:03.725499+03
6	71	-8	t	2026-11-09 03:43:03.725821+03
7	72	2	f	2026-11-09 03:43:03.726077+03
8	73	3	t	2026-11-09 03:43:03.726341+03
9	74	42	f	2026-11-09 03:53:48.082323+03
10	75	999	f	2026-11-09 03:53:48.121178+03
11	76	abc	f	2026-11-09 03:53:48.121974+03
12	77	42	f	2026-11-09 03:53:48.122298+03
13	78	42	f	2026-11-09 03:53:48.122574+03
14	79	42	f	2026-11-09 03:53:48.122923+03
15	80	42	f	2026-11-09 03:53:48.123219+03
16	81	42	f	2026-11-09 03:53:48.123648+03
17	20		f	2026-11-09 04:28:35.267276+03
18	21		f	2026-11-09 04:28:35.278624+03
19	22		f	2026-11-09 04:28:35.279303+03
20	23		f	2026-11-09 04:28:35.279652+03
21	24		f	2026-11-09 04:28:35.279968+03
22	25		f	2026-11-09 04:28:35.280761+03
23	26		f	2026-11-09 04:28:35.281232+03
24	27		f	2026-11-09 04:28:35.281612+03
25	28		f	2026-11-09 04:28:35.28195+03
26	29		f	2026-11-09 04:28:35.282271+03
27	94		f	2026-11-09 04:28:59.18797+03
28	95		f	2026-11-09 04:28:59.18889+03
29	96		f	2026-11-09 04:28:59.189258+03
30	97		f	2026-11-09 04:28:59.189606+03
31	98		f	2026-11-09 04:28:59.189947+03
32	99		f	2026-11-09 04:28:59.190266+03
33	100		f	2026-11-09 04:28:59.19059+03
34	101		f	2026-11-09 04:28:59.190924+03
35	102		f	2026-11-09 04:28:59.1913+03
36	103		f	2026-11-09 04:28:59.191584+03
37	104		f	2026-11-09 04:28:59.191934+03
38	105		f	2026-11-09 04:28:59.192316+03
39	106		f	2026-11-09 04:28:59.192995+03
40	107		f	2026-11-09 04:28:59.193642+03
41	184	0	f	2026-11-09 04:30:34.792028+03
42	185	0	f	2026-11-09 04:30:34.801447+03
43	186	0	f	2026-11-09 04:30:34.802093+03
44	187	0	f	2026-11-09 04:30:34.802466+03
45	188	0	f	2026-11-09 04:30:34.802789+03
46	189	0	f	2026-11-09 04:30:34.803075+03
47	190	0	f	2026-11-09 04:30:34.803333+03
48	191	0	f	2026-11-09 04:30:34.803582+03
49	192	0	f	2026-11-09 04:30:34.803809+03
50	193	0	f	2026-11-09 04:30:34.804035+03
51	194	0	f	2026-11-09 04:30:34.804255+03
52	195	0	f	2026-11-09 04:30:34.80448+03
53	196	0	f	2026-11-09 04:30:34.804797+03
54	197	0	f	2026-11-09 04:30:34.805082+03
55	198	0	f	2026-11-09 04:30:34.805354+03
56	199	0	f	2026-11-09 04:30:34.805626+03
57	200	0	f	2026-11-09 04:30:34.805891+03
58	201	0	f	2026-11-09 04:30:34.80615+03
59	202	0	f	2026-11-09 04:30:34.806384+03
60	203	0	f	2026-11-09 04:30:34.806612+03
61	204	0	f	2026-11-09 04:30:34.806837+03
62	205	0	f	2026-11-09 04:30:34.807054+03
63	206	0	f	2026-11-09 04:30:34.807294+03
64	207	0	f	2026-11-09 04:30:34.807582+03
65	208	0	f	2026-11-09 04:30:34.807867+03
66	209	0	f	2026-11-09 04:30:34.808143+03
67	210	0	f	2026-11-09 04:30:34.80838+03
68	211	0	f	2026-11-09 04:30:34.808881+03
69	212	0	f	2026-11-09 04:30:34.809265+03
70	213	0	f	2026-11-09 04:30:34.809538+03
71	214	0	f	2026-11-09 04:30:34.809811+03
72	215	0	f	2026-11-09 04:30:34.810059+03
\.


--
-- Data for Name: math_card_tasks; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.math_card_tasks (id, card_id, topic_code, task_type, text, answer) FROM stdin;
74	3	ADD_SUB	CALC	1 + 5	6
75	3	MUL_DIV	CALC	2 × 8	16
76	3	EQUATIONS	EQUATION	8 · x = 24	3
77	3	VARIABLES	TEXT	Найди x: 4·x + 2 = 22	5
78	3	FRACTIONS	TEXT	2/3 + 1/3 = ?	1
79	3	NEGATIVE	CALC	7 − 2 (знак результата)	5
80	3	ROOTS	CALC	√9 + 1	4
81	3	SQUARES_CUBES	CALC	3²	9
82	4	ADD_SUB	CALC	120 + 212	332
83	4	MUL_DIV	CALC	4 × 8	32
84	4	EQUATIONS	EQUATION	x − 5 = 3	8
85	4	VARIABLES	TEXT	Найди x: 4·x + 8 = 12	1
86	4	FRACTIONS	TEXT	1/6 + 3/6 = ?	2/3
87	4	NEGATIVE	CALC	(−205) × 217	-44485
88	4	DECIMALS	CALC	1,3 + 2,3 = ?	3,6
89	4	ROOTS	CALC	√16 + 4	8
90	4	SQUARES_CUBES	CALC	7³	343
91	4	ADD_SUB	CALC	178 − 113	65
92	4	MUL_DIV	CALC	7 × 9	63
20	2	ADD_SUB	CALC	82 + 17	99
22	2	EQUATIONS	EQUATION	x ÷ 8 = 76	608
23	2	VARIABLES	TEXT	Найди x: 4·x + 8 = 32	6
24	2	FRACTIONS	TEXT	4/6 − 1/6 = ?	1/2
25	2	NEGATIVE	CALC	(−99) + 82	-17
26	2	DECIMALS	CALC	1,0 + 1,0 = ?	2,0
27	2	ROOTS	CALC	√25 + 2	7
28	2	SQUARES_CUBES	CALC	5²	25
29	2	ADD_SUB	CALC	18 + 31	49
93	4	EQUATIONS	EQUATION	x + 4 = 303	299
94	5	ADD_SUB	CALC	599 − 263	336
95	5	MUL_DIV	CALC	261 ÷ 87	3
96	5	EQUATIONS	EQUATION	4 · x = 1036	259
97	5	VARIABLES	TEXT	Найди x: 2·x + 19 = 85	33
98	5	FRACTIONS	TEXT	1/2 + 1/2 = ?	1
99	5	NEGATIVE	CALC	(−135) × 22	-2970
100	5	DECIMALS	CALC	2,6 + 1,5 = ?	4,1
101	5	ROOTS	CALC	√49 + 3	10
102	5	ADD_SUB	CALC	312 − 307	5
103	5	MUL_DIV	CALC	55 × 10	550
104	5	EQUATIONS	EQUATION	x − 2 = 1	3
105	5	VARIABLES	TEXT	Найди x: 3·x + 6 = 39	11
106	5	FRACTIONS	TEXT	4/9 − 2/9 = ?	2/9
107	5	NEGATIVE	CALC	560 − 222 (знак результата)	338
108	6	ADD_SUB	CALC	470 + 2051	2521
109	6	MUL_DIV	CALC	786 ÷ 393	2
110	6	EQUATIONS	EQUATION	7 · x = 1267	181
111	6	VARIABLES	TEXT	Найди x: 2·x + 11 = 35	12
112	6	FRACTIONS	TEXT	3/8 − 3/8 = ?	0
21	2	MUL_DIV	CALC	10 × 11	110
113	6	NEGATIVE	CALC	1450 − 3282 (знак результата)	-1832
114	6	DECIMALS	CALC	37,4 + 34,5 = ?	71,9
115	6	ROOTS	CALC	√25 + 5	10
116	6	SQUARES_CUBES	CALC	10³	1000
117	6	ADD_SUB	CALC	4601 − 7892	-3291
118	6	MUL_DIV	CALC	165 ÷ 55	3
119	6	EQUATIONS	EQUATION	x ÷ 2 = 3255	6510
120	6	VARIABLES	TEXT	Найди x: 3·x + 5 = 122	39
121	6	FRACTIONS	TEXT	5/7 − 4/7 = ?	1/7
122	6	NEGATIVE	CALC	1971 − 2632 (знак результата)	-661
123	6	DECIMALS	CALC	15,1 + 33,9 = ?	49,0
124	7	OLYMPIAD	CALC	48 ÷ 6 × 3	24
125	7	OLYMPIAD	EQUATION	x · 7 = 56	8
126	7	OLYMPIAD	TEXT	Поезд проехал 240 км за 3 часа. С какой скоростью он ехал?	80
127	7	OLYMPIAD	CALC	100 − 7 × 9	37
128	8	ADD_SUB	CALC	6 + 24	30
66	1	ADD_SUB	CALC	2 − 2	0
68	1	EQUATIONS	EQUATION	x ÷ 7 = 8	56
69	1	VARIABLES	TEXT	Найди x: 2·x + 10 = 16	3
70	1	FRACTIONS	TEXT	2/3 − 1/3 = ?	1/3
71	1	NEGATIVE	CALC	(−4) × 2	-8
72	1	DECIMALS	CALC	1,0 + 1,0 = ?	2,0
73	1	ROOTS	CALC	√4 + 1	3
67	1	MUL_DIV	CALC	2 × 3	6
129	8	MUL_DIV	CALC	8 × 8	64
130	8	EQUATIONS	EQUATION	8 · x = 648	81
131	8	VARIABLES	TEXT	Найди x: 3·x + 10 = 22	4
132	8	FRACTIONS	TEXT	4/5 − 3/5 = ?	1/5
133	8	NEGATIVE	CALC	27 − 48 (знак результата)	-21
134	8	ROOTS	CALC	√25 + 1	6
135	8	SQUARES_CUBES	CALC	3³	27
136	8	ADD_SUB	CALC	61 − 25	36
137	8	MUL_DIV	CALC	18 ÷ 9	2
138	9	ADD_SUB	CALC	179 − 37	142
139	9	MUL_DIV	CALC	23 × 3	69
140	9	EQUATIONS	EQUATION	10 · x = 660	66
141	9	VARIABLES	TEXT	Найди x: 4·x + 15 = 31	4
142	9	FRACTIONS	TEXT	3/5 − 2/5 = ?	1/5
143	9	NEGATIVE	CALC	(−82) + 173	91
144	9	DECIMALS	CALC	2,3 + 2,0 = ?	4,3
145	9	ROOTS	CALC	√25 + 4	9
146	9	SQUARES_CUBES	CALC	3²	9
147	9	ADD_SUB	CALC	192 + 254	446
148	9	MUL_DIV	CALC	300 ÷ 30	10
149	9	EQUATIONS	EQUATION	3 · x = 246	82
150	10	ADD_SUB	CALC	601 − 371	230
151	10	MUL_DIV	CALC	560 ÷ 56	10
152	10	EQUATIONS	EQUATION	x − 2 = 1	3
153	10	VARIABLES	TEXT	Найди x: 3·x + 12 = 87	25
154	10	FRACTIONS	TEXT	1/2 − 1/2 = ?	0
155	10	NEGATIVE	CALC	628 − 744 (знак результата)	-116
156	10	DECIMALS	CALC	9,6 + 1,9 = ?	11,5
157	10	SQUARES_CUBES	CALC	7²	49
158	10	ADD_SUB	CALC	13 + 946	959
159	10	MUL_DIV	CALC	582 ÷ 97	6
160	10	EQUATIONS	EQUATION	6 · x = 3186	531
161	10	VARIABLES	TEXT	Найди x: 3·x + 7 = 94	29
162	10	FRACTIONS	TEXT	2/3 + 1/3 = ?	1
163	10	NEGATIVE	CALC	(−494) + 409	-85
164	11	ADD_SUB	CALC	3116 − 5500	-2384
165	11	MUL_DIV	CALC	535 ÷ 107	5
166	11	EQUATIONS	EQUATION	3 · x = 5259	1753
167	11	VARIABLES	TEXT	Найди x: 3·x + 22 = 70	16
168	11	FRACTIONS	TEXT	7/12 − 2/12 = ?	5/12
169	11	NEGATIVE	CALC	(−4517) × 473	-2136541
170	11	DECIMALS	CALC	9,2 + 12,6 = ?	21,8
171	11	ROOTS	CALC	√36 + 1	7
172	11	SQUARES_CUBES	CALC	4³	64
173	11	ADD_SUB	CALC	3781 − 3062	719
174	11	MUL_DIV	CALC	333 × 12	3996
175	11	EQUATIONS	EQUATION	x ÷ 8 = 1078	8624
176	11	VARIABLES	TEXT	Найди x: 3·x + 7 = 109	34
177	11	FRACTIONS	TEXT	10/11 + 5/11 = ?	15/11
178	11	NEGATIVE	CALC	3297 − 1336 (знак результата)	1961
179	11	DECIMALS	CALC	1,8 + 16,9 = ?	18,7
180	12	OLYMPIAD	FRACTIONS	2/3 + 4/3 = ?	2
181	12	OLYMPIAD	CALC	0,5 × 0,4	0,2
182	12	OLYMPIAD	EQUATION	3x − 7 = 14	7
183	12	OLYMPIAD	TEXT	Сумма трёх последовательных чисел равна 33. Найди их	10,11,12
184	13	ADD_SUB	CALC	599 − 263	336
185	13	MUL_DIV	CALC	261 ÷ 87	3
186	13	EQUATIONS	EQUATION	4 · x = 1036	259
187	13	VARIABLES	TEXT	Найди x: 2·x + 19 = 85	33
188	13	FRACTIONS	TEXT	1/2 + 1/2 = ?	1
189	13	NEGATIVE	CALC	(−135) × 22	-2970
190	13	DECIMALS	CALC	2,6 + 1,5 = ?	4,1
191	13	ROOTS	CALC	√49 + 3	10
192	13	ADD_SUB	CALC	312 − 307	5
193	13	MUL_DIV	CALC	55 × 10	550
194	13	EQUATIONS	EQUATION	x − 2 = 1	3
195	13	VARIABLES	TEXT	Найди x: 3·x + 6 = 39	11
196	13	FRACTIONS	TEXT	4/9 − 2/9 = ?	2/9
197	13	NEGATIVE	CALC	560 − 222 (знак результата)	338
198	13	ADD_SUB	CALC	1 + 5	6
199	13	MUL_DIV	CALC	2 × 8	16
200	13	EQUATIONS	EQUATION	8 · x = 24	3
201	13	VARIABLES	TEXT	Найди x: 4·x + 2 = 22	5
202	13	FRACTIONS	TEXT	2/3 + 1/3 = ?	1
203	13	NEGATIVE	CALC	7 − 2 (знак результата)	5
204	13	ROOTS	CALC	√9 + 1	4
205	13	SQUARES_CUBES	CALC	3²	9
206	13	ADD_SUB	CALC	82 + 17	99
207	13	MUL_DIV	CALC	10 × 11	110
208	13	EQUATIONS	EQUATION	x ÷ 8 = 76	608
209	13	VARIABLES	TEXT	Найди x: 4·x + 8 = 32	6
210	13	FRACTIONS	TEXT	4/6 − 1/6 = ?	1/2
211	13	NEGATIVE	CALC	(−99) + 82	-17
212	13	DECIMALS	CALC	1,0 + 1,0 = ?	2,0
213	13	ROOTS	CALC	√25 + 2	7
214	13	SQUARES_CUBES	CALC	5²	25
215	13	ADD_SUB	CALC	18 + 31	49
224	15	ADD_SUB	CALC	80 − 21	59
225	15	MUL_DIV	CALC	9 × 10	90
226	15	EQUATIONS	EQUATION	x ÷ 4 = 2	8
227	15	VARIABLES	TEXT	Найди x: 4·x + 6 = 14	2
228	15	FRACTIONS	TEXT	2/5 − 1/5 = ?	1/5
229	15	NEGATIVE	CALC	(−56) × 15	-840
230	15	ROOTS	CALC	√16 + 3	7
231	15	SQUARES_CUBES	CALC	4²	16
232	15	ADD_SUB	CALC	87 + 61	148
233	15	MUL_DIV	CALC	5 × 7	35
234	16	ADD_SUB	CALC	263 − 205	58
235	16	MUL_DIV	CALC	15 × 6	90
236	16	EQUATIONS	EQUATION	9 · x = 2493	277
237	16	VARIABLES	TEXT	Найди x: 3·x + 17 = 59	14
238	16	FRACTIONS	TEXT	3/7 + 3/7 = ?	6/7
239	16	NEGATIVE	CALC	(−204) + 257	53
240	16	DECIMALS	CALC	1,2 + 2,9 = ?	4,1
241	16	ROOTS	CALC	√16 + 4	8
242	16	SQUARES_CUBES	CALC	5³	125
243	16	ADD_SUB	CALC	155 + 292	447
244	16	MUL_DIV	CALC	31 × 3	93
245	16	EQUATIONS	EQUATION	x + 7 = 188	181
246	17	ADD_SUB	CALC	662 + 728	1390
247	17	MUL_DIV	CALC	138 ÷ 69	2
248	17	EQUATIONS	EQUATION	x + 3 = 967	964
249	17	VARIABLES	TEXT	Найди x: 2·x + 16 = 68	26
250	17	FRACTIONS	TEXT	1/2 + 1/2 = ?	1
251	17	NEGATIVE	CALC	(−774) + 530	-244
252	17	DECIMALS	CALC	2,8 + 7,8 = ?	10,6
253	17	ROOTS	CALC	√81 + 1	10
254	17	ADD_SUB	CALC	390 − 242	148
255	17	MUL_DIV	CALC	738 ÷ 82	9
256	17	EQUATIONS	EQUATION	x − 4 = 2	6
257	17	VARIABLES	TEXT	Найди x: 3·x + 4 = 55	17
258	17	FRACTIONS	TEXT	3/8 − 1/8 = ?	1/4
259	17	NEGATIVE	CALC	(−243) × 756	-183708
260	18	ADD_SUB	CALC	2690 + 3262	5952
261	18	MUL_DIV	CALC	470 × 12	5640
262	18	EQUATIONS	EQUATION	x + 7 = 2169	2162
263	18	VARIABLES	TEXT	Найди x: 2·x + 21 = 53	16
264	18	NEGATIVE	CALC	2400 − 1186 (знак результата)	1214
265	18	DECIMALS	CALC	17,1 + 13,8 = ?	30,9
266	18	ROOTS	CALC	√100 + 2	12
267	18	ADD_SUB	CALC	4279 − 5121	-842
268	18	MUL_DIV	CALC	440 × 2	880
269	18	EQUATIONS	EQUATION	6 · x = 17844	2974
270	18	VARIABLES	TEXT	Найди x: 3·x + 19 = 103	28
271	18	FRACTIONS	TEXT	1/6 + 3/6 = ?	2/3
272	18	NEGATIVE	CALC	4187 − 1669 (знак результата)	2518
273	18	DECIMALS	CALC	14,7 + 15,4 = ?	30,1
274	18	ROOTS	CALC	√64 + 1	9
275	18	SQUARES_CUBES	CALC	2²	4
276	19	OLYMPIAD	TEXT	В корзине 7 яблок и 3 груши. Сколько всего фруктов в корзине?	10
277	19	OLYMPIAD	CALC	12 + 18 − 15	15
278	19	OLYMPIAD	EQUATION	x + 6 = 14	8
279	19	OLYMPIAD	TEXT	У Маши 18 конфет, у Пети — в 2 раза меньше. Сколько конфет у Пети?	9
280	14	ADD_SUB	CALC	3 − 1	2
283	14	VARIABLES	TEXT	Найди x: 4·x + 5 = 49	11
284	14	NEGATIVE	CALC	(−4) × 1	-4
285	14	ROOTS	CALC	√9 + 2	5
286	14	ADD_SUB	CALC	7 − 1	6
287	14	MUL_DIV	CALC	2 × 10	20
281	14	MUL_DIV	CALC	2 × 7	14
282	14	EQUATIONS	EQUATION	x + 12 = 22	10
\.


--
-- Data for Name: math_cards; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.math_cards (id, child_id, card_date, final_level, label, description, task_count, task_types, minutes, created_at, status, started_at, deadline, submitted_at, result_percent, xp_reward, xp_earned) FROM stdin;
1	1	2026-11-08	EASY	Легкий	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	8	CALC,EQUATION,TEXT	30	2026-11-09 02:48:46.430298+03	FAILED	2026-11-09 03:42:12.273074+03	2026-11-09 04:12:12.273074+03	2026-11-09 03:43:03.727492+03	50	5	4
15	1	2026-11-09	MEDIUM	Средний	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	10	CALC,EQUATION,TEXT	35	2026-11-09 15:39:24.608829+03	CREATED	\N	\N	\N	\N	10	0
4	6	2026-11-08	HIGH	Высокий	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	12	CALC,EQUATION,TEXT	40	2026-11-09 03:30:07.330248+03	CREATED	\N	\N	\N	\N	25	0
6	6	2026-11-08	EXTREME	Хард	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	16	CALC,EQUATION,TEXT	50	2026-11-09 03:30:07.35693+03	CREATED	\N	\N	\N	\N	75	0
7	6	2026-11-08	OLYMPIAD	Олимпиада	Олимпиада · 4 класс	4	CALC,EQUATION,TEXT	60	2026-11-09 03:30:07.370341+03	CREATED	\N	\N	\N	\N	125	0
2	6	2026-11-08	MEDIUM	Средний	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	10	CALC,EQUATION,TEXT	35	2026-11-09 03:13:11.552224+03	FAILED	2026-11-09 04:28:35.2396+03	2026-11-09 05:03:35.2396+03	2026-11-09 04:28:35.282585+03	0	10	0
8	1	2026-11-08	MEDIUM	Средний	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	10	CALC,EQUATION,TEXT	35	2026-11-09 03:30:33.87765+03	CREATED	\N	\N	\N	\N	10	0
9	1	2026-11-08	HIGH	Высокий	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	12	CALC,EQUATION,TEXT	40	2026-11-09 03:30:33.889565+03	CREATED	\N	\N	\N	\N	25	0
10	1	2026-11-08	HARD	Сложный	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	14	CALC,EQUATION,TEXT	45	2026-11-09 03:30:33.897951+03	CREATED	\N	\N	\N	\N	50	0
11	1	2026-11-08	EXTREME	Хард	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	16	CALC,EQUATION,TEXT	50	2026-11-09 03:30:33.906417+03	CREATED	\N	\N	\N	\N	75	0
12	1	2026-11-08	OLYMPIAD	Олимпиада	Олимпиада · 5-6 класс	4	FRACTIONS,CALC,EQUATION,TEXT	60	2026-11-09 03:30:33.916493+03	CREATED	\N	\N	\N	\N	125	0
16	1	2026-11-09	HIGH	Высокий	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	12	CALC,EQUATION,TEXT	40	2026-11-09 15:39:24.619363+03	CREATED	\N	\N	\N	\N	25	0
17	1	2026-11-09	HARD	Сложный	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	14	CALC,EQUATION,TEXT	45	2026-11-09 15:39:24.630326+03	CREATED	\N	\N	\N	\N	50	0
5	6	2026-11-08	HARD	Сложный	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	14	CALC,EQUATION,TEXT	45	2026-11-09 03:30:07.343656+03	FAILED	2026-11-09 04:28:59.174258+03	2026-11-09 05:13:59.174258+03	2026-11-09 04:28:59.194061+03	0	50	0
18	1	2026-11-09	EXTREME	Хард	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	16	CALC,EQUATION,TEXT	50	2026-11-09 15:39:24.647253+03	CREATED	\N	\N	\N	\N	75	0
3	6	2026-11-08	EASY	Легкий	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	8	CALC,EQUATION,TEXT	30	2026-11-09 03:30:07.284093+03	FAILED	2026-11-09 03:52:40.224506+03	2026-11-09 04:22:40.224506+03	2026-11-09 03:53:48.123963+03	0	5	0
14	1	2026-11-09	EASY	Легкий	Сегодня тренируем: Сложение / Вычитание, Умножение / Деление, Уравнения, Задачи с переменными, Дроби, Минусовые числа, Десятичные дроби, Корни, Квадраты / Кубы	8	CALC,EQUATION,TEXT	30	2026-11-09 15:39:24.486661+03	CREATED	\N	\N	\N	\N	5	0
13	6	2026-11-08	REVIEW	Работа над ошибками	Повтори задачи, где были ошибки	32	CALC,EQUATION,TEXT	0	2026-11-09 04:28:59.221013+03	FAILED	2026-11-09 04:30:15.749226+03	\N	2026-11-09 04:30:34.810332+03	0	0	0
19	1	2026-11-09	OLYMPIAD	Олимпиада	Олимпиада · 3 класс	4	TEXT,CALC,EQUATION	60	2026-11-09 15:39:24.666006+03	CREATED	\N	\N	\N	\N	125	0
\.


--
-- Data for Name: math_olympiad_cards; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.math_olympiad_cards (id, title, grade_label, minutes) FROM stdin;
1	Олимпиада · 3 класс	3 класс	60
2	Олимпиада · 4 класс	4 класс	60
3	Олимпиада · 5-6 класс	5-6 класс	60
4	Олимпиада · 7-8 класс	7-8 класс	60
\.


--
-- Data for Name: math_olympiad_tasks; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.math_olympiad_tasks (id, card_id, task_type, text, answer) FROM stdin;
1	1	TEXT	В корзине 7 яблок и 3 груши. Сколько всего фруктов в корзине?	10
2	1	CALC	12 + 18 − 15	15
3	1	EQUATION	x + 6 = 14	8
4	1	TEXT	У Маши 18 конфет, у Пети — в 2 раза меньше. Сколько конфет у Пети?	9
5	2	CALC	48 ÷ 6 × 3	24
6	2	EQUATION	x · 7 = 56	8
7	2	TEXT	Поезд проехал 240 км за 3 часа. С какой скоростью он ехал?	80
8	2	CALC	100 − 7 × 9	37
9	3	FRACTIONS	2/3 + 4/3 = ?	2
10	3	CALC	0,5 × 0,4	0,2
11	3	EQUATION	3x − 7 = 14	7
12	3	TEXT	Сумма трёх последовательных чисел равна 33. Найди их	10,11,12
13	4	CALC	√144 + 5²	37
14	4	EQUATION	2(x + 3) = 18	6
15	4	NEGATIVE	(−7) + 12 − 3	2
16	4	TEXT	Катеты прямоугольного треугольника 6 и 8. Найди гипотенузу	10
\.


--
-- Data for Name: math_tasks; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.math_tasks (id, store_id, child_id, title, description, answer, points, active, created_at) FROM stdin;
1	2	1	3+3	3+3=	4	20.00	t	2026-11-09 02:46:12.754716+03
\.


--
-- Data for Name: math_topic_settings; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.math_topic_settings (id, parent_id, topic_id, active, base_difficulty) FROM stdin;
1	1	1	t	MEDIUM
2	1	2	t	MEDIUM
3	1	3	t	MEDIUM
4	1	4	t	MEDIUM
5	1	5	t	MEDIUM
6	1	6	t	MEDIUM
7	1	7	t	MEDIUM
8	1	8	t	MEDIUM
9	1	9	t	MEDIUM
10	4	1	t	MEDIUM
11	4	2	t	MEDIUM
12	4	3	t	MEDIUM
13	4	4	t	MEDIUM
14	4	5	t	MEDIUM
15	4	6	t	MEDIUM
16	4	7	t	MEDIUM
17	4	8	t	MEDIUM
18	4	9	t	MEDIUM
\.


--
-- Data for Name: math_topics; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.math_topics (id, code, name, grade_label, sort_order) FROM stdin;
1	ADD_SUB	Сложение / Вычитание	3 класс	1
2	MUL_DIV	Умножение / Деление	3 класс	2
3	EQUATIONS	Уравнения	3-4 класс	3
4	VARIABLES	Задачи с переменными	4-5 класс	4
5	FRACTIONS	Дроби	5 класс	5
6	NEGATIVE	Минусовые числа	6 класс	6
7	DECIMALS	Десятичные дроби	6 класс	7
8	ROOTS	Корни	7-8 класс	8
9	SQUARES_CUBES	Квадраты / Кубы	7-8 класс	9
\.


--
-- Data for Name: parent_notifications; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.parent_notifications (id, parent_id, child_id, type, title, payload, ref_type, ref_id, status, created_at) FROM stdin;
1	3	3	LIMIT_C1	Лимит «Лего» на сегодня исчерпан	Время на устройстве закончилось	limit	3	NEW	2026-11-08 17:06:24.994452+03
3	1	1	BOOK_REQUEST	Хочет книгу: Нарния	Заявка на новую книгу	readingRequest	1	DONE	2026-11-08 23:22:44.010592+03
2	1	1	READING_DONE	Прочитал книгу: Гарри Поттер и Тайная комната	Подтверди прочитанное	readingLog	3	DONE	2026-11-08 23:21:59.778778+03
4	1	1	CARD_REVEAL	Выбрал карточку: 2+2	Хочет раскрыть карточку	card	1	DONE	2026-11-09 02:47:32.77619+03
5	1	1	HOUSE_CHECK	Проверь комнату	Ребёнок просит проверить комнату (2026-11-09)	house	1	DONE	2026-11-09 05:22:17.077917+03
\.


--
-- Data for Name: pocket_disbursements; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.pocket_disbursements (id, child_id, amount, week_start, created_at) FROM stdin;
\.


--
-- Data for Name: pocket_extensions; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.pocket_extensions (id, child_id, week_start, amount, created_at) FROM stdin;
\.


--
-- Data for Name: pocket_requests; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.pocket_requests (id, child_id, amount, status, created_at, resolved_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.products (id, store_id, name, description, price, limit_per_child, active, created_at, effect_type, effect_limit, effect_value) FROM stdin;
1	1	Японские сладости	\N	200.00	\N	t	2026-11-07 21:39:04.357749+03	NONE	\N	0
2	1	Редкая газировка	\N	120.00	\N	t	2026-11-07 21:39:04.361951+03	NONE	\N	0
3	1	Мерч из сериала	\N	600.00	\N	t	2026-11-07 21:39:04.362712+03	NONE	\N	0
4	1	Комикс в оригинале	\N	500.00	\N	t	2026-11-07 21:39:04.363217+03	NONE	\N	0
5	1	Скин в игре на иностранном	\N	300.00	\N	t	2026-11-07 21:39:04.363524+03	NONE	\N	0
6	2	Пополнить карту на 1000 руб.	\N	1000.00	\N	t	2026-11-07 21:39:39.599904+03	NONE	\N	0
7	2	Увеличить карманные деньги на неделю на 100 руб.	\N	1000.00	\N	t	2026-11-07 21:39:39.601165+03	NONE	\N	0
8	2	Увеличить лимит на Телевизор на 15 минут	\N	500.00	\N	t	2026-11-07 21:39:39.601473+03	NONE	\N	0
9	2	Увеличить лимит на Компьютер и приставку на 15 минут	\N	1000.00	\N	t	2026-11-07 21:39:39.601715+03	NONE	\N	0
10	2	Увеличить лимит на Телефон на 15 минут	\N	1500.00	\N	t	2026-11-07 21:39:39.601936+03	NONE	\N	0
11	2	Скачать приложение или игру на телефон	\N	300.00	\N	t	2026-11-07 21:39:39.602164+03	NONE	\N	0
12	2	Поход в кино-театр	\N	800.00	\N	t	2026-11-07 21:39:39.602398+03	NONE	\N	0
13	2	Поездка в аквапарк	\N	2500.00	\N	t	2026-11-07 21:39:39.602602+03	NONE	\N	0
14	2	Поездка в парк аттракционов	\N	5000.00	\N	t	2026-11-07 21:39:39.602806+03	NONE	\N	0
15	3	Крутой мяч	\N	300.00	\N	t	2026-11-07 21:43:30.040093+03	NONE	\N	0
16	3	Фитнес-браслет	\N	2000.00	\N	t	2026-11-07 21:43:30.042321+03	NONE	\N	0
17	3	Маркеры Copic	\N	1500.00	\N	t	2026-11-07 21:43:30.042816+03	NONE	\N	0
18	3	Билет на картинг	\N	1200.00	\N	t	2026-11-07 21:43:30.043202+03	NONE	\N	0
19	3	Поход на скалодром	\N	800.00	\N	t	2026-11-07 21:43:30.043579+03	NONE	\N	0
20	4	1 серия мультик/аниме	\N	50.00	\N	t	2026-11-07 21:46:02.322198+03	NONE	\N	0
21	4	1 фильм/мультфильм	\N	150.00	\N	t	2026-11-07 21:46:02.324217+03	NONE	\N	0
22	4	30 минут игра на PS4	\N	75.00	\N	t	2026-11-07 21:46:02.324584+03	NONE	\N	0
23	4	30 минут игра на Компьютере	\N	100.00	\N	t	2026-11-07 21:46:02.324879+03	NONE	\N	0
24	4	15 минут лимита на телефоне	\N	100.00	\N	t	2026-11-07 21:46:02.325187+03	NONE	\N	0
25	4	30 минут ютуб	\N	120.00	\N	t	2026-11-07 21:46:02.325632+03	NONE	\N	0
26	4	Поход в кино-театр	\N	800.00	\N	t	2026-11-07 21:46:02.325865+03	NONE	\N	0
27	4	Безлимит на телефон на день	\N	1000.00	\N	t	2026-11-07 21:46:02.326081+03	NONE	\N	0
28	4	Поездка в аквапарк	\N	2500.00	\N	t	2026-11-07 21:46:02.326418+03	NONE	\N	0
29	4	Поездка в парк аттракционов	\N	5000.00	\N	t	2026-11-07 21:46:02.32667+03	NONE	\N	0
30	5	Кубик Рубика	\N	120.00	\N	t	2026-11-07 21:46:12.19606+03	NONE	\N	0
31	5	Настольная игра «Эволюция»	\N	800.00	\N	t	2026-11-07 21:46:12.198112+03	NONE	\N	0
32	5	Набор фокусов	\N	400.00	\N	t	2026-11-07 21:46:12.19866+03	NONE	\N	0
33	5	Невидимые чернила	\N	150.00	\N	t	2026-11-07 21:46:12.199149+03	NONE	\N	0
34	5	Квест в реальности	\N	1000.00	\N	t	2026-11-07 21:46:12.199602+03	NONE	\N	0
45	7	Кубик Рубика	\N	120.00	\N	t	2026-11-08 17:06:38.446538+03	NONE	\N	0
46	7	Настольная игра «Эволюция»	\N	800.00	\N	t	2026-11-08 17:06:38.44958+03	NONE	\N	0
47	7	Набор фокусов	\N	400.00	\N	t	2026-11-08 17:06:38.450142+03	NONE	\N	0
48	7	Невидимые чернила	\N	150.00	\N	t	2026-11-08 17:06:38.450402+03	NONE	\N	0
49	7	Квест в реальности	\N	1000.00	\N	t	2026-11-08 17:06:38.450618+03	NONE	\N	0
50	8	1 серия мультик/аниме	\N	50.00	\N	t	2026-11-08 18:17:12.266946+03	NONE	\N	0
51	8	1 фильм/мультфильм	\N	150.00	\N	t	2026-11-08 18:17:12.270834+03	NONE	\N	0
52	8	30 минут игра на PS4	\N	75.00	\N	t	2026-11-08 18:17:12.271555+03	NONE	\N	0
53	8	30 минут игра на Компьютере	\N	100.00	\N	t	2026-11-08 18:17:12.271968+03	NONE	\N	0
54	8	15 минут лимита на телефоне	\N	100.00	\N	t	2026-11-08 18:17:12.272351+03	NONE	\N	0
55	8	30 минут ютуб	\N	120.00	\N	t	2026-11-08 18:17:12.273068+03	NONE	\N	0
56	8	Поход в кино-театр	\N	800.00	\N	t	2026-11-08 18:17:12.273826+03	NONE	\N	0
57	8	Безлимит на телефон на день	\N	1000.00	\N	t	2026-11-08 18:17:12.274203+03	NONE	\N	0
58	8	Поездка в аквапарк	\N	2500.00	\N	t	2026-11-08 18:17:12.274562+03	NONE	\N	0
59	8	Поездка в парк аттракционов	\N	5000.00	\N	t	2026-11-08 18:17:12.274885+03	NONE	\N	0
60	9	Пополнить карту на 1000 руб.	\N	1000.00	\N	t	2026-11-08 18:17:12.307071+03	NONE	\N	0
61	9	Увеличить карманные деньги на неделю на 100 руб.	\N	1000.00	\N	t	2026-11-08 18:17:12.307649+03	NONE	\N	0
62	9	Увеличить лимит на Телевизор на 15 минут	\N	500.00	\N	t	2026-11-08 18:17:12.308023+03	NONE	\N	0
63	9	Увеличить лимит на Компьютер и приставку на 15 минут	\N	1000.00	\N	t	2026-11-08 18:17:12.308413+03	NONE	\N	0
64	9	Увеличить лимит на Телефон на 15 минут	\N	1500.00	\N	t	2026-11-08 18:17:12.308796+03	NONE	\N	0
65	9	Скачать приложение или игру на телефон	\N	300.00	\N	t	2026-11-08 18:17:12.30918+03	NONE	\N	0
66	9	Поход в кино-театр	\N	800.00	\N	t	2026-11-08 18:17:12.310486+03	NONE	\N	0
67	9	Поездка в аквапарк	\N	2500.00	\N	t	2026-11-08 18:17:12.310952+03	NONE	\N	0
68	9	Поездка в парк аттракционов	\N	5000.00	\N	t	2026-11-08 18:17:12.311297+03	NONE	\N	0
69	10	Покупки на Озон 65 руб.	\N	65.00	\N	t	2026-11-08 18:17:12.333005+03	NONE	\N	0
70	10	Умный свет	\N	46.00	\N	t	2026-11-08 18:17:12.333514+03	NONE	\N	0
71	10	Игровая приставка	\N	231.00	\N	t	2026-11-08 18:17:12.33393+03	NONE	\N	0
72	10	Прикроватная тумбочка	\N	107.00	\N	t	2026-11-08 18:17:12.334335+03	NONE	\N	0
73	10	Пуфик зверушка	\N	107.00	\N	t	2026-11-08 18:17:12.334699+03	NONE	\N	0
74	10	Средний мягкий ковер	\N	185.00	\N	t	2026-11-08 18:17:12.335065+03	NONE	\N	0
75	10	Кровать домиком	\N	462.00	\N	t	2026-11-08 18:17:12.335414+03	NONE	\N	0
76	10	Алиса мини	\N	124.00	\N	t	2026-11-08 18:17:12.335795+03	NONE	\N	0
77	10	Телевизор 43"	\N	308.00	\N	t	2026-11-08 18:17:12.336158+03	NONE	\N	0
78	10	Замок на двери	\N	999.00	\N	t	2026-11-08 18:17:12.336522+03	NONE	\N	0
79	11	Японские сладости	\N	200.00	\N	t	2026-11-08 18:17:12.376418+03	NONE	\N	0
80	11	Редкая газировка	\N	120.00	\N	t	2026-11-08 18:17:12.376784+03	NONE	\N	0
81	11	Мерч из сериала	\N	600.00	\N	t	2026-11-08 18:17:12.377128+03	NONE	\N	0
82	11	Комикс в оригинале	\N	500.00	\N	t	2026-11-08 18:17:12.377523+03	NONE	\N	0
83	11	Скин в игре на иностранном	\N	300.00	\N	t	2026-11-08 18:17:12.377872+03	NONE	\N	0
84	12	Крутой мяч	\N	300.00	\N	t	2026-11-08 18:17:12.399445+03	NONE	\N	0
85	12	Фитнес-браслет	\N	2000.00	\N	t	2026-11-08 18:17:12.399839+03	NONE	\N	0
86	12	Маркеры Copic	\N	1500.00	\N	t	2026-11-08 18:17:12.400133+03	NONE	\N	0
87	12	Билет на картинг	\N	1200.00	\N	t	2026-11-08 18:17:12.400413+03	NONE	\N	0
88	12	Поход на скалодром	\N	800.00	\N	t	2026-11-08 18:17:12.400729+03	NONE	\N	0
89	13	1 серия мультик/аниме	\N	50.00	\N	t	2026-11-08 23:18:51.461597+03	NONE	\N	0
90	13	1 фильм/мультфильм	\N	150.00	\N	t	2026-11-08 23:18:51.46685+03	NONE	\N	0
91	13	30 минут игра на PS4	\N	75.00	\N	t	2026-11-08 23:18:51.467494+03	NONE	\N	0
92	13	30 минут игра на Компьютере	\N	100.00	\N	t	2026-11-08 23:18:51.46792+03	NONE	\N	0
93	13	15 минут лимита на телефоне	\N	100.00	\N	t	2026-11-08 23:18:51.468367+03	NONE	\N	0
94	13	30 минут ютуб	\N	120.00	\N	t	2026-11-08 23:18:51.468951+03	NONE	\N	0
95	13	Поход в кино-театр	\N	800.00	\N	t	2026-11-08 23:18:51.469418+03	NONE	\N	0
96	13	Безлимит на телефон на день	\N	1000.00	\N	t	2026-11-08 23:18:51.469677+03	NONE	\N	0
97	13	Поездка в аквапарк	\N	2500.00	\N	t	2026-11-08 23:18:51.469909+03	NONE	\N	0
98	13	Поездка в парк аттракционов	\N	5000.00	\N	t	2026-11-08 23:18:51.470112+03	NONE	\N	0
99	13	Закладка-герой	Красивая закладка	15.00	1	t	2026-11-08 23:18:51.585257+03	NONE	\N	0
100	14	Пополнить карту на 1000 руб.	\N	1000.00	\N	t	2026-11-09 03:13:11.417869+03	NONE	\N	0
101	14	Увеличить карманные деньги на неделю на 100 руб.	\N	1000.00	\N	t	2026-11-09 03:13:11.422803+03	NONE	\N	0
102	14	Увеличить лимит на Телевизор на 15 минут	\N	500.00	\N	t	2026-11-09 03:13:11.423956+03	NONE	\N	0
103	14	Увеличить лимит на Компьютер и приставку на 15 минут	\N	1000.00	\N	t	2026-11-09 03:13:11.42448+03	NONE	\N	0
104	14	Увеличить лимит на Телефон на 15 минут	\N	1500.00	\N	t	2026-11-09 03:13:11.42493+03	NONE	\N	0
105	14	Скачать приложение или игру на телефон	\N	300.00	\N	t	2026-11-09 03:13:11.425375+03	NONE	\N	0
106	14	Поход в кино-театр	\N	800.00	\N	t	2026-11-09 03:13:11.426109+03	NONE	\N	0
107	14	Поездка в аквапарк	\N	2500.00	\N	t	2026-11-09 03:13:11.426556+03	NONE	\N	0
108	14	Поездка в парк аттракционов	\N	5000.00	\N	t	2026-11-09 03:13:11.42711+03	NONE	\N	0
109	15	Кубик Рубика	\N	120.00	\N	t	2026-11-09 04:53:13.87513+03	NONE	\N	0
110	15	Настольная игра «Эволюция»	\N	800.00	\N	t	2026-11-09 04:53:13.878252+03	NONE	\N	0
111	15	Набор фокусов	\N	400.00	\N	t	2026-11-09 04:53:13.878828+03	NONE	\N	0
112	15	Невидимые чернила	\N	150.00	\N	t	2026-11-09 04:53:13.879496+03	NONE	\N	0
113	15	Квест в реальности	\N	1000.00	\N	t	2026-11-09 04:53:13.880044+03	NONE	\N	0
114	16	Покупки на Озон 65 руб.	\N	65.00	\N	t	2026-11-09 05:01:26.418277+03	NONE	\N	0
115	16	Умный свет	\N	46.00	\N	t	2026-11-09 05:01:26.431648+03	NONE	\N	0
116	16	Игровая приставка	\N	231.00	\N	t	2026-11-09 05:01:26.432024+03	NONE	\N	0
117	16	Прикроватная тумбочка	\N	107.00	\N	t	2026-11-09 05:01:26.432309+03	NONE	\N	0
118	16	Пуфик зверушка	\N	107.00	\N	t	2026-11-09 05:01:26.432887+03	NONE	\N	0
119	16	Средний мягкий ковер	\N	185.00	\N	t	2026-11-09 05:01:26.433217+03	NONE	\N	0
120	16	Кровать домиком	\N	462.00	\N	t	2026-11-09 05:01:26.4335+03	NONE	\N	0
121	16	Алиса мини	\N	124.00	\N	t	2026-11-09 05:01:26.433756+03	NONE	\N	0
122	16	Телевизор 43"	\N	308.00	\N	t	2026-11-09 05:01:26.434005+03	NONE	\N	0
123	16	Замок на двери	\N	999.00	\N	t	2026-11-09 05:01:26.43421+03	NONE	\N	0
124	17	Покупки на Озон 65 руб.	\N	65.00	\N	t	2026-11-09 05:16:13.588575+03	NONE	\N	0
125	17	Умный свет	\N	46.00	\N	t	2026-11-09 05:16:13.605501+03	NONE	\N	0
126	17	Игровая приставка	\N	231.00	\N	t	2026-11-09 05:16:13.606464+03	NONE	\N	0
127	17	Прикроватная тумбочка	\N	107.00	\N	t	2026-11-09 05:16:13.607492+03	NONE	\N	0
128	17	Пуфик зверушка	\N	107.00	\N	t	2026-11-09 05:16:13.608031+03	NONE	\N	0
129	17	Средний мягкий ковер	\N	185.00	\N	t	2026-11-09 05:16:13.608363+03	NONE	\N	0
130	17	Кровать домиком	\N	462.00	\N	t	2026-11-09 05:16:13.608575+03	NONE	\N	0
131	17	Алиса мини	\N	124.00	\N	t	2026-11-09 05:16:13.610505+03	NONE	\N	0
132	17	Телевизор 43"	\N	308.00	\N	t	2026-11-09 05:16:13.610698+03	NONE	\N	0
133	17	Замок на двери	\N	999.00	\N	t	2026-11-09 05:16:13.610891+03	NONE	\N	0
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.purchases (id, child_id, store_id, product_id, amount, status, created_at, confirmed_at) FROM stdin;
\.


--
-- Data for Name: quest_submissions; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.quest_submissions (id, quest_id, child_id, status, comment, photo_url, created_at, resolved_at) FROM stdin;
\.


--
-- Data for Name: quests; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.quests (id, parent_id, child_id, type, title, description, icon, reward_store_id, reward_amount, xp_reward, seasonal_event_id, repeatable, active, created_at, basic_description, accept_description, duration_minutes, cooldown_hours) FROM stdin;
\.


--
-- Data for Name: reading_bookmarks; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.reading_bookmarks (id, child_id, book_id, page, updated_at) FROM stdin;
1	1	4	352	2026-11-08 23:21:59.737703+03
\.


--
-- Data for Name: reading_books; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.reading_books (id, store_id, child_id, name, author, series, genre, pages, multiplier, active, created_at) FROM stdin;
1	4	1	Гарри Поттер и узник Азкабана	Дж. К. Роулинг	Гарри Поттер	Фэнтези	480	1.00	t	2026-11-08 23:17:07.70327+03
2	13	6	Гарри Поттер и философский камень	Дж. Роулинг	Гарри Поттер	Фэнтези	432	1.00	t	2026-11-08 23:18:51.525469+03
3	13	6	Незнайка на Луне	Н. Носов	\N	Приключения	360	1.50	t	2026-11-08 23:18:51.548352+03
4	4	1	Гарри Поттер и Тайная комната	Дж. К. Роулинг	Гарри Поттер	Фэнтези	352	1.00	t	2026-11-08 23:19:28.713377+03
5	4	1	Последняя битва	К. С. Льюис	Хроники Нарнии	Сказки, мифы и легенды	192	1.00	t	2026-11-08 23:23:32.56938+03
\.


--
-- Data for Name: reading_logs; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.reading_logs (id, child_id, book_id, points, status, read_at, created_at) FROM stdin;
1	6	2	432.00	APPROVED	2026-11-08	2026-11-08 23:19:02.145858+03
2	1	1	480.00	APPROVED	2026-11-08	2026-11-08 23:19:24.556548+03
3	1	4	352.00	APPROVED	2026-11-08	2026-11-08 23:21:59.771041+03
\.


--
-- Data for Name: reading_page_marks; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.reading_page_marks (id, child_id, book_id, page, day, created_at) FROM stdin;
1	1	4	352	2026-11-08	2026-11-08 23:21:59.737703+03
\.


--
-- Data for Name: reading_requests; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.reading_requests (id, child_id, store_id, title, status, created_at, resolved_at) FROM stdin;
1	1	4	Нарния	APPROVED	2026-11-08 23:22:44.000347+03	2026-11-08 23:23:32.56927+03
\.


--
-- Data for Name: reading_settings; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.reading_settings (child_id, store_id, pages_target, reward_amount, xp_reward, updated_at) FROM stdin;
6	13	20	5.00	10	2026-11-08 23:18:51.610063+03
\.


--
-- Data for Name: seasonal_events; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.seasonal_events (id, parent_id, name, description, token_name, token_icon, starts_at, ends_at, active, created_at) FROM stdin;
\.


--
-- Data for Name: skill_activations; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.skill_activations (id, child_id, skill, store_id, created_at) FROM stdin;
1	1	LANG	1	2026-11-07 21:39:04.367734+03
2	1	MATH	2	2026-11-07 21:39:39.60595+03
3	1	SPORT	3	2026-11-07 21:43:30.047053+03
4	1	READING	4	2026-11-07 21:46:02.337421+03
5	1	LOGIC	5	2026-11-07 21:46:12.207384+03
7	3	LOGIC	7	2026-11-08 17:06:38.454559+03
8	3	READING	8	2026-11-08 18:17:12.283975+03
9	3	MATH	9	2026-11-08 18:17:12.314888+03
11	3	LANG	11	2026-11-08 18:17:12.382743+03
12	3	SPORT	12	2026-11-08 18:17:12.402807+03
13	3	HOUSE	10	2026-11-08 18:17:37.853601+03
14	5	READING	4	2026-11-08 23:16:36.380045+03
15	6	READING	13	2026-11-08 23:18:51.472168+03
16	6	MATH	14	2026-11-09 03:13:11.434858+03
17	6	LOGIC	15	2026-11-09 04:53:13.88995+03
18	1	HOUSE	16	2026-11-09 05:01:26.441438+03
19	6	HOUSE	17	2026-11-09 05:16:13.619903+03
20	5	LOGIC	5	2026-11-09 17:44:11.04423+03
\.


--
-- Data for Name: sport_card_tasks; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.sport_card_tasks (id, card_id, title, description) FROM stdin;
1	1	Постой в планке 1 минуту	Не прогибай поясницу!
2	1	Сделай «велосипед» 30 секунд	Лёжа на спине, крути педали ногами.
3	1	Сделай 12 «мельниц»	Наклоны с поворотом, руки в стороны.
4	1	Постой в «стульчике» у стены 45 секунд	Бёдра параллельно полу.
5	1	Сделай 20 махов ногами	По 10 на каждую ногу, держись за опору.
6	2	Сделай «велосипед» 30 секунд	Лёжа на спине, крути педали ногами.
7	2	Сделай 15 подъёмов на пресс	Колени согнуты, руки за головой.
8	2	Прыгни через скакалку 50 раз	Можно по 10 раз с передышками.
9	2	Сделай 20 махов ногами	По 10 на каждую ногу, держись за опору.
10	2	Присядь 20 раз	Пятки от пола не отрывай, спина прямая.
\.


--
-- Data for Name: sport_cards; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.sport_cards (id, child_id, card_date, direction_id, status, base_reward, multiplier, xp_earned, parent_comment, submitted_at, created_at) FROM stdin;
1	1	2026-11-07	1	CREATED	10	1	0	\N	\N	2026-11-07 21:44:34.361571+03
2	1	2026-11-08	1	CREATED	10	1	0	\N	\N	2026-11-09 04:32:30.396382+03
\.


--
-- Data for Name: sport_directions; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.sport_directions (id, child_id, name, icon, status, created_at) FROM stdin;
1	1	Физкультура	🏃	ACTIVE	2026-11-07 21:44:27.309845+03
2	1	Физкультура	🏃	ACTIVE	2026-11-07 21:44:27.329547+03
\.


--
-- Data for Name: sport_requests; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.sport_requests (id, child_id, name, comment, status, created_at) FROM stdin;
\.


--
-- Data for Name: sport_tasks; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.sport_tasks (id, direction_id, title, description, grade_min, grade_max, sort_order) FROM stdin;
1	1	Отожмись 10 раз	Можно с колен — главное держать спину прямо.	1	3	0
2	1	Присядь 20 раз	Пятки от пола не отрывай, спина прямая.	1	3	1
3	1	Постой в планке 30 секунд	Тело — прямая линия от головы до пяток.	1	3	2
4	1	Сделай 20 прыжков «звёздочкой»	Руки и ноги в стороны в прыжке.	1	4	3
5	1	Побегай на месте 2 минуты	Высоко поднимай колени.	1	5	4
6	1	Сделай «велосипед» 30 секунд	Лёжа на спине, крути педали ногами.	1	4	5
7	1	Прыгни через скакалку 50 раз	Можно по 10 раз с передышками.	1	4	6
8	1	Сделай 15 наклонов вперёд	Тянись пальцами к носочкам.	1	5	7
9	1	Сделай 15 подъёмов на пресс	Колени согнуты, руки за головой.	1	5	8
10	2	Отожмись 10 раз	Можно с колен — главное держать спину прямо.	1	3	0
11	1	Сделай 20 махов ногами	По 10 на каждую ногу, держись за опору.	1	4	9
12	1	Постой в «ласточке» 20 секунд	По 2 раза на каждую ногу.	1	5	10
13	2	Присядь 20 раз	Пятки от пола не отрывай, спина прямая.	1	3	1
14	1	Сделай упражнение «кошка» 10 раз	Прогибай и выгибай спину на четвереньках.	1	4	11
15	2	Постой в планке 30 секунд	Тело — прямая линия от головы до пяток.	1	3	2
16	1	Подтянься на турнике 1–3 раза	Если сложно — просто виси 30 секунд.	2	5	12
17	2	Сделай 20 прыжков «звёздочкой»	Руки и ноги в стороны в прыжке.	1	4	3
18	1	Побегай на месте 3 минуты с высоким подниманием колен	Держи темп.	2	6	13
19	1	Сделай 12 «мельниц»	Наклоны с поворотом, руки в стороны.	2	6	14
20	2	Побегай на месте 2 минуты	Высоко поднимай колени.	1	5	4
21	2	Сделай «велосипед» 30 секунд	Лёжа на спине, крути педали ногами.	1	4	5
22	1	Попрыгай через скакалку 100 раз	Можно считать сериями по 25.	3	6	15
23	2	Прыгни через скакалку 50 раз	Можно по 10 раз с передышками.	1	4	6
24	1	Постой в планке 1 минуту	Не прогибай поясницу!	3	8	16
25	1	Сделай 20 отжиманий	Корпус — одна прямая линия.	4	8	17
26	2	Сделай 15 наклонов вперёд	Тянись пальцами к носочкам.	1	5	7
27	2	Сделай 15 подъёмов на пресс	Колени согнуты, руки за головой.	1	5	8
28	1	Сделай 30 приседаний	Таз до уровня колен и ниже.	4	8	18
29	1	Сделай 25 подъёмов на пресс	Медленно, без рывков.	4	8	19
30	2	Сделай 20 махов ногами	По 10 на каждую ногу, держись за опору.	1	4	9
31	1	Сделай 20 выпадов (по 10 на ногу)	Колено не выходит за носок.	4	8	20
32	2	Постой в «ласточке» 20 секунд	По 2 раза на каждую ногу.	1	5	10
33	1	Сделай 10 бёрпи	Присед — отжимание — прыжок вверх.	5	8	21
34	2	Сделай упражнение «кошка» 10 раз	Прогибай и выгибай спину на четвереньках.	1	4	11
35	1	Постой в «стульчике» у стены 45 секунд	Бёдра параллельно полу.	4	8	22
36	2	Подтянься на турнике 1–3 раза	Если сложно — просто виси 30 секунд.	2	5	12
37	1	Сделай «берёзку» 30 секунд	Поддерживай поясницу руками.	3	7	23
38	2	Побегай на месте 3 минуты с высоким подниманием колен	Держи темп.	2	6	13
39	2	Сделай 12 «мельниц»	Наклоны с поворотом, руки в стороны.	2	6	14
40	1	Сделай 3 мостика	Прогнись назад с опорой на руки.	4	8	24
41	1	Подтянись 3–5 раз	Прямым хватом, до подбородка.	5	8	25
42	2	Попрыгай через скакалку 100 раз	Можно считать сериями по 25.	3	6	15
43	2	Постой в планке 1 минуту	Не прогибай поясницу!	3	8	16
44	1	Попрыгай через скакалку 200 раз	Старайся не запинаться.	6	8	26
45	1	Постой в планке 2 минуты	Держи живот подтянутым.	6	8	27
46	2	Сделай 20 отжиманий	Корпус — одна прямая линия.	4	8	17
47	2	Сделай 30 приседаний	Таз до уровня колен и ниже.	4	8	18
48	1	Сделай 15 бёрпи	На скорость, но с правильной техникой!	6	8	28
49	1	Сделай 20 приседаний с прыжком	Мягко приземляйся на носки.	6	8	29
50	2	Сделай 25 подъёмов на пресс	Медленно, без рывков.	4	8	19
51	1	Сделай 10 отжиманий с хлопком	Взрывные отжимания — для сильных!	7	8	30
54	1	Сделай 20 выпадов с гантелями 2 кг	По 10 на каждую ногу, спина прямая.	7	8	31
55	1	Сделай 40 подъёмов на пресс	Можно сериями по 10.	7	8	32
58	1	Подтянись 5–10 раз	Полная амплитуда.	7	8	33
59	1	Постой в планке на локтях 90 секунд	Таз не задирай.	7	8	34
62	1	Сделай 10 выпрыгиваний из глубокого приседа	Прыгай максимально высоко.	7	8	35
52	2	Сделай 20 выпадов (по 10 на ногу)	Колено не выходит за носок.	4	8	20
53	2	Сделай 10 бёрпи	Присед — отжимание — прыжок вверх.	5	8	21
56	2	Постой в «стульчике» у стены 45 секунд	Бёдра параллельно полу.	4	8	22
57	2	Сделай «берёзку» 30 секунд	Поддерживай поясницу руками.	3	7	23
60	2	Сделай 3 мостика	Прогнись назад с опорой на руки.	4	8	24
61	2	Подтянись 3–5 раз	Прямым хватом, до подбородка.	5	8	25
63	2	Попрыгай через скакалку 200 раз	Старайся не запинаться.	6	8	26
64	2	Постой в планке 2 минуты	Держи живот подтянутым.	6	8	27
65	2	Сделай 15 бёрпи	На скорость, но с правильной техникой!	6	8	28
66	2	Сделай 20 приседаний с прыжком	Мягко приземляйся на носки.	6	8	29
67	2	Сделай 10 отжиманий с хлопком	Взрывные отжимания — для сильных!	7	8	30
68	2	Сделай 20 выпадов с гантелями 2 кг	По 10 на каждую ногу, спина прямая.	7	8	31
69	2	Сделай 40 подъёмов на пресс	Можно сериями по 10.	7	8	32
70	2	Подтянись 5–10 раз	Полная амплитуда.	7	8	33
71	2	Постой в планке на локтях 90 секунд	Таз не задирай.	7	8	34
72	2	Сделай 10 выпрыгиваний из глубокого приседа	Прыгай максимально высоко.	7	8	35
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.stores (id, parent_id, name, description, currency_name, currency_icon, active, created_at, template_type, wardrobe, seasonal_event_id) FROM stdin;
1	1	Иностранный язык	Ежедневные дейлики языка: карточки слов. 1 выученное слово = 1 лингво-миля.	лингво-мили	✈️	t	2026-11-07 21:39:04.346887+03	LANG	f	\N
2	1	Математика	Родитель составляет задачи, ребёнок решает и получает матриксы за правильные ответы.	Матриксы	🪙	t	2026-11-07 21:39:39.594394+03	MATH	f	\N
3	1	Спорт и хобби	Ежедневные дейлики спорта и творчества: 10 минут активности = 1 очко энергии, 2000 шагов = 1 очко.	очки энергии	⚡	t	2026-11-07 21:43:30.029784+03	SPORT	f	\N
4	1	Чтение	Баллы за прочитанные книги: страницы × множитель. Родитель отмечает прочитанное, ребёнок копит фолианты.	Фолианты	📖	t	2026-11-07 21:46:02.31208+03	READING	f	\N
5	1	Логика	Ежедневные дейлики логики: загадки, ребусы и задачи на мышление. 1 правильный ответ = 1 IQ-коин. Блок без ошибок даёт бонус XP.	IQ-коины	🧠	t	2026-11-07 21:46:12.191207+03	LOGIC	f	\N
7	3	Логика	Ежедневные дейлики логики: загадки, ребусы и задачи на мышление. 1 правильный ответ = 1 IQ-коин. Блок без ошибок даёт бонус XP.	IQ-коины	🧠	t	2026-11-08 17:06:38.44109+03	LOGIC	f	\N
8	3	Чтение	Баллы за прочитанные книги: страницы × множитель. Родитель отмечает прочитанное, ребёнок копит фолианты.	Фолианты	📖	t	2026-11-08 18:17:12.238164+03	READING	f	\N
9	3	Математика	Родитель составляет задачи, ребёнок решает и получает матриксы за правильные ответы.	Матриксы	🪙	t	2026-11-08 18:17:12.30631+03	MATH	f	\N
10	3	Дом	Календарь домашних дел: хозяйственность и помощь по дому. Румы начисляются автоматически за каждый отмеченный день.	Румы	🧹	t	2026-11-08 18:17:12.332395+03	HOME	f	\N
11	3	Иностранный язык	Ежедневные дейлики языка: карточки слов. 1 выученное слово = 1 лингво-миля.	лингво-мили	✈️	t	2026-11-08 18:17:12.375857+03	LANG	f	\N
12	3	Спорт и хобби	Ежедневные дейлики спорта и творчества: 10 минут активности = 1 очко энергии, 2000 шагов = 1 очко.	очки энергии	⚡	t	2026-11-08 18:17:12.398785+03	SPORT	f	\N
13	4	Чтение	Баллы за прочитанные книги: страницы × множитель. Родитель отмечает прочитанное, ребёнок копит фолианты.	Фолианты	📖	t	2026-11-08 23:18:51.458284+03	READING	f	\N
14	4	Математика	Родитель составляет задачи, ребёнок решает и получает матриксы за правильные ответы.	Матриксы	🪙	t	2026-11-09 03:13:11.35396+03	MATH	f	\N
15	4	Логика	Ежедневные дейлики логики: загадки, ребусы и задачи на мышление. 1 правильный ответ = 1 IQ-коин. Блок без ошибок даёт бонус XP.	IQ-коины	🧠	t	2026-11-09 04:53:13.855655+03	LOGIC	f	\N
16	1	Дом	Календарь домашних дел: хозяйственность и помощь по дому. Румы начисляются автоматически за каждый отмеченный день.	Румы	🧹	t	2026-11-09 05:01:26.382813+03	HOME	f	\N
17	4	Дом	Календарь домашних дел: хозяйственность и помощь по дому. Румы начисляются автоматически за каждый отмеченный день.	Румы	🧹	t	2026-11-09 05:16:13.515123+03	HOME	f	\N
\.


--
-- Data for Name: task_cards; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.task_cards (id, parent_id, store_id, child_id, skill, title, description, icon, difficulty, tasks_json, duration_minutes, reward_amount, reward_store_id, xp_reward, house_bonus, rarity, hidden_reward, success_percent, active, created_at) FROM stdin;
1	1	\N	\N	MATH	2+2	222	🎴	EASY	[{"q":"2+2=","a":"4"}]	10	10.00	\N	100	0	COMMON	f	80	t	2026-11-09 02:45:49.324029+03
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.users (id, email, password_hash, name, created_at, email_verified, verification_code, verification_expires, reset_token, reset_expires) FROM stdin;
1	xxxgendelfxxx@gmail.com	$2a$10$ezaemxvH9fvxqup7YNNm4e.lcpiH3LyyG13XouG2B8b8NDQ0DegqC	Vlad	2026-11-07 21:37:15.743361+03	t	\N	\N	\N	\N
3	limits-test@example.com	$2a$10$DbWX85TV1yMG2Jt0cJ05F.JCYG8wNJFW0lr/uyLbMUpiKrFwZevcG	Лимиты Тест	2026-11-08 16:08:27.149698+03	t	\N	\N	\N	\N
4	reading-ui-test@example.com	$2a$10$r/7pmn7/YXmZKY8TBVTGaOOVGiVRk8mOBlmNI543T0eAT9LGDpNju	Тест Чтения	2026-11-08 23:18:12.862755+03	t	\N	\N	\N	\N
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: familymarket
--

COPY public.wishlist_items (id, child_id, title, status, created_at, link, price, desire) FROM stdin;
\.


--
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.achievements_id_seq', 1875, true);


--
-- Name: avatar_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.avatar_items_id_seq', 1, false);


--
-- Name: balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.balances_id_seq', 4, true);


--
-- Name: child_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.child_achievements_id_seq', 11, true);


--
-- Name: child_avatar_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.child_avatar_items_id_seq', 1, false);


--
-- Name: child_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.child_equipment_id_seq', 1, false);


--
-- Name: child_quest_states_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.child_quest_states_id_seq', 1, false);


--
-- Name: child_task_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.child_task_cards_id_seq', 1, true);


--
-- Name: child_tracked_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.child_tracked_achievements_id_seq', 1, false);


--
-- Name: children_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.children_id_seq', 6, true);


--
-- Name: daily_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.daily_logs_id_seq', 4, true);


--
-- Name: deposits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.deposits_id_seq', 1, false);


--
-- Name: dungeon_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.dungeon_sessions_id_seq', 1, false);


--
-- Name: equipment_defs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.equipment_defs_id_seq', 703, true);


--
-- Name: house_check_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.house_check_requests_id_seq', 1, true);


--
-- Name: house_days_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.house_days_id_seq', 9, true);


--
-- Name: inventory_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.inventory_items_id_seq', 1, false);


--
-- Name: lang_card_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.lang_card_attempts_id_seq', 1, false);


--
-- Name: lang_card_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.lang_card_settings_id_seq', 6, true);


--
-- Name: lang_card_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.lang_card_tasks_id_seq', 1, false);


--
-- Name: lang_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.lang_cards_id_seq', 1, false);


--
-- Name: lang_word_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.lang_word_progress_id_seq', 2, true);


--
-- Name: lang_words_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.lang_words_id_seq', 3325, true);


--
-- Name: limit_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.limit_events_id_seq', 6, true);


--
-- Name: limit_freeze_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.limit_freeze_id_seq', 1, false);


--
-- Name: limit_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.limit_usage_id_seq', 3, true);


--
-- Name: logic_card_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.logic_card_attempts_id_seq', 24, true);


--
-- Name: logic_card_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.logic_card_tasks_id_seq', 174, true);


--
-- Name: logic_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.logic_cards_id_seq', 19, true);


--
-- Name: logic_olympiad_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.logic_olympiad_cards_id_seq', 4, true);


--
-- Name: logic_olympiad_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.logic_olympiad_tasks_id_seq', 16, true);


--
-- Name: logic_topic_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.logic_topic_settings_id_seq', 12, true);


--
-- Name: logic_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.logic_topics_id_seq', 114, true);


--
-- Name: math_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.math_attempts_id_seq', 1, false);


--
-- Name: math_card_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.math_card_attempts_id_seq', 72, true);


--
-- Name: math_card_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.math_card_tasks_id_seq', 287, true);


--
-- Name: math_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.math_cards_id_seq', 19, true);


--
-- Name: math_olympiad_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.math_olympiad_cards_id_seq', 4, true);


--
-- Name: math_olympiad_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.math_olympiad_tasks_id_seq', 16, true);


--
-- Name: math_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.math_tasks_id_seq', 1, true);


--
-- Name: math_topic_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.math_topic_settings_id_seq', 18, true);


--
-- Name: math_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.math_topics_id_seq', 171, true);


--
-- Name: parent_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.parent_notifications_id_seq', 5, true);


--
-- Name: pocket_disbursements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.pocket_disbursements_id_seq', 1, false);


--
-- Name: pocket_extensions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.pocket_extensions_id_seq', 1, false);


--
-- Name: pocket_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.pocket_requests_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.products_id_seq', 133, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.purchases_id_seq', 1, false);


--
-- Name: quest_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.quest_submissions_id_seq', 1, false);


--
-- Name: quests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.quests_id_seq', 1, false);


--
-- Name: reading_bookmarks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.reading_bookmarks_id_seq', 1, true);


--
-- Name: reading_books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.reading_books_id_seq', 5, true);


--
-- Name: reading_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.reading_logs_id_seq', 3, true);


--
-- Name: reading_page_marks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.reading_page_marks_id_seq', 1, true);


--
-- Name: reading_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.reading_requests_id_seq', 1, true);


--
-- Name: seasonal_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.seasonal_events_id_seq', 1, false);


--
-- Name: skill_activations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.skill_activations_id_seq', 20, true);


--
-- Name: sport_card_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.sport_card_tasks_id_seq', 10, true);


--
-- Name: sport_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.sport_cards_id_seq', 2, true);


--
-- Name: sport_directions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.sport_directions_id_seq', 2, true);


--
-- Name: sport_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.sport_requests_id_seq', 1, false);


--
-- Name: sport_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.sport_tasks_id_seq', 72, true);


--
-- Name: stores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.stores_id_seq', 17, true);


--
-- Name: task_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.task_cards_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: wishlist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familymarket
--

SELECT pg_catalog.setval('public.wishlist_items_id_seq', 1, false);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: avatar_items avatar_items_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.avatar_items
    ADD CONSTRAINT avatar_items_pkey PRIMARY KEY (id);


--
-- Name: balances balances_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.balances
    ADD CONSTRAINT balances_pkey PRIMARY KEY (id);


--
-- Name: child_achievements child_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_achievements
    ADD CONSTRAINT child_achievements_pkey PRIMARY KEY (id);


--
-- Name: child_avatar_items child_avatar_items_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_avatar_items
    ADD CONSTRAINT child_avatar_items_pkey PRIMARY KEY (id);


--
-- Name: child_equipment child_equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_equipment
    ADD CONSTRAINT child_equipment_pkey PRIMARY KEY (id);


--
-- Name: child_limits child_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_limits
    ADD CONSTRAINT child_limits_pkey PRIMARY KEY (child_id);


--
-- Name: child_quest_states child_quest_states_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_quest_states
    ADD CONSTRAINT child_quest_states_pkey PRIMARY KEY (id);


--
-- Name: child_task_cards child_task_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_task_cards
    ADD CONSTRAINT child_task_cards_pkey PRIMARY KEY (id);


--
-- Name: child_tracked_achievements child_tracked_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_tracked_achievements
    ADD CONSTRAINT child_tracked_achievements_pkey PRIMARY KEY (id);


--
-- Name: children children_access_key_key; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_access_key_key UNIQUE (access_key);


--
-- Name: children children_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_pkey PRIMARY KEY (id);


--
-- Name: daily_logs daily_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT daily_logs_pkey PRIMARY KEY (id);


--
-- Name: deposits deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_pkey PRIMARY KEY (id);


--
-- Name: dungeon_characters dungeon_characters_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.dungeon_characters
    ADD CONSTRAINT dungeon_characters_pkey PRIMARY KEY (child_id);


--
-- Name: dungeon_sessions dungeon_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.dungeon_sessions
    ADD CONSTRAINT dungeon_sessions_pkey PRIMARY KEY (id);


--
-- Name: equipment_defs equipment_defs_code_key; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.equipment_defs
    ADD CONSTRAINT equipment_defs_code_key UNIQUE (code);


--
-- Name: equipment_defs equipment_defs_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.equipment_defs
    ADD CONSTRAINT equipment_defs_pkey PRIMARY KEY (id);


--
-- Name: house_check_requests house_check_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.house_check_requests
    ADD CONSTRAINT house_check_requests_pkey PRIMARY KEY (id);


--
-- Name: house_days house_days_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.house_days
    ADD CONSTRAINT house_days_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: lang_card_attempts lang_card_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_attempts
    ADD CONSTRAINT lang_card_attempts_pkey PRIMARY KEY (id);


--
-- Name: lang_card_settings lang_card_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_settings
    ADD CONSTRAINT lang_card_settings_pkey PRIMARY KEY (id);


--
-- Name: lang_card_tasks lang_card_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_tasks
    ADD CONSTRAINT lang_card_tasks_pkey PRIMARY KEY (id);


--
-- Name: lang_cards lang_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_cards
    ADD CONSTRAINT lang_cards_pkey PRIMARY KEY (id);


--
-- Name: lang_word_progress lang_word_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_word_progress
    ADD CONSTRAINT lang_word_progress_pkey PRIMARY KEY (id);


--
-- Name: lang_words lang_words_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_words
    ADD CONSTRAINT lang_words_pkey PRIMARY KEY (id);


--
-- Name: limit_events limit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_events
    ADD CONSTRAINT limit_events_pkey PRIMARY KEY (id);


--
-- Name: limit_freeze limit_freeze_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_freeze
    ADD CONSTRAINT limit_freeze_pkey PRIMARY KEY (id);


--
-- Name: limit_usage limit_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_usage
    ADD CONSTRAINT limit_usage_pkey PRIMARY KEY (id);


--
-- Name: logic_card_attempts logic_card_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_card_attempts
    ADD CONSTRAINT logic_card_attempts_pkey PRIMARY KEY (id);


--
-- Name: logic_card_tasks logic_card_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_card_tasks
    ADD CONSTRAINT logic_card_tasks_pkey PRIMARY KEY (id);


--
-- Name: logic_cards logic_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_cards
    ADD CONSTRAINT logic_cards_pkey PRIMARY KEY (id);


--
-- Name: logic_olympiad_cards logic_olympiad_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_olympiad_cards
    ADD CONSTRAINT logic_olympiad_cards_pkey PRIMARY KEY (id);


--
-- Name: logic_olympiad_tasks logic_olympiad_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_olympiad_tasks
    ADD CONSTRAINT logic_olympiad_tasks_pkey PRIMARY KEY (id);


--
-- Name: logic_topic_settings logic_topic_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_topic_settings
    ADD CONSTRAINT logic_topic_settings_pkey PRIMARY KEY (id);


--
-- Name: logic_topics logic_topics_code_key; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_topics
    ADD CONSTRAINT logic_topics_code_key UNIQUE (code);


--
-- Name: logic_topics logic_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_topics
    ADD CONSTRAINT logic_topics_pkey PRIMARY KEY (id);


--
-- Name: math_attempts math_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_attempts
    ADD CONSTRAINT math_attempts_pkey PRIMARY KEY (id);


--
-- Name: math_card_attempts math_card_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_card_attempts
    ADD CONSTRAINT math_card_attempts_pkey PRIMARY KEY (id);


--
-- Name: math_card_tasks math_card_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_card_tasks
    ADD CONSTRAINT math_card_tasks_pkey PRIMARY KEY (id);


--
-- Name: math_cards math_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_cards
    ADD CONSTRAINT math_cards_pkey PRIMARY KEY (id);


--
-- Name: math_olympiad_cards math_olympiad_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_olympiad_cards
    ADD CONSTRAINT math_olympiad_cards_pkey PRIMARY KEY (id);


--
-- Name: math_olympiad_tasks math_olympiad_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_olympiad_tasks
    ADD CONSTRAINT math_olympiad_tasks_pkey PRIMARY KEY (id);


--
-- Name: math_tasks math_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_tasks
    ADD CONSTRAINT math_tasks_pkey PRIMARY KEY (id);


--
-- Name: math_topic_settings math_topic_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_topic_settings
    ADD CONSTRAINT math_topic_settings_pkey PRIMARY KEY (id);


--
-- Name: math_topics math_topics_code_key; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_topics
    ADD CONSTRAINT math_topics_code_key UNIQUE (code);


--
-- Name: math_topics math_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_topics
    ADD CONSTRAINT math_topics_pkey PRIMARY KEY (id);


--
-- Name: parent_notifications parent_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.parent_notifications
    ADD CONSTRAINT parent_notifications_pkey PRIMARY KEY (id);


--
-- Name: pocket_disbursements pocket_disbursements_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.pocket_disbursements
    ADD CONSTRAINT pocket_disbursements_pkey PRIMARY KEY (id);


--
-- Name: pocket_extensions pocket_extensions_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.pocket_extensions
    ADD CONSTRAINT pocket_extensions_pkey PRIMARY KEY (id);


--
-- Name: pocket_requests pocket_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.pocket_requests
    ADD CONSTRAINT pocket_requests_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: quest_submissions quest_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.quest_submissions
    ADD CONSTRAINT quest_submissions_pkey PRIMARY KEY (id);


--
-- Name: quests quests_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.quests
    ADD CONSTRAINT quests_pkey PRIMARY KEY (id);


--
-- Name: reading_bookmarks reading_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_bookmarks
    ADD CONSTRAINT reading_bookmarks_pkey PRIMARY KEY (id);


--
-- Name: reading_books reading_books_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_books
    ADD CONSTRAINT reading_books_pkey PRIMARY KEY (id);


--
-- Name: reading_logs reading_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_logs
    ADD CONSTRAINT reading_logs_pkey PRIMARY KEY (id);


--
-- Name: reading_page_marks reading_page_marks_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_page_marks
    ADD CONSTRAINT reading_page_marks_pkey PRIMARY KEY (id);


--
-- Name: reading_requests reading_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_requests
    ADD CONSTRAINT reading_requests_pkey PRIMARY KEY (id);


--
-- Name: reading_settings reading_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_settings
    ADD CONSTRAINT reading_settings_pkey PRIMARY KEY (child_id);


--
-- Name: seasonal_events seasonal_events_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.seasonal_events
    ADD CONSTRAINT seasonal_events_pkey PRIMARY KEY (id);


--
-- Name: skill_activations skill_activations_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.skill_activations
    ADD CONSTRAINT skill_activations_pkey PRIMARY KEY (id);


--
-- Name: sport_card_tasks sport_card_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_card_tasks
    ADD CONSTRAINT sport_card_tasks_pkey PRIMARY KEY (id);


--
-- Name: sport_cards sport_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_cards
    ADD CONSTRAINT sport_cards_pkey PRIMARY KEY (id);


--
-- Name: sport_directions sport_directions_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_directions
    ADD CONSTRAINT sport_directions_pkey PRIMARY KEY (id);


--
-- Name: sport_requests sport_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_requests
    ADD CONSTRAINT sport_requests_pkey PRIMARY KEY (id);


--
-- Name: sport_tasks sport_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_tasks
    ADD CONSTRAINT sport_tasks_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: task_cards task_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.task_cards
    ADD CONSTRAINT task_cards_pkey PRIMARY KEY (id);


--
-- Name: balances uq_balances_child_store; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.balances
    ADD CONSTRAINT uq_balances_child_store UNIQUE (child_id, store_id);


--
-- Name: reading_bookmarks uq_bookmark; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_bookmarks
    ADD CONSTRAINT uq_bookmark UNIQUE (child_id, book_id);


--
-- Name: child_achievements uq_child_achievements; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_achievements
    ADD CONSTRAINT uq_child_achievements UNIQUE (child_id, achievement_id);


--
-- Name: child_avatar_items uq_child_avatar_item; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_avatar_items
    ADD CONSTRAINT uq_child_avatar_item UNIQUE (child_id, item_id);


--
-- Name: child_task_cards uq_child_card; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_task_cards
    ADD CONSTRAINT uq_child_card UNIQUE (child_id, card_id, day);


--
-- Name: child_quest_states uq_child_quest; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_quest_states
    ADD CONSTRAINT uq_child_quest UNIQUE (child_id, quest_id);


--
-- Name: child_tracked_achievements uq_child_tracked; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_tracked_achievements
    ADD CONSTRAINT uq_child_tracked UNIQUE (child_id, achievement_id);


--
-- Name: daily_logs uq_daily_log; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT uq_daily_log UNIQUE (child_id, skill, day);


--
-- Name: deposits uq_deposit_child_store; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT uq_deposit_child_store UNIQUE (child_id, store_id);


--
-- Name: house_check_requests uq_house_check; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.house_check_requests
    ADD CONSTRAINT uq_house_check UNIQUE (child_id, day);


--
-- Name: house_days uq_house_days; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.house_days
    ADD CONSTRAINT uq_house_days UNIQUE (store_id, child_id, day);


--
-- Name: lang_card_settings uq_lang_card_settings; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_settings
    ADD CONSTRAINT uq_lang_card_settings UNIQUE (parent_id, task_type);


--
-- Name: lang_word_progress uq_lang_word_progress; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_word_progress
    ADD CONSTRAINT uq_lang_word_progress UNIQUE (child_id, word_id);


--
-- Name: lang_words uq_lang_words; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_words
    ADD CONSTRAINT uq_lang_words UNIQUE (lang, foreign_text, ru_text);


--
-- Name: limit_freeze uq_limit_freeze; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_freeze
    ADD CONSTRAINT uq_limit_freeze UNIQUE (child_id, limit_type);


--
-- Name: limit_usage uq_limit_usage; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_usage
    ADD CONSTRAINT uq_limit_usage UNIQUE (child_id, limit_type, day);


--
-- Name: logic_olympiad_cards uq_logic_olympiad_title; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_olympiad_cards
    ADD CONSTRAINT uq_logic_olympiad_title UNIQUE (title);


--
-- Name: logic_topic_settings uq_logic_topic_settings_parent_topic; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_topic_settings
    ADD CONSTRAINT uq_logic_topic_settings_parent_topic UNIQUE (parent_id, topic_id);


--
-- Name: math_olympiad_cards uq_math_olympiad_title; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_olympiad_cards
    ADD CONSTRAINT uq_math_olympiad_title UNIQUE (title);


--
-- Name: math_topic_settings uq_math_topic_settings_parent_topic; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_topic_settings
    ADD CONSTRAINT uq_math_topic_settings_parent_topic UNIQUE (parent_id, topic_id);


--
-- Name: pocket_extensions uq_pocket_ext; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.pocket_extensions
    ADD CONSTRAINT uq_pocket_ext UNIQUE (child_id, week_start);


--
-- Name: skill_activations uq_skill_activations; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.skill_activations
    ADD CONSTRAINT uq_skill_activations UNIQUE (child_id, skill);


--
-- Name: sport_cards uq_sport_card_child_date; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_cards
    ADD CONSTRAINT uq_sport_card_child_date UNIQUE (child_id, card_date);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: idx_achievements_parent; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_achievements_parent ON public.achievements USING btree (parent_id);


--
-- Name: idx_balances_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_balances_child ON public.balances USING btree (child_id);


--
-- Name: idx_balances_store; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_balances_store ON public.balances USING btree (store_id);


--
-- Name: idx_bookmarks_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_bookmarks_child ON public.reading_bookmarks USING btree (child_id);


--
-- Name: idx_child_ach_achievement; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_child_ach_achievement ON public.child_achievements USING btree (achievement_id);


--
-- Name: idx_child_ach_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_child_ach_child ON public.child_achievements USING btree (child_id);


--
-- Name: idx_child_avatar_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_child_avatar_child ON public.child_avatar_items USING btree (child_id);


--
-- Name: idx_child_equipment_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_child_equipment_child ON public.child_equipment USING btree (child_id);


--
-- Name: idx_child_quest_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_child_quest_child ON public.child_quest_states USING btree (child_id);


--
-- Name: idx_child_task_cards_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_child_task_cards_child ON public.child_task_cards USING btree (child_id);


--
-- Name: idx_child_tracked_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_child_tracked_child ON public.child_tracked_achievements USING btree (child_id);


--
-- Name: idx_children_access_key; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_children_access_key ON public.children USING btree (access_key);


--
-- Name: idx_children_parent; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_children_parent ON public.children USING btree (parent_id);


--
-- Name: idx_daily_logs_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_daily_logs_child ON public.daily_logs USING btree (child_id);


--
-- Name: idx_deposits_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_deposits_child ON public.deposits USING btree (child_id);


--
-- Name: idx_dungeon_sessions_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_dungeon_sessions_child ON public.dungeon_sessions USING btree (child_id);


--
-- Name: idx_house_check_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_house_check_child ON public.house_check_requests USING btree (child_id);


--
-- Name: idx_house_days_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_house_days_child ON public.house_days USING btree (child_id);


--
-- Name: idx_house_days_store; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_house_days_store ON public.house_days USING btree (store_id);


--
-- Name: idx_inventory_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_inventory_child ON public.inventory_items USING btree (child_id);


--
-- Name: idx_inventory_status; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_inventory_status ON public.inventory_items USING btree (status);


--
-- Name: idx_lang_cards_child_date; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_lang_cards_child_date ON public.lang_cards USING btree (child_id, card_date);


--
-- Name: idx_lang_words_sort; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_lang_words_sort ON public.lang_words USING btree (sort_order);


--
-- Name: idx_limit_events_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_limit_events_child ON public.limit_events USING btree (child_id);


--
-- Name: idx_limit_usage_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_limit_usage_child ON public.limit_usage USING btree (child_id);


--
-- Name: idx_logic_cards_child_date; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_logic_cards_child_date ON public.logic_cards USING btree (child_id, card_date);


--
-- Name: idx_math_attempts_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_math_attempts_child ON public.math_attempts USING btree (child_id);


--
-- Name: idx_math_attempts_task; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_math_attempts_task ON public.math_attempts USING btree (task_id);


--
-- Name: idx_math_cards_child_date; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_math_cards_child_date ON public.math_cards USING btree (child_id, card_date);


--
-- Name: idx_math_tasks_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_math_tasks_child ON public.math_tasks USING btree (child_id);


--
-- Name: idx_math_tasks_store; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_math_tasks_store ON public.math_tasks USING btree (store_id);


--
-- Name: idx_page_marks_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_page_marks_child ON public.reading_page_marks USING btree (child_id, day);


--
-- Name: idx_parent_notif_parent; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_parent_notif_parent ON public.parent_notifications USING btree (parent_id, status);


--
-- Name: idx_pocket_disb_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_pocket_disb_child ON public.pocket_disbursements USING btree (child_id);


--
-- Name: idx_pocket_ext_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_pocket_ext_child ON public.pocket_extensions USING btree (child_id);


--
-- Name: idx_pocket_requests_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_pocket_requests_child ON public.pocket_requests USING btree (child_id);


--
-- Name: idx_products_store; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_products_store ON public.products USING btree (store_id);


--
-- Name: idx_purchases_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_purchases_child ON public.purchases USING btree (child_id);


--
-- Name: idx_purchases_status; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_purchases_status ON public.purchases USING btree (status);


--
-- Name: idx_purchases_store; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_purchases_store ON public.purchases USING btree (store_id);


--
-- Name: idx_quest_submissions_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_quest_submissions_child ON public.quest_submissions USING btree (child_id);


--
-- Name: idx_quest_submissions_quest; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_quest_submissions_quest ON public.quest_submissions USING btree (quest_id);


--
-- Name: idx_quest_submissions_status; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_quest_submissions_status ON public.quest_submissions USING btree (status);


--
-- Name: idx_quests_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_quests_child ON public.quests USING btree (child_id);


--
-- Name: idx_quests_parent; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_quests_parent ON public.quests USING btree (parent_id);


--
-- Name: idx_quests_type; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_quests_type ON public.quests USING btree (type);


--
-- Name: idx_reading_books_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_reading_books_child ON public.reading_books USING btree (child_id);


--
-- Name: idx_reading_books_store; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_reading_books_store ON public.reading_books USING btree (store_id);


--
-- Name: idx_reading_logs_book; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_reading_logs_book ON public.reading_logs USING btree (book_id);


--
-- Name: idx_reading_logs_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_reading_logs_child ON public.reading_logs USING btree (child_id);


--
-- Name: idx_reading_requests_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_reading_requests_child ON public.reading_requests USING btree (child_id);


--
-- Name: idx_skill_activations_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_skill_activations_child ON public.skill_activations USING btree (child_id);


--
-- Name: idx_stores_parent; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_stores_parent ON public.stores USING btree (parent_id);


--
-- Name: idx_task_cards_parent; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_task_cards_parent ON public.task_cards USING btree (parent_id);


--
-- Name: idx_task_cards_skill; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_task_cards_skill ON public.task_cards USING btree (skill);


--
-- Name: idx_wishlist_child; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE INDEX idx_wishlist_child ON public.wishlist_items USING btree (child_id);


--
-- Name: uq_achievements_parent_group_level; Type: INDEX; Schema: public; Owner: familymarket
--

CREATE UNIQUE INDEX uq_achievements_parent_group_level ON public.achievements USING btree (parent_id, group_key, level);


--
-- Name: achievements achievements_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: achievements achievements_reward_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_reward_store_id_fkey FOREIGN KEY (reward_store_id) REFERENCES public.stores(id) ON DELETE SET NULL;


--
-- Name: avatar_items avatar_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.avatar_items
    ADD CONSTRAINT avatar_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: balances balances_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.balances
    ADD CONSTRAINT balances_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: balances balances_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.balances
    ADD CONSTRAINT balances_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: child_achievements child_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_achievements
    ADD CONSTRAINT child_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- Name: child_achievements child_achievements_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_achievements
    ADD CONSTRAINT child_achievements_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: child_avatar_items child_avatar_items_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_avatar_items
    ADD CONSTRAINT child_avatar_items_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: child_avatar_items child_avatar_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_avatar_items
    ADD CONSTRAINT child_avatar_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.avatar_items(id) ON DELETE CASCADE;


--
-- Name: child_equipment child_equipment_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_equipment
    ADD CONSTRAINT child_equipment_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: child_equipment child_equipment_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_equipment
    ADD CONSTRAINT child_equipment_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment_defs(id) ON DELETE CASCADE;


--
-- Name: child_limits child_limits_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_limits
    ADD CONSTRAINT child_limits_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: child_quest_states child_quest_states_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_quest_states
    ADD CONSTRAINT child_quest_states_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: child_quest_states child_quest_states_quest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_quest_states
    ADD CONSTRAINT child_quest_states_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES public.quests(id) ON DELETE CASCADE;


--
-- Name: child_task_cards child_task_cards_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_task_cards
    ADD CONSTRAINT child_task_cards_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.task_cards(id) ON DELETE CASCADE;


--
-- Name: child_task_cards child_task_cards_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_task_cards
    ADD CONSTRAINT child_task_cards_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: child_tracked_achievements child_tracked_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_tracked_achievements
    ADD CONSTRAINT child_tracked_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- Name: child_tracked_achievements child_tracked_achievements_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.child_tracked_achievements
    ADD CONSTRAINT child_tracked_achievements_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: children children_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: daily_logs daily_logs_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.daily_logs
    ADD CONSTRAINT daily_logs_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: deposits deposits_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: deposits deposits_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: dungeon_characters dungeon_characters_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.dungeon_characters
    ADD CONSTRAINT dungeon_characters_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: dungeon_sessions dungeon_sessions_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.dungeon_sessions
    ADD CONSTRAINT dungeon_sessions_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: house_check_requests house_check_requests_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.house_check_requests
    ADD CONSTRAINT house_check_requests_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: house_check_requests house_check_requests_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.house_check_requests
    ADD CONSTRAINT house_check_requests_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: house_days house_days_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.house_days
    ADD CONSTRAINT house_days_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: house_days house_days_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.house_days
    ADD CONSTRAINT house_days_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: lang_card_attempts lang_card_attempts_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_attempts
    ADD CONSTRAINT lang_card_attempts_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.lang_card_tasks(id) ON DELETE CASCADE;


--
-- Name: lang_card_settings lang_card_settings_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_settings
    ADD CONSTRAINT lang_card_settings_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lang_card_tasks lang_card_tasks_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_tasks
    ADD CONSTRAINT lang_card_tasks_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.lang_cards(id) ON DELETE CASCADE;


--
-- Name: lang_card_tasks lang_card_tasks_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_card_tasks
    ADD CONSTRAINT lang_card_tasks_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.lang_words(id) ON DELETE SET NULL;


--
-- Name: lang_cards lang_cards_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_cards
    ADD CONSTRAINT lang_cards_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: lang_word_progress lang_word_progress_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_word_progress
    ADD CONSTRAINT lang_word_progress_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: lang_word_progress lang_word_progress_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.lang_word_progress
    ADD CONSTRAINT lang_word_progress_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.lang_words(id) ON DELETE CASCADE;


--
-- Name: limit_events limit_events_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_events
    ADD CONSTRAINT limit_events_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: limit_freeze limit_freeze_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_freeze
    ADD CONSTRAINT limit_freeze_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: limit_usage limit_usage_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.limit_usage
    ADD CONSTRAINT limit_usage_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: logic_card_attempts logic_card_attempts_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_card_attempts
    ADD CONSTRAINT logic_card_attempts_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.logic_card_tasks(id) ON DELETE CASCADE;


--
-- Name: logic_card_tasks logic_card_tasks_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_card_tasks
    ADD CONSTRAINT logic_card_tasks_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.logic_cards(id) ON DELETE CASCADE;


--
-- Name: logic_cards logic_cards_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_cards
    ADD CONSTRAINT logic_cards_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: logic_olympiad_tasks logic_olympiad_tasks_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_olympiad_tasks
    ADD CONSTRAINT logic_olympiad_tasks_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.logic_olympiad_cards(id) ON DELETE CASCADE;


--
-- Name: logic_topic_settings logic_topic_settings_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_topic_settings
    ADD CONSTRAINT logic_topic_settings_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: logic_topic_settings logic_topic_settings_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.logic_topic_settings
    ADD CONSTRAINT logic_topic_settings_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.logic_topics(id) ON DELETE CASCADE;


--
-- Name: math_attempts math_attempts_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_attempts
    ADD CONSTRAINT math_attempts_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: math_attempts math_attempts_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_attempts
    ADD CONSTRAINT math_attempts_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.math_tasks(id) ON DELETE CASCADE;


--
-- Name: math_card_attempts math_card_attempts_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_card_attempts
    ADD CONSTRAINT math_card_attempts_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.math_card_tasks(id) ON DELETE CASCADE;


--
-- Name: math_card_tasks math_card_tasks_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_card_tasks
    ADD CONSTRAINT math_card_tasks_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.math_cards(id) ON DELETE CASCADE;


--
-- Name: math_cards math_cards_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_cards
    ADD CONSTRAINT math_cards_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: math_olympiad_tasks math_olympiad_tasks_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_olympiad_tasks
    ADD CONSTRAINT math_olympiad_tasks_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.math_olympiad_cards(id) ON DELETE CASCADE;


--
-- Name: math_tasks math_tasks_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_tasks
    ADD CONSTRAINT math_tasks_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: math_tasks math_tasks_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_tasks
    ADD CONSTRAINT math_tasks_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: math_topic_settings math_topic_settings_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_topic_settings
    ADD CONSTRAINT math_topic_settings_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: math_topic_settings math_topic_settings_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.math_topic_settings
    ADD CONSTRAINT math_topic_settings_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.math_topics(id) ON DELETE CASCADE;


--
-- Name: parent_notifications parent_notifications_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.parent_notifications
    ADD CONSTRAINT parent_notifications_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: parent_notifications parent_notifications_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.parent_notifications
    ADD CONSTRAINT parent_notifications_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pocket_disbursements pocket_disbursements_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.pocket_disbursements
    ADD CONSTRAINT pocket_disbursements_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: pocket_extensions pocket_extensions_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.pocket_extensions
    ADD CONSTRAINT pocket_extensions_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: pocket_requests pocket_requests_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.pocket_requests
    ADD CONSTRAINT pocket_requests_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: products products_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: quest_submissions quest_submissions_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.quest_submissions
    ADD CONSTRAINT quest_submissions_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: quest_submissions quest_submissions_quest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.quest_submissions
    ADD CONSTRAINT quest_submissions_quest_id_fkey FOREIGN KEY (quest_id) REFERENCES public.quests(id) ON DELETE CASCADE;


--
-- Name: quests quests_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.quests
    ADD CONSTRAINT quests_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: quests quests_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.quests
    ADD CONSTRAINT quests_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: quests quests_reward_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.quests
    ADD CONSTRAINT quests_reward_store_id_fkey FOREIGN KEY (reward_store_id) REFERENCES public.stores(id) ON DELETE SET NULL;


--
-- Name: quests quests_seasonal_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.quests
    ADD CONSTRAINT quests_seasonal_event_id_fkey FOREIGN KEY (seasonal_event_id) REFERENCES public.seasonal_events(id) ON DELETE SET NULL;


--
-- Name: reading_bookmarks reading_bookmarks_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_bookmarks
    ADD CONSTRAINT reading_bookmarks_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.reading_books(id) ON DELETE CASCADE;


--
-- Name: reading_bookmarks reading_bookmarks_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_bookmarks
    ADD CONSTRAINT reading_bookmarks_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: reading_books reading_books_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_books
    ADD CONSTRAINT reading_books_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: reading_books reading_books_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_books
    ADD CONSTRAINT reading_books_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: reading_logs reading_logs_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_logs
    ADD CONSTRAINT reading_logs_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.reading_books(id) ON DELETE CASCADE;


--
-- Name: reading_logs reading_logs_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_logs
    ADD CONSTRAINT reading_logs_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: reading_page_marks reading_page_marks_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_page_marks
    ADD CONSTRAINT reading_page_marks_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.reading_books(id) ON DELETE CASCADE;


--
-- Name: reading_page_marks reading_page_marks_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_page_marks
    ADD CONSTRAINT reading_page_marks_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: reading_requests reading_requests_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_requests
    ADD CONSTRAINT reading_requests_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: reading_requests reading_requests_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_requests
    ADD CONSTRAINT reading_requests_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: reading_settings reading_settings_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_settings
    ADD CONSTRAINT reading_settings_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: reading_settings reading_settings_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.reading_settings
    ADD CONSTRAINT reading_settings_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: seasonal_events seasonal_events_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.seasonal_events
    ADD CONSTRAINT seasonal_events_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skill_activations skill_activations_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.skill_activations
    ADD CONSTRAINT skill_activations_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: skill_activations skill_activations_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.skill_activations
    ADD CONSTRAINT skill_activations_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;


--
-- Name: sport_card_tasks sport_card_tasks_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_card_tasks
    ADD CONSTRAINT sport_card_tasks_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.sport_cards(id) ON DELETE CASCADE;


--
-- Name: sport_cards sport_cards_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_cards
    ADD CONSTRAINT sport_cards_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: sport_cards sport_cards_direction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_cards
    ADD CONSTRAINT sport_cards_direction_id_fkey FOREIGN KEY (direction_id) REFERENCES public.sport_directions(id) ON DELETE CASCADE;


--
-- Name: sport_directions sport_directions_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_directions
    ADD CONSTRAINT sport_directions_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: sport_requests sport_requests_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_requests
    ADD CONSTRAINT sport_requests_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: sport_tasks sport_tasks_direction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.sport_tasks
    ADD CONSTRAINT sport_tasks_direction_id_fkey FOREIGN KEY (direction_id) REFERENCES public.sport_directions(id) ON DELETE CASCADE;


--
-- Name: stores stores_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: stores stores_seasonal_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_seasonal_event_id_fkey FOREIGN KEY (seasonal_event_id) REFERENCES public.seasonal_events(id) ON DELETE SET NULL;


--
-- Name: task_cards task_cards_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.task_cards
    ADD CONSTRAINT task_cards_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- Name: task_cards task_cards_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.task_cards
    ADD CONSTRAINT task_cards_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_cards task_cards_reward_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.task_cards
    ADD CONSTRAINT task_cards_reward_store_id_fkey FOREIGN KEY (reward_store_id) REFERENCES public.stores(id) ON DELETE SET NULL;


--
-- Name: task_cards task_cards_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.task_cards
    ADD CONSTRAINT task_cards_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE SET NULL;


--
-- Name: wishlist_items wishlist_items_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: familymarket
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 0cleg24KJuHDv6aJfKr0nGHEbL4kEfqzgy61vUHhHrKhdgRMoI8DQ8Z2RICokBL

