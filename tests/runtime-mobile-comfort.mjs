// Local fixtures only: no install, chat message or provider action is performed.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['localhost','127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Use a local frontend.');
const browser = await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM ? {executablePath:process.env.DAYSPRING_CHROMIUM} : {})});
try {
    const context = await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/*',route=>{
        const url=new URL(route.request().url());
        if(url.origin!==origin) return route.abort();
        if(url.pathname.startsWith('/api/')) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(url.pathname==='/api/livestream' ? {} : [])});
        return route.continue();
    });
    const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${origin}/live`);
    await page.getByRole('button',{name:'Open chat',exact:true}).waitFor();
    const menu=page.getByRole('button',{name:'Open mobile menu',exact:true});
    await menu.click(); const nav=page.getByRole('navigation',{name:'Mobile navigation'}); await nav.waitFor();
    const bounds=await nav.boundingBox(); assert.ok(bounds.width<390 && bounds.height<844*.75);
    assert.equal(await menu.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape'); await nav.waitFor({state:'hidden'});
    await menu.click(); await page.mouse.click(15,500); await nav.waitFor({state:'hidden'});
    const assistant=page.getByRole('button',{name:'Open chat',exact:true}); const before=await assistant.boundingBox();
    await page.mouse.move(before.x+28,before.y+28); await page.mouse.down(); await page.mouse.move(240,180,{steps:8}); await page.mouse.up();
    const after=await assistant.boundingBox(); assert.ok(Math.abs(after.y-before.y)>100); assert.equal(await page.getByText('DaySpring Assistant',{exact:true}).count(),0);
    await assistant.focus(); await page.keyboard.press('ArrowLeft');
    await page.mouse.move(380,400);
    await page.waitForFunction(()=>document.querySelector('button[aria-label="Open chat"]')?.style.transform === 'scale(1)');
    const keyboard=await assistant.boundingBox(); assert.ok(keyboard.x<after.x);
    await page.reload(); await assistant.waitFor();
    await page.waitForFunction(x=>Math.abs(document.querySelector('button[aria-label="Open chat"]')?.getBoundingClientRect().x-x)<4,keyboard.x);
    await page.clock.install();
    const installEvent=()=>page.evaluate(()=>{const event=new Event('beforeinstallprompt',{cancelable:true}); event.prompt=async()=>{}; event.userChoice=Promise.resolve({outcome:'accepted'}); window.dispatchEvent(event);});
    await installEvent(); await page.clock.runFor(21000);
    const prompt=page.getByRole('dialog',{name:'Install the DaySpring Chapel app'}); await prompt.waitFor();
    await prompt.getByRole('button',{name:'Install',exact:true}).click(); await prompt.waitFor({state:'hidden'});
    assert.equal(await page.evaluate(()=>localStorage.getItem('dayspring_app_installed')),'1');
    await page.reload(); await assistant.waitFor(); await installEvent(); await page.clock.runFor(21000);
    assert.equal(await prompt.count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.deepEqual(errors,[]); await context.close();
    console.log('PASS: compact menu, Escape/outside dismissal, draggable and keyboard-movable assistant, position persistence and no install reminder after installation.');
} finally {await browser.close();}
