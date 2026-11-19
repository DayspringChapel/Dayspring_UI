// Local fixtures only: no upload, provider credentials, or real broadcast.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {stat} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.DAYSPRING_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.DAYSPRING_SMOKE_ORIGIN;
if(!origin||!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw new Error('Use the local frontend with BACKEND_API_URL=http://127.0.0.1:5310.');
const photo='https://res.cloudinary.com/synthetic/image/upload/v123/gallery/photo.jpg';
const event={id:'b4148a0e-0ee4-46ef-8ccf-d54dd8f9e4ba',heading:'Community service',description:'Join us',eventDate:new Date(Date.now()+3*86400000).toISOString(),eventImageUrl:photo,isPublished:true,videos:[{id:'clip',title:'Service trailer',purpose:'Trailer',youtubeUrl:'https://youtu.be/abcdefghijk'}]};
const backend=createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(req.url.includes('/Events/')?event:req.url.startsWith('/api/v1/Events')?[event]:[]));});
await new Promise(resolve=>backend.listen(5310,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM?{executablePath:process.env.DAYSPRING_CHROMIUM}:{})});
const pixel=Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64');
try{
    for(const {width,saveData,reduce} of [{width:390,saveData:false,reduce:false},{width:1280,saveData:false,reduce:false},{width:390,saveData:true,reduce:false},{width:1280,saveData:false,reduce:true}]){
        const context=await browser.newContext({viewport:{width,height:900},reducedMotion:reduce?'reduce':'no-preference'});const requests=[],errors=[];
        if(saveData)await context.addInitScript(()=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true,effectiveType:'4g'}}));
        await context.route('**/*',route=>{
            const url=new URL(route.request().url());requests.push(url.href);const json=value=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
            if(url.hostname==='res.cloudinary.com')return route.fulfill({status:200,contentType:'image/gif',body:pixel});
            if(url.origin!==origin)return route.abort();
            if(url.pathname.endsWith('/site-settings/hero'))return json({mode:0,items:[]});
            if(url.pathname.endsWith('/Albums'))return json([{id:'album',title:'Community',images:[{id:'photo',url:photo}]}]);
            if(url.pathname==='/api/livestream')return json({youtube:{active:false,url:''}});
            if(url.pathname.startsWith('/api/'))return json([]);
            if(/\.mp4$/.test(url.pathname))return route.abort();
            if(url.pathname==='/_next/image'&&url.searchParams.get('url')?.startsWith('https://'))return route.fulfill({status:200,contentType:'image/gif',body:pixel});
            return route.continue();
        });
        const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto(origin);
        await page.getByRole('heading',{name:'DISCOVER PURPOSE',exact:true}).waitFor();
        if(saveData||reduce){await page.waitForTimeout(1800);assert.equal(await page.locator('video').count(),0);assert.equal(requests.filter(url=>/home-hero-.*\.mp4$/.test(url)).length,0);}
        else{await page.waitForFunction(()=>document.querySelector('video')?.getAttribute('src'));assert.equal(await page.locator('video').count(),1);assert.ok((await page.locator('video').getAttribute('src')).endsWith(width<768?'home-hero-mobile.mp4':'home-hero-desktop.mp4'));}
        assert.equal(requests.some(url=>/home-hero-vid/.test(url)),false,'Original desktop/mobile videos must not be requested');
        const picture=page.getByAltText('Community photo 1');await picture.scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.images].some(image=>image.alt==='Community photo 1'&&image.complete));
        const source=await picture.getAttribute('srcset');assert.match(source,/c_limit,w_/);assert.match(source,/q_auto:good\/f_auto/);assert.equal(await picture.getAttribute('sizes'),'(max-width: 767px) 100vw, 33vw');
        if(!saveData&&!reduce){
            await page.goto(`${origin}/content/event/${event.id}`);await page.getByRole('heading',{name:'Event videos',exact:true}).waitFor();assert.equal(await page.locator('iframe[src*="youtube-nocookie"]').count(),0);
            const play=page.getByRole('button',{name:'Play Service trailer',exact:true});await play.scrollIntoViewIfNeeded();assert.equal(await page.locator('iframe[src*="youtube-nocookie"]').count(),0);await play.click();await page.getByTitle('Service trailer', {exact:true}).waitFor();
        }
        assert.deepEqual(errors,[]);await context.close();
    }
    const response=await fetch(`${origin}/_next/image?url=%2Flibrary-hero-sm.png&w=640&q=75`,{headers:{Accept:'image/webp'}});assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^image\/webp/);
    const bytes=(await response.arrayBuffer()).byteLength,original=(await stat('public/library-hero-sm.png')).size;assert.ok(bytes<original/2);console.log(`Optimised local image: ${original} → ${bytes} bytes (${Math.round((1-bytes/original)*100)}% smaller).`);
    console.log('PASS: one matching hero video, no video in reduced-motion/data-saving mode, responsive Cloudinary photos, deferred YouTube player and working local image optimisation.');
}finally{await browser.close();await new Promise(resolve=>backend.close(resolve));}
