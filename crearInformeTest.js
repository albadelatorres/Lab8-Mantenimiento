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

        page.waitForSelector("table tbody");
        const firstRow = page.$$("table tbody tr")[0].$('td[name= "nombre"]');
        await Promise.all([
            page.waitForNavigation(),
            firstRow.click()
        ]);

        sleep(3);

        const viewButton = page.$$("table tbody tr")[0].$('button[name="view"]');
        await Promise.all([
            page.waitForNavigation(),
            viewButton.click()
        ]);

        sleep(3);

        page.waitForSelector('button[name="add"]');

        const addButton = page.locator('button[name="add"]');
        await Promise.all([
            page.waitForNavigation(),
            addButton.click()
        ]);

        page.waitForSelector("textarea")

        page.locator('textarea').type("Este es el informe médico");
        const saveButton = page.locator('button[name="save"]');
        await Promise.all([
            page.waitForNavigation(),
            saveButton.click()
        ]);
        
        page.waitForSelector('.info-value');

        // Si existe el título informe de la imagen, es que el informe se ha creado correctamente
        check(page, {
            'H1 del informe está presente': p => p.locator('h1[class="underline"]').textContent().includes("Informe de la imagen")
        });


    } finally {
        page.close();
    }
}
