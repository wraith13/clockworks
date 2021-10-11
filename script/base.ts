import { minamo } from "./minamo.js";
import { Type } from "./type";
export module Base
{
    export const simpleComparer = minamo.core.comparer.basic;
    export const simpleReverseComparer = <T>(a: T, b: T) => -simpleComparer(a, b);
    export const getUrlParams = (url: string = location.href) =>
    {
        const result: { [key: string]: string } = { };
        url
            .replace(/.*\?/, "")
            .replace(/#.*/, "")
            .split("&")
            .map(kvp => kvp.split("="))
            .filter(kvp => 2 <= kvp.length)
            .forEach(kvp => result[kvp[0]] = decodeURIComponent(kvp[1]));
        return result;
    };
    export const getUrlHash = (url: string = location.href) => decodeURIComponent(url.replace(/[^#]*#?/, ""));
    export const regulateUrl = (url: string) => url.replace(/\?#/, "#").replace(/#$/, "").replace(/\?$/, "");
    export const makeUrlRaw =
    (
        args: {[key: string]: string} | Type.PageParams,
        href: string = location.href
    ) => regulateUrl
    (
        href
            .replace(/\?.*/, "")
            .replace(/#.*/, "")
            +"?"
            +Object.keys(args)
                .filter(i => undefined !== i)
                .filter(i => "hash" !== i)
                .map(i => `${i}=${encodeURIComponent(args[i])}`)
                .join("&")
            +`#${args["hash"] ?? ""}`
    );
}
