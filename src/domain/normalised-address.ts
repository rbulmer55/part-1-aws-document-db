import {
	NormalisedAddressModel,
	NormalisedAddressPropertyModel,
} from '@models/normalised-address';
import { Entity } from '@entity/entity';
import schema from '@schemas/normalised-address.schema.json';
import { NormalisedAddressDto } from '@dto/normalised-address-dto';

/**
 * Normalised Address Domain Entity
 *
 * A normalised address is an entity which allows users to retrieve an address format for a country
 *
 */
export class NormalisedAddress extends Entity<NormalisedAddressModel> {
	private readonly _updatedBy: string;
	private readonly _country2Code: string;
	private readonly _properties: NormalisedAddressPropertyModel[];

	constructor(normalisedAddress: NormalisedAddressModel) {
		const { updatedAt, updatedBy, country, properties } = normalisedAddress;
		super(normalisedAddress, updatedAt);
		this._country2Code = country.country2Code;
		this._updatedBy = updatedBy;
		this._properties = properties;
	}

	public get country2Code(): string {
		return this._country2Code;
	}

	public get updatedBy(): string {
		return this._updatedBy;
	}

	public get properties(): NormalisedAddressPropertyModel[] {
		return this._properties;
	}

	// create a dto based on the domain instance
	public toDto(): NormalisedAddressDto {
		return {
			country2Code: this.country2Code,
			updatedBy: this.updatedBy,
			updatedAt: this.updatedAt,
			properties: this.properties,
		};
	}

	// create a domain object based on the dto
	public static toDomain(raw: NormalisedAddressDto): NormalisedAddress {
		const { country2Code } = raw;
		const instance = new NormalisedAddress({
			country: { country2Code },
			...raw,
		});
		instance.validate(schema);
		return instance;
	}
}
