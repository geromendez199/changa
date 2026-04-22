-- ============================================================
-- WHY: Harden backend-side business rules and atomic workflows for chats and applications.
-- CHANGED: YYYY-MM-DD
-- ============================================================

create or replace function create_or_get_conversation(
  p_participant_1_id uuid,
  p_participant_2_id uuid,
  p_job_id uuid
) returns conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant_1 uuid;
  v_participant_2 uuid;
  v_conversation conversations;
begin
  if auth.uid() is null then
    raise exception 'Necesitás iniciar sesión para abrir un chat.';
  end if;

  if auth.uid() not in (p_participant_1_id, p_participant_2_id) then
    raise exception 'Solo las personas participantes pueden abrir esta conversación.';
  end if;

  if p_participant_1_id = p_participant_2_id then
    raise exception 'No podés abrir un chat con tu propia cuenta.';
  end if;

  v_participant_1 := least(p_participant_1_id, p_participant_2_id);
  v_participant_2 := greatest(p_participant_1_id, p_participant_2_id);

  select *
  into v_conversation
  from conversations
  where job_id = p_job_id
    and participant_1_id = v_participant_1
    and participant_2_id = v_participant_2
  limit 1;

  if found then
    return v_conversation;
  end if;

  begin
    insert into conversations (participant_1_id, participant_2_id, job_id)
    values (v_participant_1, v_participant_2, p_job_id)
    returning * into v_conversation;
  exception
    when unique_violation then
      select *
      into v_conversation
      from conversations
      where job_id = p_job_id
        and participant_1_id = v_participant_1
        and participant_2_id = v_participant_2
      limit 1;
  end;

  if v_conversation.id is null then
    raise exception 'No pudimos abrir el chat de esta changa.';
  end if;

  return v_conversation;
end;
$$;

create or replace function create_application_for_job(
  p_job_id uuid,
  p_applicant_user_id uuid,
  p_cover_message text,
  p_proposed_amount int
) returns applications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job jobs;
  v_application applications;
begin
  if auth.uid() is null then
    raise exception 'Necesitás iniciar sesión para postularte.';
  end if;

  if auth.uid() <> p_applicant_user_id then
    raise exception 'Sólo podés usar tu propia sesión para postularte.';
  end if;

  select *
  into v_job
  from jobs
  where id = p_job_id
  limit 1;

  if v_job.id is null then
    raise exception 'No encontramos la changa para completar esta acción.';
  end if;

  if v_job.posted_by_user_id = p_applicant_user_id then
    raise exception 'No podés postularte a tu propia changa.';
  end if;

  if v_job.status <> 'publicado' then
    raise exception 'Esta changa ya no acepta postulaciones.';
  end if;

  begin
    insert into applications (job_id, applicant_user_id, cover_message, proposed_amount, status)
    values (p_job_id, p_applicant_user_id, trim(p_cover_message), p_proposed_amount, 'enviada')
    returning * into v_application;
  exception
    when unique_violation then
      raise exception 'Ya te postulaste a esta changa.';
  end;

  insert into notifications (user_id, title, description, type)
  values (
    v_job.posted_by_user_id,
    'Nueva postulación',
    'Recibiste una nueva postulación en tu changa.',
    'trabajo'
  );

  return v_application;
end;
$$;

create or replace function set_application_status(
  p_application_id uuid,
  p_job_id uuid,
  p_owner_user_id uuid,
  p_applicant_user_id uuid,
  p_status application_status
) returns applications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application applications;
begin
  if auth.uid() is null then
    raise exception 'Necesitás iniciar sesión para gestionar postulaciones.';
  end if;

  if auth.uid() <> p_owner_user_id then
    raise exception 'Sólo la persona dueña de la changa puede gestionar esta postulación.';
  end if;

  if not exists (
    select 1
    from jobs
    where id = p_job_id
      and posted_by_user_id = p_owner_user_id
  ) then
    raise exception 'Sólo la persona dueña de la changa puede gestionar esta postulación.';
  end if;

  update applications
  set status = p_status
  where id = p_application_id
    and job_id = p_job_id
    and applicant_user_id = p_applicant_user_id
  returning * into v_application;

  if v_application.id is null then
    raise exception 'No encontramos la postulación para actualizar.';
  end if;

  insert into notifications (user_id, title, description, type)
  values (
    p_applicant_user_id,
    case when p_status = 'aceptada' then 'Postulación aceptada' else 'Postulación actualizada' end,
    case when p_status = 'aceptada'
      then 'Aceptaron tu postulación para una changa.'
      else 'Actualizamos el estado de una de tus postulaciones.'
    end,
    'trabajo'
  );

  return v_application;
end;
$$;

create or replace function send_message(
  p_conversation_id uuid,
  p_sender_user_id uuid,
  p_content text
) returns messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message messages;
  v_conversation conversations;
  v_recipient_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Necesitás iniciar sesión para enviar mensajes.';
  end if;

  if auth.uid() <> p_sender_user_id then
    raise exception 'Sólo podés usar tu propia sesión para enviar mensajes.';
  end if;

  select *
  into v_conversation
  from conversations
  where id = p_conversation_id
  limit 1;

  if v_conversation.id is null then
    raise exception 'No encontramos la conversación para enviar este mensaje.';
  end if;

  if auth.uid() not in (v_conversation.participant_1_id, v_conversation.participant_2_id) then
    raise exception 'Solo las personas participantes pueden enviar mensajes en esta conversación.';
  end if;

  insert into messages (conversation_id, sender_user_id, content)
  values (p_conversation_id, p_sender_user_id, trim(p_content))
  returning * into v_message;

  update conversations
  set last_message_at = v_message.created_at
  where id = p_conversation_id;

  v_recipient_user_id := case
    when v_conversation.participant_1_id = p_sender_user_id then v_conversation.participant_2_id
    else v_conversation.participant_1_id
  end;

  if v_recipient_user_id is not null then
    insert into notifications (user_id, title, description, type)
    values (
      v_recipient_user_id,
      'Nuevo mensaje',
      'Tenés un mensaje nuevo en una conversación de changa.',
      'mensaje'
    );
  end if;

  return v_message;
end;
$$;
