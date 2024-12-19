import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateCheckoutUseCase } from "@/core/application/use-cases/subscription";
import { PaymentService } from "@/core/domain/services";

describe("CreateCheckoutUseCase", () => {
  let mockService: PaymentService;
  let useCase: CreateCheckoutUseCase;

  beforeEach(() => {
    mockService = {
      createCheckoutSession: vi.fn(),
      createBillingPortalSession: vi.fn(),
      retrieveSubscription: vi.fn(),
      verifyWebhook: vi.fn(),
    };
    useCase = new CreateCheckoutUseCase(mockService);
  });

  it("should create checkout session successfully", async () => {
    const request = {
      userId: "user1",
      userEmail: "test@example.com",
      appUrl: "https://app.example.com",
      priceId: "price_123",
    };

    const checkoutUrl = "https://checkout.stripe.com/session_123";

    vi.mocked(mockService.createCheckoutSession).mockResolvedValue(checkoutUrl);

    const result = await useCase.execute(request);

    expect(result.checkoutUrl).toBe(checkoutUrl);
    expect(mockService.createCheckoutSession).toHaveBeenCalledWith({
      successUrl: "https://app.example.com?success=1",
      cancelUrl: "https://app.example.com?canceled=1",
      customerEmail: "test@example.com",
      userId: "user1",
      priceId: "price_123",
    });
  });
});

