import { Tektite } from "./tektite-index.js";
export module Locale
{
    export class Locale<LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    {
        constructor(private master: LocaleMapType) { }
        public locales = Object.keys(this.master) as (keyof LocaleMapType)[];
        private masterKey: keyof LocaleMapType = 0 <= this.locales.indexOf(navigator.language as keyof LocaleMapType) ?
            navigator.language as keyof LocaleMapType:
            this.locales[0];
        public getLocaleName = (locale: keyof LocaleMapType & string) => this.master[locale].$name ?? locale;
        public setLocale = (locale: keyof LocaleMapType | null) =>
        {
            const key = locale ?? navigator.language as keyof LocaleMapType;
            if (0 <= this.locales.indexOf(key))
            {
                this.masterKey = key;
            }
        };
        public get = () => this.masterKey;
        public getPrimary = (key : keyof LocaleEntryType) => this.master[this.masterKey][key];
        public getSecondary = (key : keyof LocaleEntryType) => this.master[this.locales.filter(locale => this.masterKey !== locale)[0]][key];
        public string = (key : string) : string => this.getPrimary(key as keyof LocaleEntryType) ?? key;
        public map = (key : keyof LocaleEntryType & string) : string => this.string(key);
        public parallel = (key : keyof LocaleEntryType) : string => `${this.getPrimary(key)} / ${this.getSecondary(key)}`;
    
    }
    export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
        (tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
        new Locale(tektite.params.localeMaster);
}
