import { APIRequestContext, expect, Page, test } from '@playwright/test';
import { API_URL, newOwner, newPet, newPetTypeName, OwnerData } from './data/owner-pet.data';

// These tests run against the real API (no page.route mocking).

async function fillOwnerForm(page: Page, owner: OwnerData, options: { telephone: boolean }) {
  await page.getByLabel('First Name', { exact: true }).fill(owner.firstName);
  await page.getByLabel('Last Name', { exact: true }).fill(owner.lastName);
  await page.getByLabel('Address', { exact: true }).fill(owner.address);
  await page.getByLabel('City', { exact: true }).fill(owner.city);
  if (options.telephone) {
    await page.getByLabel('Telephone', { exact: true }).fill(owner.telephone);
  }
}

async function createOwnerViaApi(request: APIRequestContext, owner: OwnerData): Promise<number> {
  const response = await request.post(`${API_URL}owners`, { data: owner });
  expect(response.status()).toBe(201);
  const created = await response.json();
  return created.id;
}

async function findOwnerViaApi(request: APIRequestContext, lastName: string) {
  const response = await request.get(`${API_URL}owners`, { params: { lastName } });
  expect(response.status()).toBe(200);
  const owners: Array<OwnerData & { pets: unknown[] }> = await response.json();
  // The API matches lastName as a prefix, so keep only exact matches.
  const matches = owners.filter(o => o.lastName === lastName);
  expect(matches).toHaveLength(1);
  return matches[0];
}

