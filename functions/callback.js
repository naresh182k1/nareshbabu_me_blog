export async function onRequestGet({ request, env }) {
  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const data = await tokenResponse.json();

  if (data.error) {
    return new Response(`OAuth error: ${data.error_description}`, {
      status: 401,
    });
  }

  const token = data.access_token;
  const provider = "github";

  const html = `<!doctype html>
<html>
<head><title>Authenticating...</title></head>
<body>
  <script>
    (function() {
      function sendMessage(provider, token) {
        window.opener.postMessage(
          "authorization:" + provider + ":success:" + JSON.stringify({ token: token, provider: provider }),
          window.location.origin
        );
      }

      function receiveMessage(e) {
        if (e.origin !== window.location.origin) return;
        sendMessage("${provider}", "${token}");
        window.removeEventListener("message", receiveMessage);
      }

      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:${provider}", "*");
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}
