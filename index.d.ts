type Path = string;
type Options = {};

type PathOrOptions = Path | Options;

type Query = string;
type Callback = Function;

type QueryOrCallback = Query | Callback;

type Body = {}
type BodyOrCallback = Body | Callback;

declare module "mailchimp-api-v3" {
  export interface IMailchimp {
    get(
      pathOrOptions: PathOrOptions,
      queryOrCallback?: QueryOrCallback,
      callback?: Callback,
    ): Promise<any>;

    post(
      pathOrOptions: PathOrOptions,
      bodyOrCallback?: BodyOrCallback,
      callback?: Callback,
    ): Promise<any>;

    patch(
      pathOrOptions: PathOrOptions,
      bodyOrCallback?: BodyOrCallback,
      callback?: Callback,
    ): Promise<any>;

    put(
      pathOrOptions: PathOrOptions,
      bodyOrCallback?: BodyOrCallback,
      callback?: Callback,
    ): Promise<any>;

    delete(
      pathOrOptions: PathOrOptions,
      callback?: Callback,
    ): Promise<any>;

    request(
      options: Options,
      callback?: Callback,
    ): Promise<any>;
  }
}
