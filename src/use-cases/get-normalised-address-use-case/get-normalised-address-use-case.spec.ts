import { getNormalisedAddressUseCase } from './get-normalised-address-use-case';
import { logger } from '@shared/index';
import { getNormalisedAddress } from '@repositories/get-normalised-address-repository';
import { NormalisedAddressModel } from '@models/normalised-address';
import { v4 as uuid } from 'uuid';
import { NormalisedAddressDto } from '@dto/normalised-address-dto';
import { NormalisedAddress } from '@domain/normalised-address';

const mockCountry2Code = 'GB';

jest.mock('@shared/index', () => ({
	logger: {
		debug: jest.fn(),
		info: jest.fn(),
		error: jest.fn(),
	},
}));

jest.mock('@repositories/get-normalised-address-repository', () => ({
	getNormalisedAddress: jest.fn(),
}));

describe('getNormalisedAddressUseCase', () => {
	const mockNormalisedAddressDto: NormalisedAddressDto = {
		country2Code: mockCountry2Code,
		properties: [
			{
				name: 'addressLine1',
				label: 'Address Line 1',
				propertyName: 'line1',
				isRequired: true,
				entryOrder: 1,
			},
			{
				name: 'addressLine2',
				label: 'Address Line 2',
				propertyName: 'line2',
				isRequired: false,
				entryOrder: 1.5,
			},
		],
		updatedAt: new Date('01/01/2024'),
		updatedBy: 'rb110',
	};
	const normalisedAddress = NormalisedAddress.toDomain(
		mockNormalisedAddressDto as unknown as NormalisedAddressDto
	);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should successfully retrieve an normalisedAddress and log the operation', async () => {
		(getNormalisedAddress as jest.Mock).mockResolvedValueOnce(
			normalisedAddress
		);

		const result = await getNormalisedAddressUseCase(mockCountry2Code);
		expect(getNormalisedAddress).toHaveBeenCalledWith(mockCountry2Code);
		expect(logger.debug).toHaveBeenCalledWith(
			`Retrieving normalisedAddress for country '${mockCountry2Code}'`
		);
		expect(logger.info).toHaveBeenCalledWith('Returning NormalisedAddress', {
			normalisedAddress,
		});
		expect(result).toEqual(normalisedAddress.toDto());
	});

	it('should handle errors and log them', async () => {
		const mockError = new Error('Test error');
		(getNormalisedAddress as jest.Mock).mockRejectedValueOnce(mockError);

		await expect(getNormalisedAddressUseCase(mockCountry2Code)).rejects.toThrow(
			mockError
		);
		expect(logger.debug).toHaveBeenCalledWith(
			`Retrieving normalisedAddress for country '${mockCountry2Code}'`
		);
		expect(logger.error).toHaveBeenCalledWith(
			'Error occurred during normalisedAddress retrieval',
			{ error: mockError }
		);
	});
});
