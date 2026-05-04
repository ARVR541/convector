import { useCallback, useState } from "react"
import { readStorage, writeStorage } from "../store/storage"

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => readStorage(key, initialValue))

  const setValue = useCallback(
    (value) => {
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
