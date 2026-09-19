-- ═══════════════════════════════════════════════════════════════════
--  OBRASST · identidad del trabajador — parte 2: la bandeja
--  19/09/2026
--  Aditivo. Se puede correr dos veces.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1 · lo que ve el supervisor ────────────────────────────────────
create or replace function sst_trab_pendientes(p_emp uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  if not sst_es_miembro(p_emp) then
    return json_build_object('ok', false, 'motivo', 'no_eres_miembro');
  end if;
  select coalesce(json_agg(x order by x.creado), '[]'::json) into v
  from (
    select p.id, p.td, p.doc, p.nombre, p.correo, p.foto_url, p.creado, p.trabajador,
           /* alguien parecido que ya esté en el registro: mismo apellido
              o el mismo número cargado con otro tipo de documento */
           (select coalesce(json_agg(json_build_object('id', t.id, 'nombre', t.nombre, 'dni', t.dni)), '[]'::json)
              from sst_trabajador t
             where t.duenio = p_emp::text
               and t.id <> p.trabajador
               and t.usuario is null
               and ( upper(btrim(coalesce(t.dni,''))) = upper(btrim(p.doc))
                  or upper(split_part(btrim(coalesce(t.nombre,'')), ' ', 1))
                     = upper(split_part(btrim(coalesce(p.nombre,'')), ' ', 1)) )
             limit 5) as parecidos
      from sst_trab_pendiente p
     where p.empresa = p_emp and p.estado = 'espera'
  ) x;
  return json_build_object('ok', true, 'lista', v);
end $$;

-- ── 2 · lo que decide ──────────────────────────────────────────────
--   'confirmar' = la ficha que se creó sola queda verificada
--   'fundir'    = se enlaza con una ficha que el supervisor ya tenía
--   'rechazar'  = no es de esta obra
create or replace function sst_trab_resolver(p_id uuid, p_accion text, p_ficha uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_emp uuid; v_trab uuid; v_usr uuid; v_doc text;
begin
  select empresa, trabajador, doc into v_emp, v_trab, v_doc
    from sst_trab_pendiente where id = p_id and estado = 'espera';
  if v_emp is null then return json_build_object('ok', false, 'motivo', 'no_esta'); end if;
  if not sst_es_miembro(v_emp) then
    return json_build_object('ok', false, 'motivo', 'no_eres_miembro'); end if;

  select usuario into v_usr from sst_trabajador where id = v_trab;

  if p_accion = 'confirmar' then
    update sst_trabajador set verificado = true where id = v_trab;
    update sst_trab_pendiente
       set estado='creado', resuelto=now(), quien=auth.uid() where id = p_id;

  elsif p_accion = 'fundir' then
    if p_ficha is null then return json_build_object('ok', false, 'motivo', 'falta_ficha'); end if;
    /* la ficha buena se queda con la cuenta y el documento; la que se
       creó sola se va, porque si se queda el kardex tiene al mismo
       hombre dos veces y ninguna de las dos completa. */
    update sst_trabajador
       set usuario = v_usr, verificado = true,
           dni = coalesce(nullif(btrim(coalesce(dni,'')), ''), v_doc)
     where id = p_ficha and duenio = v_emp::text;
    update sst_trabajador set usuario = null, estatus = 'cesado' where id = v_trab;
    update sst_alias set usuario = v_usr where lower(alias) = lower(v_doc);
    update sst_trab_pendiente
       set estado='enlazado', trabajador=p_ficha, resuelto=now(), quien=auth.uid() where id = p_id;

  elsif p_accion = 'rechazar' then
    update sst_trabajador set usuario = null, estatus = 'cesado' where id = v_trab;
    delete from sst_alias where lower(alias) = lower(v_doc);
    update sst_trab_pendiente
       set estado='rechazado', resuelto=now(), quien=auth.uid() where id = p_id;
  else
    return json_build_object('ok', false, 'motivo', 'accion_rara');
  end if;

  return json_build_object('ok', true);
end $$;

-- ── 3 · reiniciar el PIN de alguien ────────────────────────────────
--   Sin correo no hay recuperación automática: el supervisor es la
--   única salida. Por eso queda registrado quién lo hizo y cuándo.
create table if not exists sst_pin_reinicio (
  id      uuid primary key default gen_random_uuid(),
  empresa uuid not null,
  trabajador uuid not null,
  quien   uuid,
  cuando  timestamptz not null default now()
);
alter table sst_pin_reinicio enable row level security;
drop policy if exists sst_pin_mira_miembro on sst_pin_reinicio;
create policy sst_pin_mira_miembro on sst_pin_reinicio
  for select to authenticated using (sst_es_miembro(empresa));

-- ── 4 · comprobación ───────────────────────────────────────────────
select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('sst_trab_pendientes','sst_trab_resolver')
order by 1;
