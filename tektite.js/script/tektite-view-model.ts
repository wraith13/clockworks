import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
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
    export const getPathLeaf = (path: PathType) => path.path.split("/").pop();
    let uniqueKeySource = 0;
    export const makeUniqueKey = () => `unique:${uniqueKeySource++}`;
    export interface StrictEntry
    {
        type: string;
        data?: unknown;
        children?: StrictListEntry[] | { [key: string]: StrictEntry };
    }
    export interface EntryBase
    {
        type: string;
        data?: unknown;
        child?: Entry;
        children?: ListEntry[] | { [key: string]: Entry };
    }
    export type Entry = EntryBase | string;
    export function makeSureStrictEntry(path: PathType, entry: Entry): StrictEntry;
    export function makeSureStrictEntry(path: PathType, entry: null): null;
    export function makeSureStrictEntry(path: PathType, entry: undefined): undefined;
    export function makeSureStrictEntry(path: PathType, entry: Entry | null): StrictEntry | null;
    export function makeSureStrictEntry(path: PathType, entry: Entry | undefined): StrictEntry | undefined;
    export function makeSureStrictEntry(path: PathType, entry: Entry | null | undefined): StrictEntry | null | undefined;
    export function makeSureStrictEntry(path: PathType, entry: Entry | null | undefined): StrictEntry | null | undefined
    {
        if ("string" === typeof entry)
        {
            return { type: entry, };
        }
        else
        {
            if (entry)
            {
                const children = entry.children;
                if (children)
                {
                    if (Array.isArray(children))
                    {
                        children.forEach(i => makeSureStrictEntry(makePath(path, i.key), i));
                    }
                    else
                    {
                        minamo.core.objectKeys(children)
                            .forEach(key => children[key] = makeSureStrictEntry(makePath(path, key), children[key]));
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
                            single: makeSureStrictEntry(makePath(path, "single"), child),
                        }
                        delete entry.child;
                    }
                }
            }
            return entry as StrictEntry | null | undefined;
        }
    }
    export const isEntry = <Model extends (StrictEntry | EntryBase)>(type: Model["type"]) =>
        (model: StrictEntry | EntryBase | null): model is Model => type === model?.type;
    export interface StrictListEntry extends StrictEntry
    {
        key: string;
    }
    export interface ListEntry extends EntryBase
    {
        key: string;
    }
    export const isListEntry = (data: Entry): data is ListEntry => "" !== ((data as ListEntry).key ?? "")
    export type EntryOrType<Model extends EntryBase> = Model | Model["type"];
    export interface RootEntry extends EntryBase
    {
        type: "tektite-root";
        data?:
        {
            title?: string;
            theme?: "auto" | "light" | "dark";
            windowColor?: string;
            progressBarStyle?: Tektite.ProgressBarStyleType;
            className?: string;
        };
        children:
        {
            "screen": ScreenEntry,
        };
    }
    export interface ScreenEntry extends EntryBase
    {
        type: "tektite-screen";
        children:
        {
            "screen-header": EntryOrType<ScreenHeaderEntry>,
            "screen-body": EntryOrType<ScreenBodyEntry>,
            "screen-bar": EntryOrType<ScreenBarEntry>,
            "screen-toast": EntryOrType<ScreenToastEntry>,
        };
    }
    export interface ScreenHeaderEntry extends EntryBase
    {
        type: "tektite-screen-header";
        children:
        {
            "screen-header-progress-bar": EntryOrType<ScreenHeaderProgressBarEntry>,
            "screen-header-segment": EntryOrType<ScreenHeaderSegmentListEntry>,
            "screen-header-operator": EntryOrType<ScreenHeaderOperatorEntry>,
        };
    }
    export interface ScreenHeaderProgressBarEntry extends EntryBase
    {
        type: "tektite-screen-header-progress-bar";
        data?:
        {
            color?: string;
            percent: null | number;
        };
    }
    export interface ScreenHeaderSegmentListEntry extends EntryBase
    {
        type: "tektite-screen-header-segment-list";
        children: [ ScreenHeaderSegmentEntry, ...ScreenHeaderSegmentEntry[]];
    }
    export type ScreenHeaderSegmentEntry = ScreenHeaderLabelSegmentEntry | ScreenHeaderLinkSegmentEntry | ScreenHeaderPopupSegmentEntry;
    export interface ScreenHeaderSegmentCoreEntry extends EntryBase
    {
        type: "tektite-screen-header-segment-core";
        data:
        {
            icon: Tektite.ParamTypes<unknown>["IconKeyType"];
            title: string;
        };
    }
    export interface ScreenHeaderLabelSegmentEntry extends ListEntry
    {
        type: "tektite-screen-header-label-segment";
        data?:
        {
            className?: string;
        }
        child: ScreenHeaderSegmentCoreEntry;
    }
    export interface ScreenHeaderLinkSegmentEntry extends ListEntry
    {
        type: "tektite-screen-header-link-segment";
        child: ScreenHeaderSegmentCoreEntry;
    }
    export interface ScreenHeaderPopupSegmentEntry extends ListEntry
    {
        type: "tektite-screen-header-popup-segment";
        child: ScreenHeaderSegmentCoreEntry;
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
        data?:
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
        children: ToastItemEntry[];
    }
    export interface ToastItemEntry extends ListEntry
    {
        type: "tektite-toast-item";
        data:
        {
            content: minamo.dom.Source,
            backwardOperator?: minamo.dom.Source,
            forwardOperator?: minamo.dom.Source,
            isWideContent?: boolean,
            wait?: number,
        }
    }
    export interface VerticalButtonListEntry extends EntryBase
    {
        type: "tektite-vertical-button-list";
        children: ((ButtonEntry | LinkButtonEntry) & ListEntry)[] | { [key: string]: (ButtonEntry | LinkButtonEntry) };
    };
    export interface ButtonEntry extends EntryBase
    {
        type: "tektite-button";
        data:
        {
            className?: string;
            onclick?: (event: MouseEvent) => unknown;
        };
    }
    export interface LinkButtonEntry extends EntryBase
    {
        type: "tektite-link-button";
        data:
        {
            className?: string;
            href: string;
        };
        child: ButtonEntry;
    }
    export interface LabelSpanEntry extends EntryBase
    {
        type: "tektite-label-span";
        data:
        {
            text: string;
        };
    }
    export const getChildrenKeys = (data: StrictEntry): number[] | string[] =>
        ! data?.children ? []:
            Array.isArray(data.children) ?
                data.children.map((_, ix) => ix):
                minamo.core.objectKeys(data.children);
    export const getChildrenModelKeys = (data: StrictEntry | null): string[] =>
        ! data?.children ? []:
        Array.isArray(data.children) ?
            data.children.map(i => i.key):
            minamo.core.objectKeys(data.children);
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
                    ( ! Array.isArray(data.children) && "" !== ((data.children?.[key] as ListEntry)?.key ?? "")) ||
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
        public set(dataOrType: Entry): void;
        public set(path: PathType, dataOrType: Entry): void;
        public set(pathOrdata: PathType | Entry, dataOrType?: Entry): void
        {
            if (isPathType(pathOrdata))
            {
                const path = pathOrdata;
                const data = makeSureStrictEntry(path, dataOrType);
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
                        if (1 < keys.length)
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
                                    if (isListEntry(data))
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
                        if (0 < keys.length)
                        {
                            this.data = data;
                        }
                        else
                        {
                            console.error(`tektite-view-model: Path not found - path:${path.path}`);
                        }
                    }
                }
            }
            else
            {
                const path = makeRootPath();
                const data = makeSureStrictEntry(path, pathOrdata);
                if ( ! hasError(path, data))
                {
                    this.data = data;
                }
            }
        }
        public setListEntry(path: PathType, data: Entry): void;
        public setListEntry(path: PathType, key: string, data: Entry): void;
        public setListEntry(path: PathType, keyOrdata: Entry | string, dataOrNothing?: Entry): void
        {
            if (dataOrNothing)
            {
                if ("string" === typeof keyOrdata)
                {
                    const key = keyOrdata;
                    const data = dataOrNothing as ListEntry;
                    data.key = key;
                    this.set(makePath(path, key), data);
                }
                else
                {
                    console.error(`tektite-view-model: Mismatch setListEntry() arguments - path:${path.path}, keyOrdata:${JSON.stringify(keyOrdata)}, dataOrNothing:${JSON.stringify(dataOrNothing)}`);
                }
            }
            else
            {
                const key = makeUniqueKey();
                const data = keyOrdata as ListEntry;
                this.setListEntry(path, key, data);
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
        public get = (path: PathType | null = null) =>
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
                            console.error(`tektite-view-model: Path not found - path:${path.path}`);
                            break;
                        }
                        keys.shift();
                    }
                }
                return current?.type === (path.entryType ?? current?.type) ? current: null;
            }
        };
        public getWithType = <Model extends EntryBase>(path: PathType & { entryType: Model["type"] }): Model | null =>
        {
            const model = this.get(path);
            if (isEntry(<Model["type"]>(path.entryType))(model))
            {
                return model;
            }
            return null;
        }
    }
    // export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
    //     new ViewModel(tektite);
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewModel(tektite);
}
