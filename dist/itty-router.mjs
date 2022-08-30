export function Router({ base = '', routes = [], onResponse } = {}) {
  return {
    __proto__: new Proxy({}, {
      get: (target, prop, receiver) => (route, ...handlers) =>
        routes.push([
          prop.toUpperCase(),
          RegExp(`^${(base + route)
            .replace(/(\/?)\*/g, '($1.*)?')
            .replace(/\/$/, '')
            .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')
            .replace(/\.(?=[\w(])/, '\\.')
            .replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.')
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

export default {
  Router
}
