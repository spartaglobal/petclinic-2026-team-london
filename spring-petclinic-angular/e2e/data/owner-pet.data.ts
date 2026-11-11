// TEST DATA: fictional owners and pets used only by the e2e tests.
// Names get a random letter suffix (no digits, which the owner form rejects)
// so every test creates its own records against a fresh or reused API.

export const API_URL = 'http://localhost:9966/petclinic/api/';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export function randomLetters(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }
  return result;
}

export interface OwnerData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
}

export interface PetData {
  name: string;
  /** Format the pet form's date input accepts (YYYY/MM/DD). */
  birthDateInput: string;
  /** Format the API stores and the owner record displays (YYYY-MM-DD). */
  birthDate: string;
  type: string;
}

export function newOwner(): OwnerData {
  return {
    firstName: `Testfirst${randomLetters(6)}`,
    lastName: `Testlast${randomLetters(8)}`,
    address: '1 Test Street',
    city: 'Testville',
    telephone: '0123456789'
  };
}

/** A pet type name not in the API's seed data (cat, dog, lizard, snake, bird, hamster). */
export function newPetTypeName(): string {
  return `Testtype${randomLetters(8)}`;
}

export function newPet(): PetData {
  return {
    name: `Testpet${randomLetters(6)}`,
    birthDateInput: '2020/01/15',
    birthDate: '2020-01-15',
    type: 'dog' // seeded by the API on every start
  };
}
