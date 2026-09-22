-- ═══════════════════════════════════════════════════════════════════
--  OBRASST · canal de denuncia anónimo
--  21/09/2026 · aditivo · se puede correr dos veces
--
--  Lo pidió Marcelo: «un canal de denuncia completamente anónimo, que
--  llegue directo al supervisor… su flujo comienza con el trabajador y
--  le llega al supervisor de seguridad. Únicamente lo podrá ver el
--  supervisor y el líder».
--
--  QUÉ QUIERE DECIR «ANÓNIMO» ACÁ, CON LA MANO EN LA BASE:
--   · La fila no guarda quién la mandó: ni cuenta, ni DNI, ni nombre,
--     ni celular, ni IP. No existe la columna: no hay forma de que un
--     cambio futuro la «llene por si acaso».
--   · Tampoco la hora: solo el día. Y las de cada día se dejan ver
--     JUNTAS a la mañana siguiente, a las 7 (hora de Lima). Con la hora
--     —aunque fuera redondeada—, el supervisor que sabe quién tenía la
--     app abierta a esa hora ya sabe quién fue. Lo urgente no va por
--     acá: la pantalla del trabajador lo manda a «Reportar».
--   · El tope contra el que la llena de basura es por OBRA y general,
--     no por persona ni por IP. Cuidar el canal no puede pasar por
--     anotar a quien lo usa. Los contadores se borran al vencer.
--   · La app la manda con la llave anónima, sin la sesión del
--     trabajador: ni en el registro de peticiones queda su cuenta. (El
--     registro de Supabase sí ve la IP de cualquier petición: eso no lo
--     controla esta base, y por eso no se promete más de lo que es.)
--   · Para ver la respuesta, el trabajador guarda un número de
--     seguimiento al azar. Acá se guarda solo su huella (sha256).
--
--  QUIÉN LA LEE (corregido tras la revisión del 21/09): el DUEÑO de la
--  obra, el dueño de la empresa raíz (el líder, que ve todas sus obras)
--  y los supervisores del equipo que el dueño o el líder marquen, uno
--  por uno (sst_denuncia_lector). Antes la leía cualquier miembro, y
--  miembro se hace cualquiera que tenga el código de la obra —el mismo
--  que tiene cada trabajador— con sst_unirme: el capataz denunciado
--  podía entrar a leer lo que dijeron de él.
--  Nadie la lee directo de la tabla: RLS encendido y sin políticas; se
--  entra solo por las funciones de abajo. Nadie la borra: se cierra, con
--  una respuesta, y la respuesta ya dada no se reescribe.
-- ═══════════════════════════════════════════════════════════════════

-- ── 0 · lo que damos por sentado ───────────────────────────────────
do $$
begin
  if to_regclass('public.sst_empresa') is null then raise exception 'no existe public.sst_empresa'; end if;
  if to_regprocedure('public.sst_es_miembro(uuid)') is null then raise exception 'falta sst_es_miembro(uuid)'; end if;
  if to_regprocedure('public.sst_es_dueno(uuid)')   is null then raise exception 'falta sst_es_dueno(uuid)'; end if;
  if to_regprocedure('public.sst_raiz(uuid)')        is null then raise exception 'falta sst_raiz(uuid)'; end if;
  if to_regclass('public.sst_miembro') is null then raise exception 'no existe public.sst_miembro'; end if;
  if to_regclass('auth.users') is null then raise exception 'no existe auth.users'; end if;
  perform 1 from auth.users limit 1;   -- y que quien corre esto la pueda leer (si no, revienta acá y no a medias)
  raise notice 'lo que se da por sentado: ok';
end $$;


-- ── 1 · las tablas ──────────────────────────────────────────────────
create table if not exists sst_denuncia (
  id             uuid primary key default gen_random_uuid(),
  empresa        uuid not null,
  dia            date not null,
  visible_desde  timestamptz not null,
  tipo           text not null default 'otro',
  texto          text not null,
  lugar          text,
  foto           text,
  estado         text not null default 'nueva' check (estado in ('nueva','revision','cerrada')),
  respuesta      text,
  atendida_dia   date,
  atendida_por   uuid,          -- el supervisor que la cerró (no el que la mandó)
  seguimiento    text unique
);
alter table sst_denuncia add column if not exists atendida_por uuid;
create index if not exists sst_denuncia_emp on sst_denuncia (empresa, dia desc);
alter table sst_denuncia enable row level security;
-- Sin políticas A PROPÓSITO: ni la llave anónima ni una cuenta la leen
-- directo. Solo las funciones de abajo, que preguntan antes.
revoke all on sst_denuncia from anon, authenticated;

