import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
export module ViewModel
{
    export interface DomCache
    {
        dom: Element;
        json: string;
        childrenKeys: string[];
    }
    export type PathType = { type: "path", path: string, };
    export const isPathType = (data: unknown): data is PathType =>
        "path" === data?.["type"] &&
        "string" === typeof data?.["path"];
    export const makePath = (parent: "/" | PathType, key: string): PathType =>
    ({
        type: "path",
        path: `${"/" === parent ? "": parent.path}/${key}`,
    });
    export class ViewModel<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        private previousData: string;
        private data: Tektite.ViewModelBase;
        private renderer: { [type: string ]: Tektite.ViewRenderer};
        private eventHandlers:
        {
            [Property in Tektite.UpdateScreenEventEype]?: PathType[];
        };
        private unknownRenderer: Tektite.ViewRenderer;
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        update = (event: Tektite.UpdateScreenEventEype) =>
        {
            this.renderDom(); // this.eventHandlers を最新の状態にする為( だけど、ほぼ大半のケースで、何もせずに返ってくる。 )
            this.eventHandlers?.[event]?.forEach
            (
                path =>
                    (this.renderer[this.get(path)?.type]?.eventHandlers?.[event] as Tektite.ViewEventHandler<unknown>)
                    ?.(event, path)
            );
            this.renderDom(); // this.eventHandlers によって更新された model を rendering する為
        };
        pushEventHandler = (event: Tektite.UpdateScreenEventEype, path: PathType) =>
        {
            if ( ! this.eventHandlers[event])
            {
                this.eventHandlers[event] = [];
            }
            this.eventHandlers[event].push(path);
        };
        public onLoad = () =>
        {
        };
        public set(data: Tektite.ViewModelBase);
        public set(path: PathType, data: Tektite.ViewModelBase);
        public set(pathOrdata: PathType | Tektite.ViewModelBase, data?: Tektite.ViewModelBase)
        {
            if (isPathType(pathOrdata))
            {
                const path = pathOrdata;
                if (this.hasDuplicatedKeys(data))
                {
                    console.error(`tektite-view-model: Duplicated keys - data:${JSON.stringify(data)}`);
                }
                else
                {
                    const keys = path.path.split("/").filter(i => 0 < i.length);
                    if ("" !== keys[0])
                    {
                        console.error(`tektite-view-model: Invalid path - path:${path.path}`);
                    }
                    else
                    {
                        keys.shift();
                        if (data?.key !== keys[keys.length -1])
                        {
                            console.error(`tektite-view-model: Unmatch path and key - path:${path.path}, data:${JSON.stringify(data)}`);
                        }
                        let current: Tektite.ViewModelBase;
                        if (1 < keys.length)
                        {
                            current = { children: [ this.data ] } as Tektite.ViewModelBase;
                            while(1 < keys.length)
                            {
                                current = (current.children ?? []).filter(i => i.key === keys[0])[0];
                                if ( ! current)
                                {
                                    console.error(`tektite-view-model: Path not found - path:${path.path}`);
                                    break;
                                }
                                keys.shift();
                            }
                            if (current)
                            {
                                current.children = current.children?.filter(i => i.key !== keys[0]) ?? [];
                                current.children.push(data);
                            }
                        }
                        else
                        if (0 < keys.length)
                        {
                            this.data = data;
                        }
                        else
                        {
                            console.error(`tektite-view-model: Path not found - path:${pathOrdata}`);
                        }
                    }
                }
            }
            else
            {
                const data = pathOrdata;
                if (this.hasDuplicatedKeys(data))
                {
                    console.error(`tektite-view-model: Duplicated keys - data:${data}`);
                }
                else
                {
                    this.data = data;
                }
            }
        }
        public get = (path: PathType = null) =>
        {
            if ( ! path)
            {
                return this.data;
            }
            else
            {
                let current: Tektite.ViewModelBase;
                const keys = path.path.split("/").filter(i => 0 < i.length);
                if ("" !== keys[0])
                {
                    console.error(`tektite-view-model: Invalid path - path:${path.path}`);
                }
                else
                {
                    keys.shift();
                    if (0 < keys.length)
                    {
                        current = { children: [ this.data ] } as Tektite.ViewModelBase;
                        while(0 < keys.length)
                        {
                            current = (current.children ?? []).filter(i => i.key === keys[0])[0];
                            if ( ! current)
                            {
                                console.error(`tektite-view-model: Path not found - path:${path.path}`);
                                break;
                            }
                            keys.shift();
                        }
                    }
                    else
                    {
                        console.error(`tektite-view-model: Path not found - path:${path.path}`);
                    }
                }
                return current;
            }
        };
        public hasInvalidViewModel = (data: Tektite.ViewModelBase) =>
            "" === (data?.key ?? "") ||
            "" === (data?.type ?? "") ||
            0 < (data?.children ?? []).filter(i => this.hasInvalidViewModel(i)).length;
        public hasDuplicatedKeys = (data: Tektite.ViewModelBase) =>
            0 < (data?.children ?? []).map(i => i.key).filter((i, ix, list) => 0 <= list.indexOf(i, ix +1)).length ||
            0 < (data?.children ?? []).filter(i => this.hasDuplicatedKeys(i)).length;
        public renderDom = async (now: number = new Date().getTime()) =>
        {
            let result: Element;
            const json = JSON.stringify(this.data);
            if (this.previousData !== json)
            {
                this.activePathList = [ ];
                this.eventHandlers = { };
                const oldCache: { [path: string]:DomCache } = { };
                Object.keys(this.domCache).forEach
                (
                    path =>
                    {
                        const cache = this.domCache[path];
                        oldCache[path] =
                        {
                            dom: cache.dom,
                            json: cache.json,
                            childrenKeys: minamo.core.simpleDeepCopy(cache.childrenKeys),
                        };
                    }
                );
                const data = JSON.parse(json) as Tektite.ViewModelBase;
                if (this.hasDuplicatedKeys(data))
                {
                    console.error(`tektite-view-model: Duplicated keys - data:${JSON.stringify(data)}`);
                }
                else
                {
                    result = (await this.renderOrCache(now, makePath("/", data?.key), data)).dom;
                    Object.keys(this.domCache)
                        .filter(path => this.activePathList.indexOf(path) <= 0)
                        .forEach(path => delete this.domCache[path]);
                    Object.keys(oldCache)
                        .filter(path => oldCache[path].dom !== this.domCache[path]?.dom)
                        .map(path => oldCache[path].dom)
                        .forEach(dom => dom.parentElement.removeChild(dom));
                    this.previousData = json;
                }
            }
            return result;
        };
        private activePathList: string[] = [];
        private domCache: { [path: string]:DomCache } = { };
        public getCache = (path: PathType) => this.domCache[path.path];
        public setCache = (path: PathType, dom: Element, data: string, childrenKeys: string[]) =>
            this.domCache[path.path] =
            {
                dom,
                json: data,
                childrenKeys
            };
        public renderOrCache = async (now: number, path: PathType, data: Tektite.ViewModelBase): Promise<DomCache> =>
        {
            this.activePathList.push(path?.path);
            let cache = this.getCache(path);
            const renderer = this.renderer[data?.type] ?? this.unknownRenderer;
            const outputError = (message: string) => console.error(`tektite-view-model: ${message} - path:${path.path}, data:${JSON.stringify(data)}`);
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
                outputError(`Unknown type ${JSON.stringify(data?.type)}`);
            }
            else
            {
                const oldChildrenKeys = cache?.childrenKeys ?? [];
                const childrenKeys = data?.children?.map(i => i.key) ?? [];
                const forceAppend = renderer.isListContainer && this.isSameOrder(oldChildrenKeys, childrenKeys);
                const json = JSON.stringify
                ({
                    type: data?.type,
                    key: data?.key,
                    data: data?.data
                });
                if (cache?.json !== json)
                {
                    let dom = cache.dom ?? await renderer.make();
                    dom = await renderer.update(path, cache.dom, data);
                    cache = this.setCache(path, dom, json, childrenKeys);
                }
                Object.keys(renderer.eventHandlers ?? { })
                    .forEach(event => this.pushEventHandler(event as Tektite.UpdateScreenEventEype, path));
                await Promise.all
                (
                    data.children.map
                    (
                        async i =>
                        {
                            const c = await this.renderOrCache(now, makePath(path, i.key), i);
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
            return filteredOld.filter((i,ix) => i !== now[ix]).length <= 0;
        }
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new ViewModel(tektite);
}
