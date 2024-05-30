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

        sleep(3);
        page.waitForSelector("table tbody");
        let firstRow = page.$$("table tbody tr")[0].$('td[name= "nombre"]');
        await Promise.all([
            page.waitForNavigation(), 
            firstRow.click()
        ]);

        sleep(3);
        page.waitForSelector("table tbody");
        let viewButton = page.$$("table tbody tr")[0].$('button[name="view"]');
        await Promise.all([
            page.waitForNavigation({waitUntil: 'networkidle'}),
            viewButton.click()
        ]);

        sleep(3);
        page.waitForSelector('button[name="predict"]');

        let predictButton = page.locator('button[name="predict"]')
        await Promise.all([
            page.waitForTimeout(3),
            predictButton.click()
        ]);

        sleep(3);
        check(page, {
            'Resultado de la predicción': p => p.$('span[name="predict"]').textContent().includes("Probabilidad de cáncer")
        });


    } finally {
        page.close();
    }
}