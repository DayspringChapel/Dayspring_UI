import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin=process.env.DAYSPRING_SMOKE_ORIGIN;if(!origin || !['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw new Error('Local frontend only.');
const browser=await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM?{executablePath:process.env.DAYSPRING_CHROMIUM}:{})});
const batchId='bb000000-0000-4000-8000-000000000001';
try{
 for(const role of ['superAdmin','churchMedia']){
  const context=await browser.newContext();const writes=[];let issued=false;
  const permissions=['CanViewMediaData','CanUploadContent','CanSubmitContent','CanReviewContent','CanPublishContent','CanApproveAsAdmin','CanApproveAsSuperAdmin','certificates.generate','certificates.records.view','certificates.issue'];
  await context.addInitScript(()=>{const get=Storage.prototype.getItem;Storage.prototype.getItem=function(key){return key.startsWith('dayspring_tour_seen_')?'1':get.call(this,key);};});
  await context.route('**/*',route=>{const url=new URL(route.request().url());const api=url.pathname.toLowerCase();const json=value=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
   if(api==='/api/auth/session')return json({id:'synthetic',userName:role,role,permissions,legacyChurch:true});
   const batch={id:batchId,title:'Completed training certificates',status:issued?'Issued':'Generated',revision:1,createdAt:new Date().toISOString()};
   if(route.request().method()!=='GET'){writes.push(api);if(api.endsWith('/issue'))issued=true;return json({batch:{...batch,status:'Issued'},items:[],total:1});}
   if(api.endsWith('/certificate-management/templates'))return json([]);
   if(api.endsWith('/certificate-management/batches'))return json({items:[batch],total:1});
   if(api.includes(`/certificate-management/batches/${batchId}`))return json({batch,items:[],total:1});
   if(api.endsWith('/mediacontent'))return json([{id:'pending-image',title:'Pending graphic',category:1,categoryName:'Gallery',contentType:1,contentTypeName:'Image',ownerId:'another-uploader',ownerName:'Graphics',cloudinaryUrl:'https://synthetic.example.test/image.png',workflowStatus:1}]);
   if(api.startsWith('/api/backend/'))return json([]);if(url.origin!==origin)return route.abort();return route.continue();});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${origin}/admin/publishing`);
  if(role==='superAdmin') {await page.getByRole('heading',{name:'Pending graphic',exact:true}).waitFor();await page.getByRole('button',{name:'Publish',exact:true}).first().click();await page.locator('form').getByRole('button',{name:'Publish',exact:true}).click();await page.waitForTimeout(150);assert.ok(writes.some(x=>x.endsWith('/publishing/publish-to-destination')));}
  else {await page.getByText('No content is ready to publish yet',{exact:false}).waitFor();assert.equal(await page.getByRole('heading',{name:'Pending graphic'}).count(),0);}
  await page.goto(`${origin}/admin/certificates?batch=${batchId}`);await page.getByText('Status: Generated',{exact:false}).waitFor();
  if(role==='superAdmin'){assert.equal(await page.getByRole('button',{name:'Submit for approval',exact:true}).count(),0);await page.getByRole('button',{name:'Issue batch',exact:true}).waitFor();}
  else {await page.getByRole('button',{name:'Submit for approval',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Issue batch',exact:true}).count(),0);}
  await page.goto(`${origin}/admin/media/create`);await page.getByRole('heading',{name:'Upload Media',exact:true}).waitFor();if(role==='superAdmin')await page.getByText('Superadmin does not require approval.',{exact:false}).waitFor();else await page.getByText('it starts in Draft status',{exact:false}).waitFor();
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS: superadmin can directly publish pending content and issue generated batches; other media users retain approval gates and draft uploads.');
}finally{await browser.close();}
