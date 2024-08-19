import { validate } from '@shared/schema-validator';

export abstract class Entity<T> {
	private _updatedAt: Date;

	protected props: T;

	constructor(props: T, updatedAt?: Date) {
		// set default values on creation
		this._updatedAt = updatedAt ? updatedAt : this.getDate();
		this.props = {
			...props,
			updatedAt: this._updatedAt,
		};
	}

	public get updatedAt(): Date {
		return this._updatedAt;
	}

	public setUpdatedDate() {
		this._updatedAt = this.getDate();
	}

	protected validate(schema: Record<string, any>): void {
		validate(schema, this.props);
	}

	private getDate(): Date {
		return new Date();
	}

	private getISOString(): string {
		return new Date().toISOString();
	}
}
