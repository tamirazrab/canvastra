import { User } from "@/core/domain/entities";
import { UserRepository } from "@/core/domain/repositories";

export interface GetSessionRequest {
  userId: string;
}

export interface GetSessionResponse {
  user: User | null;
}

export interface IGetSessionUseCase {
  execute(request: GetSessionRequest): Promise<GetSessionResponse>;
}

export class GetSessionUseCase implements IGetSessionUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: GetSessionRequest): Promise<GetSessionResponse> {
    const { userId } = request;

    const user = await this.userRepository.findById(userId);

    return { user };
  }
}

