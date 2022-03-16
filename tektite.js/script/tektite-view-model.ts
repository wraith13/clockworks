import { Tektite } from "./tektite-index";
export module ViewModel
{
    export type PathType = { type: "path", path: string, };
    export const isPathType = (data: unknown): data is PathType =>
        "path" === data?.["type"] &&
        "string" === typeof data?.["path"];
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
        children:
        {
        };
    }
    export const getChildrenKeys = (data: Entry): number[] | string[] =>
        ! data?.children ? []:
            Array.isArray(data.children) ?
                data.children.map((_, ix) => ix):
                Object.keys(data.children);
    export const getChildrenModelKeys = (data: Entry): string[] =>
        getChildrenKeys(data).map(key => "string" === typeof key ? key: data.children[key].key);
    export const getChildFromModelKey = (data: Entry, key: string): Entry =>
        Array.isArray(data?.children) ?
            data?.children?.filter(i => key === i.key)?.[0]:
            data?.children?.[key];
    export const getChildrenValues = (data: Entry): Entry[] =>
        getChildrenKeys(data).map(key => data.children[key]);
    export const hasInvalidViewModel = (data: Entry) =>
        "" === (data?.type ?? "") ||
        0 < getChildrenModelKeys(data).filter
            (
                key =>
                    "" === (key ?? "") ||
                    ( ! Array.isArray(data.children) && "" !== ((data.children[key] as ListEntry).key ?? "")) ||
                    hasInvalidViewModel(getChildFromModelKey(data, key))
            ).length;
    export const hasDuplicatedKeys = (data: Entry) =>
        0 < getChildrenModelKeys(data).filter((i, ix, list) => 0 <= list.indexOf(i, ix +1)).length ||
        0 < getChildrenValues(data).filter(i => hasDuplicatedKeys(i)).length;
    export const isValidPath = (path: PathType) =>
        isPathType(path) &&
        ("/root" === path.path || path.path.startsWith("/root/"));
    export const hasError = (path: PathType, data: Entry) =>
    {
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
        if ( ! isValidPath(path))
        {
            console.error(`tektite-view-model: Invalid path - path:${path.path}`);
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
    export class ViewModel<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        private data: Entry;
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        public onLoad = () =>
        {
        };
        public set(data: Entry);
        public set(path: PathType, data: Entry);
        public set(pathOrdata: PathType | Entry, data?: Entry)
        {
            if (isPathType(pathOrdata))
            {
                const path = pathOrdata;
                if ( ! hasError(path, data))
                {
                    const keys = path.path.split("/").filter(i => 0 < i.length);
                    if ("" !== keys[0])
                    {
                        console.error(`tektite-view-model: Invalid path - path:${path.path}`);
                    }
                    else
                    {
                        keys.shift();
                        let current: Entry;
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
                            console.error(`tektite-view-model: Path not found - path:${pathOrdata}`);
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
        public get = (path: PathType = null) =>
        {
            if ( ! path)
            {
                return this.data;
            }
            else
            {
                let current: Entry;
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
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new ViewModel(tektite);
}
