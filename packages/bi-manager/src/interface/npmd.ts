export interface INpmdRestApiResult<T> {
  /**
   * 标识码
   * - 0 成功
   * - 1 失败
   */
  code: 0 | 1;
  msg: string;
  result: T;
}

export interface INpmdRestAPiApplication {
  categorys: {
    categoryId: string;
    name: string;
  }[];
  subCategorys: {
    subCategoryId: string;
    name: string;
    categoryId: string;
  }[];
  applications: {
    applicationId: string;
    name: string;
    subCategoryId: string;
    categoryId: string;
  }[];
}

export interface INpmdRestAPiGeo {
  provinces: {
    provinceId: string;
    provinceName: string;
    countryId: string;
  }[];
  citys: {
    cityId: string;
    cityName: string;
    provinceId: string;
    countryId: string;
  }[];
  countrys: {
    countryId: string;
    countryName: string;
  }[];
  districts: {
    districtName: string;
    cityId: string;
    provinceId: string;
    countryId: string;
    districtId: string;
  }[];
  isps: {
    ispName;
    ispId;
  }[];
  continents: {
    continentId: string;
    continentName: string;
  }[];
}

export interface INpmdRestAPiL7Protocol {
  name: string;
  id: string;
}

