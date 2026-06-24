export type TransactionType = "income" | "expense";

// Guest localStorage transaction
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  comment: string;
  createdAt: string;
}

export type Plan = "free" | "pro" | "business";

export interface Group {
  id: string;
  name: string;
  emoji: string;
  created_by: string;
  owner_id?: string;
  invite_token: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: "owner" | "member" | "viewer";
  joined_at: string;
}

// DB transaction (Supabase)
export interface GroupTransaction {
  id: string;
  group_id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  comment: string;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  plan: Plan;
  created_at: string;
}
