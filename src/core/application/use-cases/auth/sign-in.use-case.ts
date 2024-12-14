import bcrypt from "bcryptjs";
import { User } from "@/core/domain/entities";
import { UserRepository } from "@/core/domain/repositories";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: User;
}

export interface ISignInUseCase {
  execute(request: SignInRequest): Promise<SignInResponse>;
}

export class SignInUseCase implements ISignInUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: SignInRequest): Promise<SignInResponse> {
    const { email, password } = request;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      throw new Error("Invalid credentials");
    }

    return { user };
  }
}

