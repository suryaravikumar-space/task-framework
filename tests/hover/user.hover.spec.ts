const { test, expect } = require('@playwright/test');

// Define the test
test('Salesforce Login', async ({ page }) => {
  // Open the Salesforce login page
  await page.goto('https://dream-inspiration-7795.my.salesforce.com/');
  // Enter the username and password
  await page.fill('#username', 'sravikumar-pvrv@force.com'); // Replace with your actual username
  await page.fill('#password', 'Kinley123@'); // Replace with your actual password
  await page.click('#Login');
  await page.waitForNavigation();

  
  const welcomeMessage = page.locator('h2.spotlightTitleText[data-id="spotlightTitleText"]');
  await expect(welcomeMessage).toContainText('Welcome, Surya');

   // Navigate to the "All Contacts" view
   const allContacts = page.locator('span.triggerLinkText.selectedListView.slds-page-header__title');
   await expect(allContacts).toContainText('All Contacts');
});