comment on table sst_denuncia is
  'Canal de denuncia anónimo. No guarda quién la envía ni la hora: solo el día; se ve a la mañana siguiente. Se lee por sst_denuncias_ver().';
comment on column sst_denuncia.seguimiento is
  'sha256 del número de seguimiento que se queda el trabajador. El número no se guarda.';
comment on column sst_denuncia.visible_desde is
  'Las 07:00 (Lima) del día siguiente a «dia»: todas las del día aparecen juntas.';

-- los contadores del tope: por obra (hora y día), fotos por obra y
-- hora, y uno general. La clave no nombra a nadie; vence y se borra.
-- (Si quedó la forma del primer borrador —por empresa y hora—, se
-- rehace: son solo contadores.)
do $$
begin
  if to_regclass('public.sst_denuncia_tope') is not null
     and not exists (select 1 from information_schema.columns
                      where table_schema = 'public' and table_name = 'sst_denuncia_tope' and column_name = 'clave') then
    drop table public.sst_denuncia_tope;
    raise notice 'sst_denuncia_tope: se rehízo con la forma nueva';
  end if;
end $$;
create table if not exists sst_denuncia_tope (
  clave    text primary key,
  veces    integer not null default 1,
  vence    timestamptz not null
);
alter table sst_denuncia_tope enable row level security;
revoke all on sst_denuncia_tope from anon, authenticated;

-- los supervisores del equipo que el dueño (o el líder) marcó para leer
create table if not exists sst_denuncia_lector (
  empresa   uuid not null,
  user_id   uuid not null,
  puesto_por uuid,
  desde     date not null default current_date,
  primary key (empresa, user_id)
);
alter table sst_denuncia_lector enable row level security;
revoke all on sst_denuncia_lector from anon, authenticated;


-- ── 2 · el trabajador la manda ─────────────────────────────────────
-- suma uno a un contador y dice cuántos van (se usa solo desde sst_denunciar)
create or replace function _sst_den_tope(p_clave text, p_vence timestamptz)
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare v_n integer;
begin
  insert into sst_denuncia_tope (clave, veces, vence) values (p_clave, 1, p_vence)
  on conflict (clave) do update set veces = sst_denuncia_tope.veces + 1
  returning veces into v_n;
  return v_n;
end $$;

create or replace function sst_denunciar(p_cod text, p_tipo text, p_texto text,
                                          p_lugar text, p_foto text, p_seguimiento text)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v_emp uuid; v_tipo text; v_texto text; v_lugar text; v_foto text; v_seg text;
        v_hoy date; v_hora timestamptz; v_manana7 timestamptz; v_h text;
