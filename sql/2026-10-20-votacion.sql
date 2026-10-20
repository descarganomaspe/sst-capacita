-- ═══════════════════════════════════════════════════════════════════
--  OBRASST · la votación de la elección (comité, sub-comité o
--  supervisor de SST) desde el celular de cada elector
--  20/10/2026 · lote 21 · aditivo · se puede correr dos veces
--
--  Lo pidió Marcelo: «La votación para la elección del supervisor, del
--  subcomité y del comité que se haga por el mismo celular, anónimo, y
--  se quede como sustento, se realiza un formato de ello».
--  (La otra forma, en un celular de la mesa, no pasa por acá: la app la
--  hace sin internet.)
--
--  CÓMO VA:
--   · Quien organiza (en la app o en la web, con su cuenta) abre la
--     votación: manda los candidatos, cuántas marcas lleva la cédula,
--     hasta cuándo se vota y el padrón. De cada elector llegan su llave,
--     su nombre, la huella (sha256) de su documento y la de un código
--     personal que inventa la app. EL CÓDIGO NO LLEGA ACÁ: queda en el
--     equipo que abrió la votación y en las cédulas personales que se
--     reparten.
--   · El elector abre vota/#CÓDIGO en su celular (sin cuenta y sin
--     instalar nada), confirma su documento, firma para el padrón y vota.
--   · Al cerrar (a mano, o sola al vencer la hora), cada cédula recibe un
--     número al azar y se calcula el código de integridad de todas.
--
--  QUÉ QUIERE DECIR «SECRETO» ACÁ, CON LA MANO EN LA BASE:
--   · La cédula no guarda quién votó: ni llave, ni nombre, ni código, ni
--     cuenta, ni hora. No existen las columnas: ningún cambio futuro las
--     puede «llenar por si acaso».
--   · Quién votó (con su hora y su firma) va en el padrón, aparte.
--   · Mientras se vota, nadie ve cómo va: solo cuántos votaron y quiénes.
--     Las cédulas y el resultado salen recién al cerrar.
--   · Al cerrar, las cédulas se reescriben todas juntas, en un orden al
--     azar, con su número: el orden en que llegaron deja de estar en la
--     tabla (y con él, lo que se podría cruzar con la hora del padrón).
--   · Lo que esta base no controla: el registro de peticiones de
--     Supabase (con la IP) y los datos internos de Postgres los ve solo
--     quien administra el servidor. Por eso no se promete más de lo que
--     es: ni la empresa, ni la junta, ni el supervisor pueden saber por
--     quién votó cada uno.
--
--  QUIÉN LA MANEJA: un miembro activo de la obra (igual que el comité, que
--  lo edita cualquier miembro) o el líder (dueño de la empresa raíz).
--  Nadie la lee directo de las tablas: RLS encendido y sin políticas; se
--  entra solo por las funciones de abajo. Nada se borra: se cierra o se
--  anula.
-- ═══════════════════════════════════════════════════════════════════

-- ── 0 · lo que damos por sentado ───────────────────────────────────
do $$
begin
  if to_regclass('public.sst_empresa') is null then raise exception 'no existe public.sst_empresa'; end if;
  if to_regprocedure('public.sst_es_miembro(uuid)') is null then raise exception 'falta sst_es_miembro(uuid)'; end if;
  if to_regprocedure('public.sst_es_dueno(uuid)')   is null then raise exception 'falta sst_es_dueno(uuid)'; end if;
  if to_regprocedure('public.sst_raiz(uuid)')        is null then raise exception 'falta sst_raiz(uuid)'; end if;
  raise notice 'lo que se da por sentado: ok';
end $$;


-- ── 1 · las tablas ──────────────────────────────────────────────────
create table if not exists sst_votacion (
  id           uuid primary key default gen_random_uuid(),
  empresa      uuid not null,
  creada       timestamptz not null default now(),
  creada_por   uuid,
  cierra       timestamptz not null,
  estado       text not null default 'abierta' check (estado in ('abierta','cerrada','anulada')),
  cerrada_en   timestamptz,
  cerrada_por  uuid,           -- null: se cerró sola, al vencer la hora
  info         jsonb not null, -- {cuerpo, dia, marcas, cands:[{id, n}]}
  sello        text            -- el código de integridad (sha256 de todas las cédulas, al cerrar)
);
create index if not exists sst_votacion_emp on sst_votacion (empresa, creada desc);

