import bcrypt from "bcryptjs";
import { User } from "@/core/domain/entities";
import { UserRepository } from "@/core/domain/repositories";

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  user: User;
}

export interface ISignUpUseCase {
  execute(request: SignUpRequest): Promise<SignUpResponse>;
}

export class SignUpUseCase implements ISignUpUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: SignUpRequest): Promise<SignUpResponse> {
    const { name, email, password } = request;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already in use");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    return { user };
  }
}

