import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index.js";
export module Locale
{
    // export class Locale<LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    export class Locale<T extends Tektite.ParamTypes>
    {
        constructor(private master: T["LocaleMapType"]) { }
        public locales = minamo.core.objectKeys(this.master);// as (string & keyof T["LocaleMapType"])[];
        private masterKey: keyof T["LocaleMapType"] & string =
            0 <= this.locales.indexOf(navigator.language as (string & keyof T["LocaleMapType"])) ?
                navigator.language as (string & keyof T["LocaleMapType"]):
                this.locales[0] as (string & keyof T["LocaleMapType"]);
        public getLocaleName = (locale: string & keyof T["LocaleMapType"]) => this.master[locale].$name ?? locale;
        public setLocale = (locale: (string & keyof T["LocaleMapType"]) | null) =>
        {
            const key = (locale ?? navigator.language) as (string & keyof T["LocaleMapType"]);
            if (0 <= this.locales.indexOf(key))
            {
                this.masterKey = key;
            }
        };
        public get = () => this.masterKey;
        public getPrimary = (key : keyof T["LocaleEntryType"]) => this.master[this.masterKey][key];
        public getSecondary = (key : keyof T["LocaleEntryType"]) => this.master[this.locales.filter(locale => this.masterKey !== locale)[0]][key];
        public string = (key : string) : string => this.getPrimary(key as keyof T["LocaleEntryType"]) ?? key;
        public map = (key : keyof T["LocaleEntryType"] & string) : string => this.string(key);
        public immutable = (key : string) : string => key;
        public parallel = (key : keyof T["LocaleEntryType"]) : string => `${this.getPrimary(key)} / ${this.getSecondary(key)}`;
    
    }
    // export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    //     (tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
    //     new Locale(tektite.params.localeMaster);
    export const make = <T extends Tektite.ParamTypes>
        (tektite: Tektite.Tektite<T>) =>
        new Locale(tektite.params.localeMaster);
}
