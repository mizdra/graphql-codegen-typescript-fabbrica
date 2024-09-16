// MEMO: The tests for this module are covered by `e2e/*.e2e.ts`.

import type { Connection, ConnectionArguments } from 'graphql-relay';
import { connectionFromArray } from 'graphql-relay';

import type { FieldResolver, FieldsResolver, ResolvedFields } from './field-resolver.js';
import { resolveFields } from './field-resolver.js';
import { getSequenceCounter, resetSequence } from './sequence.js';
import type { Merge } from './util.js';

export type Traits<Type extends Record<string, unknown>, TransientFields extends Record<string, unknown>> = {
  [traitName: string]: {
    defaultFields: FieldsResolver<Type & TransientFields>;
  };
};

export interface TypeFactoryDefineOptions<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends FieldsResolver<Type & TransientFields>,
  _Traits extends Traits<Type, TransientFields>,
> {
  defaultFields: _DefaultFieldsResolver;
  traits?: _Traits;
}

export interface TypeFactoryInterface<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  // NOTE: The constraints of _DefaultFieldsResolver are loose so that `Merge<_DefaultFieldsResolver, _Traits[T]['defaultFields']>` is accepted.
  _DefaultFieldsResolver extends Partial<Record<keyof Type, FieldResolver<Type & TransientFields, unknown>>>,
  _Traits extends Traits<Type, TransientFields>,
> {
  // NOTE: The separation of type definitions with and without arguments is intentional.
  // If the type definitions are merged, code completion of field names will not work in the arguments passed to `build`/`buildList` function.
  build(): Promise<Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<{}>>, keyof TransientFields>>;
  build<T extends FieldsResolver<Type & TransientFields>>(
    inputFieldsResolver: T,
  ): Promise<Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof TransientFields>>;
  buildList(
    count: number,
  ): Promise<Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<{}>>, keyof TransientFields>[]>;
  buildList<T extends FieldsResolver<Type & TransientFields>>(
    count: number,
    inputFieldsResolver: T,
  ): Promise<Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof TransientFields>[]>;
  buildConnection(
    count: number,
    connectionArgs: ConnectionArguments,
  ): Promise<
    Connection<Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<{}>>, keyof TransientFields>>
  >;
  buildConnection<T extends FieldsResolver<Type & TransientFields>>(
    count: number,
    connectionArgs: ConnectionArguments,
    inputFieldsResolver: T,
  ): Promise<Connection<Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof TransientFields>>>;
  use<T extends keyof _Traits>(
    traitName: T,
  ): TypeFactoryInterface<Type, TransientFields, Merge<_DefaultFieldsResolver, _Traits[T]['defaultFields']>, _Traits>;
  resetSequence(): void;
}

export interface DefineTypeFactoryInterfaceRequired<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
> {
  <
    _DefaultFieldsResolver extends Required<FieldsResolver<Type & TransientFields>>,
    _Traits extends Traits<Type, TransientFields>,
  >(
    options: TypeFactoryDefineOptions<Type, TransientFields, _DefaultFieldsResolver, _Traits>,
  ): TypeFactoryInterface<Type, TransientFields, _DefaultFieldsResolver, _Traits>;
  withTransientFields<NewTransientFields extends Record<string, unknown>>(
    defaultTransientFields: NewTransientFields,
  ): DefineTypeFactoryInterface<Type, Merge<TransientFields, NewTransientFields>>;
  withAdditionalFields<AdditionalFields extends Record<string, unknown>>(): DefineTypeFactoryInterface<
    Type & AdditionalFields,
    TransientFields
  >;
}

export interface DefineTypeFactoryInterface<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
> extends DefineTypeFactoryInterfaceRequired<Type, TransientFields> {
  <
    _DefaultFieldsResolver extends FieldsResolver<Type & TransientFields>,
    _Traits extends Traits<Type, TransientFields> = Traits<Type, TransientFields>,
  >(
    options: TypeFactoryDefineOptions<Type, TransientFields, _DefaultFieldsResolver, _Traits>,
  ): TypeFactoryInterface<Type, TransientFields, _DefaultFieldsResolver, _Traits>;
}

export function defineTypeFactoryInternal<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends FieldsResolver<Type & TransientFields>,
  _Traits extends Traits<Type, TransientFields>,
