import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler } from '@shared/error-handler';
import { wrapper } from '@shared/wrapper';
import { NormalisedAddressDto } from '@dto/normalised-address-dto';
import { getNormalisedAddressUseCase } from '@use-cases/get-normalised-address-use-case';
import { validateCountryCode } from '@shared/api-utils';
import { logger } from '@shared/monitor';

/**
 * API Gateway Lambda Adapter for NormalisedAddress Get events
 */
export const getNormalisedAddressAdapter = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	try {
		logger.info(
			`Primary: Validating country: ${event.pathParameters?.country}`
		);
		const countryCode = validateCountryCode(
			event.pathParameters?.country || ''
		);

		const normalisedAddress: NormalisedAddressDto =
			await getNormalisedAddressUseCase(countryCode);

		return {
			statusCode: 200,
			body: JSON.stringify(normalisedAddress),
		};
	} catch (error) {
		return errorHandler(error);
	}
};

export const handler = wrapper(getNormalisedAddressAdapter);
