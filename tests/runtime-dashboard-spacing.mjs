import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['localhost','127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Use a local frontend only.');
const output = process.env.DAYSPRING_QA_OUTPUT; if (output) await mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM ? {executablePath:process.env.DAYSPRING_CHROMIUM} : {})});
try {
    for (const role of ['superAdmin','churchAdmin','churchMedia']) {
        const context = await browser.newContext({viewport:{width:1594,height:620},reducedMotion:'reduce'});
        await context.addInitScript(() => { const get=Storage.prototype.getItem; Storage.prototype.getItem=function(key) { return key.startsWith('dayspring_tour_seen_') ? '1' : get.call(this,key); }; });
        await context.route('**/*',route => {
            const url=new URL(route.request().url());
            const json=value => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
            if(url.pathname==='/api/auth/session/activity') return route.fulfill({status:204});
   if(url.pathname==='/api/auth/session') return json({id:'synthetic',userName:'Alex',role,permissions:[],legacyChurch:true});
            if(url.pathname.endsWith('/notifications/overview')) return json({forms:0,responses:0,issuedCertificates:0,pendingApprovals:0});
            if(url.pathname.startsWith('/api/backend/')) return json([]);
            if(url.origin!==origin) return route.abort();
            return route.continue();
        });
        const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
        await page.goto(`${origin}/admin/dashboard`); await page.getByRole('heading',{name:'Welcome, Alex'}).waitFor();
        for (const width of [320,390,768,1280,1594]) {
            await page.setViewportSize({width,height:620});
            await page.locator('[data-tour="hero"]').evaluate(async hero => { await Promise.all(hero.getAnimations().map(animation=>animation.finished.catch(()=>{}))); });
            await page.waitForTimeout(400);
            const gap=await page.locator('[data-tour="hero"]').evaluate(hero=>hero.getBoundingClientRect().top-document.querySelector('main').previousElementSibling.getBoundingClientRect().bottom);
            assert.ok(gap>=0 && gap<=36,`${role} at ${width}px has ${gap}px blank space`);
            console.log(`${role} ${width}px: ${gap}px gap`);
            assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
            if(output) await page.screenshot({path:path.join(output,`${role}-${width}.png`),fullPage:width!==1594});
        }
        assert.deepEqual(errors,[]);await context.close();
    }
    console.log('PASS: welcome cards follow the header with compact spacing across all three dashboard roles and five screen widths.');
} finally { await browser.close(); }
