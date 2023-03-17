export function kebabCase(stringToConvert: string): string {
	return stringToConvert
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[\s_]+/g, '-')
		.toLowerCase();
}
