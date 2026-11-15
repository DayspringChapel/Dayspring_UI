// Synthetic provider reports only. No real platform credentials, posts or messages.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.DAYSPRING_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.DAYSPRING_SMOKE_ORIGIN;
if(!origin||!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw new Error('Use a local frontend.');
const points=[{time:'2026-11-12T00:00:00Z',value:10},{time:'2026-11-13T00:00:00Z',value:12},{time:'2026-11-15T00:00:00Z',value:17}];
const publishing={published:2,failedAttempts:1,queued:3,period:'Last 28 days including today',timeline:[{time:'2026-11-14T00:00:00Z',published:1,failed:0},{time:'2026-11-15T00:00:00Z',published:1,failed:1}]};
const accounts=['youtube','facebook','instagram','x','whatsapp'].map((platform,index)=>({account:{platform,accountKey:platform,name:index===0?'Dayspring test channel':platform,status:['Connected','Partial','Stale','PermissionRequired','SetupRequired'][index],message:'Account access guidance',portalUrl:'https://studio.youtube.com/',observedAt:index<3?'2026-11-15T09:00:00Z':null,metrics:index<3?[{key:'followers',label:'Subscribers',value:17,unit:'count',period:'Current',description:'Current platform count'},{key:'views',label:'Channel views',value:null,unit:'count',period:'Lifetime',description:'Not returned'}]:[],series:index<3?[{key:'followers',label:'Daily subscribers',unit:'count',description:'Daily account history',points}]:[],posts:index<3?[{title:'Sunday service',url:'https://www.youtube.com/watch?v=abcdefghijk',publishedAt:'2026-11-14T00:00:00Z',views:null,likes:0,comments:2,shares:null}]:[],notes:index===1?['Additional read permission is needed.']:[]},publishing}));
const browser=await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM?{executablePath:process.env.DAYSPRING_CHROMIUM}:{})});
try{
    for(const role of ['churchAdmin','churchMedia','superAdmin']){
        const width=role==='churchMedia'?390:1280,context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true}),errors=[];let syncs=0;
        await context.addInitScript(()=>{const get=Storage.prototype.getItem;Storage.prototype.getItem=function(key){return key.startsWith('dayspring_tour_seen_')?'1':get.call(this,key);};});
        await context.route('**/*',route=>{
            const url=new URL(route.request().url()),json=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
            if(url.origin!==origin)return route.abort();
            if(url.pathname==='/api/auth/session')return json({id:'fixture',userName:'Staff',role,permissions:['CanViewReports'],legacyChurch:true,access:{configured:true,resources:['reports'],widgets:[]}});
            if(url.pathname==='/api/auth/session/activity')return route.fulfill({status:204});
            if(url.pathname.startsWith('/api/')&&url.pathname.endsWith('/social-analytics/sync')){syncs++;return json({accounts,checkedAt:'2026-11-15T09:00:00Z',cacheMinutes:10});}
            if(url.pathname.startsWith('/api/')&&url.pathname.endsWith('/social-analytics'))return json({accounts,checkedAt:'2026-11-15T09:00:00Z',cacheMinutes:10});
            if(url.pathname.startsWith('/api/'))return json([]);return route.continue();
        });
        const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(`${origin}/admin/social-analytics`);
        try{await page.getByRole('heading',{name:'Dayspring test channel',exact:true}).waitFor();}catch(error){console.log(await page.locator('body').innerText());console.log(errors);await page.screenshot({path:'../.tmp/social-analytics-failure.png',fullPage:true});throw error;}
        const chart=page.getByRole('img',{name:'Daily subscribers',exact:true});assert.equal(await chart.locator('polyline').count(),2,'Missing day must leave a gap');
        if(role==='superAdmin')await page.screenshot({path:'../.tmp/social-analytics-youtube.png'});
        await chart.scrollIntoViewIfNeeded();await chart.screenshot({path:`../.tmp/social-chart-${width}.png`});
        await chart.focus();await page.keyboard.press('End');await page.getByText('17',{exact:true}).first().waitFor();
        assert.equal(await page.getByText('—',{exact:true}).count(),3,'Unavailable metric/post values remain unknown');
        const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export account CSV',exact:true}).click();assert.equal((await downloadPromise).suggestedFilename(),'dayspring-youtube-analytics.csv');
        await page.getByRole('button',{name:'Sync social accounts',exact:true}).click();await page.getByRole('button',{name:'Sync social accounts',exact:true}).waitFor();assert.equal(syncs,1);
        const group=page.getByRole('group',{name:'Social accounts',exact:true});
        await group.getByRole('button',{name:/Facebook/}).click();await page.getByText('Additional read permission is needed.',{exact:true}).waitFor();
        await group.getByRole('button',{name:/Instagram/}).click();await page.getByText('Saved data · sync needed',{exact:true}).first().waitFor();
        await group.getByRole('button',{name:/X Read access needed/}).click();await page.getByRole('heading',{name:'Connect this account to see native reports'}).waitFor();
        await group.getByRole('button',{name:/WhatsApp/}).click();await page.getByText('No daily history is available yet. Missing data is left blank rather than shown as zero.',{exact:true}).waitFor();
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow at ${width}`);assert.deepEqual(errors,[]);
        if(role==='superAdmin')await page.screenshot({path:'../.tmp/social-analytics-desktop.png'});
        await context.close();
    }
    console.log('PASS: social analytics staff access, account switching, missing values, line gaps, keyboard chart inspection, CSV, sync, setup guidance and mobile layout.');
}finally{await browser.close();}
