import { NormalisedAddressDB } from '@models/normalised-address';
import { connect } from './connection/connect';
import { NormalisedAddress } from './db-models/normalised-address';
import { logger } from '@shared/monitor';

export const getNormalisedAddressAdapter = async (
	country2Code: string
): Promise<NormalisedAddressDB> => {
	logger.info('Secondary Adapter: Connecting to database');
	await connect();

	logger.info(
		`Secondary Adapter: Retrieving normalised address for country: ${country2Code}`
	);

	const normalisedAddress = await NormalisedAddress.findOne({ country2Code });

	if (!normalisedAddress) {
		throw new Error(`No address found for country: ${country2Code}`);
	}

	return normalisedAddress.toJSON() as unknown as NormalisedAddressDB;
};
