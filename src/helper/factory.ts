// MEMO: The tests for this module are covered by `e2e/*.e2e.ts`.

import { ResolvedFields, FieldsResolver, resolveFields, FieldResolver } from './field-resolver.js';
import { getSequenceCounter, resetSequence } from './sequence.js';
import { Merge, StrictlyPick } from './util.js';

export type Traits<OptionalType extends Record<string, unknown>, TransientFields extends Record<string, unknown>> = {
  [traitName: string]: {
    defaultFields: FieldsResolver<OptionalType & TransientFields>;
  };
};

export interface TypeFactoryDefineOptions<
  OptionalType extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends FieldsResolver<OptionalType & TransientFields>,
  _Traits extends Traits<OptionalType, TransientFields>,
> {
  defaultFields: _DefaultFieldsResolver;
  traits?: _Traits;
}

export interface TypeFactoryInterface<
  OptionalType extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  // NOTE: The constraints of _DefaultFieldsResolver are loose so that `Merge<_DefaultFieldsResolver, _Traits[T]['defaultFields']>` is accepted.
  _DefaultFieldsResolver extends Partial<
    Record<keyof OptionalType, FieldResolver<OptionalType & TransientFields, unknown>>
  >,
  _Traits extends Traits<OptionalType, TransientFields>,
> {
  build(): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<{}>>, keyof OptionalType>>;
  build<T extends FieldsResolver<OptionalType & TransientFields>>(
    inputFieldsResolver: T,
  ): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof OptionalType>>;
  buildList(
    count: number,
  ): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<{}>>, keyof OptionalType>[]>;
  buildList<T extends FieldsResolver<OptionalType & TransientFields>>(
    count: number,
    inputFieldsResolver: T,
  ): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof OptionalType>[]>;
  use<T extends keyof _Traits>(
    traitName: T,
  ): TypeFactoryInterface<
    OptionalType,
    TransientFields,
    Merge<_DefaultFieldsResolver, _Traits[T]['defaultFields']>,
    _Traits
  >;
  resetSequence(): void;
}

export function defineTypeFactoryInternal<
  OptionalType extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends FieldsResolver<OptionalType & TransientFields>,
  _Traits extends Traits<OptionalType, TransientFields>,
>(
  typeFieldNames: readonly (keyof OptionalType)[],
  {
    defaultFields: defaultFieldsResolver,
    traits,
  }: TypeFactoryDefineOptions<OptionalType, TransientFields, _DefaultFieldsResolver, _Traits>,
): TypeFactoryInterface<OptionalType, TransientFields, _DefaultFieldsResolver, _Traits> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<T extends FieldsResolver<OptionalType & TransientFields>>(
      inputFieldsResolver?: T,
    ): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof OptionalType>> {
      const seq = getSeq();
      return resolveFields<OptionalType, TransientFields, _DefaultFieldsResolver, T>(
        typeFieldNames,
        seq,
        defaultFieldsResolver,
        inputFieldsResolver ?? ({} as T),
      );
    },
    async buildList<T extends FieldsResolver<OptionalType & TransientFields>>(
      count: number,
      inputFieldsResolver?: T,
    ): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof OptionalType>[]> {
      const array: StrictlyPick<
        Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>,
        keyof OptionalType
      >[] = [];
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
    use<T extends keyof _Traits>(
      traitName: T,
    ): TypeFactoryInterface<
      OptionalType,
      TransientFields,
      Merge<_DefaultFieldsResolver, _Traits[T]['defaultFields']>,
      _Traits
    > {
      const trait = traits?.[traitName];

      if (!trait) throw new Error(`Trait ("${String(traitName)}") is not defined.`);
      // @ts-expect-error -- Use @ts-expect-error as it is impossible to match types.
      return defineTypeFactoryInternal(typeFieldNames, {
        defaultFields: { ...defaultFieldsResolver, ...trait.defaultFields },
        traits,
      });
    },
    resetSequence() {
      resetSequence(seqKey);
    },
  };
}
