-- ═══════════════════════════════════════════════════════════════════
--  OBRASST · identidad del trabajador — parte 1: el servidor
--  19/09/2026
--
--  Todo es ADITIVO: columnas nuevas, tablas nuevas y funciones nuevas.
--  No se toca ni una función ni una política que ya existan, así que
--  la app que está publicada hoy sigue funcionando igual mientras esto
--  se aplica. Se puede correr dos veces sin efecto.
-- ═══════════════════════════════════════════════════════════════════

-- ── 0 · limpiar el usuario de prueba con el que verifiqué que el
--        correo sintético es aceptado por Supabase Auth
delete from auth.users where email = 'd00000000@obrasst.invalid';


-- ── 1 · la ficha del trabajador se puede ligar a una cuenta ────────
alter table sst_trabajador
  add column if not exists usuario    uuid,
  add column if not exists td         text,
  add column if not exists correo     text,
  add column if not exists foto_url   text,
  add column if not exists proyecto   text,
  -- «verificado» = alguien de la empresa respondió por esta ficha.
  -- Las que ya existen las cargó el supervisor, así que nacen en true;
  -- la que se crea sola el trabajador se marca false a mano.
  add column if not exists verificado boolean not null default true;

-- OJO: «duenio» es TEXT, no uuid. Lleva el id de la empresa cuando hay
-- empresa, y un id propio cuando el supervisor trabaja por su cuenta.
-- Comparar contra un uuid sin castear revienta con «operator does not
-- exist: text = uuid», y lo hace DENTRO de la funcion, o sea en la cara
-- del trabajador que esta entrando. Lo cazo el banco de pruebas.
create index if not exists sst_trab_doc_idx on sst_trabajador (duenio, dni);
create unique index if not exists sst_trab_usuario_idx
  on sst_trabajador (usuario) where usuario is not null;


-- ── 2 · los alias: una identidad, varias formas de nombrarla ───────
create table if not exists sst_alias (
  alias   text primary key,
  tipo    text not null check (tipo in ('doc','cel','correo')),
  correo  text not null,
  usuario uuid,
  creado  timestamptz not null default now()
);
alter table sst_alias enable row level security;
-- sin políticas a propósito: nadie la lee directo, ni con llave anónima
-- ni con cuenta. Se entra solo por sst_alias_correo().


-- ── 3 · el tope de intentos ────────────────────────────────────────
--   El código de obra circula por WhatsApp y está pegado en la puerta.
--   Sin esto, cualquiera lo usa para convertir DNIs en nombres.
create table if not exists sst_golpe (
  clave   text not null,
  minuto  timestamptz not null,
  veces   integer not null default 1,
  primary key (clave, minuto)
);
alter table sst_golpe enable row level security;

