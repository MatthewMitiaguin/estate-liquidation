import { createContext, useContext, useState, ReactNode } from "react";
import { api } from "../api/client";

type Item = {
  itemId: string;
  name: string;
  description: string;
  condition: string;
  valueRangeLow: number;
  valueRangeHigh: number;
  category: string;
  auctionSuitable: boolean;
  auctionNotes: string;
  disposition: string;
  photoUri: string;
};

type Job = {
  jobId: string;
  createdAt: string;
  items: Item[];
};

type JobsContextType = {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  loadJobs: () => Promise<void>;
  addJob: (workerName: string, address: string) => Promise<string>;
  addItem: (jobId: string, item: Item) => Promise<void>;
  updateItem: (jobId: string, updatedItem: Item) => Promise<void>;
  getJob: (jobId: string) => Job | undefined;
};

const JobsContext = createContext<JobsContextType | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const loadJobs = async () => {
  setIsLoading(true);
  try {
    const data = await api.listJobs() as Job[];
    setJobs(data.map(job => ({ ...job, items: job.items ?? [] })));
  } catch (err) {
    setError("Failed to load jobs");
  } finally {
    setIsLoading(false);
  }
};

  const addJob = async (workerName: string, address: string): Promise<string> => {
    setIsLoading(true);
    try {
      const data = await api.createJob(workerName, address) as { jobId: string };
      const newJob: Job = {
        jobId: data.jobId,
        createdAt: new Date().toISOString(),
        items: [],
      };
      setJobs((prev) => [newJob, ...prev]);
      return data.jobId;
    } catch (err) {
      setError("Failed to create job");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (jobId: string, item: Item) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.jobId === jobId ? { ...job, items: [...job.items, item] } : job
      )
    );
    try {
      await api.updateItem(jobId, item.itemId, item);
    } catch (err) {
      setError("Failed to save item");
    }
  };

  const updateItem = async (jobId: string, updatedItem: Item) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.jobId === jobId
          ? { ...job, items: job.items.map((i) => i.itemId === updatedItem.itemId ? updatedItem : i) }
          : job
      )
    );
    try {
      await api.updateItem(jobId, updatedItem.itemId, updatedItem);
    } catch (err) {
      setError("Failed to update item");
    }
  };

  const getJob = (jobId: string) => jobs.find((job) => job.jobId === jobId);

  return (
    <JobsContext.Provider value={{ jobs, isLoading, error, loadJobs, addJob, addItem, updateItem, getJob }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (!context) throw new Error("useJobs must be used within a JobsProvider");
  return context;
}