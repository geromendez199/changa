-- ============================================================
-- WHY: Rebuild job_category so Supabase matches every category used by the app.
-- CHANGED: YYYY-MM-DD
-- ============================================================

begin;

alter table jobs
alter column category type text
using category::text;

drop type if exists job_category_new;

create type job_category_new as enum (
  'Hogar',
  'Oficios',
  'Delivery',
  'Eventos',
  'Tecnología',
  'Construcción y Mantenimiento',
  'Mecánica y Transporte',
  'Servicios Personales y Estética',
  'Alimentación y Tradición',
  'Oficios Modernos y Digitales',
  'Control de Plagas',
  'Personal Trainer',
  'Otros'
);

alter table jobs
alter column category type job_category_new
using (
  case category
    when 'Hogar' then 'Hogar'
    when 'Oficios' then 'Oficios'
    when 'Delivery' then 'Delivery'
    when 'Eventos' then 'Eventos'
    when 'Tecnología' then 'Tecnología'
    when 'Tecnologia' then 'Tecnología'
    when 'Construcción y Mantenimiento' then 'Construcción y Mantenimiento'
    when 'Construccion y Mantenimiento' then 'Construcción y Mantenimiento'
    when 'Mecánica y Transporte' then 'Mecánica y Transporte'
    when 'Mecanica y Transporte' then 'Mecánica y Transporte'
    when 'Servicios Personales y Estética' then 'Servicios Personales y Estética'
    when 'Servicios Personales y Estetica' then 'Servicios Personales y Estética'
    when 'Alimentación y Tradición' then 'Alimentación y Tradición'
    when 'Alimentacion y Tradicion' then 'Alimentación y Tradición'
    when 'Oficios Modernos y Digitales' then 'Oficios Modernos y Digitales'
    when 'Control de Plagas' then 'Control de Plagas'
    when 'Personal Trainer' then 'Personal Trainer'
    when 'Otros' then 'Otros'
    else 'Otros'
  end::job_category_new
);

drop type if exists job_category;

alter type job_category_new rename to job_category;

commit;
