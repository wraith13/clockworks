import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";

export module ViewCommand
{
    export interface EntryBase
    {
        type: string;
        data?: unknown;
    }
    export type Entry = EntryBase | string;
    export type Command<OmegaEntry extends Entry> = (data: OmegaEntry) => unknown;
    export class ViewCommand<T extends Tektite.ParamTypes>
    {
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        public readonly renderer: { [type: string ]: Command<any> } = { }
    }
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewCommand(tektite);
}
