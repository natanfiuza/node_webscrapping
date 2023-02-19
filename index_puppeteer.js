const pup = require('puppeteer');

const url = 'http://www.mercadolivre.com.br/';
const searchFor = 'dell inspiron';
let c = 1;
const list = [];
(async () => {
    const browser = await pup.launch({headless: true});
    const page = await browser.newPage();
    console.log('Starting');
    await page.goto(url);

    await page.waitForSelector('#cb1-edit');

    await page.type('#cb1-edit',searchFor);

    await Promise.all([
        page.waitForNavigation(),
        page.click('.nav-search-btn')
    ]);

 

    const links = await page.$$eval('.ui-search-result__image > a',el => el.map(link => link.href)); // Eval com $$ para pegar todos os elementos

    for(const link of links) {
        console.log('Page:',c);
        await page.goto(link);
        await page.waitForSelector('.ui-pdp-title');

        // const title = await page.$eval('.ui-pdp-title',element => element.innerText); // Eval com um $ paga apenas o primeiro elemento
        const title = await page.evaluate(() => { // Verifica caso nao exista
            const el = document.querySelector(".ui-pdp-title");
            if(!el) return null;
            return el.innerText;
        });
        // const price = await page.$eval('.andes-money-amount__fraction',element => element.innerText); 
        const price = await page.evaluate(() => { // Verifica caso nao exista
          const el = document.querySelector(".andes-money-amount__fraction");
          if (!el) return null;
          return el.innerText;
        });

        const seller = await page.evaluate(() => { // Verifica caso nao exista
            const el = document.querySelector('.ui-pdp-seller__link-trigger');
            if(!el) return null;
            return el.innerText;

        });
        const obj = {'number': c,'title': title,'price': price, 'seller': seller ?? 'Não encontrado','link': link};

        title!== null ? list.push(obj): null;

        c++;
    }
    console.log(list);

    await page.waitForTimeout(3000);
    await browser.close();
})();