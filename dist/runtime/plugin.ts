import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRouter } from '#imports'
import options from '#build/yandex-metrika.options.mjs'

export default defineNuxtPlugin(async ({ _ }) => {
  const { id, isDev, consoleLog, metrikaUrl, ...metrikaOptions } = await options()

  let ready = false
  // const basePath = (useRuntimeConfig().app.baseURL || '/').replace(/\/$/, '')

  // Mark when the router has completed the initial navigation.
  useRouter().isReady().then(() => {
    ready = true
  })

  function create () {
    if (!ready) {
      if (!isDev) {
        // Don't record a duplicate hit for the initial navigation.
        (function (m, e, t, r, i, k, a) {
          m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) }
          m[i].l = 1 * new Date()
          k = e.createElement(t)
          a = e.getElementsByTagName(t)[0]
          k.async = 1
          k.src = r
          a.parentNode.insertBefore(k, a)
        })(window, document, 'script', metrikaUrl, 'ym')
        ym(id, 'init', metrikaOptions)
      }
      if (consoleLog) {
        console.log(`Yandex Metrika initialized in ${isDev ? 'development' : 'production'} mode. ID=${id}. Options: ${JSON.stringify(metrikaOptions)}`)
      }
    }

    useRouter().afterEach((to, from) => {
      if (to.fullPath === from.fullPath) {
        return
      }
      if (consoleLog) {
        console.log(`Yandex Metrika page hit: "${to.fullPath}" (referer="${from.fullPath}")`)
      }
      if (!isDev) {
        ym(id, 'hit', to.fullPath, {
          referer: /* basePath + */from.fullPath
        })
      }
    })
  }

  if (window.ym === undefined) {
    create()
  }

  return {
    provide: {
      ym: (method: string, ...args: any[]) => {
        if (window.ym) {
          ym.apply(null, [id, method, ...args])
          if (consoleLog) {
            if (args.length === 0) {
              console.log(`Yandex Metrika call: ym("${id}", "${method}")`)
            } else {
              const argumentsText = args.map(a => JSON.stringify(a)).join(', ')
              console.log(`Yandex Metrika call: ym("${id}", "${method}", ${argumentsText})`)
            }
          }
        } else if (consoleLog) {
          if (args.length === 0) {
            console.log(`Yandex Metrika is not initialized! Failed to execute: ym("${id}", "${method}")`)
          } else {
            const argumentsText = args.map(a => JSON.stringify(a)).join(', ')
            console.log(`Yandex Metrika is not initialized! Failed to execute: ym("${id}", "${method}", ${argumentsText})`)
          }
        }
      }
    }
  }
})
