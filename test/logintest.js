import { chromium, browser } from 'k6/experimental/browser';
import { check } from 'k6';

export default async function () {
    const browser = chromium.launch();
    const context = browser.newContext();
    const page = context.newPage();

    try {
        // Navigating to the login page
        await page.goto('http://localhost:3000/login');
        await page.locator('input[name="nombre"]').type('DoctorName'); // Replace with actual doctor name
        await page.locator('input[name="DNI"]').type('DoctorDNI'); // Replace with actual doctor DNI

        const submitButton = page.locator('button[name="login"]');
        await Promise.all([
            page.waitForNavigation(), // Wait for the navigation to happen after clicking the login button
            submitButton.click() // Click the login button to submit the form
        ]);

        // Check that the "Listado de pacientes" is visible on the page after login
        check(page, {
            'logged in and on patient list page': (p) => p.locator('h2').textContent().includes('Listado de pacientes')
        });

        // Example to check the presence of a patient by name
        check(page, {
            'patient Juan exists': (p) => p.locator('td[name="nombre"]').textContent().includes('Juan')
        });

        // Optionally, interact with other elements such as the add button or delete button
        // Here is how you might click an add new patient button
        const addButton = page.locator('button[name="add"]');
        await addButton.click(); // Assuming this navigates to a patient creation form

    } finally {
        page.close();
    }
}
