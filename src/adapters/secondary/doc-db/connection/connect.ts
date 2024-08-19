import { config } from '@config/config';
import { connect as mongooseConnect, ConnectOptions, Mongoose } from 'mongoose';
import { fetchConnectionSecret } from './fetch-connection-secret/fetch-connection-secret';
import { fetchDbCA } from './fetch-db-ca/fetch-db-ca';
import { logger } from '@shared/monitor';

let connection: Mongoose;
const secretName = config.get('addressDbConnectionSecret');
const dbPemName = config.get('addressDbPemParameter');
const dbName = config.get('databaseName');

export async function connect(options: ConnectOptions = {}) {
	if (connection) {
		return connection;
	}

	logger.info('DB Service: Fetching Certificate Authority');
	const ca = await fetchDbCA(dbPemName);

	logger.info('DB Service: Fetching Connection String');
	logger.info(`DB Service: **** ${secretName}`);
	const dbConnectionString = await fetchConnectionSecret(secretName);

	logger.info('DB Service: Connecting to database');
	const defaultConnOptions: ConnectOptions = {
		// Options such as pool size, ssl etc
		ca,
		tls: true,
		dbName,
	};
	connection = await mongooseConnect(dbConnectionString, {
		...defaultConnOptions,
		...options,
	});
	logger.info('DB Service: Connected');

	return connection;
}
