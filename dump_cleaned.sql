--
-- PostgreSQL database cluster dump
--

\restrict Lfzmx3pQ8YUrKwnyyViuZAzHnZ10QhsCcSEK6h4HNlfbfytiIqiFWvu6JdIGyNB

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--


--
--

--
--


--
--


--
--


--
-- User Config "postgres"
--


--
--


--
--


--
--



--
-- Role memberships
--







\unrestrict Lfzmx3pQ8YUrKwnyyViuZAzHnZ10QhsCcSEK6h4HNlfbfytiIqiFWvu6JdIGyNB

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict cgCfxeLxbBQuy8jj9tCvMCwfju4I9C6x5xh5d6vri2u4FevpnaTdk3Kxvs88Gfu

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg12+1)

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

--
-- PostgreSQL database dump complete
--

\unrestrict cgCfxeLxbBQuy8jj9tCvMCwfju4I9C6x5xh5d6vri2u4FevpnaTdk3Kxvs88Gfu

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict LO41sdj48df0G2DIbuliEkxPh6FW7aSqBXXmO1Jq1jeXMmag07Qu7Kng8nIKGGz

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg12+1)

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

--
--

CREATE SCHEMA auth;



--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
--

CREATE SCHEMA graphql;



--
--

CREATE SCHEMA graphql_public;



--
--




--
--




--
--



--
--



--
--

CREATE SCHEMA realtime;



--
--

CREATE SCHEMA storage;



--
--

CREATE SCHEMA vault;



--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
--



--
--



--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);



--
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);



--
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);



--
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);



--
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);



--
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);



--
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);



--
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);



--
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);



--
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);



--
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);



--
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);



--
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;



--
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;



--
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;



--
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;



--
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

        on sequences to postgres with grant option;
        on tables to postgres with grant option;
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;



--
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;



--
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
    )
    THEN
    END IF;


    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    END IF;
  END IF;
END;
$$;



--
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;



--
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;



--
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;



--
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
--

    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;



--
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;



--
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;



--
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;



--
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;



--
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;



--
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;



--
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;



--
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;



--
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;



--
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;



--
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;



--
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;



--
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;



--
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;



--
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;



--
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;



--
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;



--
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;



--
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;



--
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;



--
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;



--
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;



--
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;



--
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;



--
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;



--
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;



--
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;



--
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;



--
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;



--
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;



--
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;



--
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;



--
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;



--
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;



--
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;



--
--

CREATE FUNCTION vault.secrets_encrypt_secret_secret() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
		BEGIN
		        new.secret = CASE WHEN new.secret IS NULL THEN NULL ELSE
			CASE WHEN new.key_id IS NULL THEN NULL ELSE pg_catalog.encode(
				pg_catalog.convert_to(new.secret, 'utf8'),
				pg_catalog.convert_to((new.id::text || new.description::text || new.created_at::text || new.updated_at::text)::text, 'utf8'),
				new.key_id::uuid,
				new.nonce
			  ),
				'base64') END END;
		RETURN new;
		END;
		$$;



SET default_tablespace = '';

SET default_table_access_method = heap;

--
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);



--
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);



--
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);



--
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);



--
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);



--
--



--
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);



--
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);



--
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_id text NOT NULL,
    client_secret_hash text NOT NULL,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);



--
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);



--
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);



--
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);



--
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);



--
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);



--
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);



--
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);



--
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);



--
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);



--
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id character varying NOT NULL,
    user_id text NOT NULL,
    plan character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    recurring_payment character varying,
    is_active text DEFAULT 'false'::text,
    next_payment_date timestamp without time zone,
    last_checked_at timestamp without time zone,
    "interval" character varying(10),
    amount character varying,
    updated_at timestamp without time zone DEFAULT now(),
    status character varying(20) DEFAULT 'active'::character varying,
    pending_cancellation text DEFAULT 'false'::text,
    cancellation_requested_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    cancellation_reason text,
    failed_payment_count character varying DEFAULT '0'::character varying,
    last_failed_payment_reason text,
    billing_cycle character varying
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: suggestions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suggestions (
    game_name text NOT NULL,
    game_url text NOT NULL,
    game_description text NOT NULL,
    game_reason text NOT NULL,
    user_id text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    id text NOT NULL
);


ALTER TABLE public.suggestions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    image text,
    name text,
    username character varying(50) NOT NULL,
    password text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    reset_token text,
    reset_token_expiry timestamp without time zone,
    provider character varying(20),
    discord_id text
);


ALTER TABLE public.users OWNER TO postgres;

--
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);



--
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);



--
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);



--
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);



--
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);



--
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);



--
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);



--
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);



--
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



--
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
--

COPY auth.oauth_clients (id, client_id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at) FROM stdin;
\.


--
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
\.


--
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
\.


--
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
--

\.


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	bf1e7b3dfc1f323a3ac3e3b872d80a387b2db8f4c7a2ae837a1ba7f64391297c	1736484572848
2	1f701c9f4d18409afe2c153c8521a4caae1f69c39938ce54104d4c5724a5eba4	1736501530511
3	ee12db74bdd251dd1c2b405ed8a4a2d552012f0f9e3fedd50f4ae3316788afa7	1737450425952
4	f3bb2fd2557a61c706cb81e12f8fdf34204f400b2e6a768addc7a6a8f6dcc0ac	1737456285078
\.


--
--

