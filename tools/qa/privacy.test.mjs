import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const auth=fs.readFileSync(new URL('../../assets/scripts/auth.js',import.meta.url),'utf8');
const analytics=fs.readFileSync(new URL('../../assets/scripts/analytics.js',import.meta.url),'utf8');
const key='signal-and-self-google-viewer';
function fixture({blocked=false,restored=null}={}) {
 const values=new Map(restored?[[key,JSON.stringify(restored)]]:[]), events=new Map(), appended=[];
 const status={dataset:{},textContent:''}, host={clientWidth:280,replaceChildren(){}}, signout={addEventListener(type,fn){this.fn=fn;}};
 const storage={getItem(k){if(blocked)throw Error('blocked');return values.get(k)||null;},setItem(k,v){if(blocked)throw Error('blocked');values.set(k,v);},removeItem(k){if(blocked)throw Error('blocked');values.delete(k);}};
 const window={SIGNAL_AND_SELF_AUTH:{googleClientId:'demo-client'},addEventListener(name,fn){events.set(name,fn);},dispatchEvent(event){if(event.type==='signal-and-self-auth-change')this.viewer=event.detail.viewer;}};
 const document={readyState:'complete',querySelector(s){return {'#auth-status':status,'#google-signin-host':host,'[data-sign-out]':signout}[s]||null;},querySelectorAll(){return [];},getElementById(){return null;},head:{append(s){appended.push(s);}},createElement(){return {remove(){}};}};
 class CustomEvent {constructor(type,init){this.type=type;this.detail=init?.detail;}}
 const context={window,document,sessionStorage:storage,localStorage:new Proxy({}, {get(){throw Error('Identity must not access local storage');}}),CustomEvent,TextDecoder,Uint8Array,atob,Date,console};
 vm.runInNewContext(auth,context);
 return {window,values,status,events,appended,signout};
}
function credential(extra={}) {
 const claims={aud:'demo-client',iss:'https://accounts.google.com',sub:'stable-id-must-not-persist',exp:Math.floor(Date.now()/1000)+3600,name:'Test Visitor',given_name:'Test',email:'test@example.invalid',picture:'https://example.invalid/avatar.png',...extra};
 return {credential:'test.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.mock-signature'};
}
async function authorize(f) {
 let callback;
 f.window.google={accounts:{id:{initialize(config){callback=config.callback;},renderButton(){},disableAutoSelect(){}}}};
 await f.events.get('signal-and-self-auth-open')(); return callback;
}
test('Google resources load only after explicit account activation',async()=>{
 const f=fixture(); assert.equal(f.appended.length,0);
 const pending=f.events.get('signal-and-self-auth-open')();
 assert.equal(f.appended.length,1); assert.equal(f.appended[0].src,'https://accounts.google.com/gsi/client');
 f.appended[0].onerror(); await pending; assert.equal(f.status.dataset.tone,'error');
 const retry=f.events.get('signal-and-self-auth-open')(); assert.equal(f.appended.length,2); f.appended[1].onerror(); await retry;
});
test('Only presentation fields persist in session storage; sign-out clears them',async()=>{
 const f=fixture(), callback=await authorize(f); callback(credential());
 assert.deepEqual(Object.keys(JSON.parse(f.values.get(key))).sort(),['expiresAt','fullName','givenName','picture']);
 assert.ok(!f.values.get(key).includes('stable-id')); assert.ok(!f.values.get(key).includes('test@example')); assert.ok(!f.values.get(key).includes('credential'));
 f.signout.fn(); assert.equal(f.values.size,0); assert.equal(f.window.viewer,null);
});
test('Expired, foreign-audience and malformed responses do not create viewer state',async()=>{
 const f=fixture(), callback=await authorize(f);
 for(const response of [credential({exp:1}),credential({aud:'foreign'}),{credential:'malformed'}]) {callback(response);assert.equal(f.values.size,0);}
});
test('Storage denial never breaks public browsing or sign-out',async()=>{
 const f=fixture({blocked:true}), callback=await authorize(f); callback(credential());
 assert.match(f.status.textContent,/page only/); assert.doesNotThrow(()=>f.signout.fn());
});
test('Restored viewer data is restricted to the same presentation allowlist',()=>{
 const f=fixture({restored:{givenName:'Test',fullName:'Test Visitor',picture:'javascript:bad',expiresAt:Date.now()+10000,email:'ignored',sub:'ignored',credential:'ignored'}});
 assert.deepEqual(Object.keys(f.window.viewer).sort(),['expiresAt','fullName','givenName','picture']); assert.equal(f.window.viewer.picture,'');
});
for(const hostname of ['127.0.0.1','localhost','preview.example','mini34.github.io']) {
 test(`Analytics hostname boundary: ${hostname}`,()=>{
  const appended=[];
  const window={location:{hostname}};
  for(const key of ['google','SignalSelf','viewer','localStorage','sessionStorage']) Object.defineProperty(window,key,{get(){throw Error('Analytics accessed private state');}});
  const document={head:{append(node){appended.push(node);}},createElement(){return {dataset:{}};}};
  vm.runInNewContext(analytics,{window,document,localStorage:new Proxy({}, {get(){throw Error('No preferences');}})});
  assert.equal(appended.length,hostname==='mini34.github.io'?1:0);
  if(appended.length) {assert.equal(appended[0].src,'https://static.cloudflareinsights.com/beacon.min.js');assert.deepEqual(Object.keys(JSON.parse(appended[0].dataset.cfBeacon)),['token']);}
 });
}
