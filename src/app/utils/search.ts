import { Job } from "../types/domain";

export type JobSort = "distance" | "precio_asc" | "precio_desc" | "rating";

interface SearchOptions {
  query: string;
  category: string;
  sortBy: JobSort;
  onlyUrgent: boolean;
  prioritizeDistance: boolean;
}

export function searchJobs(jobs: Job[], options: SearchOptions) {
  const normalizedQuery = options.query.trim().toLowerCase();

  let result = jobs.filter((job) => {
    const matchesCategory = options.category === "Todos" || job.category === options.category;
    const matchesUrgency = !options.onlyUrgent || job.urgency === "urgente";
    const matchesQuery =
      normalizedQuery.length === 0 ||
      job.title.toLowerCase().includes(normalizedQuery) ||
      job.description.toLowerCase().includes(normalizedQuery) ||
      job.category.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesUrgency && matchesQuery;
  });

  result = [...result].sort((a, b) => {
    if (options.prioritizeDistance && a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }

    switch (options.sortBy) {
      case "precio_asc":
        return a.priceValue - b.priceValue;
      case "precio_desc":
        return b.priceValue - a.priceValue;
      case "rating":
        return b.rating - a.rating;
      case "distance":
      default:
        return a.distanceKm - b.distanceKm;
    }
  });

  return result;
}
