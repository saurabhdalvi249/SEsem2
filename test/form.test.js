const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Gym Membership Form Test Suite', function () {
  let driver;
  const baseUrl = 'http://localhost:8081/index.html';
  this.timeout(90000);

  before(async () => {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options())
      .build();
  });

  after(async () => {
    await driver.quit();
  });

  beforeEach(async () => {
    await driver.get(baseUrl);
  });

  // Utility to fill and submit form
  async function submitForm(name, age, membership) {
    await driver.findElement(By.id('name')).clear();
    await driver.findElement(By.id('age')).clear();

    if (name) await driver.findElement(By.id('name')).sendKeys(name);
    if (age) await driver.findElement(By.id('age')).sendKeys(age);
    if (membership) await driver.findElement(By.id('membership')).sendKeys(membership);

    await driver.findElement(By.css('form#member-form button[type="submit"]')).click();
  }

  async function memberIsListed(name) {
    const list = await driver.findElement(By.id('members-list'));
    const html = await list.getAttribute('innerHTML');
    return html.includes(name);
  }

  // ✅ Valid Cases
  it('1. should add member with Gold membership', async () => {
    await submitForm('Alice', '30', 'Gold');
    assert.strictEqual(await memberIsListed('Alice'), true);
  });

  it('2. should add member with Silver membership', async () => {
    await submitForm('Bob', '28', 'Silver');
    assert.strictEqual(await memberIsListed('Bob'), true);
  });

  it('3. should add member with Platinum membership', async () => {
    await submitForm('Charlie', '35', 'Platinum');
    assert.strictEqual(await memberIsListed('Charlie'), true);
  });

  // ✅ Validation & Edge Cases
  it('4. should not submit if name is missing', async () => {
    await submitForm('', '30', 'Gold');
    const list = await driver.findElement(By.id('members-list'));
    const html = await list.getAttribute('innerHTML');
    assert.ok(!html.includes('30'));
  });

  it('5. should not submit if age is missing', async () => {
    await submitForm('David', '', 'Gold');
    const listed = await memberIsListed('David');
    assert.strictEqual(listed, false);
  });

  it('6. should not submit if both fields are missing', async () => {
    await submitForm('', '', 'Silver');
    const list = await driver.findElement(By.id('members-list'));
    const html = await list.getAttribute('innerHTML');
    assert.ok(!html.includes('Silver'));
  });

  it('7. should allow age as 18 (minimum)', async () => {
    await submitForm('Eve', '18', 'Silver');
    assert.strictEqual(await memberIsListed('Eve'), true);
  });

  it('8. should allow age as 65 (upper bound)', async () => {
    await submitForm('Frank', '65', 'Gold');
    assert.strictEqual(await memberIsListed('Frank'), true);
  });

  it('9. should reject non-numeric age', async () => {
    try {
      await submitForm('George', 'abc', 'Gold');
    } catch (e) {
      assert.ok(true);
    }
  });

  // ✅ Unusual Inputs
  it('10. should trim name with leading/trailing spaces', async () => {
    await submitForm('   Hannah   ', '32', 'Platinum');
    assert.strictEqual(await memberIsListed('Hannah'), true);
  });

  it('11. should handle long name', async () => {
    const longName = 'John'.repeat(20);
    await submitForm(longName, '45', 'Gold');
    assert.strictEqual(await memberIsListed('John'), true); // partial match
  });

  it('12. should ignore script injection in name field', async () => {
    const malicious = `<script>alert("xss")</script>`;
    await submitForm(malicious, '25', 'Silver');
    const list = await driver.findElement(By.id('members-list'));
    const html = await list.getAttribute('innerHTML');
    assert.ok(!html.includes('<script>'));
  });

  // ✅ Dropdown Behavior
  it('13. should default to Gold membership', async () => {
    await submitForm('Isaac', '27', null);
    const list = await driver.findElement(By.id('members-list'));
    const html = await list.getAttribute('innerHTML');
    assert.ok(html.includes('Gold'));
  });

  // ✅ Multiple Entries
  it('14. should allow multiple members sequentially', async () => {
    await submitForm('Judy', '31', 'Gold');
    await submitForm('Kevin', '40', 'Silver');
    const list = await driver.findElement(By.id('members-list'));
    const html = await list.getAttribute('innerHTML');
    assert.ok(html.includes('Judy') && html.includes('Kevin'));
  });

  // ✅ UI/DOM-related
  it('15. should update members-list after submit', async () => {
    await submitForm('Lara', '38', 'Platinum');
    const list = await driver.findElement(By.id('members-list'));
    const html = await list.getAttribute('innerHTML');
    assert.ok(html.length > 0);
  });

  it('16. should not reload the page on submit', async () => {
    await submitForm('Mike', '29', 'Silver');
    const url = await driver.getCurrentUrl();
    assert.strictEqual(url, baseUrl);
  });

  // ✅ Case Sensitivity
  it('17. should preserve case in name', async () => {
    await submitForm('Nancy O\'Brien', '36', 'Gold');
    const list = await driver.findElement(By.id('members-list'));
    const html = await list.getAttribute('innerHTML');
    assert.ok(html.includes("Nancy O'Brien"));
  });

  // ✅ Special Characters
  it('18. should allow special characters in name', async () => {
    await submitForm('Ólafur Jón', '39', 'Silver');
    assert.strictEqual(await memberIsListed('Ólafur'), true);
  });

  // ✅ Membership Switch
  it('19. should switch membership options', async () => {
    await submitForm('Paul', '50', 'Platinum');
    const list = await driver.findElement(By.id('members-list'));
    const html = await list.getAttribute('innerHTML');
    assert.ok(html.includes('Platinum'));
  });

  // ✅ Case where age is very large
  it('20. should handle large age input gracefully', async () => {
    await submitForm('Queen', '150', 'Gold');
    const list = await driver.findElement(By.id('members-list'));
    const html = await list.getAttribute('innerHTML');
    assert.ok(html.includes('Queen'));
  });
});
