import {
  UserRepository,
  ProjectRepository,
  SubscriptionRepository,
} from "@/core/domain/repositories";
import {
  DrizzleUserRepository,
  DrizzleProjectRepository,
  DrizzleSubscriptionRepository,
} from "@/infrastructure/repositories";
import {
  ImageGenerationService,
  PaymentService,
  ImageSearchService,
} from "@/core/domain/services";
import {
  ReplicateService,
  StripeService,
  UnsplashService,
} from "@/infrastructure/services";
import {
  ISignUpUseCase,
  ISignInUseCase,
  IGetSessionUseCase,
  SignUpUseCase,
  SignInUseCase,
  GetSessionUseCase,
} from "@/core/application/use-cases/auth";
import {
  ICreateProjectUseCase,
  IGetProjectUseCase,
  IGetProjectsUseCase,
  IUpdateProjectUseCase,
  IDeleteProjectUseCase,
  IDuplicateProjectUseCase,
  IGetTemplatesUseCase,
  CreateProjectUseCase,
  GetProjectUseCase,
  GetProjectsUseCase,
  UpdateProjectUseCase,
  DeleteProjectUseCase,
  DuplicateProjectUseCase,
  GetTemplatesUseCase,
} from "@/core/application/use-cases/project";
import {
  IGetSubscriptionUseCase,
  ICreateCheckoutUseCase,
  ICreateBillingPortalUseCase,
  IHandleWebhookUseCase,
  GetSubscriptionUseCase,
  CreateCheckoutUseCase,
  CreateBillingPortalUseCase,
  HandleWebhookUseCase,
} from "@/core/application/use-cases/subscription";
import {
  IGenerateImageUseCase,
  IRemoveBackgroundUseCase,
  GenerateImageUseCase,
  RemoveBackgroundUseCase,
} from "@/core/application/use-cases/ai";
import {
  IGetImagesUseCase,
  GetImagesUseCase,
} from "@/core/application/use-cases/image";

export interface Dependencies {
  // Repositories
  userRepository: UserRepository;
  projectRepository: ProjectRepository;
  subscriptionRepository: SubscriptionRepository;

  // Services
  imageGenerationService: ImageGenerationService;
  paymentService: PaymentService;
  imageSearchService: ImageSearchService;

  // Auth Use Cases
  signUpUseCase: ISignUpUseCase;
  signInUseCase: ISignInUseCase;
  getSessionUseCase: IGetSessionUseCase;

  // Project Use Cases
  createProjectUseCase: ICreateProjectUseCase;
  getProjectUseCase: IGetProjectUseCase;
  getProjectsUseCase: IGetProjectsUseCase;
  updateProjectUseCase: IUpdateProjectUseCase;
  deleteProjectUseCase: IDeleteProjectUseCase;
  duplicateProjectUseCase: IDuplicateProjectUseCase;
  getTemplatesUseCase: IGetTemplatesUseCase;

  // Subscription Use Cases
  getSubscriptionUseCase: IGetSubscriptionUseCase;
  createCheckoutUseCase: ICreateCheckoutUseCase;
  createBillingPortalUseCase: ICreateBillingPortalUseCase;
  handleWebhookUseCase: IHandleWebhookUseCase;

  // AI Use Cases
  generateImageUseCase: IGenerateImageUseCase;
  removeBackgroundUseCase: IRemoveBackgroundUseCase;

  // Image Use Cases
  getImagesUseCase: IGetImagesUseCase;
}

class DIContainer {
  private dependencies: Dependencies;

  constructor() {
    // Infrastructure layer - Repositories
    const userRepository = new DrizzleUserRepository();
    const projectRepository = new DrizzleProjectRepository();
    const subscriptionRepository = new DrizzleSubscriptionRepository();

    // Infrastructure layer - Services (concrete implementations)
    const imageGenerationService: ImageGenerationService = new ReplicateService();
    const paymentService: PaymentService = new StripeService();
    const imageSearchService: ImageSearchService = new UnsplashService();

    // Application layer - Auth Use Cases
    const signUpUseCase = new SignUpUseCase(userRepository);
    const signInUseCase = new SignInUseCase(userRepository);
    const getSessionUseCase = new GetSessionUseCase(userRepository);

    // Application layer - Project Use Cases
    const createProjectUseCase = new CreateProjectUseCase(projectRepository);
    const getProjectUseCase = new GetProjectUseCase(projectRepository);
    const getProjectsUseCase = new GetProjectsUseCase(projectRepository);
    const updateProjectUseCase = new UpdateProjectUseCase(projectRepository);
    const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);
    const duplicateProjectUseCase = new DuplicateProjectUseCase(projectRepository);
    const getTemplatesUseCase = new GetTemplatesUseCase(projectRepository);

