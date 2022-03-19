import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { ViewModel } from "./tektite-view-model";
export module ViewRenderer
{
    // export type UnknownViewModel = ViewModel.ViewModel<Tektite.ParamTypes>;
    export type UnknownViewModel = ViewModel.ViewModel;
    export interface Entry
    {
        make: (() => Promise<Element | minamo.dom.Source>) | minamo.dom.Source;
        update: (viewModel: UnknownViewModel, path: ViewModel.PathType, dom: Element, model: ViewModel.Entry) => Promise<Element>;
        updateChildren?: (viewModel: UnknownViewModel, path: ViewModel.PathType, dom: Element, model: ViewModel.Entry, children: { [Key: string]: Element }) => Promise<unknown>;
        // getChildModelContainer?: (dom: Element, key: string) => Element;
        eventHandlers?: EventHandlers;
    };
    export type EventHandler<EventType = Tektite.UpdateScreenEventEype> = (event: EventType, path: ViewModel.PathType) => unknown;
    export type EventHandlers = { [Key in Tektite.UpdateScreenEventEype]?: EventHandler<Key>; }
    export const renderer: { [type: string ]: Entry} =
    {
        "tektite-screen-root":
        {
            make:
            {
                parent: document.body,
                tag: "div",
                className: "tektite-foundation",
                children:
                {
                    tag: "div",
                    className: "tektite-screen",
                }
            },
            update: async (_viewModel: UnknownViewModel, _path: ViewModel.PathType, dom: Element, model: ViewModel.Entry) =>
            {
                const rootEntry = model as ViewModel.RootEntry;
                if ("string" === typeof rootEntry.data.title)
                {
                    if (document.title !== rootEntry.data.title)
                    {
                        document.title = rootEntry.data.title;
                    }
                }
                if ("string" === typeof rootEntry.data.windowColor)
                {
                    minamo.dom.setStyleProperty(document.body, "backgroundColor", `${rootEntry.data.windowColor}E8`);
                    minamo.dom.setProperty("#tektite-theme-color", "content", rootEntry.data.windowColor);
                }
                return dom;
            },
            updateChildren: async (_viewModel: UnknownViewModel, _path: ViewModel.PathType, dom: Element, model: ViewModel.Entry, children: { [Key: string]: Element }) =>
                minamo.dom.replaceChildren
                (
                    dom.getElementsByClassName("tektite-screen")[0],
                    [
                        children["screen-header"],
                        children["screen-body"],
                        children["screen-bar"],
                        children["screen-toast"],
                    ]
                ),
            // getChildModelContainer: (dom: Element, key: string) =>
            // {
            //     switch(key)
            //     {
            //     case "screen-header":
            //     case "screen-body":
            //     case "screen-bar":
            //     case "screen-toast":
            //         return dom.getElementsByClassName("tektite-screen")[0];
            //     }
            //     return null;
            // },
            eventHandlers:
            {
            }
        },
        "tektite-screen-header":
        {
            make:
            {
                tag: "header",
                id: "tektite-screen-header",
                className: "tektite-segmented",
            },
            update: async (_viewModel: UnknownViewModel, _path: ViewModel.PathType, dom: Element, _model: ViewModel.Entry) =>
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
        "tektite-screen-body":
        {
            make:
            {
                tag: "div",
                id: "tektite-screen-body",
                className: "tektite-screen-body",
            },
            update: async (_viewModel: UnknownViewModel, _path: ViewModel.PathType, dom: Element, _model: ViewModel.Entry) =>
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
            update: async (_viewModel: UnknownViewModel, _path: ViewModel.PathType, dom: Element, _model: ViewModel.Entry) =>
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
            update: async (_viewModel: UnknownViewModel, _path: ViewModel.PathType, dom: Element, _model: ViewModel.Entry) =>
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
                className: "tektite-item tektite-slide-up-in",
            },
            update: async (viewModel: UnknownViewModel, path: ViewModel.PathType, dom: Element, model: ViewModel.Entry) =>
            {
                const data = (model as ViewModel.ToastItemEntry).data;
                minamo.dom.replaceChildren
                (
                    dom,
                    data.isWideContent ?
                    [
                        data.backwardOperator,
                        data.content,
                        data.forwardOperator,
                    ].filter(i => undefined !== i):
                    [
                        data.backwardOperator ?? Tektite.$span("tektite-dummy")([]),
                        data.content,
                        data.forwardOperator ?? Tektite.$span("tektite-dummy")([]),
                    ]
                );
                const hideRaw = async (className: string, wait: number) =>
                {
                    if (null !== result.timer)
                    {
                        clearTimeout(result.timer);
                        result.timer = null;
                    }
                    if (dom.parentElement)
                    {
                        dom.classList.remove("tektite-slide-up-in");
                        dom.classList.add(className);
                        await minamo.core.timeout(wait);
                        viewModel.remove(path);
                        // // 以下は Safari での CSS バグをクリアする為の細工。本質的には必要の無い呼び出し。
                        // if (this.element.getElementsByClassName("item").length <= 0)
                        // {
                        //     await minamo.core.timeout(10);
                        //     tektite.screen.update("operate");
                        // }
                    }
                };
                const wait = data.wait ?? 5000;
                const result =
                {
                    // dom,
                    timer: 0 < wait ? setTimeout(() => hideRaw("tektite-slow-slide-down-out", 500), wait): null,
                    // hide: async () => await hideRaw("tektite-slide-down-out", 250),
                };
                setTimeout(() => dom.classList.remove("tektite-slide-up-in"), 250);
                return dom;
            },
            eventHandlers:
            {
    
            }
        },
    };
    interface DomCache
    {
        dom: Element;
        json: string;
        childrenKeys: string[];
    }
    // export class ViewRenderer<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    export class ViewRenderer<T extends Tektite.ParamTypes>
    {
        private previousData: string;
        private renderer: { [type: string ]: Entry};
        private eventHandlers:
        {
            [Key in Tektite.UpdateScreenEventEype]?: ViewModel.PathType[];
        };
        private unknownRenderer: Entry;
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        update = (event: Tektite.UpdateScreenEventEype) =>
        {
            this.renderRoot(); // this.eventHandlers を最新の状態にする為( だけど、ほぼ大半のケースで、何もせずに返ってくる。 )
            this.eventHandlers?.[event]?.forEach
            (
                path =>
                    (this.renderer[this.tektite.viewModel.get(path)?.type]?.eventHandlers?.[event] as EventHandler<unknown>)
                    ?.(event, path)
            );
            this.renderRoot(); // this.eventHandlers によって更新された model を rendering する為
        };
        pushEventHandler = (event: Tektite.UpdateScreenEventEype, path: ViewModel.PathType) =>
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
        public renderRoot = async (data: ViewModel.Entry = this.tektite.viewModel.get(), now: number = new Date().getTime()) =>
        {
            let result: Element;
            const json = JSON.stringify(data);
            if (this.previousData !== json)
            {
                const data = JSON.parse(json) as ViewModel.Entry;
                if ( ! ViewModel.hasError(ViewModel.makeRootPath(), data))
                {
                    //  pre-process
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
                    //  present-process
                    result = (await this.renderOrCache(now, ViewModel.makeRootPath(), data)).dom;
                    //  post-process
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
        public getCache = (path: ViewModel.PathType) => this.domCache[path.path];
        public setCache = (path: ViewModel.PathType, dom: Element, data: string, childrenKeys: string[]) =>
            this.domCache[path.path] =
            {
                dom,
                json: data,
                childrenKeys
            };
        public makeOrNull = async (maker: (() => Promise<Element | minamo.dom.Source>) | minamo.dom.Source): Promise<Element | null> =>
        {
            const source = "function" === typeof maker ? await maker(): maker;
            return null === source ? source as null:
                source instanceof Element ? source:
                (minamo.dom.make(source) as Element);
        };
        public renderOrCache = async (now: number, path: ViewModel.PathType, data: ViewModel.Entry): Promise<DomCache> =>
        {
            this.activePathList.push(path?.path);
            let cache = this.getCache(path);
            const renderer = this.renderer[data?.type] ?? this.unknownRenderer;
            const outputError = (message: string) => console.error(`tektite-view-renderer: ${message} - path:${path.path}, data:${JSON.stringify(data)}`);
            // if ( ! data?.key || "" === data.key)
            // {
            //     outputError("It has not 'key'");
            // }
            // else
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
                const forceAppend = Array.isArray(data.children ?? []) && this.isSameOrder(oldChildrenKeys, childrenKeys);
                const json = JSON.stringify
                ({
                    type: data?.type,
                    data: data?.data
                });
                if (cache?.json !== json)
                {
                    let dom = cache.dom ?? await this.makeOrNull(renderer.make);
                    dom = await renderer.update(this.tektite.viewModel, path, cache.dom, data);
                    cache = this.setCache(path, dom, json, childrenKeys);
                }
                Object.keys(renderer.eventHandlers ?? { })
                    .forEach(event => this.pushEventHandler(event as Tektite.UpdateScreenEventEype, path));
                const childrenCache = await Promise.all(childrenKeys.map(async key => await this.renderOrCache(now, ViewModel.makePath(path, key), ViewModel.getChildFromModelKey(data, key))));
                this.appendChildren(renderer, path, cache, childrenCache, forceAppend);
            }
            return cache;
        };
        public isSameOrder = (old: string[], now: string[]) =>
        {
            const filteredOld = old.filter(i => 0 <= now.indexOf(i));
            return filteredOld.filter((i,ix) => i !== now[ix]).length <= 0;
        }
        public appendChildren = (renderer: Entry, path: ViewModel.PathType, cache: DomCache, childrenCache: DomCache[], forceAppend: boolean) => childrenCache.forEach
        (
            (c, ix) =>
            {
                if (c.dom)
                {
                    const container = renderer.getChildModelContainer(cache.dom, cache.childrenKeys[ix]);
                    if (container)
                    {
                        if (forceAppend || container !== c.dom.parentElement)
                        {
                            container.appendChild(c.dom)
                        }
                    }
                    else
                    {
                        console.error(`tektite-view-renderer: Dom mapping not found - parent.path:${path.path}, key:${cache.childrenKeys[ix]}`);
                    }
                }
            }
        );
    }
    // export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
    //     new ViewRenderer(tektite);
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewRenderer(tektite);
}
