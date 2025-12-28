import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../../../domain/entities";
import type { UserRepository } from "../../../domain/repositories";
import { CreateUserUseCase } from "./create-user.use-case";

describe("CreateUserUseCase", () => {
	let mockRepository: UserRepository;
	let useCase: CreateUserUseCase;

	beforeEach(() => {
		mockRepository = {
			findById: vi.fn(),
			findByEmail: vi.fn(),
			save: vi.fn(),
			create: vi.fn(),
		};

		useCase = new CreateUserUseCase(mockRepository);
	});

	it("should create a user successfully", async () => {
		const request = {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		};

		const mockUser = new User({
			id: "user-123",
			...request,
			emailVerified: null,
			image: null,
		});

		vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
		vi.mocked(mockRepository.create).mockResolvedValue(mockUser);

		const result = await useCase.execute(request);

		expect(mockRepository.findByEmail).toHaveBeenCalledWith(request.email);
		expect(mockRepository.create).toHaveBeenCalledWith({
			name: request.name,
			email: request.email,
			password: request.password,
		});
		expect(result.user).toEqual(mockUser);
	});

	it("should throw error if user already exists", async () => {
		const request = {
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		};

		const existingUser = new User({
			id: "user-123",
			name: request.name,
			email: request.email,
			emailVerified: null,
			image: null,
			password: request.password,
		});

		vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser);

		await expect(useCase.execute(request)).rejects.toThrow(
			"User already exists",
		);
	});
});
