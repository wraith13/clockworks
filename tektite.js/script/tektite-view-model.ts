import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
export module ViewModel
{
    const $make = minamo.dom.make;
    export interface DomCache<ViewModelTypeName>
    {
        dom: Node;
        lastAccess: number;
        type: ViewModelTypeName;
        data: unknown;
    }
    export class ViewModel<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        private previousData: string;
        private data: Tektite.ViewModelBase<unknown>;
        constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        {
        }
        update: (event: Tektite.UpdateScreenEventEype) => unknown;
        public onLoad = () =>
        {
        };
        public set = (data: Tektite.ViewModelBase<unknown>) =>
        {
            this.data = data;
        };
        public get = () => this.data;
        public renderDom = () =>
        {
            let result = this.domCache["/"]?.dom;
            const json = JSON.stringify(this.data);
            if (this.previousData !== json && ! result)
            {
                const result = this.renderOrCache("/", JSON.parse(json));
                this.previousData = json;
            }
            return result;
        };
        private domCache: { [key: string]:DomCache<unknown> } = { };
        public renderOrCache = (key: string, data: Tektite.ViewModelBase<unknown>) =>
        {

        };
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new ViewModel(tektite);
}
