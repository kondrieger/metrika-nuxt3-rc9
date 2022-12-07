
import { ModuleOptions, ModuleHooks } from './module'

declare module '@nuxt/schema' {
  interface NuxtConfig { ['yandexMetrika']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['yandexMetrika']?: ModuleOptions }
  interface NuxtHooks extends ModuleHooks {}
}


export { default } from './module'