    // Application layer - Subscription Use Cases
    const getSubscriptionUseCase = new GetSubscriptionUseCase(subscriptionRepository);
    const createCheckoutUseCase = new CreateCheckoutUseCase(paymentService);
    const createBillingPortalUseCase = new CreateBillingPortalUseCase(
      subscriptionRepository,
      paymentService
    );
    const handleWebhookUseCase = new HandleWebhookUseCase(
      subscriptionRepository,
      paymentService
    );

    // Application layer - AI Use Cases
    const generateImageUseCase = new GenerateImageUseCase(imageGenerationService);
    const removeBackgroundUseCase = new RemoveBackgroundUseCase(imageGenerationService);

    // Application layer - Image Use Cases
    const getImagesUseCase = new GetImagesUseCase(imageSearchService);

    this.dependencies = {
      userRepository,
      projectRepository,
      subscriptionRepository,
      imageGenerationService,
      paymentService,
      imageSearchService,
      signUpUseCase,
      signInUseCase,
      getSessionUseCase,
      createProjectUseCase,
      getProjectUseCase,
      getProjectsUseCase,
      updateProjectUseCase,
      deleteProjectUseCase,
      duplicateProjectUseCase,
      getTemplatesUseCase,
      getSubscriptionUseCase,
      createCheckoutUseCase,
      createBillingPortalUseCase,
      handleWebhookUseCase,
      generateImageUseCase,
      removeBackgroundUseCase,
      getImagesUseCase,
    };
  }

  getDependencies(): Dependencies {
    return this.dependencies;
  }

  // Repository getters
  getUserRepository(): UserRepository {
    return this.dependencies.userRepository;
  }

  getProjectRepository(): ProjectRepository {
    return this.dependencies.projectRepository;
  }

  getSubscriptionRepository(): SubscriptionRepository {
    return this.dependencies.subscriptionRepository;
  }

  // Service getters
  getImageGenerationService(): ImageGenerationService {
    return this.dependencies.imageGenerationService;
  }

  getPaymentService(): PaymentService {
    return this.dependencies.paymentService;
  }

  getImageSearchService(): ImageSearchService {
    return this.dependencies.imageSearchService;
  }

  // Auth Use Case getters
  getSignUpUseCase(): ISignUpUseCase {
    return this.dependencies.signUpUseCase;
  }

  getSignInUseCase(): ISignInUseCase {
    return this.dependencies.signInUseCase;
  }

  getGetSessionUseCase(): IGetSessionUseCase {
    return this.dependencies.getSessionUseCase;
  }

  // Project Use Case getters
  getCreateProjectUseCase(): ICreateProjectUseCase {
    return this.dependencies.createProjectUseCase;
  }

  getGetProjectUseCase(): IGetProjectUseCase {
    return this.dependencies.getProjectUseCase;
  }

  getGetProjectsUseCase(): IGetProjectsUseCase {
    return this.dependencies.getProjectsUseCase;
  }

  getUpdateProjectUseCase(): IUpdateProjectUseCase {
    return this.dependencies.updateProjectUseCase;
  }

  getDeleteProjectUseCase(): IDeleteProjectUseCase {
    return this.dependencies.deleteProjectUseCase;
  }

  getDuplicateProjectUseCase(): IDuplicateProjectUseCase {
    return this.dependencies.duplicateProjectUseCase;
  }

  getGetTemplatesUseCase(): IGetTemplatesUseCase {
    return this.dependencies.getTemplatesUseCase;
  }

  // Subscription Use Case getters
  getGetSubscriptionUseCase(): IGetSubscriptionUseCase {
    return this.dependencies.getSubscriptionUseCase;
  }

  getCreateCheckoutUseCase(): ICreateCheckoutUseCase {
    return this.dependencies.createCheckoutUseCase;
  }

  getCreateBillingPortalUseCase(): ICreateBillingPortalUseCase {
    return this.dependencies.createBillingPortalUseCase;
  }

  getHandleWebhookUseCase(): IHandleWebhookUseCase {
    return this.dependencies.handleWebhookUseCase;
  }

  // AI Use Case getters
  getGenerateImageUseCase(): IGenerateImageUseCase {
    return this.dependencies.generateImageUseCase;
  }

  getRemoveBackgroundUseCase(): IRemoveBackgroundUseCase {
    return this.dependencies.removeBackgroundUseCase;
  }

  // Image Use Case getters
  getGetImagesUseCase(): IGetImagesUseCase {
    return this.dependencies.getImagesUseCase;
  }
}

export const container = new DIContainer();

