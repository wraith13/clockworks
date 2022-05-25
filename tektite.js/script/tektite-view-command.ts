import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { ViewModel } from "./tektite-view-model.js";

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
    export type Command<OmegaEntry extends Entry> = (data: OmegaEntry) => unknown;
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
                executer(entry);
            }
            else
            {
                console.error(`tektite-view-model: Unknown command - data:${JSON.stringify(entry)}`);
            }
        }
        public readonly commands: { [type: string ]: Command<any> } = { }
    }
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewCommand(tektite);
}
