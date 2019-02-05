/**
 *
 * @param aS The set of
 * @param bS
 */
export function setsAreEqual(aS: Set<any>, bS: Set<any>) {
  // Stop early
  if (aS.size !== bS.size) {
    return false;
  }

  // Check every key
  for (const a of aS) {
    if (!bS.has(a)) {
      return false;
    }
  }

  // Sets are equal
  return true;
}
