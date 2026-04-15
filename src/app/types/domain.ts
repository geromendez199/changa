export type JobCategory =
  | "Hogar"
  | "Oficios"
  | "Delivery"
  | "Eventos"
  | "Tecnología"
  | "Otros";

export type JobUrgency = "normal" | "urgente";

export type JobStatus =
  | "publicado"
  | "postulado"
  | "en_progreso"
  | "programado"
  | "pendiente"
  | "completado"
  | "cancelado";

export interface User {
  id: string;
  name: string;
  avatarLetter: string;
  location: string;
  memberSince: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  successRate: number;
  bio?: string;
  trustIndicators: string[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  priceLabel: string;
  priceValue: number;
  rating: number;
  distanceKm: number;
  location: string;
  availability: string;
  urgency: JobUrgency;
  image: string;
  postedByUserId: string;
  postedAt: string;
  status: JobStatus;
}

export interface Application {
  id: string;
  jobId: string;
  applicantUserId: string;
  coverMessage: string;
  proposedAmount: number;
  createdAt: string;
  status: "enviada" | "aceptada" | "rechazada";
}

export interface Message {
  id: string;
  conversationId: string;
  senderUserId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: [string, string];
  jobId: string;
  lastMessageAt: string;
}

export interface PaymentMethod {
  id: string;
  type: "Visa" | "Mastercard" | "Mercado Pago";
  last4: string;
  expiry: string;
  holderName: string;
  isDefault: boolean;
  colorClass: string;
}

export interface Transaction {
  id: string;
  jobId: string;
  amount: number;
  amountLabel: string;
  createdAt: string;
  status: "pagado" | "pendiente" | "reintegrado";
}

export interface Review {
  id: string;
  reviewerUserId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  type: "mensaje" | "trabajo" | "pago";
}
