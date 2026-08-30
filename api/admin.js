export default async function handler(req,res){
 if(req.method!=="POST") return res.status(405).end();
 const key=req.headers["x-admin-key"];
 if(!key || key!==process.env.ADMIN_KEY)return res.status(401).json({error:"密码错误"});
 const body=req.body||{};
 let fields={}; if(body.stars!==undefined)fields.stars=Math.max(0,Number(body.stars)||0); if(body.target!==undefined)fields.target=Math.max(1,Number(body.target)||500);
 if(body.reset)fields.stars=0;
 const r=await fetch(`${process.env.SUPABASE_URL}/rest/v1/activity?id=eq.1`,{method:"PATCH",headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,"Content-Type":"application/json","Prefer":"return=representation"},body:JSON.stringify(fields)});
 const d=await r.json(); if(!r.ok)return res.status(500).json({error:"database"}); res.json(d[0]);
}