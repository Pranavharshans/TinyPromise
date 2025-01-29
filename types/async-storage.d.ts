declare module '@react-native-async-storage/async-storage' {
  export interface AsyncStorageStatic {
    /**
     * Fetches an item for a key and invokes a callback upon completion.
     */
    getItem(key: string): Promise<string | null>;

    /**
     * Sets the value for a key and invokes a callback upon completion.
     */
    setItem(key: string, value: string): Promise<void>;

    /**
     * Removes an item for a key and invokes a callback upon completion.
     */
    removeItem(key: string): Promise<void>;

    /**
     * Merges an existing value stored under key with value and invokes a callback upon completion.
     */
    mergeItem(key: string, value: string): Promise<void>;

    /**
     * Erases all AsyncStorage for the domain and invokes a callback upon completion.
     */
    clear(): Promise<void>;

    /**
     * Gets all keys known to the app and invokes a callback upon completion.
     */
    getAllKeys(): Promise<readonly string[]>;

    /**
     * multiGet resolves to an array of key-value pair arrays that matches the input format of multiSet.
     */
    multiGet(keys: readonly string[]): Promise<readonly [string, string | null][]>;

    /**
     * multiSet resolves when all operations complete and rejects if any operation fails.
     */
    multiSet(keyValuePairs: readonly [string, string][]): Promise<void>;

    /**
     * Delete all the keys in the keys array and invoke callback upon completion.
     */
    multiRemove(keys: readonly string[]): Promise<void>;

    /**
     * multiMerge resolves when all operations complete and rejects if any operation fails.
     */
    multiMerge(keyValuePairs: readonly [string, string][]): Promise<void>;
  }

  const AsyncStorage: AsyncStorageStatic;
  export default AsyncStorage;
}