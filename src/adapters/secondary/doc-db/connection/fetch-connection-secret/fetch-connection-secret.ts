import {
	GetSecretValueCommand,
	SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

interface ConnectionSecret {
	dbConnectionString: string;
}

const client = new SecretsManagerClient();

export const fetchConnectionSecret = async (
	secretName: string
): Promise<string> => {
	const response = await client.send(
		new GetSecretValueCommand({
			SecretId: secretName,
		})
	);
	const connectionSecret: ConnectionSecret = JSON.parse(
		response.SecretString || ''
	);

	if (!connectionSecret || !connectionSecret.dbConnectionString) {
		throw new Error('Unable to parse connection details');
	}

	return connectionSecret.dbConnectionString;
};
