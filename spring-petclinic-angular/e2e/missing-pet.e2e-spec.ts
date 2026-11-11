import { test } from '@playwright/test';

// Requirement: owners can report a pet as missing, recording the date and
// location last seen; the pet's status updates; a second open missing report
// for the same pet is rejected.
//
// The UI does not exist yet, so these tests hold the steps as comments only.
// When the feature is built: replace the comments with real steps using
// getByRole / getByLabel / getByText, put test data in e2e/data/, set up the
// owner and pet through the real API, and remove test.fixme().

test.describe('Report a missing pet', () => {
  test('Report a pet as missing with date and location last seen', async () => {
    // Pending: missing-pet feature not built (stretch requirement)
    test.fixme();

    // Given an owner with a pet, both created through the real API
    // And I am on that owner's record
    // When I choose to report the pet as missing
    // And I enter the date last seen and the location last seen
    // And I submit the missing report
    // Then I see a confirmation that the report was saved
    // And the API returns an open missing report for that pet
    //   with the same date and location last seen
  });

  test('Pet shows a "Missing" status on the owner\'s record after reporting', async () => {
    // Pending: missing-pet feature not built (stretch requirement)
    test.fixme();

    // Given an owner with a pet, both created through the real API
    // And the pet has no missing report, so it shows no "Missing" status
    // When I report the pet as missing with a date and location last seen
    // And I return to the owner's record
    // Then the pet shows a "Missing" status under Pets and Visits
    // And the owner's other pets (if any) do not show "Missing"
  });

  test('A second open missing report for the same pet is rejected', async () => {
    // Pending: missing-pet feature not built (stretch requirement)
    test.fixme();

    // Given an owner with a pet, both created through the real API
    // And the pet already has an open missing report
    // When I try to report the same pet as missing again
    // Then the second report is rejected with a message saying
    //   the pet already has an open missing report
    // And the API still holds exactly one open missing report for that pet
    //   with the original date and location last seen
  });
});
