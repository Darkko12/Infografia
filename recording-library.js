'use strict';
// Audio stays on this device. IndexedDB stores the original Blob, never a temporary URL.
window.RecordingLibrary=(()=>{
 let database;const memory=[];
 const ready=new Promise(resolve=>{
  if(!window.indexedDB){resolve(null);return}
  const request=indexedDB.open('electria-opiniones',1);
  request.onupgradeneeded=()=>{const db=request.result;const store=db.createObjectStore('recordings',{keyPath:'id',autoIncrement:true});store.createIndex('category','category')};
  request.onsuccess=()=>{database=request.result;resolve(database)};request.onerror=()=>resolve(null);
 });
 async function save(category,blob){
  const entry={category,blob,createdAt:Date.now()};const db=await ready;
  if(!db){entry.id=Date.now()+Math.random();memory.push(entry);return {...entry,persistent:false}}
  return new Promise((resolve,reject)=>{const tx=db.transaction('recordings','readwrite');const req=tx.objectStore('recordings').add(entry);req.onsuccess=()=>entry.id=req.result;tx.oncomplete=()=>resolve({...entry,persistent:true});tx.onerror=()=>reject(tx.error)});
 }
 async function list(category){const db=await ready;let entries;
  if(!db)entries=memory;
  else entries=await new Promise((resolve,reject)=>{const tx=db.transaction('recordings','readonly');const req=tx.objectStore('recordings').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
  return entries.filter(x=>!category||x.category===category).sort((a,b)=>b.createdAt-a.createdAt);
 }
 return {save,list};
})();
