import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { ViewModel } from "./tektite-view-model.js";
import { ViewRenderer } from "./tektite-view-renderer.js";

export module ViewCommand
{
    export interface EntryBase extends minamo.core.JsonableObject
    {
        type: string;
        data?: minamo.core.JsonableObject;
    }
    export interface SetDataCommand extends EntryBase
    {
        type: "tektite-set-data";
        data:
        {
            path: ViewModel.PathType;
            key: string;
            value: minamo.core.Jsonable;
            oldValue?: minamo.core.Jsonable;
        }
    }
    export interface ScrollToCommand extends EntryBase
    {
        type: "tektite-scroll-to";
        data:
        {
            path: ViewModel.PathType;
        }
    }
    export interface UpdatePrimaryPageFooterDownPageLinkCommand extends EntryBase
    {
        type: "tektite-update-primary-page-footer-down-page-link";
        data:
        {
            path: ViewModel.PathType;
        }
    }
    export interface UpdateToastItemCommand extends EntryBase
    {
        type: "tektite-update-toast-item";
        data:
        {
            path: ViewModel.PathType;
            next: ViewModel.ToastStateType | null,
        }
    }
    export type Entry = EntryBase | string;
    export type EntryOrList = Entry | Entry[];
    export const getType = (entry: Entry) => "string" === typeof entry ? entry: entry.type;
    export type Command<T extends Tektite.ParamTypes, OmegaEntry extends Entry> = (tektite: Tektite.Tektite<T>, data: OmegaEntry) => Promise<unknown>;
    export class ViewCommand<T extends Tektite.ParamTypes>
    {
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        public async call<OmegaEntry extends Entry>(entry: OmegaEntry)
        {
            const executer = this.commands[getType(entry)];
            if (executer)
            {
                // console.log(`tektite-view-command.call: ${JSON.stringify(entry)}`);
                await executer(this.tektite, entry);
            }
            else
            {
                console.error(`tektite-view-command: Unknown command - entry:${JSON.stringify(entry)}`);
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
                            .map(entry => this.call(entry))
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
            "tektite-set-data": async (tektite: Tektite.Tektite<T>, entry: SetDataCommand) =>
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
            },
            "tektite-scroll-to": async (tektite: Tektite.Tektite<T>, entry: ScrollToCommand) =>
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
            },
            "tektite-update-primary-page-footer-down-page-link": async (tektite: Tektite.Tektite<T>, entry: UpdatePrimaryPageFooterDownPageLinkCommand) =>
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
            },
            "tektite-update-toast-item": async (tektite: Tektite.Tektite<T>, entry: UpdateToastItemCommand) =>
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
            },
        }
    }
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewCommand(tektite);
}
