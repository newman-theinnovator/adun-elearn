import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page, email: string) {
    await page.goto("/login");
    await page.getByPlaceholder(/your.email@stu.adun.edu.ng/i).fill(email);
    await page.getByPlaceholder(/enter your password/i).fill("password123");
    await page.getByRole("button", { name: /sign in to portal/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("Role-based access", () => {
    test("unauthenticated users are redirected to login", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page).toHaveURL(/\/login/);
    });

    test("student cannot access the admin users page", async ({ page }) => {
        await login(page, "stu0@adun.edu.ng");
        await page.goto("/dashboard/users");
        await expect(page).toHaveURL(/\/dashboard(?!\/users)/);
    });

    test("admin can access the users page", async ({ page }) => {
        await login(page, "admin@adun.edu.ng");
        await page.goto("/dashboard/users");
        await expect(page).toHaveURL(/\/dashboard\/users/);
    });

    test("lecturer lands on the lecturer dashboard view", async ({ page }) => {
        await login(page, "n.eze@adun.edu.ng");
        await expect(page).toHaveURL(/\/dashboard/);
    });
});
