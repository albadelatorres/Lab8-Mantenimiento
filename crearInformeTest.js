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
    const page = browser.newPage();

    try {

        await page.goto('http://localhost:4200/');

        check(page, {
            'Botón Predecir presente': p => p.locator('button[name="predict"]').isVisible(),
        });
    
        if (await page.locator('button[name="predict"]').isVisible()) {
            await page.locator('button[name="predict"]').click();

            await sleep(1);
        }

        check(page, {
            'Texto Probabilidad de cáncer presente': async p => {
                const spanText = await p.locator('div.result span').textContent();
                return spanText.includes('Probabilidad de cáncer:');
            }
        });
    
        check(page, {
            'Campo Informe médico presente': p => p.locator('textarea[matInput]').isVisible(),
        });
    
        check(page, {
            'Botón Guardar presente': p => p.locator('button[name="save"]').isVisible(),
        });

    } finally {
        page.close();
    }
}