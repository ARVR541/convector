import { useCallback, useState } from "react"
import { readStorage, writeStorage } from "../store/storage"

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((previousValue: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => readStorage(key, initialValue))

  const setValue = useCallback(
    (value: T | ((previousValue: T) => T)) => {
      setStoredValue((previousValue) => {
        const nextValue = value instanceof Function ? value(previousValue) : value
        writeStorage(key, nextValue)
        return nextValue
      })
    },
    [key]
  )

  return [storedValue, setValue]
}