\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, user_id, plan, created_at, recurring_payment, is_active, next_payment_date, last_checked_at, "interval", amount, updated_at, status, pending_cancellation, cancellation_requested_at, cancelled_at, cancellation_reason, failed_payment_count, last_failed_payment_reason, billing_cycle) FROM stdin;
tbx-73622625a75007-a15ad8	43ce4331-057c-4846-b46c-ff84a2ec8290	STARTER PLAN	2025-08-15 20:50:18.785	tbx-r-768143582	true	2025-09-15 20:50:14	2025-08-15 20:50:20.322	P1M	1	2025-08-15 20:50:24.271	active	false	\N	\N	\N	0	\N	\N
tbx-54922625a76257-e19574	e599902e-9b28-4633-9cfc-6ca47ce5f7c2	STARTER PLAN	2025-08-15 21:14:59.979	tbx-r-768146061	true	2025-09-15 21:11:04	2025-08-15 21:15:01.767	P1M	1	2025-08-15 21:15:01.332022	active	false	\N	\N	\N	0	\N	\N
tbx-75022625a78735-99f8b5	0279c138-269b-41e9-a5c0-b55415607fb4	STARTER PLAN	2025-08-15 21:52:36.847	tbx-r-768150500	true	2025-08-22 16:22:25	2025-08-15 21:52:37.201	P1W	0.75	2025-08-15 21:52:37.407574	active	false	\N	\N	\N	0	\N	\N
tbx-38824925a23926-0189e1	85afc70c-5ec0-4faa-b055-b5eb92a52b84	STARTER PLAN	2025-09-07 06:39:36.301	tbx-r-770495835	false	2025-10-07 06:39:28	2025-09-07 06:39:38.974	P1M	1	2025-09-11 08:33:07.09	cancelled	false	\N	2025-09-11 08:33:07.09	Refunded: Payment refunded	0	\N	\N
tbx-92723025a22532-b0d133	8608ea8e-5d6e-4434-812f-bf3aa68608d3	STARTER PLAN	2025-08-19 06:16:55.07	tbx-r-768524009	false	2025-09-19 06:16:42	2025-08-19 06:16:56.97	P1M	1	2025-09-11 08:30:54.474	cancelled	true	2025-09-10 21:58:04.899	2025-09-11 08:30:54.474	Refunded: Payment refunded	0	\N	\N
0279c138-6780-41e9-a5c0-b55415607fb4	0279c138-269b-41e9-a5c0-b55415607fb4	EXECUTIVE PLAN	2025-07-30 19:47:55.47249	\N	true	\N	\N	\N	\N	2025-07-30 19:47:55.47249	active	false	\N	\N	\N	0	\N	\N
tbx-32921025a78341-52b667	d6c3c109-cfe0-4a50-a3dd-72a54b2ea157	EXECUTIVE PLAN	2025-07-30 21:45:48.546	\N	true	\N	\N	\N	\N	2025-07-30 21:45:50.642	active	false	\N	\N	\N	0	\N	lifetime
tbx-48721125a70492-cb24c5	5cd165e1-46d4-4195-bc9b-7dd29d664424	BASIC PLAN	2025-07-31 19:35:06.531	tbx-r-766469020	true	2025-10-31 19:34:59	2025-07-31 19:35:08.314	P3M	2.5	2025-07-31 19:35:07.904691	active	false	\N	\N	\N	0	\N	\N
tbx-38523925a50204-9b9c8d	a26cccf8-2bfd-4771-883b-0f550def3e4b	STARTER PLAN	2025-08-28 13:57:45.217	tbx-r-769471419	false	2025-09-28 13:57:31	2025-08-28 13:57:46.98	P1M	1	2025-09-11 08:31:21.599	cancelled	false	\N	2025-09-11 08:31:21.599	Refunded: Payment refunded	0	\N	\N
tbx-98424525a66960-7e93b7	49df1312-5729-4891-90dd-30156c8a17c3	STARTER PLAN	2025-09-03 18:36:54.229	tbx-r-770148023	false	2025-10-03 18:36:17	2025-09-03 18:36:55.804	P1M	1	2025-09-11 08:32:03.871	cancelled	false	\N	2025-09-11 08:32:03.871	Refunded: Payment refunded	0	\N	\N
tbx-22423425a57003-63e49b	a90fd48b-37f3-47b4-bfce-6468da844483	STARTER PLAN	2025-08-23 15:51:27.138	tbx-r-768971343	false	2025-09-23 15:50:49	2025-08-23 15:51:28.994	P1M	1	2025-09-11 08:32:21.886	cancelled	false	\N	2025-09-11 08:32:21.886	Refunded: Payment refunded	0	\N	\N
tbx-88023625a43260-4e49ea	26bda708-4b0c-48fa-8a54-03afec3513e6	STARTER PLAN	2025-08-25 12:02:12.529	tbx-r-769170378	false	2025-09-25 12:01:53	2025-08-25 12:02:14.4	P1M	1	2025-09-11 08:32:29.25	cancelled	false	\N	2025-09-11 08:32:29.25	Refunded: Payment refunded	0	\N	\N
tbx-94323525a24366-04a50f	ee786478-3c4c-42de-9976-dff24d9812a7	STARTER PLAN	2025-08-24 06:47:09.485	tbx-r-769046899	false	2025-09-24 06:46:47	2025-08-24 06:47:11.369	P1M	1	2025-09-11 08:32:22.334	cancelled	true	2025-08-24 06:48:43.937	2025-09-11 08:32:22.334	Refunded: Payment refunded	0	\N	\N
tbx-87822225a12010-78d3cf	b7d743ca-d710-461f-bbb1-28d02840913f	STARTER PLAN	2025-08-11 03:23:54.332	tbx-r-767659231	true	2025-09-11 03:22:09	2025-08-11 03:23:56.12	P1M	1	2025-08-11 03:23:55.679796	active	false	\N	\N	\N	0	\N	\N
tbx-55324925a54109-87633c	a2199138-5645-48e2-a83b-d7feddfabd43	STARTER PLAN	2025-09-07 15:03:06.53	tbx-r-770529051	false	2025-10-07 15:02:47	2025-09-07 15:03:09.227	P1M	1	2025-09-11 08:33:16.633	cancelled	true	2025-09-07 15:05:02.506	2025-09-11 08:33:16.633	Refunded: Payment refunded	0	\N	\N
tbx-12323625a66038-c6009d	775e3ca2-e91d-430c-8a8a-091ede9c0860	BASIC PLAN	2025-08-25 18:22:18.325	tbx-r-769200972	false	2025-11-25 18:21:23	2025-08-25 18:22:20.257	P3M	2.5	2025-09-11 08:32:38.957	cancelled	false	\N	2025-09-11 08:32:38.957	Refunded: Payment refunded	0	\N	\N
tbx-94824025a74352-364827	90ff4ed4-5bcb-4dc0-86b1-62617366f3c3	STARTER PLAN	2025-08-29 20:40:41.885	tbx-r-769618136	false	2025-09-29 20:39:53	2025-08-29 20:40:43.536	P1M	1	2025-09-11 08:32:48.947	cancelled	false	\N	2025-09-11 08:32:48.947	Refunded: Payment refunded	0	\N	\N
tbx-83823825a66775-b75735	261036dc-5b5f-4839-9b6f-751b738c388f	STARTER PLAN	2025-08-27 18:33:21	tbx-r-769398090	true	2025-09-27 18:33:03	2025-08-27 18:33:22.794	P1M	1	2025-08-27 18:33:22.384861	active	false	\N	\N	\N	0	\N	\N
tbx-22824425a30249-278141	db25cfe3-77f2-4b5c-82ef-fe5d92be80ad	STARTER PLAN	2025-09-02 08:24:58.735	tbx-r-770013271	false	2025-10-02 08:24:44	2025-09-02 08:25:00.595	P1M	1	2025-09-11 08:32:57.989	cancelled	false	\N	2025-09-11 08:32:57.989	Refunded: Payment refunded	0	\N	\N
tbx-46923525a39918-78082d	a9bf83e6-fd99-40f5-a5a2-a2f367b0f40f	STARTER PLAN	2025-08-24 11:06:42.857	tbx-r-769059451	false	2025-09-24 11:06:08	2025-08-24 11:06:44.733	P1M	1	2025-09-11 08:32:28.476	cancelled	false	\N	2025-09-11 08:32:28.476	Refunded: Payment refunded	0	\N	\N
tbx-81324125a80701-228458	dc47d383-9d96-41ea-a47b-09cb4128e82e	STARTER PLAN	2025-08-30 22:26:27.67	tbx-r-769747723	false	2025-09-30 22:26:19	2025-08-30 22:26:29.319	P1M	1	2025-09-11 08:32:58.074	cancelled	false	\N	2025-09-11 08:32:58.074	Refunded: Payment refunded	0	\N	\N
tbx-99621425a85455-06a89f	12affb31-9d5f-409d-9e54-599669d3afcf	STARTER PLAN	2025-08-03 23:45:23.771	tbx-r-766844652	false	2025-09-03 23:45:00	2025-08-03 23:45:25.433	P1M	1	2025-09-04 06:00:13.514	cancelled	false	2025-09-02 16:38:55.114	2025-09-04 06:00:08	Cancelled by Customer using Payment history control panel	0	\N	\N
tbx-54821525a101-f24b6e	3b916f0c-46b8-4515-a545-af7b98b514ec	STARTER PLAN	2025-08-04 00:02:50.516	tbx-r-766846037	false	2025-09-04 00:02:33	2025-08-04 00:02:50.977	P1M	1	2025-09-04 06:02:10.288	cancelled	false	2025-08-04 12:49:06.832	2025-09-04 06:02:02	Cancelled by Customer using Payment history control panel	0	\N	\N
tbx-55421525a17817-dbc2d3	1d7f1273-a288-470c-a172-576e01716253	PREMIUM PLAN	2025-08-04 04:58:11.413	tbx-r-766866212	false	2026-02-04 04:57:11	2025-08-04 04:58:13.147	P6M	4.5	2025-09-05 05:12:43.475	cancelled	false	\N	2025-09-05 05:12:43.475	Recurring payment ended	0	\N	\N
tbx-30821525a25102-7daa47	2f8f697d-b4d7-4be0-9942-ea45e66dbce7	STARTER PLAN	2025-08-04 06:59:14.014	tbx-r-766872358	false	2025-09-04 06:59:02	2025-08-04 06:59:15.903	P1M	1	2025-09-06 04:58:59.653	cancelled	false	\N	2025-09-06 04:58:59.653	Recurring payment ended	0	\N	\N
tbx-86821525a57824-986d1a	8cb5ad59-a775-4ff2-bc84-0e62e1d78bbc	STARTER PLAN	2025-08-04 16:03:59.684	tbx-r-766909601	false	2025-09-04 16:03:51	2025-08-04 16:04:01.323	P1M	1	2025-09-06 05:06:19.115	cancelled	false	\N	2025-09-06 05:06:19.115	Recurring payment ended	0	\N	\N
tbx-80522225a5058-48c2ce	9897efe8-dd27-40bf-bd66-7a68d9a35b0a	STARTER PLAN	2025-08-11 01:25:20.996	tbx-r-767651323	false	2025-09-11 01:25:15	2025-08-11 01:25:22.764	P1M	1	2025-09-11 05:33:07.964	cancelled	false	2025-08-11 01:34:18.135	2025-09-11 05:33:00	Cancelled by Customer using Payment history control panel	0	\N	\N
tbx-10422725a58284-c67116	da162a67-eba5-4818-85b3-fa5d62ff7567	STARTER PLAN	2025-08-16 16:12:31.547	tbx-r-768236168	false	2025-09-16 16:12:25	2025-08-16 16:12:33.407	P1M	1	2025-09-11 08:30:52.181	cancelled	false	\N	2025-09-11 08:30:52.181	Refunded: Payment refunded	0	\N	\N
\.