create or replace function _sst_de_donde()
returns text language plpgsql stable as $$
declare v text;
begin
  begin
    v := split_part(coalesce(
           current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1);
  exception when others then v := '';
  end;
  return coalesce(nullif(btrim(v), ''), 'sin-ip');
end $$;

--  Devuelve true si SE PASÓ del tope. Ventana de una hora, por minuto.
create or replace function _sst_muy_seguido(p_que text, p_tope integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_clave text; v_suma integer;
begin
  v_clave := p_que || '|' || _sst_de_donde();
  delete from sst_golpe where minuto < now() - interval '2 hours';
  insert into sst_golpe (clave, minuto, veces)
       values (v_clave, date_trunc('minute', now()), 1)
  on conflict (clave, minuto) do update set veces = sst_golpe.veces + 1;
  select coalesce(sum(veces), 0) into v_suma
    from sst_golpe
   where clave = v_clave and minuto > now() - interval '1 hour';
  return v_suma > p_tope;
end $$;


-- ── 4 · el registro de consultas que pide la Ley 29733 ─────────────
create table if not exists sst_consulta (
  id      uuid primary key default gen_random_uuid(),
  empresa uuid,
  doc     text,
  hubo    boolean,
  de      text,
  cuando  timestamptz not null default now()
);
alter table sst_consulta enable row level security;

drop policy if exists sst_consulta_mira_miembro on sst_consulta;
create policy sst_consulta_mira_miembro on sst_consulta
  for select to authenticated using (sst_es_miembro(empresa));


-- ── 5 · buscar la ficha por documento ──────────────────────────────
--   Coincidencia exacta y nada más: nunca parcial, nunca listado.
create or replace function sst_trab_buscar(p_cod text, p_td text, p_doc text)
returns json language plpgsql security definer set search_path = public as $$
declare v_emp uuid; v_doc text; v_t record;
begin
  v_doc := upper(btrim(coalesce(p_doc, '')));
  if length(v_doc) < 6 then return json_build_object('ok', false, 'motivo', 'documento_corto'); end if;

  if _sst_muy_seguido('buscar:' || upper(btrim(coalesce(p_cod, ''))), 20) then
    return json_build_object('ok', false, 'motivo', 'muy_seguido');
  end if;

  select e.id into v_emp from sst_empresa e
   where upper(btrim(e.codigo)) = upper(btrim(coalesce(p_cod, '')));
  if v_emp is null then return json_build_object('ok', false, 'motivo', 'codigo_no_existe'); end if;

  select t.id, t.nombre, t.puesto, t.area, t.proyecto, t.estatus, t.verificado,
         (t.usuario is not null) as ya_tiene_cuenta
    into v_t
    from sst_trabajador t
   where t.duenio = v_emp::text
     and upper(btrim(coalesce(t.dni, ''))) = v_doc
   limit 1;

  insert into sst_consulta (empresa, doc, hubo, de)
       values (v_emp, v_doc, v_t.id is not null, _sst_de_donde());

  if v_t.id is null then
    return json_build_object('ok', true, 'estado', 'no_esta', 'obra', v_emp);
  end if;
  if coalesce(v_t.estatus, 'activo') = 'cesado' then
    return json_build_object('ok', true, 'estado', 'cesado');
  end if;
  return json_build_object('ok', true, 'estado', 'esta', 'obra', v_emp,
    'nombre', v_t.nombre, 'puesto', v_t.puesto, 'area', v_t.area,
    'proyecto', v_t.proyecto, 'verificado', v_t.verificado,
    'ya_tiene_cuenta', v_t.ya_tiene_cuenta);
end $$;


-- ── 6 · el alias → la cuenta ───────────────────────────────────────
--   Lo único que revela es que existe una cuenta con ese alias, igual
--   que cualquier «¿olvidaste tu contraseña?» de cualquier web.
create or replace function sst_alias_correo(p_alias text)
returns json language plpgsql security definer set search_path = public as $$
declare v_correo text;
begin
  if _sst_muy_seguido('alias', 40) then
    return json_build_object('ok', false, 'motivo', 'muy_seguido');
  end if;
  select correo into v_correo from sst_alias
   where alias = lower(btrim(coalesce(p_alias, '')));
  if v_correo is null then return json_build_object('ok', false, 'motivo', 'no_hay'); end if;
  return json_build_object('ok', true, 'correo', v_correo);
end $$;


-- ── 7 · la bandeja de pendientes del supervisor ────────────────────
create table if not exists sst_trab_pendiente (
  id       uuid primary key default gen_random_uuid(),
  empresa  uuid not null,
  trabajador uuid,
  td       text,
  doc      text not null,
  nombre   text,
  puesto   text,
  correo   text,
  foto_url text,
  estado   text not null default 'espera'
           check (estado in ('espera','enlazado','creado','rechazado')),
  creado   timestamptz not null default now(),
  resuelto timestamptz,
  quien    uuid
);
alter table sst_trab_pendiente enable row level security;

drop policy if exists sst_pend_mira_miembro on sst_trab_pendiente;
create policy sst_pend_mira_miembro on sst_trab_pendiente
  for select to authenticated using (sst_es_miembro(empresa));
drop policy if exists sst_pend_toca_miembro on sst_trab_pendiente;
create policy sst_pend_toca_miembro on sst_trab_pendiente
  for update to authenticated using (sst_es_miembro(empresa));


-- ── 8 · el trabajador se enlaza (o se crea) con su propia cuenta ───
--   Se llama YA con su token: auth.uid() es él.
create or replace function sst_trab_enlazar(
  p_cod text, p_td text, p_doc text,
  p_nombre text, p_correo text, p_foto text, p_cel text)
returns json language plpgsql security definer set search_path = public as $$
declare v_emp uuid; v_doc text; v_id uuid; v_dueno uuid;
        v_nombre text; v_verif boolean; v_correo_cuenta text; v_usuario uuid;
begin
  v_usuario := auth.uid();
  if v_usuario is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;

  v_doc := upper(btrim(coalesce(p_doc, '')));
  select e.id into v_emp from sst_empresa e
   where upper(btrim(e.codigo)) = upper(btrim(coalesce(p_cod, '')));
  if v_emp is null then return json_build_object('ok', false, 'motivo', 'codigo_no_existe'); end if;

  select u.email into v_correo_cuenta from auth.users u where u.id = v_usuario;

  select t.id, t.nombre, t.verificado, t.usuario
    into v_id, v_nombre, v_verif, v_dueno
    from sst_trabajador t
   where t.duenio = v_emp::text and upper(btrim(coalesce(t.dni, ''))) = v_doc
   limit 1;

  if v_id is not null and v_dueno is not null and v_dueno <> v_usuario then
    return json_build_object('ok', false, 'motivo', 'ficha_ocupada');
  end if;

  if v_id is null then
    -- no está en el registro: se crea provisional y entra a la bandeja
    insert into sst_trabajador (duenio, ext, nombre, dni, td, puesto, correo,
                                foto_url, estatus, usuario, verificado)
         values (v_emp::text, 'auto-' || v_doc || '-' || substr(v_usuario::text, 1, 8), btrim(coalesce(p_nombre, '')), v_doc,
                 coalesce(p_td, 'DNI'), null, nullif(btrim(coalesce(p_correo, '')), ''),
                 nullif(btrim(coalesce(p_foto, '')), ''), 'activo', v_usuario, false)
      returning id, nombre, verificado into v_id, v_nombre, v_verif;

    insert into sst_trab_pendiente (empresa, trabajador, td, doc, nombre, correo, foto_url)
         values (v_emp, v_id, coalesce(p_td, 'DNI'), v_doc,
                 btrim(coalesce(p_nombre, '')),
                 nullif(btrim(coalesce(p_correo, '')), ''),
                 nullif(btrim(coalesce(p_foto, '')), ''));
  else
    update sst_trabajador
       set usuario  = v_usuario,
           td       = coalesce(td, p_td, 'DNI'),
           correo   = coalesce(nullif(btrim(coalesce(p_correo, '')), ''), correo),
           foto_url = coalesce(nullif(btrim(coalesce(p_foto, '')), ''), foto_url)
     where id = v_id
     returning nombre, verificado into v_nombre, v_verif;
  end if;

  -- los alias: el documento siempre; el correo si lo dio
  insert into sst_alias (alias, tipo, correo, usuario)
       values (lower(v_doc), 'doc', v_correo_cuenta, v_usuario)
  on conflict (alias) do update set correo = excluded.correo, usuario = excluded.usuario;

  if nullif(btrim(coalesce(p_correo, '')), '') is not null then
    insert into sst_alias (alias, tipo, correo, usuario)
         values (lower(btrim(p_correo)), 'correo', v_correo_cuenta, v_usuario)
    on conflict (alias) do nothing;
  end if;

  return json_build_object('ok', true, 'trab', v_id, 'nombre', v_nombre,
                           'verificado', v_verif, 'obra', v_emp);
end $$;


-- ── 9 · el trabajador puede ver y tocar SU ficha, nada más ─────────
drop policy if exists sst_trab_ve_la_suya on sst_trabajador;
create policy sst_trab_ve_la_suya on sst_trabajador
  for select to authenticated using (usuario = auth.uid());


-- ── 10 · comprobación ──────────────────────────────────────────────
select 'columnas' as que,
       (select count(*) from information_schema.columns
         where table_name = 'sst_trabajador'
           and column_name in ('usuario','td','correo','foto_url','proyecto','verificado')) as n
union all
select 'tablas nuevas',
       (select count(*) from information_schema.tables
         where table_name in ('sst_alias','sst_golpe','sst_consulta','sst_trab_pendiente'))
union all
select 'funciones nuevas',
       (select count(*) from pg_proc
         where pronamespace = 'public'::regnamespace
           and proname in ('sst_trab_buscar','sst_alias_correo','sst_trab_enlazar',
                           '_sst_muy_seguido','_sst_de_donde'));
