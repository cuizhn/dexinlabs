import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { hasInjectionContext, inject, getCurrentInstance, useSSRContext, defineAsyncComponent, defineComponent, h, computed, unref, shallowRef, provide, shallowReactive, ref, Suspense, Fragment, createElementBlock, cloneVNode, isRef, toValue, onServerPrefetch, reactive, createApp, mergeProps, onErrorCaptured, createVNode, resolveDynamicComponent, effectScope, nextTick, toRef, withCtx, getCurrentScope, isReadonly, isShallow, isReactive, toRaw } from 'vue';
import { k as parseURL, l as encodePath, m as decodePath, h as hasProtocol, i as isScriptProtocol, j as joinURL, f as withQuery, s as sanitizeStatusCode, n as getContext, $ as $fetch, o as hash, q as defu, c as createError$1, r as executeAsync } from '../_/nitro.mjs';
import { u as useHead$1, h as headSymbol, b as baseURL } from '../routes/renderer.mjs';
import { useRoute as useRoute$1, RouterView, createMemoryHistory, createRouter, START_LOCATION } from 'vue-router';
import { sql, relations, eq, and, asc, desc } from 'drizzle-orm';
import process from 'node:process';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { pgTable, timestamp, text, integer, varchar, serial, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { ssrRenderAttrs, ssrRenderSlot, ssrRenderClass, ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode } from 'vue/server-renderer';
import { marked } from 'marked';
import { isPlainObject } from '@vue/shared';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
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
    component: () => import('./_lesson_-rNOqWGdC.mjs')
  },
  {
    name: "course-chapter",
    path: "/course/:chapter()",
    component: () => import('./index-DDtOwY1J.mjs')
  },
  {
    name: "exercise-chapter",
    path: "/exercise/:chapter()",
    component: () => import('./_chapter_-De5XD1-u.mjs')
  },
  {
    name: "about",
    path: "/about",
    component: () => import('./about-DI1HCrgB.mjs')
  },
  {
    name: "course",
    path: "/course",
    component: () => import('./index-BkHxkDE-.mjs')
  },
  {
    name: "methods",
    path: "/methods",
    component: () => import('./methods-DLiq1UVA.mjs')
  },
  {
    name: "study",
    path: "/study",
    component: () => import('./study-DWBBvUI6.mjs')
  },
  {
    name: "index",
    path: "/",
    component: () => import('./index-CzamImTj.mjs')
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
function assertContract$4(obj) {
  if (obj === null || obj === void 0) {
    throw new Error("[assertContract] Object is null or undefined");
  }
}
function assertSourceContract(source) {
  assertContract$4(source);
  const required = ["findOne", "findAll", "count"];
  for (const method of required) {
    if (typeof source[method] !== "function") {
      throw new Error(`[SourceContract] Missing method: ${method}`);
    }
  }
}
function assertContract$3(obj) {
  if (obj === null || obj === void 0) {
    throw new Error("[assertContract] Object is null or undefined");
  }
}
function assertQueryContract(query) {
  assertContract$3(query);
  const required = ["getCourse", "getChapter", "getLesson", "getExercise", "listChapters"];
  for (const method of required) {
    if (typeof query[method] !== "function") {
      throw new Error(`[QueryContract] Missing method: ${method}`);
    }
  }
}
function assertContract$2(obj) {
  if (obj === null || obj === void 0) {
    throw new Error("[assertContract] Object is null or undefined");
  }
}
function assertParserContract(parser) {
  assertContract$2(parser);
  if (typeof parser.parse !== "function") {
    throw new Error("[ParserContract] Missing required method: parse(raw, opts)");
  }
}
function assertContract$1(obj) {
  if (obj === null || obj === void 0) {
    throw new Error("[assertContract] Object is null or undefined");
  }
}
function assertTransformerContract(transformer) {
  assertContract$1(transformer);
  if (typeof transformer.transform !== "function") {
    throw new Error("[TransformerContract] Missing required method: transform(ast, context)");
  }
}
function assertContract(obj) {
  if (obj === null || obj === void 0) {
    throw new Error("[assertContract] Object is null or undefined");
  }
}
function assertRendererContract(renderer) {
  assertContract(renderer);
  const rendererObj = renderer;
  if (typeof rendererObj.renderToVNode !== "function" && typeof rendererObj.renderToHTML !== "function") {
    throw new Error("[RendererContract] At least one of renderToVNode / renderToHTML must be implemented.");
  }
}
function assertSourceContractGeneric(x) {
  assertSourceContract(x);
}
function assertParserContractGeneric(x) {
  assertParserContract(x);
}
function assertTransformerContractGeneric(x) {
  assertTransformerContract(x);
}
function assertRendererContractGeneric(x) {
  assertRendererContract(x);
}
function assertQueryContractGeneric(x) {
  assertQueryContract(x);
}
const __registry = {
  sources: /* @__PURE__ */ new Map(),
  parsers: /* @__PURE__ */ new Map(),
  transformers: [],
  renderers: /* @__PURE__ */ new Map(),
  queries: /* @__PURE__ */ new Map(),
  defaultSource: null,
  defaultParser: null,
  defaultRenderer: null,
  defaultQuery: null
};
function registerSource(name, source, setAsDefault = false) {
  assertSourceContractGeneric(source);
  __registry.sources.set(name, source);
  if (setAsDefault || !__registry.defaultSource) {
    __registry.defaultSource = source;
  }
  return source;
}
function registerParser(name, parser, setAsDefault = false) {
  assertParserContractGeneric(parser);
  __registry.parsers.set(name, parser);
  if (setAsDefault || !__registry.defaultParser) {
    __registry.defaultParser = parser;
  }
  return parser;
}
function registerTransformer(name, transformer, order = 100) {
  assertTransformerContractGeneric(transformer);
  __registry.transformers.push({ name, order, transformer });
  __registry.transformers.sort((a, b) => a.order - b.order);
  return transformer;
}
function registerRenderer(name, renderer, setAsDefault = false) {
  assertRendererContractGeneric(renderer);
  __registry.renderers.set(name, renderer);
  if (setAsDefault || !__registry.defaultRenderer) {
    __registry.defaultRenderer = renderer;
  }
  return renderer;
}
function registerQuery(name, query, setAsDefault = false) {
  assertQueryContractGeneric(query);
  __registry.queries.set(name, query);
  if (setAsDefault || !__registry.defaultQuery) {
    __registry.defaultQuery = query;
  }
  return query;
}
function getSource(name) {
  return name ? __registry.sources.get(name) : __registry.defaultSource;
}
function getParser(name) {
  return name ? __registry.parsers.get(name) : __registry.defaultParser;
}
function getRenderer(name) {
  return name ? __registry.renderers.get(name) : __registry.defaultRenderer;
}
function getQuery(name) {
  return name ? __registry.queries.get(name) : __registry.defaultQuery;
}
function getTransformers() {
  return __registry.transformers.map((t) => t.transformer);
}
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
      throw new Error("[drizzle/db] process.env.DATABASE_URL is empty. Ensure env var is set.");
    }
    const poolConfig = { connectionString };
    _poolInstance = new Pool(poolConfig);
    _dbInstance = drizzle(_poolInstance, { schema: schema$1 });
  }
  return _dbInstance;
}
function getDb() {
  return ensureDbInitialized();
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
new Proxy({}, {
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
const COLLECTION_TO_TABLE = {
  course: courses,
  courses,
  chapter: chapters,
  chapters,
  lesson: lessons,
  lessons,
  exercise: exercises,
  exercises,
  asset: assets,
  assets
};
function resolveTable(collection) {
  if (!collection) return null;
  const key = String(collection).toLowerCase();
  return COLLECTION_TO_TABLE[key] || COLLECTION_TO_TABLE[key.replace(/s$/, "")] || null;
}
function castPrimitiveId(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  const s = String(v);
  const n = parseInt(s, 10);
  if (!Number.isNaN(n) && String(n) === s) return n;
  return v;
}
function buildWhereFromCriteria(table, criteria = {}) {
  const clauses = [];
  const entries = Object.entries(criteria);
  for (const [k, v] of entries) {
    if (v == null) continue;
    const col = table[k];
    if (!col) continue;
    const value = k === "id" || k.endsWith("Id") ? castPrimitiveId(v) : v;
    clauses.push(eq(col, value));
  }
  return clauses.length ? and(...clauses) : void 0;
}
function buildOrderClauses(table, order = {}) {
  if (!order) return [asc(table.id)];
  if (Array.isArray(order)) {
    return order.map((o) => {
      if (!o) return asc(table.id);
      const [field2, dir2] = Object.entries(o)[0] || ["id", "asc"];
      const direction2 = String(dir2).toLowerCase() === "desc" ? desc : asc;
      return direction2(table[field2] || table.id);
    });
  }
  const { field = "id", dir = "asc" } = order;
  const direction = String(dir).toLowerCase() === "desc" ? desc : asc;
  return [direction(table[field] || table.id), asc(table.id)];
}
class DatabaseSource {
  constructor(connectionOrOpts = {}) {
    this.connection = connectionOrOpts;
    this.name = "database";
  }
  _getDb() {
    return this.connection?.db || this.connection || getDb();
  }
  async findOne(collection, where = {}) {
    const table = resolveTable(collection);
    const db = this._getDb();
    if (!table) return null;
    const criteria = buildWhereFromCriteria(table, where);
    let query = db.select().from(table);
    if (criteria) query = query.where(criteria);
    const rows = await query.limit(1).catch(() => []);
    return rows[0] || null;
  }
  async findAll(collection, opts = {}) {
    const table = resolveTable(collection);
    const db = this._getDb();
    if (!table) return [];
    const where = buildWhereFromCriteria(table, opts.where || {});
    const orderBy = buildOrderClauses(table, opts.order);
    let query = db.select().from(table);
    if (where) query = query.where(where);
    query = query.orderBy(...orderBy);
    if (typeof opts.limit === "number") query = query.limit(opts.limit);
    if (typeof opts.offset === "number") query = query.offset(opts.offset);
    return query.catch(() => []);
  }
  async count(collection, where = {}) {
    const table = resolveTable(collection);
    const db = this._getDb();
    if (!table) return 0;
    const criteria = buildWhereFromCriteria(table, where);
    let query = db.select({ count: sql`count(*)`.mapWith(Number) }).from(table);
    if (criteria) query = query.where(criteria);
    const rows = await query.catch(() => [{ count: 0 }]);
    return Number(rows[0]?.count ?? 0);
  }
  static get contract() {
    return SourceContract;
  }
}
function createSource(type, deps = {}, opts = {}) {
  switch (type) {
    case "database":
    case "neon":
    case "neon-drizzle":
    case "markdown":
    case "filesystem":
      return new DatabaseSource(deps.connection || deps, opts);
    default:
      throw new Error(
        `[createSource] Unknown source type: ${type}. Supported: database | neon | neon-drizzle`
      );
  }
}
function buildLazyQueryFacade() {
  return {
    async getCourse(slug, opts = {}) {
      const { loadCourse } = await import('./course-C8kblM_0.mjs');
      return loadCourse(slug, opts);
    },
    async getChapter(slug, opts = {}) {
      const { loadChapter } = await import('./chapter-COk16EBJ.mjs');
      return loadChapter(slug, opts);
    },
    async getLesson(slug, opts = {}) {
      const { loadLesson } = await import('./lesson-daQ-ySSn.mjs');
      return loadLesson(slug, opts);
    },
    async getExercise(slug, opts = {}) {
      const exerciseOpts = opts;
      if (exerciseOpts && exerciseOpts.source) {
        return exerciseOpts.source.findOne("exercise", { slug });
      }
      const { default: services } = await import('./index-6i3vDWZz.mjs');
      const { courseService } = services;
      return courseService.exercises?.getBySlug?.(slug) || null;
    },
    async listChapters(opts = {}) {
      const { listChapters } = await import('./chapter-COk16EBJ.mjs');
      return listChapters(opts);
    }
  };
}
function registerData(opts = {}) {
  const sourceName = opts.sourceName || "neon-drizzle";
  const source = createSource("database", opts.sourceOptions || {}, { name: sourceName });
  registerSource("database", source, true);
  registerSource(sourceName, source, false);
  const query = opts.query || buildLazyQueryFacade();
  registerQuery("default", query, true);
  return {
    source: sourceName,
    query: "default"
  };
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
async function parseMarkdown(raw, opts = {}) {
  if (typeof raw !== "string") {
    return {
      type: "root",
      children: [],
      frontmatter: raw?.frontmatter || {},
      content: raw?.body || raw?.content || "",
      __passthrough: true
    };
  }
  try {
    const { data, content } = parseFrontmatter(raw);
    return {
      type: "root",
      children: [{ type: "text", value: content }],
      frontmatter: data,
      content,
      __parseSource: "markdown-passthrough",
      __parsedAt: Date.now()
    };
  } catch (e) {
    return {
      type: "root",
      children: [],
      frontmatter: {},
      content: raw,
      __parseError: e.message,
      __passthrough: true
    };
  }
}
const MarkdownParser = {
  async parse(raw, opts = {}) {
    return parseMarkdown(raw, opts);
  }
};
function slugifyHeading(text2 = "") {
  return String(text2).trim().toLowerCase().replace(/[\s]+/g, "-").replace(/[^a-z0-9_\-\u4e00-\u9fa5]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
const HeadingTransformer = {
  async transform(ast, context = {}) {
    if (!ast || ast.__headingInjected) return ast;
    let idCounter = 0;
    const inject2 = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "heading" && !node.id) {
        node.id = slugifyHeading(node.value || node.content || `h-${idCounter++}`);
      }
      if (Array.isArray(node.children)) node.children.forEach(inject2);
    };
    if (Array.isArray(ast.children)) ast.children.forEach(inject2);
    ast.__headingInjected = true;
    return ast;
  }
};
const TocTransformer = {
  async transform(ast, context = {}) {
    const toc = [];
    const walk = (node, depth = 0) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "heading") {
        toc.push({
          id: node.id,
          depth: node.depth || depth,
          text: node.value || node.content || ""
        });
      }
      if (Array.isArray(node.children)) {
        node.children.forEach((child) => walk(child, depth + 1));
      }
    };
    if (Array.isArray(ast?.children)) {
      ast.children.forEach((n) => walk(n, 0));
    }
    ast.toc = toc;
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
    if (Array.isArray(ast?.children)) ast.children.forEach(rewrite);
    ast.__linksProcessed = true;
    return ast;
  }
};
const ExcerptTransformer = {
  async transform(ast, context = {}) {
    const content = typeof ast?.content === "string" ? ast.content : "";
    const plain = content.replace(/[#*`>\[\]\n]+/g, " ").replace(/\s+/g, " ").trim();
    const excerptLimit = context.excerptLimit || 140;
    ast.excerpt = plain.length > excerptLimit ? plain.slice(0, excerptLimit) + "…" : plain;
    return ast;
  }
};
const CJK_CHAR_RATE = 1.8;
const WPM_CN = 300;
const WPM_EN = 200;
const ReadingTimeTransformer = {
  async transform(ast, context = {}) {
    const content = typeof ast?.content === "string" ? ast.content : "";
    const cjkChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const enWords = content.replace(/[\u4e00-\u9fa5]/g, " ").split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(
      1,
      Math.round(cjkChars / WPM_CN + enWords / WPM_EN)
    );
    const cjkRate = cjkChars * CJK_CHAR_RATE / Math.max(1, content.length);
    ast.readingTime = {
      minutes,
      seconds: minutes * 60,
      words: Math.round(enWords + cjkChars * CJK_CHAR_RATE),
      cjkChars,
      enWords,
      cjkRate: Number(cjkRate.toFixed(2))
    };
    return ast;
  }
};
const ReferenceTransformer = {
  async transform(ast, context = {}) {
    ast.references = ast.references || [];
    ast.__referencesProcessed = true;
    return ast;
  }
};
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$3 = {
  __name: "MarkdownRenderer",
  __ssrInlineRender: true,
  props: {
    value: { type: Object, default: () => ({}) },
    document: { type: Object, default: null },
    ast: { type: Object, default: null },
    theme: { type: String, default: "default" },
    fallback: { type: Boolean, default: true }
  },
  setup(__props) {
    marked.setOptions({
      gfm: true,
      breaks: true,
      mangle: false,
      headerIds: true
    });
    const props = __props;
    const source = props.document || props.value || {};
    const frontmatter = computed(() => {
      if (source.frontmatter && typeof source.frontmatter === "object") return source.frontmatter;
      if (props.ast?.frontmatter && typeof props.ast.frontmatter === "object") return props.ast.frontmatter;
      return {};
    });
    const toc = computed(() => {
      if (Array.isArray(source._toc) && source._toc.length > 0) return source._toc;
      if (Array.isArray(props.ast?.toc)) return props.ast.toc;
      return [];
    });
    const readingTime = computed(() => {
      if (source._readingTime != null) return source._readingTime;
      if (props.ast?.readingTime != null) return props.ast.readingTime;
      return null;
    });
    const markdownString = computed(() => {
      if (typeof props.ast?.content === "string" && props.ast.content.trim()) {
        return props.ast.content;
      }
      if (typeof source.body === "string" && source.body.trim()) {
        return source.body;
      }
      if (typeof source.content === "string" && source.content.trim()) {
        return source.content;
      }
      if (typeof source === "string") return source;
      return "";
    });
    const renderedHtml = computed(() => {
      const md = markdownString.value;
      if (!md) return "";
      try {
        return marked.parse(md) || "";
      } catch (e) {
        return "";
      }
    });
    const wrapperClass = computed(() => [
      "ce-markdown-renderer",
      `ce-theme-${props.theme}`
    ]);
    const innerClass = computed(() => [
      "ce-content",
      "prose",
      "prose-neutral",
      "dark:prose-invert",
      "max-w-none"
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: wrapperClass.value,
        "data-ce-markdown-renderer": ""
      }, _attrs))} data-v-19c429b1>`);
      ssrRenderSlot(_ctx.$slots, "header", {
        toc: toc.value,
        frontmatter: frontmatter.value
      }, null, _push, _parent);
      _push(`<div class="${ssrRenderClass([innerClass.value, "ce-content-body"])}" data-v-19c429b1>`);
      ssrRenderSlot(_ctx.$slots, "body-start", {}, null, _push, _parent);
      if (renderedHtml.value) {
        _push(`<div class="ce-markdown" data-v-19c429b1>${renderedHtml.value ?? ""}</div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "body-end", {}, null, _push, _parent);
      if (!renderedHtml.value) {
        ssrRenderSlot(_ctx.$slots, "empty", {}, null, _push, _parent);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderSlot(_ctx.$slots, "footer", {
        toc: toc.value,
        frontmatter: frontmatter.value,
        readingTime: readingTime.value
      }, null, _push, _parent);
      _push(`</div>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("render/theme/MarkdownRenderer.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const MarkdownRenderer = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-19c429b1"]]);
const VueRenderer = {
  name: "vue-renderer",
  async renderToVNode(ast, context = {}) {
    return {
      __vnodeReady: true,
      ast,
      context,
      component: MarkdownRenderer,
      props: buildRendererProps(ast, context)
    };
  },
  async renderToHTML(ast, context = {}) {
    const content = typeof ast?.content === "string" ? ast.content : ast?.raw || "";
    return escapeHtml(content);
  }
};
function buildRendererProps(ast, context) {
  const frontmatter = ast?.frontmatter || {};
  const body = typeof ast?.content === "string" ? ast.content : "";
  const documentLike = {
    body,
    ...frontmatter,
    _toc: ast?.toc || [],
    _excerpt: ast?.excerpt || "",
    _readingTime: ast?.readingTime || null,
    _md: {
      ast,
      theme: context.theme || "default",
      highlight: context.highlight !== false
    }
  };
  return {
    value: documentLike,
    document: documentLike,
    theme: context.theme || "default",
    ast
  };
}
function escapeHtml(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
const TRANSFORMER_DEFS = [
  { name: "heading", order: 10, module: HeadingTransformer },
  { name: "toc", order: 20, module: TocTransformer },
  { name: "links", order: 30, module: LinksTransformer },
  { name: "excerpt", order: 40, module: ExcerptTransformer },
  { name: "readingTime", order: 50, module: ReadingTimeTransformer },
  { name: "reference", order: 100, module: ReferenceTransformer }
];
function registerRender(opts = {}) {
  const parserName = opts.parser && opts.parser.name || "markdown";
  registerParser(parserName, MarkdownParser, true);
  const enabled = opts.transformers && opts.transformers.enabled ? new Set(opts.transformers.enabled) : null;
  const registered = [];
  for (const def of TRANSFORMER_DEFS) {
    if (enabled && !enabled.has(def.name)) continue;
    registerTransformer(def.name, def.module, def.order);
    registered.push(def.name);
  }
  const rendererName = opts.renderer && opts.renderer.name || "vue";
  registerRenderer(rendererName, VueRenderer, true);
  return { parser: parserName, transformers: registered, renderer: rendererName };
}
async function runRenderPipeline(rawContent, opts = {}) {
  const result = {
    raw: rawContent,
    ast: null,
    enhancedAST: null,
    rendered: null,
    errors: []
  };
  const parser = opts.parser || getParser() || void 0;
  const transformers = opts.transformers || getTransformers();
  const renderer = opts.renderer || getRenderer() || void 0;
  try {
    if (parser && typeof rawContent === "string") {
      result.ast = await parser.parse(rawContent, opts.parserOptions || {});
    } else if (rawContent && typeof rawContent === "object") {
      const obj = rawContent;
      if (obj.type === "root" || obj.ast) {
        result.ast = obj.ast || obj;
      } else if (typeof obj.body === "string") {
        const body = obj.body;
        if (parser) {
          result.ast = await parser.parse(body, opts.parserOptions || {});
        } else {
          result.ast = {
            type: "root",
            children: [],
            frontmatter: {},
            content: body,
            __passthrough: true
          };
        }
      } else {
        result.ast = rawContent;
      }
    } else {
      result.ast = rawContent;
    }
    result.enhancedAST = result.ast;
    for (const t of transformers) {
      try {
        result.enhancedAST = await t.transform(
          result.enhancedAST || {},
          {
            ...opts,
            pipelineResult: result
          }
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        result.errors.push(new Error(`[RenderPipeline][Transformer] ${msg}`));
      }
    }
    if (renderer && result.enhancedAST) {
      try {
        if (opts.renderTarget === "html") {
          result.rendered = await renderer.renderToHTML(
            result.enhancedAST,
            opts
          );
        } else {
          result.rendered = renderer.renderToVNode ? await renderer.renderToVNode(
            result.enhancedAST,
            opts
          ) : await renderer.renderToHTML(
            result.enhancedAST,
            opts
          );
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        result.errors.push(new Error(`[RenderPipeline][Renderer] ${msg}`));
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
const __engine_state = {
  initialized: false
};
async function initContentEngine(bootFn = null) {
  if (__engine_state.initialized) return getEngine();
  if (typeof bootFn === "function") {
    await bootFn();
  }
  __engine_state.initialized = true;
  return getEngine();
}
function _runDataPipe(operation, params = {}, opts = {}) {
  return new Promise((resolve) => {
    const result = {
      operation,
      params,
      source: null,
      loaderMeta: {},
      data: null,
      errors: []
    };
    const source = opts.source || getSource() || void 0;
    const loader = opts.loader || void 0;
    const query = opts.query || getQuery() || void 0;
    try {
      result.source = source ? source.constructor?.name || "anonymous" : null;
      switch (operation) {
        case "getCourse":
        case "getChapter":
        case "getLesson":
        case "getExercise":
        case "listChapters": {
          const op = operation;
          const args = Array.isArray(params) ? params : [params];
          if (query && typeof query[op] === "function") {
            const qFn = query[op];
            if (qFn) {
              qFn(...args).then((d) => {
                result.data = d;
                resolve(result);
              }).catch((e) => {
                result.errors.push(e instanceof Error ? e : new Error(String(e)));
                resolve(result);
              });
              return;
            }
          } else if (loader && typeof loader[op] === "function") {
            const loaderFn = loader[op];
            if (loaderFn) {
              loaderFn(...args).then((d) => {
                result.data = d;
                resolve(result);
              }).catch((e) => {
                result.errors.push(e instanceof Error ? e : new Error(String(e)));
                resolve(result);
              });
              return;
            }
          }
          resolve(result);
          break;
        }
        case "findOne": {
          if (source) {
            const [collection, where] = params;
            source.findOne(collection, where).then((d) => {
              result.data = d;
              resolve(result);
            }).catch((e) => {
              result.errors.push(e instanceof Error ? e : new Error(String(e)));
              resolve(result);
            });
            return;
          }
          resolve(result);
          break;
        }
        case "findAll": {
          if (source) {
            const [collection, findOpts] = params;
            source.findAll(collection, findOpts || {}).then((d) => {
              result.data = d;
              resolve(result);
            }).catch((e) => {
              result.errors.push(e instanceof Error ? e : new Error(String(e)));
              resolve(result);
            });
            return;
          }
          resolve(result);
          break;
        }
        case "count": {
          if (source) {
            const [collection, where] = params;
            source.count(collection, where || {}).then((d) => {
              result.data = d;
              resolve(result);
            }).catch((e) => {
              result.errors.push(e instanceof Error ? e : new Error(String(e)));
              resolve(result);
            });
            return;
          }
          resolve(result);
          break;
        }
        default:
          result.errors.push(new Error(`[Engine.data.pipe] Unknown operation: ${operation}`));
          resolve(result);
      }
    } catch (e) {
      result.errors.push(e instanceof Error ? e : new Error(String(e)));
      resolve(result);
    }
  });
}
function getEngine() {
  const facade = {
    isInitialized() {
      return __engine_state.initialized;
    },
    data: {
      source(name = null) {
        return getSource(name || void 0);
      },
      query(name = null) {
        return getQuery(name || void 0);
      },
      async getCourse(slug, opts = {}) {
        const q = getQuery();
        if (!q) throw new Error("[Engine.data] No Query registered. Run registerData() first.");
        return q.getCourse(slug, opts);
      },
      async getChapter(slug, opts = {}) {
        const q = getQuery();
        if (!q) throw new Error("[Engine.data] No Query registered. Run registerData() first.");
        return q.getChapter(slug, opts);
      },
      async getLesson(slug, opts = {}) {
        const q = getQuery();
        if (!q) throw new Error("[Engine.data] No Query registered. Run registerData() first.");
        return q.getLesson(slug, opts);
      },
      async getExercise(slug, opts = {}) {
        const q = getQuery();
        if (!q) throw new Error("[Engine.data] No Query registered. Run registerData() first.");
        return q.getExercise(slug, opts);
      },
      async listChapters(opts = {}) {
        const q = getQuery();
        if (!q) throw new Error("[Engine.data] No Query registered. Run registerData() first.");
        return q.listChapters(opts);
      },
      async findOne(collection, where = {}) {
        const s = getSource();
        if (!s) throw new Error("[Engine.data] No Source registered. Run registerData() first.");
        return s.findOne(collection, where);
      },
      async findAll(collection, opts = {}) {
        const s = getSource();
        if (!s) throw new Error("[Engine.data] No Source registered. Run registerData() first.");
        return s.findAll(collection, opts);
      },
      async count(collection, where = {}) {
        const s = getSource();
        if (!s) throw new Error("[Engine.data] No Source registered. Run registerData() first.");
        return s.count(collection, where);
      },
      async pipe(operation, params = {}, opts = {}) {
        return _runDataPipe(operation, params, opts);
      }
    },
    render: {
      parser(name = null) {
        return getParser(name || void 0);
      },
      renderer(name = null) {
        return getRenderer(name || void 0);
      },
      transformers() {
        return getTransformers();
      },
      async pipe(content, opts = {}) {
        return runRenderPipeline(content, opts);
      },
      async toHTML(content, opts = {}) {
        return renderToHTML(content, opts);
      },
      async toVNode(content, opts = {}) {
        return renderToVNode(content, opts);
      }
    },
    source(name = null) {
      return getSource(name || void 0);
    },
    query(name = null) {
      return getQuery(name || void 0);
    },
    parser(name = null) {
      return getParser(name || void 0);
    },
    renderer(name = null) {
      return getRenderer(name || void 0);
    },
    async pipe(content, opts = {}) {
      const isDataOperation = Boolean(
        opts && (opts.operation || typeof content === "object" && content !== null && typeof content.slug === "string" && !("body" in content))
      );
      if (isDataOperation) {
        return _runDataPipe(opts.operation || "findOne", content, opts);
      }
      return runRenderPipeline(content, opts);
    },
    async getChapter(slug, opts = {}) {
      return this.data.getChapter(slug, opts);
    },
    async getLesson(slug, opts = {}) {
      return this.data.getLesson(slug, opts);
    },
    async listChapters(opts = {}) {
      return this.data.listChapters(opts);
    },
    async renderContent(content, opts = {}) {
      return this.render.pipe(content, opts);
    }
  };
  return facade;
}
async function bootEngine(opts = {}) {
  const data = registerData(opts.data || {});
  const render = registerRender(opts.render || {});
  const engine = await initContentEngine();
  return { ok: true, engine, data, render };
}
async function bootContentEngine(opts = {}) {
  return bootEngine(opts);
}
const engine_server_K3Wbu2ehhZMqR7q2Nzx9XLvm_AjcGgkg1BFyo3H_LLU = /* @__PURE__ */ defineNuxtPlugin(async (nuxtApp) => {
  let __temp, __restore;
  [__temp, __restore] = executeAsync(() => bootContentEngine()), await __temp, __restore();
  const engine = getEngine();
  nuxtApp.provide("engine", engine);
  nuxtApp.provide("contentEngine", engine);
  return {
    provide: {
      engine,
      contentEngine: engine,
      contentQuery: {
        getChapter: (slug, opts) => engine.getChapter(slug, opts),
        getLesson: (slug, opts) => engine.getLesson(slug, opts),
        listChapters: (opts) => engine.listChapters(opts),
        renderContent: (raw, opts) => engine.renderContent(raw, opts)
      }
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
  default: defineAsyncComponent(() => import('./default-DSjUeHZf.mjs').then((m) => m.default || m))
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
    const _Error404 = defineAsyncComponent(() => import('./error-404-BSYZPpZq.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-B6cwEKxd.mjs'));
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

export { MarkdownRenderer as M, _export_sfc as _, useRouter as a, useNuxtApp as b, useRuntimeConfig as c, nuxtLinkDefaults as d, entry_default as default, encodeRoutePath as e, useHead as f, useRoute as g, courses as h, getDb as i, chapters as j, exercises as k, lessons as l, navigateTo as n, resolveRouteObject as r, useAsyncData as u };
//# sourceMappingURL=server.mjs.map
