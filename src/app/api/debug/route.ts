// app/api/debug-env/route.ts
export async function GET() {
  return new Response(JSON.stringify({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    BACKEND_URL: process.env.BACKEND_URL,
  }), { status: 200 });
}