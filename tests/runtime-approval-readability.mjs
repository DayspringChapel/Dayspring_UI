// Local fixtures only; no production account, upload or approval is changed.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.DAYSPRING_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.DAYSPRING_SMOKE_ORIGIN;
if(!origin||!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw new Error('Use a local frontend.');
const browser=await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM?{executablePath:process.env.DAYSPRING_CHROMIUM}:{})});
const contrast=(a,b)=>{const L=value=>{const n=value.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return n[0]*.2126+n[1]*.7152+n[2]*.0722;};return(Math.max(L(a),L(b))+.05)/(Math.min(L(a),L(b))+.05);};
try{
    for(const role of ['churchAdmin','superAdmin'])for(const configured of [false,true]){
        const width=configured?390:1280,context=await browser.newContext({viewport:{width,height:1000},colorScheme:'dark',reducedMotion:'reduce'});let pending=role==='superAdmin'?3:1,required=true;
        await context.addInitScript(()=>{const get=Storage.prototype.getItem;Storage.prototype.getItem=function(key){return key.startsWith('dayspring_tour_seen_')?'1':get.call(this,key);};const media=window.matchMedia.bind(window);window.matchMedia=query=>query==='(display-mode: standalone)'?{matches:true,media:query,addEventListener(){},removeEventListener(){}}:media(query);});
        await context.route('**/*',route=>{
            const url=new URL(route.request().url()),json=value=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
            if(url.origin!==origin)return route.abort();
            if(url.pathname==='/api/auth/session')return json({id:'staff',userName:'Staff',role,legacyChurch:true,permissions:['CanApproveAsAdmin',...(role==='superAdmin'?['CanApproveAsSuperAdmin']:[]),'CanReviewContent','CanUploadContent','CanSubmitContent','CanViewMediaData'],access:configured?{configured:true,resources:['dashboard','media'],widgets:[]}:{configured:false}});
            if(url.pathname==='/api/auth/session/activity')return route.fulfill({status:204});
            if(url.pathname.endsWith('/Approvals/queue/admin'))return json({status:true,data:pending?[{id:'one',contentId:'one',contentTitle:'YouTube submission',level:0,levelName:'Admin',status:0}]:[]});
            if(url.pathname.endsWith('/Approvals/queue/super-admin'))return json({status:true,data:Array.from({length:pending},(_,i)=>({id:i===0?'one':`item${i}`,contentId:i===0?'one':`item${i}`,contentTitle:`Video ${i}`,level:1,status:0}))});
            if(url.pathname.endsWith('/access/dashboard'))return json({cards:[],resources:[]});
            if(url.pathname.endsWith('/MediaContent/workflow-settings')){if(route.request().method()==='PUT')required=route.request().postDataJSON().approvalRequired;return json({approvalRequired:required,message:'Policy saved'});}
            if(url.pathname.startsWith('/api/'))return json([]);return route.continue();
        });
        const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto(`${origin}/admin/dashboard`);
        await page.getByRole('heading',{name:'Welcome, Staff',exact:true}).waitFor();
        const card=configured?page.getByRole('article',{name:'Pending media approvals'}):page.getByRole('article').filter({has:page.getByText('Pending Approvals',{exact:true})});
        await card.getByText(String(pending),{exact:true}).waitFor();
        if(!configured){const label=card.getByText('Pending Approvals',{exact:true});const pair=await label.evaluate(el=>{const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');const rgb=value=>{ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return `rgb(${[...ctx.getImageData(0,0,1,1).data].slice(0,3).join(',')})`;};return{ink:rgb(getComputedStyle(el).color),paper:rgb(getComputedStyle(el.closest('article')).backgroundColor)};});assert.ok(contrast(pair.ink,pair.paper)>=4.5);}
        pending=0;await page.evaluate(()=>window.dispatchEvent(new Event('dayspring:workflow-changed')));await card.getByText('0',{exact:true}).waitFor();
        await page.goto(`${origin}/admin/workflow`);const policy=page.getByLabel('Media approval policy');await policy.getByRole('button',{name:'Disable approval for new submissions',exact:true}).waitFor();await policy.getByRole('button',{name:'Disable approval for new submissions',exact:true}).click();await policy.getByRole('button',{name:'Require approval for new submissions',exact:true}).waitFor();
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);await context.close();
    }
    {
        const context=await browser.newContext({viewport:{width:390,height:1000}});let submitted=false;
        await context.route('**/*',route=>{const url=new URL(route.request().url()),json=value=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});if(url.origin!==origin)return route.abort();if(url.pathname==='/api/auth/session')return json({id:'media',userName:'Media',role:'churchMedia',legacyChurch:true,permissions:['CanUploadContent','CanSubmitContent','CanViewMediaData','CanReviewContent']});if(url.pathname.endsWith('/MediaContent/upload')){assert.match(route.request().postData(),/name="saveAsDraft"\r\n\r\nfalse/);submitted=true;return json({status:true,data:{id:'video',workflowStatus:5}});}if(url.pathname.startsWith('/api/'))return json([]);return route.continue();});
        const page=await context.newPage();await page.goto(`${origin}/admin/media/create`);await page.locator('select[name="category"]').selectOption('3');await page.locator('input[name="title"]').fill('Sunday video');await page.locator('textarea[name="description"]').fill('Training recording');await page.locator('input[name="youtubeUrl"]').fill('https://youtu.be/abcdefghijk');await page.getByRole('button',{name:'Upload & submit',exact:true}).click();await page.waitForURL('**/admin/media');assert.equal(submitted,true);await context.close();
    }
    console.log('PASS: pending counts and live refresh for standard/configured staff dashboards, PWA/mobile layout, readable statistic text, protected policy controls, and YouTube upload submission.');
}finally{await browser.close();}
