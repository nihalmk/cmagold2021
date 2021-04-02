
/**
 * Module dependencies.
 */

const { resolve } = require('path')
const send = require('koa-send')

/**
 * Expose `serve()`.
 */

module.exports = serve

/**
 * Serve static files from `root`.
 *
 * @param {String} root
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */

function serve (root, opts) {
  opts = Object.assign(Object.create(null), opts)

  // options
  opts.root = resolve(root)
  if (opts.index !== false) opts.index = opts.index || 'index.html'

  if (!opts.defer) {
    return async function serve (ctx, next) {
      let done = false

      if (ctx.method === 'HEAD' || ctx.method === 'GET') {
        try {
          done = await send(ctx, ctx.path, opts)
        } catch (err) {
          if (err.status !== 404) {
            throw err
          }
        }
      }

      if (!done) {
        await next()
      }
    }
  }

  return async function serve (ctx, next) {
    await next()

    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') return
    // response is already handled
    if (ctx.body != null || ctx.status !== 404) return // eslint-disable-line

    try {
      await send(ctx, ctx.path, opts)
    } catch (err) {
      if (err.status !== 404) {
        throw err
      }
    }
  }
}