begin
  select e.id into v_emp from sst_empresa e
   where upper(btrim(e.codigo)) = upper(btrim(coalesce(p_cod, '')));
  if v_emp is null then return json_build_object('ok', false, 'motivo', 'codigo_no_existe'); end if;

  v_texto := btrim(coalesce(p_texto, ''));
  if length(v_texto) < 10   then return json_build_object('ok', false, 'motivo', 'corto'); end if;
  if length(v_texto) > 3000 then v_texto := left(v_texto, 3000); end if;

  v_tipo := lower(btrim(coalesce(p_tipo, '')));
  if v_tipo not in ('sin_seguridad','represalia','hostigamiento','maltrato','alcohol','ocultan','fraude','otro') then
    v_tipo := 'otro';
  end if;

  v_lugar := nullif(left(btrim(coalesce(p_lugar, '')), 120), '');

  -- la foto, solo si es una imagen de verdad y no un archivo cualquiera.
  -- 300 000 caracteres son unos 220 KB: la app la achica antes.
  v_foto := nullif(btrim(coalesce(p_foto, '')), '');
  if v_foto is not null then
    if length(v_foto) > 300000 or v_foto !~ '^data:image/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$' then
      return json_build_object('ok', false, 'motivo', 'foto_rara');
    end if;
  end if;

  -- el número de seguimiento: se guarda su huella, nunca el número
  v_seg := upper(regexp_replace(coalesce(p_seguimiento, ''), '[^A-Za-z0-9]', '', 'g'));
  if length(v_seg) < 12 or length(v_seg) > 32 then
    return json_build_object('ok', false, 'motivo', 'seguimiento_raro');
  end if;
  v_seg := encode(sha256(convert_to(v_seg, 'UTF8')), 'hex');

  -- si ya está (el reintento del que se quedó sin señal esperando la
  -- respuesta), no es un error ni cuenta para el tope: ya llegó
  if exists (select 1 from sst_denuncia d where d.seguimiento = v_seg) then
    return json_build_object('ok', false, 'motivo', 'seguimiento_repetido');
  end if;

  v_hoy     := (now() at time zone 'America/Lima')::date;
  v_hora    := date_trunc('hour', now());
  v_manana7 := ((v_hoy + 1)::timestamp + interval '7 hours') at time zone 'America/Lima';

  -- los topes. Por obra y en general, nunca por persona. Primero los de
  -- la obra, y el general SOLO si esos pasan: si no, uno solo mandando
  -- basura a su obra llenaba el general y callaba el canal de todos.
  -- Las claves se arman en UTC y con to_char: el huso de la sesión (que
  -- se puede pedir desde afuera) no puede partir un contador en dos.
  v_h := to_char(now() at time zone 'UTC', 'YYYYMMDDHH24');
  delete from sst_denuncia_tope where vence < now();
  if _sst_den_tope('h:' || v_emp || ':' || v_h, v_hora + interval '1 hour') > 30 then
    return json_build_object('ok', false, 'motivo', 'muy_seguido');
  end if;
  if _sst_den_tope('d:' || v_emp || ':' || to_char(v_hoy, 'YYYYMMDD'), v_manana7) > 200 then
    return json_build_object('ok', false, 'motivo', 'muy_seguido');
  end if;
  if v_foto is not null then
    if _sst_den_tope('f:' || v_emp || ':' || v_h, v_hora + interval '1 hour') > 10
       or _sst_den_tope('fd:' || v_emp || ':' || to_char(v_hoy, 'YYYYMMDD'), v_manana7) > 40 then
      return json_build_object('ok', false, 'motivo', 'muchas_fotos');
    end if;
  end if;
  if _sst_den_tope('g:' || v_h, v_hora + interval '1 hour') > 3000 then
    return json_build_object('ok', false, 'motivo', 'muy_seguido');
  end if;

  begin
    insert into sst_denuncia (empresa, dia, visible_desde, tipo, texto, lugar, foto, seguimiento)
    values (v_emp, v_hoy, v_manana7, v_tipo, v_texto, v_lugar, v_foto, v_seg);
  exception when unique_violation then
    return json_build_object('ok', false, 'motivo', 'seguimiento_repetido');
  end;
  return json_build_object('ok', true);
end $$;


-- ── 3 · el trabajador mira cómo va, con su número ──────────────────
create or replace function sst_denuncia_seguir(p_seguimiento text)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v_seg text; v record;
begin
  v_seg := upper(regexp_replace(coalesce(p_seguimiento, ''), '[^A-Za-z0-9]', '', 'g'));
  if length(v_seg) < 12 or length(v_seg) > 32 then
    return json_build_object('ok', false, 'motivo', 'no_esta');
  end if;
  select d.estado, d.respuesta, d.tipo, d.dia, d.atendida_dia into v
    from sst_denuncia d
   where d.seguimiento = encode(sha256(convert_to(v_seg, 'UTF8')), 'hex');
  if not found then return json_build_object('ok', false, 'motivo', 'no_esta'); end if;
  return json_build_object('ok', true, 'estado', v.estado, 'respuesta', v.respuesta,
                           'tipo', v.tipo, 'dia', v.dia, 'atendida_dia', v.atendida_dia);
end $$;


-- ── 4 · quién puede leer las de una obra ───────────────────────────
--   El dueño de ESA obra, el dueño de la empresa raíz (el líder), o un
--   miembro activo de la obra que el dueño o el líder marcó para leer.
create or replace function _sst_puede_ver_denuncias(p_emp uuid)
returns boolean language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null or p_emp is null then return false; end if;
  if sst_es_dueno(p_emp) or sst_es_dueno(sst_raiz(p_emp)) then return true; end if;
  return sst_es_miembro(p_emp)
     and exists (select 1 from sst_denuncia_lector l where l.empresa = p_emp and l.user_id = auth.uid());
