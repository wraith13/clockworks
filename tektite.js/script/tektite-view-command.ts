import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { ViewModel } from "./tektite-view-model.js";
import { ViewRenderer } from "./tektite-view-renderer.js";

export module ViewCommand
{
    export interface EntryBase
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
    export type Entry = EntryBase | string;
    export const getType = (entry: Entry) => "string" === typeof entry ? entry: entry.type;
    export type Command<T extends Tektite.ParamTypes, OmegaEntry extends Entry> = (tektite: Tektite.Tektite<T>, data: OmegaEntry) => unknown;
    export class ViewCommand<T extends Tektite.ParamTypes>
    {
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        public execute(entry: Entry)
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
        public readonly commands: { [type: string ]: Command<T, any> } =
        {
            "scroll-to": async (tektite: Tektite.Tektite<T>, entry: ScrollToCommand) =>
            {
                if ("string" === typeof entry)
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
        }
    }
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewCommand(tektite);
}
