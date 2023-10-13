import React from 'react'
import { useSetState } from './hooks'

const PositionStore = React.createContext()
// PositionStore.displayName = "PositionStore"
export const PositionStoreProvider = ({ children }) => {
  const [store, setStore] = useSetState({ list: [] })
  return <PositionStore.Provider value={{ store, setStore }}>
    {children}
  </PositionStore.Provider>
}
export const usePositionStore = () => {
  return React.useContext(PositionStore)
}