// Disposable local acceptance only. Does not call announcement or provider-post APIs.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DAYSPRING_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DAYSPRING_SMOKE_ORIGIN;
const api = process.env.DAYSPRING_SMOKE_API;
for (const value of [origin,api]) if (!value || !['localhost','127.0.0.1'].includes(new URL(value).hostname)) throw new Error('Use the isolated local audit app.');
async function login(email,password) {
    const response=await fetch(`${origin}/api/auth/session`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({userNameOrEmail:email,password})});
    assert.equal(response.status,200,await response.clone().text());
    return response.headers.getSetCookie().find(value=>value.startsWith('__Host-dayspring_session=')).split(';')[0];
}
const root=await login('foundation@church.test','Foundation-local-only-123');
async function admin(path,body,method='POST') {
    const response=await fetch(`${origin}/api/backend/api/v1/${path}`,{method,headers:{Origin:origin,Cookie:root,'Content-Type':'application/json'},...(body ? {body:JSON.stringify(body)} : {})});
    assert.equal(response.status,200,`${path}: ${await response.clone().text()}`);const text=await response.text();try{return JSON.parse(text);}catch{return text;}
}
const empty={youTubeAutoDetect:false,youtube:{active:false,url:'',description:''},facebook:{active:false,url:'',description:''},instagram:{active:false,url:'',description:''},imageUrl:'',hideWatchOnline:true,social:{whatsAppNumber:'',facebookPageUrl:'',instagramPageUrl:'',youTubeChannelId:''}};
const sample={...empty,youtube:{active:true,url:'https://www.youtube.com/watch?v=aqtlocal1234',description:'Synthetic local stream'}};
const save=await fetch(`${origin}/api/livestream`,{method:'POST',headers:{Origin:origin,Cookie:root,'Content-Type':'application/json'},body:JSON.stringify(sample)});
assert.equal(save.status,200,await save.clone().text());
const publicValue=await (await fetch(`${origin}/api/livestream`)).json();assert.equal(publicValue.youtube.url,sample.youtube.url,'Public and protected routes must use the same local backend.');
const forbidden=await fetch(`${origin}/api/livestream`,{method:'POST',headers:{Origin:'https://untrusted.test',Cookie:root,'Content-Type':'application/json'},body:JSON.stringify(empty)});assert.equal(forbidden.status,403);
const anonymous=await fetch(`${origin}/api/livestream`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(empty)});assert.equal(anonymous.status,403);
await admin('site-settings/livestream',empty,'PUT');
const suffix=crypto.randomUUID().slice(0,8),email=`account-audit-${suffix}@church.test`,password='Synthetic-current-password-123',nextPassword='Synthetic-updated-password-456';
const registration=await fetch(`${api}/api/v1/Users/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userName:`account-audit-${suffix}`,email,password,securityQuestion1:'Synthetic fixture?',securityAnswer1:'Local only'})});assert.equal(registration.status,200);
const user=(await registration.json()).data;
await admin('Roles/assign-role',{userEmail:email,roleName:'contentContributor'});
const staff=await login(email,password);
const browser=await chromium.launch({headless:true,...(process.env.DAYSPRING_CHROMIUM ? {executablePath:process.env.DAYSPRING_CHROMIUM} : {})});
const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
await context.addInitScript(()=>{const original=Storage.prototype.getItem;Storage.prototype.getItem=function(key){return key.startsWith('dayspring_tour_seen_')?'1':original.call(this,key);};});
await context.addCookies([{name:staff.split('=')[0],value:staff.split('=')[1],domain:new URL(origin).hostname,path:'/',secure:true,httpOnly:true,sameSite:'Lax'}]);
const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
try {
    await page.goto(`${origin}/admin/account`);await page.getByRole('heading',{name:'Your account',exact:true}).waitFor();
    await page.getByLabel('Current password',{exact:true}).fill('incorrect');await page.getByLabel('New password',{exact:true}).fill(nextPassword);await page.getByLabel('Confirm new password',{exact:true}).fill(nextPassword);
    await page.getByRole('button',{name:'Change password and sign out',exact:true}).click();await page.getByRole('alert').filter({hasText:'current password is not correct'}).waitFor();
    await page.getByLabel('Current password',{exact:true}).fill(password);await page.getByRole('button',{name:'Change password and sign out',exact:true}).click();await page.waitForURL('**/admin/login');
    const expired=await fetch(`${origin}/api/auth/session`,{headers:{Cookie:staff}});assert.equal(expired.status,401,'Old browser credential must no longer authenticate.');
    const replacement=await login(email,nextPassword);assert.ok(replacement);
    const other=await fetch(`${origin}/api/backend/api/v1/Users/${user.id}/change-password`,{method:'PUT',headers:{Origin:origin,Cookie:root,'Content-Type':'application/json'},body:JSON.stringify({currentPassword:nextPassword,newPassword:'Never-applied-password-789'})});assert.equal(other.status,403,'Even an administrator must not use an own-account action to change another account.');
    await context.clearCookies();await context.addCookies([{name:root.split('=')[0],value:root.split('=')[1],domain:new URL(origin).hostname,path:'/',secure:true,httpOnly:true,sameSite:'Lax'}]);
    await page.goto(`${origin}/admin/settings`);const saveButton=page.getByRole('button',{name:'Save Settings',exact:true});await saveButton.waitFor();assert.equal(await saveButton.isEnabled(),true,'All streams off and cleared links remain savable.');await saveButton.click();await page.getByText('Saved',{exact:false}).first().waitFor();
    for (const width of [320,390,768,1280]) {await page.setViewportSize({width,height:900});await page.goto(`${origin}/admin/account`);await page.getByRole('heading',{name:'Your account',exact:true}).waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Account overflow at ${width}`);}
    assert.deepEqual(errors,[]);
    console.log('PASS: livestream backend consistency, browser-session write and CSRF, blank settings save, own-password change, wrong-password rejection, old-session invalidation, other-account denial and responsive account UI.');
} finally {await browser.close();}