>(
  transientFieldNames: (keyof TransientFields)[],
  {
    defaultFields: defaultFieldsResolver,
    traits,
  }: TypeFactoryDefineOptions<Type, TransientFields, _DefaultFieldsResolver, _Traits>,
  seqKey: object = {},
): TypeFactoryInterface<Type, TransientFields, _DefaultFieldsResolver, _Traits> {
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<T extends FieldsResolver<Type & TransientFields>>(
      inputFieldsResolver?: T,
    ): Promise<Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof TransientFields>> {
      const seq = getSeq();
      return resolveFields<Type, TransientFields, _DefaultFieldsResolver, T>(
        transientFieldNames,
        seq,
        defaultFieldsResolver,
        inputFieldsResolver ?? ({} as T),
      );
    },
    async buildList<T extends FieldsResolver<Type & TransientFields>>(
      count: number,
      inputFieldsResolver?: T,
    ): Promise<Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof TransientFields>[]> {
      const array: Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof TransientFields>[] = [];
      for (let i = 0; i < count; i++) {
        if (inputFieldsResolver) {
          // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-explicit-any
          array.push((await this.build(inputFieldsResolver)) as any);
        } else {
          // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-explicit-any
          array.push((await this.build()) as any);
        }
      }
      return array;
    },
    async buildConnection<T extends FieldsResolver<Type & TransientFields>>(
      count: number,
      connectionArgs: ConnectionArguments,
      inputFieldsResolver?: T,
    ): Promise<
      Connection<Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof TransientFields>>
    > {
      const list = inputFieldsResolver ? await this.buildList(count, inputFieldsResolver) : await this.buildList(count);
      return connectionFromArray(
        list as readonly Omit<
          Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>,
          keyof TransientFields
        >[],
        connectionArgs,
      );
    },
    use<T extends keyof _Traits>(
      traitName: T,
    ): TypeFactoryInterface<
      Type,
      TransientFields,
      Merge<_DefaultFieldsResolver, _Traits[T]['defaultFields']>,
      _Traits
    > {
      const trait = traits?.[traitName];

      if (!trait) throw new Error(`Trait ("${String(traitName)}") is not defined.`);
      // @ts-expect-error -- Use @ts-expect-error as it is impossible to match types.
      return defineTypeFactoryInternal(
        transientFieldNames,
        {
          defaultFields: { ...defaultFieldsResolver, ...trait.defaultFields },
          traits,
        },
        seqKey,
      );
    },
    resetSequence() {
      resetSequence(seqKey);
    },
  };
}

class DefineTypeFactory<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
> extends Function {
  _defaultTransientFields: TransientFields;
  constructor(defaultTransientFields: TransientFields) {
    super();
    this._defaultTransientFields = defaultTransientFields;

    // ref: https://gist.github.com/arccoza/50fe61c8430fc97a463bf6b8960776ce
    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apply: (target, _thisArg, [options]: [any]) => target._apply(options),
    });
  }

  _apply<
    _DefaultFieldsResolver extends FieldsResolver<Type & TransientFields>,
    _Traits extends Traits<Type, TransientFields> = Traits<Type, TransientFields>,
  >(
    options: TypeFactoryDefineOptions<Type, TransientFields, _DefaultFieldsResolver, _Traits>,
  ): TypeFactoryInterface<Type, TransientFields, _DefaultFieldsResolver, _Traits> {
    return defineTypeFactoryInternal<Type, TransientFields, _DefaultFieldsResolver, _Traits>(
      Object.keys(this._defaultTransientFields),
      {
        ...options,
        defaultFields: { ...this._defaultTransientFields, ...options.defaultFields },
      },
    );
  }

  withTransientFields<NewTransientFields extends Record<string, unknown>>(
    defaultTransientFields: NewTransientFields,
  ): DefineTypeFactoryInterface<Type, Merge<TransientFields, NewTransientFields>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new DefineTypeFactory({ ...this._defaultTransientFields, ...defaultTransientFields }) as any;
  }
  withAdditionalFields<AdditionalFields extends Record<string, unknown>>(): DefineTypeFactoryInterface<
    Type & AdditionalFields,
    TransientFields
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }
}
export const defineTypeFactory = new DefineTypeFactory({}) as unknown as DefineTypeFactoryInterfaceRequired<{}, {}>;
