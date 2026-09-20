export async function onRequest(context) {
  const requestUrl = new URL(context.request.url);

  if (requestUrl.hostname === 'www.mobdeals.co.ke') {
    const apexUrl = new URL(requestUrl);
    apexUrl.hostname = 'mobdeals.co.ke';
    return Response.redirect(apexUrl.toString(), 301);
  }

  return context.next();
}