end $$;

-- quién decide quién más lee: el dueño de la obra o el líder
create or replace function _sst_elige_lectores(p_emp uuid)
returns boolean language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null or p_emp is null then return false; end if;
  return sst_es_dueno(p_emp) or sst_es_dueno(sst_raiz(p_emp));
end $$;


-- ── 5 · el supervisor y el líder las leen ──────────────────────────
--   El líder (dueño de la raíz) recibe las de toda la familia de obras;
--   el dueño y los marcados, las de su obra.
create or replace function sst_denuncias_ver(p_emp uuid)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v_raiz uuid; v_lider boolean; v_lista json; v_nuevas integer;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  if p_emp is null then return json_build_object('ok', false, 'motivo', 'sin_empresa'); end if;
  v_raiz  := sst_raiz(p_emp);
  v_lider := (v_raiz is not null) and sst_es_dueno(v_raiz);
  if not (v_lider or _sst_puede_ver_denuncias(p_emp)) then
    return json_build_object('ok', false, 'motivo', 'no_eres_miembro');
  end if;

  -- lo abierto va primero ANTES de cortar en 300: si alguien llenara el
  -- canal de basura, lo que hay que atender no puede quedar fuera
  with visibles as (
    select d.id, d.empresa, d.dia, d.tipo, d.texto, d.lugar, (d.foto is not null) as con_foto,
           d.estado, d.respuesta, d.atendida_dia, e.nombre as obra
      from sst_denuncia d
      join sst_empresa e on e.id = d.empresa
     where d.visible_desde <= now()
       and ( d.empresa = p_emp
             or (v_lider and sst_raiz(d.empresa) = v_raiz) )
  )
  select coalesce((select json_agg(json_build_object(
           'id', v.id, 'obra', v.obra, 'dia', v.dia, 'tipo', v.tipo, 'texto', v.texto,
           'lugar', v.lugar, 'con_foto', v.con_foto, 'estado', v.estado,
           'respuesta', v.respuesta, 'atendida_dia', v.atendida_dia)
           order by (v.estado = 'cerrada'), v.dia desc, v.id)
           from (select * from visibles order by (estado = 'cerrada'), dia desc, id limit 300) v), '[]'::json),
         (select count(*) from visibles where estado = 'nueva')
    into v_lista, v_nuevas;

  return json_build_object('ok', true, 'lider', v_lider, 'nuevas', coalesce(v_nuevas, 0),
                           'elige', _sst_elige_lectores(p_emp), 'lista', v_lista);
end $$;


-- ── 5b · lo liviano: cuántas sin leer (para el número rojo) y la foto
--   La lista trae el texto pero no las fotos: treinta fotos de 300 KB
--   para pintar un número rojo cada cinco minutos es gastarle los datos.
create or replace function sst_denuncias_nuevas(p_emp uuid)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v_raiz uuid; v_lider boolean; v_n integer;
begin
  if auth.uid() is null or p_emp is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  v_raiz  := sst_raiz(p_emp);
  v_lider := (v_raiz is not null) and sst_es_dueno(v_raiz);
  if not (v_lider or _sst_puede_ver_denuncias(p_emp)) then
    return json_build_object('ok', false, 'motivo', 'no_eres_miembro');
  end if;
  select count(*) into v_n
    from sst_denuncia d
   where d.visible_desde <= now() and d.estado = 'nueva'
     and ( d.empresa = p_emp or (v_lider and sst_raiz(d.empresa) = v_raiz) );
  return json_build_object('ok', true, 'nuevas', coalesce(v_n, 0));
end $$;

create or replace function sst_denuncia_foto(p_id uuid)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v record;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  select d.empresa, d.foto into v from sst_denuncia d where d.id = p_id and d.visible_desde <= now();
  if v.empresa is null then return json_build_object('ok', false, 'motivo', 'no_esta'); end if;
  if not _sst_puede_ver_denuncias(v.empresa) then
    return json_build_object('ok', false, 'motivo', 'no_eres_miembro');
  end if;
  return json_build_object('ok', true, 'foto', v.foto);
end $$;


