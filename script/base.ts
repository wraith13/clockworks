import { minamo } from "./minamo.js";
export module Base
{
    export const simpleComparer = minamo.core.comparer.basic;
    export const simpleReverseComparer = <T>(a: T, b: T) => -simpleComparer(a, b);
}
