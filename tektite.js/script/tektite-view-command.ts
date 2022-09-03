import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { ViewModel } from "./tektite-view-model.js";
import { ViewRenderer } from "./tektite-view-renderer.js";
import { Fullscreen } from "./tektite-fullscreen";

export module ViewCommand
{
    export interface EntryBase
    {
        params:
        {
            type: string;
            data?: minamo.core.JsonableObject;
            withLog?: true;
        } & minamo.core.JsonableObject;
        result: void | minamo.core.JsonableObject;
    }
    export interface SetDataCommand extends EntryBase
    {
        params:
        {
            type: "tektite-set-data";
            data:
            {
                path: ViewModel.PathType;
                key: string;
                value: minamo.core.Jsonable;
                oldValue?: minamo.core.Jsonable;
            }
        };
        result: void;
    }
    export interface StaticUpdateChildrenCommand<Model extends ViewModel.EntryBase> extends EntryBase
    {
        params:
        {
            type: "tektite-update-children";
            data:
            {
                path: ViewModel.PathType;
                children: Model["children"];
            }
        };
        result: void;
    }
    export interface DynamicUpdateChildrenCommand<Model extends ViewModel.EntryBase> extends EntryBase
    {
        params:
        {
            type: "tektite-update-children";
            data:
            {
                path: ViewModel.PathType;
                updator: ViewModel.ChildrenUpdatorType<Model>;
            }
        };
        result: void;
    }
    export type UpdateChildrenCommand<Model extends ViewModel.EntryBase> = StaticUpdateChildrenCommand<Model> | DynamicUpdateChildrenCommand<Model>
    export interface OnMenuButtonClickCommand extends EntryBase
    {
        params:
        {
            type: "tektite-on-menu-button-click";
            data:
            {
                path: ViewModel.PathType;
            }
        };
        result: void;
    }
    export interface ScrollToCommand extends EntryBase
    {
        params:
        {
            type: "tektite-scroll-to";
            data:
            {
                path: ViewModel.PathType;
            }
        }
        result: void;
    }
    export interface UpdatePrimaryPageFooterDownPageLinkCommand extends EntryBase
    {
        params:
        {
            type: "tektite-update-primary-page-footer-down-page-link";
            data:
            {
                path: ViewModel.PathType;
            }
        }
        result: void;
    }
    export interface UpdateToastItemCommand extends EntryBase
    {
        params:
        {
            type: "tektite-update-toast-item";
            data:
            {
                path: ViewModel.PathType;
                next: ViewModel.ToastStateType | null,
            }
        }
        result: void;
    }
    export interface ToggleFullscreenCommand extends EntryBase
    {
        params:
        {
            type: "tektite-toggle-fullscreen";
            data?:
            {
                path: ViewModel.PathType | null;
            }
        }
        result: void;
    }
    export type Entry<OmegaEntryBase extends EntryBase> =
        undefined extends OmegaEntryBase["params"]["data"] ?
            OmegaEntryBase["params"] | OmegaEntryBase["params"]["type"]:
            OmegaEntryBase["params"];
    export type Result<OmegaEntryBase extends EntryBase> = OmegaEntryBase["result"];
    export type EntryOrList = Entry<any> | Entry<any>[];
    export const getType = <OmegaEntryBase extends EntryBase>(entry: Entry<OmegaEntryBase>) => "string" === typeof entry ? entry: entry.type;
    export interface Context
    {
        path?: ViewModel.PathType;
    }
    export type Command<T extends Tektite.ParamTypes, OmegaEntryBase extends EntryBase> = (tektite: Tektite.Tektite<T>, context: Context, data: Entry<OmegaEntryBase>) => Promise<Result<OmegaEntryBase>>;
    export class ViewCommand<T extends Tektite.ParamTypes>
    {
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        public async call<OmegaEntryBase extends EntryBase>(context: Context, entry: Entry<OmegaEntryBase>, withLog?: boolean): Promise<Result<OmegaEntryBase>>
        {
            const executer: Command<T, OmegaEntryBase> = this.commands[getType(entry)];
            if (executer)
            {
                if (withLog || ("string" !== typeof entry && entry.withLog))
                {
                    console.log(`tektite-view-command.call: ${JSON.stringify(entry)}`);
                }
                return await executer(this.tektite, context, entry);
            }
            else
            {
                throw new Error(`tektite-view-command: Unknown command - entry:${JSON.stringify(entry)}`);
            }
        }
        public async callByEvent(path: ViewModel.PathType, event: ViewModel.EventType)
        {
            const model = this.tektite.viewModel.getUnknownOrNull(path);
            if (model)
            {
                const entryOrList = model.data?.[event];
                if (entryOrList)
                {
                    await Promise.all
                    (
                        minamo.core.arrayOrToArray(entryOrList)
                            .map(entry => this.call({ path, }, entry))
                    );
                    await this.tektite.viewRenderer.renderRoot();
                }
                else
                {
                    console.error(`tektite-view-command: Event not found - path:${path.path}, event:${event}`);
                }
            }
            else
            {
                console.error(`tektite-view-command: Path not found - path:${path.path}, event:${event}`);
            }
        }
        public readonly commands: { [type: string ]: Command<T, any> } =
        {
            "tektite-set-data": <Command<T, SetDataCommand>>
            (
                async (tektite, _context, entry) =>
                {
                    if ("string" === typeof entry || ! entry.data)
                    {
                        console.error(`tektite-view-command: This command require data - entry:${JSON.stringify(entry)}`);
                    }
                    else
                    {
                        const path = entry.data.path;
                        const model = tektite.viewModel.getUnknown(path);
                        if (model)
                        {
                            if (undefined === entry.data.oldValue || JSON.stringify(entry.data.oldValue) === JSON.stringify(model?.data?.[entry.data.key]))
                            {
                                if ( ! model.data)
                                {
                                    model.data = { };
                                }
                                model.data[entry.data.key] = entry.data.value;
                                tektite.viewModel.set(path, model);
                            }
                        }
                    }
                }
            ),
            "tektite-update-children": <Command<T, UpdateChildrenCommand<any>>>
            (
                async (tektite, context, entry) =>
                {
                    if ("string" === typeof entry || ! entry.data)
                    {
                        console.error(`tektite-view-command: This command require data - entry:${JSON.stringify(entry)}`);
                    }
                    else
                    {
                        const path = context.path ?
                            ViewModel.solvePath(context.path, entry.data.path):
                            entry.data.path;
                        const model = tektite.viewModel.getUnknown(path);
                        if (model)
                        {
                            if ("children" in entry.data)
                            {
                                model.children = entry.data.children;
                            }
                            if ("updator" in entry.data)
                            {
                                type CommandType = ViewCommand.EntryBase & { result: (typeof model)["children"] };
                                model.children = await tektite.viewCommand.call<CommandType>({ path, }, entry.data.updator);
                            }
                            tektite.viewModel.set(path, model);
                        }
                    }
                }
            ),
            "tektite-on-menu-button-click": <Command<T, OnMenuButtonClickCommand>>
            (
                async (tektite, context, entry) =>
                {
                    if ("string" === typeof entry || ! entry.data)
                    {
                        console.error(`tektite-view-command: This command require data - entry:${JSON.stringify(entry)}`);
                    }
                    else
                    {
                        const path = context.path ?
                            ViewModel.solvePath(context.path, entry.data.path):
                            entry.data.path;
                        const model = tektite.viewModel.get<ViewModel.MenuButtonEntry<T>>(path, "tektite-menu-button");
                        if (model)
                        {
                            const getMenu = model.data?.getMenu;
                            if (getMenu)
                            {
                                model.children = (await tektite.viewCommand.call({ path, }, getMenu)) as any;
                            }
                            if ( ! model.data)
                            {
                                model.data = { state: "fade-in" };
                            }
                            else
                            {
                                model.data.state = "fade-in";
                            }
                            tektite.viewModel.set(path, model);
                        }
                    }
                }
            ),
            "tektite-scroll-to": <Command<T, ScrollToCommand>>
            (
                async (tektite, _context, entry) =>
                {
                    if ("string" === typeof entry || ! entry.data)
                    {
                        console.error(`tektite-view-command: This command require data - entry:${JSON.stringify(entry)}`);
                    }
                    else
                    {
                        const dom = tektite.viewRenderer.getCache(entry.data.path)?.dom;
                        if (dom)
                        {
                            await tektite.screen.scrollToElement(ViewRenderer.getPrimaryElement(dom) as HTMLElement);
                        }
                    }
                }
            ),
            "tektite-update-primary-page-footer-down-page-link": <Command<T, UpdatePrimaryPageFooterDownPageLinkCommand>>
            (
                async (tektite, _context, entry) =>
                {
                    if ("string" === typeof entry || ! entry.data)
                    {
                        console.error(`tektite-view-command: This command require data - entry:${JSON.stringify(entry)}`);
                    }
                    else
                    {
                        const path = entry.data.path;
                        const model = tektite.viewModel.get<ViewModel.PrimaryPageFooterDownPageLinkEntry>(path, "tektite-primary-page-footer-down-page-link");
                        if (model)
                        {
                            const dom = tektite.viewRenderer.getCache({ type: "path", path: "/root/screen/screen-body", })?.dom;
                            if (dom)
                            {
                                const body = ViewRenderer.getPrimaryElement(dom) as HTMLDivElement;
                                const isStrictShowPrimaryPage = 0 === body.scrollTop;
                                (model.data ?? (model.data = { } as ViewModel.PrimaryPageFooterDownPageLinkEntry["data"] & { }))
                                    .isStrictShowPrimaryPage = isStrictShowPrimaryPage;
                                model.data.onclick.data.path.path = isStrictShowPrimaryPage ?
                                    "/root/screen/screen-body/trail":
                                    "/root/screen/screen-body/primary",
                                tektite.viewModel.set(path, model);
                            }
                        }
                    }
                }
            ),
            "tektite-update-toast-item": <Command<T, UpdateToastItemCommand>>
            (
                async (tektite, _context, entry) =>
                {
                    if ("string" === typeof entry || ! entry.data)
                    {
                        console.error(`tektite-view-command: This command require data - entry:${JSON.stringify(entry)}`);
                    }
                    else
                    {
                        const path = entry.data.path;
                        const model = tektite.viewModel.get<ViewModel.ToastItemEntry>(path, "tektite-toast-item");
                        if (model)
                        {
                            if (null === entry.data.next)
                            {
                                tektite.viewModel.remove(path);
                            }
                            else
                            {
                                model.data.state = entry.data.next;
                                tektite.viewModel.set(path, model);
                            }
                            await tektite.viewRenderer.renderRoot();
                        }
                    }
                }
            ),
            "tektite-toggle-fullscreen": <Command<T, ToggleFullscreenCommand>>
            (
                async (tektite, _context, entry) =>
                {
                    if ("string" === typeof entry || ! entry.data)
                    {
                        Fullscreen.toggle();
                    }
                    else
                    {
                        const path = entry.data.path;
                        if (null === path)
                        {
                            Fullscreen.exit();
                        }
                        else
                        {
                            const cache = tektite.viewRenderer.getCache(path);
                            if (cache && cache.dom)
                            {
                                const element = ViewRenderer.getPrimaryElement(cache.dom)
                                if (element)
                                {
                                    Fullscreen.toggle(element);
                                }
                            }
                        }
                    }
                }
            ),
        }
    }
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewCommand(tektite);
}
