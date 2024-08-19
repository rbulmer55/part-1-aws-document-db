import { getNormalisedAddressAdapter } from '@adapters/secondary/doc-db/doc-db-normliased-address-adapter';
import { NormalisedAddress } from '@domain/normalised-address';
import { logger } from '@shared/monitor';

import {
	NormalisedAddressDB,
	NormalisedAddressModel,
} from '@models/normalised-address';

export async function getNormalisedAddress(
	countryCode: string
): Promise<NormalisedAddress> {
	logger.info(`Repository: fetching address for ${countryCode}`);
	const address: NormalisedAddressDB =
		await getNormalisedAddressAdapter(countryCode);

	const { country2Code, ...props } = address;
	const normalisedAddress: NormalisedAddressModel = {
		country: { country2Code },
		...props,
	};

	logger.info(`Repository to domain: ${JSON.stringify(normalisedAddress)}`);
	return new NormalisedAddress(normalisedAddress);
}
