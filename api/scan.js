export default async function handler(req,res){
 if(req.method!=="POST") return res.status(405).end();
 const r=await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/increment_stars`,{method:"POST",headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,"Content-Type":"application/json"},body:"{}"});
 const d=await r.json(); if(!r.ok)return res.status(500).json({error:"database"}); res.json(d);
}