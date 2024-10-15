

// todo: add unit tests and consider if direct user input to these functions (especially parseFloat) could cause issues
export function decodeQueryParameter(value: string): any {
	// Unwrap strings wrapped in double quotes (decoded as %22).
	// This is used to escape all automatic parsing of values such as true, numbers etc.
	if (value.startsWith("%22") && value.endsWith("%22")) {
		return value.substring(3, value.length - 3);
	}

	// Parse the literal string 'true' or 'false' as boolean
	if (value === "true") {
		return true
	}
	if (value === "false") {
		return false
	}

	// Attempt to parse numbers and return if valid.
	const number = parseFloat(value)
	if (!Number.isNaN(number)) {
		return number
	}

	return value
}
