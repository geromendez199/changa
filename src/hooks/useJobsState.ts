/**
 * WHY: Isolate jobs and applications state from the global app-state composition layer.
 * CHANGED: YYYY-MM-DD
 */
import { useCallback, useState } from "react";
import { getMyApplications } from "../services/applications.service";
import {
  createJob,
  getFeaturedJobs,
  getJobById,
  getMyJobs,
  searchJobs,
  SearchJobsParams,
} from "../services/jobs.service";
import { successResult } from "../services/service.utils";
import { Application, Job } from "../types/domain";

export interface NewJobInput {
  title: string;
  description: string;
  category: Job["category"];
  location: string;
  priceValue: number;
  availability: string;
  urgency: Job["urgency"];
  image?: string;
}

interface UseJobsStateOptions {
  userId: string | null;
  pushError: (message?: string) => void;
}

export function useJobsState({ userId, pushError }: UseJobsStateOptions) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const refreshJobs = useCallback(
    async (params: SearchJobsParams = {}) => {
      const result =
        Object.keys(params).length > 0 ? await searchJobs(params) : await getFeaturedJobs();
      setJobs(result.data);
      pushError(result.error);
      return result;
    },
    [pushError],
  );

  const loadJobById = useCallback(
    async (id: string) => {
      const result = await getJobById(id);
      pushError(result.error);
      return result.data;
    },
    [pushError],
  );

  const loadAuthenticatedJobData = useCallback(async () => {
    if (!userId) {
      setMyJobs([]);
      setApplications([]);
      return {
        myJobsResult: successResult<Job[]>([], "fallback"),
        applicationsResult: successResult<Application[]>([], "fallback"),
      };
    }

    const [myJobsResult, applicationsResult] = await Promise.all([
      getMyJobs(userId),
      getMyApplications(userId),
    ]);

    setMyJobs(myJobsResult.data);
    setApplications(applicationsResult.data);
    pushError(myJobsResult.error ?? applicationsResult.error);

    return { myJobsResult, applicationsResult };
  }, [pushError, userId]);

  const addPublishedJob = useCallback(
    async (input: NewJobInput) => {
      if (!userId) {
        const message = "Necesitás iniciar sesión para publicar.";
        pushError(message);
        return null;
      }

      const createdResult = await createJob({ ...input, postedByUserId: userId });
      if (!createdResult.data) {
        pushError(createdResult.error ?? "No pudimos publicar tu changa.");
        return null;
      }

      setJobs((prev) => [
        createdResult.data!,
        ...prev.filter((job) => job.id !== createdResult.data!.id),
      ]);
      setMyJobs((prev) => [
        createdResult.data!,
        ...prev.filter((job) => job.id !== createdResult.data!.id),
      ]);

      return createdResult.data;
    },
    [pushError, userId],
  );

  const updateApplicationStatus = useCallback((applicationId: string, status: Application["status"]) => {
    setApplications((prev) =>
      prev.map((application) =>
        application.id === applicationId ? { ...application, status } : application,
      ),
    );
  }, []);

  const resetUserJobState = useCallback(() => {
    setMyJobs([]);
    setApplications([]);
  }, []);

  return {
    jobs,
    myJobs,
    applications,
    refreshJobs,
    loadJobById,
    loadAuthenticatedJobData,
    addPublishedJob,
    updateApplicationStatus,
    resetUserJobState,
  };
}
