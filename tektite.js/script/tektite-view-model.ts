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
    export interface ViewModelBase
    {
        type: string;
        key: string;
        data: unknown;
        children: ViewModelBase[];
    }
    export interface RootViewModel extends ViewModelBase
    {
        type: "tektite-root-view-model";
        key: "root";
        data: unknown;
        children: ViewModelBase[];
    }
    export const hasInvalidViewModel = (data: ViewModelBase) =>
        "" === (data?.key ?? "") ||
        "" === (data?.type ?? "") ||
        0 < (data?.children ?? []).filter(i => hasInvalidViewModel(i)).length;
    export const hasDuplicatedKeys = (data: ViewModelBase) =>
        0 < (data?.children ?? []).map(i => i.key).filter((i, ix, list) => 0 <= list.indexOf(i, ix +1)).length ||
        0 < (data?.children ?? []).filter(i => hasDuplicatedKeys(i)).length;
    export class ViewModel<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        private data: ViewModelBase;
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        public onLoad = () =>
        {
        };
        public set(data: ViewModelBase);
        public set(path: PathType, data: ViewModelBase);
        public set(pathOrdata: PathType | ViewModelBase, data?: ViewModelBase)
        {
            if (isPathType(pathOrdata))
            {
                const path = pathOrdata;
                if (hasInvalidViewModel(data))
                {
                    console.error(`tektite-view-model: Invalid view model - data:${data}`);
                }
                else
                if (hasDuplicatedKeys(data))
                {
                    console.error(`tektite-view-model: Duplicated keys - data:${JSON.stringify(data)}`);
                }
                else
                if ("/root" !== path.path && path.path.startsWith("/root/"))
                {
                    console.error(`tektite-view-model: Invalid path - path:${path.path}`);
                }
                else
                if ("/root" === path.path && "root" !== data.key)
                {
                    console.error(`tektite-view-model: root mode key must be "root" - data.key:${JSON.stringify(data.key)}`);
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
                        let current: ViewModelBase;
                        if (1 < keys.length)
                        {
                            current = { children: [ this.data ] } as ViewModelBase;
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
                if (hasInvalidViewModel(data))
                {
                    console.error(`tektite-view-model: Invalid view model - data:${data}`);
                }
                else
                if (hasDuplicatedKeys(data))
                {
                    console.error(`tektite-view-model: Duplicated keys - data:${data}`);
                }
                else
                if ("root" !== data.key)
                {
                    console.error(`tektite-view-model: root mode key must be "root" - data.key:${JSON.stringify(data.key)}`);
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
                let current: ViewModelBase;
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
                        current = { children: [ this.data ] } as ViewModelBase;
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
