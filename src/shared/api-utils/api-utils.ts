import { ValidationError } from '@errors/validation-error';

/**
 *
 * @param pathParams
 * @returns countryCode
 */
export const validateCountryCode = (value: string): string => {
	if (!value.length || value.length !== 2) {
		throw new ValidationError('Country not valid');
	}
	return value;
};
