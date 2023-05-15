import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { ViewCommand } from "./tektite-view-command.js";
import { ViewModel } from "./tektite-view-model";
export module ViewRenderer
{
    export type DomType = Element | Element[];
    export const getPrimaryElement = (dom: DomType): Element => Array.isArray(dom) ? dom[0]: dom;
    export const getSecondaryElement = (dom: DomType): Element => Array.isArray(dom) ? dom[1]: dom;
    export const getElementList = (dom: DomType): Element[] => Array.isArray(dom) ? dom: [dom];
    export interface NullEntry
    {
        make: "null",
    };
    export const nullEntry: NullEntry =
    {
        make: "null",
    };
    export interface ContainerEntry
    {
        make: "container",
    };
    export const containerEntry: ContainerEntry =
    {
        make: "container",
    };
    export interface DomEntryAlpha
    {
        updateChildren?:
            //  simple list ( default )
            "append" |
            //  regular list
            string[] |
            //  custom
            ((dom: DomType, children: { [Key: string]: DomType }, forceAppend: boolean) => Promise<unknown>),
        getChildModelContainer?: (dom: DomType) => Element,
        eventHandlers?: EventHandlers<any>,
        screenEventHandlers?: ScreenEventHandlers<any>,
    };
    export interface DomEntryBeta<ViewModelEntry extends ViewModel.EntryBase> extends DomEntryAlpha
    {
        completer?: <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, path: ViewModel.PathType, model: ViewModelEntry) => ViewModelEntry,
        getExternalDataPath?: (ViewModel.PathType[]) | (<T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, path: ViewModel.PathType, model: ViewModelEntry) => ViewModel.PathType[]),
    };
    export interface VolatileDomEntry<ViewModelEntry extends ViewModel.EntryBase> extends DomEntryBeta<ViewModelEntry>
    {
        make: "volatile",
        update: <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, path: ViewModel.PathType, data: ViewModelEntry["data"], externalModels: { [path: string]:any }) => Promise<DomType>,
    };
    export interface DomEntry<ViewModelEntry extends ViewModel.EntryBase> extends DomEntryBeta<ViewModelEntry>
    {
        make: ((path: ViewModel.PathType) => Promise<DomType | minamo.dom.Source>) | minamo.dom.Source,
        update?: <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, path: ViewModel.PathType, dom: DomType, data: ViewModelEntry["data"], externalModels: { [path: string]:any }) => Promise<DomType>,
    };
    export type Entry<ViewModelEntry extends ViewModel.EntryBase> = NullEntry | ContainerEntry | VolatileDomEntry<ViewModelEntry> | DomEntry<ViewModelEntry>;
    export const isNullEntry = <ViewModelEntry extends ViewModel.EntryBase>(entry: Entry<ViewModelEntry>): entry is NullEntry => "null" === entry.make;
    export const isContainerEntry = <ViewModelEntry extends ViewModel.EntryBase>(entry: Entry<ViewModelEntry>): entry is ContainerEntry => "container" === entry.make;
    export const isVolatileDomEntry = <ViewModelEntry extends ViewModel.EntryBase>(entry: Entry<ViewModelEntry>): entry is VolatileDomEntry<ViewModelEntry> => "volatile" === entry.make;
    export type EventType = "onclick";
    export type EventHandler<T extends Tektite.ParamTypes> = (tektite: Tektite.Tektite<T>, event: EventType, path: ViewModel.PathType) => unknown;
    export type EventHandlers<T extends Tektite.ParamTypes> = { [Key in EventType]?: EventHandler<T>; }
    export type ScreenEventHandler<T extends Tektite.ParamTypes> = (tektite: Tektite.Tektite<T>, event: Tektite.UpdateScreenEventEype, path: ViewModel.PathType) => unknown;
    export type ScreenEventHandlers<T extends Tektite.ParamTypes> = { [Key in Tektite.UpdateScreenEventEype]?: ScreenEventHandler<T>; }
    interface DomCache
    {
        dom: DomType;
        json: string;
        childrenKeys: string[];
    }
    // export class ViewRenderer<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    export const onClickLink = <T extends Tektite.ParamTypes, Model extends (ViewModel.EntryBase & { data: { href: Tektite.HrefType<T> } })>(tektite: Tektite.Tektite<T>, path: ViewModel.PathType, type: Model["type"]) => (event: MouseEvent) =>
    {
        const model = tektite.viewModel.getOrNull<Model>(path, type);
        if (model && model.data && model.data.href && "string" !== typeof model.data.href)
        {
            tektite.params.showUrl(model.data.href);
            event.preventDefault();
            return false;
        }
        return true;
    }

    export class ViewRenderer<T extends Tektite.ParamTypes>
    {
        private previousData: string = "";
        private screenEventHandlers:
        {
            [Key in Tektite.UpdateScreenEventEype]?: ViewModel.PathType[];
        } = { };
        private unknownRenderer: Entry<any> | null = null;
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        update = async (event: Tektite.UpdateScreenEventEype) =>
        {
            if (this.isRendering)
            {
                this.renderWaitQueue.push
                (
                    async () =>
                    {
                        this.updateCore(event);
                        await this.renderRoot(); // this.screenEventHandlers によって更新された model を rendering する為
                    }
                );
            }
            else
            {
                await this.renderRoot(); // this.screenEventHandlers を最新の状態にする為( だけど、ほぼ大半のケースで、何もせずに返ってくる。 )
                this.updateCore(event);
                await this.renderRoot(); // this.screenEventHandlers によって更新された model を rendering する為
            }
        };
        updateCore = async (event: Tektite.UpdateScreenEventEype) =>
        {
            this.screenEventHandlers[event]?.forEach
            (
                path =>
                {
                    const type = this.tektite.viewModel.getUnknown(path)?.type;
                    if (type)
                    {
                        ((this.getAny(type) as DomEntryAlpha)?.screenEventHandlers?.[event])
                            ?.(this.tektite, event, path)
                    }
                }
            );
        };
        pushEventHandler = (event: Tektite.UpdateScreenEventEype, path: ViewModel.PathType) =>
        {
            if ( ! this.screenEventHandlers[event])
            {
                this.screenEventHandlers[event] = [];
            }
            this.screenEventHandlers[event]?.push(path);
        };
        public onLoad = () =>
        {
        };
        private isRendering = false;
        private volatileModelPath: ViewModel.PathType[] = [];
        public renderWaitQueue: (() => Promise<unknown> | unknown)[] = [];
        public renderRoot = async (data: ViewModel.StrictEntry | null = this.tektite.viewModel.getUnknown()) =>
        {
            let result: DomType | "rendering" | null = null;
            const json = JSON.stringify(data);
            if (this.isRendering)
            {
                this.renderWaitQueue.push(this.renderRoot);
                // setTimeout(() => this.renderRoot(), 10);
                result = "rendering";
            }
            else
            if (this.previousData === json)
            {
                if (0 < this.volatileModelPath.length)
                {
                    try
                    {
                        this.isRendering = true;
                        await Promise.all(this.volatileModelPath.map(async path => this.renderVolatile(path)));
                    }
                    finally
                    {
                        this.isRendering = false;
                    }
                }
                result = this.getCache(ViewModel.makeRootPath())?.dom ?? null;
            }
            else
            {
                try
                {
                    this.isRendering = true;
                    const data = JSON.parse(json) as ViewModel.StrictEntry;
                    if ( ! ViewModel.hasError(ViewModel.makeRootPath(), data))
                    {
                        //  pre-process
                        this.activePathList = [ ];
                        this.screenEventHandlers = { };
                        this.volatileModelPath = [ ];
                        const oldCache: { [path: string]:DomCache } = { };
                        minamo.core.objectKeys(this.domCache).forEach
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
                        //  present-process
                        result = (await this.renderOrCache(ViewModel.makeRootPath(), data))?.dom ?? null;
                        //  post-process
                        minamo.core.objectKeys(this.domCache)
                            .filter(path => this.activePathList.indexOf(path) <= 0)
                            .forEach(path => delete this.domCache[path]);
                        minamo.core.objectKeys(oldCache)
                            .filter(path => oldCache[path].dom !== this.domCache[path]?.dom)
                            .map(path => oldCache[path].dom)
                            .forEach(dom => getElementList(dom).forEach(element => element.parentElement?.removeChild(element)));
                        this.previousData = json;
                    }
                }
                finally
                {
                    this.isRendering = false;
                    setTimeout
                    (
                        async () =>
                        {
                            while(true)
                            {
                                const current = this.renderWaitQueue.shift();
                                if (current && ! this.isRendering)
                                {
                                    await current();
                                }
                                else
                                {
                                    break;
                                }
                            }
                        },
                        0
                    );
                }
            }
            return result;
        };
        private activePathList: string[] = [];
        private domCache: { [path: string]:DomCache } = { };
        public getCache = (path: ViewModel.PathType): DomCache | undefined => this.domCache[path.path];
        public setCache = (path: ViewModel.PathType, dom: DomType, data: string, childrenKeys: string[]) =>
            this.domCache[path.path] =
            {
                dom,
                json: data,
                childrenKeys
            };
        private make = async (path: ViewModel.PathType, maker: ((path: ViewModel.PathType) => Promise<DomType | minamo.dom.Source>) | minamo.dom.Source): Promise<DomType> =>
        {
            const source = "function" === typeof maker ? await maker(path): maker;
            try
            {
                return source instanceof Element ? source:
                    ! Array.isArray(source) ? (minamo.dom.make(source) as Element):
                    source.map
                    (
                        i =>
                            i instanceof Element ? i:
                            (minamo.dom.make(i) as Element)
                    );
            }
            catch(err)
            {
                console.log(JSON.stringify(source));
                throw err;
            }
        };
        public instantMake = async <Model extends ViewModel.Entry>(model: Model): Promise<DomType> =>
        {
            const outputError = (message: string) =>
            {
                throw new Error(`tektite-view-renderer: ${message} - path:${path.path}, data:${JSON.stringify(data)}`)
            };
            const path = ViewModel.makeDummyPath();
            const data = this.tektite.viewModel.makeSureStrictEntry(path, model);
            let dom: DomType = [];
            const renderer = this.getAny(data.type) ?? this.unknownRenderer;
            if ( ! renderer)
            {
                outputError(`Unknown type ${JSON.stringify(data.type)}`);
            }
            else
            if (isNullEntry(renderer))
            {
                //  null entry
            }
            else
            if ( ! isContainerEntry(renderer))
            {
                const externalData = this.getExternalData(path, data, renderer.getExternalDataPath);
                if (isVolatileDomEntry(renderer))
                {
                    dom = await renderer.update(this.tektite, path, data.data, externalData);
                }
                else
                {
                    dom = await this.make(path, renderer.make);
                    dom = (await renderer?.update?.(this.tektite, path, dom, data.data, externalData)) ?? dom;
                }
                const primary = getPrimaryElement(dom) as HTMLElement;
                const entryOrList = data?.data?.onclick;
                const onclick = renderer.eventHandlers?.onclick;
                if (onclick || entryOrList)
                {
                    primary.onclick = async () =>
                    {
                        console.log(`onclick: ${path.path}`);
                        if (onclick)
                        {
                            onclick(this.tektite, "onclick", path);
                        }
                        await this.tektite.viewCommand.callByEvent(path, "onclick")
                    }
                }
                if (renderer.screenEventHandlers)
                {
                    outputError("Can not support screenEventHandlers");
                }
                if (data.data?.isVolatile)
                {
                    outputError("Can not support volatile");
                }
                const childrenKeys = ViewModel.getChildrenModelKeys(data);
                if (0 < childrenKeys.length)
                {
                    const childrenCache = await Promise.all
                    (
                        childrenKeys.map
                        (
                            async key =>
                            {
                                const child = ViewModel.getChildFromModelKey(data, key);
                                return child ? await this.instantMake(child): undefined;
                            }
                        )
                    );
                    const forceAppend = true;
                    const childrenKeyDomMap: { [key:string]: DomType } = { };
                    childrenKeys.forEach
                    (
                        (key, ix) => childrenKeyDomMap[key] =
                            childrenCache[ix] ??
                            this.aggregateChildren(ViewModel.makePath(path, key), ViewModel.getChildFromModelKey(data, key)) // これは実際には機能しない。
                    );
                    const container = renderer.getChildModelContainer?.(dom) ?? getPrimaryElement(dom);
                    if (undefined === renderer.updateChildren || "append" === renderer.updateChildren)
                    {
                        this.appendChildren(container, childrenKeyDomMap, forceAppend);
                    }
                    else
                    if (Array.isArray(renderer.updateChildren))
                    {
                        this.replaceChildren(container, childrenKeyDomMap, renderer.updateChildren);
                    }
                    else
                    {
                        await renderer.updateChildren(container, childrenKeyDomMap, forceAppend);
                    }
                    childrenKeys.forEach
                    (
                        (key, ix) =>
                        {
                            const dom = childrenCache[ix];
                            if (minamo.core.exists(dom) && this.hasLeakChildren(dom))
                            {
                                outputError(`Not allocate dom ${key}`);
                            }
                        }
                    );
                }
            }
            else
            {
                outputError("Can not make ContainerEntry");
            }
            return dom;
        };
        public getExternalData = (path: ViewModel.PathType, model: ViewModel.EntryBase, getExternalDataPath?: (ViewModel.PathType[]) | ((tektite: Tektite.Tektite<T>, path: ViewModel.PathType, model: ViewModel.EntryBase) => ViewModel.PathType[])): { [path: string]:any } =>
        {
            const result: { [path: string]:any } = { };
            if (getExternalDataPath)
            {
                const pathList = "function" === typeof getExternalDataPath ?
                    getExternalDataPath(this.tektite, path, model):
                    getExternalDataPath;
                pathList.forEach
                (
                    path => result[path.path] = this.tektite.viewModel.getUnknown(path)?.data
                )
            }
            return result;
        }
        public renderOrCache = async (path: ViewModel.PathType, data: ViewModel.StrictEntry | null): Promise<DomCache | undefined> =>
        {
            this.activePathList.push(path?.path);
            let cache = this.getCache(path);
            const outputError = (message: string) => console.error(`tektite-view-renderer: ${message} - path:${path.path}, data:${JSON.stringify(data)}`);
            // if ( ! data?.key || "" === data.key)
            // {
            //     outputError("It has not 'key'");
            // }
            // else
            if ( ! data)
            {
                outputError("No data");
            }
            else
            {
                const renderer = this.getAny(data?.type) ?? this.unknownRenderer;
                if ( ! data?.type)
                {
                    outputError("It has not 'type'");
                }
                else
                if ( ! renderer)
                {
                    outputError(`Unknown type ${JSON.stringify(data?.type)}`);
                }
                if (isNullEntry(renderer))
                {
                    //  null entry
                }
                else
                {
                    const oldChildrenKeys = cache?.childrenKeys ?? [];
                    const childrenKeys = ViewModel.getChildrenModelKeys(data);
                    const childrenCache = await Promise.all
                    (
                        childrenKeys.map
                        (
                            async key => await this.renderOrCache(ViewModel.makePath(path, key), ViewModel.getChildFromModelKey(data, key))
                        )
                    );
                    if ( ! isContainerEntry(renderer))
                    {
                        const externalData = this.getExternalData(path, data, renderer.getExternalDataPath);
                        const json = JSON.stringify
                        ({
                            type: data?.type,
                            data: data?.data,
                            externalData,
                        });
                        if (cache?.json !== json)
                        {
                            let dom: DomType;
                            if (isVolatileDomEntry(renderer))
                            {
                                dom = await renderer.update(this.tektite, path, data?.data, externalData);
                            }
                            else
                            {
                                dom = cache?.dom ?? await this.make(path, renderer.make);
                                dom = (await renderer?.update?.(this.tektite, path, dom, data?.data, externalData)) ?? dom;
                            }
                            const primary = getPrimaryElement(dom) as HTMLElement;
                            const entryOrList = data?.data?.onclick;
                            const onclick = renderer.eventHandlers?.onclick;
                            if ((onclick || entryOrList) && null === primary.onclick)
                            {
                                primary.onclick = async () =>
                                {
                                    console.log(`onclick: ${path.path}`);
                                    if (onclick)
                                    {
                                        onclick(this.tektite, "onclick", path);
                                    }
                                    await this.tektite.viewCommand.callByEvent(path, "onclick")
                                };
                                //  renderer.update() で独自に付与した onclick を消さない為、不要になっても dom.onclick は放置。(場合によっては、このせいで気にしないでいいエラーでログ出力される。)
                            }
                            cache = this.setCache(path, dom, json, childrenKeys);
                        }
                        minamo.core.objectKeys(renderer.screenEventHandlers ?? { })
                            .forEach(event => this.pushEventHandler(event as Tektite.UpdateScreenEventEype, path));
                        if (data.data?.isVolatile)
                        {
                            this.volatileModelPath.push(path);
                        }
                        if (0 < childrenKeys.length)
                        {
                            if ( ! isContainerEntry(renderer))
                            {
                                const forceAppend = Array.isArray(data.children ?? []) && this.isSameOrder(oldChildrenKeys, childrenKeys);
                                const childrenKeyDomMap: { [key:string]: DomType } = { };
                                childrenKeys.forEach
                                (
                                    (key, ix) => childrenKeyDomMap[key] =
                                        childrenCache[ix]?.dom ??
                                        this.aggregateChildren(ViewModel.makePath(path, key), ViewModel.getChildFromModelKey(data, key))
                                );
                                const container = renderer.getChildModelContainer?.(cache.dom) ?? getPrimaryElement(cache.dom);
                                if (undefined === renderer.updateChildren || "append" === renderer.updateChildren)
                                {
                                    this.appendChildren(container, childrenKeyDomMap, forceAppend);
                                }
                                else
                                if (Array.isArray(renderer.updateChildren))
                                {
                                    this.replaceChildren(container, childrenKeyDomMap, renderer.updateChildren);
                                }
                                else
                                {
                                    await renderer.updateChildren(container, childrenKeyDomMap, forceAppend);
                                }
                                childrenKeys.forEach
                                (
                                    (key, ix) =>
                                    {
                                        const dom = childrenCache[ix]?.dom;
                                        if (minamo.core.exists(dom) && this.hasLeakChildren(dom))
                                        {
                                            outputError(`Not allocate dom ${key}`);
                                        }
                                    }
                                );
                            }
                        }
                    }
                }
            }
            return cache;
        };
        public renderVolatile = async (path: ViewModel.PathType): Promise<void> =>
        {
            const outputError = (message: string) => console.error(`tektite-view-renderer: ${message} - path:${path.path}, data:${JSON.stringify(data)}`);
            const data = this.tektite.viewModel.getUnknown(path);
            if ( ! data)
            {
                outputError("No data");
            }
            else
            {
                const renderer = this.getAny(data?.type) ?? this.unknownRenderer;
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
                if (isNullEntry(renderer))
                {
                    //  null entry
                }
                else
                {
                    if ( ! isContainerEntry(renderer))
                    {
                        let cache = this.getCache(path);
                        const externalData = this.getExternalData(path, data, renderer.getExternalDataPath);
                        let dom: DomType | null;
                        if (isVolatileDomEntry(renderer))
                        {
                            dom = await renderer.update(this.tektite, path, data?.data, externalData);
                        }
                        else
                        {
                            dom = cache?.dom ?? await this.make(path, renderer.make);
                            const newDom = (await renderer?.update?.(this.tektite, path, dom, data?.data, externalData)) ?? dom;
                            if (dom !== newDom)
                            {
                                outputError("Volatile updater can not change to another dom");
                            }
                        }
                    }
                    else
                    {
                        outputError("ContainerEntry can not volatile update");
                    }
                }
            }
        }
        public isSameOrder = (old: string[], now: string[]) =>
        {
            const filteredOld = old.filter(i => 0 <= now.indexOf(i));
            return filteredOld.filter((i,ix) => i !== now[ix]).length <= 0;
        }
        public hasLeakChildren = (children: DomType) =>
            0 < getElementList(children).filter(element => null === element.parentElement).length;
        public isAlreadySet = (container: Element, children: DomType) =>
            getElementList(children).filter(element => container !== element.parentElement).length <= 0;
        public appendChildren = (container: Element, children: { [Key: string]: DomType }, forceAppend: boolean) => minamo.core.objectKeys(children).forEach
        (
            key =>
            {
                const child = children[key];
                if (child && (forceAppend || ! this.isAlreadySet(container, child)))
                {
                    minamo.dom.appendChildren
                    (
                        container,
                        child
                    );
                }
            }
        );
        public replaceChildren = (container: Element, children: { [Key: string]: DomType }, keys: string[]) =>
        {
            const regulars = keys.map(key => children[key]).filter(i => i);
            if (0 < regulars.filter(dom => ! this.isAlreadySet(container, dom)).length)
            {
                minamo.dom.replaceChildren
                (
                    container,
                    regulars
                );
            }
        };
        public aggregateChildren = (path: ViewModel.PathType, data: ViewModel.StrictEntry | null): DomType =>
            ViewModel.getChildrenModelKeys(data)
                .map(key => this.getCache(ViewModel.makePath(path, key)) ?? { dom: this.aggregateChildren(ViewModel.makePath(path, key), ViewModel.getChildFromModelKey(data, key))})
                .map(i => getElementList(i.dom))
                .reduce((a, b) => a.concat(b), []);
        public get = <Type extends keyof ViewRenderer<T>["renderer"]>(type: Type): ViewRenderer<T>["renderer"][Type] => this.renderer[type];
        public getAny = <ViewModelEntry extends ViewModel.EntryBase>(type: string): Entry<ViewModelEntry> => this.get(type as any);
        public readonly renderer = //: { [type: string ]: Entry<any> } =
        {
            "tektite-null": nullEntry,
            "tektite-icon":minamo.core.extender<VolatileDomEntry<ViewModel.IconEntry<T>>>()
            ({
                make: "volatile",
                update: async <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, data: ViewModel.IconEntry<T>["data"], _externalModels: { [path: string]:any }) =>
                {
                    return await tektite.loadIconOrCache(data.icon);
                },
            }),
            "tektite-div":
            {
                make: { tag: "div", },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ScreenBodyEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    minamo.dom.setProperty(dom as HTMLDivElement, "className", data?.className ?? "");
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-span":
            {
                make: { tag: "span", },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ScreenBodyEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = getPrimaryElement(dom);
                    minamo.dom.setProperty(element, "className", data?.className);
                    if (undefined !== data?.text)
                    {
                        minamo.dom.setProperty(element, "innerText", data?.text);
                    }
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-link":
            {
                make: (path: ViewModel.PathType) =>
                ({
                    tag: "a",
                    onclick: onClickLink<T, ViewModel.LinkEntry<T>>(this.tektite, path, "tektite-link"),
                }),
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.LinkButtonEntry<T>["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = getPrimaryElement(dom);
                    minamo.dom.setProperty(element, "className", data.className);
                    minamo.dom.setProperty(element, "href", data.href);
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-root": minamo.core.extender<DomEntry<ViewModel.RootEntry<T>>>()
            ({
                make: async () => document.body,
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.RootEntry<T>["data"], _externalModels: { [path: string]:any }) =>
                {
                    if ("string" === typeof data?.title)
                    {
                        minamo.dom.setProperty(document, "title", data.title);
                    }
                    const setting = data?.theme ?? "auto";
                    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark": "light";
                    const theme = "auto" === setting ? system: setting;
                    [ "light", "dark", ].forEach
                    (
                        i => minamo.dom.toggleCSSClass(document.body, i, i === theme)
                    );
                    const style = "header" !== data?.progressBarStyle ? "modern": "classic";
                    [
                        { className: "tektite-style-modern", tottle: "modern" === style, },
                        { className: "tektite-style-classic", tottle: "classic" === style, },
                    ]
                    .forEach(i => minamo.dom.toggleCSSClass(document.body, i.className, i.tottle).isUpdate);
                    if ("string" === typeof data?.windowColor)
                    {
                        minamo.dom.setStyleProperty(document.body, "backgroundColor", `${data.windowColor}E8`);
                        minamo.dom.setProperty("#tektite-theme-color", "content", data.windowColor);
                    }
                    return dom;
                },
                updateChildren: "append",
                getChildModelContainer: (_dom: DomType) => document.body,
            }),
            "tektite-screen": minamo.core.extender<DomEntry<ViewModel.ScreenEntry<T>>>()
            ({
                make:
                {
                    // parent: document.body,
                    tag: "div",
                    className: "tektite-foundation",
                    children:
                    {
                        tag: "div",
                        className: "tektite-screen",
                    }
                },
                getExternalDataPath: [ ViewModel.makeRootPath("tektite-root") ],
                update: async <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _data: ViewModel.RootEntry<T>["data"], externalModels: { [path: string]:any }) =>
                {
                    const div = dom as HTMLDivElement;
                    const rootEntryData = <ViewModel.RootEntry<T>["data"]>(externalModels[ViewModel.makeRootPath().path]);
                    if (rootEntryData)
                    {
                        const style = "header" !== rootEntryData.progressBarStyle ? "modern": "classic";
                        minamo.dom.setStyleProperty(div, "backgroundColor", "classic" === style ? "": (rootEntryData.windowColor ?? ""));
                        minamo.dom.setProperty(tektite.viewRenderer.get("tektite-screen").getChildModelContainer(dom), "className", `tektite-screen ${rootEntryData.className ?? ""}`);
                    }
                    return dom;
                },
                updateChildren: [ "screen-header", "screen-body", "screen-bar", "screen-toast" ],
                getChildModelContainer: (dom: DomType) => getPrimaryElement(dom).getElementsByClassName("tektite-screen")[0],
            }),
            "tektite-screen-header": minamo.core.extender<DomEntry<ViewModel.ScreenHeaderEntry<T>>>()
            ({
                make:
                {
                    tag: "header",
                    id: "tektite-screen-header",
                    className: "tektite-segmented",
                },
                getExternalDataPath: [ ViewModel.makeRootPath("tektite-root") ],
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _data: ViewModel.ScreenHeaderEntry<T>["data"], externalModels: { [path: string]:any }) =>
                {
                    const div = dom as HTMLDivElement;
                    const rootEntryData = <ViewModel.RootEntry<T>["data"]>(externalModels[ViewModel.makeRootPath().path]);
                    if (rootEntryData)
                    {
                        const style = "header" !== rootEntryData?.progressBarStyle ? "modern": "classic";
                        minamo.dom.setStyleProperty(div, "backgroundColor", "classic" === style ? rootEntryData?.windowColor ?? "": "");
                    }
                    return dom;
                },
                updateChildren: [ "screen-header-progress-bar", "screen-header-segment", "screen-header-operator", ],
            }),
            "tektite-screen-header-progress-bar": minamo.core.extender<DomEntry<ViewModel.ScreenHeaderProgressBarEntry>>()
            ({
                make: { tag: "div", className: "tektite-progress-bar", },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ScreenHeaderProgressBarEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = getPrimaryElement(dom) as HTMLDivElement;
                    if (data?.percent && 0 < data.percent)
                    {
                        if (data?.color)
                        {
                            minamo.dom.setStyleProperty(element, "backgroundColor", data.color);
                        }
                        const percentString = Tektite.makePercentString(data.percent);
                        minamo.dom.setStyleProperty(element, "width", percentString);
                        minamo.dom.setStyleProperty(element, "borderRightWidth", "1px");
                    }
                    else
                    {
                        minamo.dom.setStyleProperty(element, "width", "0%");
                        minamo.dom.setStyleProperty(element, "borderRightWidth", "0px");
                    }
                    return dom;
                },
            }),
            "tektite-screen-header-segment-list": containerEntry,
            "tektite-screen-header-segment-core":
            {
                make:
                [
                    Tektite.$div("tektite-icon-frame")([]),
                    Tektite.$div("tektite-segment-title")([]),
                ],
                update: async <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ScreenHeaderSegmentCoreEntry<T>["data"], _externalModels: { [path: string]:any }) =>
                {
                    const list = getElementList(dom);
                    minamo.dom.replaceChildren(list[0], await tektite.params.loadIconOrCache(data.icon));
                    minamo.dom.replaceChildren(list[1], data.title);
                    return dom;
                },
            },
            "tektite-screen-header-label-segment":
            {
                make: Tektite.$div(`tektite-segment label-tektite-segment`)([]),
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ScreenHeaderLabelSegmentEntry<T>["data"], _externalModels: { [path: string]:any }) =>
                {
                    minamo.dom.setProperty(getPrimaryElement(dom), "className", `tektite-segment label-tektite-segment ${data?.className ?? ""}`);
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-screen-header-link-segment":
            {
                make: Tektite.$tag("a")(`tektite-segment link-tektite-segment`)([]),
                update: async <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ScreenHeaderLinkSegmentEntry<T>["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = (getPrimaryElement(dom) as HTMLAnchorElement);
                    minamo.dom.setProperty(element, "className", `tektite-segment link-tektite-segment ${data?.className ?? ""}`);
                    minamo.dom.setProperty
                    (
                        element,
                        "href",
                        "string" === typeof data.href ?
                            data.href:
                            tektite.params.makeUrl(data.href)
                    );
                    return dom;
                },
                updateChildren: "append",
                eventHandlers:
                {
        
                }
            },
            "tektite-screen-header-popup-segment":
            {
                make: Tektite.$div(`tektite-segment popup-tektite-segment`)([]),
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _data: ViewModel.ScreenHeaderPopupSegmentEntry<T>["data"], _externalModels: { [path: string]:any }) =>
                {
                    return dom;
                },
                updateChildren: "append",
                eventHandlers:
                {
        
                }
            },
            "tektite-screen-header-operator":
            {
                make:
                {
                    tag: "div",
                    className: "tektite-header-operator",
                },
            },
            "tektite-screen-body":
            {
                make:
                {
                    tag: "div",
                    id: "tektite-screen-body",
                    className: "tektite-screen-body",
                },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ScreenBodyEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    minamo.dom.setProperty(dom as HTMLDivElement, "className", `tektite-screen-body ${data?.className ?? ""}`);
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-primary-page":
            {
                make: Tektite.$div("tektite-primary-page")([]),
                updateChildren: [ "body", "footer" ],
            },
            "tektite-primary-page-body":
            {
                make: Tektite.$div("tektite-page-body")
                (
                    Tektite.$div("tektite-main-panel")([])
                ),
                updateChildren: "append",
                getChildModelContainer: (dom: DomType) => getPrimaryElement(dom).getElementsByClassName("tektite-main-panel")[0],
            },
            "tektite-primary-page-footer":
            {
                make: Tektite.$div("tektite-page-footer")([]),
                updateChildren: "append",
            },
            "tektite-primary-page-footer-down-page-link": minamo.core.extender<DomEntry<ViewModel.PrimaryPageFooterDownPageLinkEntry>>()
            ({
                completer: <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, model: ViewModel.PrimaryPageFooterDownPageLinkEntry) =>
                {
                    if ( ! model.data)
                    {
                        model.data =
                        {
                            isStrictShowPrimaryPage: true,
                            onclick: <ViewCommand.ScrollToCommand["params"]>
                            {
                                type: "tektite-scroll-to",
                                data:
                                {
                                    path:
                                    {
                                        type: "path",
                                        path: "/root/screen/screen-body/trail",
                                    },
                                }
                            },
                        };
                    }
                    return model;
                },
                make: async () => Tektite.$div("tektite-down-page-link tektite-icon-frame")(await this.tektite.loadIconOrCache("tektite-down-triangle-icon")),
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.PrimaryPageFooterDownPageLinkEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = getPrimaryElement(dom) as HTMLDivElement;
                    minamo.dom.toggleCSSClass(element, "tektite-reverse-down-page-link", ! (data?.isStrictShowPrimaryPage ?? true));
                    return dom;
                },
                screenEventHandlers:
                {
                    "scroll": <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, _event: Tektite.UpdateScreenEventEype, path: ViewModel.PathType) =>
                    {
                        tektite.viewCommand.call<ViewCommand.UpdatePrimaryPageFooterDownPageLinkCommand>
                        (
                            { path, },
                            {
                                type: "tektite-update-primary-page-footer-down-page-link",
                                data:
                                {
                                    path,
                                },
                            }
                        );
                    },
                },
            }),
            "tektite-trail-page":
            {
                make:
                Tektite.$div("tektite-trail-page")([]),
                updateChildren: "append",
            },
            "tektite-screen-bar":
            {
                make:
                {
                    tag: "div",
                    className: "tektite-screen-bar",
                    childNodes:
                    {
                        tag: "div",
                        className: "tektite-screen-bar-flash-layer",
                    },
                },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _data: ViewModel.ScreenBarEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    return dom;
                },
                // getChildModelContainer: (dom: Element, key: string) =>
                // {
                    
                // },
                eventHandlers:
                {
        
                }
            },
            "tektite-screen-toast":
            {
                make:
                {
                    tag: "div",
                    className: "tektite-screen-toast",
                },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _data: ViewModel.ScreenToastEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    return dom;
                },
                // getChildModelContainer: (dom: Element, key: string) => Element;
                eventHandlers:
                {
        
                }
            },
            "tektite-toast-item":
            {
                make:
                {
                    tag: "div",
                    className: "tektite-item",
                },
                update: async <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, path: ViewModel.PathType, dom: DomType, data: ViewModel.ToastItemEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = getPrimaryElement(dom);
                    const stateMap =
                    {
                        "slide-in":
                        {
                            className: "tektite-slide-up-in",
                            wait: 250,
                            next: <ViewModel.ToastStateType>"show",
                        },
                        "show":
                        {
                            className: "",
                            wait: data.wait ?? 5000,
                            next: <ViewModel.ToastStateType>"slow-slide-out",
                        },
                        "slow-slide-out":
                        {
                            className: "tektite-slow-slide-down-out",
                            wait: 500,
                            next: null,
                        },
                        "slide-out":
                        {
                            className: "tektite-slide-down-out",
                            wait: 250,
                            next: null,
                        },
                    };
                    const stateData = stateMap[data.state];
                    minamo.dom.setProperty(element, "className", `tektite-item ${stateData.className}`);
                    if (0 < stateData.wait)
                    {
                        setTimeout
                        (
                            async () =>
                            {
                                tektite.viewCommand.call<ViewCommand.UpdateToastItemCommand>
                                (
                                    { path, },
                                    {
                                        type: "tektite-update-toast-item",
                                        data:
                                        {
                                            path,
                                            next: stateData.next,
                                        }
                                    }
                                );
                            },
                            stateData.wait
                        );
                    }
                    return dom;
                },
                updateChildren: [ "backwardOperator", "content", "forwardOperator" ],
                eventHandlers:
                {
        
                }
            },
            "tektite-vertical-button-list":
            {
                make: Tektite.$div("tektite-vertical-button-list")([]),
                updateChildren: "append",
            },
            "tektite-button":
            {
                make: { tag: "button", },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ButtonEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = getPrimaryElement(dom);
                    minamo.dom.setProperty(element, "className", data.className);
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-link-button":
            {
                make: (path: ViewModel.PathType) =>
                ({
                    tag: "a",
                    onclick: onClickLink<T, ViewModel.LinkButtonEntry<T>>(this.tektite, path, "tektite-link-button"),
                }),
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.LinkButtonEntry<T>["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = getPrimaryElement(dom);
                    minamo.dom.setProperty(element, "className", data.className);
                    minamo.dom.setProperty(element, "href", data.href);
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-menu-button":
            {
                make: async (path: ViewModel.PathType) =>
                [
                    await this.instantMake<ViewModel.ButtonEntry>
                    ({
                        type: "tektite-button",
                        data:
                        {
                            className: "tektite-menu-button",
                            onclick: <ViewCommand.OnMenuButtonClickCommand["params"]>
                            {
                                type: "tektite-on-menu-button-click",
                                data: { path, },
                            },
                        },
                        children:
                        {
                            icon: this.tektite.viewModel.makeIcon({ icon: "tektite-ellipsis-icon", }),
                        },
                    }),
                    await this.instantMake<ViewModel.DivEntry>
                    ({
                        type: "tektite-div",
                        data:
                        {
                            className: "tektite-menu-popup",
                            onclick: <ViewCommand.SetDataCommand["params"]>
                            {
                                type: "tektite-set-data",
                                data:
                                {
                                    path,
                                    key: "state",
                                    value: "fade-out",
                                }
                            },
                        },
                    }),
                    await this.instantMake<ViewModel.DivEntry>
                    ({
                        type: "tektite-div",
                        data:
                        {
                            className: "tektite-screen-cover tektite-hide",
                            onclick: <ViewCommand.SetDataCommand["params"]>
                            {
                                type: "tektite-set-data",
                                data:
                                {
                                    path,
                                    key: "state",
                                    value: "fade-out",
                                }
                            },
                        },
                    }),
                ],
                update: async <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, path: ViewModel.PathType, dom: DomType, data: ViewModel.MenuButtonEntry<T>["data"], _externalModels: { [path: string]:any }) =>
                {
                    if (Array.isArray(dom))
                    {
                        const popup = dom[1];
                        const cover = dom[2];
                        const state = data?.state ?? "hide";
                        minamo.dom.toggleCSSClass(popup, "tektite-fade-in", "fade-in" === state);
                        minamo.dom.toggleCSSClass(cover, "tektite-fade-in", "fade-in" === state);
                        minamo.dom.toggleCSSClass(popup, "tektite-fade-out", "fade-out" === state);
                        minamo.dom.toggleCSSClass(cover, "tektite-fade-out", "fade-out" === state);
                        minamo.dom.toggleCSSClass(popup, "show", "hide" !== state);
                        minamo.dom.toggleCSSClass(cover, "tektite-hide", "hide" === state);
                        const switcher = (oldState: ViewModel.PopupStateType | undefined, newState: ViewModel.PopupStateType, wait: number) =>
                        {
                            setTimeout
                            (
                                async () =>
                                {
                                    await tektite.viewCommand.call<ViewCommand.SetDataCommand>
                                    (
                                        { path, },
                                        {
                                            type: "tektite-set-data",
                                            data:
                                            {
                                                path,
                                                key: "state",
                                                value: newState,
                                                oldValue: oldState,
                                            }
                                        }
                                    );
                                    await tektite.viewRenderer.renderRoot();
                                },
                                wait
                            );
                        };
                        switch(state)
                        {
                        case "fade-out":
                            switcher(data?.state, "hide", 500);
                            break;
                        case "fade-in":
                            switcher(data?.state, "show", 500);
                            break;
                        }
                    }
                    return dom;
                },
                updateChildren: "append",
                getChildModelContainer: (dom: DomType) => (dom as Element[])[1]
            },
            "tektite-menu-item-button":
            {
                make: { tag: "button", },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ButtonEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = getPrimaryElement(dom);
                    minamo.dom.setProperty(element, "className", `tektite-menu-item-button ${data?.className ?? ""}`);
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-menu-item-link-button":
            {
                make: (path: ViewModel.PathType) =>
                ({
                    tag: "a",
                    onclick: onClickLink<T, ViewModel.MenuItemLinkButtonEntry<T>>(this.tektite, path, "tektite-menu-item-link-button"),
                    children: [{ tag: "button", }],
                }),
                update: async <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.MenuItemLinkButtonEntry<T>["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = getPrimaryElement(dom);
                    minamo.dom.setProperty(element, "href", data.href);
                    minamo.dom.setProperty(tektite.viewRenderer.get("tektite-menu-item-link-button").getChildModelContainer(dom), "className", `tektite-menu-item-button ${data?.className ?? ""}`);
                    return dom;
                },
                updateChildren: "append",
                getChildModelContainer: (dom: DomType) => getPrimaryElement(dom).getElementsByTagName("button")[0]
            },
            "tektite-label-span":
            {
                make: { tag: "span", className: "tektite-label", },
                update: async <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.LabelSpanEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    const primary = getPrimaryElement(dom) as HTMLSpanElement;
                    minamo.dom.setProperty
                    (
                        primary.getElementsByClassName("locale-parallel")[0],
                        "innerText",
                        tektite.locale.parallel(data.text)
                    );
                    minamo.dom.setProperty
                    (
                        primary.getElementsByClassName("locale-map")[0],
                        "innerText",
                        tektite.locale.string(data.text)
                    );
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-dummy-span":
            {
                make: { tag: "span", className: "tektite-dummy" },
            },
        };
    }
    // export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
    //     new ViewRenderer(tektite);
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewRenderer(tektite);
}