--
-- Data for Name: suggestions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suggestions (game_name, game_url, game_description, game_reason, user_id, created_at, id) FROM stdin;
omipomi	https://gamecrux.in	32fr	dqw	0279c138-269b-41e9-a5c0-b55415607fb4	2025-08-14 20:56:40.148685	6f8601f8-5488-4b02-882c-58035cd2f438
wded	https://gamecrux.in	qwdqwd	qwdqwd	0279c138-269b-41e9-a5c0-b55415607fb4	2025-08-15 16:08:06.093023	36d7830c-7bcf-45b2-b566-08146de67169
43r23	https://gamecrux.in	32r	23r	0279c138-269b-41e9-a5c0-b55415607fb4	2025-08-15 20:43:25.911249	4c7ce7bb-9edd-46cb-aedd-bb2ac2bd13d0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, image, name, username, password, created_at, reset_token, reset_token_expiry, provider, discord_id) FROM stdin;
0279c138-269b-41e9-a5c0-b55415607fb4	omraw29@gmail.com	https://cdn.discordapp.com/embed/avatars/5.png	omrawat23	omraw29	\N	2025-07-30 19:45:15.181855	\N	\N	discord	1395079535698907300
d6c3c109-cfe0-4a50-a3dd-72a54b2ea157	bandookchi0504@gmail.com	https://cdn.discordapp.com/avatars/1014886870515195964/5a192139131c507b7bf4fc3c4c1970f7.png	Bandookchi	bandookchi0504	\N	2025-07-30 20:39:48.829675	\N	\N	discord	1014886870515195964
5cd165e1-46d4-4195-bc9b-7dd29d664424	jpgpai@gmail.com	https://cdn.discordapp.com/avatars/865587618112208916/d168d12012e13e3e8d9afd70c8b82e31.png	ZeroPai	jpgpai	\N	2025-07-31 19:29:56.858713	\N	\N	discord	865587618112208916
6e2a4288-a9b2-41b5-8900-7f7cae01af9b	dannydhanush04@gmail.com	https://cdn.discordapp.com/avatars/1088030073770225736/c6e6185c12e40dbc1057b2828110dd4e.png	Danny	dannydhanush04	\N	2025-07-31 20:01:37.884569	\N	\N	discord	1088030073770225736
12affb31-9d5f-409d-9e54-599669d3afcf	bsanniva@yahoo.com	https://cdn.discordapp.com/avatars/852791900468805632/9d284e3589b62737160b24a94fd1f53b.png	Foraak	bsanniva	\N	2025-08-03 23:39:13.627298	\N	\N	discord	852791900468805632
3b916f0c-46b8-4515-a545-af7b98b514ec	neevmeharwal10@gmail.com	https://cdn.discordapp.com/avatars/623544673365000192/26702c3463be1bc801b4f3e95e869d98.png	NEEV MEHARWAL GAMING	neevmeharwal10	\N	2025-08-03 23:54:40.662795	\N	\N	discord	623544673365000192
1d7f1273-a288-470c-a172-576e01716253	rihen75@gmail.com	https://cdn.discordapp.com/avatars/580440742225379343/d983a9c900a8624398c3255dc988fd5a.png	Livid	rihen75	\N	2025-08-04 03:20:10.531485	\N	\N	discord	580440742225379343
2f8f697d-b4d7-4be0-9942-ea45e66dbce7	vipinrockz1990@gmail.com	https://cdn.discordapp.com/avatars/562606340678352896/56e83b700dddda8c7c9831ed592124a2.png	👑 Nightmare'KinG 👑	vipinrockz1990	\N	2025-08-04 06:56:27.987777	\N	\N	discord	562606340678352896
20a00889-65b7-4384-bd9c-8718a55d6b35	shubhammane1113@gmail.com	https://cdn.discordapp.com/avatars/593110191898361856/4920f5aa2b20dd5787807edbd91c81bc.png	EDGAR	shubhammane1113	\N	2025-08-04 07:00:25.027375	\N	\N	discord	593110191898361856
2ca0ddf6-be25-46fe-b5c7-42be95bea53a	pratyush.m10@gmail.com	https://cdn.discordapp.com/avatars/574515521823834123/0ac856c5247288eaf692e28b401600f8.png	Sikandar | Ved	pratyush.m10	\N	2025-08-04 10:21:55.652297	\N	\N	discord	574515521823834123
8cb5ad59-a775-4ff2-bc84-0e62e1d78bbc	adivyansh51@gmail.com	https://cdn.discordapp.com/avatars/712214051136077826/4f211dbc4739d168d8d413d3fcbe3f4d.png	Brian || Divyansh	adivyansh51	\N	2025-08-04 15:59:31.888922	\N	\N	discord	712214051136077826
dcd97720-cc84-4323-91fb-9ab656155928	kapish4121@gmail.com	https://cdn.discordapp.com/avatars/1335981523660439554/8569adcbd36c70a7578c017bf5604ea5.png	Alen suush	kapish4121	\N	2025-08-05 03:26:33.065476	\N	\N	discord	1335981523660439554
54e6a3a8-32e8-4e10-9197-d619508f3bd7	skinjamul0573@gmail.com	https://cdn.discordapp.com/avatars/491225772237783061/e7a954cd2dac2b208fe29fa3c97b30e6.png	SNOOPY	skinjamul0573	\N	2025-08-05 17:41:03.828149	\N	\N	discord	491225772237783061
f45e91f0-19e2-49a8-a46b-63d25ece4b54	paradisescripts07@gmail.com	https://cdn.discordapp.com/avatars/1326968118802649098/9570cdc21fa909534e9c2a1d95d5ee1c.png	Paradise	paradisescripts07	\N	2025-08-05 21:47:00.880517	\N	\N	discord	1326968118802649098
34d28e31-3add-4833-bba3-eb9323c731aa	akashthokal07@gmail.com	https://cdn.discordapp.com/avatars/568322337066188807/192a1d31666640d27ab86f5fc562087f.png	Akash	akashthokal07	\N	2025-08-05 22:51:27.461171	\N	\N	discord	568322337066188807
90a3a02b-b709-48bc-b088-7143d1766bfa	aswami6031@gmail.com	https://cdn.discordapp.com/avatars/483651139200483349/8ae0dc9ce8c827eb77dca97b6aa953ff.png	Don Carlos	aswami6031	\N	2025-08-07 01:11:15.874045	\N	\N	discord	483651139200483349
e5d7982c-8834-49c0-a728-71ff4bfb3ccc	gauravji1243@gmail.com	https://cdn.discordapp.com/avatars/952874080141475891/ff9071f5c195cbdaaf5e8a433ae2c2f9.png	SANTRA	gauravji1243	\N	2025-08-09 18:18:59.309318	\N	\N	discord	952874080141475891
c83a1d14-2a8d-4f69-9fa9-40fd03cf68a4	adityaprakashx3@gmail.com	https://cdn.discordapp.com/avatars/458472101804769281/a_7af8330e8cfdddcdfe1f7877636f0ecd.gif	xSickick	adityaprakashx3	\N	2025-08-09 18:27:50.309903	\N	\N	discord	458472101804769281
64390eb2-6e89-4bfe-b61a-fbbe6d9cbde5	anikeshmanitripathi23@gmail.com	https://cdn.discordapp.com/avatars/542316003963568138/41987871aa657a55c64a1d836ce0b062.png	Anni	anikeshmanitripathi23	\N	2025-08-09 20:09:43.432199	\N	\N	discord	542316003963568138
48115e75-8705-4d46-89c5-3312c88049bd	ravithakur22905@gmail.com	https://cdn.discordapp.com/avatars/1284764090698567755/94e9693bc6f6ef289b53f1877d35033e.png	Wezzy777	ravithakur22905	\N	2025-08-10 03:33:28.330917	\N	\N	discord	1284764090698567755
317aa211-7bdd-4226-8530-63ffffa943db	finetouchwebsite@gmail.com	https://cdn.discordapp.com/avatars/468003608894636033/9b03c1f81ac8a3e3b0b20a225878e729.png	Head Flicker	finetouchwebsite	\N	2025-08-11 01:13:54.424908	\N	\N	discord	468003608894636033
9897efe8-dd27-40bf-bd66-7a68d9a35b0a	swetank@live.in	https://cdn.discordapp.com/avatars/457343183962243092/a_29093ce745de63c2e58e327169062264.gif	Light-	swetank	\N	2025-08-11 01:19:19.099022	\N	\N	discord	457343183962243092
54e46c85-49f1-4d06-88dc-22629d5d23be	thinkerr@protonmail.com	https://cdn.discordapp.com/avatars/613209480347385879/a_edd7d96f4c7bcd5ae1afc8f7c1adc18b.gif	kingston	thinkerr	\N	2025-08-11 01:28:18.724693	\N	\N	discord	613209480347385879
068f3885-8c1e-4083-b4db-5abf594ec6e2	nikhilsirohi9@gmail.com	https://cdn.discordapp.com/avatars/335708571767537674/7dade31e5053f584211835ff183a59be.png	BloodLine	nikhilsirohi9	\N	2025-08-11 02:32:06.09725	\N	\N	discord	335708571767537674
06f3a222-7029-4578-9818-0e4a074bbfc2	casanjaygarg.99@gmail.com	https://cdn.discordapp.com/avatars/1340177451996938320/8569adcbd36c70a7578c017bf5604ea5.png	Sanjay	casanjaygarg.99	\N	2025-08-11 03:03:17.848956	\N	\N	discord	1340177451996938320
b7d743ca-d710-461f-bbb1-28d02840913f	pratikchakravorty691@gmail.com	https://cdn.discordapp.com/avatars/706801719836803072/47e44828c03e5f667da9c67855c822fc.png	0ctane	pratikchakravorty691	\N	2025-08-11 03:14:35.907167	\N	\N	discord	706801719836803072
e81e7615-4e0c-47cf-ad37-11eadad6db18	parth.md2004@gmail.com	https://cdn.discordapp.com/avatars/687667157940699239/635f2120800edd7d9ad0835536c727af.png	Arceus	parth.md2004	\N	2025-08-11 09:45:18.894155	\N	\N	discord	687667157940699239
d8b25c2f-845e-4279-97ed-56d594fb0aa6	cooldudemukul95@gmail.com	https://cdn.discordapp.com/avatars/235487040278364160/5c1ecb62967341a063b4fcad487c4481.png	8bitMafia	cooldudemukul95	\N	2025-08-11 10:35:56.820623	\N	\N	discord	235487040278364160
0effb77f-367e-4763-9ff7-b89a5627b526	soodjaideep@gmail.com	https://cdn.discordapp.com/avatars/134016202803511296/ea8b3cf9e47642a49d36d29b50b7a45d.png	JD	soodjaideep	\N	2025-08-11 10:37:59.870275	\N	\N	discord	134016202803511296
e3d28c85-edec-40d4-8df1-0db35f764467	rahularora1231@gmail.com	https://cdn.discordapp.com/avatars/353517974189244418/0f2a2cce2876e392f75bed166bc11f89.png	Nigel	rahularora1231	\N	2025-08-11 14:04:31.616904	\N	\N	discord	353517974189244418
c6e1bb70-88b5-42ff-afd0-420b85742fdc	anubhavaman2@gmail.com	https://cdn.discordapp.com/avatars/1203775810205519952/a_369d4fb8cb62fafa402959a39a9a8f09.gif	Jimmy	anubhavaman2	\N	2025-08-11 14:09:58.53086	\N	\N	discord	1203775810205519952
e0d510f2-12a3-4ed3-a2a9-7e3261f38607	igvampire98@gmail.com	https://cdn.discordapp.com/avatars/830128494867906590/f1ee1d1c053c49a5b1c44b46c3bbfc39.png	Vampire	igvampire98	\N	2025-08-11 14:18:01.196386	\N	\N	discord	830128494867906590
3896ead5-83a5-4bc6-8bec-f3ac2fc9b104	tawareh55@gmail.com	https://cdn.discordapp.com/avatars/598833353164062731/a6fc20ef5a87ffe9731b799387eb82b9.png	Harshad	tawareh55	\N	2025-08-11 14:32:28.118471	\N	\N	discord	598833353164062731
d1785713-272d-4de8-ad1c-56ff40a6c653	vedantisop22@gmail.com	https://cdn.discordapp.com/avatars/198573767545323520/933f07d3b30837dbf48460e7520078bf.png	𝕭ʟᴀᴄᴋ͢𝕯ᴇᴠɪʟ ☣	vedantisop22	\N	2025-08-11 15:10:38.832666	\N	\N	discord	198573767545323520
adce9499-4830-4265-a7e7-b2acb2911866	tsanand1972@gmail.com	https://cdn.discordapp.com/avatars/763376025429868544/adaf4c4ebd427abd5b4d37441d667759.png	Henry Gill | Tanmeet singh	tsanand1972	\N	2025-08-11 15:41:41.050215	\N	\N	discord	763376025429868544
9fd162f1-7398-48ba-a410-1dd23ea7cdb6	udit8885@gmail.com	https://cdn.discordapp.com/avatars/557592587330912266/c5270632eb4ac8773862e3f616097465.png	UDIT	udit8885	\N	2025-08-11 15:54:12.506428	\N	\N	discord	557592587330912266
d46c8927-22b1-467d-acb0-acd92c5bb0cf	ashuraofficial1@gmail.com	https://cdn.discordapp.com/avatars/981655069399351398/37267998b06767920710b5116386f5f2.png	Wizeee	ashuraofficial1	\N	2025-08-11 20:45:13.157213	\N	\N	discord	981655069399351398
bf8b2c1f-0176-43c8-91c5-ce2c748537e2	neelbhandari2003@gmail.com	https://cdn.discordapp.com/avatars/575654070875062272/00e9bb032452c3a94ab88d3e2919b981.png	Nick 001	neelbhandari2003	\N	2025-08-11 20:53:33.169521	\N	\N	discord	575654070875062272
67e641de-3f93-4776-b14b-de3411cd344b	2020rishusingh@gmail.com	https://cdn.discordapp.com/avatars/882675963425607680/a043c526cbef41d3267f4db4147f3101.png	FLOW	2020rishusingh	\N	2025-08-12 08:25:05.57667	\N	\N	discord	882675963425607680
e599902e-9b28-4633-9cfc-6ca47ce5f7c2	jbhavya759@gmail.com	https://cdn.discordapp.com/avatars/1311609371305705539/f34a005fdbab4fa57239313735e0e042.png	Nashediii	jbhavya759	\N	2025-08-12 16:32:27.241645	\N	\N	discord	1311609371305705539
6190d2ae-7ec5-4c2d-9a17-89f75642022f	veebogamers@gmail.com	https://cdn.discordapp.com/avatars/454934780027600898/4610a26ce2bccbe70d2648f2121ffecb.png	Veebo	veebogamers	\N	2025-08-13 06:22:36.910219	\N	\N	discord	454934780027600898
8dac9583-3774-4c1c-8e54-a5f8df046332	eshanjaiswal617@gmail.com	https://cdn.discordapp.com/embed/avatars/2.png	Eshan	eshanjaiswal617	\N	2025-08-13 07:31:18.096389	\N	\N	discord	513023756113936416
a9bf83e6-fd99-40f5-a5a2-a2f367b0f40f	sayanbasu809@gmail.com	https://cdn.discordapp.com/avatars/595993183931072533/3c305a6333e6d42735ece783bd161c1a.png	STRYGEN	sayanbasu809	\N	2025-08-13 16:27:26.068057	\N	\N	discord	595993183931072533
de1c9b76-9e0e-4f16-88a2-d296e2773cf7	shubh000chaturvedi@gmail.com	https://cdn.discordapp.com/avatars/716364212133429298/0ebc5c8a367832826f8a87eb97b78806.png	shubh	shubh000chaturvedi	\N	2025-08-13 18:51:05.476572	\N	\N	discord	716364212133429298
48cabcfa-3586-4688-8773-46e03be6dc30	awasthisanskar431@gmail.com	https://cdn.discordapp.com/avatars/705312180526121032/5b7977659577eba095722f85e5a9afee.png	Munna Tripathi	awasthisanskar431	\N	2025-08-13 20:44:53.032166	\N	\N	discord	705312180526121032
43ce4331-057c-4846-b46c-ff84a2ec8290	iconiccity2025@gmail.com	https://cdn.discordapp.com/avatars/1322046048092295276/05b81aca55368e211c18b71d6423c46a.png	ICONIC CITY	iconiccity2025	\N	2025-08-15 20:48:00.619624	\N	\N	discord	1322046048092295276
da162a67-eba5-4818-85b3-fa5d62ff7567	ashish199227@gmail.com	https://cdn.discordapp.com/avatars/522089424557965327/d46e8fe883183841df24f9d30c12c37f.png	Ashish	ashish199227	\N	2025-08-16 16:08:21.777724	\N	\N	discord	522089424557965327
aab7bee8-273d-4e4a-82ea-3ff16950bfd3	aarushb03@gmail.com	https://cdn.discordapp.com/avatars/836542871120379924/ccb65fa06fc7f41e0cde99172ab7a10f.png	xRush	aarushb03	\N	2025-08-16 21:15:54.664684	\N	\N	discord	836542871120379924
8608ea8e-5d6e-4434-812f-bf3aa68608d3	offensivespirit158@gmail.com	https://cdn.discordapp.com/avatars/1310336004376498189/133cdae7a668d0ecf50352301527b0be.png	Spirit	offensivespirit158	\N	2025-08-19 06:11:04.516174	\N	\N	discord	1310336004376498189
e104415e-8e91-4088-b983-167cfbff0a0d	vishavniyanta06@gmail.com	https://cdn.discordapp.com/avatars/812271691098357801/431ac40bb88c0491013be458a52a552e.png	VishavGames	vishavniyanta06	\N	2025-08-22 09:21:35.446618	\N	\N	discord	812271691098357801
741b3485-cad0-422c-8480-9b0bfa6a3977	vikashbhardwaj8167@gmail.com	https://cdn.discordapp.com/avatars/574251643441381391/1c9c33dce2ce75771232babbd0425a12.png	UK7BROLY	vikashbhardwaj8167	\N	2025-08-22 09:21:37.255992	\N	\N	discord	574251643441381391
ab0bd5c5-8f8c-4629-a53a-6429d6474fde	killasingh04@gmail.com	https://cdn.discordapp.com/avatars/756549244470558811/b640472d777d62cbbda3992d5dbf5dfb.png	Rocky	killasingh04	\N	2025-08-22 09:21:48.402586	\N	\N	discord	756549244470558811
0520dd49-6a2c-4b26-a30d-45be020c8414	amlokiakiaki12@gmail.com	https://cdn.discordapp.com/avatars/806785884891381821/54ea88245ee121d85ed8d8cc65482810.png	! JIMMY !	amlokiakiaki12	\N	2025-08-22 09:21:57.17436	\N	\N	discord	806785884891381821
46eb4e82-0b5d-4f05-a00b-5f2d8e63ec28	supplimentsitahari@gmail.com	https://cdn.discordapp.com/avatars/1320997714519130192/dde3ae41a9b3217085ae6a5370002a38.png	MIKEY KUN	supplimentsitahari	\N	2025-08-22 09:28:32.516415	\N	\N	discord	1320997714519130192
bbe31ff2-cb56-4e70-a618-fab67f9c1d4f	adil.maniar@gmail.com	https://cdn.discordapp.com/avatars/318860677521342464/d62dc4886b2a32dc6b1efff747d3b6e3.png	RusherwOw	adil.maniar	\N	2025-08-22 12:33:03.661973	\N	\N	discord	318860677521342464
90ff4ed4-5bcb-4dc0-86b1-62617366f3c3	shujaatalikhan21@gmail.com	https://cdn.discordapp.com/avatars/621492592277717066/b702da48922abcf6332e9f271fb82a90.png	Xander89 Gamer	shujaatalikhan21	\N	2025-08-22 13:17:24.703685	\N	\N	discord	621492592277717066
ee786478-3c4c-42de-9976-dff24d9812a7	sam06062000@gmail.com	https://cdn.discordapp.com/avatars/514066761264398337/8cd0e522250be1cbe97380c16ace4cfc.png	itz._.sam	sam06062000	\N	2025-08-22 20:45:31.808786	\N	\N	discord	514066761264398337
b5ed5aaf-78e0-4bb6-b706-f8dcfd27c317	gulshanjaisinghani1@gmail.com	https://cdn.discordapp.com/embed/avatars/2.png	Rancho	gulshanjaisinghani1	\N	2025-08-23 05:39:33.177241	\N	\N	discord	1406359254037954601
9409ab78-255b-4048-89de-8af7819c698c	vrajsavalia16@gmail.com	https://cdn.discordapp.com/avatars/504007930652393473/54f2e843aafb22efea7c4bd0fa3bed5d.png	JasonBourne	vrajsavalia16	\N	2025-08-23 09:53:25.309769	\N	\N	discord	504007930652393473
a90fd48b-37f3-47b4-bfce-6468da844483	gamerbipinop@gmail.com	https://cdn.discordapp.com/avatars/1092672137904525383/1784541ba4f0bd91c09838b1016d50d8.png	KiyoTaka !	gamerbipinop	\N	2025-08-23 15:34:38.072196	\N	\N	discord	1092672137904525383
ea119a1d-0000-43ef-951d-b009a8132131	sohamporey218@gmail.com	https://cdn.discordapp.com/avatars/793494905376210994/e79b6528bf65231c9716641ec4856b22.png	IŔØÑŠØHÄM	sohamporey218	\N	2025-08-24 12:21:40.523799	\N	\N	discord	793494905376210994
26bda708-4b0c-48fa-8a54-03afec3513e6	navvplayz1999@gmail.com	https://cdn.discordapp.com/avatars/1068573860619894784/ca82e5b13b0aebd311ad482b7c69ac2a.png	ARR DEE | Navviigator	navvplayz1999	\N	2025-08-25 11:55:36.53312	\N	\N	discord	1068573860619894784
775e3ca2-e91d-430c-8a8a-091ede9c0860	cloudx724@gmail.com	https://cdn.discordapp.com/avatars/1103693679220248668/32debf153002a3a5eaa4af803664f289.png	megatron	cloudx724	\N	2025-08-25 12:29:58.626682	\N	\N	discord	1103693679220248668
271cfbcb-8dbf-4597-a353-061538e34e4b	rishidaddy377@gmail.com	https://cdn.discordapp.com/embed/avatars/5.png	gamecrux	rishidaddy377	\N	2025-08-26 18:34:25.501431	\N	\N	discord	1409968621639434321
85afc70c-5ec0-4faa-b055-b5eb92a52b84	nitsplay2083@gmail.com	https://cdn.discordapp.com/avatars/1119308176861438004/f93f85eddcfb6fff20ff515dc2bd1977.png	Nits Playz	nitsplay2083	\N	2025-08-27 10:20:34.571988	\N	\N	discord	1119308176861438004
86f4517b-e4db-473c-a9dd-bcf6da2b505a	miyatrajaydev98@gmail.com	https://cdn.discordapp.com/avatars/999378734496874496/2f8e5f1f5dc2c669cbb91d2217615791.png	ENFIELD 98	miyatrajaydev98	\N	2025-08-27 10:26:49.896234	\N	\N	discord	999378734496874496
42127ae6-5a60-44d6-aaa0-a6aa3183c2ad	neenaraghav12@gmail.com	https://cdn.discordapp.com/avatars/466879181767049217/087f3e3688a9d9de23a5c554fe0719fe.png	Nina	neenaraghav12	\N	2025-08-27 15:12:46.19501	\N	\N	discord	466879181767049217
07547bef-4abe-4576-aed6-2712ecb3681e	dkdiscord460@gmail.com	https://cdn.discordapp.com/avatars/994485676009590894/6f114c5707cf4f4bd5dd53920ac597e5.png	- DK	dkdiscord460	\N	2025-08-27 15:27:58.928648	\N	\N	discord	994485676009590894
be3fc471-b8aa-42fb-9442-0b67f9598781	thebeast26092001@gmail.com	https://cdn.discordapp.com/avatars/918797246592589824/ee08c059ad114ac7285148dbab16b70b.png	mythic_yt	thebeast26092001	\N	2025-08-27 15:33:22.033318	\N	\N	discord	918797246592589824
261036dc-5b5f-4839-9b6f-751b738c388f	cheifsurajgaming@gmail.com	https://cdn.discordapp.com/avatars/673863018857103430/2f820e12c1fd44c9a5a68566d63c5602.png	GxN Gaming	cheifsurajgaming	\N	2025-08-27 18:30:25.726121	\N	\N	discord	673863018857103430
c2bc3000-7a3e-4119-b79f-848159e70c37	waghelavijaysinh72269@gmail.com	https://cdn.discordapp.com/embed/avatars/1.png	VIJAY*0007	waghelavijaysinh72269	\N	2025-08-27 19:19:12.79707	\N	\N	discord	503111049218621451
a26cccf8-2bfd-4771-883b-0f550def3e4b	mistakilla99@gmail.com	https://cdn.discordapp.com/avatars/1014455176939188315/4be5de1788ec96bf2a0b4afd437501aa.png	MK	mistakilla99	\N	2025-08-28 13:53:30.131116	\N	\N	discord	1014455176939188315
db25cfe3-77f2-4b5c-82ef-fe5d92be80ad	sabhi796@gmail.com	https://cdn.discordapp.com/avatars/452345924627464202/3a571375f456c4978c3e01b80db64267.png	Zester Costello	sabhi796	\N	2025-08-29 05:59:54.844607	\N	\N	discord	452345924627464202
bbe0137d-7560-4e6a-86cb-52b572152ee9	hemantcreation1001@gmail.com	https://cdn.discordapp.com/avatars/574473167972597780/31c96080782d6a61e65353f3df0482ef.png	Fl Noob #2048	hemantcreation1001	\N	2025-08-30 02:33:40.871544	\N	\N	discord	574473167972597780
dc47d383-9d96-41ea-a47b-09cb4128e82e	zeropai54@gmail.com	https://cdn.discordapp.com/embed/avatars/5.png	Zero_Pai	zeropai54	\N	2025-08-30 22:06:33.448381	\N	\N	discord	1411468462093504524
6618a9d1-dd63-4805-9f58-f9af0574f253	mahajant30@gmail.com	https://cdn.discordapp.com/avatars/530406940073787403/38db7024fbb4505cf88956d143d166c1.png	_Zodii_	mahajant30	\N	2025-08-30 22:27:53.599386	\N	\N	discord	530406940073787403
3609df9d-f927-40be-a036-3a24f24cde9f	singharyaman848@gmail.com	https://cdn.discordapp.com/avatars/577456154574323722/a_54864ec26fbe81029e9539ed62a66c77.gif	! EAZY	singharyaman848	\N	2025-08-31 13:28:55.591564	\N	\N	discord	577456154574323722
f1fb5e0b-713c-4728-8c54-bc6439b30331	evilgaming2728@gmail.com	https://cdn.discordapp.com/avatars/552838385958518794/a_fc3af9081bee7d732e9c1f97ed467eef.gif	G.O.A.T	evilgaming2728	\N	2025-09-03 09:08:55.086026	\N	\N	discord	552838385958518794
49df1312-5729-4891-90dd-30156c8a17c3	taniagamingyt@gmail.com	https://cdn.discordapp.com/avatars/737244880937418753/9e4de5745b714a31c4e432e40d2f7b07.png	Tania Gaming	taniagamingyt	\N	2025-09-03 09:14:51.783574	\N	\N	discord	737244880937418753
f43d8946-2131-4727-84e5-d0844b42daa5	tashphuntsok24@gmail.com	https://cdn.discordapp.com/avatars/1067824778683097150/e804a54b07c83f15e2151d25b0e153d5.png	Lol	tashphuntsok24	\N	2025-09-03 16:37:35.404975	\N	\N	discord	1067824778683097150
a2199138-5645-48e2-a83b-d7feddfabd43	public8769@gmail.com	https://cdn.discordapp.com/embed/avatars/0.png	Sam_0	public8769	\N	2025-09-07 14:52:23.971879	\N	\N	discord	1414258663366852719
e4d71b8b-e7ab-40e1-8d16-046081186351	krishmarediya786@gmail.com	https://cdn.discordapp.com/avatars/847114605784596530/5b77a13a95c6b3827cdf617156f2c0b7.png	kqk	krishmarediya786	\N	2025-09-08 06:32:47.477347	\N	\N	discord	847114605784596530
\.


