import type { User } from "../../domain/entities";
import type { UserRepository } from "../../domain/repositories";

export interface CreateUserRequest {
  id?: string;
  name: string;
  email: string;
  password?: string;
}

export interface CreateUserResponse {
  user: User;
}

export interface ICreateUserUseCase {
  execute(request: CreateUserRequest): Promise<CreateUserResponse>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) { }

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const { id, name, email, password } = request;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const user = await this.userRepository.create({
      id,
      name,
      email,
      password,
    });

    return { user };
  }
}
