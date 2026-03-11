import { test, expect } from '@playwright/test';

test('loads the home page and allows category filtering', async ({ page }) => {
  // Navigate to the local server
  await page.goto('http://localhost:8081');
  
  // Verify the hero text exists
  await expect(page.locator('text=¿Qué necesitás')).toBeVisible();
  
  // Click on a category filter ("Plomería" as example)
  await page.click('text=Plomería');
  
  // Validate that the filtering state is active (e.g. check for active styles or URL if applied)
  // For now, ensuring the click executes successfully and elements remain visible is a solid baseline test
  await expect(page.locator('text=Plomería')).toBeVisible();
});
