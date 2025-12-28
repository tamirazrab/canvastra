// Use cases
import {
	CreateBillingPortalSessionUseCase,
	CreateCheckoutSessionUseCase,
	CreateProjectUseCase,
	CreateUserUseCase,
	DeleteProjectUseCase,
	DuplicateProjectUseCase,
	GenerateImageUseCase,
	GetImagesUseCase,
	GetProjectsUseCase,
	GetProjectUseCase,
	GetSubscriptionUseCase,
	GetUserUseCase,
	HandleStripeWebhookUseCase,
	ListTemplatesUseCase,
	RemoveBackgroundUseCase,
	UpdateProjectUseCase,
} from "@canvastra-next-js/core/application/use-cases";
import { DrizzleProjectRepository } from "../repositories/drizzle-project.repository";
import { DrizzleSubscriptionRepository } from "../repositories/drizzle-subscription.repository";
import { DrizzleUserRepository } from "../repositories/drizzle-user.repository";
import { ReplicateAIService } from "../services/ai.service";
import { StripeBillingService } from "../services/billing.service";
import { UnsplashImageService } from "../services/image.service";

// Repository instances
const projectRepository = new DrizzleProjectRepository();
const userRepository = new DrizzleUserRepository();
const subscriptionRepository = new DrizzleSubscriptionRepository();

// Service instances
const billingService = new StripeBillingService();
const aiService = new ReplicateAIService();
const imageService = new UnsplashImageService();

// Use case instances - Project
export const createProjectUseCase = new CreateProjectUseCase(projectRepository);
export const getProjectUseCase = new GetProjectUseCase(projectRepository);
export const getProjectsUseCase = new GetProjectsUseCase(projectRepository);
export const updateProjectUseCase = new UpdateProjectUseCase(projectRepository);
export const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);
export const duplicateProjectUseCase = new DuplicateProjectUseCase(
	projectRepository,
);
export const listTemplatesUseCase = new ListTemplatesUseCase(projectRepository);

// Use case instances - User
export const createUserUseCase = new CreateUserUseCase(userRepository);
export const getUserUseCase = new GetUserUseCase(userRepository);

// Use case instances - Subscription
export const createCheckoutSessionUseCase = new CreateCheckoutSessionUseCase(
	billingService,
);
export const getSubscriptionUseCase = new GetSubscriptionUseCase(
	subscriptionRepository,
);
export const createBillingPortalSessionUseCase =
	new CreateBillingPortalSessionUseCase(subscriptionRepository, billingService);
export const handleStripeWebhookUseCase = new HandleStripeWebhookUseCase(
	subscriptionRepository,
	billingService,
);

// Use case instances - AI
export const generateImageUseCase = new GenerateImageUseCase(aiService);
export const removeBackgroundUseCase = new RemoveBackgroundUseCase(aiService);

// Use case instances - Images
export const getImagesUseCase = new GetImagesUseCase(imageService);

// Dependency injection container
export const container = {
	// Repositories
	repositories: {
		project: projectRepository,
		user: userRepository,
		subscription: subscriptionRepository,
	},

	// Services
	services: {
		billing: billingService,
		ai: aiService,
		image: imageService,
	},

	// Use cases
	useCases: {
		project: {
			create: createProjectUseCase,
			get: getProjectUseCase,
			getAll: getProjectsUseCase,
			update: updateProjectUseCase,
			delete: deleteProjectUseCase,
			duplicate: duplicateProjectUseCase,
			listTemplates: listTemplatesUseCase,
		},
		user: {
			create: createUserUseCase,
			get: getUserUseCase,
		},
		subscription: {
			createCheckoutSession: createCheckoutSessionUseCase,
			get: getSubscriptionUseCase,
			createBillingPortalSession: createBillingPortalSessionUseCase,
			handleWebhook: handleStripeWebhookUseCase,
		},
		ai: {
			generateImage: generateImageUseCase,
			removeBackground: removeBackgroundUseCase,
		},
		images: {
			get: getImagesUseCase,
		},
	},
};

export type Container = typeof container;
