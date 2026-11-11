# Test standards

These rules apply to every automated UI test in `spring-petclinic-angular/e2e/`.
A pull request that breaks one of them is sent back before review.

## 1. Use semantic locators

Find elements the way a user or a screen reader would.

- Use `getByRole`, `getByLabel` or `getByText` only.
- Don't use CSS selectors, XPath, element IDs or class names.
- Pass `{ exact: true }` when a label or name could match more than one element, for example `getByLabel('Name', { exact: true })`.

```ts
// Good
await page.getByLabel('Last Name', { exact: true }).fill(owner.lastName);
await page.getByRole('button', { name: 'Add Owner' }).click();

// Not allowed
await page.locator('#lastName').fill(owner.lastName);
await page.locator('button.btn-secondary[type=submit]').click();
```

If a semantic locator can't reach an element, for example an input with no label, don't work around it with CSS. Log an accessibility defect, then test the behaviour another way.

## 2. Don't use fixed waits

- Never use `page.waitForTimeout()`, `setTimeout` or any other fixed sleep.
- Wait for something the user would see. `expect(...)` assertions and actions such as `click()` retry automatically until the page is ready.

```ts
// Good: waits until the API has saved and the form has closed
await expect(page.getByRole('heading', { name: 'New Pet Type' })).toBeHidden();

// Not allowed
await page.waitForTimeout(2000);
```

## 3. Keep test data separate

- Put test data in `e2e/data/`, not inline in specs. Start each data file with a `// TEST DATA` comment.
- Make each test's data unique by adding a random **letter** suffix to names. The owner form rejects digits in names.
- Each test creates its own records. Don't depend on another test, on data someone added by hand, or on test order.
- You may rely on the API's seed data (for example the `dog` pet type), because it's reloaded on every API start.
- Set data up through the real API (for example `POST /api/owners`). Don't mock it with `page.route`.
- Every test must pass against a freshly restarted API with no manual data fixes.

## 4. Flaky tests

A test is **flaky** if it fails and then passes on retry with no code change.

Retries are set in `playwright.config.ts`:

- **In CI:** one retry (`retries: process.env.CI ? 1 : 0`). A test that fails and then passes on that retry is marked **flaky** in the Playwright report.
- **Locally:** no retries, so a failure shows up straight away and nothing gets hidden.

When a test is flaky:

1. **Flag it.** Post it in the team channel with a link to the failing run and its trace.
2. **Log a defect** that records the test name, the failure message and how often it fails.
3. **On the same day, fix it or quarantine it.**
   - **Fix:** find the real cause, such as shared data, a missing wait-for condition or a race in the app. Prove the fix with `npx playwright test <spec> --repeat-each=3`, which must give a clean pass.
   - **Quarantine:** mark the test `test.fixme()` with the defect ID so it stops gating merges but stays visible in the report:

     ```ts
     test('Add a pet to an existing owner', async ({ page }) => {
       // Quarantined DEF-123: intermittent timeout on Save Pet (flaky)
       test.fixme();
       ...
     });
     ```

Quarantined tests aren't forgotten: each one stays tied to an open defect, and the defect is closed only when `test.fixme()` is removed and the test passes again.

A new or changed spec must pass `--repeat-each=3` before it's merged.

## 5. Known defects: `test.fail()`

When the correct behaviour is confirmed (for example by the product owner) but the app doesn't do it yet:

- Write the test for the **correct** behaviour.
- Mark it with `test.fail()` and a comment giving the defect ID and the reason.

```ts
test('Owner can be saved without a telephone', async ({ page, request }) => {
  // Known defect DEF-XXX: telephone wrongly required (PO confirmed optional)
  test.fail();
  ...
});
```

- Check the test fails **for the defect's reason**, not because of a broken locator or a timing problem. The failure in the report must point at the defect, for example the `toBeEnabled()` check on Add Owner.
- When the defect is fixed, the test passes and Playwright reports it as an *unexpected pass*. That breaks the run on purpose. Remove `test.fail()` in the same pull request as the fix.
- Use `test.fail()` only for known product defects. A test that's broken or flaky gets fixed or quarantined under section 4 instead.
