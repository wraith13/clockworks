import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
export module ViewModel
{
    const $make = minamo.dom.make;
    export interface DomCache<ViewModelTypeName>
    {
        dom: Element;
        lastAccess: number;
        type: ViewModelTypeName;
        data: string;
        childrenKeys: string[];
    }
    export class ViewModel<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        private previousData: string;
        private data: Tektite.ViewModelBase<unknown>;
        private renderer: { [type: string ]: Tektite.ViewRenderer<unknown>};
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        update: (event: Tektite.UpdateScreenEventEype) => unknown;
        public onLoad = () =>
        {
        };
        public set = (data: Tektite.ViewModelBase<unknown>) =>
        {
            this.data = data;
        };
        public get = (path: string = "/") =>
        {
            return this.data;
        };
        public renderDom = (now: number = new Date().getTime()) =>
        {
            let result: Element;
            const json = JSON.stringify(this.data);
            if (this.previousData !== json)
            {
                const oldCache: { [key: string]:DomCache<unknown> } = { };
                Object.keys(this.domCache).forEach
                (
                    path =>
                    {
                        const cache = this.domCache[path];
                        oldCache[path] =
                        {
                            dom: cache.dom,
                            lastAccess: cache.lastAccess,
                            type: cache.type,
                            data: cache.data,
                        };
                    }
                );
                result = this.renderOrCache(now, "/", JSON.parse(json)).dom;
                Object.keys(oldCache)
                    .filter(path => oldCache[path].dom !== this.domCache[path]?.dom)
                    .map(path => oldCache[path].dom)
                    .forEach(dom => dom.parentElement.removeChild(dom));
                this.previousData = json;
            }
            return result;
        };
        private domCache: { [path: string]:DomCache<unknown> } = { };
        public getCache = (now: number, path: string) =>
        {
            const result = this.domCache[path];
            if (result)
            {
                result.lastAccess = now;
            }
            return result;
        };
        public getChildren = (key: string) => Object.keys(this.domCache)
            .filter(i => i.startsWith(key) && 2 === i.substring(i.length).split["/"].length)
            .map(i => this.domCache[i]);
        public setCache = (now: number, key: string, dom: Element, type: ViewModelTypeName, data: string, childrenKeys: string[]) =>
            this.domCache[key] =
            {
                dom,
                lastAccess: now,
                type,
                data,
                childrenKeys
            };
        public renderOrCache = (now: number, path: string, data: Tektite.ViewModelBase<unknown>): DomCache<unknown> =>
        {
            let cache = this.getCache(now, path);
            const oldChildrenKeys = cache?.childrenKeys ?? [];
            const childrenKeys = data.children.map(i => i.key);
            const renderer = this.renderer[data.type];
            const forceAppend = renderer.isListContainer && this.isSameOrder(oldChildrenKeys, childrenKeys);
            const json = JSON.stringify(data.data);
            if (cache?.data !== json)
            {
                let dom = cache.dom ?? renderer.make();
                dom = renderer.update(cache, data);
                cache = this.setCache(now, path, dom, data.type, json, childrenKeys);
            }
            data.children.forEach
            (
                i =>
                {
                    const c = this.renderOrCache(now, `${path}/${i.key}`, i);
                    const container = renderer.getChildModelContainer(cache.dom, i.key);
                    if (forceAppend || container !== c.dom.parentElement)
                    {
                        container.appendChild(c.dom)
                    }
                }
            );
            return cache;
        };
        public isSameOrder = (old: string[], now: string[]) =>
        {
            const filteredOld = old.filter(i => 0 <= now.indexOf(i));
            return old.filter((i,ix) => i !== now[ix]).length <= 0;
        }
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new ViewModel(tektite);
}
