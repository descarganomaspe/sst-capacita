-- ═══════════════════════════════════════════════════════════════════
--  OBRASST · dos arreglos del flujo trabajador ↔ supervisor
--  18/09/2026
--
--  Ninguna de las dos toca datos. Las dos parten de la definición que
--  YA tiene el servidor (pg_get_functiondef), le hacen un cambio
--  puntual y verificado, y la vuelven a crear. Si el cambio no calza
--  exacto, la sentencia se cae con un error y NO deja nada a medias.
--  Se puede correr dos veces: la segunda no hace nada.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1 ·  el trabajador tiene que poder ver a su comité y a su brigada
--         sst_docs_obra ya entrega 'comite' y 'brigadistas' como
--         documentos. Falta la hoja 'quienes', que es el padrón que
--         publica el supervisor desde la app (sin DNI) para que le
--         salga a su gente en «¿A quién acudo?».
do $do$
declare v_def text; v_new text;
begin
  select pg_get_functiondef(oid) into v_def
  from pg_proc
  where proname = 'sst_docs_obra' and pronamespace = 'public'::regnamespace;

  if v_def is null then
    raise exception 'no existe public.sst_docs_obra';
  end if;

  if position('''quienes''' in v_def) > 0 then
    raise notice 'sst_docs_obra: «quienes» ya estaba, no toco nada';
    return;
  end if;

  v_new := replace(v_def, '''ats-modelo''', '''ats-modelo'',''quienes''');
  if v_new = v_def then
    raise exception 'no encontré ''ats-modelo'' dentro de sst_docs_obra: no cambio nada';
  end if;

  execute v_new;
  raise notice 'sst_docs_obra: «quienes» agregado a la lista blanca';
end
$do$;


-- ── 2 ·  la actividad del reporte se perdía
--         El trabajador elige «Trabajo en altura» en un desplegable y
--         ese dato no salía de su celular: la RPC —el único camino del
--         que no tiene cuenta— no lo mandaba. La columna actividad de
--         sst_reporte ya existe; lo que faltaba era la puerta.
--
--         Esto NO modifica la función de 8 argumentos: crea una de 9,
--         con el mismo cuerpo más la actividad. Si algo saliera mal, el
--         camino viejo sigue intacto y la app lo reusa sola.
do $do$
declare v_def text; v_new text;
begin
  if exists (
    select 1 from pg_proc
    where proname = 'sst_reporte_nuevo'
      and pronamespace = 'public'::regnamespace
      and pg_get_function_identity_arguments(oid) like '%p_actividad%'
  ) then
    raise notice 'sst_reporte_nuevo: la versión con p_actividad ya existe';
    return;
  end if;

  select pg_get_functiondef(oid) into v_def
  from pg_proc
  where proname = 'sst_reporte_nuevo'
    and pronamespace = 'public'::regnamespace
    and pg_get_function_identity_arguments(oid) =
        'p_cod text, p_clase text, p_descripcion text, p_lugar text, '
        'p_foto_url text, p_anonimo boolean, p_autor text, p_fecha text';

  if v_def is null then
    raise exception 'no encontré la sst_reporte_nuevo de 8 argumentos tal como la esperaba';
  end if;

  -- 2.a · un argumento más al final de la firma
  if (length(v_def) - length(replace(v_def, 'p_fecha text)', ''))) / length('p_fecha text)') <> 1 then
    raise exception 'esperaba «p_fecha text)» una sola vez y no es así: no toco nada';
  end if;
  v_new := replace(v_def, 'p_fecha text)', 'p_fecha text, p_actividad text)');

  -- 2.b · la columna y el valor. Ojo: «lugar,» también está dentro de
  --       «p_lugar,», así que primero se aparta el argumento, después se
  --       toca la columna, y al final se devuelve el argumento con la
  --       actividad al lado. Cada paso tiene que calzar UNA vez exacta.
  if (length(v_new) - length(replace(v_new, 'p_lugar,', ''))) / length('p_lugar,') <> 1 then
    raise exception 'esperaba «p_lugar,» una sola vez en el cuerpo y no es así: no toco nada';
  end if;
  v_new := replace(v_new, 'p_lugar,', '@@ARG@@,');

  if (length(v_new) - length(replace(v_new, 'lugar,', ''))) / length('lugar,') <> 1 then
    raise exception 'esperaba la columna «lugar,» una sola vez en el cuerpo y no es así: no toco nada';
  end if;
  v_new := replace(v_new, 'lugar,', 'lugar, actividad,');

  v_new := replace(v_new, '@@ARG@@,', 'p_lugar, p_actividad,');
  if position('@@ARG@@' in v_new) > 0 then
    raise exception 'quedó un marcador suelto: no ejecuto nada';
  end if;

  execute v_new;
  raise notice 'sst_reporte_nuevo: creada la versión de 9 argumentos, con la actividad';
end
$do$;


-- ── NOTA DE LO QUE PASÓ AL CORRERLO (18/09/2026) ─────────────────
--  La primera versión de esto ponía «p_actividad text DEFAULT NULL».
--  Con el DEFAULT, PostgREST no sabe a cuál de las dos funciones va
--  una llamada de 8 claves y contesta 300 (PGRST203): durante unos
--  minutos, los reportes de los trabajadores rebotaron y se fueron a
--  la cola del celular. No se perdió ninguno, pero tampoco llegaron
--  hasta que se quitó el DEFAULT. Sin él, 8 claves van a la de 8 y 9
--  a la de 9, sin ambigüedad. Si alguna vez hay que rehacer esto:
--  NUNCA con DEFAULT.
--
-- ── 3 ·  comprobación (no cambia nada, solo enseña cómo quedó)
select p.proname,
       pg_get_function_identity_arguments(p.oid) as argumentos,
       position('''quienes''' in p.prosrc) > 0   as entrega_quienes,
       position('actividad'   in p.prosrc) > 0   as guarda_actividad
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('sst_docs_obra','sst_reporte_nuevo')
order by p.proname, argumentos;
