import { test, expect } from "@playwright/test";

test.describe("Login", () => {
    test("shows an error for invalid credentials", async ({ page }) => {
        await page.goto("/login");
        await page.getByPlaceholder(/your.email@stu.adun.edu.ng/i).fill("nobody@adun.edu.ng");
        await page.getByPlaceholder(/enter your password/i).fill("wrong-password");
        await page.getByRole("button", { name: /sign in to portal/i }).click();

        await expect(page.getByText(/invalid email or password/i)).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });

    test("logs a student in and lands on the dashboard", async ({ page }) => {
        await page.goto("/login");
        await page.getByPlaceholder(/your.email@stu.adun.edu.ng/i).fill("stu0@adun.edu.ng");
        await page.getByPlaceholder(/enter your password/i).fill("password123");
        await page.getByRole("button", { name: /sign in to portal/i }).click();

        await expect(page).toHaveURL(/\/dashboard/);
    });
});