-- ── 6 · el supervisor la atiende ───────────────────────────────────
--   'revision' al abrirla (el trabajador ve «la están revisando») y
--   'cerrada' con una respuesta que el trabajador lee con su número. Una
--   cerrada ya no cambia: la respuesta que el trabajador leyó es la que
--   queda, y se anota qué supervisor la cerró.
create or replace function sst_denuncia_atender(p_id uuid, p_estado text, p_respuesta text)
returns json language plpgsql security definer set search_path = public, pg_temp as $$
declare v_emp uuid; v_actual text; v_estado text; v_resp text; v_n integer;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  select d.empresa, d.estado into v_emp, v_actual from sst_denuncia d where d.id = p_id and d.visible_desde <= now();
  if v_emp is null then return json_build_object('ok', false, 'motivo', 'no_esta'); end if;
  if not _sst_puede_ver_denuncias(v_emp) then
    return json_build_object('ok', false, 'motivo', 'no_eres_miembro');
  end if;
  v_estado := lower(btrim(coalesce(p_estado, '')));
  if v_estado not in ('revision','cerrada') then
    return json_build_object('ok', false, 'motivo', 'estado_raro');
  end if;
  if v_actual = 'cerrada' then
    -- mirarla otra vez no es un error; volver a cerrarla con otro texto, sí
    if v_estado = 'revision' then return json_build_object('ok', true); end if;
    return json_build_object('ok', false, 'motivo', 'ya_cerrada');
  end if;
  v_resp := nullif(left(btrim(coalesce(p_respuesta, '')), 1500), '');
  if v_estado = 'cerrada' and (v_resp is null or length(v_resp) < 5) then
    return json_build_object('ok', false, 'motivo', 'sin_respuesta');
  end if;

  update sst_denuncia
     set estado       = v_estado,
         respuesta    = case when v_estado = 'cerrada' then v_resp else respuesta end,
         atendida_dia = case when v_estado = 'cerrada' then (now() at time zone 'America/Lima')::date else atendida_dia end,
         atendida_por = case when v_estado = 'cerrada' then auth.uid() else atendida_por end
   where id = p_id and estado <> 'cerrada';
  -- dos supervisores cerrándola a la vez: la respuesta que queda es la
  -- del primero, y al segundo se le dice
  get diagnostics v_n = row_count;
  if v_n = 0 then return json_build_object('ok', false, 'motivo', 'ya_cerrada'); end if;
  return json_build_object('ok', true);
end $$;


-- ── 6b · quién más la lee: el dueño o el líder marcan a su equipo ───
--   Devuelve los miembros activos de la obra que no son dueños (los
--   dueños y el líder la leen siempre), con su correo y si la leen.
create or replace function sst_denuncia_lectores(p_emp uuid)
returns json language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare v_lista json;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  if not _sst_elige_lectores(p_emp) then return json_build_object('ok', false, 'motivo', 'no_eres_dueno'); end if;
  select coalesce(json_agg(json_build_object('correo', u.email, 'lee', (l.user_id is not null))
                           order by u.email), '[]'::json)
    into v_lista
    from sst_miembro m
    join auth.users u on u.id = m.user_id
    left join sst_denuncia_lector l on l.empresa = m.empresa_id and l.user_id = m.user_id
   where m.empresa_id = p_emp and m.estado = 'activo'
     -- los dueños vigentes la leen siempre; el que ya pasó el mando, no
     and not (coalesce(m.rol, '') = 'dueno' and (m.dueno_hasta is null or m.dueno_hasta > now()))
     and m.user_id <> auth.uid();
  return json_build_object('ok', true, 'lista', v_lista);
end $$;

create or replace function sst_denuncia_lector(p_emp uuid, p_correo text, p_lee boolean)
returns json language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare v_uid uuid;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'motivo', 'sin_cuenta'); end if;
  if not _sst_elige_lectores(p_emp) then return json_build_object('ok', false, 'motivo', 'no_eres_dueno'); end if;
  select u.id into v_uid from auth.users u
   where lower(u.email) = lower(btrim(coalesce(p_correo, ''))) limit 1;
  if not coalesce(p_lee, false) then
    -- desmarcar vale para cualquiera, esté o no en el equipo
    if v_uid is not null then delete from sst_denuncia_lector where empresa = p_emp and user_id = v_uid; end if;
    return json_build_object('ok', true);
  end if;
  if v_uid is null or not exists (select 1 from sst_miembro m
                                   where m.empresa_id = p_emp and m.user_id = v_uid and m.estado = 'activo') then
    return json_build_object('ok', false, 'motivo', 'no_es_del_equipo');
  end if;
  -- uno no se marca a sí mismo: si deja de ser dueño, esa marca le
  -- seguiría abriendo el canal sin que el dueño nuevo la vea
  if v_uid = auth.uid() then return json_build_object('ok', false, 'motivo', 'eres_tu'); end if;
  insert into sst_denuncia_lector (empresa, user_id, puesto_por) values (p_emp, v_uid, auth.uid())
  on conflict (empresa, user_id) do nothing;
  return json_build_object('ok', true);
