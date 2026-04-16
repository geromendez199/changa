import { applications as sampleApplications, getSampleApplications } from "../data/mockData";
import { supabase } from "../lib/supabase";
import {
  applicationCreateSchema,
  applicationStatusSchema,
  parseWithValidation,
} from "../lib/validation/schemas";
import { Application } from "../types/domain";
import { ApplicationsRow, mapApplicationRow } from "../types/supabase";
import { failureResult, isNonEmptyString, normalizeError, ServiceResult, shouldUseFallback, successResult, toSafeArray } from "./service.utils";

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

    const { data, error } = await supabase!
      .from("applications")
      .insert({
        job_id: validatedInput.jobId,
        applicant_user_id: validatedInput.applicantUserId,
        cover_message: validatedInput.coverMessage,
        proposed_amount: Math.round(validatedInput.proposedAmount),
        status: "enviada",
      })
      .select("*")
      .single<ApplicationsRow>();

    if (error) throw error;

    return successResult(mapApplicationRow(data));
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

    const { data, error } = await supabase!
      .from("applications")
      .update({
        status: validatedInput.status,
      })
      .eq("id", validatedInput.applicationId)
      .eq("job_id", validatedInput.jobId)
      .eq("applicant_user_id", validatedInput.applicantUserId)
      .select("*")
      .single<ApplicationsRow>();

    if (error) throw error;

    return successResult(mapApplicationRow(data));
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
