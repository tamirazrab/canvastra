export interface BillingService {
  createCheckoutSession(userId: string): Promise<string>;
}
