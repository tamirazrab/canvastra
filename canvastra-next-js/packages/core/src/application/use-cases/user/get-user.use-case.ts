import type { User } from "../../domain/entities";
import type { UserRepository } from "../../domain/repositories";

export interface GetUserRequest {
	id: string;
}

export interface GetUserResponse {
	user: User;
}

export interface IGetUserUseCase {
	execute(request: GetUserRequest): Promise<GetUserResponse>;
}

export class GetUserUseCase implements IGetUserUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(request: GetUserRequest): Promise<GetUserResponse> {
		const { id } = request;

		const user = await this.userRepository.findById(id);

		if (!user) {
			throw new Error("User not found");
		}

		return { user };
	}
}
