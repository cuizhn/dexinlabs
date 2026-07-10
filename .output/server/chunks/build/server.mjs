import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { hasInjectionContext, inject, getCurrentInstance, defineAsyncComponent, defineComponent, h, computed, unref, shallowRef, provide, shallowReactive, ref, Suspense, Fragment, createElementBlock, cloneVNode, isRef, toValue, onServerPrefetch, reactive, createApp, onErrorCaptured, createVNode, resolveDynamicComponent, effectScope, nextTick, toRef, mergeProps, withCtx, getCurrentScope, isReadonly, useSSRContext, isShallow, isReactive, toRaw } from 'vue';
import { v as parseURL, m as encodePath, x as decodePath, h as hasProtocol, i as isScriptProtocol, j as joinURL, y as withQuery, z as sanitizeStatusCode, A as getContext, $ as $fetch, B as hash, C as defu, e as createError$1, D as executeAsync } from '../_/nitro.mjs';
import { u as useHead$1, h as headSymbol, b as baseURL } from '../routes/renderer.mjs';
import { useRoute as useRoute$1, RouterView, createMemoryHistory, createRouter, START_LOCATION } from 'vue-router';
import { sql, relations, desc, asc, eq, and, or } from 'drizzle-orm';
import { pgTable, timestamp, text, integer, varchar, serial, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { marked } from 'marked';
import { ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode, ssrRenderAttrs } from 'vue/server-renderer';
import { isPlainObject } from '@vue/shared';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

function flatHooks(configHooks, hooks = {}, parentName) {
	for (const key in configHooks) {
		const subHook = configHooks[key];
		const name = parentName ? `${parentName}:${key}` : key;
		if (typeof subHook === "object" && subHook !== null) flatHooks(subHook, hooks, name);
		else if (typeof subHook === "function") hooks[name] = subHook;
	}
	return hooks;
}
const createTask = /* @__PURE__ */ (() => {
	if (console.createTask) return console.createTask;
	const defaultTask = { run: (fn) => fn() };
	return () => defaultTask;
})();
function callHooks(hooks, args, startIndex, task) {
	for (let i = startIndex; i < hooks.length; i += 1) try {
		const result = task ? task.run(() => hooks[i](...args)) : hooks[i](...args);
		if (result && typeof result.then === "function") return Promise.resolve(result).then(() => callHooks(hooks, args, i + 1, task));
	} catch (error) {
		return Promise.reject(error);
	}
}
function serialTaskCaller(hooks, args, name) {
	if (hooks.length > 0) return callHooks(hooks, args, 0, createTask(name));
}
function parallelTaskCaller(hooks, args, name) {
	if (hooks.length > 0) {
		const task = createTask(name);
		return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
	}
}
function callEachWith(callbacks, arg0) {
	for (const callback of [...callbacks]) callback(arg0);
}
var Hookable = class {
	_hooks;
	_before;
	_after;
	_deprecatedHooks;
	_deprecatedMessages;
	constructor() {
		this._hooks = {};
		this._before = void 0;
		this._after = void 0;
		this._deprecatedMessages = void 0;
		this._deprecatedHooks = {};
		this.hook = this.hook.bind(this);
		this.callHook = this.callHook.bind(this);
		this.callHookWith = this.callHookWith.bind(this);
	}
	hook(name, function_, options = {}) {
		if (!name || typeof function_ !== "function") return () => {};
		const originalName = name;
		let dep;
		while (this._deprecatedHooks[name]) {
			dep = this._deprecatedHooks[name];
			name = dep.to;
		}
		if (dep && !options.allowDeprecated) {
			let message = dep.message;
			if (!message) message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
			if (!this._deprecatedMessages) this._deprecatedMessages = /* @__PURE__ */ new Set();
			if (!this._deprecatedMessages.has(message)) {
				console.warn(message);
				this._deprecatedMessages.add(message);
			}
		}
		if (!function_.name) try {
			Object.defineProperty(function_, "name", {
				get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
				configurable: true
			});
		} catch {}
		this._hooks[name] = this._hooks[name] || [];
		this._hooks[name].push(function_);
		return () => {
			if (function_) {
				this.removeHook(name, function_);
				function_ = void 0;
			}
		};
	}
	hookOnce(name, function_) {
		let _unreg;
		let _function = (...arguments_) => {
			if (typeof _unreg === "function") _unreg();
			_unreg = void 0;
			_function = void 0;
			return function_(...arguments_);
		};
		_unreg = this.hook(name, _function);
		return _unreg;
	}
	removeHook(name, function_) {
		const hooks = this._hooks[name];
		if (hooks) {
			const index = hooks.indexOf(function_);
			if (index !== -1) hooks.splice(index, 1);
			if (hooks.length === 0) this._hooks[name] = void 0;
		}
	}
	clearHook(name) {
		this._hooks[name] = void 0;
	}
	deprecateHook(name, deprecated) {
		this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
		const _hooks = this._hooks[name] || [];
		this._hooks[name] = void 0;
		for (const hook of _hooks) this.hook(name, hook);
	}
	deprecateHooks(deprecatedHooks) {
		for (const name in deprecatedHooks) this.deprecateHook(name, deprecatedHooks[name]);
	}
	addHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		const removeFns = Object.keys(hooks).map((key) => this.hook(key, hooks[key]));
		return () => {
			for (const unreg of removeFns) unreg();
			removeFns.length = 0;
		};
	}
	removeHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		for (const key in hooks) this.removeHook(key, hooks[key]);
	}
	removeAllHooks() {
		this._hooks = {};
	}
	callHook(name, ...args) {
		return this.callHookWith(serialTaskCaller, name, args);
	}
	callHookParallel(name, ...args) {
		return this.callHookWith(parallelTaskCaller, name, args);
	}
	callHookWith(caller, name, args) {
		const event = this._before || this._after ? {
			name,
			args,
			context: {}
		} : void 0;
		if (this._before) callEachWith(this._before, event);
		const result = caller(this._hooks[name] ? [...this._hooks[name]] : [], args, name);
		if (result instanceof Promise) return result.finally(() => {
			if (this._after && event) callEachWith(this._after, event);
		});
		if (this._after && event) callEachWith(this._after, event);
		return result;
	}
	beforeEach(function_) {
		this._before = this._before || [];
		this._before.push(function_);
		return () => {
			if (this._before !== void 0) {
				const index = this._before.indexOf(function_);
				if (index !== -1) this._before.splice(index, 1);
			}
		};
	}
	afterEach(function_) {
		this._after = this._after || [];
		this._after.push(function_);
		return () => {
			if (this._after !== void 0) {
				const index = this._after.indexOf(function_);
				if (index !== -1) this._after.splice(index, 1);
			}
		};
	}
};
function createHooks() {
	return new Hookable();
}

