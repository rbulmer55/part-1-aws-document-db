export type CountryModel = {
  countryId?: string;
  countryName?: string;
  country2Code: string;
  country3Code?: string;
  updatedAt?: Date;
  updatedBy?: string;
};

export type CountryDB = {
  countryId: string;
  countryName: string;
  country2Code: string;
  country3Code: string;
  updatedAt: Date;
  updatedBy: string;
};
