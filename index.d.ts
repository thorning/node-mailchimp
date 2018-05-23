// export as namespace mailchimpApiV3;


export = Mailchimp;

declare class Mailchimp {
  constructor(api: string)

  get(
    pathOrOptions: PathOrOptions,
    query?: Query,
  ): Promise<any>;
  get(
    pathOrOptions: PathOrOptions,
    query?: Query,
    callback?: Callback,
  ): void;
  get(
    pathOrOptions: PathOrOptions,
    callback?: Callback,
  ): void;

  post(
    pathOrOptions: PathOrOptions,
    body?: Body,
  ): Promise<any>;
  post(
    pathOrOptions: PathOrOptions,
    body?: Body,
    callback?: Callback,
  ): void;
  post(
    pathOrOptions: PathOrOptions,
    callback?: Callback,
  ): void;

  patch(
    pathOrOptions: PathOrOptions,
    body?: Body,
  ): Promise<any>;
  patch(
    pathOrOptions: PathOrOptions,
    body?: Body,
    callback?: Callback,
  ): void;
  patch(
    pathOrOptions: PathOrOptions,
    callback?: Callback,
  ): void;

  put(
    pathOrOptions: PathOrOptions,
    body?: Body,
  ): Promise<any>;
  put(
    pathOrOptions: PathOrOptions,
    body?: Body,
    callback?: Callback,
  ): void;
  put(
    pathOrOptions: PathOrOptions,
    callback?: Callback,
  ): void;

  delete(
    pathOrOptions: PathOrOptions,
  ): Promise<any>;
  delete(
    pathOrOptions: PathOrOptions,
    callback?: Callback,
  ): void;

  request(
    options: Options,
  ): Promise<any>;
  request(
    options: Options,
    callback?: Callback,
  ): void;

  batch(...args: any[]): any
}

type Path = string;
type Options = {};

type PathOrOptions = Path | Options;

type Query = string;
type Callback = Function;

type QueryOrCallback = Query | Callback;

type Body = {}
type BodyOrCallback = Body | Callback;
