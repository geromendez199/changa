import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import {
  applications as initialApplications,
  conversations as initialConversations,
  currentUserId,
  jobs as initialJobs,
  messages as initialMessages,
  paymentMethods as initialPaymentMethods,
  transactions as initialTransactions,
  users,
} from "../data/mockData";
import { Application, Conversation, Job, Message, PaymentMethod, Transaction } from "../types/domain";

interface NewJobInput {
  title: string;
  description: string;
  category: Job["category"];
  location: string;
  priceValue: number;
  availability: string;
  urgency: Job["urgency"];
  image?: string;
}

interface AppStateValue {
  currentUserId: string;
  jobs: Job[];
  applications: Application[];
  conversations: Conversation[];
  messages: Message[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  addPublishedJob: (input: NewJobInput) => Job;
  updateApplicationStatus: (applicationId: string, status: Application["status"]) => void;
  sendMessage: (conversationId: string, content: string) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, "id" | "colorClass">) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);

  const addPublishedJob = (input: NewJobInput) => {
    const createdJob: Job = {
      id: `job-${Date.now()}`,
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      priceValue: input.priceValue,
      priceLabel: `$${input.priceValue.toLocaleString("es-AR")}`,
      availability: input.availability,
      urgency: input.urgency,
      image: input.image || "https://images.unsplash.com/photo-1556911220-bff31c812dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      rating: 5,
      distanceKm: 0.6,
      postedByUserId: currentUserId,
      postedAt: new Date().toISOString(),
      status: "publicado",
    };

    setJobs((prev) => [createdJob, ...prev]);
    return createdJob;
  };

  const updateApplicationStatus = (applicationId: string, status: Application["status"]) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status } : app)),
    );
  };

  const sendMessage = (conversationId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const msg: Message = {
      id: `m-${Date.now()}`,
      conversationId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      senderUserId: currentUserId,
      read: true,
    };

    setMessages((prev) => [...prev, msg]);
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, lastMessageAt: msg.createdAt } : conv,
      ),
    );
  };

  const addPaymentMethod = (method: Omit<PaymentMethod, "id" | "colorClass">) => {
    const colors = ["from-indigo-500 to-indigo-600", "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600"];
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm-${Date.now()}`,
      colorClass: colors[paymentMethods.length % colors.length],
    };

    setPaymentMethods((prev) => [newMethod, ...prev.map((item) => ({ ...item, isDefault: method.isDefault ? false : item.isDefault }))]);
  };

  const value = useMemo(
    () => ({
      currentUserId,
      jobs,
      applications,
      conversations,
      messages,
      paymentMethods,
      transactions: initialTransactions,
      addPublishedJob,
      updateApplicationStatus,
      sendMessage,
      addPaymentMethod,
    }),
    [applications, conversations, jobs, messages, paymentMethods],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState debe usarse dentro de AppStateProvider");
  }

  return context;
}

export const useCurrentUser = () => users.find((user) => user.id === currentUserId)!;
