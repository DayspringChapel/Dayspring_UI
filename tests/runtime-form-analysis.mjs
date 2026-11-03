import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin=process.env.DAYSPRING_SMOKE_ORIGIN;if(!origin || !['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw new Error('Use a local frontend only.');
const output=process.env.DAYSPRING_QA_OUTPUT;if(output)await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM ? {executablePath:process.env.DAYSPRING_CHROMIUM} : {})});
const id='cc000000-0000-4000-8000-000000000001';let count=5;const errors=[];
const user={id:'synthetic',userName:'Form manager',role:'Training coordinator',permissions:['forms.create','forms.edit','forms.publish','forms.responses.view','forms.analytics.view'],access:{configured:true,resources:['forms'],widgets:[]}};
const fields=[{key:'attend',label:'Will you attend?',type:'yesno'},{key:'topics',label:'Preferred topics',type:'multiselect',options:['Prayer','Study','Music']},{key:'quality',label:'Training feedback',type:'grid',options:['Disagree','Neutral','Agree'],rows:['Clear teaching','Useful content']},{key:'score',label:'Rate the session',type:'scale',minimum:1,maximum:5},{key:'notes',label:'Additional comments',type:'textarea'}];
const form={id,title:'Training feedback survey',description:'Question results',fieldsJson:JSON.stringify(fields),settingsJson:JSON.stringify({analysisEnabled:true,accessMode:'Public'}),createdBy:user.id,revision:1,isPublished:true,attachCertificate:false};
const row=(value,count,percentage)=>({value,count,percentage});
function analytics(){const base={eligible:count,answered:4,skipped:count-4,notApplicable:0,historical:false,revisions:[1],multipleSelections:false,rows:[],numbers:null};return {title:form.title,total:count,daily:[],weekly:[],monthly:[],statuses:[{status:'Submitted',count}],generatedAt:new Date().toISOString(),fields:[
 {...base,id:'attend',key:'attend',label:'Will you attend?',type:'yesno',distribution:[row('Yes',3,75),row('No',1,25)]},
 {...base,id:'topics',key:'topics',label:'Preferred topics',type:'multiselect',multipleSelections:true,distribution:[row('Prayer',4,100),row('Study',2,50),row('Music',0,0)]},
 {...base,id:'quality',key:'quality',label:'Training feedback',type:'grid',distribution:[],rows:[{label:'Clear teaching',answered:4,skipped:count-4,distribution:[row('Disagree',0,0),row('Neutral',1,25),row('Agree',3,75)]},{label:'Useful content',answered:4,skipped:count-4,distribution:[row('Disagree',1,25),row('Neutral',1,25),row('Agree',2,50)]}]},
 {...base,id:'score',key:'score',label:'Rate the session',type:'scale',numbers:{count:4,minimum:1,maximum:5,average:3.5,median:4},distribution:[row('1',1,25),row('2',0,0),row('3',1,25),row('4',0,0),row('5',2,50)]},
 {...base,id:'notes',key:'notes',label:'Additional comments',type:'textarea',distribution:[]}
]};}
const context=await browser.newContext({viewport:{width:1280,height:900}});await context.addInitScript(()=>{const get=Storage.prototype.getItem;Storage.prototype.getItem=function(key){return key.startsWith('dayspring_tour_seen_')?'1':get.call(this,key);};});
await context.route('**/*',route=>{const url=new URL(route.request().url());const json=value=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
 if(url.pathname==='/api/auth/session/activity') return route.fulfill({status:204});
   if(url.pathname==='/api/auth/session')return json(user);
 if(url.pathname.endsWith(`/forms/${id}/preview`))return json(form);
 if(url.pathname.endsWith(`/forms/${id}/stats`))return json({responses:count,confirmed:0,eligible:0,issued:0});
 if(url.pathname.endsWith(`/forms/${id}/analytics`))return json(analytics());
 if(url.pathname.endsWith(`/forms/${id}/submissions`))return json({items:[],total:count});
 if(url.pathname.startsWith('/api/backend/'))return json([]);
 if(url.origin!==origin)return route.abort();return route.continue();});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`${origin}/admin/forms/${id}`);const responses=page.getByRole('tab',{name:/Responses/});await responses.waitFor();await page.waitForFunction(()=>[...document.querySelectorAll('[role=tab]')].some(el=>el.textContent==='Responses5'));
 await page.getByRole('tab',{name:'Analysis',exact:true}).click();await page.getByRole('heading',{name:'Question analysis'}).waitFor();
 const yes=page.locator('article').filter({has:page.getByRole('heading',{name:'Will you attend?',exact:true})});assert.match(await yes.innerText(),/Yes\s+3\s+\(75%\)/);assert.match(await yes.innerText(),/No\s+1\s+\(25%\)/);
 const topics=page.locator('article').filter({has:page.getByRole('heading',{name:'Preferred topics',exact:true})});assert.match(await topics.innerText(),/Prayer\s+4\s+\(100%\)/);assert.match(await topics.innerText(),/Music\s+0\s+\(0%\)/);assert.match(await topics.innerText(),/more than 100%/);
 await page.getByRole('heading',{name:'Clear teaching',exact:true}).waitFor();await page.getByRole('heading',{name:'Useful content',exact:true}).waitFor();
 const score=page.locator('article').filter({has:page.getByRole('heading',{name:'Rate the session',exact:true})});assert.match(await score.innerText(),/Average\s+3.5/);assert.match(await score.innerText(),/Median\s+4/);
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});await page.waitForTimeout(400);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`No overflow at ${width}`);if(output)await page.screenshot({path:path.join(output,`analysis-${width}.png`),fullPage:true});}
 await page.getByLabel('Find a question').fill('attend');assert.equal(await page.locator('article').count(),1);await page.getByLabel('Find a question').fill('');
 count=6;await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await page.waitForFunction(()=>[...document.querySelectorAll('[role=tab]')].some(el=>el.textContent==='Responses6'));
 await page.getByRole('button',{name:'Refresh results'}).click();await page.waitForFunction(()=>document.body.innerText.includes('2 skipped'));await responses.click();await page.getByRole('heading',{name:'No responses here yet'}).waitFor();assert.match(await responses.innerText(),/Responses\s*6/);assert.deepEqual(errors,[]);
 console.log('PASS: question answer counts/percentages, zero options, multi-selection denominator notes, Likert rows, numeric scale summaries, question search, responsive charts and updating per-form response badge.');
}catch(e){if(output)await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});console.error((await page.locator('body').innerText()).slice(-2000));throw e;}finally{await browser.close();}
