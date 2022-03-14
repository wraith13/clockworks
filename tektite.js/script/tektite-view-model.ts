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
    export interface Entry
    {
        type: string;
        key: string;
        data: unknown;
        children: Entry[];
    }
    export interface RootEntry extends Entry
    {
        type: "tektite-root-view-model";
        key: "root";
        data:
        {
            title?: string;
            windowColor?: string;
        };
        children: Entry[];
    }
    export const hasInvalidViewModel = (data: Entry) =>
        "" === (data?.key ?? "") ||
        "" === (data?.type ?? "") ||
        0 < (data?.children ?? []).filter(i => hasInvalidViewModel(i)).length;
    export const hasDuplicatedKeys = (data: Entry) =>
        0 < (data?.children ?? []).map(i => i.key).filter((i, ix, list) => 0 <= list.indexOf(i, ix +1)).length ||
        0 < (data?.children ?? []).filter(i => hasDuplicatedKeys(i)).length;
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
        else
        if ("/root" === path.path && "root" !== data.key)
        {
            console.error(`tektite-view-model: root mode key must be "root" - data.key:${JSON.stringify(data.key)}`);
            return true;
        }
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
                        if (data?.key !== keys[keys.length -1])
                        {
                            console.error(`tektite-view-model: Unmatch path and key - path:${path.path}, data:${JSON.stringify(data)}`);
                        }
                        let current: Entry;
                        if (1 < keys.length)
                        {
                            current = { children: [ this.data ] } as Entry;
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
                        current = { children: [ this.data ] } as Entry;
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
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new ViewModel(tektite);
}
