import { createContext, useContext, useState, ReactNode } from "react";

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
  addJob: (jobId: string) => void;
  addItem: (jobId: string, item: Item) => void;
  updateItem: (jobId: string, updatedItem: Item) => void;
  getJob: (jobId: string) => Job | undefined;
};

const JobsContext = createContext<JobsContextType | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);

  const addJob = (jobId: string) => {
    setJobs((prev) => [
      ...prev,
      { jobId, createdAt: new Date().toISOString(), items: [] },
    ]);
  };

  const addItem = (jobId: string, item: Item) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.jobId === jobId ? { ...job, items: [...job.items, item] } : job
      )
    );
  };

  const updateItem = (jobId: string, updatedItem: Item) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.jobId === jobId
          ? { ...job, items: job.items.map((i) => i.itemId === updatedItem.itemId ? updatedItem : i) }
          : job
      )
    );
  };

  const getJob = (jobId: string) => jobs.find((job) => job.jobId === jobId);

  return (
    <JobsContext.Provider value={{ jobs, addJob, addItem, updateItem, getJob }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (!context) throw new Error("useJobs must be used within a JobsProvider");
  return context;
}