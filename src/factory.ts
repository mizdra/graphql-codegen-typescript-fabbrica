import { ResolvedFields, DefaultFieldsResolver, InputFieldsResolver, resolveFields } from './field-resolver.js';
import { getSequenceCounter, resetSequence } from './sequence.js';
import { Merge } from './util.js';

export interface TypeFactoryDefineOptions<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
> {
  defaultFields: DefaultFieldsResolver<Type & TransientFields>;
}
export interface TypeFactoryInterface<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  Options extends TypeFactoryDefineOptions<Type, TransientFields>,
> {
  build(): Promise<Pick<Merge<ResolvedFields<Options['defaultFields']>, ResolvedFields<{}>>, keyof Type>>;
  build<const T extends InputFieldsResolver<Type & TransientFields>>(
    inputFieldsResolver: T,
  ): Promise<Pick<Merge<ResolvedFields<Options['defaultFields']>, ResolvedFields<T>>, keyof Type>>;
  resetSequence(): void;
}

export function defineTypeFactoryInternal<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  Options extends TypeFactoryDefineOptions<Type, TransientFields>,
>(
  typeFieldNames: readonly (keyof Type)[],
  { defaultFields: defaultFieldsResolver }: Options,
): TypeFactoryInterface<Type, TransientFields, Options> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<const T extends InputFieldsResolver<Type & TransientFields>>(
      inputFieldsResolver?: T,
    ): Promise<Pick<Merge<ResolvedFields<Options['defaultFields']>, ResolvedFields<T>>, keyof Type>> {
      const seq = getSeq();
      return resolveFields<Type, TransientFields, Options['defaultFields'], T>(
        typeFieldNames,
        seq,
        defaultFieldsResolver,
        inputFieldsResolver ?? ({} as T),
      );
    },
    resetSequence() {
      resetSequence(seqKey);
    },
  };
}
