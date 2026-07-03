import { test, expect } from "@playwright/test";

test.describe("Courses", () => {
    test("student can view the courses list", async ({ page }) => {
        await page.goto("/login");
        await page.getByPlaceholder(/your.email@stu.adun.edu.ng/i).fill("stu0@adun.edu.ng");
        await page.getByPlaceholder(/enter your password/i).fill("password123");
        await page.getByRole("button", { name: /sign in to portal/i }).click();
        await expect(page).toHaveURL(/\/dashboard/);

        await page.goto("/dashboard/courses");
        await expect(page).toHaveURL(/\/dashboard\/courses/);
    });
});
