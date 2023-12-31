// MEMO: The tests for this module are covered by `e2e/*.e2e.ts`.

import { ResolvedFields, FieldsResolver, resolveFields, FieldResolver } from './field-resolver.js';
import { getSequenceCounter, resetSequence } from './sequence.js';
import { Merge, StrictlyPick } from './util.js';

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
  build(): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<{}>>, keyof Type>>;
  build<T extends FieldsResolver<Type & TransientFields>>(
    inputFieldsResolver: T,
  ): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof Type>>;
  buildList(
    count: number,
  ): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<{}>>, keyof Type>[]>;
  buildList<T extends FieldsResolver<Type & TransientFields>>(
    count: number,
    inputFieldsResolver: T,
  ): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof Type>[]>;
  use<T extends keyof _Traits>(
    traitName: T,
  ): TypeFactoryInterface<Type, TransientFields, Merge<_DefaultFieldsResolver, _Traits[T]['defaultFields']>, _Traits>;
  resetSequence(): void;
}

export function defineTypeFactoryInternal<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends FieldsResolver<Type & TransientFields>,
  _Traits extends Traits<Type, TransientFields>,
>(
  typeFieldNames: readonly (keyof Type)[],
  {
    defaultFields: defaultFieldsResolver,
    traits,
  }: TypeFactoryDefineOptions<Type, TransientFields, _DefaultFieldsResolver, _Traits>,
): TypeFactoryInterface<Type, TransientFields, _DefaultFieldsResolver, _Traits> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<T extends FieldsResolver<Type & TransientFields>>(
      inputFieldsResolver?: T,
    ): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof Type>> {
      const seq = getSeq();
      return resolveFields<Type, TransientFields, _DefaultFieldsResolver, T>(
        typeFieldNames,
        seq,
        defaultFieldsResolver,
        inputFieldsResolver ?? ({} as T),
      );
    },
    async buildList<T extends FieldsResolver<Type & TransientFields>>(
      count: number,
      inputFieldsResolver?: T,
    ): Promise<StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof Type>[]> {
      const array: StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<T>>, keyof Type>[] = [];
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
      Type,
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
