import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
if (!origin || !['localhost','127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Use a local frontend only.');
const output = process.env.DAYSPRING_QA_OUTPUT; if (output) await mkdir(output, { recursive:true });
const permissions = ['CanManageEvent','CanManageSermon','CanManageBooks','CanManageAlbum','CanManageImage','CanManageCalendarYear','CanViewMediaData','CanUploadContent','CanSubmitContent','CanReviewContent','CanManageContent','CanApproveAsAdmin','CanApproveAsSuperAdmin','CanPublishContent','CanPublishToFacebook','CanModerateComments','CanViewReports','audit.view','operations.view','CanAssignPermission','CanAssignRoles'];
const id = 'a1000000-0000-4000-8000-000000000001'; const contentId = 'b1000000-0000-4000-8000-000000000001';
const now = new Date(); const date = new Date(now.getFullYear(), now.getMonth(), Math.max(15, now.getDate()), 15).toISOString();
const browser = await chromium.launch({ headless:true, ...(process.env.DAYSPRING_CHROMIUM ? { executablePath:process.env.DAYSPRING_CHROMIUM } : {}) });
let latest;
async function setup(role = 'superAdmin') {
    const context = await browser.newContext({ viewport:{ width:1280, height:900 }, reducedMotion:'reduce' });
    await context.addInitScript(() => { const get = Storage.prototype.getItem; Storage.prototype.getItem = function(key) { return key.startsWith('dayspring_tour_seen_') ? '1' : get.call(this,key); }; });
    const user = { id:'synthetic-owner', userName:'Alex', roleId:'role-root', role, permissions, legacyChurch:true };
    const item = { id, title:'Classic gathering', description:'Community training and fellowship', date, revision:0, isPublished:false, isArchived:false };
    const state = { items:[item], flyers:[], status:1, writes:[], user };
    const media = () => ({ id:contentId, title:'Classic gathering flyer', description:'Program details and date', ownerId:user.id, ownerName:'Alex', category:4, categoryName:'EventFlier', contentType:1, contentTypeName:'Image', cloudinaryUrl:'https://synthetic.example.test/flyer.png', workflowStatus:state.status, eventId:id });
    await context.route('**/*', async (route) => {
        const request = route.request(); const url = new URL(request.url());
        const json = (value,status=200) => route.fulfill({ status, contentType:'application/json', body:JSON.stringify(value) });
        if (url.pathname === '/api/auth/session') return json(user);
        if (url.pathname.startsWith('/api/backend/')) {
            const api = url.pathname.replace('/api/backend/api/v1/','').toLowerCase(); const method = request.method();
            if (method !== 'GET') {
                state.writes.push({ api, body:request.postData(), method });
                if (api === 'event-programs') { state.items.push({ ...item, id:'new-program', title:'New training', date }); return json({ id:'new-program' }); }
                if (api.endsWith('/flyer')) { state.flyers.push({ id:contentId, eventId:id, eventRevision:0, workflowStatus:1, createdDate:date }); return json({ contentId }); }
                if (api === 'workflow/forward-for-approval') state.status=5;
                if (api === 'approvals/approve') state.status=state.status===5 ? 6 : 7;
                if (api === 'publishing/publish-to-destination') state.status=10;
                return json({ status:true, data:{} });
            }
            if (api === 'event-programs') return json({ items:state.items, flyers:state.flyers });
            if (api === 'access/catalog') return json({ roles:[{ id:'role-root', name:role, scope:'Church', permissions, resources:['dashboard','media','content'], widgets:['media'], isSystem:true }], resources:[{ key:'dashboard',label:'Dashboard',capabilities:[] },{ key:'media',label:'Media workspace',capabilities:['CanViewMediaData'] },{ key:'content',label:'Website content',capabilities:['CanManageEvent'] }], widgets:[{ key:'media', label:'Media content', resource:'media', capabilities:['CanViewMediaData'] }, { key:'events',label:'Events & programs',resource:'content',capabilities:['CanManageEvent'] }], capabilities:permissions.map(name => ({ name,description:name,group:'Media' })), units:[],customPermissions:[] });
            if (api === 'access/dashboard') return json({ cards:[], resources:[] });
            if (api === 'notifications/overview') return json({ forms:0,responses:0,issuedCertificates:0,pendingApprovals:0 });
            if (api === 'operations') return json({ checkedAt:date,summary:[],jobs:[],workers:[],total:0,services:['api','database','reporting','certificates'].map(category => ({ category,status:'Healthy',lastCheckedAt:new Date().toISOString(),points:[1,2,3,4,5].map((value,index) => ({ at:new Date(Date.now()-(5-index)*60000).toISOString(),value,requests:2,errors:0 })) })) });
            if (api === 'comments/moderation/counts') return json({ pending:0,hidden:0 });
            if (api === 'mediacontent') return json([media()]);
            if (api.startsWith('mediacontent/status')) return json(state.status===7 ? [media()] : []);
            if (api === `mediacontent/${contentId}`) return json(media());
            if (api === 'events/all') return json(state.items.map(x => ({ ...x, heading:x.title,eventDate:x.date })));
            if (api.startsWith('approvals/queue/')) return json([{ id:'approval',contentId,contentTitle:'Classic gathering flyer',levelName:'Admin',createdDate:date }]);
            if (api.includes('ready')) return json(state.status===7 ? [media()] : []);
            if (api.includes('livestream')) return json({ enabled:false });
            return json([]);
        }
        if (url.origin !== origin) return route.abort();
        return route.continue();
    });
    const page = await context.newPage(); latest=page; const errors=[]; page.on('console', msg => { if(msg.type()==='error') console.error('BROWSER',msg.text()); }); page.on('pageerror',e => { errors.push(e.message); console.error('PAGE ERROR',e.message); });
    return { context,page,state,errors };
}
async function responsive(page,name) { for (const width of [320,390,768,1280]) { await page.setViewportSize({ width,height:900 }); await page.waitForTimeout(400); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1),`${name}: overflow at ${width}`); if (output) await page.screenshot({ path:path.join(output,`${name}-${width}.png`),fullPage:true }); } }
try {
    for (const role of ['superAdmin','churchAdmin','churchMedia','contentSocialMedia']) {
        const test=await setup(role); const {page}=test; await page.goto(`${origin}/admin/dashboard`); await page.getByRole('heading',{name:/Welcome, Alex/}).waitFor();
        const greeting=await page.getByRole('heading',{name:/Welcome, Alex/}).boundingBox(); assert.ok(greeting.y<250,`${role}: greeting too far down`);
        if (['superAdmin','churchAdmin'].includes(role)) assert.equal(await page.getByRole('button',{name:'Social & community',exact:true}).count(),0);
        await responsive(page,`dashboard-${role}`); assert.deepEqual(test.errors,[]); await test.context.close();
    }
    const test=await setup(); const {page,state}=test;
    await page.goto(`${origin}/admin/calendar`); await page.getByRole('heading',{name:/November|December|January|February|March|April|May|June|July|August|September|October/}).waitFor();
    await page.getByRole('button',{name:new RegExp(`^${new Date(date).getDate()} `)}).click(); await page.getByRole('heading',{name:'Classic gathering'}).waitFor(); await responsive(page,'calendar');
    await page.goto(`${origin}/admin/content`); await page.getByRole('heading',{name:'Events & programs',exact:true}).waitFor(); await page.getByRole('button',{name:'New event / program'}).click();
    await page.getByLabel('Program title').fill('New training'); await page.getByLabel('Date & time').fill('2027-01-15T10:00'); await page.getByLabel('Description',{exact:true}).fill('Training information'); await page.getByRole('button',{name:'Save program',exact:true}).click(); await page.getByRole('heading',{name:'New training',exact:true}).waitFor(); assert.equal(state.writes.filter(x=>x.api==='event-programs').length,1);
    state.user.role='churchMedia'; await page.goto(`${origin}/admin/events`);
    await page.getByRole('button',{name:'Add / replace flyer'}).first().click(); await page.locator('input[type=file]').setInputFiles({ name:'flyer.png',mimeType:'image/png',buffer:Buffer.from('synthetic fixture') }); await page.getByRole('button',{name:'Save & submit for approval'}).click(); await page.getByText('Flyer and program submitted for approval. Track them in Media → Workflow.').waitFor(); assert.equal(state.writes.filter(x=>x.api.endsWith('/flyer')).length,1); await responsive(page,'programs');
    state.user.role='superAdmin'; await page.goto(`${origin}/admin/permissions`); await page.getByRole('heading',{name:'Superadmin',exact:true}).waitFor(); assert.equal(await page.locator('ul').count(),2); await responsive(page,'roles'); await page.getByRole('button',{name:'Configure role'}).click(); await page.getByRole('button',{name:'Resources',exact:true}).click(); await page.getByLabel('Media workspace').waitFor(); await page.getByRole('button',{name:'Dashboard',exact:true}).last().click(); await page.getByLabel('Media content').waitFor();
    await page.goto(`${origin}/admin/operations`); await page.getByRole('heading',{name:'Application',exact:true}).waitFor(); assert.ok(await page.locator('article').filter({has:page.getByRole('heading',{name:'Certificates',exact:true})}).locator('svg rect').count()>0); await responsive(page,'operations');
    state.user.role='churchMedia'; await page.goto(`${origin}/admin/workflow`); await page.getByRole('heading',{name:'Classic gathering flyer'}).waitFor(); const before=state.writes.length; await page.getByRole('button',{name:'Send Back',exact:true}).click(); await page.getByRole('button',{name:'Cancel',exact:true}).click(); assert.equal(state.writes.length,before,'Cancel must not change workflow');
    await page.getByRole('button',{name:/Forward/}).first().click(); assert.equal(state.status,5);
    state.user.role='churchAdmin'; await page.goto(`${origin}/admin/approvals`); await page.getByRole('heading',{name:'Classic gathering flyer'}).waitFor(); await page.getByRole('button',{name:'Approve',exact:true}).first().click(); await page.getByRole('button',{name:'Confirm Approval',exact:true}).click(); await page.waitForTimeout(200); assert.equal(state.status,6);
    state.user.role='superAdmin'; await page.goto(`${origin}/admin/approvals`); await page.getByRole('button',{name:'Super Admin Queue',exact:true}).click(); await page.getByRole('button',{name:'Approve',exact:true}).first().click(); await page.getByRole('button',{name:'Confirm Approval',exact:true}).click(); await page.waitForTimeout(200); assert.equal(state.status,7);
    state.user.role='churchMedia'; await page.goto(`${origin}/admin/publishing`); await page.getByRole('heading',{name:'Classic gathering flyer'}).waitFor(); await page.getByRole('button',{name:'Publish',exact:true}).first().click(); await page.getByText('Linked program:',{exact:false}).waitFor(); await page.locator('form').getByRole('button',{name:'Publish',exact:true}).click(); await page.waitForTimeout(250); assert.equal(state.status,10); const publication=state.writes.find(x=>x.api==='publishing/publish-to-destination'); assert.equal(JSON.parse(publication.body).eventId,id); assert.deepEqual(test.errors,[]); await test.context.close();
    const social=await setup('churchMedia'); await social.page.goto(`${origin}/admin/comments`); await social.page.getByRole('heading',{name:'Social & community',exact:true}).waitFor(); await social.page.getByRole('heading',{name:'Community inbox',exact:true}).waitFor(); await responsive(social.page,'social'); await social.page.getByRole('button',{name:'Social publishing',exact:true}).click(); await social.page.getByRole('heading',{name:/Publishing/}).waitFor(); assert.deepEqual(social.errors,[]); await social.context.close();
    console.log('PASS: dashboard spacing, responsive calendar/programs/roles/operations/social, program creation, linked flyer submission, canceled review safety, media review, admin and superadmin approval, linked destination publishing and social workspace.');
} catch(e) { if(latest && !latest.isClosed()) { if(output) await latest.screenshot({path:path.join(output,'failure.png'),fullPage:true}); console.error((await latest.locator('body').innerText()).slice(-2500)); } throw e; } finally { await browser.close(); }
