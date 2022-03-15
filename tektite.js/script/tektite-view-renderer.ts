import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { ViewModel } from "./tektite-view-model";
export module ViewRenderer
{
    export interface Entry
    {
        make: (() => Promise<Element | minamo.dom.Source>) | minamo.dom.Source;
        update: (path: ViewModel.PathType, dom: Element, model: ViewModel.Entry) => Promise<Element>;
        getChildModelContainer: (dom: Element, key: string) => Element;
        isListContainer?: boolean;
        eventHandlers?: EventHandlers;
    };
    export type EventHandler<EventType = Tektite.UpdateScreenEventEype> = (event: EventType, path: ViewModel.PathType) => unknown;
    export type EventHandlers = { [Property in Tektite.UpdateScreenEventEype]?: EventHandler<Property>; }
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
            update: async (_path: ViewModel.PathType, dom: Element, model: ViewModel.Entry) =>
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
            getChildModelContainer: (dom: Element, key: string) =>
            {
                switch(key)
                {
                case "screen-header":
                case "screen-body":
                case "screen-bar":
                case "screen-toast":
                    return dom.getElementsByClassName("tektite-screen")[0];
                }
                return null;
            },
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
            update: async (_path: ViewModel.PathType, dom: Element, _model: ViewModel.Entry) =>
            {
                return dom;
            },
            getChildModelContainer: (dom: Element, key: string) =>
            {

            },
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
            update: async (_path: ViewModel.PathType, dom: Element, _model: ViewModel.Entry) =>
            {
                return dom;
            },
            getChildModelContainer: (dom: Element, key: string) =>
            {

            },
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
            update = async (_path: ViewModel.PathType, dom: Element, _model: ViewModel.Entry) =>
            {
                return dom;
            },
            getChildModelContainer: (dom: Element, key: string) =>
            {
                
            },
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
            update = async (_path: ViewModel.PathType, dom: Element, _model: ViewModel.Entry) =>
            {
                return dom;
            }
            getChildModelContainer: (dom: Element, key: string) => Element;
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
    export class ViewRenderer<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        private previousData: string;
        private renderer: { [type: string ]: Entry};
        private eventHandlers:
        {
            [Property in Tektite.UpdateScreenEventEype]?: ViewModel.PathType[];
        };
        private unknownRenderer: Entry;
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
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
                    let dom = cache.dom ?? await this.makeOrNull(renderer.make);
                    dom = await renderer.update(path, cache.dom, data);
                    cache = this.setCache(path, dom, json, childrenKeys);
                }
                Object.keys(renderer.eventHandlers ?? { })
                    .forEach(event => this.pushEventHandler(event as Tektite.UpdateScreenEventEype, path));
                const childrenCache = await Promise.all(data.children.map(async i => await this.renderOrCache(now, ViewModel.makePath(path, i.key), i)));
                childrenCache.forEach
                (
                    (c, ix) =>
                    {
                        if (c.dom)
                        {
                            const container = renderer.getChildModelContainer(cache.dom, data.children[ix].key);
                            if (container)
                            {
                                if (forceAppend || container !== c.dom.parentElement)
                                {
                                    container.appendChild(c.dom)
                                }
                            }
                            else
                            {
                                console.error(`tektite-view-renderer: Dom mapping not found - parent.path:${path.path}, key:${data.children[ix].key}`);
                            }
                        }
                    }
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
        new ViewRenderer(tektite);
}
