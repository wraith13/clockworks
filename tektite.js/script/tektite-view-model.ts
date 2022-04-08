import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
export module ViewModel
{
    export type PathType = { type: "path", path: string, };
    export const isPathType = (data: unknown): data is PathType =>
        "path" === (<PathType>data)?.type &&
        "string" === typeof (<PathType>data)?.path;
    export const makePath = (parent: "/" | PathType, key: string): PathType =>
    ({
        type: "path",
        path: `${"/" === parent ? "": parent.path}/${key}`,
    });
    export const makeRootPath = (): PathType =>
    ({
        type: "path",
        path: "/root",
    });
    export const getLeafKey = (path: PathType) => path.path.split("/").pop();
    export interface Entry
    {
        type: string;
        data?: unknown;
        children?: ListEntry[] | { [key: string]: Entry };
    }
    export interface ListEntry extends Entry
    {
        key: string;
    }
    export const isListEntry = (data: Entry): data is ListEntry => "" !== ((data as ListEntry).key ?? "")
    export interface RootEntry extends Entry
    {
        type: "tektite-root";
        data:
        {
            title?: string;
            windowColor?: string;
        };
        children:
        {
            "screen-header": ScreenHeaderEntry,
            "screen-body": ScreenBodyEntry,
            "screen-bar": ScreenBarEntry,
            "screen-toast": ScreenToastEntry,
        };
    }
    export interface ScreenHeaderEntry extends Entry
    {
        type: "tektite-screen-header";
        children:
        {
            "screen-header-progress-bar": ScreenHeaderProgressBarEntry,
            "screen-header-segment": ScreenHeaderSegmentListEntry,
            "screen-header-operator": ScreenHeaderOperatorEntry,
        };
    }
    export interface ScreenHeaderProgressBarEntry extends Entry
    {
        type: "tektite-screen-header-progress-bar";
        key: "progress-bar";
        data:
        {
            color?: string;
            percent: null | number;
        };
    }
    export interface ScreenHeaderSegmentListEntry extends Entry
    {
        type: "tektite-screen-header-segment-list";
        children: ScreenHeaderSegmentEntry[];
    }
    export type ScreenHeaderSegmentEntry = ScreenHeaderLabelSegmentEntry | ScreenHeaderLinkSegmentEntry | ScreenHeaderPopupSegmentEntry;
    export interface ScreenHeaderSegmentCoreEntry extends ListEntry
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
        data:
        {
            className?: string;
        }
        children:
        {
            core: ScreenHeaderSegmentCoreEntry;
        };
    }
    export interface ScreenHeaderLinkSegmentEntry extends ListEntry
    {
        type: "tektite-screen-header-link-segment";
        children:
        {
            core: ScreenHeaderSegmentCoreEntry;
        };
    }
    export interface ScreenHeaderPopupSegmentEntry extends ListEntry
    {
        type: "tektite-screen-header-popup-segment";
        children:
        {
            core: ScreenHeaderSegmentCoreEntry;
        };
    }
    export interface ScreenHeaderOperatorEntry extends Entry
    {
        type: "tektite-screen-header-operator";
        key: "operator";
        children:
        {
        };
    }
    export interface ScreenBodyEntry extends Entry
    {
        type: "tektite-screen-body";
        children:
        {
        };
    }
    export interface ScreenBarEntry extends Entry
    {
        type: "tektite-screen-bar";
        children:
        {
        };
    }
    export interface ScreenToastEntry extends Entry
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
    export const getChildrenKeys = (data: Entry): number[] | string[] =>
        ! data?.children ? []:
            Array.isArray(data.children) ?
                data.children.map((_, ix) => ix):
                Object.keys(data.children);
    export const getChildrenModelKeys = (data: Entry): string[] =>
        ! data?.children ? []:
        Array.isArray(data.children) ?
            data.children.map(i => i.key):
            Object.keys(data.children);
    export const getChildFromModelKey = (data: Entry, key: string): Entry | null =>
        Array.isArray(data?.children) ?
            (data?.children?.filter(i => key === i.key)?.[0] ?? null):
            (data?.children?.[key] ?? null);
    export const getChildrenValues = (data: Entry): Entry[] =>
        ! data?.children ? []:
        Array.isArray(data.children) ?
            data.children:
            minamo.core.objectToArray(data.children, (_k, v, _o) => v);
    export const hasInvalidViewModel = (data: Entry): boolean =>
        "" === (data?.type ?? "") ||
        0 < getChildrenModelKeys(data).filter
            (
                key =>
                    "" === (key ?? "") ||
                    ( ! Array.isArray(data.children) && "" !== ((data.children?.[key] as ListEntry)?.key ?? "")) ||
                    hasInvalidViewModel(getChildFromModelKey(data, key) as Entry)
            ).length;
    export const hasDuplicatedKeys = (data: Entry): boolean =>
        0 < getChildrenModelKeys(data).filter((i, ix, list) => 0 <= list.indexOf(i, ix +1)).length ||
        0 < getChildrenValues(data).filter(i => hasDuplicatedKeys(i)).length;
    export const isValidPath = (path: PathType) =>
        isPathType(path) &&
        ("/root" === path.path || path.path.startsWith("/root/"));
    export const hasError = (path: PathType, data: Entry | null | undefined) =>
    {
        if (undefined === data)
        {
            console.error(`tektite-view-model: undefined data - path:${path}`);
            return true;
        }
        else
        if (null === data)
        {
            console.error(`tektite-view-model: null data - path:${path}`);
            return true;
        }
        else
        if (hasInvalidViewModel(data))
        {
            console.error(`tektite-view-model: Invalid view model - data:${data}`);
            return true;
        }
        else
        if (hasDuplicatedKeys(data))
        {
            console.error(`tektite-view-model: Duplicated keys - data:${JSON.stringify(data)}`);
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
        private data: Entry | null;
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        public onLoad = () =>
        {
        };
        public set(data: Entry): void;
        public set(path: PathType, data: Entry): void;
        public set(pathOrdata: PathType | Entry, data?: Entry): void
        {
            if (isPathType(pathOrdata))
            {
                const path = pathOrdata;
                if (( ! hasError(path, data)) && data)
                {
                    const keys = path.path.split("/").filter(i => 0 < i.length);
                    if ("" !== keys[0])
                    {
                        console.error(`tektite-view-model: Invalid path - path:${path.path}`);
                    }
                    else
                    {
                        keys.shift();
                        let current: Entry | null;
                        if (1 < keys.length)
                        {
                            current = { children: [ this.data ] } as Entry;
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
                const data = pathOrdata;
                if ( ! hasError(makeRootPath(), data))
                {
                    this.data = data;
                }
            }
        }
        public remove = (path: PathType) =>
        {
            if ( ! hasErrorPath(path))
            {
                const keys = path.path.split("/").filter(i => 0 < i.length);
                if ("" !== keys[0])
                {
                    console.error(`tektite-view-model: Invalid path - path:${path.path}`);
                }
                else
                {
                    keys.shift();
                    let current: Entry | null;
                    if (1 < keys.length)
                    {
                        current = { children: [ this.data ] } as Entry;
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
                let current: Entry | null = null;
                const keys = path.path.split("/").filter(i => 0 < i.length);
                if ("" !== keys[0] || ! isValidPath(path))
                {
                    console.error(`tektite-view-model: Invalid path - path:${path.path}`);
                }
                else
                {
                    keys.shift();
                    if (0 < keys.length)
                    {
                        current = { type: "ground", children: { root: this.data } } as Entry;
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
                    else
                    {
                        console.error(`tektite-view-model: Path not found - path:${path.path}`);
                    }
                }
                return current;
            }
        };
    }
    // export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
    //     new ViewModel(tektite);
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewModel(tektite);
}
