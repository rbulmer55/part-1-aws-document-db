import { PropertyModel } from '@models/property';
import { CountryModel } from '@models/country';

export type NormalisedAddressModel = {
	country: CountryModel;
	properties: NormalisedAddressPropertyModel[];
	updatedAt: Date;
	updatedBy: string;
};

export type NormalisedAddressDB = {
	id: string;
	country2Code: string;
	properties: NormalisedAddressPropertyDB[];
	updatedAt: Date;
	updatedBy: string;
};

export type NormalisedAddressPropertyModel = {
	propertyName: string;
	name: string;
	label: string;
	isRequired: boolean;
	entryOrder: number;
};

export type NormalisedAddressPropertyDB = {
	propertyName: string;
	name: string;
	label: string;
	isRequired: boolean;
	entryOrder: number;
};

export type NewNormalisedAddressPropertyModel = {};

export type UpdateNormalisedAddressModel = {};