end $$;

-- N2 de la revisión: la marca se va con la membresía. Si alguien sale del
-- equipo (o lo sacan) y un día vuelve a entrar —con el código, que lo
-- tiene cualquiera—, vuelve sin marca: el dueño tiene que marcarlo otra vez.
create or replace function _sst_den_lector_limpiar()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'DELETE' then
    delete from sst_denuncia_lector where empresa = old.empresa_id and user_id = old.user_id;
    return old;
  end if;
  if coalesce(new.estado, '') <> 'activo' then
    delete from sst_denuncia_lector where empresa = new.empresa_id and user_id = new.user_id;
  end if;
  return new;
end $$;
drop trigger if exists sst_den_lector_limpiar on sst_miembro;
create trigger sst_den_lector_limpiar after update of estado or delete on sst_miembro
  for each row execute function _sst_den_lector_limpiar();
-- y las marcas de quien ya no está activo, por si quedó alguna
delete from sst_denuncia_lector l
 where not exists (select 1 from sst_miembro m
                    where m.empresa_id = l.empresa and m.user_id = l.user_id and m.estado = 'activo');


-- ── 7 · permisos ────────────────────────────────────────────────────
--   Postgres le da EXECUTE a PUBLIC al crear una función: se cierra
--   primero y se abre solo a quien corresponde.
revoke execute on function sst_denunciar(text,text,text,text,text,text) from public;
revoke execute on function sst_denuncia_seguir(text)                    from public;
revoke execute on function _sst_den_tope(text,timestamptz)             from public, anon, authenticated;
revoke execute on function _sst_puede_ver_denuncias(uuid)              from public, anon, authenticated;
revoke execute on function _sst_elige_lectores(uuid)                   from public, anon, authenticated;
revoke execute on function _sst_den_lector_limpiar()                   from public, anon, authenticated;
revoke execute on function sst_denuncias_ver(uuid)                      from public, anon;
revoke execute on function sst_denuncia_atender(uuid,text,text)        from public, anon;
revoke execute on function sst_denuncias_nuevas(uuid)                   from public, anon;
revoke execute on function sst_denuncia_foto(uuid)                      from public, anon;
revoke execute on function sst_denuncia_lectores(uuid)                  from public, anon;
revoke execute on function sst_denuncia_lector(uuid,text,boolean)      from public, anon;
grant  execute on function sst_denunciar(text,text,text,text,text,text) to anon, authenticated;
grant  execute on function sst_denuncia_seguir(text)                    to anon, authenticated;
grant  execute on function sst_denuncias_ver(uuid)                      to authenticated;
grant  execute on function sst_denuncia_atender(uuid,text,text)        to authenticated;
grant  execute on function sst_denuncias_nuevas(uuid)                   to authenticated;
grant  execute on function sst_denuncia_foto(uuid)                      to authenticated;
grant  execute on function sst_denuncia_lectores(uuid)                  to authenticated;
grant  execute on function sst_denuncia_lector(uuid,text,boolean)      to authenticated;


-- ── 8 · comprobación ───────────────────────────────────────────────
select p.proname, pg_get_function_identity_arguments(p.oid) as args,
       has_function_privilege('anon', p.oid, 'execute') as anon_puede
  from pg_proc p
 where p.pronamespace = 'public'::regnamespace
   and p.proname in ('sst_denunciar','sst_denuncia_seguir','sst_denuncias_ver','sst_denuncias_nuevas',
                     'sst_denuncia_foto','sst_denuncia_atender','sst_denuncia_lectores','sst_denuncia_lector',
                     '_sst_puede_ver_denuncias','_sst_elige_lectores','_sst_den_tope','_sst_den_lector_limpiar')
 order by 1;
