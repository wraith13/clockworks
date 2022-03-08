import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
export module ViewModel
{
    const $make = minamo.dom.make;
    export interface DomCache<ViewModelTypeName>
    {
        dom: Element;
        lastAccess: number;
        type: ViewModelTypeName;
        data: string;
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
        public renderDom = (now: number = new Date().getTime()) =>
        {
            let result = this.domCache["/"]?.dom;
            const json = JSON.stringify(this.data);
            if (this.previousData !== json && ! result)
            {
                const oldCache: { [key: string]:DomCache<unknown> } = { };
                Object.keys(this.domCache).forEach
                (
                    key =>
                    {
                        const cache = this.domCache[key];
                        oldCache[key] =
                        {
                            dom: cache.dom,
                            lastAccess: cache.lastAccess,
                            type: cache.type,
                            data: cache.data,
                        };
                    }
                );
                result = this.renderOrCache(now, "/", JSON.parse(json));
                Object.keys(oldCache)
                    .filter(key => oldCache[key].dom !== this.domCache[key]?.dom)
                    .map(key => oldCache[key].dom)
                    .forEach(dom => dom.parentElement.removeChild(dom));
                this.previousData = json;
            }
            return result;
        };
        private domCache: { [key: string]:DomCache<unknown> } = { };
        public getCache = (now: number, key: string) =>
        {
            const result = this.domCache[key];
            if (result)
            {
                result.lastAccess = now;
            }
            return result;
        };
        public getChildren = (key: string) => Object.keys(this.domCache)
            .filter(i => i.startsWith(key) && 2 === i.substring(i.length).split["/"].length)
            .map(i => this.domCache[i]);
        public setCache = (now: number, key: string, dom: Element, type: ViewModelTypeName, data: string) =>
            this.domCache[key] =
            {
                dom,
                lastAccess: now,
                type,
                data,
            };
        public renderOrCache = (now: number, key: string, data: Tektite.ViewModelBase<unknown>): Element =>
        {
            let result: Element;
            const cache = this.getCache(now, key);
            const json = JSON.stringify(data.data);
            if (cache?.data !== json)
            {
                if ( ! cache)
                {
                    newRender();
                }
                updateRender();
                result = this.setCache(now, key, dom, data.type, json).dom;
            }
            else
            {
                result = cache.dom;
            }
            return result;
        };
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new ViewModel(tektite);
}
