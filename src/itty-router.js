function Router({ base = '', routes = [], onResponse } = {}) {
  return {
    __proto__: new Proxy({}, {
      get: (target, prop, receiver) => (route, ...handlers) =>
        routes.push([
          prop.toUpperCase(),
          RegExp(`^${(base + route)
            .replace(/(\/?)\*/g, '($1.*)?')                             // trailing wildcard
            .replace(/\/$/, '')                                         // remove trailing slash
            .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')         // named params
            .replace(/\.(?=[\w(])/, '\\.')                              // dot in path
            .replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.') // optional image format
          }/*$`),
          handlers,
          base + route
        ]) && receiver
    }),
    routes,
    async handle (request, ...args) {
      let response, match, url = new URL(request.url)
      request.query = Object.fromEntries(url.searchParams)
      for (let [method, route, handlers, matched] of routes) {
        if ((method === request.method || method === 'ALL') && (match = url.pathname.match(route))) {
          request.params = match.groups
          request.matched = matched
          for (let handler of handlers) {
            if ((response = await handler(request.proxy || request, ...args)) !== undefined) return onResponse
              ? onResponse(request, response)
              : response
          }
        }
      }
    }
  }
}

module.exports = {
  Router
}
