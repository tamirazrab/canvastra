import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../../../domain/entities";
import type { UserRepository } from "../../../domain/repositories";
import { GetUserUseCase } from "./get-user.use-case";

describe("GetUserUseCase", () => {
	let mockRepository: UserRepository;
	let useCase: GetUserUseCase;

	beforeEach(() => {
		mockRepository = {
			findById: vi.fn(),
			findByEmail: vi.fn(),
			save: vi.fn(),
			create: vi.fn(),
		};

		useCase = new GetUserUseCase(mockRepository);
	});

	it("should get user by id successfully", async () => {
		const userId = "user-123";
		const mockUser = new User({
			id: userId,
			name: "Test User",
			email: "test@example.com",
			emailVerified: null,
			image: null,
			password: null,
		});

		vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);

		const result = await useCase.execute({ id: userId });

		expect(mockRepository.findById).toHaveBeenCalledWith(userId);
		expect(result.user).toEqual(mockUser);
	});

	it("should throw error if user not found", async () => {
		const userId = "user-123";

		vi.mocked(mockRepository.findById).mockResolvedValue(null);

		await expect(useCase.execute({ id: userId })).rejects.toThrow(
			"User not found",
		);
	});
});