--
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-01-21 09:05:43
20211116045059	2025-01-21 09:05:44
20211116050929	2025-01-21 09:05:45
20211116051442	2025-01-21 09:05:45
20211116212300	2025-01-21 09:05:46
20211116213355	2025-01-21 09:05:47
20211116213934	2025-01-21 09:05:47
20211116214523	2025-01-21 09:05:48
20211122062447	2025-01-21 09:05:49
20211124070109	2025-01-21 09:05:50
20211202204204	2025-01-21 09:05:50
20211202204605	2025-01-21 09:05:51
20211210212804	2025-01-21 09:05:53
20211228014915	2025-01-21 09:05:53
20220107221237	2025-01-21 09:05:54
20220228202821	2025-01-21 09:05:55
20220312004840	2025-01-21 09:05:55
20220603231003	2025-01-21 09:05:56
20220603232444	2025-01-21 09:05:57
20220615214548	2025-01-21 09:05:58
20220712093339	2025-01-21 09:05:58
20220908172859	2025-01-21 09:05:59
20220916233421	2025-01-21 09:06:00
20230119133233	2025-01-21 09:06:00
20230128025114	2025-01-21 09:06:01
20230128025212	2025-01-21 09:06:02
20230227211149	2025-01-21 09:06:02
20230228184745	2025-01-21 09:06:03
20230308225145	2025-01-21 09:06:04
20230328144023	2025-01-21 09:06:04
20231018144023	2025-01-21 09:06:05
20231204144023	2025-01-21 09:06:06
20231204144024	2025-01-21 09:06:07
20231204144025	2025-01-21 09:06:07
20240108234812	2025-01-21 09:06:08
20240109165339	2025-01-21 09:06:09
20240227174441	2025-01-21 09:06:10
20240311171622	2025-01-21 09:06:11
20240321100241	2025-01-21 09:06:12
20240401105812	2025-01-21 09:06:14
20240418121054	2025-01-21 09:06:15
20240523004032	2025-01-21 09:06:17
20240618124746	2025-01-21 09:06:18
20240801235015	2025-01-21 09:06:18
20240805133720	2025-01-21 09:06:19
20240827160934	2025-01-21 09:06:19
20240919163303	2025-01-21 09:06:20
20240919163305	2025-01-21 09:06:21
20241019105805	2025-01-21 09:06:22
20241030150047	2025-01-21 09:06:24
20241108114728	2025-01-21 09:06:25
20241121104152	2025-01-21 09:06:25
20241130184212	2025-01-21 09:06:26
20241220035512	2025-01-21 09:06:27
20241220123912	2025-01-21 09:06:27
20241224161212	2025-01-21 09:06:28
20250107150512	2025-01-21 09:06:29
20250110162412	2025-01-21 09:06:29
20250123174212	2025-02-06 22:34:01
20250128220012	2025-02-06 22:34:02
20250506224012	2025-06-13 20:32:26
20250523164012	2025-06-13 20:32:26
20250714121412	2025-08-04 11:01:48
\.


