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
        private renderer: { [type: string ]: Tektite.ViewRenderer<unknown, Tektite.ViewModelBase<unknown>>};
        private unknownRenderer: Tektite.ViewRenderer<unknown, Tektite.ViewModelBase<unknown>>;
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        update: (event: Tektite.UpdateScreenEventEype) => unknown;
        public onLoad = () =>
        {
        };
        public set = (data: Tektite.ViewModelBase<unknown>) =>
        {
            if (this.hasDuplicatedKeys(data))
            {
                console.error(`tektite-view-model: Duplicated keys - data:${data}`);
            }
            else
            {
                this.data = data;
            }
        };
        public get = (path: string = "/") =>
        {
            if ("/" === path)
            {
                return this.data;
            }
            else
            {
                const keys = path.split("/").filter(i => 0 < i.length);
                let current: Tektite.ViewModelBase<unknown>;
                if (0 < keys.length)
                {
                    current = { children: [ this.data ] } as Tektite.ViewModelBase<unknown>;
                    while(0 < keys.length)
                    {
                        current = (current.children ?? []).filter(i => i.key === keys[0])[0];
                        if ( ! current)
                        {
                            console.error(`tektite-view-model: Path not found - path:${path}`);
                            break;
                        }
                        keys.shift();
                    }
                }
                else
                {
                    console.error(`tektite-view-model: Path not found - path:${path}`);
                }
                return current;
            }
        };
        public hasInvalidViewModel = (data: Tektite.ViewModelBase<unknown>) =>
            "" === (data?.key ?? "") ||
            "" === (data?.type ?? "") ||
            0 < (data?.children ?? []).filter(i => this.hasInvalidViewModel(i)).length;
        public hasDuplicatedKeys = (data: Tektite.ViewModelBase<unknown>) =>
            0 < (data?.children ?? []).map(i => i.key).filter((i, ix, list) => 0 <= list.indexOf(i, ix +1)).length ||
            0 < (data?.children ?? []).filter(i => this.hasDuplicatedKeys(i)).length;
        public renderDom = async (now: number = new Date().getTime()) =>
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
                const data = JSON.parse(json) as Tektite.ViewModelBase<unknown>;
                if (this.hasDuplicatedKeys(data))
                {
                    console.error(`tektite-view-model: Duplicated keys - data:${data}`);
                }
                else
                {
                    result = (await this.renderOrCache(now, `/${data?.key}`, data)).dom;
                    Object.keys(oldCache)
                        .filter(path => oldCache[path].dom !== this.domCache[path]?.dom)
                        .map(path => oldCache[path].dom)
                        .forEach(dom => dom.parentElement.removeChild(dom));
                    this.previousData = json;
                }
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
        public renderOrCache = async (now: number, path: string, data: Tektite.ViewModelBase<unknown>): Promise<DomCache<unknown>> =>
        {
            let cache = this.getCache(now, path);
            const oldChildrenKeys = cache?.childrenKeys ?? [];
            const childrenKeys = data?.children?.map(i => i.key) ?? [];
            const renderer = this.renderer[data?.type] ?? this.unknownRenderer;
            const forceAppend = renderer.isListContainer && this.isSameOrder(oldChildrenKeys, childrenKeys);
            const json = JSON.stringify(data?.data);
            const outputError = (message: string) => console.error(`tektite-view-model: ${message} - path:${path}, data:${JSON.stringify(data)}`);
            if ( ! data?.key || "" === data.key)
            {
                outputError("It has not 'key'");
            }
            else
            if ( ! data?.type)
            {
                outputError("It has not 'type'");
            }
            else
            if ( ! renderer)
            {
                outputError("Unknown type '${data?.type}'");
            }
            else
            {
                if (cache?.data !== json)
                {
                    let dom = cache.dom ?? await renderer.make();
                    dom = await renderer.update(cache, data);
                    cache = this.setCache(now, path, dom, data.type, json, childrenKeys);
                }
                await Promise.all
                (
                    data.children.map
                    (
                        async i =>
                        {
                            const c = await this.renderOrCache(now, `${path}/${i.key}`, i);
                            const container = renderer.getChildModelContainer(cache.dom, i.key);
                            if (forceAppend || container !== c.dom.parentElement)
                            {
                                container.appendChild(c.dom)
                            }
                        }
                    )
                );
            }
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
