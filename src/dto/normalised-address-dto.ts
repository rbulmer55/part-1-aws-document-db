export type NormalisedAddressDto = {
	country2Code: string;
	properties: NormalisedAddressPropertyDto[];
	updatedAt: Date;
	updatedBy: string;
};

export type NormalisedAddressPropertyDto = {
	propertyName: string;
	name: string;
	label: string;
	isRequired: boolean;
	entryOrder: number;
};

export type NewNormalisedAddressPropertyDto = {};

export type UpdateNormalisedAddressPropertyDto = {};
