export interface TebexRecurringPaymentStatus {
  id: number;
  class: string;
  description: string;
  active: number;
}

export interface TebexRecurringPaymentLinks {
  initial_payment: string;
  payment_history: string[];
}

export interface TebexRecurringPayment {
  id: number;
  created_at: string;
  updated_at: string;
  paused_at: string | null;
  paused_until: string | null;
  next_payment_date: string;
  reference: string;
  account_id: number;
  interval: string;
  cancelled_at: string | null;
  cancellation_requested_at: string | null;
  status: TebexRecurringPaymentStatus;
  amount: number;
  cancel_reason: string | null;
  links: TebexRecurringPaymentLinks;
  period: string;
}
