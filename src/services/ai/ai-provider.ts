export interface AIProvider {
    ask(question: string): Promise<string>;
}