import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { ViewCommand } from "./tektite-view-command.js";
import { ViewModel } from "./tektite-view-model";
export module ViewRenderer
{
    export type DomType = Element | Element[];
    export const getPrimaryElement = (dom: DomType): Element => Array.isArray(dom) ? dom[0]: dom;
    export const getElementList = (dom: DomType): Element[] => Array.isArray(dom) ? dom: [dom];
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
        make: (() => Promise<DomType | minamo.dom.Source>) | minamo.dom.Source,
        update?: <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, path: ViewModel.PathType, dom: DomType, data: ViewModelEntry["data"], externalModels: { [path: string]:any }) => Promise<DomType>,
    };
    export type Entry<ViewModelEntry extends ViewModel.EntryBase> = VolatileDomEntry<ViewModelEntry> | DomEntry<ViewModelEntry> | ContainerEntry;
    export const isContainerEntry = <ViewModelEntry extends ViewModel.EntryBase>(entry: Entry<ViewModelEntry>): entry is ContainerEntry => "container" === entry.make;
    export const isVolatileDomEntry = <ViewModelEntry extends ViewModel.EntryBase>(entry: Entry<ViewModelEntry>): entry is VolatileDomEntry<ViewModelEntry> => "volatile" === entry.make;
    export type EventHandler<T extends Tektite.ParamTypes> = (tektite: Tektite.Tektite<T>, event: Tektite.UpdateScreenEventEype, path: ViewModel.PathType) => unknown;
    export type EventHandlers<T extends Tektite.ParamTypes> = { [Key in Tektite.UpdateScreenEventEype]?: EventHandler<T>; }
    interface DomCache
    {
        dom: DomType;
        json: string;
        childrenKeys: string[];
    }
    // export class ViewRenderer<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    export class ViewRenderer<T extends Tektite.ParamTypes>
    {
        private previousData: string = "";
        private eventHandlers:
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
                        await this.renderRoot(); // this.eventHandlers によって更新された model を rendering する為
                    }
                );
            }
            else
            {
                await this.renderRoot(); // this.eventHandlers を最新の状態にする為( だけど、ほぼ大半のケースで、何もせずに返ってくる。 )
                this.updateCore(event);
                await this.renderRoot(); // this.eventHandlers によって更新された model を rendering する為
            }
        };
        updateCore = async (event: Tektite.UpdateScreenEventEype) =>
        {
            this.eventHandlers[event]?.forEach
            (
                path =>
                {
                    const type = this.tektite.viewModel.getUnknown(path)?.type;
                    if (type)
                    {
                        ((this.getAny(type) as DomEntryAlpha)?.eventHandlers?.[event])
                            ?.(this.tektite, event, path)
                    }
                }
            );
        };
        pushEventHandler = (event: Tektite.UpdateScreenEventEype, path: ViewModel.PathType) =>
        {
            if ( ! this.eventHandlers[event])
            {
                this.eventHandlers[event] = [];
            }
            this.eventHandlers[event]?.push(path);
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
                        this.eventHandlers = { };
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
        public make = async (maker: (() => Promise<DomType | minamo.dom.Source>) | minamo.dom.Source): Promise<DomType> =>
        {
            const source = "function" === typeof maker ? await maker(): maker;
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
                                dom = cache?.dom ?? await this.make(renderer.make);
                                dom = (await renderer?.update?.(this.tektite, path, dom, data?.data, externalData)) ?? dom;
                            }
                            const primary = getPrimaryElement(dom) as HTMLElement;
                            if (data?.data?.onclick || null === primary.onclick)
                            {
                                primary.onclick = () => this.tektite.viewCommand.callByEvent(path, "onclick");
                                //  renderer.update() で独自に付与した onclick を消さない為、不要になっても dom.onclick は放置。(場合によっては、このせいで気にしないでいいエラーでログ出力される。)
                            }
                            cache = this.setCache(path, dom, json, childrenKeys);
                        }
                        minamo.core.objectKeys(renderer.eventHandlers ?? { })
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
                            dom = cache?.dom ?? await this.make(renderer.make);
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
            "tektite-root": minamo.core.extender<DomEntry<ViewModel.RootEntry>>()
            ({
                make: async () => document.body,
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.RootEntry["data"], _externalModels: { [path: string]:any }) =>
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
            "tektite-screen": minamo.core.extender<DomEntry<ViewModel.ScreenEntry>>()
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
                update: async <T extends Tektite.ParamTypes>(_ektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _data: ViewModel.RootEntry["data"], externalModels: { [path: string]:any }) =>
                {
                    const div = dom as HTMLDivElement;
                    const rootEntryData = <ViewModel.RootEntry["data"]>(externalModels[ViewModel.makeRootPath().path]);
                    if (rootEntryData)
                    {
                        const style = "header" !== rootEntryData.progressBarStyle ? "modern": "classic";
                        minamo.dom.setStyleProperty(div, "backgroundColor", "classic" === style ? "": (rootEntryData.windowColor ?? ""));
                        minamo.dom.setProperty(this.tektite.viewRenderer.get("tektite-screen").getChildModelContainer(dom), "className", `tektite-screen ${rootEntryData.className ?? ""}`);
                    }
                    return dom;
                },
                updateChildren: [ "screen-header", "screen-body", "screen-bar", "screen-toast" ],
                getChildModelContainer: (dom: DomType) => getPrimaryElement(dom).getElementsByClassName("tektite-screen")[0],
            }),
            "tektite-screen-header": minamo.core.extender<DomEntry<ViewModel.ScreenHeaderEntry>>()
            ({
                make:
                {
                    tag: "header",
                    id: "tektite-screen-header",
                    className: "tektite-segmented",
                },
                getExternalDataPath: [ ViewModel.makeRootPath("tektite-root") ],
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _data: ViewModel.ScreenHeaderEntry["data"], externalModels: { [path: string]:any }) =>
                {
                    const div = dom as HTMLDivElement;
                    const rootEntryData = <ViewModel.RootEntry["data"]>(externalModels[ViewModel.makeRootPath().path]);
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
                update: async <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ScreenHeaderSegmentCoreEntry["data"], _externalModels: { [path: string]:any }) =>
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
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ScreenHeaderLabelSegmentEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    getPrimaryElement(dom).className = `tektite-segment label-tektite-segment ${data?.className ?? ""}`;
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-screen-header-link-segment":
            {
                make:
                {
                    tag: "header",
                    id: "tektite-screen-header",
                    className: "tektite-segmented",
                },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _data: ViewModel.ScreenHeaderLinkSegmentEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    return dom;
                },
                updateChildren: "append",
                eventHandlers:
                {
        
                }
            },
            "tektite-screen-header-popup-segment":
            {
                make:
                {
                    tag: "header",
                    id: "tektite-screen-header",
                    className: "tektite-segmented",
                },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _data: ViewModel.ScreenHeaderPopupSegmentEntry["data"], _externalModels: { [path: string]:any }) =>
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
                            onclick:
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
                eventHandlers:
                {
                    "scroll": <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>, _event: Tektite.UpdateScreenEventEype, path: ViewModel.PathType) =>
                    {
                        tektite.viewCommand.call<ViewCommand.UpdatePrimaryPageFooterDownPageLinkCommand>
                        ({
                            type: "tektite-update-primary-page-footer-down-page-link",
                            data:
                            {
                                path,
                            },
                        });
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
                                ({
                                    type: "tektite-update-toast-item",
                                    data:
                                    {
                                        path,
                                        next: stateData.next,
                                    }
                                });
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
                make:
                Tektite.$div("tektite-vertical-button-list")([]),
                updateChildren: "append",
            },
            "tektite-button":
            {
                make: { tag: "button", },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ButtonEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    minamo.dom.setProperties(dom as HTMLButtonElement, data);
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-link-button":
            {
                make: { tag: "a", },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.LinkButtonEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    minamo.dom.setProperties(dom as HTMLButtonElement, data);
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-menu-button":
            {
                make: async () =>
                [
                    {
                        tag: "button",
                        className: "tektite-menu-button",
                        children: await this.tektite.loadIconOrCache("tektite-ellipsis-icon"),
                    },
                    {
                        tag: "div",
                        className: "tektite-menu-popup",
                        // onclick: async (event: MouseEvent) =>
                        // {
                        //     event.stopPropagation();
                        //     console.log("tektite-menu-popup.click!");
                        //     cover?.close();
                        //     close();
                        // },
                    },
                ],
                updateChildren: "append",
                getChildModelContainer: (dom: DomType) => (dom as Element[])[1]
            },
            "tektite-menu-item-button":
            {
                make: { tag: "button", },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.ButtonEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    minamo.dom.setProperties(dom as HTMLButtonElement, data ?? { });
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-menu-item-link-button":
            {
                make: { tag: "a", },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.LinkButtonEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    minamo.dom.setProperties(dom as HTMLButtonElement, data);
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-vanilla-span":
            {
                make: { tag: "span" },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.VanillaSpanEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    const element = getPrimaryElement(dom);
                    minamo.dom.setProperty(element, "className", data.className);
                    minamo.dom.setProperty(element, "innerText", data.innerText);
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-label-span":
            {
                make: { tag: "span", className: "label" },
                update: async <T extends Tektite.ParamTypes>(_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, data: ViewModel.LabelSpanEntry["data"], _externalModels: { [path: string]:any }) =>
                {
                    minamo.dom.setProperty(dom as HTMLSpanElement, "innerText", data.text);
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
