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
export default async function(){
    const page = context.newPage();

    try {

        // acceder a la web
        await page.goto('http://localhost:4200/',{ waitUntil: 'networkidle' });

        check(page, {
            'Paciente nombre presente': p => p.locator('h1').textContent() == ('Paciente: Juan'),
        });

        check(page, {
            'Botón Predecir presente': p => p.locator('button[name="predict"]').exists(),
        });

        check(page, {
            'Botón Añadir informe presente': p => p.locator('button[name="add"]').exists(),
        });

        const submitButton = page.locator('button[name="predict"]');
        await Promise.all([
            page.waitForNavigation(),
            submitButton.click()
        ]);

        check(page, {
            'La prediccion se ha realizado correctamente': p => p.locator('span').textContent() == 'Probabilidad de cáncer:',
        });

        const addButton = page.locator('button[name="add"]');
        await Promise.all([
            page.waitForNavigation(),
            addButton.click()
        ]);

        check(page, {
            'nos redirige a crear informe': p => p.locator('mat-label').textContent() == 'Informe médico',
        });

    } finally {
        page.close();
    }
}