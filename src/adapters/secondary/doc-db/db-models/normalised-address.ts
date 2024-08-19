import { Document, Schema, model } from 'mongoose';
import { v4 as uuid } from 'uuid';

interface NormalisedAddressModel extends Document {
	_id: string;
	country2Code: string;
	updatedAt: Date;
	updatedBy: string;
	properties: [
		{
			propertyName: string;
			name: string;
			label: string;
			isRequired: boolean;
			entryOrder: number;
		},
	];
}

export const NormalisedAddress = model<NormalisedAddressModel>(
	'NormalisedAddresses',
	new Schema(
		{
			_id: { default: uuid(), required: false, type: String },
			country2Code: {
				required: true,
				type: String,
				public: true,
			},
			properties: [
				{
					propertyName: { type: String, required: true, public: true },
					name: { type: String, required: true, public: true },
					label: { type: String, required: true, public: true },
					isRequired: { type: Boolean, required: true, public: true },
					entryOrder: { type: Number, required: true, public: true },
				},
			],
			updatedBy: {
				type: String,
				required: true,
				public: true,
			},
			updatedAt: {
				type: Date,
				required: true,
				public: true,
			},
		},
		{
			strict: true,
			timestamps: true,
			toJson: {
				virtuals: true,
			},
		}
	),
	'NormalisedAddresses'
);
