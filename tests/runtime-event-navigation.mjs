import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.DAYSPRING_PLAYWRIGHT_MODULE||'playwright');
const origin='http://localhost:3000';
const browser=await chromium.launch({headless:true,executablePath:process.env.DAYSPRING_CHROMIUM});
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:{width:mobile?390:1280,height:900},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  const events=[{id:'upcoming',heading:'Thanksgiving service',description:'Join us for thanksgiving.',isPublished:true,eventDate:new Date(Date.now()+3*86400000).toISOString()}];
  await context.route('**/api/**',route=>{const path=new URL(route.request().url()).pathname;return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(path.endsWith('/Events')?events:path==='/api/livestream'?{youtube:{active:false}}:[])});});
  const page=await context.newPage();page.setDefaultTimeout(60000);await page.goto(origin);
  if(mobile)await page.getByRole('button',{name:'Open mobile menu'}).click();
  const nav=page.getByRole('navigation',{name:mobile?'Mobile navigation':'Primary navigation'});
  const link=nav.getByRole('link',{name:'Events',exact:true});await nav.getByRole('button',{name:'Upcoming event details'}).waitFor();
  assert.equal(await link.evaluate(el=>getComputedStyle(el).color),'rgb(255, 80, 94)');
  if(mobile)await nav.getByRole('button',{name:'Upcoming event details'}).tap();else await link.hover();
  await nav.getByText('Thanksgiving service',{exact:true}).waitFor({state:'visible'});
  const countdown=nav.getByLabel('Event countdown');const before=await countdown.textContent();await page.waitForTimeout(1200);assert.notEqual(await countdown.textContent(),before);
  assert.match(await nav.locator('time').textContent(),/WAT/);
  assert.equal(await nav.getByRole('link',{name:'View event'}).getAttribute('href'),'/content/event/upcoming');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(!mobile){await link.focus();await page.keyboard.press('Escape');assert.equal(await nav.getByText('Thanksgiving service',{exact:true}).count(),0);}
  events[0].eventDate=new Date(Date.now()+9*86400000).toISOString();await page.reload();
  if(mobile)await page.getByRole('button',{name:'Open mobile menu'}).click();
  await page.waitForTimeout(600);assert.equal(await nav.getByRole('button',{name:'Upcoming event details'}).count(),0);
  await context.close();
 }
 console.log('PASS: published event red alert, desktop hover/keyboard dismissal, ticking countdown/date, mobile tap and no alert outside seven days.');
}finally{await browser.close();}