//#region src/index.ts
const DEBOUNCE_DEFAULTS = { trailing: true };
/**
Debounce functions
@param fn - Promise-returning/async function to debounce.
@param wait - Milliseconds to wait before calling `fn`. Default value is 25ms
@returns A function that delays calling `fn` until after `wait` milliseconds have elapsed since the last time it was called.
@example
```
import { debounce } from 'perfect-debounce';
const expensiveCall = async input => input;
const debouncedFn = debounce(expensiveCall, 200);
for (const number of [1, 2, 3]) {
console.log(await debouncedFn(number));
}
//=> 1
//=> 2
//=> 3
```
*/
function debounce(fn, wait = 25, options = {}) {
	options = {
		...DEBOUNCE_DEFAULTS,
		...options
	};
	if (!Number.isFinite(wait)) throw new TypeError("Expected `wait` to be a finite number");
	let leadingValue;
	let timeout;
	let resolveList = [];
	let currentPromise;
	let trailingArgs;
	const applyFn = (_this, args) => {
		currentPromise = _applyPromised(fn, _this, args);
		currentPromise.finally(() => {
			currentPromise = null;
			if (options.trailing && trailingArgs && !timeout) {
				const promise = applyFn(_this, trailingArgs);
				trailingArgs = null;
				return promise;
			}
		});
		return currentPromise;
	};
	const debounced = function(...args) {
		if (options.trailing) trailingArgs = args;
		if (currentPromise) return currentPromise;
		return new Promise((resolve) => {
			const shouldCallNow = !timeout && options.leading;
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				timeout = null;
				const promise = options.leading ? leadingValue : applyFn(this, args);
				trailingArgs = null;
				for (const _resolve of resolveList) _resolve(promise);
				resolveList = [];
			}, wait);
			if (shouldCallNow) {
				leadingValue = applyFn(this, args);
				resolve(leadingValue);
			} else resolveList.push(resolve);
		});
	};
	const _clearTimeout = (timer) => {
		if (timer) {
			clearTimeout(timer);
			timeout = null;
		}
	};
	debounced.isPending = () => !!timeout;
	debounced.cancel = () => {
		_clearTimeout(timeout);
		resolveList = [];
		trailingArgs = null;
	};
	debounced.flush = () => {
		_clearTimeout(timeout);
		if (!trailingArgs || currentPromise) return;
		const args = trailingArgs;
		trailingArgs = null;
		return applyFn(this, args);
	};
	return debounced;
}
async function _applyPromised(fn, _this, args) {
	return await fn.apply(_this, args);
}

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const appLayoutTransition = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const asyncDataDefaults = { "deep": false };
const fetchDefaults = {};
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    versions: {
      get nuxt() {
        return "4.4.8";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _state: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    const unresolvedPluginsForThisPlugin = plugin2.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin2.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin2.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = /* @__PURE__ */ Symbol("layout-meta");
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
const HTML_ATTR_ENCODE_MAP = {
  "&": "%26",
  '"': "%22",
  "'": "%27",
  "<": "%3C",
  ">": "%3E"
};
function encodeForHtmlAttr(value) {
  return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedHeader = encodeURL(location2, isExternalHost);
        const encodedLoc = encodeForHtmlAttr(encodedHeader);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    const pathname = url.pathname.replace(/^\/{2,}/, "/");
    return pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
function freezeHead(head) {
  const realPush = head.push;
  head.push = () => ({ dispose: () => {
  }, patch: () => {
  }, _poll: () => {
  } });
  return () => {
    head.push = realPush;
  };
}
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    if (nuxtApp.ssrContext.islandContext) {
      const unfreeze = freezeHead(head);
      nuxtApp.hooks.hookOnce("app:created", unfreeze);
    }
    nuxtApp.vueApp.use(head);
  }
});
function toArray$1(value) {
  return Array.isArray(value) ? value : [value];
}
const matcher = (m, p) => {
  return [];
};
const _routeRulesMatcher = (path) => defu({}, ...matcher("", typeof path === "string" ? path.toLowerCase() : path).map((r) => r.data).reverse());
const routeRulesMatcher$1 = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher$1(path.toLowerCase());
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
const _routes = [
  {
    name: "course-chapter-lesson",
    path: "/course/:chapter()/:lesson()",
    component: () => import('./_lesson_-Bqifbk3Z.mjs')
  },
  {
    name: "course-chapter",
    path: "/course/:chapter()",
    component: () => import('./index-DhIWmH-B.mjs')
  },
  {
    name: "exercise-chapter",
    path: "/exercise/:chapter()",
    component: () => import('./_chapter_-Y8ZyeHJs.mjs')
  },
  {
    name: "about",
    path: "/about",
    component: () => import('./about-DLuCuV9s.mjs')
  },
  {
    name: "course",
    path: "/course",
    component: () => import('./index-DjuUE6Uj.mjs')
  },
  {
    name: "methods",
    path: "/methods",
    component: () => import('./methods-DXxut2KI.mjs')
  },
  {
    name: "study",
    path: "/study",
    component: () => import('./study-cyw5Atxq.mjs')
  },
  {
    name: "index",
    path: "/",
    component: () => import('./index-PeECCvq_.mjs')
  }
];
const _wrapInTransition = (props, children) => {
  return { default: () => children.default?.() };
};
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
  const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index2) => comp.components && comp.components.default === from.matched[index2]?.components?.default
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
function _mergeTransitionProps(routeProps) {
  const _props = [];
  for (const prop of routeProps) {
    if (!prop) {
      continue;
    }
    _props.push({
      ...prop,
      onAfterLeave: prop.onAfterLeave ? toArray(prop.onAfterLeave) : void 0,
      onBeforeLeave: prop.onBeforeLeave ? toArray(prop.onBeforeLeave) : void 0
    });
  }
  return defu(..._props);
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    const hashScrollBehaviour = useRouter().options?.scrollBehaviorType ?? "auto";
    if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior: hashScrollBehaviour };
      }
      return false;
    }
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (routeAllowsScrollToTop === false) {
      return false;
    }
    if (from === START_LOCATION) {
      return _calculatePosition(to, from, savedPosition, hashScrollBehaviour);
    }
    return new Promise((resolve) => {
      const doScroll = () => {
        requestAnimationFrame(() => resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour)));
      };
      nuxtApp.hooks.hookOnce("page:loading:end", () => {
        const transitionPromise = nuxtApp["~transitionPromise"];
        if (transitionPromise) {
          transitionPromise.then(doScroll);
        } else {
          doScroll();
        }
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
  if (savedPosition) {
    return savedPosition;
  }
  if (to.hash) {
    return {
      el: to.hash,
      top: _getHashElementScrollMarginTop(to.hash),
      behavior: isChangingPage(to, from) ? defaultHashScrollBehaviour : "instant"
    };
  }
  return {
    left: 0,
    top: 0
  };
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  if (!to.meta?.validate) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    fatal: false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    status: result && (result.status || result.statusCode) || 404,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  return error;
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  manifest_45route_45rule
];
const namedMiddleware = {};
Object.assign(/* @__PURE__ */ Object.create(null), {});
const pageIslandRoutes = Object.assign(/* @__PURE__ */ Object.create(null), {});
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const history = routerOptions.history?.(routerBase) ?? createMemoryHistory(routerBase);
    const routes = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    router.afterEach((to, from) => {
      const lastTo = to.matched.at(-1)?.components?.default;
      const lastFrom = from.matched.at(-1)?.components?.default;
      if (lastTo === lastFrom) {
        syncCurrentRoute();
        return;
      }
      if (to.matched.length < from.matched.length && to.matched.every((m, i) => m.components?.default === from.matched[i]?.components?.default)) {
        syncCurrentRoute();
      }
    });
    const route = { sync: syncCurrentRoute };
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const error = /* @__PURE__ */ useError();
    const isServerPage = nuxtApp.ssrContext?.islandContext?.name?.startsWith("page_");
    if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if (failure?.type === 4) {
          return;
        }
        if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    const hasDeferredRoute = false;
    syncCurrentRoute();
    if (nuxtApp.ssrContext?.islandContext && !isServerPage) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray$1(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        const routeRules = getRouteRules({ path: to.path });
        if (routeRules.appMiddleware) {
          for (const key in routeRules.appMiddleware) {
            if (routeRules.appMiddleware[key]) {
              middlewareEntries.add(key);
            } else {
              middlewareEntries.delete(key);
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await namedMiddleware[entry2]?.().then((r) => r.default || r) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          try {
            if (false) ;
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            if (true) {
              if (result === false || result instanceof Error) {
                const error2 = result || createError({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`
                });
                await nuxtApp.runWithContext(() => showError(error2));
                return false;
              }
            }
            if (result === true) {
              continue;
            }
            if (result === false) {
              return result;
            }
            if (result) {
              if (isNuxtError(result) && result.fatal) {
                await nuxtApp.runWithContext(() => showError(result));
              }
              return result;
            }
          } catch (err) {
            const error2 = createError(err);
            if (error2.fatal) {
              await nuxtApp.runWithContext(() => showError(error2));
            }
            return error2;
          }
        }
      }
    });
    if (isServerPage) {
      router.beforeResolve((to) => {
        const expected = pageIslandRoutes[nuxtApp.ssrContext.islandContext.name];
        const actual = to.matched.find((m) => m.components?.default?.__nuxt_island)?.components?.default;
        if (!expected || expected !== actual?.__nuxt_island) {
          nuxtApp.ssrContext["~renderResponse"] = {
            statusCode: 400,
            statusMessage: "Invalid island request path"
          };
          return false;
        }
      });
    }
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach((to) => {
      if (to.matched.length === 0 && !error.value) {
        return nuxtApp.runWithContext(() => showError(createError({
          status: 404,
          fatal: false,
          statusText: `Page not found: ${to.fullPath}`,
          data: {
            path: to.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        if (hasDeferredRoute) ;
        else {
          await router.replace({
            ...resolvedInitialRoute,
            force: true
          });
        }
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
function injectHead(nuxtApp) {
  const nuxt = nuxtApp || useNuxtApp();
  return nuxt.ssrContext?.head || nuxt.runWithContext(() => {
    if (hasInjectionContext()) {
      const head = inject(headSymbol);
      if (!head) {
        throw new Error("[nuxt] [unhead] Missing Unhead instance.");
      }
      return head;
    }
  });
}
function useHead(input, options = {}) {
  const head = options.head || injectHead(options.nuxt);
  return useHead$1(input, { head, ...options });
}
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const components_plugin_4kY4pyzJIYX99vmMAAIorFf3CnAaptHitJgf7JxiED8 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  order: integer("display_order").default(0).notNull(),
  cover: text("cover"),
  edition: text("edition"),
  body: text("body"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).$onUpdateFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => ({
  coursesSlugUnique: uniqueIndex("idx_courses_slug_unique").on(table.slug),
  coursesOrderIdx: index("idx_courses_order").on(table.order),
  coursesSlugIdx: index("idx_courses_slug").on(table.slug)
}));
const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  order: integer("display_order").default(0).notNull(),
  course: varchar("course_slug", { length: 255 }),
  cover: text("cover"),
  body: text("body"),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).$onUpdateFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => ({
  chaptersSlugUnique: uniqueIndex("idx_chapters_slug_unique").on(table.slug),
  chaptersCourseIdx: index("idx_chapters_course_id").on(table.courseId),
  chaptersOrderIdx: index("idx_chapters_order").on(table.order),
  chaptersSlugIdx: index("idx_chapters_slug").on(table.slug),
  chaptersCourseSlugIdx: index("idx_chapters_course_slug").on(table.course)
}));
const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  order: integer("display_order").default(0).notNull(),
  chapter: varchar("chapter_slug", { length: 255 }),
  objectives: text("objectives"),
  intro: text("intro"),
  body: text("body"),
  summaryText: text("summary_text"),
  notes: text("notes"),
  chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).$onUpdateFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => ({
  lessonsSlugUnique: uniqueIndex("idx_lessons_slug_unique").on(table.slug),
  lessonsChapterIdx: index("idx_lessons_chapter_id").on(table.chapterId),
  lessonsOrderIdx: index("idx_lessons_order").on(table.order),
  lessonsSlugIdx: index("idx_lessons_slug").on(table.slug),
  lessonsChapterSlugIdx: index("idx_lessons_chapter_slug").on(table.chapter)
}));
const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  description: text("description"),
  body: text("body"),
  order: integer("display_order").default(0).notNull(),
  chapter: varchar("chapter_slug", { length: 255 }),
  hint: text("hint"),
  answer: text("answer"),
  analysis: text("analysis"),
  chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).$onUpdateFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => ({
  exercisesSlugUnique: uniqueIndex("idx_exercises_slug_unique").on(table.slug),
  exercisesChapterIdx: index("idx_exercises_chapter_id").on(table.chapterId),
  exercisesOrderIdx: index("idx_exercises_order").on(table.order),
  exercisesSlugIdx: index("idx_exercises_slug").on(table.slug),
  exercisesChapterSlugIdx: index("idx_exercises_chapter_slug").on(table.chapter)
}));
const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 64 }).default("file").notNull(),
  url: text("url").notNull(),
  mime: varchar("mime", { length: 128 }),
  size: integer("size_bytes"),
  meta: text("meta"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).default(sql`timezone('utc'::text, now())`).$onUpdateFn(() => /* @__PURE__ */ new Date()).notNull()
}, (table) => ({
  assetsSlugUnique: uniqueIndex("idx_assets_slug_unique").on(table.slug)
}));
const coursesRelations = relations(courses, ({ many }) => ({
  chapters: many(chapters)
}));
const chaptersRelations = relations(chapters, ({ one, many }) => ({
  courseRef: one(courses, {
    fields: [chapters.courseId],
    references: [courses.id]
  }),
  lessons: many(lessons),
  exercises: many(exercises)
}));
const lessonsRelations = relations(lessons, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [lessons.chapterId],
    references: [chapters.id]
  })
}));
const exercisesRelations = relations(exercises, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [exercises.chapterId],
    references: [chapters.id]
  })
}));
const schema = {
  courses,
  chapters,
  lessons,
  exercises,
  assets,
  coursesRelations,
  chaptersRelations,
  lessonsRelations,
  exercisesRelations
};
const schema$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  assets,
  chapters,
  chaptersRelations,
  courses,
  coursesRelations,
  default: schema,
  exercises,
  exercisesRelations,
  lessons,
  lessonsRelations,
  schema
}, Symbol.toStringTag, { value: "Module" }));
let _poolInstance = null;
let _dbInstance = null;
function ensureDbInitialized() {
  if (!_dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("[server/database/connection] process.env.DATABASE_URL is empty. Ensure env var is set.");
    }
    const poolConfig = { connectionString };
    _poolInstance = new Pool(poolConfig);
    _dbInstance = drizzle(_poolInstance, { schema: schema$1 });
  }
  return _dbInstance;
}
function createDb(options = {}) {
  const connectionString = options.connectionString || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "[server/database/connection] DATABASE_URL is missing. Either set env DATABASE_URL or pass connectionString explicitly."
    );
  }
  const pool = options.pool || new Pool({ connectionString });
  return drizzle(pool, { schema: schema$1 });
}
function getDb() {
  return ensureDbInitialized();
}
async function closeDb() {
  if (_poolInstance) {
    try {
      await _poolInstance.end();
    } catch {
    } finally {
      _poolInstance = null;
      _dbInstance = null;
    }
  }
}
const dbOperations = [
  "select",
  "insert",
  "update",
  "delete",
  "execute",
  "query",
  "run"
];
const db = new Proxy({}, {
  get(_target, prop, _receiver) {
    if (typeof prop === "symbol") {
      return void 0;
    }
    const key = prop;
    if (dbOperations.includes(key) || key === "transaction") {
      const instance = ensureDbInitialized();
      const fn = instance[prop];
      if (typeof fn === "function") {
        return ((...args) => fn.apply(instance, args));
      }
      return fn;
    }
    return Reflect.get(ensureDbInitialized(), prop);
  },
  has(_target, prop) {
    return prop in ensureDbInitialized();
  },
  ownKeys(_target) {
    return Object.keys(ensureDbInitialized());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(ensureDbInitialized(), prop);
  }
});
class CourseRepository {
  _explicitDb;
  table;
  constructor(db2) {
    this._explicitDb = db2 || null;
    this.table = courses;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  async list({ orderBy = "order", order = "asc" } = {}) {
    const sortDir = order.toLowerCase() === "desc" ? desc : asc;
    const sortCol = orderBy === "id" ? this.table.id : this.table.order;
    return this._getDb().select().from(this.table).orderBy(sortDir(sortCol));
  }
  async getBySlug(slug) {
    if (!slug) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.slug, slug)).limit(1);
    return rows[0] || null;
  }
  async getById(id) {
    if (!id) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.id, Number(id))).limit(1);
    return rows[0] || null;
  }
  async getDefault() {
    let row = await this.getBySlug("pep-7a");
    if (!row) {
      const rows = await this._getDb().select().from(this.table).orderBy(asc(this.table.order), asc(this.table.id)).limit(1);
      row = rows[0] || null;
    }
    return row;
  }
  async count() {
    const rows = await this._getDb().select({
      count: sql`count(*)`.mapWith(Number)
    }).from(this.table);
    return Number(rows[0]?.count ?? 0);
  }
  async create(data) {
    const rows = await this._getDb().insert(this.table).values(data).returning();
    return rows[0] || null;
  }
  async updateBySlug(slug, data) {
    const patch = { ...data, updatedAt: /* @__PURE__ */ new Date() };
    delete patch.id;
    delete patch.slug;
    delete patch.createdAt;
    const rows = await this._getDb().update(this.table).set(patch).where(eq(this.table.slug, slug)).returning();
    return rows[0] || null;
  }
  async upsert(data) {
    const { id, createdAt, ...rest } = data || {};
    const payload = { ...rest };
    const onConflictSet = { ...rest };
    delete onConflictSet.slug;
    onConflictSet.updatedAt = /* @__PURE__ */ new Date();
    const rows = await this._getDb().insert(this.table).values(payload).onConflictDoUpdate({
      target: this.table.slug,
      set: onConflictSet
    }).returning();
    return rows[0] || null;
  }
  async deleteBySlug(slug) {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug));
  }
}
const courseRepository = new CourseRepository();
class ChapterRepository {
  _explicitDb;
  table;
  constructor(db2) {
    this._explicitDb = db2 || null;
    this.table = chapters;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  _buildWhere({ course, courseId, slug } = {}) {
    const clauses = [];
    if (slug) clauses.push(eq(this.table.slug, slug));
    if (courseId) clauses.push(eq(this.table.courseId, Number(courseId)));
    if (course) clauses.push(eq(this.table.course, course));
    return clauses.length ? and(...clauses) : void 0;
  }
  async list({ course, courseId, orderBy = "order", order = "asc" } = {}) {
    const sortDir = order.toLowerCase() === "desc" ? desc : asc;
    const sortCol = orderBy === "id" ? this.table.id : this.table.order;
    const where = this._buildWhere({ course, courseId });
    let query = this._getDb().select().from(this.table);
    if (where) query = query.where(where);
    return query.orderBy(sortDir(sortCol));
  }
  async listByCourse(courseSlug) {
    if (!courseSlug) return [];
    const rows = await this._getDb().select({
      id: this.table.id,
      slug: this.table.slug,
      title: this.table.title,
      summary: this.table.summary,
      order: this.table.order,
      course: this.table.course,
      cover: this.table.cover,
      body: this.table.body,
      courseId: this.table.courseId,
      createdAt: this.table.createdAt,
      updatedAt: this.table.updatedAt
    }).from(this.table).leftJoin(courses, eq(this.table.courseId, courses.id)).where(
      or(
        eq(this.table.course, courseSlug),
        eq(courses.slug, courseSlug)
      )
    ).orderBy(asc(this.table.order), asc(this.table.id));
    return rows;
  }
  async getBySlug(slug) {
    if (!slug) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.slug, slug)).limit(1);
    return rows[0] || null;
  }
  async getById(id) {
    if (!id) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.id, Number(id))).limit(1);
    return rows[0] || null;
  }
  async count(filters = {}) {
    const where = this._buildWhere(filters);
    let query = this._getDb().select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
    return Number(rows[0]?.count ?? 0);
  }
  async create(data) {
    const rows = await this._getDb().insert(this.table).values(data).returning();
    return rows[0] || null;
  }
  async updateBySlug(slug, data) {
    const patch = { ...data, updatedAt: /* @__PURE__ */ new Date() };
    delete patch.id;
    delete patch.slug;
    delete patch.createdAt;
    const rows = await this._getDb().update(this.table).set(patch).where(eq(this.table.slug, slug)).returning();
    return rows[0] || null;
  }
  async upsert(data) {
    const { id, createdAt, ...rest } = data || {};
    const payload = { ...rest };
    const onConflictSet = { ...rest };
    delete onConflictSet.slug;
    onConflictSet.updatedAt = /* @__PURE__ */ new Date();
    const rows = await this._getDb().insert(this.table).values(payload).onConflictDoUpdate({
      target: this.table.slug,
      set: onConflictSet
    }).returning();
    return rows[0] || null;
  }
  async deleteBySlug(slug) {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug));
  }
}
const chapterRepository = new ChapterRepository();
class LessonRepository {
  _explicitDb;
  table;
  constructor(db2) {
    this._explicitDb = db2 || null;
    this.table = lessons;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  _buildWhere({ chapter, chapterId, slug } = {}) {
    const clauses = [];
    if (slug) clauses.push(eq(this.table.slug, slug));
    if (chapterId) clauses.push(eq(this.table.chapterId, Number(chapterId)));
    if (chapter) clauses.push(eq(this.table.chapter, chapter));
    return clauses.length ? and(...clauses) : void 0;
  }
  async list({ chapter, chapterId, orderBy = "order", order = "asc" } = {}) {
    const sortDir = order.toLowerCase() === "desc" ? desc : asc;
    const sortCol = orderBy === "id" ? this.table.id : this.table.order;
    const where = this._buildWhere({ chapter, chapterId });
    let query = this._getDb().select().from(this.table);
    if (where) query = query.where(where);
    return query.orderBy(sortDir(sortCol));
  }
  async listByChapter(chapterSlug) {
    if (!chapterSlug) return [];
    const rows = await this._getDb().select({
      id: this.table.id,
      slug: this.table.slug,
      title: this.table.title,
      summary: this.table.summary,
      order: this.table.order,
      chapter: this.table.chapter,
      objectives: this.table.objectives,
      intro: this.table.intro,
      body: this.table.body,
      summaryText: this.table.summaryText,
      notes: this.table.notes,
      chapterId: this.table.chapterId,
      createdAt: this.table.createdAt,
      updatedAt: this.table.updatedAt
    }).from(this.table).leftJoin(chapters, eq(this.table.chapterId, chapters.id)).where(
      or(
        eq(this.table.chapter, chapterSlug),
        eq(chapters.slug, chapterSlug)
      )
    ).orderBy(asc(this.table.order), asc(this.table.id));
    return rows;
  }
  async getBySlug(slug) {
    if (!slug) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.slug, slug)).limit(1);
    return rows[0] || null;
  }
  async getById(id) {
    if (!id) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.id, Number(id))).limit(1);
    return rows[0] || null;
  }
  async count(filters = {}) {
    const where = this._buildWhere(filters);
    let query = this._getDb().select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
    return Number(rows[0]?.count ?? 0);
  }
  async create(data) {
    const rows = await this._getDb().insert(this.table).values(data).returning();
    return rows[0] || null;
  }
  async updateBySlug(slug, data) {
    const patch = { ...data, updatedAt: /* @__PURE__ */ new Date() };
    delete patch.id;
    delete patch.slug;
    delete patch.createdAt;
    const rows = await this._getDb().update(this.table).set(patch).where(eq(this.table.slug, slug)).returning();
    return rows[0] || null;
  }
  async upsert(data) {
    const { id, createdAt, ...rest } = data || {};
    const payload = { ...rest };
    const onConflictSet = { ...rest };
    delete onConflictSet.slug;
    onConflictSet.cyc = /* @__PURE__ */ new Date();
    const rows = await this._getDb().insert(this.table).values(payload).onConflictDoUpdate({
      target: this.table.slug,
      set: onConflictSet
    }).returning();
    return rows[0] || null;
  }
  async deleteBySlug(slug) {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug));
  }
}
const lessonRepository = new LessonRepository();
class ExerciseRepository {
  _explicitDb;
  table;
  constructor(db2) {
    this._explicitDb = db2 || null;
    this.table = exercises;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  _buildWhere({ chapter, chapterId, slug } = {}) {
    const clauses = [];
    if (slug) clauses.push(eq(this.table.slug, slug));
    if (chapterId) clauses.push(eq(this.table.chapterId, Number(chapterId)));
    if (chapter) clauses.push(eq(this.table.chapter, chapter));
    return clauses.length ? and(...clauses) : void 0;
  }
  async list({ chapter, chapterId, orderBy = "order", order = "asc" } = {}) {
    const sortDir = order.toLowerCase() === "desc" ? desc : asc;
    const sortCol = orderBy === "id" ? this.table.id : this.table.order;
    const where = this._buildWhere({ chapter, chapterId });
    let query = this._getDb().select().from(this.table);
    if (where) query = query.where(where);
    return query.orderBy(sortDir(sortCol));
  }
  async listByChapter(chapterSlug) {
    if (!chapterSlug) return [];
    const rows = await this._getDb().select({
      id: this.table.id,
      slug: this.table.slug,
      title: this.table.title,
      summary: this.table.summary,
      description: this.table.description,
      body: this.table.body,
      order: this.table.order,
      chapter: this.table.chapter,
      hint: this.table.hint,
      answer: this.table.answer,
      analysis: this.table.analysis,
      chapterId: this.table.chapterId,
      createdAt: this.table.createdAt,
      updatedAt: this.table.updatedAt
    }).from(this.table).leftJoin(chapters, eq(this.table.chapterId, chapters.id)).where(
      or(
        eq(this.table.chapter, chapterSlug),
        eq(chapters.slug, chapterSlug)
      )
    ).orderBy(asc(this.table.order), asc(this.table.id));
    return rows;
  }
  async getBySlug(slug) {
    if (!slug) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.slug, slug)).limit(1);
    return rows[0] || null;
  }
  async getById(id) {
    if (!id) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.id, Number(id))).limit(1);
    return rows[0] || null;
  }
  async getOneByChapter(chapterSlug) {
    if (!chapterSlug) return null;
    const list = await this.listByChapter(chapterSlug);
    return list[0] || null;
  }
  async count(filters = {}) {
    const where = this._buildWhere(filters);
    let query = this._getDb().select({ count: sql`count(*)`.mapWith(Number) }).from(this.table);
    if (where) query = query.where(where);
    const rows = await query;
    return Number(rows[0]?.count ?? 0);
  }
  async create(data) {
    const rows = await this._getDb().insert(this.table).values(data).returning();
    return rows[0] || null;
  }
  async updateBySlug(slug, data) {
    const patch = { ...data, updatedAt: /* @__PURE__ */ new Date() };
    delete patch.id;
    delete patch.slug;
    delete patch.createdAt;
    const rows = await this._getDb().update(this.table).set(patch).where(eq(this.table.slug, slug)).returning();
    return rows[0] || null;
  }
  async upsert(data) {
    const { id, createdAt, ...rest } = data || {};
    const payload = { ...rest };
    const onConflictSet = { ...rest };
    delete onConflictSet.slug;
    onConflictSet.updatedAt = /* @__PURE__ */ new Date();
    const rows = await this._getDb().insert(this.table).values(payload).onConflictDoUpdate({
      target: this.table.slug,
      set: onConflictSet
    }).returning();
    return rows[0] || null;
  }
  async deleteBySlug(slug) {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug));
  }
}
const exerciseRepository = new ExerciseRepository();
class AssetRepository {
  _explicitDb;
  table;
  constructor(db2) {
    this._explicitDb = db2 || null;
    this.table = assets;
  }
  _getDb() {
    return this._explicitDb || getDb();
  }
  async list({ type, orderBy = "id", order = "asc" } = {}) {
    const sortDir = order.toLowerCase() === "desc" ? desc : asc;
    let query = this._getDb().select().from(this.table);
    if (type) query = query.where(eq(this.table.type, type));
    const sortColumn = this.table[orderBy] || this.table.id;
    return query.orderBy(sortDir(sortColumn));
  }
  async getBySlug(slug) {
    if (!slug) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.slug, slug)).limit(1);
    return rows[0] || null;
  }
  async getById(id) {
    if (!id) return null;
    const rows = await this._getDb().select().from(this.table).where(eq(this.table.id, Number(id))).limit(1);
    return rows[0] || null;
  }
  async count() {
    const rows = await this._getDb().select({
      count: sql`count(*)`.mapWith(Number)
    }).from(this.table);
    return Number(rows[0]?.count ?? 0);
  }
  async create(data) {
    const rows = await this._getDb().insert(this.table).values(data).returning();
    return rows[0] || null;
  }
  async updateBySlug(slug, data) {
    const patch = { ...data, updatedAt: /* @__PURE__ */ new Date() };
    delete patch.id;
    delete patch.slug;
    delete patch.createdAt;
    const rows = await this._getDb().update(this.table).set(patch).where(eq(this.table.slug, slug)).returning();
    return rows[0] || null;
  }
  async upsert(data) {
    const { id, createdAt, ...rest } = data || {};
    const payload = { ...rest };
    const onConflictSet = { ...rest };
    delete onConflictSet.slug;
    onConflictSet.updatedAt = /* @__PURE__ */ new Date();
    const rows = await this._getDb().insert(this.table).values(payload).onConflictDoUpdate({
      target: this.table.slug,
      set: onConflictSet
    }).returning();
    return rows[0] || null;
  }
  async deleteBySlug(slug) {
    return this._getDb().delete(this.table).where(eq(this.table.slug, slug));
  }
}
const assetRepository = new AssetRepository();
function toNumberOrUndefined(value) {
  if (value === null || value === void 0 || value === "") return void 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : void 0;
}
function normalizeSort(input = {}) {
  const orderBy = input.orderBy === "id" || input.orderBy === "order" ? input.orderBy : "order";
  const order = input.order === "asc" || input.order === "desc" ? input.order : "asc";
  return { orderBy, order };
}
function normalizePaginate(input = {}) {
  const result = {};
  const limit = toNumberOrUndefined(input.limit);
  const offset = toNumberOrUndefined(input.offset);
  if (limit !== void 0 && limit > 0) result.limit = limit;
  if (offset !== void 0 && offset >= 0) result.offset = offset;
  return result;
}
function normalizeBySlug(input) {
  const slug = typeof input === "string" ? input : input && typeof input === "object" ? input.slug : "";
  const clean = String(slug || "").trim();
  if (!clean) {
    return { slug: "", isValid: false, error: "slug is required" };
  }
  return { slug: clean, isValid: true };
}
function normalizeByCourse(input) {
  const raw = typeof input === "string" ? { courseSlug: input } : input && typeof input === "object" ? input : {};
  const courseSlugRaw = raw.courseSlug !== void 0 && raw.courseSlug !== null ? raw.courseSlug : raw.course;
  const courseSlug = typeof courseSlugRaw === "string" ? courseSlugRaw.trim() : void 0;
  const courseId = toNumberOrUndefined(raw.courseId);
  if (!courseSlug && courseId === void 0) {
    return { isValid: false, error: "courseSlug or courseId is required" };
  }
  return {
    courseSlug,
    courseId,
    isValid: true
  };
}
function normalizeByChapter(input) {
  const raw = typeof input === "string" ? { chapterSlug: input } : input && typeof input === "object" ? input : {};
  const chapterSlugRaw = raw.chapterSlug !== void 0 && raw.chapterSlug !== null ? raw.chapterSlug : raw.chapter;
  const chapterSlug = typeof chapterSlugRaw === "string" ? chapterSlugRaw.trim() : void 0;
  const chapterId = toNumberOrUndefined(raw.chapterId);
  if (!chapterSlug && chapterId === void 0) {
    return { isValid: false, error: "chapterSlug or chapterId is required" };
  }
  return {
    chapterSlug,
    chapterId,
    isValid: true
  };
}
function normalizeListChapters(input) {
  const raw = typeof input === "string" ? { courseSlug: input } : input && typeof input === "object" ? input : {};
  const byCourse = normalizeByCourse({
    course: raw.course,
    courseId: raw.courseId,
    courseSlug: raw.courseSlug
  });
  const sort = normalizeSort(raw);
  const paginate = normalizePaginate(raw);
  return {
    ...byCourse,
    ...sort,
    ...paginate
  };
}
function normalizeListLessons(input) {
  const raw = typeof input === "string" ? { chapterSlug: input } : input && typeof input === "object" ? input : {};
  const byChapter = normalizeByChapter({
    chapter: raw.chapter,
    chapterId: raw.chapterId,
    chapterSlug: raw.chapterSlug
  });
  const sort = normalizeSort(raw);
  const paginate = normalizePaginate(raw);
  return {
    ...byChapter,
    ...sort,
    ...paginate
  };
}
function normalizeListExercises(input) {
  const raw = typeof input === "string" ? { chapterSlug: input } : input && typeof input === "object" ? input : {};
  const byChapter = normalizeByChapter({
    chapter: raw.chapter,
    chapterId: raw.chapterId,
    chapterSlug: raw.chapterSlug
  });
  const sort = normalizeSort(raw);
  const paginate = normalizePaginate(raw);
  return {
    ...byChapter,
    ...sort,
    ...paginate
  };
}
const queries = {
  normalizeBySlug,
  normalizeByCourse,
  normalizeByChapter,
  normalizeListChapters,
  normalizeListLessons,
  normalizeListExercises
};
class CourseService {
  courses;
  chapters;
  lessons;
  constructor({ courses: courses2 = courseRepository, chapters: chapters2 = chapterRepository, lessons: lessons2 = lessonRepository } = {}) {
    this.courses = courses2;
    this.chapters = chapters2;
    this.lessons = lessons2;
  }
  async list() {
    return this.courses.list();
  }
  async getDefault() {
    const course = await this.courses.getDefault();
    if (!course) return null;
    const chapters2 = await this.chapters.listByCourse(course.slug);
    const chaptersAggregated = [];
    for (const chapter of chapters2) {
      const lessons2 = await this.lessons.listByChapter(chapter.slug);
      chaptersAggregated.push({ ...chapter, lessons: lessons2 });
    }
    return { ...course, chapters: chaptersAggregated };
  }
  async getBySlug(slug) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    const course = await this.courses.getBySlug(q.slug);
    if (!course) return null;
    const chapters2 = await this.chapters.listByCourse(course.slug);
    const chaptersAggregated = [];
    for (const chapter of chapters2) {
      const lessons2 = await this.lessons.listByChapter(chapter.slug);
      chaptersAggregated.push({ ...chapter, lessons: lessons2 });
    }
    return { ...course, chapters: chaptersAggregated };
  }
}
const courseService = new CourseService();
class ChapterService {
  chapters;
  lessons;
  exercises;
  constructor({
    chapters: chapters2 = chapterRepository,
    lessons: lessons2 = lessonRepository,
    exercises: exercises2 = exerciseRepository
  } = {}) {
    this.chapters = chapters2;
    this.lessons = lessons2;
    this.exercises = exercises2;
  }
  async list(courseSlug) {
    const q = queries.normalizeListChapters(courseSlug || {});
    if (!courseSlug) return this.chapters.list();
    return this.chapters.listByCourse(q.courseSlug || courseSlug);
  }
  async getBySlug(slug) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    const chapter = await this.chapters.getBySlug(q.slug);
    if (!chapter) return null;
    const lessons2 = await this.lessons.listByChapter(q.slug);
    const exercise = await this.exercises.getOneByChapter(q.slug);
    return {
      chapter,
      lessons: lessons2,
      exercise: exercise || null
    };
  }
}
const chapterService = new ChapterService();
class LessonService {
  lessons;
  chapters;
  constructor({ lessons: lessons2 = lessonRepository, chapters: chapters2 = chapterRepository } = {}) {
    this.lessons = lessons2;
    this.chapters = chapters2;
  }
  async listByChapter(chapterSlug) {
    const q = queries.normalizeByChapter(chapterSlug);
    if (!q.isValid) return [];
    return this.lessons.listByChapter(q.chapterSlug || String(chapterSlug));
  }
  async getBySlug(slug) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    const lesson = await this.lessons.getBySlug(q.slug);
    if (!lesson) return null;
    let chapter = null;
    if (lesson.chapterId) {
      chapter = await this.chapters.getById(lesson.chapterId) || null;
    }
    if (!chapter && lesson.chapter) {
      chapter = await this.chapters.getBySlug(lesson.chapter) || null;
    }
    return { ...lesson, chapter };
  }
}
const lessonService = new LessonService();
class ExerciseService {
  exercises;
  constructor({ exercises: exercises2 = exerciseRepository } = {}) {
    this.exercises = exercises2;
  }
  async listByChapter(chapterSlug) {
    const q = queries.normalizeByChapter(chapterSlug);
    if (!q.isValid) return [];
    return this.exercises.listByChapter(q.chapterSlug || String(chapterSlug));
  }
  async getBySlug(slug) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    return this.exercises.getBySlug(q.slug);
  }
}
const exerciseService = new ExerciseService();
let __initialized = false;
async function ensureInitialized() {
  if (__initialized) return;
  try {
    await Promise.resolve().then(function () { return indexCo65Xgn7; });
  } catch {
  }
  __initialized = true;
}
const facade = {
  async getCourse(slug, opts = {}) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    await ensureInitialized();
    const result = await courseService.getBySlug(q.slug);
    return result;
  },
  async getChapter(slug, opts = {}) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    await ensureInitialized();
    return chapterService.getBySlug(q.slug);
  },
  async getLesson(slug, opts = {}) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    await ensureInitialized();
    return lessonService.getBySlug(q.slug);
  },
  async getExercise(slug, opts = {}) {
    const q = queries.normalizeBySlug(slug);
    if (!q.isValid) return null;
    await ensureInitialized();
    return exerciseService.getBySlug(q.slug);
  },
  async listChapters(opts = {}) {
    const q = queries.normalizeListChapters(opts);
    await ensureInitialized();
    const courseSlug = q.courseSlug || void 0;
    const result = await chapterService.list(courseSlug);
    return result;
  }
};
function getContentEngine() {
  return facade;
}
function parseFrontmatter(raw = "") {
  if (typeof raw !== "string") return { data: raw || {}, content: "" };
  const marker = "---";
  const start = raw.indexOf(marker);
  if (start !== 0) return { data: {}, content: raw };
  const end = raw.indexOf(marker, marker.length);
  if (end === -1) return { data: {}, content: raw };
  const block = raw.slice(marker.length, end).trim();
  const content = raw.slice(end + marker.length);
  const data = {};
  block.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if (v.startsWith('"') && v.endsWith('"') || v.startsWith("'") && v.endsWith("'")) {
      v = v.slice(1, -1);
    }
    if (k) data[k] = v;
  });
  return { data, content };
}
function adapterConvertBlockTokens(tokens) {
  const nodes = [];
  for (const token of tokens) {
    const node = convertBlockToken(token);
    if (node) nodes.push(node);
  }
  return nodes;
}
function convertBlockToken(token) {
  switch (token.type) {
    case "heading":
      return {
        type: "heading",
        depth: token.depth || 1,
        children: adapterConvertInlineTokens(token.tokens || [{ type: "text", text: token.text || "" }])
      };
    case "paragraph":
      return {
        type: "paragraph",
        children: adapterConvertInlineTokens(token.tokens || [{ type: "text", text: token.text || "" }])
      };
    case "code":
      return {
        type: "code",
        lang: token.lang || "",
        value: token.text || ""
      };
    case "blockquote":
      return {
        type: "blockquote",
        children: adapterConvertBlockTokens(token.tokens || [])
      };
    case "list":
      return {
        type: "list",
        ordered: !!token.ordered,
        children: (token.items || []).map((item) => convertListItem(item)).filter(Boolean)
      };
    case "hr":
      return { type: "thematicBreak" };
    case "table":
      return convertTable(token);
    case "html":
      return { type: "html", value: token.text || token.raw || "" };
    case "space":
      return null;
    default:
      if (token.text) {
        return { type: "paragraph", children: adapterConvertInlineTokens(token.tokens || [{ type: "text", text: token.text }]) };
      }
      return null;
  }
}
function convertListItem(item) {
  if (!item) return null;
  const children = adapterConvertBlockTokens(item.tokens || []);
  if (item.task) {
    return {
      type: "listItem",
      checked: !!item.checked,
      children
    };
  }
  return { type: "listItem", children };
}
function convertTable(token) {
  const headerCells = (token.header || []).map((cell, i) => ({
    type: "tableCell",
    align: token.align?.[i] || null,
    children: adapterConvertInlineTokens(cell.tokens || [{ type: "text", text: cell.text || "" }])
  }));
  const rows = (token.rows || []).map((row) => ({
    type: "tableRow",
    children: row.map((cell, i) => ({
      type: "tableCell",
      align: token.align?.[i] || null,
      children: adapterConvertInlineTokens(cell.tokens || [{ type: "text", text: cell.text || "" }])
    }))
  }));
  return {
    type: "table",
    children: [{ type: "tableRow", children: headerCells }, ...rows]
  };
}
function adapterConvertInlineTokens(tokens) {
  const nodes = [];
  for (const token of tokens) {
    const node = convertInlineToken(token);
    if (node) nodes.push(node);
  }
  return nodes.length > 0 ? nodes : [{ type: "text", value: "" }];
}
function convertInlineToken(token) {
  switch (token.type) {
    case "text":
      if (token.tokens && token.tokens.length > 0) {
        return { type: "text", value: token.text || "", children: adapterConvertInlineTokens(token.tokens) };
      }
      return { type: "text", value: token.text || "" };
    case "strong":
      return { type: "strong", children: adapterConvertInlineTokens(token.tokens || []) };
    case "em":
      return { type: "emphasis", children: adapterConvertInlineTokens(token.tokens || []) };
    case "del":
      return { type: "delete", children: adapterConvertInlineTokens(token.tokens || []) };
    case "link":
      return {
        type: "link",
        href: token.href || "",
        title: token.title || void 0,
        children: adapterConvertInlineTokens(token.tokens || [{ type: "text", text: token.text || "" }])
      };
    case "image":
      return {
        type: "image",
        url: token.href || "",
        alt: token.text || "",
        title: token.title || void 0
      };
    case "codespan":
      return { type: "inlineCode", value: token.text || "" };
    case "br":
      return { type: "html", value: "<br/>" };
    case "escape":
      return { type: "text", value: token.text || "" };
    case "html":
      return { type: "html", value: token.text || token.raw || "" };
    default:
      return token.text ? { type: "text", value: token.text } : null;
  }
}
function adapterInjectMathNodes(children) {
  for (const node of children) {
    if (node.children && Array.isArray(node.children)) {
      adapterInjectMathNodes(node.children);
    }
    if (typeof node.value === "string") {
      const mathNodes = adapterExtractMathFromText(node.value);
      if (mathNodes) {
        const idx = children.indexOf(node);
        if (idx !== -1) {
          children.splice(idx, 1, ...mathNodes);
        }
      }
    }
  }
}
function adapterExtractMathFromText(text2) {
  if (!text2.includes("$")) return null;
  const nodes = [];
  let remaining = text2;
  let hasMath = false;
  const displayRe = /\$\$([\s\S]+?)\$\$/;
  const inlineRe = /\$([^\$\n]+?)\$/;
  while (remaining.length > 0) {
    const displayMatch = remaining.match(displayRe);
    const inlineMatch = remaining.match(inlineRe);
    let match = null;
    let display = false;
    if (displayMatch && (!inlineMatch || (displayMatch.index ?? 0) <= (inlineMatch.index ?? 0))) {
      match = displayMatch;
      display = true;
    } else if (inlineMatch) {
      match = inlineMatch;
      display = false;
    }
    if (!match || match.index === void 0) break;
    if (match.index > 0) {
      nodes.push({ type: "text", value: remaining.slice(0, match.index) });
    }
    nodes.push({
      type: display ? "math" : "inlineMath",
      value: (match[1] ?? "").trim(),
      display
    });
    hasMath = true;
    remaining = remaining.slice(match.index + match[0].length);
  }
  if (!hasMath) return null;
  if (remaining.length > 0) {
    nodes.push({ type: "text", value: remaining });
  }
  return nodes;
}
function buildInternalRoot(tokens, content, frontmatter, meta) {
  const children = meta.passthrough ? [{ type: "text", value: content }] : adapterConvertBlockTokens(tokens);
  const root = {
    type: "root",
    children,
    frontmatter,
    content
  };
  if (meta.source === "marked-lexer") {
    root.__parseSource = "marked-lexer";
    root.__parsedAt = meta.parsedAt || Date.now();
  }
  if (meta.parseError) {
    root.__parseError = meta.parseError;
    root.__passthrough = true;
  }
  if (meta.passthrough) {
    root.__passthrough = true;
  }
  return root;
}
marked.setOptions({ gfm: true, breaks: true });
async function parseMarkdown(raw, opts = {}) {
  if (typeof raw !== "string") {
    return buildInternalRoot(
      [],
      raw?.body || raw?.content || "",
      raw?.frontmatter || {},
      { source: "passthrough", passthrough: true }
    );
  }
  const parseFm = opts.parseFrontmatter !== false;
  const { data: frontmatter, content } = parseFm ? parseFrontmatter(raw) : { data: {}, content: raw };
  try {
    const tokens = marked.lexer(content);
    if (opts.math) {
      const temp = buildInternalRoot(tokens, content, frontmatter, { source: "marked-lexer" });
      adapterInjectMathNodes(temp.children);
      temp.__parseSource = "marked-lexer";
      temp.__parsedAt = Date.now();
      return temp;
    }
    return buildInternalRoot(tokens, content, frontmatter, {
      source: "marked-lexer",
      parsedAt: Date.now()
    });
  } catch (e) {
    return buildInternalRoot([], content, frontmatter, {
      source: "passthrough",
      parseError: e instanceof Error ? e.message : String(e),
      passthrough: true
    });
  }
}
const registry = /* @__PURE__ */ new Map();
function registerPlugin(plugin2, order = 100) {
  if (!plugin2 || typeof plugin2.name !== "string" || typeof plugin2.transform !== "function") {
    throw new Error("[PluginRegistry] Invalid plugin: must have { name, transform }");
  }
  registry.set(plugin2.name, { name: plugin2.name, order, plugin: plugin2 });
}
function unregisterPlugin(name) {
  registry.delete(name);
}
function getPlugins() {
  return Array.from(registry.values()).sort((a, b) => a.order - b.order);
}
function clearPlugins() {
  registry.clear();
}
async function runPlugins(ast, context = {}) {
  let current = ast;
  for (const def of getPlugins()) {
    try {
      current = await def.plugin.transform(current, context);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[PluginRegistry] Plugin "${def.name}" failed: ${msg}`);
    }
  }
  return current;
}
function compileToRenderTree(root, context = {}) {
  const children = (root.children || []).map((child) => compileNode(child)).filter(Boolean);
  return {
    type: "Root",
    props: {
      theme: context.theme || "default",
      class: ["ce-markdown", `ce-theme-${context.theme || "default"}`],
      "data-md-root": true
    },
    children
  };
}
function compileNode(node) {
  if (!node || typeof node !== "object") return null;
  switch (node.type) {
    case "heading": {
      const raw = node;
      return {
        type: "Heading",
        props: {
          level: Number(raw.depth || 1),
          id: typeof raw.id === "string" ? raw.id : void 0
        },
        children: compileChildren(node.children)
      };
    }
    case "paragraph":
      return {
        type: "Paragraph",
        children: compileChildren(node.children)
      };
    case "text": {
      const value = typeof node.value === "string" ? node.value : "";
      return {
        type: "Text",
        props: { value }
      };
    }
    case "strong":
      return { type: "Strong", children: compileChildren(node.children) };
    case "emphasis":
      return { type: "Emphasis", children: compileChildren(node.children) };
    case "delete":
      return { type: "Delete", children: compileChildren(node.children) };
    case "link": {
      const raw = node;
      return {
        type: "Link",
        props: {
          href: String(raw.href || ""),
          target: typeof raw.target === "string" ? raw.target : void 0,
          rel: typeof raw.rel === "string" ? raw.rel : void 0,
          title: typeof raw.title === "string" ? raw.title : void 0
        },
        children: compileChildren(node.children)
      };
    }
    case "image": {
      const raw = node;
      return {
        type: "Image",
        props: {
          src: String(raw.url || raw.href || ""),
          alt: String(raw.value || raw.alt || "")
        }
      };
    }
    case "code": {
      const raw = node;
      const lang = String(raw.lang || "");
      const value = typeof raw.value === "string" ? raw.value : "";
      return {
        type: "Code",
        props: { lang, value }
      };
    }
    case "inlineCode": {
      const value = typeof node.value === "string" ? node.value : "";
      return {
        type: "InlineCode",
        props: { value }
      };
    }
    case "list": {
      const raw = node;
      return {
        type: "List",
        props: { ordered: !!raw.ordered },
        children: compileChildren(node.children)
      };
    }
    case "listItem":
      return { type: "ListItem", children: compileChildren(node.children) };
    case "blockquote":
      return { type: "Blockquote", children: compileChildren(node.children) };
    case "thematicBreak":
      return { type: "ThematicBreak" };
    case "html": {
      const value = typeof node.value === "string" ? node.value : "";
      return {
        type: "Html",
        props: { value }
      };
    }
    case "math": {
      const display = node.display !== false;
      return {
        type: "Math",
        props: {
          formula: typeof node.value === "string" ? node.value : "",
          display
        }
      };
    }
    case "inlineMath":
      return {
        type: "InlineMath",
        props: {
          formula: typeof node.value === "string" ? node.value : "",
          display: false
        }
      };
    case "table":
      return { type: "Table", children: compileChildren(node.children) };
    case "tableRow":
      return { type: "TableRow", children: compileChildren(node.children) };
    case "tableCell": {
      const raw = node;
      return {
        type: "TableCell",
        props: { align: raw.align },
        children: compileChildren(node.children)
      };
    }
    default:
      return node.value != null ? { type: "Text", props: { value: String(node.value) } } : null;
  }
}
function compileChildren(children) {
  if (!children || children.length === 0) return "";
  return children.map((child) => compileNode(child)).filter(Boolean);
}
function extractTextFromNode(node) {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  if (Array.isArray(node.children)) {
    return node.children.map((child) => extractTextFromNode(child)).join("");
  }
  return "";
}
function slugifyHeading(text2 = "") {
  return String(text2).trim().toLowerCase().replace(/[\s]+/g, "-").replace(/[^a-z0-9_\-\u4e00-\u9fa5]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
const HeadingTransformer = {
  async transform(ast, context = {}) {
    if (!ast || ast.__headingInjected) return ast;
    let idCounter = 0;
    const headings = [];
    const inject2 = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "heading" && !node.id) {
        const text2 = extractTextFromNode(node);
        node.id = slugifyHeading(text2) || `h-${idCounter++}`;
        headings.push({
          id: String(node.id),
          text: text2,
          level: Number(node.depth || 1)
        });
      }
      if (Array.isArray(node.children)) node.children.forEach(inject2);
    };
    if (Array.isArray(ast.children)) ast.children.forEach(inject2);
    ast.__headingInjected = true;
    ast.headings = headings;
    return ast;
  }
};
function renderTreeToHTML(tree, _context = {}) {
  const root = Array.isArray(tree) ? tree : tree.children;
  return root.map((n) => renderNode(n)).join("\n");
}
function renderNode(node) {
  if (typeof node === "string") return escapeHtml$1(node);
  if (!node || !node.type) return "";
  switch (node.type) {
    case "Root": {
      const children = node.children;
      const cls = Array.isArray(node.props?.class) ? ` class="${node.props?.class?.join(" ")}"` : "";
      return `<div${cls} data-md-root="true">${children.map((c) => renderNode(c)).join("")}</div>`;
    }
    case "Heading": {
      const level = Number(node.props?.level || 1);
      const id = typeof node.props?.id === "string" ? node.props.id : (() => {
        const text2 = getTextFromChildren(node.children);
        return text2 ? slugifyHeading(text2) : void 0;
      })();
      const idAttr = id ? ` id="${id}"` : "";
      return `<h${level}${idAttr}>${renderChildren(node.children)}</h${level}>
`;
    }
    case "Paragraph":
      return `<p>${renderChildren(node.children)}</p>
`;
    case "Text": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return escapeHtml$1(value);
    }
    case "Strong":
      return `<strong>${renderChildren(node.children)}</strong>`;
    case "Emphasis":
      return `<em>${renderChildren(node.children)}</em>`;
    case "Delete":
      return `<del>${renderChildren(node.children)}</del>`;
    case "Link": {
      const href = escapeAttr(String(node.props?.href || ""));
      const target = typeof node.props?.target === "string" ? ` target="${escapeAttr(node.props.target)}"` : "";
      const rel = typeof node.props?.rel === "string" ? ` rel="${escapeAttr(node.props.rel)}"` : "";
      const title = typeof node.props?.title === "string" ? ` title="${escapeAttr(node.props.title)}"` : "";
      return `<a href="${href}"${target}${rel}${title}>${renderChildren(node.children)}</a>`;
    }
    case "Image": {
      const src = escapeAttr(String(node.props?.src || ""));
      const alt = escapeAttr(String(node.props?.alt || ""));
      return `<img src="${src}" alt="${alt}"/>`;
    }
    case "Code": {
      const lang = typeof node.props?.lang === "string" ? node.props.lang : "";
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      const langAttr = lang ? ` data-lang="${escapeAttr(lang)}"` : "";
      return `<pre${langAttr}><code${langAttr}>${escapeHtml$1(value)}</code></pre>
`;
    }
    case "InlineCode": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return `<code>${escapeHtml$1(value)}</code>`;
    }
    case "List": {
      const tag = node.props?.ordered ? "ol" : "ul";
      return `<${tag}>
${renderChildren(node.children)}
</${tag}>
`;
    }
    case "ListItem":
      return `<li>${renderChildren(node.children)}</li>`;
    case "Blockquote":
      return `<blockquote>
${renderChildren(node.children)}
</blockquote>
`;
    case "ThematicBreak":
      return `<hr/>
`;
    case "Html": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return value;
    }
    case "Math":
    case "InlineMath": {
      const formula = typeof node.props?.formula === "string" ? node.props.formula : "";
      const display = node.type === "Math" && node.props?.display !== false;
      const delim = display ? "$$" : "$";
      return `<span class="math math-${display ? "display" : "inline"}" data-display="${display ? "true" : "false"}">${delim}${escapeHtml$1(formula)}${delim}</span>`;
    }
    case "Table":
      return `<table>${renderChildren(node.children)}</table>
`;
    case "TableRow":
      return `<tr>${renderChildren(node.children)}</tr>`;
    case "TableCell": {
      const align = typeof node.props?.align === "string" ? node.props.align : null;
      const style = align ? ` style="text-align:${escapeAttr(align)}"` : "";
      return `<td${style}>${renderChildren(node.children)}</td>`;
    }
    default:
      return "";
  }
}
function renderChildren(children) {
  if (typeof children === "string") return escapeHtml$1(children);
  if (!children || children.length === 0) return "";
  return children.map((c) => renderNode(c)).join("");
}
function getTextFromChildren(children) {
  if (typeof children === "string") return children;
  if (!children || children.length === 0) return "";
  return children.map((c) => {
    if (typeof c === "string") return c;
    if (c.type === "Text") return String(c.props?.value || "");
    return getTextFromChildren(c.children);
  }).join("");
}
function escapeHtml$1(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeAttr(s = "") {
  return escapeHtml$1(s);
}
async function renderToHTML$1(ast, context = {}) {
  if (!ast) return "";
  const content = typeof ast.content === "string" ? ast.content : "";
  if (!content) return "";
  try {
    const tree = compileToRenderTree(ast, { theme: context.theme });
    return renderTreeToHTML(tree, context);
  } catch {
    return escapeHtml(content);
  }
}
function escapeHtml(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function renderTreeToVNode(tree, context = {}) {
  const root = Array.isArray(tree) ? { props: { theme: context.theme || "default" }, children: tree } : tree;
  return adaptRoot(root, context);
}
function adaptRoot(root, context) {
  const children = (root.children || []).map((c) => adaptNode(c)).filter(Boolean);
  return {
    type: "root",
    is: "div",
    props: {
      class: Array.isArray(root.props?.class) ? root.props.class : ["ce-markdown", `ce-theme-${context.theme || "default"}`],
      "data-md-root": true
    },
    children
  };
}
function adaptNode(node) {
  if (typeof node === "string") {
    return { type: "text", is: "#text", props: { nodeValue: node } };
  }
  if (!node || !node.type) return null;
  switch (node.type) {
    case "Heading": {
      const level = Number(node.props?.level || 1);
      return {
        type: "heading",
        is: `h${level}`,
        props: { id: typeof node.props?.id === "string" ? node.props.id : void 0 },
        children: adaptChildren(node.children)
      };
    }
    case "Paragraph":
      return {
        type: "paragraph",
        is: "p",
        children: adaptChildren(node.children)
      };
    case "Text": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return { type: "text", is: "#text", props: { nodeValue: value } };
    }
    case "Strong":
      return { type: "strong", is: "strong", children: adaptChildren(node.children) };
    case "Emphasis":
      return { type: "emphasis", is: "em", children: adaptChildren(node.children) };
    case "Delete":
      return { type: "delete", is: "del", children: adaptChildren(node.children) };
    case "Link": {
      return {
        type: "link",
        is: "a",
        props: {
          href: String(node.props?.href || ""),
          target: typeof node.props?.target === "string" ? node.props.target : void 0,
          rel: typeof node.props?.rel === "string" ? node.props.rel : void 0,
          title: typeof node.props?.title === "string" ? node.props.title : void 0
        },
        children: adaptChildren(node.children)
      };
    }
    case "Image": {
      return {
        type: "image",
        is: "img",
        props: {
          src: String(node.props?.src || ""),
          alt: String(node.props?.alt || "")
        }
      };
    }
    case "Code": {
      const lang = typeof node.props?.lang === "string" ? node.props.lang : "";
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return {
        type: "code",
        is: "pre",
        props: { "data-lang": lang },
        children: [
          {
            type: "code",
            is: "code",
            props: { "data-lang": lang },
            children: [{ type: "text", is: "#text", props: { nodeValue: value } }]
          }
        ]
      };
    }
    case "InlineCode": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return { type: "inlineCode", is: "code", props: { nodeValue: value } };
    }
    case "List": {
      const ordered = !!node.props?.ordered;
      return {
        type: "list",
        is: ordered ? "ol" : "ul",
        children: adaptChildren(node.children)
      };
    }
    case "ListItem":
      return { type: "listItem", is: "li", children: adaptChildren(node.children) };
    case "Blockquote":
      return { type: "blockquote", is: "blockquote", children: adaptChildren(node.children) };
    case "ThematicBreak":
      return { type: "thematicBreak", is: "hr" };
    case "Html": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return { type: "html", is: "div", props: { innerHTML: value } };
    }
    case "Math": {
      const formula = typeof node.props?.formula === "string" ? node.props.formula : "";
      node.props?.display !== false;
      return {
        type: "math",
        is: "KatexElement",
        props: { formula, display: true }
      };
    }
    case "InlineMath": {
      const formula = typeof node.props?.formula === "string" ? node.props.formula : "";
      return {
        type: "inlineMath",
        is: "KatexElement",
        props: { formula, display: false }
      };
    }
    case "Table":
      return { type: "table", is: "table", children: adaptChildren(node.children) };
    case "TableRow":
      return { type: "tableRow", is: "tr", children: adaptChildren(node.children) };
    case "TableCell":
      return { type: "tableCell", is: "td", children: adaptChildren(node.children) };
    default: {
      const v = node.props?.value;
      return v != null ? { type: String(node.type || "text"), is: "#text", props: { nodeValue: String(v) } } : null;
    }
  }
}
function adaptChildren(children) {
  if (typeof children === "string") return "";
  if (!children || children.length === 0) return "";
  return children.map((child) => adaptNode(child)).filter(Boolean);
}
async function renderToVNode$1(ast, context = {}) {
  if (!ast) return null;
  const tree = compileToRenderTree(ast, { theme: context.theme });
  return renderTreeToVNode(tree, context);
}
async function runRenderPipeline(rawContent, opts = {}) {
  const result = {
    raw: rawContent,
    ast: null,
    enhancedAST: null,
    rendered: null,
    errors: []
  };
  try {
    let ast = null;
    if (typeof rawContent === "string") {
      ast = await parseMarkdown(rawContent, opts.parserOptions || {});
    } else if (rawContent && typeof rawContent === "object") {
      const obj = rawContent;
      if (obj.type === "root" || obj.ast) {
        ast = obj.ast || obj;
      } else if (typeof obj.body === "string") {
        ast = await parseMarkdown(obj.body, opts.parserOptions || {});
      } else {
        ast = rawContent;
      }
    } else {
      ast = rawContent;
    }
    result.ast = ast;
    let enhanced = ast;
    result.enhancedAST = enhanced;
    if (enhanced) {
      enhanced = await runPlugins(enhanced, opts.transformerContext || {});
      result.enhancedAST = enhanced;
    }
    if (enhanced) {
      if (opts.renderTarget === "html") {
        result.rendered = await renderToHTML$1(enhanced, opts.rendererContext || {});
      } else {
        result.rendered = await renderToVNode$1(enhanced, opts.rendererContext || {});
      }
    }
  } catch (e) {
    result.errors.push(e instanceof Error ? e : new Error(String(e)));
  }
  return result;
}
async function renderToHTML(rawContent, opts = {}) {
  const r = await runRenderPipeline(rawContent, { ...opts, renderTarget: "html" });
  return r.rendered || "";
}
async function renderToVNode(rawContent, opts = {}) {
  const r = await runRenderPipeline(rawContent, { ...opts, renderTarget: "vnode" });
  return r.rendered || null;
}
const TocTransformer = {
  async transform(ast, context = {}) {
    const toc = [];
    const walk = (node, depth = 0) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "heading") {
        toc.push({
          id: String(node.id || ""),
          level: Number(node.depth || depth),
          text: extractTextFromNode(node)
        });
      }
      if (Array.isArray(node.children)) node.children.forEach((child) => walk(child, depth + 1));
    };
    if (ast && Array.isArray(ast.children)) {
      ast.children.forEach((n) => walk(n, 0));
    }
    if (ast) ast.toc = toc;
    return ast;
  }
};
const LinksTransformer = {
  async transform(ast, context = {}) {
    const rewrite = (node) => {
      if (!node) return;
      if (node.type === "link" && typeof node.href === "string") {
        if (node.href.startsWith("/") && !node.href.startsWith("/api")) {
          node.__rewrite = "internal-route";
        } else if (/^https?:\/\//.test(node.href)) {
          node.target = node.target || "_blank";
          node.rel = node.rel || "noopener noreferrer";
          node.__rewrite = "external";
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(rewrite);
    };
    if (ast && Array.isArray(ast.children)) {
      ast.children.forEach((n) => rewrite(n));
    }
    if (ast) ast.__linksProcessed = true;
    return ast;
  }
};
const ExcerptTransformer = {
  async transform(ast, context = {}) {
    const content = ast && typeof ast.content === "string" ? ast.content : "";
    const plain = content.replace(/[#*`>\[\]\n]+/g, " ").replace(/\s+/g, " ").trim();
    const excerptLimit = context.excerptLimit || 140;
    if (ast) {
      ast.excerpt = plain.length > excerptLimit ? plain.slice(0, excerptLimit) + "…" : plain;
    }
    return ast;
  }
};
const CJK_CHAR_RATE = 1.8;
const WPM_CN = 300;
const WPM_EN = 200;
const ReadingTimeTransformer = {
  async transform(ast, context = {}) {
    const content = ast && typeof ast.content === "string" ? ast.content : "";
    const cjkChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const enWords = content.replace(/[\u4e00-\u9fa5]/g, " ").split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(cjkChars / WPM_CN + enWords / WPM_EN));
    const cjkRate = cjkChars * CJK_CHAR_RATE / Math.max(1, content.length);
    const info = {
      minutes,
      seconds: minutes * 60,
      words: Math.round(enWords + cjkChars * CJK_CHAR_RATE),
      cjkChars,
      enWords,
      cjkRate: Number(cjkRate.toFixed(2))
    };
    if (ast) {
      ast.readingTime = info;
      ast.readingTimeMinutes = minutes;
    }
    return ast;
  }
};
const ReferenceTransformer = {
  async transform(ast, context = {}) {
    if (ast) {
      ast.references = ast.references || [];
      ast.__referencesProcessed = true;
    }
    return ast;
  }
};
const headingPlugin = {
  name: "heading",
  version: "1.0.0",
  transform: (ast, ctx) => HeadingTransformer.transform(ast, ctx)
};
const tocPlugin = {
  name: "toc",
  version: "1.0.0",
  transform: (ast, ctx) => TocTransformer.transform(ast, ctx)
};
const linksPlugin = {
  name: "links",
  version: "1.0.0",
  transform: (ast, ctx) => LinksTransformer.transform(ast, ctx)
};
const excerptPlugin = {
  name: "excerpt",
  version: "1.0.0",
  transform: (ast, ctx) => ExcerptTransformer.transform(ast, ctx)
};
const readingTimePlugin = {
  name: "readingTime",
  version: "1.0.0",
  transform: (ast, ctx) => ReadingTimeTransformer.transform(ast, ctx)
};
const referencePlugin = {
  name: "reference",
  version: "1.0.0",
  transform: (ast, ctx) => ReferenceTransformer.transform(ast, ctx)
};
const BUILTIN_PLUGINS = [
  { name: "heading", order: 10, plugin: headingPlugin },
  { name: "toc", order: 20, plugin: tocPlugin },
  { name: "links", order: 30, plugin: linksPlugin },
  { name: "excerpt", order: 40, plugin: excerptPlugin },
  { name: "readingTime", order: 50, plugin: readingTimePlugin },
  { name: "reference", order: 100, plugin: referencePlugin }
];
function registerBuiltinPlugins(enabled) {
  const enabledSet = enabled ? new Set(enabled) : null;
  const registered = [];
  for (const def of BUILTIN_PLUGINS) {
    if (enabledSet && !enabledSet.has(def.name)) continue;
    registerPlugin(def.plugin, def.order);
    registered.push(def.name);
  }
  return registered;
}
function createEngine(config = {}) {
  clearPlugins();
  registerBuiltinPlugins(config.plugins);
  if (config.customPlugins) {
    for (const p of config.customPlugins) {
      registerPlugin(p, p.order || 100);
    }
  }
  return {
    async parse(md, opts = {}) {
      return parseMarkdown(md, { ...config.parserOptions, ...opts });
    },
    async render(content, opts = {}) {
      const target = opts.target || "html";
      if (target === "html") {
        return renderToHTML(content, opts);
      }
      return renderToVNode(content, opts);
    },
    async compile(md, opts = {}) {
      const htmlResult = await runRenderPipeline(md, {
        ...opts,
        renderTarget: "html"
      });
      const vnodeResult = await runRenderPipeline(md, {
        ...opts,
        renderTarget: "vnode"
      });
      return {
        ast: htmlResult.ast,
        enhancedAST: htmlResult.enhancedAST,
        html: htmlResult.rendered || "",
        vnode: vnodeResult.rendered || null,
        errors: [...htmlResult.errors, ...vnodeResult.errors]
      };
    },
    registerPlugin(plugin2, order = 100) {
      registerPlugin(plugin2, order);
    },
    unregisterPlugin(name) {
      unregisterPlugin(name);
    },
    listPlugins() {
      return getPlugins().map((p) => p.name);
    },
    run(content, opts) {
      return runRenderPipeline(content, opts);
    }
  };
}
let defaultEngine = null;
function getEngine() {
  if (!defaultEngine) {
    defaultEngine = createEngine();
  }
  return defaultEngine;
}
const engine_server_K3Wbu2ehhZMqR7q2Nzx9XLvm_AjcGgkg1BFyo3H_LLU = /* @__PURE__ */ defineNuxtPlugin(async () => {
  let __temp, __restore;
  [__temp, __restore] = executeAsync(() => Promise.resolve().then(function () { return indexCo65Xgn7; }).catch(() => {
  })), await __temp, __restore();
  const content = getContentEngine();
  const markdown = getEngine();
  const services = {
    chapter: chapterService,
    lesson: lessonService,
    course: courseService,
    exercise: exerciseService
  };
  const repositories = {
    chapter: chapterRepository,
    lesson: lessonRepository,
    course: courseRepository,
    exercise: exerciseRepository,
    asset: assetRepository
  };
  return {
    provide: {
      content,
      markdown,
      services,
      repositories,
      queries,
      renderToHTML,
      renderToVNode
    }
  };
});
const plugins = [
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  plugin,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  components_plugin_4kY4pyzJIYX99vmMAAIorFf3CnAaptHitJgf7JxiED8,
  engine_server_K3Wbu2ehhZMqR7q2Nzx9XLvm_AjcGgkg1BFyo3H_LLU
];
const layouts = {
  default: defineAsyncComponent(() => import('./default-Jgt7RfCf.mjs').then((m) => m.default || m))
};
const routeRulesMatcher = _routeRulesMatcher;
const LayoutLoader = defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  setup(props, context) {
    return () => h(layouts[props.name], props.layoutProps, context.slots);
  }
});
const nuxtLayoutProps = {
  name: {
    type: [String, Boolean, Object],
    default: null
  },
  fallback: {
    type: [String, Object],
    default: null
  }
};
const __nuxt_component_0 = defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: nuxtLayoutProps,
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const shouldUseEagerRoute = !injectedRoute || injectedRoute === useRoute();
    const route = shouldUseEagerRoute ? useRoute$1() : injectedRoute;
    const layout = computed(() => {
      let layout2 = unref(props.name) ?? route?.meta.layout ?? routeRulesMatcher(route?.path).appLayout ?? "default";
      if (layout2 && !(layout2 in layouts)) {
        if (props.fallback) {
          layout2 = unref(props.fallback);
        }
      }
      return layout2;
    });
    const layoutRef = shallowRef();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    let lastLayout;
    return () => {
      const hasLayout = !!layout.value && layout.value in layouts;
      const hasTransition = hasLayout && !!(route?.meta.layoutTransition ?? appLayoutTransition);
      const transitionProps = hasTransition && _mergeTransitionProps([
        route?.meta.layoutTransition,
        appLayoutTransition,
        {
          onBeforeLeave() {
            nuxtApp["~transitionPromise"] = new Promise((resolve) => {
              nuxtApp["~transitionFinish"] = resolve;
            });
          },
          onAfterLeave() {
            nuxtApp["~transitionFinish"]?.();
            delete nuxtApp["~transitionFinish"];
            delete nuxtApp["~transitionPromise"];
          }
        }
      ]);
      const previouslyRenderedLayout = lastLayout;
      lastLayout = layout.value;
      return _wrapInTransition(transitionProps, {
        default: () => h(
          Suspense,
          {
            suspensible: true,
            onResolve: async () => {
              await nextTick(done);
            }
          },
          {
            default: () => h(
              LayoutProvider,
              {
                layoutProps: mergeProps(context.attrs, route.meta.layoutProps ?? {}, { ref: layoutRef }),
                key: layout.value || void 0,
                name: layout.value,
                shouldProvide: !props.name,
                isRenderingNewLayout: (name) => {
                  return name !== previouslyRenderedLayout && name === layout.value;
                },
                hasTransition
              },
              context.slots
            )
          }
        )
      }).default();
    };
  }
});
const LayoutProvider = defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    },
    isRenderingNewLayout: {
      type: Function,
      required: true
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        // When name=false, always return true so NuxtPage doesn't skip rendering
        isCurrent: (route) => name === false || name === (route.meta.layout ?? routeRulesMatcher(route.path).appLayout ?? "default")
      });
    }
    const injectedRoute = inject(PageRouteSymbol);
    const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
    if (isNotWithinNuxtPage) {
      const vueRouterRoute = useRoute$1();
      const reactiveChildRoute = {};
      for (const _key in vueRouterRoute) {
        const key = _key;
        Object.defineProperty(reactiveChildRoute, key, {
          enumerable: true,
          get: () => {
            return props.isRenderingNewLayout(props.name) ? vueRouterRoute[key] : injectedRoute[key];
          }
        });
      }
      provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
    }
    return () => {
      if (!name || typeof name === "string" && !(name in layouts)) {
        return context.slots.default?.();
      }
      return h(
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const defineRouteProvider = (name = "RouteProvider") => defineComponent({
  name,
  props: {
    route: {
      type: Object,
      required: true
    },
    vnode: Object,
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      if (!props.vnode) {
        return props.vnode;
      }
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const RouteProvider = defineRouteProvider();
const __nuxt_component_1 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    inject(PageRouteSymbol, null);
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    nuxtApp.deferHydration();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          return h(Suspense, { suspensible: true }, {
            default() {
              return h(RouteProvider, {
                vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                route: routeProps.route,
                vnodeRef: pageRef
              });
            }
          });
        }
      });
    };
  }
});
function normalizeSlot(slot, data) {
  const slotContent = slot(data);
  return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = /* @__PURE__ */ Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  ...false,
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      if (mounted.value) {
        const vnodes = slots.default?.();
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
function defineKeyedFunctionFactory(factory) {
  const placeholder = function() {
    throw new Error(`[nuxt] \`${factory.name}\` is a compiler macro and cannot be called at runtime.`);
  };
  return Object.defineProperty(placeholder, "__nuxt_factory", {
    enumerable: false,
    get: () => factory.factory
  });
}
const createUseAsyncData = defineKeyedFunctionFactory({
  name: "createUseAsyncData",
  factory(options = {}) {
    function useAsyncData2(...args) {
      const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
      if (_isAutoKeyNeeded(args[0], args[1])) {
        args.unshift(autoKey);
      }
      let [_key, _handler, opts = {}] = args;
      const isKeyReactive = isRef(_key) || typeof _key === "function";
      const key = isKeyReactive ? computed(() => toValue(_key)) : { value: _key };
      if (!key.value || typeof key.value !== "string") {
        throw new TypeError("[nuxt] [useAsyncData] key must be a non-empty string.");
      }
      if (typeof _handler !== "function") {
        throw new TypeError("[nuxt] [useAsyncData] handler must be a function.");
      }
      const shouldFactoryOptionsOverride = typeof options === "function";
      const nuxtApp = useNuxtApp();
      const factoryOptions = shouldFactoryOptionsOverride ? options(opts) : options;
      if (!shouldFactoryOptionsOverride) {
        for (const key2 in factoryOptions) {
          if (factoryOptions[key2] === void 0) {
            continue;
          }
          if (opts[key2] !== void 0) {
            continue;
          }
          opts[key2] = factoryOptions[key2];
        }
      }
      opts.server ??= true;
      opts.default ??= getDefault;
      opts.getCachedData ??= getDefaultCachedData;
      opts.lazy ??= false;
      opts.immediate ??= true;
      opts.deep ??= asyncDataDefaults.deep;
      opts.dedupe ??= "cancel";
      if (shouldFactoryOptionsOverride) {
        for (const key2 in factoryOptions) {
          if (factoryOptions[key2] === void 0) {
            continue;
          }
          opts[key2] = factoryOptions[key2];
        }
      }
      nuxtApp._asyncData[key.value];
      function createInitialFetch() {
        const initialFetchOptions = { cause: "initial", dedupe: opts.dedupe };
        const existing = nuxtApp._asyncData[key.value];
        if (!existing?._init) {
          initialFetchOptions.cachedData = opts.getCachedData(key.value, nuxtApp, { cause: "initial" });
          nuxtApp._asyncData[key.value] = buildAsyncData(nuxtApp, key.value, _handler, opts, initialFetchOptions.cachedData);
          nuxtApp._asyncData[key.value]._initialCachedData = initialFetchOptions.cachedData;
        } else if (nuxtApp._asyncDataPromises[key.value]) {
          initialFetchOptions.cachedData = existing._initialCachedData;
        }
        return () => nuxtApp._asyncData[key.value].execute(initialFetchOptions);
      }
      const initialFetch = createInitialFetch();
      const asyncData = nuxtApp._asyncData[key.value];
      asyncData._deps++;
      const fetchOnServer = opts.server !== false && nuxtApp.payload.serverRendered;
      if (fetchOnServer && opts.immediate) {
        const promise = initialFetch();
        if (getCurrentInstance()) {
          onServerPrefetch(() => promise);
        } else {
          nuxtApp.hook("app:created", async () => {
            await promise;
          });
        }
      }
      const asyncReturn = {
        data: writableComputedRef(() => nuxtApp._asyncData[key.value]?.data),
        pending: writableComputedRef(() => nuxtApp._asyncData[key.value]?.pending),
        status: writableComputedRef(() => nuxtApp._asyncData[key.value]?.status),
        error: writableComputedRef(() => nuxtApp._asyncData[key.value]?.error),
        refresh: (...args2) => {
          if (!nuxtApp._asyncData[key.value]?._init) {
            const initialFetch2 = createInitialFetch();
            return initialFetch2();
          }
          return nuxtApp._asyncData[key.value].execute(...args2);
        },
        execute: (...args2) => asyncReturn.refresh(...args2),
        clear: () => {
          const entry2 = nuxtApp._asyncData[key.value];
          if (entry2?._abortController) {
            try {
              entry2._abortController.abort(new DOMException("AsyncData aborted by user.", "AbortError"));
            } finally {
              entry2._abortController = void 0;
            }
          }
          clearNuxtDataByKey(nuxtApp, key.value);
        }
      };
      const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key.value]).then(() => asyncReturn);
      Object.assign(asyncDataPromise, asyncReturn);
      Object.defineProperties(asyncDataPromise, {
        then: { enumerable: true, value: asyncDataPromise.then.bind(asyncDataPromise) },
        catch: { enumerable: true, value: asyncDataPromise.catch.bind(asyncDataPromise) },
        finally: { enumerable: true, value: asyncDataPromise.finally.bind(asyncDataPromise) }
      });
      return asyncDataPromise;
    }
    return useAsyncData2;
  }
});
const useAsyncData = createUseAsyncData.__nuxt_factory();
createUseAsyncData.__nuxt_factory({
  lazy: true,
  // @ts-expect-error private property
  _functionName: "useLazyAsyncData"
});
function writableComputedRef(getter) {
  return computed({
    get() {
      return getter()?.value;
    },
    set(value) {
      const ref2 = getter();
      if (ref2) {
        ref2.value = value;
      }
    }
  });
}
function _isAutoKeyNeeded(keyOrFetcher, fetcher) {
  if (typeof keyOrFetcher === "string") {
    return false;
  }
  if (typeof keyOrFetcher === "object" && keyOrFetcher !== null) {
    return false;
  }
  if (typeof keyOrFetcher === "function" && typeof fetcher === "function") {
    return false;
  }
  return true;
}
function clearNuxtDataByKey(nuxtApp, key) {
  if (key in nuxtApp.payload.data) {
    nuxtApp.payload.data[key] = void 0;
  }
  if (key in nuxtApp.payload._errors) {
    nuxtApp.payload._errors[key] = void 0;
  }
  if (nuxtApp._asyncData[key]) {
    nuxtApp._asyncData[key].data.value = unref(nuxtApp._asyncData[key]._default());
    nuxtApp._asyncData[key].error.value = void 0;
    nuxtApp._asyncData[key].status.value = "idle";
    nuxtApp._asyncData[key]._initialCachedData = void 0;
  }
  if (key in nuxtApp._asyncDataPromises) {
    nuxtApp._asyncDataPromises[key] = void 0;
  }
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
function buildAsyncData(nuxtApp, key, _handler, options, initialCachedData) {
  nuxtApp.payload._errors[key] ??= void 0;
  const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData;
  const handler = _handler ;
  const _ref = options.deep ? ref : shallowRef;
  const hasCachedData = initialCachedData !== void 0;
  const unsubRefreshAsyncData = nuxtApp.hook("app:data:refresh", async (keys) => {
    if (!keys || keys.includes(key)) {
      await asyncData.execute({ cause: "refresh:hook" });
    }
  });
  const asyncData = {
    data: _ref(hasCachedData ? initialCachedData : options.default()),
    pending: computed(() => asyncData.status.value === "pending"),
    error: toRef(nuxtApp.payload._errors, key),
    status: shallowRef("idle"),
    execute: (...args) => {
      const [_opts, newValue = void 0] = args;
      const opts = _opts && newValue === void 0 && typeof _opts === "object" ? _opts : {};
      if (nuxtApp._asyncDataPromises[key]) {
        if ((opts.dedupe ?? options.dedupe) === "defer") {
          return nuxtApp._asyncDataPromises[key];
        }
      }
      {
        const cachedData = "cachedData" in opts ? opts.cachedData : options.getCachedData(key, nuxtApp, { cause: opts.cause ?? "refresh:manual" });
        if (cachedData !== void 0) {
          nuxtApp.payload.data[key] = asyncData.data.value = cachedData;
          asyncData.error.value = void 0;
          asyncData.status.value = "success";
          return Promise.resolve(cachedData);
        }
      }
      if (asyncData._abortController) {
        asyncData._abortController.abort(new DOMException("AsyncData request cancelled by deduplication", "AbortError"));
      }
      asyncData._abortController = new AbortController();
      asyncData.status.value = "pending";
      const cleanupController = new AbortController();
      const promise = new Promise(
        (resolve, reject) => {
          try {
            const timeout = opts.timeout ?? options.timeout;
            const mergedSignal = mergeAbortSignals([asyncData._abortController?.signal, opts?.signal], cleanupController.signal, timeout);
            if (mergedSignal.aborted) {
              const reason = mergedSignal.reason;
              reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
              return;
            }
            mergedSignal.addEventListener("abort", () => {
              const reason = mergedSignal.reason;
              reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
            }, { once: true, signal: cleanupController.signal });
            return Promise.resolve(handler(nuxtApp, { signal: mergedSignal })).then(resolve, reject);
          } catch (err) {
            reject(err);
          }
        }
      ).then(async (_result) => {
        if (nuxtApp._asyncDataPromises[key] !== promise) {
          return;
        }
        let result = _result;
        if (options.transform) {
          result = await options.transform(_result);
        }
        if (options.pick) {
          result = pick(result, options.pick);
        }
        nuxtApp.payload.data[key] = result;
        asyncData.data.value = result;
        asyncData.error.value = void 0;
        asyncData.status.value = "success";
      }).catch((error) => {
        if (nuxtApp._asyncDataPromises[key] !== promise) {
          return nuxtApp._asyncDataPromises[key];
        }
        if (asyncData._abortController?.signal.aborted) {
          return nuxtApp._asyncDataPromises[key];
        }
        if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
          asyncData.status.value = "idle";
          return nuxtApp._asyncDataPromises[key];
        }
        asyncData.error.value = createError(error);
        asyncData.data.value = unref(options.default());
        asyncData.status.value = "error";
      }).finally(() => {
        cleanupController.abort();
        if (nuxtApp._asyncDataPromises[key] === promise) {
          delete nuxtApp._asyncDataPromises[key];
        }
      });
      nuxtApp._asyncDataPromises[key] = promise;
      return nuxtApp._asyncDataPromises[key];
    },
    _execute: debounce((...args) => asyncData.execute(...args), 0, { leading: true }),
    _default: options.default,
    _deps: 0,
    _init: true,
    _hash: void 0,
    _off: () => {
      unsubRefreshAsyncData();
      if (nuxtApp._asyncData[key]?._init) {
        nuxtApp._asyncData[key]._init = false;
      }
      if (!hasCustomGetCachedData) {
        nextTick(() => {
          if (!nuxtApp._asyncData[key]?._init) {
            clearNuxtDataByKey(nuxtApp, key);
            asyncData.execute = () => Promise.resolve();
          }
        });
      }
    }
  };
  return asyncData;
}
const getDefault = () => void 0;
const getDefaultCachedData = (key, nuxtApp, ctx) => {
  if (nuxtApp.isHydrating) {
    return nuxtApp.payload.data[key];
  }
  if (ctx.cause !== "refresh:manual" && ctx.cause !== "refresh:hook") {
    return nuxtApp.static.data[key];
  }
};
function mergeAbortSignals(signals, cleanupSignal, timeout) {
  const list = signals.filter((s) => !!s);
  if (typeof timeout === "number" && timeout >= 0) {
    const timeoutSignal = AbortSignal.timeout?.(timeout);
    if (timeoutSignal) {
      list.push(timeoutSignal);
    }
  }
  if (AbortSignal.any) {
    return AbortSignal.any(list);
  }
  const controller = new AbortController();
  for (const sig of list) {
    if (sig.aborted) {
      const reason = sig.reason ?? new DOMException("Aborted", "AbortError");
      try {
        controller.abort(reason);
      } catch {
        controller.abort();
      }
      return controller.signal;
    }
  }
  const onAbort = () => {
    const abortedSignal = list.find((s) => s.aborted);
    const reason = abortedSignal?.reason ?? new DOMException("Aborted", "AbortError");
    try {
      controller.abort(reason);
    } catch {
      controller.abort();
    }
  };
  for (const sig of list) {
    sig.addEventListener?.("abort", onAbort, { once: true, signal: cleanupSignal });
  }
  return controller.signal;
}
function useRequestEvent(nuxtApp) {
  nuxtApp ||= useNuxtApp();
  return nuxtApp.ssrContext?.event;
}
function useRequestFetch() {
  return useRequestEvent()?.$fetch || globalThis.$fetch;
}
function generateOptionSegments(opts) {
  const segments = [
    toValue(opts.method)?.toUpperCase() || "GET",
    toValue(opts.baseURL)
  ];
  for (const _obj of [opts.query || opts.params]) {
    const obj = toValue(_obj);
    if (!obj) {
      continue;
    }
    const unwrapped = {};
    for (const [key, value] of Object.entries(obj)) {
      unwrapped[toValue(key)] = toValue(value);
    }
    segments.push(unwrapped);
  }
  if (opts.body) {
    const value = toValue(opts.body);
    if (!value) {
      segments.push(hash(value));
    } else if (value instanceof ArrayBuffer) {
      segments.push(hash(Object.fromEntries([...new Uint8Array(value).entries()].map(([k, v]) => [k, v.toString()]))));
    } else if (value instanceof FormData) {
      const entries = [];
      for (const entry2 of value.entries()) {
        const [key, val] = entry2;
        entries.push([key, val instanceof File ? `${val.name}:${val.size}:${val.lastModified}` : val]);
      }
      segments.push(hash(entries));
    } else if (isPlainObject(value)) {
      segments.push(hash(reactive(value)));
    } else {
      try {
        segments.push(hash(value));
      } catch {
        console.warn("[useFetch] Failed to hash body", value);
      }
    }
  }
  return segments;
}
const createUseFetch = defineKeyedFunctionFactory({
  name: "createUseFetch",
  factory(options = {}) {
    function useFetch2(request, arg1, arg2) {
      const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
      const factoryOptions = typeof options === "function" ? options(opts) : options;
      const {
        server,
        lazy,
        default: defaultFn,
        transform,
        pick: pick2,
        watch: watchSources,
        immediate,
        getCachedData,
        deep,
        dedupe,
        timeout,
        ...fetchOptions
      } = {
        ...typeof options === "function" ? {} : factoryOptions,
        ...opts,
        ...typeof options === "function" ? factoryOptions : {}
      };
      const _request = computed(() => toValue(request));
      const key = computed(() => toValue(fetchOptions.key) || "$f" + hash([autoKey, typeof _request.value === "string" ? _request.value : "", ...generateOptionSegments(fetchOptions)]));
      if (!fetchOptions.baseURL && typeof _request.value === "string" && (_request.value[0] === "/" && _request.value[1] === "/")) {
        throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
      }
      const _fetchOptions = reactive({
        ...fetchDefaults,
        ...fetchOptions,
        cache: typeof fetchOptions.cache === "boolean" ? void 0 : fetchOptions.cache
      });
      const _asyncDataOptions = {
        server,
        lazy,
        default: defaultFn,
        transform,
        pick: pick2,
        immediate,
        getCachedData,
        deep,
        dedupe,
        timeout,
        watch: watchSources === false ? [] : [...watchSources || [], _fetchOptions]
      };
      if (watchSources === false) {
        _asyncDataOptions._keyTriggersExecute = false;
      }
      const asyncData = useAsyncData(key, (_, { signal }) => {
        let _$fetch = fetchOptions.$fetch || globalThis.$fetch;
        if (!fetchOptions.$fetch) {
          const isLocalFetch = typeof _request.value === "string" && _request.value[0] === "/" && (!toValue(fetchOptions.baseURL) || toValue(fetchOptions.baseURL)[0] === "/");
          if (isLocalFetch) {
            _$fetch = useRequestFetch();
          }
        }
        return _$fetch(_request.value, { signal, ..._fetchOptions });
      }, _asyncDataOptions);
      return asyncData;
    }
    return useFetch2;
  }
});
createUseFetch.__nuxt_factory();
createUseFetch.__nuxt_factory({
  lazy: true,
  // @ts-expect-error private property
  _functionName: "useLazyFetch"
});
const _sfc_main$2 = {
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      titleTemplate: (title) => title ? `${title} · Dexin Labs` : "Dexin Labs · 得心实验室",
      meta: [
        {
          name: "description",
          content: "理解为先，应用为本。Dexin Labs（得心实验室）— 让数学学习真正得心应手。K12 数学思维学习平台。"
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLayout = __nuxt_component_0;
      const _component_NuxtPage = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ id: "app" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_NuxtLayout, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtPage, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtPage)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-DsQdICN-.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-DpfQ4lv8.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ status: unref(status), statusText: unref(statusText), statusCode: unref(status), statusMessage: unref(statusText), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    function invokeAppErrorHandler(err, target, info) {
      const errorHandler = nuxtApp.vueApp.config.errorHandler;
      if (errorHandler && !errorHandler.__nuxt_default) {
        try {
          errorHandler(err, target, info);
        } catch (handlerError) {
          console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
        }
      }
    }
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info)?.catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        invokeAppErrorHandler(err, target, info);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));

const indexCo65Xgn7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	assets: assets,
	chapters: chapters,
	chaptersRelations: chaptersRelations,
	closeDb: closeDb,
	courses: courses,
	coursesRelations: coursesRelations,
	createDb: createDb,
	db: db,
	exercises: exercises,
	exercisesRelations: exercisesRelations,
	getDb: getDb,
	lessons: lessons,
	lessonsRelations: lessonsRelations,
	schema: schema
}, Symbol.toStringTag, { value: 'Module' }));

export { assets as a, chaptersRelations as b, chapters as c, closeDb as d, entry_default as default, courses as e, coursesRelations as f, createDb as g, db as h, exercises as i, exercisesRelations as j, getDb as k, lessons as l, lessonsRelations as m, useRouter as n, encodeRoutePath as o, navigateTo as p, useNuxtApp as q, resolveRouteObject as r, schema as s, useRuntimeConfig as t, useAsyncData as u, nuxtLinkDefaults as v, useHead as w, useRoute as x, getEngine as y };
//# sourceMappingURL=server.mjs.map
