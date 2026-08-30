export default async function handler(req,res){
 const r=await fetch(`${process.env.SUPABASE_URL}/rest/v1/activity?select=stars,target&limit=1`,{headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY},});
 const d=await r.json(); if(!r.ok)return res.status(500).json({error:"database"}); res.json(d[0]||{stars:0,target:500});
}