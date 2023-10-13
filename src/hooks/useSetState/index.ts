import { useState, useCallback } from 'react';
export const isFunction = (value: unknown): boolean => {
  return typeof value === 'function';
};

export type SetState<S extends Record<string, any>> = <K extends keyof S>(
  state: Pick<S, K> | null | ((prevState: Readonly<S>) => Pick<S, K> | S | null)
) => void;

const useSetState = <S extends Record<string, any>>(initialState: S | (() => S)): [S, SetState<S>] => {
  const [state, setState] = useState<S>(initialState);

  const setMergeState = useCallback(patch => {
    setState(prevState => {
      const newState = isFunction(patch) ? patch(prevState) : patch;
      return newState ? { ...prevState, ...newState } : prevState;
    });
  }, []);

  return [state, setMergeState];
};


export const useResetState = <S extends Record<string, any>>(initialState: S | (() => S)) => {
  const [state, setState] = useSetState<S>(initialState);
  const resetState = useCallback(() => {
    setState(initialState);
  }, []);
  return [state, setState, resetState] as [S, SetState<S>, typeof resetState];
};

export default useSetState;
