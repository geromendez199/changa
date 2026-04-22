import { applications as sampleApplications, getSampleApplications } from "../data/mockData";
import { supabase } from "../lib/supabase";
import {
  applicationCreateSchema,
  applicationStatusSchema,
  parseWithValidation,
} from "../lib/validation/schemas";
import { Application } from "../types/domain";
import { ApplicationsRow, mapApplicationRow } from "../types/supabase";
import {
  ensureAuthenticatedUser,
  failureResult,
  isNonEmptyString,
  normalizeError,
  ServiceResult,
  shouldUseFallback,
  successResult,
  toSafeArray,
} from "./service.utils";

export async function getMyApplications(userId: string): Promise<ServiceResult<Application[]>> {
  if (!isNonEmptyString(userId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult(getSampleApplications(userId), "fallback");

  try {
    const { data, error } = await supabase!
      .from("applications")
      .select("*")
      .eq("applicant_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return successResult(
      toSafeArray<Partial<ApplicationsRow>>(data)
        .map(mapApplicationRow)
        .filter((application) => isNonEmptyString(application.id)),
    );
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar tus postulaciones."));
  }
}

export async function getApplicationsForJob(jobId: string): Promise<ServiceResult<Application[]>> {
  if (!isNonEmptyString(jobId)) return successResult([], "fallback");
  if (shouldUseFallback()) {
    return successResult(
      sampleApplications.filter((application) => application.jobId === jobId),
      "fallback",
    );
  }

  try {
    const { data, error } = await supabase!
      .from("applications")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return successResult(
      toSafeArray<Partial<ApplicationsRow>>(data)
        .map(mapApplicationRow)
        .filter((application) => isNonEmptyString(application.id)),
    );
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar las postulaciones de esta changa."));
  }
}

export async function createApplication(input: {
  jobId: string;
  applicantUserId: string;
  coverMessage: string;
  proposedAmount: number;
}): Promise<ServiceResult<Application | null>> {
  try {
    const validatedInput = parseWithValidation(applicationCreateSchema, input);
    if (shouldUseFallback()) return successResult(null, "fallback");
    await ensureAuthenticatedUser(validatedInput.applicantUserId);

    const { data, error } = await supabase!.rpc("create_application_for_job", {
      p_job_id: validatedInput.jobId,
      p_applicant_user_id: validatedInput.applicantUserId,
      p_cover_message: validatedInput.coverMessage,
      p_proposed_amount: Math.round(validatedInput.proposedAmount),
    });

    if (error) throw error;
    if (!data) return successResult(null);

    return successResult(mapApplicationRow(data as Partial<ApplicationsRow>));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos enviar tu postulación."));
  }
}

export async function updateApplicationStatus(input: {
  applicationId: string;
  jobId: string;
  ownerUserId: string;
  applicantUserId: string;
  status: "aceptada" | "rechazada";
}): Promise<ServiceResult<Application | null>> {
  try {
    const validatedInput = parseWithValidation(applicationStatusSchema, input);
    if (shouldUseFallback()) return successResult(null, "fallback");
    await ensureAuthenticatedUser(validatedInput.ownerUserId);

    const { data, error } = await supabase!.rpc("set_application_status", {
      p_application_id: validatedInput.applicationId,
      p_job_id: validatedInput.jobId,
      p_owner_user_id: validatedInput.ownerUserId,
      p_applicant_user_id: validatedInput.applicantUserId,
      p_status: validatedInput.status,
    });

    if (error) throw error;
    if (!data) return successResult(null);

    return successResult(mapApplicationRow(data as Partial<ApplicationsRow>));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos actualizar la postulación."));
  }
}

export async function withdrawApplication(
  applicationId: string,
  applicantUserId: string,
): Promise<ServiceResult<boolean>> {
  if (!isNonEmptyString(applicationId) || !isNonEmptyString(applicantUserId)) {
    return failureResult(false, "No pudimos identificar la postulación.");
  }

  try {
    if (shouldUseFallback()) return successResult(true, "fallback");

    const { error } = await supabase!
      .from("applications")
      .delete()
      .eq("id", applicationId)
      .eq("applicant_user_id", applicantUserId);

    if (error) throw error;

    return successResult(true);
  } catch (error) {
    return failureResult(false, normalizeError(error, "No pudimos retirarte de esta postulación."));
  }
}
