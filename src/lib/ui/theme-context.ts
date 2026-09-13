export interface ThemeContext {
	readonly current: 'light' | 'dark';
	toggle(): void;
}