create table if not exists sst_votacion_elector (
  votacion   uuid not null references sst_votacion (id),
  k          text not null,         -- la llave del elector en la app («d:» + documento, o «n:» + nombre)
  nombre     text not null,
  doc_h      text,                  -- sha256 de «doc:» + su documento (si lo tiene): lo confirma al votar
  cod_h      text not null unique,  -- sha256 de «cod:» + su código personal (el código no se guarda)
  votado_en  timestamptz,           -- cuándo votó (el padrón); la cédula va aparte, sin esto
  firma      jsonb,                 -- su firma para el padrón, en trazos ({h, p}: como las firmas de la app)
  intentos   integer not null default 0,   -- documentos equivocados seguidos: a los 5 se bloquea
  primary key (votacion, k)
);

create table if not exists sst_votacion_cedula (
  id        uuid primary key default gen_random_uuid(),
  votacion  uuid not null references sst_votacion (id),
  marcas    jsonb not null default '[]'::jsonb,   -- los candidatos marcados (sus id, ordenados)
  blanco    boolean not null default false,
  n         integer                               -- su número, al azar, al cerrar
);
create index if not exists sst_votacion_cedula_v on sst_votacion_cedula (votacion);

-- el tope contra quien prueba códigos al azar: general y por hora; la
-- clave no nombra a nadie; vence y se borra
create table if not exists sst_votacion_tope (
  clave  text primary key,
  veces  integer not null default 1,
  vence  timestamptz not null
);

alter table sst_votacion         enable row level security;
alter table sst_votacion_elector enable row level security;
alter table sst_votacion_cedula  enable row level security;
alter table sst_votacion_tope    enable row level security;
-- Sin políticas A PROPÓSITO: ni la llave anónima ni una cuenta las leen
-- directo. Solo las funciones de abajo, que preguntan antes.
revoke all on sst_votacion, sst_votacion_elector, sst_votacion_cedula, sst_votacion_tope from anon, authenticated;

comment on table sst_votacion is
  'La votación de una elección (comité, sub-comité o supervisor de SST) desde el celular de cada elector. Se entra por sst_votacion_*() y sst_votar().';
comment on table sst_votacion_cedula is
  'Las cédulas: sin quién votó ni la hora. Al cerrar se numeran al azar (n) y se reescriben juntas.';
comment on column sst_votacion_elector.cod_h is
  'sha256 de «cod:» + el código personal del elector. El código no se guarda.';


