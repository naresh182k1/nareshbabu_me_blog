export async function onRequestGet({ env, request }) {
  const clientId = env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response("GITHUB_CLIENT_ID not configured", { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/callback`;
  const scope = "repo,user";

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);

  return Response.redirect(authUrl.toString(), 302);
}
