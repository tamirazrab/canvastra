export interface AIService {
	generateImage(prompt: string): Promise<string>;
	removeBackground(image: string): Promise<string>;
}
