import { logger } from '@shared/monitor';
import { NormalisedAddressDto } from '@dto/normalised-address-dto';
import { NormalisedAddress } from '@domain/normalised-address';
import { getNormalisedAddress } from '@repositories/get-normalised-address-repository';

/**
 * Get NormalisedAddress use case.
 * @param id
 * @returns NormalisedAddressDto
 */
export async function getNormalisedAddressUseCase(
	countryCode: string
): Promise<NormalisedAddressDto> {
	try {
		logger.info(
			`UseCase: Retrieving normalisedAddress for country '${countryCode}'`
		);
		const normalisedAddress: NormalisedAddress =
			await getNormalisedAddress(countryCode);

		logger.info('UseCase: Returning NormalisedAddress', { normalisedAddress });
		return normalisedAddress.toDto();
	} catch (err) {
		const error = err as Error;
		logger.error('Error occurred during normalisedAddress retrieval', {
			error,
		});
		throw error;
	}
}
