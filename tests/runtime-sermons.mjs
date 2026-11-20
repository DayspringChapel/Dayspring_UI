import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.DAYSPRING_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.DAYSPRING_SMOKE_ORIGIN||'http://localhost:3000';
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw new Error('Local frontend only');
const sermons=[1,6,3,2,5,4,7].map(day=>({sermonId:`sermon-${day}`,title:`Message ${day}`,preacher:'Pastor Test',sermonDate:`2026-11-0${day}`,sermonType:2,youtubeUrl:'https://youtu.be/abcdefghijk'}));
const browser=await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM?{executablePath:process.env.DAYSPRING_CHROMIUM}:{})});
try {
    for(const width of [390,1280]){
        const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
        await context.route('**/api/**',route=>{
            const path=new URL(route.request().url()).pathname;
            return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(path.endsWith('/Sermons')?sermons:path==='/api/livestream'?{youtube:{active:false}}:[])});
        });
        const page=await context.newPage();page.setDefaultTimeout(60000);
        await page.goto(origin);const section=page.locator('#sermons');await section.locator('article').first().waitFor();
        assert.deepEqual(await section.locator('article h3').allTextContents(),[7,6,5,4,3].map(day=>`Message ${day}`));
        assert.equal(await section.locator('a').getAttribute('href'),'/library'); await section.scrollIntoViewIfNeeded(); await section.screenshot({path:`../.tmp/sermons-${width}.png`});
        assert.equal(await section.locator('iframe').count(),0);
        await section.getByRole('button',{name:/Watch message.*Message 7/}).click();await section.getByTitle('Message 7',{exact:true}).waitFor();
        await section.getByRole('button',{name:/Close player.*Message 7/}).click();assert.equal(await section.locator('iframe').count(),0);
        assert.equal(await section.evaluate(el=>el.scrollWidth>el.clientWidth),false);
        await page.goto(`${origin}/library`);await section.locator('article').first().waitFor();
        assert.deepEqual(await section.locator('article h3').allTextContents(),[7,6,5,4,3,2,1].map(day=>`Message ${day}`));
        assert.equal(await section.locator('a[href="/library"]').count(),0);
        await context.close();
    }
    console.log('PASS: homepage five newest, full library date order, See more destination, on-demand playback, mobile and desktop layouts.');
}finally{await browser.close();}
