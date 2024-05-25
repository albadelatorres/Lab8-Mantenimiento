import { browser } from 'k6/experimental/browser';
import { check, sleep } from 'k6';

export const options = {
    scenarios: {
        ui: {
            executor: 'shared-iterations', // para realizar iteraciones sin indicar el tiempo
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        }
    },
    thresholds: {
        checks: ["rate==1.0"]
    }
}

export default async function () {
    const page = browser.newPage();
    try {

        // iniciar sesión
        await page.goto('http://localhost:4200/');

        page.locator('input[name="nombre"]').type('Medico1');
        page.locator('input[name="DNI"]').type('11111111X');

        const submitButton = page.locator('button[name="login"]');
        await Promise.all([
            page.waitForNavigation(),
            submitButton.click()
        ]);

        check(page, {
            'header': p => p.locator('h2').textContent() == 'Listado de pacientes',
        });

        page.waitForSelector('button[name="add"]');

        const createButton = page.locator('button[name=add]');
        await Promise.all([
            page.waitForNavigation(),
            createButton.click()
        ]);

        await page.waitForSelector('mat-card');

        check(page, {
            'Estamos en la página de añadir paciente': p => p.locator('mat-card-title div').textContent().includes('Añadir un nuevo paciente')
        });

        let dni = Math.floor(Math.random() * 12345);
        page.locator('input[name="dni"]').type(dni.toString() + "X");
        page.locator('input[name="nombre"]').type("Prueba3");
        page.locator('input[name="edad"]').type(70);
        page.locator('input[name="cita"]').type("6");

        page.waitForSelector('button[type="submit"]');
        const submitButton2 = page.locator('button[type="submit"]');

        await Promise.all([
            page.waitForNavigation(),
            submitButton2.click()
        ]);

        page.waitForSelector("table tbody");

        check(page, {
            'header': p => p.locator('h2').textContent() == 'Listado de pacientes',
        });

        const rows = page.evaluate(() => {
            const trs = document.querySelectorAll("table tbody tr");
            return Array.from(trs).map(tr => tr.querySelector('td[name="dni"]').textContent);
        });

        const lastRowDni = rows[rows.length - 1];
        check(page, {
            'Paciente creado tiene el mismo DNI': () => lastRowDni.includes(dni),
        });

    } finally {
        page.close();
    }
}