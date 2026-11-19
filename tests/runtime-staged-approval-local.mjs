// Read-only checks of the isolated local app. Never run against a deployed URL.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.DAYSPRING_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.DAYSPRING_SMOKE_ORIGIN;
if(!origin||!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw new Error('Use the isolated local app.');
const credentials=JSON.parse(await readFile(process.env.DAYSPRING_LOCAL_ACCOUNT_FILE,'utf8')),fixture=JSON.parse(await readFile(process.env.DAYSPRING_LOCAL_WORKFLOW_FIXTURE,'utf8'));
const browser=await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM?{executablePath:process.env.DAYSPRING_CHROMIUM}:{})});
try{
    for(const role of ['admin','superadmin','media']){
        const context=await browser.newContext({viewport:{width:role==='media'?390:1280,height:1000},reducedMotion:'reduce'});
        context.setDefaultTimeout(60000);
        await context.addInitScript(()=>{const get=Storage.prototype.getItem;Storage.prototype.getItem=function(key){return key.startsWith('dayspring_tour_seen_')?'1':get.call(this,key);};});
        await context.route('**/*',route=>new URL(route.request().url()).origin!==origin?route.abort():route.continue());
        const response=await context.request.post(`${origin}/api/auth/session`,{headers:{Origin:origin},data:{userNameOrEmail:`${role}@dayspring.local`,password:credentials.password}});assert.equal(response.status(),200);
        const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
        if(role==='admin'){
            await page.goto(`${origin}/admin/dashboard`);await page.getByRole('link',{name:'Review publishable content →',exact:true}).click();try{await page.getByRole('heading',{name:'Local test — awaiting Admin review',exact:true}).waitFor();}catch(error){console.log(await page.locator('body').innerText());throw error;}
            await page.goto(`${origin}/admin/workflow`);await page.getByRole('heading',{name:'Awaiting your approval (1)',exact:true}).waitFor();assert.equal(await page.getByLabel('Media approval policy').count(),0);
            const denied=await context.request.put(`${origin}/api/backend/api/v1/MediaContent/workflow-settings`,{headers:{Origin:origin},data:{approvalRequired:false}});assert.equal(denied.status(),403);
            const audit=await context.request.get(`${origin}/api/backend/api/v1/Approvals/audit`);assert.equal(audit.status(),403);
        }else if(role==='superadmin'){
            await page.goto(`${origin}/admin/approvals`);await page.getByText('No pending approvals in this queue',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Admin Queue',exact:true}).count(),0);
            await page.getByRole('link',{name:'Audit earlier stages →',exact:true}).click();const row=page.getByRole('row').filter({hasText:'Local test — awaiting Admin review'});await row.getByRole('cell',{name:/Church Admin/}).waitFor();
        }else{
            await page.goto(`${origin}/admin/media/detail?id=${fixture.pending}`);const tracker=page.getByLabel('Approval progress');await tracker.getByText('Currently with Church Admin.',{exact:true}).waitFor();await tracker.locator('li[aria-current="step"]').getByText('Church Admin',{exact:true}).waitFor();
            const publishing=page.locator('aside button').filter({has:page.getByText('Publishing',{exact:true})});assert.equal((await publishing.locator('[class*="navBadge"]').textContent()).trim(),'1');
            assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await tracker.screenshot({path:'../.tmp/staged-tracker-mobile.png'});
            await page.goto(`${origin}/admin/publishing`);await page.getByRole('heading',{name:'Local test — ready to publish',exact:true}).waitFor();
        }
        assert.deepEqual(errors,[]);await context.close();
    }
    console.log('PASS: real local Admin queue and dashboard link, Superadmin-only policy/audit, strict final-stage queue, creator tracker, publishing badge, mobile layout and ready-to-publish item.');
}finally{await browser.close();}
