import { Context } from 'aws-lambda';
import { database, config, up } from 'migrate-mongo';
import { config as migrateMongoConfig } from '../../../../../migrate-mongo-config';
import { config as envConfig } from '@config/config';
import { wrapper } from '@shared/wrapper';
import { fetchDbCA } from '../connection/fetch-db-ca/fetch-db-ca';
import { fetchConnectionSecret } from '../connection/fetch-connection-secret/fetch-connection-secret';
import { logger } from '@shared/monitor';

const secretName = envConfig.get('addressDbConnectionSecret');
const dbPemName = envConfig.get('addressDbPemParameter');

export const migrateHandler = async (
	event: any,
	context: Context
): Promise<void> => {
	if (context) {
		// Avoid closing the connection
		// See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
		context.callbackWaitsForEmptyEventLoop = false;
	}

	logger.info('Migration DB Service: Fetching Certificate Authority');
	const ca = await fetchDbCA(dbPemName);

	logger.info('Migration DB Service: Fetching Connection String');
	logger.info(`Migration DB Service: **** ${secretName}`);
	const url = await fetchConnectionSecret(secretName);

	const {
		mongodb: { databaseName },
		...rest
	} = migrateMongoConfig;

	// configuration for migrate-mongo
	config.set({
		mongodb: {
			url,
			databaseName,
			options: {
				ca,
				tls: true,
			},
		},
		...rest,
	});
	logger.info('Migration DB Service: Connecting to database');
	const { db, client } = await database.connect();
	logger.info('Migration DB Service: Running migration');
	const migratedFiles = await up(db, client);
	migratedFiles.forEach((fileName) => logger.info('Migrated:', fileName));

	return await client.close();
};

export const handler = wrapper(migrateHandler);
