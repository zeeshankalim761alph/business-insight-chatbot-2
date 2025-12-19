export enum Sender {
  USER = 'user',
  BOT = 'bot'
}

export enum Industry {
  RETAIL = 'Retail',
  ECOMMERCE = 'E-commerce',
  FOOD_SERVICE = 'Food & Beverage',
  TECH_SAAS = 'Technology / SaaS',
  SERVICES = 'Professional Services',
  MANUFACTURING = 'Manufacturing',
  OTHER = 'Other'
}

export interface BusinessContext {
  industry: Industry;
  monthlyRevenue: number;
  monthlyExpenses: number;
  customerCount: number;
  trend: 'up' | 'down' | 'stable';
  goals: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}