-- ── 2 · lo de adentro ──────────────────────────────────────────────
-- el código o el documento, sin espacios ni guiones, en mayúsculas
create or replace function _sst_vot_limpio(p text)
returns text language sql immutable set search_path = public, pg_temp as $$
  select upper(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g'))
$$;

create or replace function _sst_vot_huella(p_tipo text, p text)
returns text language sql immutable set search_path = public, pg_temp as $$
  select encode(sha256(convert_to(p_tipo || ':' || _sst_vot_limpio(p), 'UTF8')), 'hex')
$$;

-- quién la maneja: un miembro activo de la obra o el líder
create or replace function _sst_vot_puede(p_emp uuid)
returns boolean language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null or p_emp is null then return false; end if;
  return sst_es_miembro(p_emp) or sst_es_dueno(p_emp) or sst_es_dueno(sst_raiz(p_emp));
end $$;

-- suma uno a un contador y dice cuántos van
create or replace function _sst_vot_tope(p_clave text, p_vence timestamptz)
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare v_n integer;
begin
  insert into sst_votacion_tope (clave, veces, vence) values (p_clave, 1, p_vence)
  on conflict (clave) do update set veces = sst_votacion_tope.veces + 1
  returning veces into v_n;
  return v_n;
end $$;

-- ¿muchas búsquedas fallidas en esta hora? (las claves en UTC: el huso
-- de la sesión, que se puede pedir desde afuera, no parte un contador)
create or replace function _sst_vot_frenado()
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
  delete from sst_votacion_tope where vence < now();
  return coalesce((select t.veces from sst_votacion_tope t
                    where t.clave = 'mal:' || to_char(now() at time zone 'UTC', 'YYYYMMDDHH24')), 0) >= 600;
end $$;

create or replace function _sst_vot_fallo()
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform _sst_vot_tope('mal:' || to_char(now() at time zone 'UTC', 'YYYYMMDDHH24'), date_trunc('hour', now()) + interval '1 hour');
end $$;

-- el estado que se ve: la abierta cuya hora ya pasó es «vencida»
create or replace function _sst_vot_estado(p_estado text, p_cierra timestamptz)
returns text language sql stable set search_path = public, pg_temp as $$
  select case when p_estado = 'abierta' and p_cierra <= now() then 'vencida' else p_estado end
$$;

-- cerrar: cada cédula, un número al azar (y todas reescritas de una vez);
-- después, el código de integridad. El texto es el mismo que arma la app:
--   OBRASST-VOTO:<id>  y una línea por cédula, «n:marcas» (o «n:B»)
create or replace function _sst_vot_cerrar(p_id uuid, p_por uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_sello text;
begin
  update sst_votacion_cedula c set n = s.rn
    from (select id, row_number() over (order by random()) as rn
            from sst_votacion_cedula where votacion = p_id) s
   where c.id = s.id;
  select encode(sha256(convert_to('OBRASST-VOTO:' || p_id::text || coalesce(string_agg(
           E'\n' || c.n::text || ':' || case when c.blanco then 'B'
             else coalesce((select string_agg(x, '+' order by x collate "C") from jsonb_array_elements_text(c.marcas) x), 'B') end,
           '' order by c.n), ''), 'UTF8')), 'hex')
    into v_sello
    from sst_votacion_cedula c
   where c.votacion = p_id;
  update sst_votacion set estado = 'cerrada', cerrada_en = now(), cerrada_por = p_por, sello = v_sello
   where id = p_id and estado = 'abierta';
end $$;


-- ── 3 · quien organiza abre la votación ────────────────────────────
--   p_info: {cuerpo, dia, marcas, cands:[{id, n}]}
--   p_electores: [{k, nombre, doc_h, cod_h}]  (doc_h puede ir vacío)
create or replace function sst_votacion_abrir(p_emp uuid, p_info jsonb, p_electores jsonb, p_cierra timestamptz)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_cands jsonb; v_marcas integer; v_n integer; v_m text; e jsonb;
        v_k text; v_nom text; v_doc text; v_cod text;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  if not _sst_vot_puede(p_emp) then return json_build_object('ok', false, 'motivo', 'no_eres_miembro'); end if;
  if p_cierra is null or p_cierra <= now() + interval '5 minutes' then
    return json_build_object('ok', false, 'motivo', 'cierra_pasado');
  end if;
  if p_cierra > now() + interval '31 days' then return json_build_object('ok', false, 'motivo', 'cierra_lejos'); end if;
  if p_info is null or jsonb_typeof(p_info) <> 'object' then return json_build_object('ok', false, 'motivo', 'datos_raros'); end if;

  -- los candidatos: cada uno con su id (corto, sin espacios) y su nombre; sin repetir
  v_cands := p_info -> 'cands';
  if v_cands is null or jsonb_typeof(v_cands) <> 'array' or jsonb_array_length(v_cands) < 1 or jsonb_array_length(v_cands) > 60 then
    return json_build_object('ok', false, 'motivo', 'sin_candidatos');
  end if;
  if exists (select 1 from jsonb_array_elements(v_cands) c
              where jsonb_typeof(c) <> 'object'
                 or coalesce(c->>'id', '') !~ '^[A-Za-z0-9_-]{1,40}$'
                 or length(btrim(coalesce(c->>'n', ''))) not between 1 and 120)
     or (select count(distinct c->>'id') from jsonb_array_elements(v_cands) c) <> jsonb_array_length(v_cands) then
    return json_build_object('ok', false, 'motivo', 'candidatos_raros');
  end if;
  v_cands := (select jsonb_agg(jsonb_build_object('id', c->>'id', 'n', btrim(c->>'n'))) from jsonb_array_elements(v_cands) c);
  v_m := coalesce(p_info->>'marcas', '1');
  v_marcas := case when v_m ~ '^[0-9]{1,2}$' then least(6, greatest(1, v_m::integer)) else 1 end;
  v_marcas := least(v_marcas, jsonb_array_length(v_cands));

  if p_electores is null or jsonb_typeof(p_electores) <> 'array' or jsonb_array_length(p_electores) < 1 then
    return json_build_object('ok', false, 'motivo', 'sin_electores');
  end if;
  if jsonb_array_length(p_electores) > 3000 then return json_build_object('ok', false, 'motivo', 'muchos_electores'); end if;

  begin
    insert into sst_votacion (empresa, creada_por, cierra, info)
    values (p_emp, auth.uid(), p_cierra,
            jsonb_build_object('cuerpo', left(btrim(coalesce(p_info->>'cuerpo', '')), 160),
                               'dia', left(btrim(coalesce(p_info->>'dia', '')), 10),
                               'marcas', v_marcas, 'cands', v_cands))
    returning id into v_id;
    v_n := 0;
    for e in select * from jsonb_array_elements(p_electores) loop
      v_k   := left(btrim(coalesce(e->>'k', '')), 160);
      v_nom := left(btrim(coalesce(e->>'nombre', '')), 120);
      v_doc := lower(btrim(coalesce(e->>'doc_h', '')));
      v_cod := lower(btrim(coalesce(e->>'cod_h', '')));
      if v_k = '' or v_nom = '' or v_cod !~ '^[0-9a-f]{64}$' or (v_doc <> '' and v_doc !~ '^[0-9a-f]{64}$') then
        raise exception 'elector_raro';
      end if;
      insert into sst_votacion_elector (votacion, k, nombre, doc_h, cod_h) values (v_id, v_k, v_nom, nullif(v_doc, ''), v_cod);
      v_n := v_n + 1;
    end loop;
  exception
    when unique_violation then return json_build_object('ok', false, 'motivo', 'electores_repetidos');
    when raise_exception  then return json_build_object('ok', false, 'motivo', 'electores_raros');
  end;
  return json_build_object('ok', true, 'id', v_id, 'cierra', p_cierra, 'electores', v_n, 'marcas', v_marcas);
end $$;


-- ── 4 · el elector abre su cédula y vota (sin cuenta) ──────────────
create or replace function sst_votacion_cedula(p_cod text)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v_cod text; r record;
begin
  v_cod := _sst_vot_limpio(p_cod);
  if length(v_cod) < 10 or length(v_cod) > 32 then return json_build_object('ok', false, 'motivo', 'codigo_raro'); end if;
  if _sst_vot_frenado() then return json_build_object('ok', false, 'motivo', 'muy_seguido'); end if;
  select e.nombre, e.doc_h, e.votado_en, e.intentos, v.estado, v.cierra, v.info, m.nombre as obra
    into r
    from sst_votacion_elector e
    join sst_votacion v on v.id = e.votacion
    left join sst_empresa m on m.id = v.empresa
   where e.cod_h = _sst_vot_huella('cod', v_cod);
  if not found then
    perform _sst_vot_fallo();
    return json_build_object('ok', false, 'motivo', 'no_esta');
  end if;
  return json_build_object('ok', true, 'obra', r.obra, 'nombre', r.nombre,
    'cuerpo', r.info->>'cuerpo', 'dia', r.info->>'dia', 'marcas', (r.info->>'marcas')::integer, 'cands', r.info->'cands',
    'cierra', r.cierra, 'estado', _sst_vot_estado(r.estado, r.cierra),
    'ya', r.votado_en is not null, 'pide_doc', r.doc_h is not null, 'bloqueado', r.intentos >= 5);
end $$;

create or replace function sst_votar(p_cod text, p_doc text, p_marcas jsonb, p_blanco boolean, p_firma text)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v_cod text; r record; v_ids text[]; v_n integer; v_max integer; v_marcas jsonb; v_firma jsonb;
begin
  v_cod := _sst_vot_limpio(p_cod);
  if length(v_cod) < 10 or length(v_cod) > 32 then return json_build_object('ok', false, 'motivo', 'codigo_raro'); end if;
  if _sst_vot_frenado() then return json_build_object('ok', false, 'motivo', 'muy_seguido'); end if;
  -- la fila del elector, trabada: dos toques a la vez no hacen dos votos
  select e.votacion, e.k, e.doc_h, e.votado_en, e.intentos, v.estado, v.cierra, v.info
    into r
    from sst_votacion_elector e
    join sst_votacion v on v.id = e.votacion
   where e.cod_h = _sst_vot_huella('cod', v_cod)
     for update of e;
  if not found then
    perform _sst_vot_fallo();
    return json_build_object('ok', false, 'motivo', 'no_esta');
  end if;
  if r.estado <> 'abierta' then return json_build_object('ok', false, 'motivo', r.estado); end if;
  if r.cierra <= now() then return json_build_object('ok', false, 'motivo', 'vencida'); end if;
  if r.votado_en is not null then return json_build_object('ok', false, 'motivo', 'ya_voto'); end if;
  if r.intentos >= 5 then return json_build_object('ok', false, 'motivo', 'bloqueado'); end if;

  -- su documento, si el padrón lo tiene: cinco equivocados seguidos lo bloquean
  if r.doc_h is not null and _sst_vot_huella('doc', p_doc) <> r.doc_h then
    update sst_votacion_elector set intentos = intentos + 1 where votacion = r.votacion and k = r.k;
    return json_build_object('ok', false, 'motivo', 'doc_no_coincide', 'quedan', greatest(0, 4 - r.intentos));
  end if;

  -- la cédula: en blanco, o de 1 a «marcas» candidatos, sin repetir y de la lista
  v_max := coalesce((r.info->>'marcas')::integer, 1);
  if coalesce(p_blanco, false) then
    v_marcas := '[]'::jsonb;
  else
    if p_marcas is null or jsonb_typeof(p_marcas) <> 'array' then return json_build_object('ok', false, 'motivo', 'cedula_rara'); end if;
    select array_agg(distinct x) into v_ids from jsonb_array_elements_text(p_marcas) x;
    v_n := coalesce(array_length(v_ids, 1), 0);
    if v_n < 1 or v_n > v_max or v_n <> jsonb_array_length(p_marcas) then
      return json_build_object('ok', false, 'motivo', 'cedula_rara');
    end if;
    if exists (select 1 from unnest(v_ids) i
                where not exists (select 1 from jsonb_array_elements(r.info->'cands') c where c->>'id' = i)) then
      return json_build_object('ok', false, 'motivo', 'cedula_rara');
    end if;
    -- ordenadas: el orden en que tocó no queda
    select to_jsonb(array_agg(i order by i collate "C")) into v_marcas from unnest(v_ids) i;
  end if;

  -- la firma para el padrón (si viene): sus trazos, como las firmas de la app ({h, p: [[x, y, x, y…], …]})
  v_firma := null;
  if nullif(btrim(coalesce(p_firma, '')), '') is not null then
    if length(p_firma) > 40000 then return json_build_object('ok', false, 'motivo', 'firma_rara'); end if;
    begin
      v_firma := p_firma::jsonb;
    exception when others then
      return json_build_object('ok', false, 'motivo', 'firma_rara');
    end;
    if jsonb_typeof(v_firma) <> 'object' or jsonb_typeof(v_firma->'h') is distinct from 'number'
       or jsonb_typeof(v_firma->'p') is distinct from 'array' or jsonb_array_length(v_firma->'p') not between 1 and 300 then
      return json_build_object('ok', false, 'motivo', 'firma_rara');
    end if;
    v_firma := jsonb_build_object('h', v_firma->'h', 'p', v_firma->'p');
  end if;

  update sst_votacion_elector set votado_en = now(), firma = v_firma, intentos = 0
   where votacion = r.votacion and k = r.k;
  insert into sst_votacion_cedula (votacion, marcas, blanco) values (r.votacion, v_marcas, coalesce(p_blanco, false));
  return json_build_object('ok', true);
end $$;


-- ── 5 · quien organiza la sigue, la cierra y ve el resultado ───────
-- cómo va: cuántos votaron y quiénes (sin un solo voto)
create or replace function sst_votacion_estado(p_id uuid)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v record; v_q json; v_b json; v_n integer;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  select * into v from sst_votacion where id = p_id;
  if not found or not _sst_vot_puede(v.empresa) then return json_build_object('ok', false, 'motivo', 'no_esta'); end if;
  select coalesce(json_agg(json_build_object('k', e.k, 'en', e.votado_en) order by e.votado_en), '[]'::json)
    into v_q from sst_votacion_elector e where e.votacion = p_id and e.votado_en is not null;
  select coalesce(json_agg(e.k order by e.k), '[]'::json)
    into v_b from sst_votacion_elector e where e.votacion = p_id and e.votado_en is null and e.intentos >= 5;
  select count(*) into v_n from sst_votacion_elector e where e.votacion = p_id;
  return json_build_object('ok', true, 'estado', _sst_vot_estado(v.estado, v.cierra), 'cierra', v.cierra,
                           'electores', v_n, 'votaron', json_array_length(v_q), 'quienes', v_q, 'bloqueados', v_b);
end $$;

-- el resultado: el padrón (con la hora y la firma de cada uno), las cédulas
-- numeradas al azar y el código de integridad. Solo cerrada; si ya venció
-- la hora, la cierra en ese momento.
create or replace function sst_votacion_resultado(p_id uuid)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v record; v_el json; v_ce json;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  select * into v from sst_votacion where id = p_id for update;
  if not found or not _sst_vot_puede(v.empresa) then return json_build_object('ok', false, 'motivo', 'no_esta'); end if;
  if v.estado = 'abierta' and v.cierra <= now() then
    perform _sst_vot_cerrar(p_id, null);
    select * into v from sst_votacion where id = p_id;
  end if;
  if v.estado <> 'cerrada' then return json_build_object('ok', false, 'motivo', v.estado); end if;
  select coalesce(json_agg(json_build_object('k', e.k, 'nombre', e.nombre, 'en', e.votado_en, 'firma', e.firma) order by e.nombre, e.k), '[]'::json)
    into v_el from sst_votacion_elector e where e.votacion = p_id;
  select coalesce(json_agg(json_build_object('n', c.n, 'm', c.marcas, 'b', c.blanco) order by c.n), '[]'::json)
    into v_ce from sst_votacion_cedula c where c.votacion = p_id;
  return json_build_object('ok', true, 'id', v.id, 'creada', v.creada, 'cierra', v.cierra, 'cerrada_en', v.cerrada_en,
                           'sola', v.cerrada_por is null, 'info', v.info, 'sello', v.sello, 'electores', v_el, 'cedulas', v_ce);
end $$;

create or replace function sst_votacion_cerrar(p_id uuid)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v record;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  select * into v from sst_votacion where id = p_id for update;
  if not found or not _sst_vot_puede(v.empresa) then return json_build_object('ok', false, 'motivo', 'no_esta'); end if;
  if v.estado = 'anulada' then return json_build_object('ok', false, 'motivo', 'anulada'); end if;
  if v.estado = 'abierta' then perform _sst_vot_cerrar(p_id, auth.uid()); end if;
  return sst_votacion_resultado(p_id);
end $$;

-- un código nuevo para quien todavía no votó (perdió su cédula, o se le
-- bloqueó por poner mal su documento). El de antes deja de servir.
create or replace function sst_votacion_codigo(p_id uuid, p_k text, p_cod_h text)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v record; v_n integer;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  select * into v from sst_votacion where id = p_id;
  if not found or not _sst_vot_puede(v.empresa) then return json_build_object('ok', false, 'motivo', 'no_esta'); end if;
  if v.estado <> 'abierta' or v.cierra <= now() then return json_build_object('ok', false, 'motivo', 'no_abierta'); end if;
  if lower(coalesce(p_cod_h, '')) !~ '^[0-9a-f]{64}$' then return json_build_object('ok', false, 'motivo', 'codigo_raro'); end if;
  begin
    update sst_votacion_elector set cod_h = lower(p_cod_h), intentos = 0
     where votacion = p_id and k = p_k and votado_en is null;
    get diagnostics v_n = row_count;
  exception when unique_violation then return json_build_object('ok', false, 'motivo', 'repetido');
  end;
  if v_n = 0 then return json_build_object('ok', false, 'motivo', 'ya_voto_o_no_esta'); end if;
  return json_build_object('ok', true);
end $$;

-- anular (antes de cerrar): no se cuenta; las cédulas que hubo quedan,
-- sin contar, y la elección vuelve a abrir otra
create or replace function sst_votacion_anular(p_id uuid)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v record;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  select * into v from sst_votacion where id = p_id for update;
  if not found or not _sst_vot_puede(v.empresa) then return json_build_object('ok', false, 'motivo', 'no_esta'); end if;
  if v.estado <> 'abierta' then return json_build_object('ok', false, 'motivo', v.estado); end if;
  update sst_votacion set estado = 'anulada', cerrada_en = now(), cerrada_por = auth.uid() where id = p_id;
  return json_build_object('ok', true);
end $$;


-- ── 6 · permisos ────────────────────────────────────────────────────
--   Postgres le da EXECUTE a PUBLIC al crear una función: se cierra
--   primero y se abre solo a quien corresponde.
revoke execute on function _sst_vot_limpio(text) from public;
revoke execute on function _sst_vot_huella(text, text) from public;
revoke execute on function _sst_vot_puede(uuid) from public;
revoke execute on function _sst_vot_tope(text, timestamptz) from public;
revoke execute on function _sst_vot_frenado() from public;
revoke execute on function _sst_vot_fallo() from public;
revoke execute on function _sst_vot_estado(text, timestamptz) from public;
revoke execute on function _sst_vot_cerrar(uuid, uuid) from public;
revoke execute on function sst_votacion_abrir(uuid, jsonb, jsonb, timestamptz) from public;
revoke execute on function sst_votacion_cedula(text) from public;
revoke execute on function sst_votar(text, text, jsonb, boolean, text) from public;
revoke execute on function sst_votacion_estado(uuid) from public;
revoke execute on function sst_votacion_resultado(uuid) from public;
revoke execute on function sst_votacion_cerrar(uuid) from public;
revoke execute on function sst_votacion_codigo(uuid, text, text) from public;
revoke execute on function sst_votacion_anular(uuid) from public;
--   Y en Supabase nacen además con EXECUTE para anon y authenticated (sus
--   privilegios por defecto en «public»): sacarlo de PUBLIC no alcanza.
--   Lo de adentro no lo llama nadie de afuera; lo de quien organiza, sin
--   cuenta no se llama.
revoke execute on function _sst_vot_limpio(text), _sst_vot_huella(text, text), _sst_vot_puede(uuid),
  _sst_vot_tope(text, timestamptz), _sst_vot_frenado(), _sst_vot_fallo(), _sst_vot_estado(text, timestamptz),
  _sst_vot_cerrar(uuid, uuid) from anon, authenticated;
revoke execute on function sst_votacion_abrir(uuid, jsonb, jsonb, timestamptz), sst_votacion_estado(uuid),
  sst_votacion_resultado(uuid), sst_votacion_cerrar(uuid), sst_votacion_codigo(uuid, text, text),
  sst_votacion_anular(uuid) from anon;

-- el elector, sin cuenta (y también con la suya, si la tiene abierta)
grant execute on function sst_votacion_cedula(text) to anon, authenticated;
grant execute on function sst_votar(text, text, jsonb, boolean, text) to anon, authenticated;
-- quien organiza, con su cuenta
grant execute on function sst_votacion_abrir(uuid, jsonb, jsonb, timestamptz) to authenticated;
grant execute on function sst_votacion_estado(uuid) to authenticated;
grant execute on function sst_votacion_resultado(uuid) to authenticated;
grant execute on function sst_votacion_cerrar(uuid) to authenticated;
grant execute on function sst_votacion_codigo(uuid, text, text) to authenticated;
grant execute on function sst_votacion_anular(uuid) to authenticated;

-- que la API (PostgREST) vea las funciones nuevas enseguida
notify pgrst, 'reload schema';