--
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-01-21 09:05:40.881141
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-01-21 09:05:40.894471
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-01-21 09:05:40.901969
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-01-21 09:05:40.93952
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-01-21 09:05:40.971908
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-01-21 09:05:40.978661
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-01-21 09:05:40.987488
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-01-21 09:05:41.008365
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-01-21 09:05:41.024202
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-01-21 09:05:41.035044
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-01-21 09:05:41.043484
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-01-21 09:05:41.051154
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-01-21 09:05:41.064489
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-01-21 09:05:41.072137
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-01-21 09:05:41.079664
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-01-21 09:05:41.114638
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-01-21 09:05:41.123314
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-01-21 09:05:41.131175
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-01-21 09:05:41.141161
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-01-21 09:05:41.151118
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-01-21 09:05:41.161289
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-01-21 09:05:41.175623
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-01-21 09:05:41.213534
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-01-21 09:05:41.244583
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-01-21 09:05:41.251257
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-01-21 09:05:41.257764
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-08-26 17:29:52.471077
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-08-26 17:29:53.063918
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-08-26 17:29:53.177174
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-08-26 17:29:53.373513
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-08-26 17:29:53.478986
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-08-26 17:29:54.663104
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-08-26 17:29:54.965617
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-08-26 17:29:55.167053
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-08-26 17:29:55.169826
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-08-26 17:29:55.261745
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-08-26 17:29:55.272289
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-08-26 17:29:55.369352
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-08-26 17:29:55.377804
\.


--
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 4, true);


--
--



--
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id);


--
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: suggestions suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_pkey PRIMARY KEY (id);


--
-- Name: users users_discord_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_discord_id_unique UNIQUE (discord_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
--

CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id);


--
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
--



--
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: suggestions suggestions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
--




--
--



--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--



--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
-- Name: TABLE subscriptions; Type: ACL; Schema: public; Owner: postgres
--



--
-- Name: TABLE suggestions; Type: ACL; Schema: public; Owner: postgres
--



--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
--



--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;


--
--



--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;


--
--



--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;


--
--



--
--



--
--



--
--



--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO postgres;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO postgres;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO postgres;


--
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();



--
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();



--
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();



--
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();



--
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();



--
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();



--
-- PostgreSQL database dump complete
--

\unrestrict LO41sdj48df0G2DIbuliEkxPh6FW7aSqBXXmO1Jq1jeXMmag07Qu7Kng8nIKGGz

--
-- PostgreSQL database cluster dump complete
--

