/**
 * First-party JoyNeeds API relay.
 * Deployment env: BACKEND_ORIGIN=https://<your-render-api-host>
 * Vercel rewrite: /api/:path* -> /api/proxy?path=:path*
 */
const namespaces = new Set(["health","products","categories","orders","payments","account","admin","contact","content"]);
const methods = new Set(["GET","HEAD","POST","PUT","PATCH","DELETE","OPTIONS"]);
const passHeaders = ["accept","authorization","content-type","cookie","origin","referer","idempotency-key"];
const blockedResponseHeaders = new Set(["content-encoding","content-length","transfer-encoding","connection","access-control-allow-origin","access-control-allow-credentials","access-control-allow-headers","access-control-allow-methods"]);
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    if (!methods.has(method)) {
      return Response.json({ error:{code:"METHOD_NOT_ALLOWED",message:"Unsupported method"} }, {status:405});
    }
    let backend: URL;
    try {
      backend = new URL((process.env.BACKEND_ORIGIN || "").trim());
      if (backend.protocol !== "https:" || backend.username || backend.password ||
        backend.pathname !== "/" || backend.search || backend.hash) throw new Error("Invalid origin");
    } catch {
      return Response.json({error:{code:"API_NOT_CONFIGURED",message:"The secured store API is not connected yet."}},
        {status:503,headers:{"cache-control":"no-store"}});
    }
    const path = url.searchParams.get("path") || "";
    const parts = path.split("/").filter(Boolean);
    if (!parts.length || !namespaces.has(parts[0]) ||
      !parts.every(p=>/^[a-z0-9_-]{1,140}$/i.test(p))) {
      return Response.json({error:{code:"NOT_FOUND",message:"Unknown store endpoint."}},{status:404});
    }
    // Payment provider callbacks/webhooks must go straight to Render.
    if (parts[0]==="payments" && parts.some(p=>/webhook|callback/.test(p))) {
      return Response.json({error:{code:"DIRECT_CALLBACK_ONLY",message:"Provider callbacks must target the secured backend directly."}},{status:404});
    }
    const target = new URL("/api/"+parts.join("/"),backend);
    for (const [key,value] of url.searchParams) if (key!=="path") target.searchParams.append(key,value);
    const headers = new Headers();
    for (const key of passHeaders) {
      const value=request.headers.get(key); if(value) headers.set(key,value);
    }
    try {
      const upstream = await fetch(target,{
        method,headers,body:method==="GET"||method==="HEAD"?undefined:request.body,
        duplex:"half",redirect:"manual",signal:AbortSignal.timeout(20_000),
      } as RequestInit & {duplex:"half"});
      const resultHeaders=new Headers();
      upstream.headers.forEach((value,key)=>{
        if(!blockedResponseHeaders.has(key.toLowerCase())&&key.toLowerCase()!=="set-cookie")
          resultHeaders.append(key,value);
      });
      const setCookies=upstream.headers.getSetCookie?.()||[];
      for(const cookie of setCookies) resultHeaders.append("set-cookie",cookie);
      resultHeaders.set("cache-control","no-store");
      resultHeaders.set("x-content-type-options","nosniff");
      return new Response(method==="HEAD"?null:upstream.body,{
        status:upstream.status,statusText:upstream.statusText,headers:resultHeaders,
      });
    } catch {
      return Response.json({error:{code:"API_UNAVAILABLE",message:"The store API is temporarily unavailable."}},
        {status:503,headers:{"cache-control":"no-store"}});
    }
  },
};
