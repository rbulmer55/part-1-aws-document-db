import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient();
export const fetchDbCA = async (caParamName: string): Promise<string> => {
	// Retrieve the PEM cert
	const command = new GetParameterCommand({
		// GetParameterRequest
		Name: caParamName,
	});
	const response = await ssmClient.send(command);
	return response.Parameter?.Value || '';
};
