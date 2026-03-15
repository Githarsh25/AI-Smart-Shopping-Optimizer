-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password_hash text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

-- Table: public.products

-- DROP TABLE IF EXISTS public.products;

CREATE TABLE IF NOT EXISTS public.products
(
    id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    category character varying(100) COLLATE pg_catalog."default",
    created_at time without time zone,
    CONSTRAINT products_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.products
    OWNER to postgres;

-- Table: public.product_prices

-- DROP TABLE IF EXISTS public.product_prices;

CREATE TABLE IF NOT EXISTS public.product_prices
(
    id integer NOT NULL DEFAULT nextval('product_prices_id_seq'::regclass),
    product_id integer,
    platform_id integer,
    price numeric,
    recorded_at time without time zone,
    CONSTRAINT product_prices_pkey PRIMARY KEY (id),
    CONSTRAINT fk_platform FOREIGN KEY (platform_id)
        REFERENCES public.platforms (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_product FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.product_prices
    OWNER to postgres;

-- Table: public.platforms

-- DROP TABLE IF EXISTS public.platforms;

CREATE TABLE IF NOT EXISTS public.platforms
(
    id integer NOT NULL DEFAULT nextval('platforms_id_seq'::regclass),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT platforms_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.platforms
    OWNER to postgres;

-- Table: public.alerts

-- DROP TABLE IF EXISTS public.alerts;

CREATE TABLE IF NOT EXISTS public.alerts
(
    id integer NOT NULL DEFAULT nextval('alerts_id_seq'::regclass),
    user_id integer,
    product_id integer,
    target_price numeric,
    created_at time without time zone,
    CONSTRAINT alerts_pkey PRIMARY KEY (id),
    CONSTRAINT fk_productid FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_userid FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.alerts
    OWNER to postgres;