test.describe('Register an owner and a pet', () => {
  test('Register a new owner', async ({ page, request }) => {
    const owner = newOwner();

    // Given I am on the add-owner form
    await page.goto('/owners/add');
    await expect(page.getByRole('heading', { name: 'New Owner' })).toBeVisible();

    // When I enter valid first name, last name, address, city and telephone
    await fillOwnerForm(page, owner, { telephone: true });

    // And I save the owner
    await page.getByRole('button', { name: 'Add Owner' }).click();

    // Then I am taken to the owners list
    await expect(page).toHaveURL(/\/owners$/);
    await expect(page.getByRole('heading', { name: 'Owners', exact: true })).toBeVisible();

    // And I can find that owner by surname
    await page.getByLabel('Last name', { exact: true }).fill(owner.lastName);
    await page.getByRole('button', { name: 'Find Owner' }).click();
    await expect(page.getByRole('link', { name: `${owner.firstName} ${owner.lastName}` })).toBeVisible();

    const saved = await findOwnerViaApi(request, owner.lastName);
    expect(saved).toMatchObject(owner);
  });

  test('Add a pet to an existing owner', async ({ page, request }) => {
    const owner = newOwner();
    const pet = newPet();
    const ownerId = await createOwnerViaApi(request, owner);

    // Given I am on a registered owner's record
    await page.goto(`/owners/${ownerId}`);
    await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();

    // When I add a new pet with a valid name, birth date and type
    await page.getByRole('button', { name: 'Add New Pet' }).click();
    await expect(page.getByRole('heading', { name: 'Add Pet' })).toBeVisible();
    await expect(page.getByLabel('Owner', { exact: true })).toHaveValue(`${owner.firstName} ${owner.lastName}`);
    await page.getByLabel('Name', { exact: true }).fill(pet.name);
    await page.getByLabel('Birth Date', { exact: true }).fill(pet.birthDateInput);
    await page.getByLabel('Type', { exact: true }).selectOption({ label: pet.type });

    // And I save the pet
    await page.getByRole('button', { name: 'Save Pet' }).click();

    // Then I return to that owner's record
    await expect(page).toHaveURL(new RegExp(`/owners/${ownerId}$`));
    await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();

    // And the pet's name, birth date and type appear under Pets and Visits
    await expect(page.getByRole('heading', { name: 'Pets and Visits' })).toBeVisible();
    await expect(page.getByRole('row', { name: `Name ${pet.name}`, exact: true })).toBeVisible();
    await expect(page.getByRole('row', { name: `Birth Date ${pet.birthDate}`, exact: true })).toBeVisible();
    await expect(page.getByRole('row', { name: `Type ${pet.type}`, exact: true })).toBeVisible();

    const saved = await findOwnerViaApi(request, owner.lastName);
    expect(saved.pets).toHaveLength(1);
    expect(saved.pets[0]).toMatchObject({
      name: pet.name,
      birthDate: pet.birthDate,
      type: { name: pet.type }
    });
  });

  test('Owner can be saved without a telephone', async ({ page, request }) => {
    // Known defect DEF-XXX: telephone wrongly required (PO confirmed optional)
    test.fail();
    const owner = newOwner();

    // Given I have completed the add-owner form except telephone
    await page.goto('/owners/add');
    await fillOwnerForm(page, owner, { telephone: false });

    // When I save the owner
    const addOwner = page.getByRole('button', { name: 'Add Owner' });
    await expect(addOwner).toBeEnabled();
    await addOwner.click();

    // Then the owner is saved
    await expect(page).toHaveURL(/\/owners$/);
    const saved = await findOwnerViaApi(request, owner.lastName);
    expect(saved).toMatchObject({
      firstName: owner.firstName,
      lastName: owner.lastName,
      address: owner.address,
      city: owner.city
    });
  });

  test('Pet cannot be saved without a type', async ({ page, request }) => {
    const owner = newOwner();
    const pet = newPet();
    const ownerId = await createOwnerViaApi(request, owner);

    // Given I am adding a pet with a valid name and birth date
    await page.goto(`/owners/${ownerId}/pets/add`);
    await expect(page.getByRole('heading', { name: 'Add Pet' })).toBeVisible();
    await page.getByLabel('Name', { exact: true }).fill(pet.name);
    await page.getByLabel('Birth Date', { exact: true }).fill(pet.birthDateInput);

    // When I leave the pet type blank
    await expect(page.getByLabel('Type', { exact: true })).toHaveValue('');

    // Then the Save Pet button is disabled
    await expect(page.getByRole('button', { name: 'Save Pet' })).toBeDisabled();
  });

  test('Add a pet of a type not yet listed', async ({ page, request }) => {
    const typeName = newPetTypeName();
    const owner = newOwner();
    const pet = { ...newPet(), type: typeName };
    const ownerId = await createOwnerViaApi(request, owner);

    // Given a new pet type is created on the Pet Types page
    await page.goto('/pettypes');
    await expect(page.getByRole('heading', { name: 'Pet Types' })).toBeVisible();
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'New Pet Type' })).toBeVisible();
    await page.getByLabel('Name', { exact: true }).fill(typeName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    // The add form closes once the API has saved the type
    await expect(page.getByRole('heading', { name: 'New Pet Type' })).toBeHidden();

    // When I add a pet of that type to a registered owner
    await page.goto(`/owners/${ownerId}`);
    await page.getByRole('button', { name: 'Add New Pet' }).click();
    await expect(page.getByRole('heading', { name: 'Add Pet' })).toBeVisible();
    await page.getByLabel('Name', { exact: true }).fill(pet.name);
    await page.getByLabel('Birth Date', { exact: true }).fill(pet.birthDateInput);
    await page.getByLabel('Type', { exact: true }).selectOption({ label: typeName });
    await page.getByRole('button', { name: 'Save Pet' }).click();

    // Then the pet and its new type appear under Pets and Visits
    await expect(page).toHaveURL(new RegExp(`/owners/${ownerId}$`));
    await expect(page.getByRole('heading', { name: 'Pets and Visits' })).toBeVisible();
    await expect(page.getByRole('row', { name: `Name ${pet.name}`, exact: true })).toBeVisible();
    await expect(page.getByRole('row', { name: `Type ${typeName}`, exact: true })).toBeVisible();
  });
});
