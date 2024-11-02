// This file is auto-generated by @hey-api/openapi-ts

export type HTTPValidationError = {
  detail?: Array<ValidationError>;
};

export type Item = {
  name: string;
  price: number;
  id: number;
};

export type ItemCreate = {
  name: string;
  price: number;
  secret_data: number;
};

export type ItemUpdate = {
  name?: string | null;
  price?: number | null;
  age?: number | null;
  secret_data?: number | null;
};

export type ValidationError = {
  loc: Array<string | number>;
  msg: string;
  type: string;
};

export type GetAllItemsGetData = {
  query?: {
    limit?: number;
    offset?: number;
  };
};

export type GetAllItemsGetResponse = Array<Item>;

export type GetAllItemsGetError = unknown | HTTPValidationError;

export type InsertItemsPostData = {
  body: ItemCreate;
};

export type InsertItemsPostResponse = Item;

export type InsertItemsPostError = unknown | HTTPValidationError;

export type GetOneItemsItemIdGetData = {
  path: {
    item_id: number;
  };
};

export type GetOneItemsItemIdGetResponse = Item;

export type GetOneItemsItemIdGetError = unknown | HTTPValidationError;

export type UpdateItemsItemIdPutData = {
  body: ItemUpdate;
  path: {
    item_id: number;
  };
};

export type UpdateItemsItemIdPutResponse = Item;

export type UpdateItemsItemIdPutError = unknown | HTTPValidationError;

export type DeleteItemsItemIdDeleteData = {
  path: {
    item_id: number;
  };
};

export type DeleteItemsItemIdDeleteResponse = unknown;

export type DeleteItemsItemIdDeleteError = unknown | HTTPValidationError;