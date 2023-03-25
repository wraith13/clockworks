import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { ViewCommand } from "./tektite-view-command.js";
import { ViewRenderer } from "./tektite-view-renderer.js";
export module ViewModel
{
    export type PathType = { type: "path", path: string, entryType?: string, };
    export const isPathType = (data: unknown): data is PathType =>
        "path" === (<PathType>data)?.type &&
        "string" === typeof (<PathType>data)?.path;
    export const makePath = (parent: "/" | PathType, key: string, entryType?: string): PathType =>
    ({
        type: "path",
        path: `${"/" === parent ? "": parent.path}/${key}`,
        entryType,
    });
    export const makeRootPath = (entryType?: string): PathType =>
    ({
        type: "path",
        path: "/root",
        entryType,
    });
    export const makeDummyPath = (entryType?: string): PathType =>
    ({
        type: "path",
        path: "/dummy",
        entryType,
    });
    export const isAbsolutePath = (path: PathType) => path.path.startsWith("/");
    export const loopReplace = (text: string, match: RegExp, replace: string) =>
    {
        let result = text;
        while(true)
        {
            const previous = result;
            result = result.replace(match, replace);
            if (previous == result)
            {
                break;
            }
        }
        return result;
    }
    export const regulatePath = (path: PathType): PathType =>
    ({
        type: "path",
        path: loopReplace(loopReplace(path.path, /\/[^\/\.]+\/\.\.\//gm, "/"), /\/\.?\//gm, "/"),
        entryType: path.entryType,
    });
    export const solvePath = (currentPath: PathType, targetPath: PathType): PathType =>
        isAbsolutePath(targetPath) ?
            targetPath:
            regulatePath
            ({
                type: "path",
                path: `${currentPath.path}/${targetPath.path}`,
                entryType: targetPath.entryType,
            });
    export const getPathLeaf = (path: PathType) => path.path.split("/").pop();
    let uniqueKeySource = 0;
    export const makeUniqueKey = () => `unique:${uniqueKeySource++}`;
    export type EventType = "onclick";
    export interface EntryData extends minamo.core.JsonableObject
    {
        isVolatile?: boolean;
        onclick?: ViewCommand.EntryOrList;
    }
    export interface StrictEntry extends minamo.core.JsonableObject
    {
        type: string;
        data?: EntryData;
        children?: StrictListEntry[] | { [key: string]: StrictEntry };
    }
    export interface EntryBase extends minamo.core.JsonableObject
    {
        type: string;
        data?: EntryData;
        child?: Entry;
        children?: ListEntry[] | { [key: string]: Entry };
    }
    export const setEventHandler = <Entry extends StrictEntry, CommandBase extends ViewCommand.EntryBase>(entry: Entry, event: EventType, command: ViewCommand.Entry<CommandBase>): Entry =>
    {
        if ( ! entry.data)
        {
            entry.data = { };
        }
        entry.data[event] = command;
        return entry;
    };
    export const addEventHandler = <Entry extends StrictEntry, CommandBase extends ViewCommand.EntryBase>(entry: Entry, event: EventType, command: ViewCommand.Entry<CommandBase>): Entry =>
    {
        if ( ! entry.data)
        {
            entry.data = { };
        }
        const current = entry.data[event];
        if ( ! current)
        {
            entry.data[event] = command;
        }
        else
        if ( ! Array.isArray(current))
        {
            entry.data[event] = [ current, command, ];
        }
        else
        {
            entry.data[event] = current.concat(command);
        }
        return entry;
    };
    export type Entry = EntryBase | string;
    export const isEntry = <Model extends (StrictEntry | EntryBase)>(type: Model["type"]) =>
        (model: StrictEntry | EntryBase | null): model is Model => type === model?.type;
    export type EntryOrType<Model extends EntryBase> =
        undefined extends Model["data"] ?
            undefined extends Model["children"] ?
                Model | Model["type"]:
                Model:
            Model;
    export const getType = (data: Entry) => "string" === typeof data ? data: data.type;
    export interface StrictListEntryBase extends StrictEntry
    {
        key: string;
    }
    export type StrictListEntry = StrictListEntryBase | NullEntry;
    export interface ListEntryBase extends EntryBase
    {
        key: string;
    }
    export type ListEntry = ListEntryBase | EntryOrType<NullEntry>;
    export const isListEntryBase = (data: Entry): data is ListEntryBase => "" !== ((data as ListEntryBase).key ?? "");
    export const isListEntry = (data: Entry): data is ListEntry => isNullEntry(data) || isListEntryBase(data);
    export interface NullEntry extends EntryBase
    {
        type: "tektite-null";
        key?: never;
        data?: never;
        children?: never;
    }
    export const isNullEntryBase = (data: EntryBase): data is NullEntry => "tektite-null" === data.type;
    export const isNullEntry = (data: Entry): data is EntryOrType<NullEntry> => "tektite-null" === getType(data);
    export type ChildrenUpdatorType<Model extends EntryBase> = (ViewCommand.EntryBase & { result: Model["children"] })["params"];
    export interface IconEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-icon";
        data: EntryData &
        {
            icon: T["IconKeyType"];
        };
    }
    export interface DivEntry extends EntryBase
    {
        type: "tektite-div";
        data?: EntryData &
        {
            className?: string;
        };
    }
    export interface TextSpanEntry extends EntryBase
    {
        type: "tektite-span";
        data: EntryData &
        {
            className?: string;
            text: string;
        };
        child?: never;
        children?: never;
    }
    export interface ElementSpanEntry extends EntryBase
    {
        type: "tektite-span";
        data?: EntryData &
        {
            className?: string;
            text?: never;
        };
    }
    export type SpanEntry = TextSpanEntry | ElementSpanEntry;
    export interface LinkEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-link";
        data: EntryData &
        {
            className?: string;
            href: Tektite.HrefType<T>;
        };
    }
    export interface RootEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-root";
        data?: EntryData &
        {
            title?: string;
            theme?: "auto" | "light" | "dark";
            windowColor?: string;
            progressBarStyle?: Tektite.ProgressBarStyleType;
            className?: string;
        };
        children:
        {
            "screen": ScreenEntry<T>,
        };
    }
    export interface ScreenEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-screen";
        children:
        {
            "screen-header": EntryOrType<ScreenHeaderEntry<T>>,
            "screen-body": EntryOrType<ScreenBodyEntry>,
            "screen-bar": EntryOrType<ScreenBarEntry>,
            "screen-toast": EntryOrType<ScreenToastEntry>,
        };
    }
    export interface ScreenHeaderEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-screen-header";
        children:
        {
            "screen-header-progress-bar": EntryOrType<ScreenHeaderProgressBarEntry>,
            "screen-header-segment": EntryOrType<ScreenHeaderSegmentListEntry<T>>,
            "screen-header-operator": EntryOrType<ScreenHeaderOperatorEntry>,
        };
    }
    export interface ScreenHeaderProgressBarEntry extends EntryBase
    {
        type: "tektite-screen-header-progress-bar";
        data?: EntryData &
        {
            color?: string;
            percent: null | number;
        };
    }
    export interface ScreenHeaderSegmentListEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-screen-header-segment-list";
        children: [ ScreenHeaderSegmentEntry<T>, ...ScreenHeaderSegmentEntry<T>[]];
    }
    export type ScreenHeaderSegmentEntry<T extends Tektite.ParamTypes> = ScreenHeaderLabelSegmentEntry<T> | ScreenHeaderLinkSegmentEntry<T> | ScreenHeaderPopupSegmentEntry<T>;
    export interface ScreenHeaderSegmentCoreEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-screen-header-segment-core";
        data: EntryData &
        {
            icon: T["IconKeyType"];
            title: string;
        };
    }
    export interface ScreenHeaderLabelSegmentEntry<T extends Tektite.ParamTypes> extends ListEntryBase
    {
        type: "tektite-screen-header-label-segment";
        data?: EntryData &
        {
            className?: string;
        }
        child: ScreenHeaderSegmentCoreEntry<T>;
    }
    export interface ScreenHeaderLinkSegmentEntry<T extends Tektite.ParamTypes> extends ListEntryBase
    {
        type: "tektite-screen-header-link-segment";
        data: EntryData &
        {
            className?: string;
            href: Tektite.HrefType<T>;
        }
        child: ScreenHeaderSegmentCoreEntry<T>;
    }
    export interface ScreenHeaderPopupSegmentEntry<T extends Tektite.ParamTypes> extends ListEntryBase
    {
        type: "tektite-screen-header-popup-segment";
        child: ScreenHeaderSegmentCoreEntry<T>;
    }
    export interface ScreenHeaderOperatorEntry extends EntryBase
    {
        type: "tektite-screen-header-operator";
        children:
        {
        };
    }
    export interface ScreenBodyEntry extends EntryBase
    {
        type: "tektite-screen-body";
        data?: EntryData &
        {
            className?: string;
        };
        children: ListEntry[];
    }
    export interface PrimaryPageEntry extends EntryBase
    {
        type: "tektite-primary-page";
        children:
        {
            "body": PrimaryPageBodyEntry,
            "footer"?: PrimaryPageFooterEntry,
        };
    }
    export interface PrimaryPageBodyEntry extends EntryBase
    {
        type: "tektite-primary-page-body";
    }
    export interface PrimaryPageFooterEntry extends EntryBase
    {
        type: "tektite-primary-page-footer";
    }
    export interface PrimaryPageFooterDownPageLinkEntry extends EntryBase
    {
        type: "tektite-primary-page-footer-down-page-link";
        data?: EntryData &
        {
            isStrictShowPrimaryPage: boolean;
            onclick: ViewCommand.ScrollToCommand["params"];
        }
    }
    export interface TrailPageEntry extends EntryBase
    {
        type: "tektite-trail-page";
    }
    export interface ScreenBarEntry extends EntryBase
    {
        type: "tektite-screen-bar";
    }
    export interface ScreenToastEntry extends EntryBase
    {
        type: "tektite-screen-toast";
        children?: ToastItemEntry[];
    }
    export type ToastStateType = "slide-in" | "show" | "slow-slide-out" | "slide-out";
    export interface ToastItemEntry extends ListEntryBase
    {
        type: "tektite-toast-item";
        data: EntryData &
        {
            state: ToastStateType,
            wait?: number,
        };
        children:
        {
            content: EntryOrType<EntryBase>,
            backwardOperator?: EntryOrType<EntryBase>,
            forwardOperator?: EntryOrType<EntryBase>,
        }
    }
    export interface VerticalButtonListEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-vertical-button-list";
        children: ((ButtonEntry | LinkButtonEntry<T>) & ListEntry)[] | { [key: string]: (ButtonEntry | LinkButtonEntry<T>) };
    };
    export interface ButtonEntry extends EntryBase
    {
        type: "tektite-button";
        data: EntryData &
        {
            className?: string;
            // onclick?: (event: MouseEvent) => unknown;
        };
    }
    export interface LinkButtonEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-link-button";
        data: EntryData &
        {
            className?: string;
            href: Tektite.HrefType<T>;
        };
        child: ButtonEntry;
    }
    export type PopupStateType = "fade-in" | "show" | "fade-out" | "hide";
    export type MenuButtonItemsType<T extends Tektite.ParamTypes> = ((MenuItemButtonEntry | MenuItemLinkButtonEntry<T>) & ListEntry | NullEntry)[] | { [key: string]: (MenuItemButtonEntry | MenuItemLinkButtonEntry<T> | EntryOrType<NullEntry>) };
    export interface MenuButtonEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-menu-button";
        data?: EntryData &
        {
            state?: PopupStateType;
            getMenu?: ChildrenUpdatorType<MenuButtonEntry<T>>;
        };
        // children: ((MenuItemButtonEntry | MenuItemLinkButtonEntry<T>) & ListEntry | NullEntry)[] | { [key: string]: (MenuItemButtonEntry | MenuItemLinkButtonEntry<T> | EntryOrType<NullEntry>) };
    }
    export interface MenuItemButtonEntry extends EntryBase
    {
        type: "tektite-menu-item-button";
        data?: EntryData &
        {
            className?: string;
        };
    }
    export interface MenuItemLinkButtonEntry<T extends Tektite.ParamTypes> extends EntryBase
    {
        type: "tektite-menu-item-link-button";
        data: EntryData &
        {
            className?: string;
            href: Tektite.HrefType<T>;
        };
    }
    export interface LabelSpanEntry extends EntryBase
    {
        type: "tektite-label-span";
        data: EntryData &
        {
            text: string;
        };
        children: typeof LabelSpanEntryChildren,
    }
    export const LabelSpanEntryChildren =
    {
        "locale-parallel":
        {
            type: "tektite-span",
            data:
            {
                className: "locale-parallel",
            },
        },
        "locale-map":
        {
            type: "tektite-span",
            data:
            {
                className: "locale-map",
            },
        },
    };
    export const getChildrenKeys = (data: StrictEntry): number[] | string[] =>
        ! data?.children ? []:
            Array.isArray(data.children) ?
                data.children.map((_, ix) => ix):
                minamo.core.objectKeys(data.children);
    export const getChildrenModelKeys = (data: StrictEntry | null): string[] =>
    {
        const children = data?.children;
        return ! children ? []:
            Array.isArray(children) ?
                (<ListEntryBase[]>children.filter(i => ! isNullEntry(i))).map(i => i.key):
                minamo.core.objectKeys(children).filter(i => ! isNullEntry(children[i]));
    };
    export const getChildFromModelKey = (data: StrictEntry | null, key: string): StrictEntry | null =>
        Array.isArray(data?.children) ?
            (data?.children?.filter(i => key === i.key)?.[0] ?? null):
            (data?.children?.[key] ?? null);
    export const getChildrenValues = (data: StrictEntry): StrictEntry[] =>
        ! data?.children ? []:
        Array.isArray(data.children) ?
            data.children:
            minamo.core.objectToArray(data.children, (_k, v, _o) => v);
    export const hasInvalidViewModel = (data: StrictEntry): boolean =>
        "" === (data?.type ?? "") ||
        0 < getChildrenModelKeys(data).filter
            (
                key =>
                    "" === (key ?? "") ||
                    ( ! Array.isArray(data.children) && (isNullEntry(data.children?.[key] as StrictEntry) || "" !== ((data.children?.[key] as ListEntryBase)?.key ?? ""))) ||
                    hasInvalidViewModel(getChildFromModelKey(data, key) as StrictEntry)
            ).length;
    export const hasDuplicatedKeys = (data: StrictEntry): boolean =>
        0 < getChildrenModelKeys(data).filter((i, ix, list) => 0 <= list.indexOf(i, ix +1)).length ||
        0 < getChildrenValues(data).filter(i => hasDuplicatedKeys(i)).length;
    export const isValidPath = (path: PathType) =>
        isPathType(path) &&
        ("/root" === path.path || path.path.startsWith("/root/"));
    export const hasError = (path: PathType, data: StrictEntry | null | undefined) =>
    {
        if (undefined === data)
        {
            console.error(`tektite-view-model: undefined data - path:${path.path}`);
            return true;
        }
        else
        if (null === data)
        {
            console.error(`tektite-view-model: null data - path:${path.path}`);
            return true;
        }
        else
        if (hasInvalidViewModel(data))
        {
            console.error(`tektite-view-model: Invalid view model - path:${path.path}, data:${JSON.stringify(data)}`);
            return true;
        }
        else
        if (hasDuplicatedKeys(data))
        {
            console.error(`tektite-view-model: Duplicated keys - path:${path.path}, data:${JSON.stringify(data)}`);
            return true;
        }
        else
        if (hasErrorPath(path))
        {
            // console.error(`tektite-view-model: Invalid path - path:${path.path}`);
            return true;
        }
        // else
        // if ("/root" === path.path && "root" !== data.key)
        // {
        //     console.error(`tektite-view-model: root mode key must be "root" - data.key:${JSON.stringify(data.key)}`);
        //     return true;
        // }
        else
        {
            return false;
        }
    };
    export const hasErrorPath = (path: PathType) =>
    {
        if ( ! isValidPath(path))
        {
            console.error(`tektite-view-model: Invalid path - path:${path.path}`);
            return true;
        }
        else
        {
            return false;
        }
    };
    // export class ViewModel<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    export class ViewModel<T extends Tektite.ParamTypes>
    {
        private data: StrictEntry | null = null;
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        public onLoad = () =>
        {
        };
        public makeSureStrictEntry(path: PathType, entry: Entry): StrictEntry;
        public makeSureStrictEntry(path: PathType, entry: null): null;
        public makeSureStrictEntry(path: PathType, entry: Entry | null): StrictEntry | null;
        public makeSureStrictEntry(path: PathType, entry: Entry | null): StrictEntry | null
        {
            if ("string" === typeof entry)
            {
                return this.makeSureStrictEntry(path, { type: entry, });
            }
            else
            {
                if (entry)
                {
                    const renderer = this.tektite.viewRenderer.getAny(entry.type) as ViewRenderer.DomEntryBeta<any>;
                    entry = (renderer?.completer?.(this.tektite, path, entry) ?? entry) as StrictEntry;
                    const children = entry.children;
                    if (children)
                    {
                        if ("string" === typeof children)
                        {
                            entry.children = { single: this.makeSureStrictEntry(makePath(path, "single"), children as Entry), };
                        }
                        else
                        if (Array.isArray(children))
                        {
                            (<ListEntryBase[]>children.filter(i => ! isNullEntry(i))).forEach(i => this.makeSureStrictEntry(makePath(path, i.key), i));
                        }
                        else
                        {
                            minamo.core.objectKeys(children)
                                .forEach(key => children[key] = this.makeSureStrictEntry(makePath(path, key), children[key]));
                        }
                        if (entry.child)
                        {
                            console.error(`tektite-view-model: Duplicated child and children - path:${path.path}, data:${JSON.stringify(entry)}`);
                        }
                    }
                    else
                    {
                        const child = entry.child;
                        if (child)
                        {
                            entry.children =
                            {
                                single: this.makeSureStrictEntry(makePath(path, "single"), child),
                            }
                            delete entry.child;
                        }
                    }
                }
                return entry as StrictEntry | null;
            }
        }
        public set<OmegaEntry extends Entry>(dataOrType: OmegaEntry): void;
        public set<OmegaEntry extends Entry>(path: PathType, dataOrType: OmegaEntry): void;
        public set<OmegaEntry extends Entry>(pathOrdata: PathType | OmegaEntry, dataOrType?: OmegaEntry): void
        {
            if (isPathType(pathOrdata) && undefined !== dataOrType)
            {
                const path = pathOrdata;
                const data = minamo.core.simpleDeepCopy(this.makeSureStrictEntry(path, dataOrType));
                if (( ! hasError(path, data)) && data)
                {
                    const keys = path.path.split("/");
                    if ("" !== keys[0] || "root" !== keys[1])
                    {
                        console.error(`tektite-view-model: Invalid path - path:${path.path}`);
                    }
                    else
                    {
                        keys.shift();
                        keys.shift();
                        let current: StrictEntry | null;
                        if (0 < keys.length)
                        {
                            current = this.data as StrictEntry;
                            while(1 < keys.length)
                            {
                                current = getChildFromModelKey(current, keys[0]);
                                if ( ! current)
                                {
                                    console.error(`tektite-view-model: Path not found - path:${path.path}, part:${keys[0]}`);
                                    break;
                                }
                                keys.shift();
                            }
                            if (current)
                            {
                                if ( ! current.children)
                                {
                                    current.children = isListEntry(data) ? [ ]: { };
                                }
                                if (Array.isArray(current.children))
                                {
                                    if (isNullEntryBase(data))
                                    {
                                        const ix = current.children.findIndex(i => i.key === keys[0]);
                                        if (0 <= ix)
                                        {
                                            current.children[ix] = data;
                                        }
                                        else
                                        {
                                            current.children.push(data);
                                        }
                                    }
                                    else
                                    if (isListEntryBase(data))
                                    {
                                        if (data.key !== keys[0])
                                        {
                                            console.error(`tektite-view-model: Unmatch path and key - path:${path.path}, data:${JSON.stringify(data)}`);
                                        }
                                        else
                                        {
                                            const ix = current.children.findIndex(i => i.key === keys[0]);
                                            if (0 <= ix)
                                            {
                                                current.children[ix] = data;
                                            }
                                            else
                                            {
                                                current.children.push(data);
                                            }
                                        }
                                    }
                                    else
                                    {
                                        console.error(`tektite-view-model: Entry and ListEntry are mixed - path:${path.path}, data:${JSON.stringify(data)}`);
                                    }
                                }
                                else
                                if ( ! isListEntry(data))
                                {
                                    current.children[keys[0]] = data;
                                }
                                else
                                {
                                    console.error(`tektite-view-model: Entry and ListEntry are mixed - path:${path.path}, data:${JSON.stringify(data)}`);
                                }
                            }
                        }
                        else
                        {
                            this.data = data;
                        }
                    }
                }
            }
            else
            {
                const path = makeRootPath();
                const data = minamo.core.simpleDeepCopy(this.makeSureStrictEntry(path, pathOrdata));
                if ( ! hasError(path, data))
                {
                    this.data = data;
                }
            }
        }
        public setListEntry<Model extends Entry>(path: PathType, data: Model): { path: PathType, model: Model & ListEntry };
        public setListEntry<Model extends Entry>(path: PathType, key: string, data: Model): { path: PathType, model: Model & ListEntry };
        public setListEntry<Model extends Entry>(path: PathType, keyOrdata: Model | string, dataOrNothing?: Model): { path: PathType, model: Model & ListEntry }
        {
            if (dataOrNothing)
            {
                if ("string" === typeof keyOrdata)
                {
                    const key = keyOrdata;
                    const data = dataOrNothing as Model & ListEntry;
                    if ( ! isNullEntry(data))
                    {
                        data.key = key;
                    }
                    const result = { path: makePath(path, key), model: data, };
                    this.set(result.path, result.model);
                    return result;
                }
                else
                {
                    console.error(`tektite-view-model: Mismatch setListEntry() arguments - path:${path.path}, keyOrdata:${JSON.stringify(keyOrdata)}, dataOrNothing:${JSON.stringify(dataOrNothing)}`);
                    return null as unknown as { path: PathType, model: Model & ListEntry }; // ここに到達することは基本的にあり得ないので null を { path: PathType, model: Model & ListEntry } として返してしまう。
                }
            }
            else
            {
                const key = makeUniqueKey();
                const data = keyOrdata as Model;
                return this.setListEntry(path, key, data);
            }
        }
        public setEventHandler = <CommandBase extends ViewCommand.EntryBase>(path: PathType, event: EventType, command: ViewCommand.Entry<CommandBase>) =>
        {
            const entry = this.getUnknown(path);
            if (entry)
            {
                setEventHandler(entry, event, command);
            }
        }
        public addEventHandler = <CommandBase extends ViewCommand.EntryBase>(path: PathType, event: EventType, command: ViewCommand.Entry<CommandBase>) =>
        {
            const entry = this.getUnknown(path);
            if (entry)
            {
                addEventHandler(entry, event, command);
            }
        }
        public remove = (path: PathType) =>
        {
            if ( ! hasErrorPath(path))
            {
                const keys = path.path.split("/");
                if ("" !== keys[0] || "root" !== keys[1])
                {
                    console.error(`tektite-view-model: Invalid path - path:${path.path}`);
                }
                else
                {
                    keys.shift();
                    keys.shift();
                    let current: StrictEntry | null;
                    if (1 < keys.length)
                    {
                        current = this.data as StrictEntry;
                        while(1 < keys.length)
                        {
                            current = getChildFromModelKey(current, keys[0]);
                            if ( ! current)
                            {
                                console.error(`tektite-view-model: Path not found - path:${path.path}`);
                                break;
                            }
                            keys.shift();
                        }
                        if (current && current.children)
                        {
                            if (Array.isArray(current.children))
                            {
                                const ix = current.children.findIndex(i => i.key === keys[0]);
                                if (0 <= ix)
                                {
                                    current.children.splice(ix, 1);
                                }
                            }
                            else
                            {
                                delete current.children[keys[0]];
                            }
                        }
                    }
                    else
                    if (0 < keys.length)
                    {
                        this.data = null;
                    }
                    else
                    {
                        console.error(`tektite-view-model: Path not found - path:${path.path}`);
                    }
                }
            }
        };
        public exists = (path: PathType): boolean =>
        {
            let current: StrictEntry | null = null;
            const keys = path.path.split("/");//.filter(i => 0 < i.length);
            if ("" !== keys[0] || ! isValidPath(path))
            {
                console.error(`tektite-view-model: Invalid path - path:${path.path}`);
            }
            else
            {
                keys.shift();
                current = { type: "ground", children: { root: this.data } } as StrictEntry;
                while(0 < keys.length)
                {
                    current = getChildFromModelKey(current, keys[0]);
                    if ( ! current)
                    {
                        // console.error(`tektite-view-model: Path not found - path:${path.path}`);
                        break;
                    }
                    keys.shift();
                }
            }
            return current?.type === (path.entryType ?? current?.type);
        };
        private getRaw = (path: PathType | null = null, isOrNull: boolean): StrictEntry | null =>
        {
            if ( ! path)
            {
                return this.data;
            }
            else
            {
                let current: StrictEntry | null = null;
                const keys = path.path.split("/");//.filter(i => 0 < i.length);
                if ("" !== keys[0] || ! isValidPath(path))
                {
                    console.error(`tektite-view-model: Invalid path - path:${path.path}`);
                }
                else
                {
                    keys.shift();
                    current = { type: "ground", children: { root: this.data } } as StrictEntry;
                    while(0 < keys.length)
                    {
                        current = getChildFromModelKey(current, keys[0]);
                        if ( ! current)
                        {
                            if (isOrNull)
                            {
                                console.error(`tektite-view-model: Path not found - path:${path.path}`);
                            }
                            break;
                        }
                        keys.shift();
                    }
                }
                return minamo.core.simpleDeepCopy(current?.type === (path.entryType ?? current?.type) ? current: null);
            }
        };
        public getUnknown = (path: PathType | null = null): StrictEntry | null => this.getRaw(path, false);
        public get<Model extends EntryBase>(path: PathType & { entryType: Model["type"] }): Model & StrictEntry | null;
        public get<Model extends EntryBase>(path: PathType, type: Model["type"]): Model & StrictEntry | null;
        public get<Model extends EntryBase>(path: PathType, type?: Model["type"]): Model & StrictEntry | null
        {
            const model = this.getUnknown(path);
            if (model)
            {
                if (isEntry(<Model["type"]>(type ?? path.entryType))(model))
                {
                    return model;
                }
                else
                {
                    console.error(`tektite-view-model: Unmatch type - path:${path.path}, entryType:${path.entryType}, model:${JSON.stringify(model)}`);
                }
            }
            return null;
        }
        public setData<Model extends EntryBase, DataType = minamo.core.JsonablePartial<Model["data"]>>(path: PathType & { entryType: Model["type"] }, data: DataType): Model & StrictEntry | null;
        public setData<Model extends EntryBase, DataType = minamo.core.JsonablePartial<Model["data"]>>(path: PathType, type: Model["type"], data: DataType): Model & StrictEntry | null;
        public setData<Model extends EntryBase, DataType = minamo.core.JsonablePartial<Model["data"]>>(path: PathType & { entryType: Model["type"] }): (data: DataType) => Model & StrictEntry | null;
        public setData<Model extends EntryBase, DataType = minamo.core.JsonablePartial<Model["data"]>>(path: PathType, type: Model["type"]): (data: DataType) => Model & StrictEntry | null;
        public setData<Model extends EntryBase, DataType extends minamo.core.JsonablePartial<Model["data"]>>(path: PathType, typeOrData?: Model["type"] | DataType, dataOrNothing?: DataType): Model & StrictEntry | null | ((data: DataType) => Model & StrictEntry | null)
        {
            const type = "string" === typeof typeOrData ? typeOrData: path.entryType as string;
            const data: DataType = ("string" !== typeof typeOrData ? typeOrData: dataOrNothing) as DataType;
            if (undefined !== data)
            {
                const model = this.getUnknown(path);
                if (model)
                {
                    if (isEntry(<Model["type"]>(type))(model))
                    {
                        if (data)
                        {
                            model.data ??= { };
                            const modelData = model.data;
                            minamo.core.objectKeys(data).forEach
                            (
                                key =>
                                {
                                    const value = data[key];
                                    if (undefined === value)
                                    {
                                        delete modelData[key];
                                    }
                                    else
                                    {
                                        modelData[key] = value;
                                    }
                                }
                            );
                        }
                        else
                        {
                            delete model.data;
                        }
                        this.set(path, model);
                        return model;
                    }
                    else
                    {
                        console.error(`tektite-view-model: Unmatch type - path:${path.path}, entryType:${path.entryType}, model:${JSON.stringify(model)}`);
                    }
                }
                return null;
            }
            else
            {
                return data => this.setData(path, type, data);
            }
        }
        public getUnknownOrNull = (path: PathType | null = null): StrictEntry | null => this.getRaw(path, true);
        public getOrNull<Model extends EntryBase>(path: PathType & { entryType: Model["type"] }): Model & StrictEntry | null;
        public getOrNull<Model extends EntryBase>(path: PathType, type: Model["type"]): Model & StrictEntry | null;
        public getOrNull<Model extends EntryBase>(path: PathType, type?: Model["type"]): Model & StrictEntry | null
        {
            const model = this.getUnknownOrNull(path);
            if (model)
            {
                if (isEntry(<Model["type"]>(type ?? path.entryType))(model))
                {
                    return model;
                }
                else
                {
                    console.error(`tektite-view-model: Unmatch type - path:${path.path}, entryType:${path.entryType}, model:${JSON.stringify(model)}`);
                }
            }
            return null;
        }
        public make = <Model extends EntryBase>(type: Model["type"], defaltParams?: { data?: Model["data"], child?:never, children?: Model["children"], } | { data?: Model["data"], child?: Model["child"], children?:never, }):
            ((data?: Model["data"], childOrchildren?: Model["child"] | (Model["children"])) => Model & { key: never; }) &
            ((key: string, data?: Model["data"], childOrchildren?: Model["child"] | Model["children"]) => Model & ListEntryBase) =>
        (keyOrData?: string | Model["data"], dataOrChildOrChildren?: Model["data"] | Model["child"] | Model["children"], childOrChildrenOrUndefined?: Model["child"] | Model["children"]): (Model & { key: never; }) & (Model & ListEntryBase) =>
        {
            const getChildren = (childOrchildren: any) => "string" === typeof (childOrchildren?.type) ?
                { single: childOrchildren }:
                <Model["children"]>childOrchildren ??
                (
                    defaltParams?.child ?
                        { single: defaltParams.child }:
                        defaltParams?.children
                );
            if ("string" === typeof keyOrData)
            {
                const key = <string>keyOrData;
                const data = <Model["data"]>dataOrChildOrChildren ?? defaltParams?.data;
                const children = getChildren(childOrChildrenOrUndefined);
                const result =
                {
                    type,
                    key,
                    data,
                    children,
                };
                return result as Model & { key: never; } & ListEntryBase;
            }
            else
            {
                const data = <Model["data"]>keyOrData ?? defaltParams?.data;
                const children = getChildren(dataOrChildOrChildren);
                const result =
                {
                    type,
                    data,
                    children,
                };
                return result as Model & { key: never; } & ListEntryBase;
            }
        };
        public makeWithoutData = <Model extends EntryBase>(type: Model["type"], defaltParams?: { data?: Model["data"], child?:never, children?: Model["children"], } | { data?: Model["data"], child?: Model["child"], children?:never, }):
            ((childOrchildren?: Model["child"] | (Model["children"])) => Model) &
            ((key: string, childOrchildren?: Model["child"] | Model["children"]) => Model & ListEntryBase) =>
        (keyOrChildOrChildren?: string | Model["data"] | Model["child"] | Model["children"], childOrChildrenOrUndefined?: Model["child"] | Model["children"]): Model & (Model & ListEntryBase) =>
        {
            const getChildren = (childOrchildren: any) => "string" === typeof (childOrchildren?.type) ?
                { single: childOrchildren }:
                <Model["children"]>childOrchildren ??
                (
                    defaltParams?.child ?
                    { single: defaltParams.child }:
                    defaltParams?.children
                );
            if ("string" === typeof keyOrChildOrChildren)
            {
                const key = <string>keyOrChildOrChildren;
                const children = getChildren(childOrChildrenOrUndefined);
                const result =
                {
                    type,
                    key,
                    children,
                };
                return result as Model & ListEntryBase;
            }
            else
            {
                const children = getChildren(keyOrChildOrChildren);
                const result =
                {
                    type,
                    children,
                };
                return result as Model & ListEntryBase;
            }
        };
        public makeIcon = this.make<IconEntry<T>>("tektite-icon");
        public makeDiv = this.make<DivEntry>("tektite-div");
        public makeTextSpan = this.make<TextSpanEntry>("tektite-span");
        public makeElementSpan = this.make<ElementSpanEntry>("tektite-span");
        public makeLabelSpan = this.make<LabelSpanEntry>("tektite-label-span", { children: LabelSpanEntryChildren });
        public makeButton = this.make<ButtonEntry>("tektite-button");
        public makeLink = this.make<LinkEntry<T>>("tektite-link");
        public makeRoot = this.make<RootEntry<T>>("tektite-root");
        public makeScreen = this.makeWithoutData<ScreenEntry<T>>("tektite-screen");
        public makeScreenHeader = this.makeWithoutData<ScreenHeaderEntry<T>>("tektite-screen-header");
        public maekScreenHeaderProgressBar = this.make<ScreenHeaderProgressBarEntry>("tektite-screen-header-progress-bar");
        public makeScreenHeaderSegmentList = this.makeWithoutData<ScreenHeaderSegmentListEntry<T>>("tektite-screen-header-segment-list");
        public makeScreenHeaderSegmentCore = this.make<ScreenHeaderSegmentCoreEntry<T>>("tektite-screen-header-segment-core");
        public makeScreenHeaderLabelSegment = this.make<ScreenHeaderLabelSegmentEntry<T>>("tektite-screen-header-label-segment");
        public makeScreenHeaderLinkSegment = this.make<ScreenHeaderLinkSegmentEntry<T>>("tektite-screen-header-link-segment");
        public makeScreenHeaderPopupSegment = this.makeWithoutData<ScreenHeaderPopupSegmentEntry<T>>("tektite-screen-header-popup-segment");
        public makeScreenHeaderOperator = this.makeWithoutData<ScreenHeaderOperatorEntry>("tektite-screen-header-operator");
        public makeScreenBody = this.make<ScreenBodyEntry>("tektite-screen-body");
        public makePrimaryPage = this.makeWithoutData<PrimaryPageEntry>("tektite-primary-page");
        public makePrimaryPageBody = this.makeWithoutData<PrimaryPageBodyEntry>("tektite-primary-page-body");
        public makePrimaryPageFooter = this.makeWithoutData<PrimaryPageFooterEntry>("tektite-primary-page-footer");
        public makePrimaryPageFooterDownPageLink = this.make<PrimaryPageFooterDownPageLinkEntry>("tektite-primary-page-footer-down-page-link");
        public makeTrailPage = this.makeWithoutData<TrailPageEntry>("tektite-trail-page");
        public makeScreenBar = this.makeWithoutData<ScreenBarEntry>("tektite-screen-bar");
        public makeScreenToast = this.makeWithoutData<ScreenToastEntry>("tektite-screen-toast");
        public makeToastItem = this.make<ToastItemEntry>("tektite-toast-item");
        // public makeMenuButton =
        //     <((data?: MenuButtonEntry<T>["data"], menuItems?: MenuButtonItemsType<T>) => MenuButtonEntry<T>) &
        //     ((key: string, data?: MenuButtonEntry<T>["data"], menuItems?: MenuButtonItemsType<T>) => MenuButtonEntry<T> & ListEntryBase)>
        //     (
        //         (keyOrData?: string | MenuButtonEntry<T>["data"], dataOrMenuItems?: MenuButtonEntry<T>["data"] | MenuButtonItemsType<T>, menuItemsOrUndefined?: MenuButtonItemsType<T>): MenuButtonEntry<T> & (MenuButtonEntry<T> & ListEntryBase) =>
        //         {
        //             const type: MenuButtonEntry<T>["type"] = "tektite-menu-button";
        //             const getChildren = (childOrchildren: any) =>
        //             {
        //                 const children = "string" === typeof (childOrchildren?.type) ?
        //                     { single: childOrchildren }:
        //                     <MenuButtonItemsType<T>>childOrchildren;
        //                 const result =
        //                 {
        //                     button: <ViewModel.ButtonEntry>
        //                     {
        //                         type: "tektite-button",
        //                         data:
        //                         {
        //                             className: "tektite-menu-button",
        //                             onclick: <ViewCommand.OnMenuButtonClickCommand["params"]>
        //                             {
        //                                 type: "tektite-on-menu-button-click",
        //                                 data: { path, },
        //                             },
        //                         },
        //                         children:
        //                         {
        //                             icon: this.makeIcon({ icon: "tektite-ellipsis-icon", }),
        //                         },
        //                     },
        //                     popup:
        //                     {
        //                         type: "tektite-div",
        //                         data:
        //                         {
        //                             className: "tektite-menu-popup",
        //                             onclick: <ViewCommand.SetDataCommand["params"]>
        //                             {
        //                                 type: "tektite-set-data",
        //                                 data:
        //                                 {
        //                                     path,
        //                                     key: "state",
        //                                     value: "fade-out",
        //                                 },
        //                                 children,
        //                             },
        //                         },
        //                     },
        //                     cover:
        //                     {
        //                         type: "tektite-div",
        //                         data:
        //                         {
        //                             className: "tektite-screen-cover tektite-hide",
        //                             onclick: <ViewCommand.SetDataCommand["params"]>
        //                             {
        //                                 type: "tektite-set-data",
        //                                 data:
        //                                 {
        //                                     path,
        //                                     key: "state",
        //                                     value: "fade-out",
        //                                 }
        //                             },
        //                         },
        //                     },
        //                 };
        //                 return result;
        //             };
        //             if ("string" === typeof keyOrData)
        //             {
        //                 const key = <string>keyOrData;
        //                 const data = <MenuButtonEntry<T>["data"]>dataOrMenuItems;
        //                 const children = getChildren(menuItemsOrUndefined);
        //                 const result =
        //                 {
        //                     type,
        //                     key,
        //                     data,
        //                     children,
        //                 };
        //                 return result as MenuButtonEntry<T> & ListEntryBase;
        //             }
        //             else
        //             {
        //                 const data = <MenuButtonEntry<T>["data"]>keyOrData;
        //                 const children = getChildren(dataOrMenuItems);
        //                 const result =
        //                 {
        //                     type,
        //                     data,
        //                     children,
        //                 };
        //                 return result as unknown as MenuButtonEntry<T> & ListEntryBase;
        //             }
        //         }
        //     );
    }
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewModel(tektite);
}
