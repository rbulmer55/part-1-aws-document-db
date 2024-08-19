import convict from 'convict';

export const config = convict({
	addressDbConnectionSecret: {
		doc: 'The secret name for the address database',
		format: String,
		default: 'addressSecret',
		env: 'ADDRESS_DB_CONNECTION_SECRET',
	},
	addressDbPemParameter: {
		doc: 'The parameter name for the address database pem',
		format: String,
		default: 'addressPem',
		env: 'ADDRESS_DB_PEM_PARAMETER',
	},
	databaseName: {
		doc: 'database name to use in the cluster',
		format: String,
		default: 'test',
		env: 'DB_NAME',
	},
}).validate({ allowed: 'strict' });
