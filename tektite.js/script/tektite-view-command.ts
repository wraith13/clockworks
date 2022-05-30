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
    export interface ScrollToCommand extends EntryBase
    {
        type: "scroll-to";
        data:
        {
            path: ViewModel.PathType;
        }
    }
    export interface UpdatePrimaryPageFooterDownPageLinkCommand extends EntryBase
    {
        type: "update-primary-page-footer-down-page-link";
        data:
        {
            path: ViewModel.PathType;
        }
    }
    export type Entry = EntryBase | string;
    export const getType = (entry: Entry) => "string" === typeof entry ? entry: entry.type;
    export type Command<T extends Tektite.ParamTypes, OmegaEntry extends Entry> = (tektite: Tektite.Tektite<T>, data: OmegaEntry) => unknown;
    export class ViewCommand<T extends Tektite.ParamTypes>
    {
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        public call(entry: Entry)
        {
            const executer = this.commands[getType(entry)];
            if (executer)
            {
                executer(this.tektite, entry);
            }
            else
            {
                console.error(`tektite-view-command: Unknown command - entry:${JSON.stringify(entry)}`);
            }
        }
        public callByEvent(path: ViewModel.PathType, event: "onclick")
        {
            const model = this.tektite.viewModel.getUnknownOrNull(path);
            if (model)
            {
                const entry = model.data?.[event];
                if (entry)
                {
                    this.call(entry);
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
            "scroll-to": async (tektite: Tektite.Tektite<T>, entry: ScrollToCommand) =>
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
            "update-primary-page-footer-down-page-link": async (tektite: Tektite.Tektite<T>, entry: UpdatePrimaryPageFooterDownPageLinkCommand) =>
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
        }
    }
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewCommand(tektite);
}
