// Synthetic data only: no viewer is added to a real broadcast and no message is sent to YouTube.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.DAYSPRING_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.DAYSPRING_SMOKE_ORIGIN;
if(!origin||!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw new Error('Use a local frontend.');
const browser=await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM?{executablePath:process.env.DAYSPRING_CHROMIUM}:{})});
const id='abcdefghijk',key=`youtube:${id}`;
const summary={key,title:'Sunday service',platform:'youtube',sourceUrl:`https://youtu.be/${id}`,firstObservedAt:'2026-11-15T09:00:00Z',lastObservedAt:'2026-11-15T09:10:00Z',isLive:true,visits:12,visitors:10,views:8,uniqueViewers:7,watchSeconds:1200,averageWatchSeconds:1200/7,concurrent:3,peakConcurrent:5,playerErrors:1};
const report={summary,intervalMinutes:1,timeline:[{time:'2026-11-15T09:00:00Z',visits:4,views:2,concurrent:2,watchSeconds:120},{time:'2026-11-15T09:01:00Z',visits:8,views:6,concurrent:5,watchSeconds:1080}],devices:[{label:'mobile',count:8},{label:'desktop',count:4}],referrers:[{label:'direct',count:12}],comments:[{source:'Website',count:4},{source:'YouTube',count:6}],reactions:[{kind:'amen',count:3}],updatedAt:'2026-11-15T09:11:00Z'};
const playerScript=`window.YT={Player:class{constructor(frame,options){this.frame=frame;this.state=-1;window.__setPlayback=value=>{this.state=value;options.events.onStateChange({data:value,target:this});};window.__playerError=()=>options.events.onError();options.events.onReady({target:this});}getPlayerState(){return this.state;}destroy(){this.frame.remove();}}};window.onYouTubeIframeAPIReady?.();`;
try{
    for(const width of [390,1280]){
        const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});let views=0,watching=0;const beats=[],errors=[];
        await context.route('**/*',async route=>{
            const url=new URL(route.request().url()),json=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
            if(url.href==='https://www.youtube.com/iframe_api')return route.fulfill({status:200,contentType:'application/javascript',body:playerScript});
            if(url.origin!==origin)return route.abort();
            if(url.pathname==='/api/livestream')return json({youtube:{active:true,url:`https://youtu.be/${id}`}});
            if(url.pathname==='/api/live-analytics/heartbeat'){
                const body=route.request().postDataJSON();beats.push(body);watching=body.state==='playing'?1:0;if(watching)views=1;
                return json({watching,views,pageVisits:1,playbackMeasured:true});
            }
            if(url.pathname==='/api/live-analytics/current')return json({watching,views,pageVisits:1,playbackMeasured:true});
            if(url.pathname===`/api/live-engagement/${id}/comments`)return json({comments:[{id:'web',videoId:id,source:'Website',authorName:'Anonymous1',text:'A website message',postedAt:'2026-11-15T09:00:00Z'},{id:'yt',videoId:id,source:'YouTube',authorName:'Grace',text:'A YouTube message',postedAt:'2026-11-15T09:00:01Z'}],sharingState:'Connected',anonymousName:'Anonymous1'});
            if(url.pathname===`/api/live-engagement/${id}`)return json({counts:{like:0,heart:0,amen:0,clap:0,joy:0},mine:[]});
            if(url.pathname.startsWith('/api/'))return json([]);return route.continue();
        });
        const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(`${origin}/live`);
        await page.getByText('Join our services',{exact:true}).waitFor();
        await page.getByRole('heading',{name:/^Live chat/}).waitFor();
        await page.getByText('A website message',{exact:true}).waitFor();await page.getByText('A YouTube message',{exact:true}).waitFor();
        const counters=page.getByLabel('Website livestream audience');await counters.getByText('0 website views',{exact:true}).waitFor();
        assert.equal(beats.some(value=>value.state==='playing'),false);
        const frame=page.getByTitle('YouTube Live Stream',{exact:true});const embed=new URL(await frame.getAttribute('src'));assert.equal(embed.searchParams.get('autoplay'),'0');assert.equal(embed.searchParams.get('enablejsapi'),'1');
        await page.waitForFunction(()=>typeof window.__setPlayback==='function');await page.evaluate(()=>window.__setPlayback(1));
        await counters.getByText('1 watching here',{exact:true}).waitFor();await counters.getByText('1 website views',{exact:true}).waitFor();
        await page.evaluate(()=>window.__setPlayback(2));await counters.getByText('0 watching here',{exact:true}).waitFor();assert.equal(views,1);
        await page.evaluate(()=>window.__playerError());await page.waitForFunction(()=>true);assert.equal(await frame.count(),1);
        assert.equal(await page.locator('link[rel="icon"]').getAttribute('href'),'/icons/icon-192.png');
        if(width===390){await page.getByRole('button',{name:'Open mobile menu',exact:true}).click();assert.equal(await page.getByRole('link',{name:'Admin sign in'}).getAttribute('href'),'/admin/login');}
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);await context.close();
    }
    {
        const context=await browser.newContext();let heartbeats=0;
        await context.addInitScript(()=>Object.defineProperty(navigator,'globalPrivacyControl',{configurable:true,value:true}));
        await context.route('**/*',route=>{
            const url=new URL(route.request().url()),json=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
            if(url.href==='https://www.youtube.com/iframe_api')return route.fulfill({status:200,contentType:'application/javascript',body:playerScript});
            if(url.origin!==origin)return route.abort();
            if(url.pathname==='/api/livestream')return json({youtube:{active:true,url:`https://youtu.be/${id}`}});
            if(url.pathname==='/api/live-analytics/heartbeat')heartbeats++;
            if(url.pathname==='/api/live-analytics/current')return json({watching:0,views:0,pageVisits:0,playbackMeasured:true});
            if(url.pathname.endsWith('/comments'))return json({comments:[],sharingState:'Connected'});
            if(url.pathname.startsWith('/api/'))return json({counts:{},mine:[]});return route.continue();
        });
        const page=await context.newPage();await page.goto(`${origin}/live`);await page.waitForFunction(()=>typeof window.__setPlayback==='function');await page.evaluate(()=>window.__setPlayback(1));await page.waitForTimeout(100);assert.equal(heartbeats,0);await context.close();
    }
    for(const role of ['churchAdmin','churchMedia','superAdmin']){
        const context=await browser.newContext({viewport:{width:role==='churchMedia'?390:1280,height:1000},acceptDownloads:true});const page=await context.newPage(),errors=[];
        await context.addInitScript(()=>{const get=Storage.prototype.getItem;Storage.prototype.getItem=function(key){return key.startsWith('dayspring_tour_seen_')?'1':get.call(this,key);};});
        await context.route('**/*',route=>{
            const url=new URL(route.request().url()),json=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
            if(url.origin!==origin)return route.abort();
            if(url.pathname==='/api/auth/session')return json({id:'fixture',userName:'Staff',role,permissions:['CanViewReports'],legacyChurch:true,access:{configured:true,resources:['reports'],widgets:[]}});
            if(url.pathname==='/api/auth/session/activity')return route.fulfill({status:204});
            if(url.pathname.endsWith('/live-analytics/streams'))return json({items:[summary],total:1,page:1,pageSize:20});
            if(url.pathname.includes('/live-analytics/streams/'))return json(report);
            if(url.pathname.startsWith('/api/'))return json([]);return route.continue();
        });
        page.on('pageerror',e=>errors.push(e.message));await page.goto(`${origin}/admin/live-analytics`);
        await page.getByRole('heading',{name:'Livestream analytics',exact:true}).waitFor();await page.getByRole('heading',{name:'Audience over time'}).waitFor();
        assert.equal(await page.getByRole('img',{name:'Concurrent website viewers',exact:true}).count(),1);
        const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export CSV',exact:true}).click();const download=await downloadPromise;assert.match(download.suggestedFilename(),/^dayspring-live-youtube-/);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Admin overflow: ${role}`);assert.deepEqual(errors,[]);await context.close();
    }
    console.log('PASS: native playback counters, visit/view separation, pause/error handling, unified live chat, church favicon, PWA admin entry, report access for all three staff roles, charts, CSV and responsive layouts.');
}finally{await browser.close();}
